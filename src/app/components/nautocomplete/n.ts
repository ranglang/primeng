

import {
  NgModule, Component, ViewChild, ElementRef, AfterViewInit, AfterContentInit, AfterViewChecked, Input, Output,
  EventEmitter, ContentChildren, QueryList, TemplateRef, Renderer, forwardRef, ChangeDetectorRef, Renderer2
} from '@angular/core';
import {CommonModule} from '@angular/common';
// import {InputTextModule} from '../inputtext/inputtext';
// import {ButtonModule} from '../button/button';
// import {SharedModule,PrimeTemplate} from '../common/shared';
// import {DomHandler} from '../dom/domhandler';
// import {ObjectUtils} from '../utils/ObjectUtils';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';
import {DomHandler} from '../dom/domhandler';
import {ObjectUtils} from '../utils/objectutils';
import {PrimeTemplate, SharedModule} from '../common/shared';
import {ButtonModule} from '../button/button';
import {InputTextModule} from '../inputtext/inputtext';

export const AUTOCOMPLETE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AutoComplete),
  multi: true
};

@Component({
  selector: 'd-autoComplete',
  template: `
    <span
      [ngClass]="{'ui-autocomplete ui-widget':true,'ui-autocomplete-dd':dropdown,'ui-autocomplete-multiple':multiple, 'male': true}"
      [ngStyle]="style" [class]="styleClass">
            <input *ngIf="!multiple" #in [attr.type]="type" [attr.id]="inputId" [ngStyle]="inputStyle"
                   [class]="inputStyleClass" autocomplete="off"
                   [ngClass]="'ui-input-autocomplete ui-widget ui-state-default ui-corner-all ui-autocomplete-input'"
                   [value]="value ? (field ? objectUtils.resolveFieldData(value,field)||value : value) : null"
                   (click)="onInputClick($event)" (input)="onInput($event)" (keydown)="onKeydown($event)"
                   (focus)="onInputFocus($event)" (blur)="onInputBlur($event)" (change)="onInputChange($event)"
                   [attr.placeholder]="placeholder" [attr.size]="size" [attr.maxlength]="maxlength"
                   [attr.tabindex]="tabindex" [readonly]="readonly" [disabled]="disabled"
            >
    <button type="button" pButton icon="fa-fw fa-caret-down" class="ui-autocomplete-dropdown" [disabled]="disabled"
            (click)="handleDropdownClick($event)" *ngIf="dropdown"></button>
            <div #panel class="ui-autocomplete-panel  ui-widget-content ui-widget ui-corner-all"
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

  @Input() delay: number = 100;

  @Input() style: any;

  @Input() styleClass: string;

  @Input() inputStyle: any;

  @Input() inputId: string;

  @Input() inputStyleClass: string;

  @Input() placeholder: string;

  @Input() readonly: boolean;

  @Input() disabled: boolean;

  @Input() maxlength: number;

  @Input() size: number;

  @Input() appendTo: any;

  @Input() autoHighlight: boolean;

  @Input() type: string = 'text';

  @Output() completeMethod: EventEmitter<any> = new EventEmitter();

  @Output() onSelect: EventEmitter<any> = new EventEmitter();

  @Output() onUnselect: EventEmitter<any> = new EventEmitter();

  @Output() onFocus: EventEmitter<any> = new EventEmitter();

  @Output() onBlur: EventEmitter<any> = new EventEmitter();

  @Output() onDropdownClick: EventEmitter<any> = new EventEmitter();

  @Input() field: string;

  @Input() scrollHeight: string = '200px';

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

  value: any;

  _options: any[];
  _suggestions: any[];

  onModelChange: Function = () => {};

  onModelTouched: Function = () => {};

  timeout: any;

  differ: any;

  panelVisible: boolean = false;

  documentClickListener: any;

  suggestionsUpdated: boolean;

  highlightOption: any;

  highlightOptionChanged: boolean;

  focus: boolean = false;

  filled: boolean;

  inputClick: boolean;

  inputKeyDown: boolean;

  noResults: boolean;

  constructor(public el: ElementRef, public domHandler: DomHandler, public renderer: Renderer2, public objectUtils: ObjectUtils, public cd: ChangeDetectorRef) {}

  @Input() get options(): any[] {
    return this._options;
  }

  @Input() get suggestions(): any[] {
    return this._suggestions;
  }
  set options(val:any[]) {
    this._options = val;
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
    this.value = value;
    this.filled = this.value && this.value != '';
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
    if(!this.inputKeyDown) {
      return;
    }

    let value = (<HTMLInputElement> event.target).value;

    this.onModelChange(undefined);
    // if(!this.multiple) {
    //     this.onModelChange(value);
    // }

    if(value.length === 0) {
      this.hide();
    }

    if(value.length >= this.minLength) {
      console.log('value:' + value);
      //Cancel the search request if user types within the timeout
      if(this.timeout) {
        console.log('cancle the TImeout');
        clearTimeout(this.timeout);
      }

      this.timeout = setTimeout(() => {
        console.log('timeout trigger')
        this.search(event, value);
        this.cd.markForCheck();
      }, this.delay);
    }
    else {
      this.suggestions = null;
    }
    this.updateFilledState();
    this.inputKeyDown = false;
  }

  onInputClick(event: MouseEvent) {
    if(this.documentClickListener) {
      this.inputClick = true;
    }
  }

  search(event: any, query: string) {
    //allow empty string but not undefined or null
    if(query === undefined || query === null) {
      return;
    }
    if (query) {
      this.suggestions = this._options.filter((res) => {
        return res.label.indexOf(query) !== -1;
      });

    } else {
      this.suggestions = this._options;
    }
    console.log('this.suggestions');
    console.log(this.suggestions);

    this.completeMethod.emit({
      originalEvent: event,
      query: query
    });
  }

  selectItem(option: any) {
    if(this.multiple) {
      this.multiInputEL.nativeElement.value = '';
      this.value = this.value||[];
      if(!this.isSelected(option)) {
        this.value = [...this.value,option];
        this.onModelChange(this.value);
      }
    }
    else {
      this.inputEL.nativeElement.value = this.field ? this.objectUtils.resolveFieldData(option, this.field): option;
      this.value = option;
      this.onModelChange(this.value);
    }

    this.onSelect.emit(option);

    this.focusInput();
  }

  showAnd1() {
    if(this.multiInputEL || this.inputEL) {
      let hasFocus = this.multiple ? document.activeElement == this.multiInputEL.nativeElement : document.activeElement == this.inputEL.nativeElement ;
      if(!this.panelVisible ) {
        this.panelVisible = true;
        this.panelEL.nativeElement.style.zIndex = ++DomHandler.zindex;
        this.domHandler.fadeIn(this.panelEL.nativeElement, 200);
        this.bindDocumentClickListener();
      }
    }
  }
  show() {
    if(this.multiInputEL || this.inputEL) {
      let hasFocus = this.multiple ? document.activeElement == this.multiInputEL.nativeElement : document.activeElement == this.inputEL.nativeElement ;
      if(!this.panelVisible && hasFocus) {
        this.panelVisible = true;
        this.panelEL.nativeElement.style.zIndex = ++DomHandler.zindex;
        this.domHandler.fadeIn(this.panelEL.nativeElement, 200);
        this.bindDocumentClickListener();
      }
    }
  }

  align() {
    if(this.appendTo)
      this.domHandler.absolutePosition(this.panelEL.nativeElement, (this.multiple ? this.multiContainerEL.nativeElement : this.inputEL.nativeElement));
    else
      this.domHandler.relativePosition(this.panelEL.nativeElement, (this.multiple ? this.multiContainerEL.nativeElement : this.inputEL.nativeElement));
  }

  hide() {
    this.panelVisible = false;
    this.unbindDocumentClickListener();
  }

  handleDropdownClick(event) {
    this.focusInput();
    let queryValue = this.multiple ? this.multiInputEL.nativeElement.value : this.inputEL.nativeElement.value;
    this.panelVisible = false;
    this.inputClick= true;
    this._suggestions = this._options;
    this.show();
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

    this.inputKeyDown = true;
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

  onInputChange(event) {
    this.value = (<HTMLInputElement> event.target).value;
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
    if(this.multiple)
      this.filled = (this.value && this.value.length) || (this.multiInputEL && this.multiInputEL.nativeElement && this.multiInputEL.nativeElement.value != '');
    else
      this.filled = this.inputEL && this.inputEL.nativeElement && this.inputEL.nativeElement.value != '';
  }

  bindDocumentClickListener() {
    if(!this.documentClickListener) {
      this.documentClickListener = this.renderer.listen('document', 'click', (event) => {
        console.log('event');
        if(event.which === 3) {
          return;
        }

        console.log('..........');
        let key = this.field ? this.objectUtils.resolveFieldData(this.value, this.field): this.value;
        console.log('key:' + key);
        if (key !== this.inputEL.nativeElement.value) {
          this.inputEL.nativeElement.value = '';
        }
        if(this.inputClick)
          this.inputClick = false;
        else
          this.hide();

        this.cd.markForCheck();
      });
    }
  }

  unbindDocumentClickListener() {
    if(this.documentClickListener) {
      this.documentClickListener();
      this.documentClickListener = null;
    }
  }

  ngOnDestroy() {
    this.unbindDocumentClickListener();

    if(this.appendTo) {
      this.el.nativeElement.appendChild(this.panelEL.nativeElement);
    }
  }
}

@NgModule({
  imports: [CommonModule, InputTextModule,ButtonModule,SharedModule],
  exports: [AutoComplete,SharedModule],
  declarations: [AutoComplete]
})
export class DAutoCompleteModule { }

