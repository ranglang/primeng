import {
  Component, Input, ViewChild, ViewContainerRef, EventEmitter,
  ComponentFactoryResolver, ChangeDetectorRef, NgModule
}
  from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {Toast} from './toast';
import {BodyOutputType} from './bodyOutputType';

@Component({
    selector: '[toastComp]',
    template: `
        <!--<i class="toaster-icon" ></i>-->
        <div class="toast-content">
            <div class="fix-width-icon">
              <i class="msgIcon iconSize " [ngClass]="iconClass" aria-hidden="true"></i>
            </div>
            <div class="green_success" [ngClass]="toast.toasterConfig.messageClass" [ngSwitch]="toast.bodyOutputType">
                <div *ngSwitchCase="bodyOutputType.Component" #componentBody></div>
                <div *ngSwitchCase="bodyOutputType.TrustedHtml" [innerHTML]="toast.body"></div>
                <div *ngSwitchCase="bodyOutputType.Default" [ngClass]="'t_'+iconClass" class="msgWords">{{toast.body}}</div>
            </div>
        </div>
        `,
    outputs: ['clickEvent']
})

export class ToastComponent {

    @Input() toast: Toast;
    @Input() iconClass: string;
    @ViewChild('componentBody', { read: ViewContainerRef }) componentBody: ViewContainerRef;

    safeCloseHtml: SafeHtml;

    public bodyOutputType = BodyOutputType;
    public clickEvent = new EventEmitter();

    constructor(
      private sanitizer: DomSanitizer,
      private componentFactoryResolver : ComponentFactoryResolver,
      private changeDetectorRef : ChangeDetectorRef
    ) {}

    ngOnInit() {
        if (this.toast.closeHtml) {
            this.safeCloseHtml = this.sanitizer.bypassSecurityTrustHtml(this.toast.closeHtml);
        }
    }

    ngAfterViewInit() {
        if (this.toast.bodyOutputType === this.bodyOutputType.Component) {
            let component = this.componentFactoryResolver.resolveComponentFactory(this.toast.body);
            let componentInstance : any = this.componentBody.createComponent(component, null, this.componentBody.injector);
            componentInstance.instance.toast = this.toast;
            this.changeDetectorRef.detectChanges();
        }
    }

    click(event : MouseEvent, toast: Toast) {
        event.stopPropagation();
        this.clickEvent.emit({
            value : { toast: toast, isCloseButton: true}
        });
    }
}

