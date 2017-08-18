import { NgModule, Component, ElementRef, Input, Output, EventEmitter, AfterContentInit, ContentChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockableUI } from '../../components/common/api';

@Component({
    selector: '[layout-nav]',
    template: `
        <ng-template ngFor let-tab [ngForOf]="tabs">
            <li [class]="getDefaultHeaderClass(tab)" [ngStyle]="tab.headerStyle" role="tab"
                [ngClass]="{'ui-tabview-selected ui-state-active': tab.selected, 'ui-state-disabled': tab.disabled}"
                (click)="clickTab($event,tab)" *ngIf="!tab.closed"
                [attr.aria-expanded]="tab.selected" [attr.aria-selected]="tab.selected">
                <a href="#">
                    <span class="ui-tabview-left-icon fa" [ngClass]="tab.leftIcon" *ngIf="tab.leftIcon"></span>
                    <span class="ui-tabview-title">{{tab.header}}</span>
                    <span class="ui-tabview-right-icon fa" [ngClass]="tab.rightIcon" *ngIf="tab.rightIcon"></span>
                </a>
                <span *ngIf="tab.closable" class="ui-tabview-close fa fa-close" (click)="clickClose($event,tab)"></span>
            </li>
        </ng-template>
    `,
})
export class LayoutNav {

}
