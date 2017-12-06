
import {
  NgModule, Component, ViewChild, ElementRef, AfterViewInit,
  AfterContentInit, AfterViewChecked, Input, Output, EventEmitter,
  ContentChildren, QueryList, TemplateRef, Renderer, forwardRef, ChangeDetectorRef, Renderer2, setTestabilityGetter
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';
import {DomHandler} from "../dom/domhandler";
import {ObjectUtils} from "../utils/objectutils";
import {SharedModule, PrimeTemplate} from '../common/shared';
import {InputTextModule} from '../../components/inputtext/inputtext';
import {ButtonModule} from '../../components/button/button';

export const AUTOCOMPLETE_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AutoComplete),
    multi: true
};

@Component({
    selector: 'u-autoComplete',
    template:
    `
      <span [ngClass]="{'ui-autocomplete ui-widget':true,'ui-autocomplete-dd':dropdown,'ui-autocomplete-multiple':multiple}"
            [ngStyle]="style" [class]="styleClass">
            <input *ngIf="!multiple" #in [attr.type]="type" [attr.id]="inputId" [ngStyle]="inputStyle"
                   [class]="inputStyleClass" autocomplete="off"
                   [ngClass]="'ui-inputtext ui-widget ui-state-default ui-corner-all'" (click)="onInputClick($event)"
                   [value]="getValue"
                   (input)="onInput($event)" (keydown)="onKeydown($event)" (focus)="onInputFocus($event)"
                   (blur)="onInputBlur($event)"
                   [attr.placeholder]="placeholder" [attr.size]="size" [attr.maxlength]="maxlength"
                   [attr.tabindex]="tabindex" [readonly]="readonly" [disabled]="disabled"
                   [ngClass]="{'ui-autocomplete-input':true,'ui-autocomplete-dd-input':dropdown}"
            >
        <ul *ngIf="multiple" #multiContainer
                 class="ui-autocomplete-multiple-container ui-widget ui-inputtext ui-state-default ui-corner-all"
                 [ngClass]="{'ui-state-disabled':disabled,'ui-state-focus':focus}" (click)="multiIn.focus()">
                <li #token *ngFor="let val of value" class="ui-autocomplete-token ui-state-highlight ui-corner-all">
                    <span class="ui-autocomplete-token-icon fa fa-fw fa-close" (click)="removeItem(token)"
                          *ngIf="!disabled"></span>
                    <span *ngIf="!selectedItemTemplate"
                          class="ui-autocomplete-token-label">{{field ? val[field] : val}}</span>
                    <ng-template *ngIf="selectedItemTemplate" [pTemplateWrapper]="selectedItemTemplate"
                                 [item]="val"></ng-template>
                </li>
                <li class="ui-autocomplete-input-token">
                    <input #multiIn [attr.type]="type" [attr.id]="inputId" [disabled]="disabled"
                           [attr.placeholder]="placeholder" [attr.tabindex]="tabindex" (input)="onInput($event)"
                           (click)="onInputClick($event)"
                           (keydown)="onKeydown($event)" (focus)="onInputFocus($event)" (blur)="onInputBlur($event)"
                           autocomplete="off">
                </li>
            </ul>
        <button type="button" pButton icon="fa-fw fa-caret-down" class="ui-autocomplete-dropdown"
                     [disabled]="disabled"
                     (click)="handleDropdownClick($event)" *ngIf="dropdown"></button>
        
            <div #panel class="ui-autocomplete-panel ui-widget-content ui-corner-all ui-shadow"
                 [style.display]="panelVisible ? 'block' : 'none'" [style.width]="appendTo ? 'auto' : '100%'"
                 [style.max-height]="scrollHeight">
                <ul
                  class="ui-autocomplete-items ui-autocomplete-list ui-widget-content ui-widget ui-corner-all ui-helper-reset"
                  *ngIf="panelVisible">
                    <li *ngFor="let option of suggestions; let idx = index"
                        [ngClass]="{'ui-autocomplete-list-item ui-corner-all':true,'ui-state-highlight':(highlightOption==option)}"
                        (mouseenter)="highlightOption=option" (mouseleave)="highlightOption=null"
                        (click)="selectItem(option)">
                        <span *ngIf="!itemTemplate">{{field ? option[field] : option}}</span>
                        <ng-template *ngIf="itemTemplate" [pTemplateWrapper]="itemTemplate" [item]="option"
                                     [index]="idx"></ng-template>
                    </li>
                    <li *ngIf="noResults && emptyMessage" class="ui-autocomplete-list-item ui-corner-all">{{emptyMessage}}</li>
                </ul>
            </div>
        </span>
    `,
    host: {
        '[class.ui-inputwrapper-filled]': 'filled',
        '[class.ui-inputwrapper-focus]': 'focus'
    },
    providers: [DomHandler, ObjectUtils, AUTOCOMPLETE_VALUE_ACCESSOR]
})
export class AutoComplete implements AfterViewInit, AfterViewChecked, ControlValueAccessor {

