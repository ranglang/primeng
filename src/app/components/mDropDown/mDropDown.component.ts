
import {NgModule,Component,ElementRef,OnInit,AfterViewInit,AfterContentInit,AfterViewChecked,OnDestroy,Input,Output,Renderer,EventEmitter,ContentChildren,
    QueryList,ViewChild,TemplateRef,forwardRef,ChangeDetectorRef} from '@angular/core';
import {trigger,state,style,transition,animate} from '@angular/animations';
import {CommonModule} from '@angular/common';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';
import {PrimeTemplate, SharedModule} from '../../components/common/shared';
import {SelectItem} from '../../components/common/api';
import {DomHandler} from '../../components/dom/domhandler';
import {ObjectUtils} from "../utils/objectutils";

// export const DROPDOWN_VALUE_ACCESSOR: any = {
//     provide: NG_VALUE_ACCESSOR,
//     useExisting: forwardRef(() => Dropdown),
//     multi: true
// };

@Component({
    selector: 'mDropdown',
    template:
    `
      <div #container [ngClass]="{'ui-dropdown ui-widget ui-state-default .ui-corner-all-4 ui-helper-clearfix':true,
             'female': true}" [ngStyle]="style" (click)="click($event)">
        <div class="ui-helper-hidden-accessible">
          <input #in  type="text" readonly >
        </div>
        <div class="headerTrigger">
          <label [ngClass]="{'ui-dropdown-label ui-inputtext ui-corner-all':true,'ui-dropdown-label-empty':!value}" >{{value||'empty'}}</label>
          <div class="ui-dropdown-trigger ui-state-default ui-corner-right">
            <span class="fa fa-fw fa-caret-down ui-c"></span>
          </div>
        </div>
      </div>
    `,
    providers: [DomHandler, ObjectUtils]
})
// styleUrls: ['mDropDown.component.scss', '../dropdown/dropdown.component.scss'],

 // implements OnInit,AfterViewInit,AfterContentInit,AfterViewChecked,OnDestroy,ControlValueAccessor
export class MDropdown {

    @Input()
    value: string;

    @Input()
    style: string;

    @Output() onClick: EventEmitter<any> = new EventEmitter();

    click(event ?: any) {
        this.onClick.emit(event);
    }
}

@NgModule({
    imports: [CommonModule],
    exports: [MDropdown],
    declarations: [MDropdown]
})

export class MdropdownModule { }
