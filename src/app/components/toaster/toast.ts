import { BodyOutputType } from './bodyOutputType';
import { ToasterConfig } from './toaster-config';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './toast.component';
import { ToasterContainerComponent } from './toaster-container.component';
import { ToasterService } from './toaster.service';
import {UButtonModule} from "../button/uButton";

export interface Toast {
    type: string;
    title?: string;
    body?: any;
    toastId?: string;
    toastContainerId?: number;
    onShowCallback?: OnActionCallback;
    onHideCallback?: OnActionCallback;
    timeout?: number;
    timeoutId?: number;
    bodyOutputType?: BodyOutputType;
    clickHandler?: ClickHandler;
    showCloseButton?: boolean;
    closeHtml?: string;
    toasterConfig? : ToasterConfig;
}

export interface ClickHandler {
    (toast: Toast, isCloseButton?: boolean) : boolean;
}

export interface OnActionCallback {
    (toast: Toast) : void
}


@NgModule({
  imports: [CommonModule, UButtonModule],
  declarations: [
    ToastComponent,
    ToasterContainerComponent
  ],
  providers: [ToasterService],
  exports: [
    ToasterContainerComponent,
    ToastComponent
  ]
})
export class ToasterModule { }