    @Input() minLength: number = 1;

    @Input() delay  = 300;

    @Input() style: any;

    @Input() id = 'value';

    initialed = false;

    @Input() styleClass: string;

    @Input() inputStyle: any;

    @Input() inputId: string;

    @Input() inputStyleClass: string;

    @Input() placeholder: string;

    @Input() readonly: boolean;

    @Input() disabled: boolean;

    @Input() maxlength: number;

    @Input() size: number;

    @Input()
    shouldReset: boolean = false;


    @Input() appendTo: any;

    @Input() autoHighlight: boolean;

    @Input() type: string = 'text';

    @Output() completeMethod: EventEmitter<any> = new EventEmitter();

    @Output() onSelect: EventEmitter<any> = new EventEmitter();

    @Output() onUnselect: EventEmitter<any> = new EventEmitter();

    @Output() onFocus: EventEmitter<any> = new EventEmitter();

    @Output() onBlur: EventEmitter<any> = new EventEmitter();

    @Output() onClear: EventEmitter<any> = new EventEmitter();

    @Output() onDropdownClick: EventEmitter<any> = new EventEmitter();

    @Input() field: string;

    @Input() scrollHeight: string = '12.5em';

    @Input() dropdown: boolean;

    @Input() multiple: boolean;

    @Input() tabindex: number;

    @Input() dataKey: string;

    @Input() emptyMessage: string;

    @ViewChild('in') inputEL: ElementRef;

    @ViewChild('multiIn') multiInputEL: ElementRef;

    @ViewChild('panel') panelEL: ElementRef;

    @ViewChild('multiContainer') multiContainerEL: ElementRef;

    @ContentChildren(PrimeTemplate) templates: QueryList<any>;

    public itemTemplate: TemplateRef<any>;

    public selectedItemTemplate: TemplateRef<any>;

    inputOption: any;

    value: any;

    _suggestions: any[];

    onModelChange: Function = () => {};

    onModelTouched: Function = () => {};

    timeout: any;

    differ: any;

    panelVisible  = false;

    documentClickListener: any;

    suggestionsUpdated: boolean;

    highlightOption: any;

    highlightOptionChanged: boolean;

    focus: boolean = false;

    filled: boolean;

    inputClick: boolean;

    noResults: boolean;

    @Input()
    setFistAsValue = false

    get getValue() {
      const a = this.value ? (this.field ? this.objectUtils.resolveFieldData(this.value, this.field) || this.value : this.value) : null
/*      if(this.field === 'lineName')  {
      }*/
      return a;
    }

    constructor(public el: ElementRef, public domHandler: DomHandler,public renderer2: Renderer2, public renderer: Renderer, public objectUtils: ObjectUtils, public cd: ChangeDetectorRef) {}

    @Input() get suggestions(): any[] {
        return this._suggestions;

    }

