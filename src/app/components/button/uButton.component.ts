import {
    Directive,
    ElementRef,
    AfterViewInit,
    OnDestroy,
    Input
} from '@angular/core';
// import {DomHandler} from 'primeng/components/dom/domhandler';
import { DomHandler } from '../dom/domhandler';


@Directive({
    selector: '[uButton]',
    providers: [DomHandler]
})

export class UButton implements AfterViewInit, OnDestroy {

    @Input() iconPos: string = 'left';

    @Input() cornerStyleClass: string = 'ui-corner-all';

    @Input() get label(): string {
        return this._label;
    }

    @Input() get icon(): string {
        return this._icon;
    }

    @Input() get category(): string {
        return this._category;
    }

    set category(val: string) {
        this._category = val;
    }

    public _label: string;

    public _icon: string;

    public _category: string;

    public initialized: boolean;

    constructor(public el: ElementRef, public domHandler: DomHandler) {
    }

    ngAfterViewInit() {


        this.domHandler.addMultipleClasses(this.el.nativeElement, this.getStyleClass());
        if (this.icon) {
            let iconElement = document.createElement('span');
            let iconPosClass = (this.iconPos === 'right') ? 'ui-button-icon-right' : 'ui-button-icon-left';
            iconElement.className = iconPosClass + ' ui-c fa fa-fw ' + this.icon;
            this.el.nativeElement.appendChild(iconElement);
        }

        let labelElement = document.createElement('span');
        labelElement.className = 'ui-button-text ui-c';
        labelElement.appendChild(document.createTextNode(this.label || 'ui-button'));
        this.el.nativeElement.appendChild(labelElement);
        this.initialized = true;
    }

    getStyleClass(): string {
        let styleClass = 'ud-button ui-helper-reset';

        if (this.category !== null && this.category !== undefined) {
            if (this.category  === 'continue') {
                styleClass = styleClass + ' ui-button-continue';
               if(! (this.domHandler.hasClass(this.el.nativeElement, 'ud-button-size-l') || this.domHandler.hasClass(this.el.nativeElement, 'ud-button-size-m')) )
                {
                    styleClass = styleClass + ' ud-button-size-l';
                }
            } else if (this.category === 'modal') {
                styleClass = styleClass + ' ui-button-modal';
                styleClass = styleClass + ' ud-button-size-ml';
            } else if (this.category === 'cancel-1') {
                styleClass = styleClass + ' ui-button-cancel-1';
                styleClass = styleClass + ' ud-button-size-l';
            } else if (this.category === 'cancel') {
                styleClass = styleClass + ' ui-button-cancel';
                styleClass = styleClass + ' ud-button-size-l';
            } else if (this.category === 'save') {
                styleClass = styleClass + ' ui-button-save';
                styleClass = styleClass + ' ud-button-size-l';
            } else if (this.category === 'add') {
                styleClass = styleClass + ' ui-button-add';
                // styleClass = styleClass + ' ui-button-size-l';
            } else if (this.category === 'close') {
                styleClass = styleClass + ' ui-button-close';
                styleClass = styleClass + ' ud-button-size-l';
            } else if (this.category === 'remove') {
                styleClass = styleClass + ' ud-button-remove';
                styleClass = styleClass + ' ud-button-size-l';
            } else if (this.category === 'edit') {
               styleClass = styleClass + ' ud-button-edit ud-button-edit-default';
            } else if (this.category === 'delete') {
                styleClass = styleClass + ' ud-button-edit ud-button-edit-delete';
            } else if (this.category === 'reset') {
                styleClass = styleClass + ' ui-button-reset';
                styleClass = styleClass + ' ui-corner-slightly';
                styleClass = styleClass + ' ud-button-size-m';
            }
        }
        if (this.icon) {
            if (this.label !== null && this.label !== undefined) {
                if (this.iconPos === 'left')
                    styleClass = styleClass + ' ui-button-text-icon-left';
                else
                    styleClass = styleClass + ' ui-button-text-icon-right';
            }
            else {
                styleClass = styleClass + ' ui-button-icon-only';
            }
        }
        else {
            styleClass = styleClass + ' ui-button-text-only';
        }

        return styleClass;
    }

    set label(val: string) {
        this._label = val;

        if (this.initialized) {
            this.domHandler.findSingle(this.el.nativeElement, '.ui-button-text').textContent = this._label;
        }
    }

    set icon(val: string) {
        this._icon = val;

        if (this.initialized) {
            let iconPosClass = (this.iconPos == 'right') ? 'ui-button-icon-right' : 'ui-button-icon-left';
            this.domHandler.findSingle(this.el.nativeElement, '.fa').className = iconPosClass + ' ui-c fa fa-fw ' + this.icon;
        }
    }

    ngOnDestroy() {
        while (this.el.nativeElement.hasChildNodes()) {
            this.el.nativeElement.removeChild(this.el.nativeElement.lastChild);
        }
        this.initialized = false;
    }
}
