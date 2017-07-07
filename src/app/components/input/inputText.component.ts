
import {NgModule,Directive,ElementRef,HostListener,Input,DoCheck} from '@angular/core';
import {CommonModule} from '@angular/common';

@Directive({
    selector: '[uInputText]',
    host: {
        '[class.ud-border-reset]': 'true',
        '[class.ud-inputtext]': 'true',
        '[class.ud-state-default]': 'true',
        '[class.ui-widget]': 'true',
        '[class.ui-state-filled]': 'filled'
    }
})
export class InputText implements DoCheck {

    filled: boolean;

    constructor(public el: ElementRef) {}

    ngDoCheck() {
        this.updateFilledState();
    }

    //To trigger change detection to manage ui-state-filled for material labels when there is no value binding
    @HostListener('input', ['$event'])
    onInput(e) {
        this.updateFilledState();
    }

    updateFilledState() {
        this.filled = this.el.nativeElement.value && this.el.nativeElement.value.length;
    }
}

@NgModule({
    imports: [CommonModule],
    exports: [InputText],

    declarations: [InputText]
})

export class UInputTextModule { }