    set suggestions(val:any[]) {
        this._suggestions = val;

        if(this.panelEL && this.panelEL.nativeElement) {
            if(this._suggestions && this._suggestions.length) {
                this.noResults = false;
                this.show();
                this.suggestionsUpdated = true;

                if(this.autoHighlight) {
                    this.highlightOption = this._suggestions[0];
                }
            }
            else {
                this.noResults = true;

                if(this.emptyMessage) {
                    this.show();
                    this.suggestionsUpdated = true;
                }
                else {
                    this.hide();
                }
            }
        }

    }

    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch(item.getType()) {
                case 'item':
                    this.itemTemplate = item.template;
                    break;

                case 'selectedItem':
                    this.selectedItemTemplate = item.template;
                    break;

                default:
                    this.itemTemplate = item.template;
                    break;
            }
        });
    }


    ngAfterViewInit() {

      if (this.setFistAsValue  && !this.initialed) {
        this.initialed  = true;
        const option = this.suggestions[0];
        console.log('option');
        console.log(option);
        setTimeout(() => {
          this.selectItem(option)
        }, 10)
      }
        this.documentClickListener = this.renderer.listen('document', 'click', (e) => {
            if (this.inputClick) {
              this.inputClick = false;
            }
            else {
              let hasBaMap = false;
              if (e.target.tagName === 'svg') {
                hasBaMap = true;
              } else if( e.target.tagName === 'path'){
                hasBaMap = false;
              } else {
                if (e.target.className) {
                  if (e.target.className.indexOf('BMap') !== -1){
                    hasBaMap = true;
                  }
                }
              }

                if (!hasBaMap) {
                  if (this.getValue) {
                    if (this.getValue !== this.inputEL.nativeElement.value) {
                        this.inputEL.nativeElement.value = this.getValue;
                    }
                  } else {
                    this.inputEL.nativeElement.value = '';
                    if (this.shouldReset) {
                      this.onModelChange(undefined);
                    }
                  }
                  this.hide();
                }
            }

            this.cd.markForCheck();
        });

        if(this.appendTo) {
            if(this.appendTo === 'body')
                document.body.appendChild(this.panelEL.nativeElement);
            else
                this.domHandler.appendChild(this.panelEL.nativeElement, this.appendTo);
        }
    }

    ngAfterViewChecked() {
        if(this.suggestionsUpdated) {
            this.align();
            this.suggestionsUpdated = false;
        }

        if(this.highlightOptionChanged) {
            let listItem = this.domHandler.findSingle(this.panelEL.nativeElement, 'li.ui-state-highlight');
            if(listItem) {
                this.domHandler.scrollInView(this.panelEL.nativeElement, listItem);
            }
            this.highlightOptionChanged = false;
        }
    }

    writeValue(value: any) : void {
      if (this.id === 'value') {
        this.value = value;
        this.filled = this.value && this.value != '';
      } else {
        setTimeout(() => {
          this.onModelChange(undefined);
        }, 10);
      }
    }

    registerOnChange(fn: Function): void {
        this.onModelChange = fn;
    }

    registerOnTouched(fn: Function): void {
        this.onModelTouched = fn;
    }

    setDisabledState(val: boolean): void {
        this.disabled = val;
    }

    onInput(event: KeyboardEvent) {
        let value = (<HTMLInputElement> event.target).value;
        // if(!this.multiple) {
        //     this.onModelChange(value);
        // }

        if(value.length === 0) {
            this.writeValue(undefined);
            this.hide();
            this.onClear.emit(true);

        }

        if (value.length >= this.minLength) {
            //Cancel the search request if user types within the timeout
            // this.value = undefined;
            if (this.timeout) {
                clearTimeout(this.timeout);
            }

            this.timeout = setTimeout(() => {
                this.search(event, value);
            }, this.delay);
        } else {
            this.suggestions = null;
        }
        this.updateFilledState();
    }

    onInputClick(event: MouseEvent) {
        this.inputClick = true;
    }


  /**
   * emit search method
   * @param event
   * @param query
   */
  search(event: any, query: string) {
        //allow empty string but not undefined or null
        if(query === undefined || query === null) {
            return;
        }

        this.completeMethod.emit({
            originalEvent: event,
            query: query
        });
    }

  /**
   * select a option in options
   * @param option
   */
  selectItem(option: any) {
        if(this.multiple) {
            this.multiInputEL.nativeElement.value = '';
            this.value = this.value||[];
            if(!this.isSelected(option)) {
                this.value = [...this.value, option];
                this.onModelChange(this.value);
            }
        }
        else {
          console.log('this.id: ' + this.id);

            const b  = this.id ? this.objectUtils.resolveFieldData(option, this.id)||'': option;
            this.inputEL.nativeElement.value = this.field ? this.objectUtils.resolveFieldData(option, this.field): option;
            console.log('this.inputEL.nativeElement.value: ' + this.inputEL.nativeElement.value)
            this.value = option;
            console.log('b');
            console.log(b);
            this.onModelChange(b);
        }

        this.onSelect.emit(option);

        this.focusInput();
    }

    show() {
        if(this.multiInputEL || this.inputEL) {
            let hasFocus = this.multiple ? document.activeElement == this.multiInputEL.nativeElement : document.activeElement == this.inputEL.nativeElement ;
            if(!this.panelVisible && hasFocus) {
                this.panelVisible = true;
                this.panelEL.nativeElement.style.zIndex = ++DomHandler.zindex;
                this.domHandler.fadeIn(this.panelEL.nativeElement, 200);
            }
        }
    }

    align() {
        if(this.appendTo)
            this.domHandler.absolutePosition(this.panelEL.nativeElement, (this.multiple ? this.multiContainerEL.nativeElement : this.inputEL.nativeElement));
        else
            this.domHandler.relativePosition(this.panelEL.nativeElement, (this.multiple ? this.multiContainerEL.nativeElement : this.inputEL.nativeElement));
    }

  hideAndClear() {
    this.inputEL.nativeElement.value = '';
    this.panelVisible = false;

  }
    hide() {
        this.panelVisible = false;
    }

    handleDropdownClick(event) {
        this.focusInput();
        // this.show();
        let queryValue = this.multiple ? this.multiInputEL.nativeElement.value : this.inputEL.nativeElement.value;

       this.search(event, '');
        this.onDropdownClick.emit({
            originalEvent: event,
            query: queryValue
        });
    }

    focusInput() {
        if(this.multiple)
            this.multiInputEL.nativeElement.focus();
        else
            this.inputEL.nativeElement.focus();
    }

    removeItem(item: any) {
        let itemIndex = this.domHandler.index(item);
        let removedValue = this.value[itemIndex];
        this.value = this.value.filter((val, i) => i!=itemIndex);
        this.onUnselect.emit(removedValue);
        this.onModelChange(this.value);
    }

    onKeydown(event) {
        if(this.panelVisible) {
            let highlightItemIndex = this.findOptionIndex(this.highlightOption);

            switch(event.which) {
                //down
                case 40:
                    if(highlightItemIndex != -1) {
                        var nextItemIndex = highlightItemIndex + 1;
                        if(nextItemIndex != (this.suggestions.length)) {
                            this.highlightOption = this.suggestions[nextItemIndex];
                            this.highlightOptionChanged = true;
                        }
                    }
                    else {
                        this.highlightOption = this.suggestions[0];
                    }

                    event.preventDefault();
                    break;

                //up
                case 38:
                    if(highlightItemIndex > 0) {
                        let prevItemIndex = highlightItemIndex - 1;
                        this.highlightOption = this.suggestions[prevItemIndex];
                        this.highlightOptionChanged = true;
                    }

                    event.preventDefault();
                    break;

                //enter
                case 13:
                    if(this.highlightOption) {
                        this.selectItem(this.highlightOption);
                        this.hide();
                    }
                    event.preventDefault();
                    break;

                //escape
                case 27:
                    this.hide();
                    event.preventDefault();
                    break;


                //tab
                case 9:
                    if(this.highlightOption) {
                        this.selectItem(this.highlightOption);
                    }
                  if(this.value) {
                    let key = this.field ? this.objectUtils.resolveFieldData(this.value, this.field): this.value;
                    if (key !== this.inputEL.nativeElement.value) {
                      this.inputEL.nativeElement.value = '';
                    }
                  }else {
                    this.inputEL.nativeElement.value = '';
                  }
                    this.hide();
                    break;
            }
        } else {
            if(event.which === 40 && this.suggestions) {
                this.search(event,event.target.value);
            }
        }

        if(this.multiple) {
            switch(event.which) {
                //backspace
                case 8:
                    if(this.value && this.value.length && !this.multiInputEL.nativeElement.value) {
                        this.value = [...this.value];
                        let removedValue = this.value.pop();
                        this.onUnselect.emit(removedValue);
                        this.onModelChange(this.value);
                    }
                    break;
            }
        }
    }

    onInputFocus(event) {
        this.focus = true;
        this.onFocus.emit(event);
    }

    onInputBlur(event) {
        this.focus = false;
        this.onModelTouched();
        this.onBlur.emit(event);
    }

    isSelected(val: any): boolean {
        let selected: boolean = false;
        if(this.value && this.value.length) {
            for(let i = 0; i < this.value.length; i++) {
                if(this.objectUtils.equals(this.value[i], val, this.dataKey)) {
                    selected = true;
                    break;
                }
            }
        }
        return selected;
    }

    findOptionIndex(option): number {
        let index: number = -1;
        if(this.suggestions) {
            for(let i = 0; i < this.suggestions.length; i++) {
                if(this.objectUtils.equals(option, this.suggestions[i])) {
                    index = i;
                    break;
                }
            }
        }

        return index;
    }

    updateFilledState() {
        if (this.multiple)
            this.filled = (this.value && this.value.length) || (this.multiInputEL && this.multiInputEL.nativeElement && this.multiInputEL.nativeElement.value != '');
        else
            this.filled = this.inputEL && this.inputEL.nativeElement && this.inputEL.nativeElement.value != '';
    }

    ngOnDestroy() {
        if(this.documentClickListener) {
            this.documentClickListener();
        }

        if(this.appendTo) {
            this.el.nativeElement.appendChild(this.panelEL.nativeElement);
        }
    }
}

@NgModule({
    imports: [CommonModule,InputTextModule, ButtonModule, SharedModule],
    exports: [AutoComplete, SharedModule],
    declarations: [AutoComplete]
})
export class UAutoCompleteModule { }
