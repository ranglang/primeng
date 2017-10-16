import {
  NgModule, Component, ElementRef, AfterViewInit, OnDestroy, Input, Output, EventEmitter, Renderer, ContentChild,
  ViewChild
} from '@angular/core';
import { trigger, state, style,transition,animate } from '@angular/animations';
// import {DomHandler} from "./dom/domHandler";
import {DomHandler} from '../dom/domhandler';
import { CommonModule } from '@angular/common';
import { Subscription }   from 'rxjs/Subscription';
import { Confirmation, ConfirmationService} from '../../components/common/api';
import { ButtonModule} from '../../components/button/button';
import {SharedModule, Footer} from '../../components/common/shared';
// import {DomHandler} from '../../dom/domhandler';
// import {DomHandler} from './dom/domHandler';
import {UButtonModule} from '../button/uButton';
import {Platform} from "../platform/platform";

@Component({
  selector: 'dContent',
  template:
  `<ng-content></ng-content>
  `
})
export class DialogCotent implements AfterViewInit,OnDestroy {
  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }

}

@Component({
  selector: 'u-p-confirmDialog',
  template:
  `
    <div
      [ngClass]="{'ui-dialog ui-confirmdialog ui-widget ui-widget-content ui-corner-all-10 u-ui-shadow':true,'ui-dialog-rtl':rtl}"
      [style.display]="visible ? 'block' : 'none'" [style.width.px]="width" [style.height.px]="height"
      (mousedown)="moveOnTop()" [@dialogState]="visible ? 'visible' : 'hidden'">
      
      <!--<div #content>-->
        <ng-content select="[a]"></ng-content>
      <!--</div>-->

      <div class="confirmContent">
        <div class="faMessage" *ngIf="header">{{message}}</div>
        <!--ui-widget-content -->
        <div *ngIf="dContent">
          <ng-content select="dContent" ></ng-content>
        </div>
        <div class="ui-dialog-buttonpane ui-helper-clearfix" *ngIf="footer">
          <ng-content select="p-footer"></ng-content>
        </div>
        <div class="ui-helper-clearfix u-ui-dialog-footer" *ngIf="!footer">
          <button uButton [category]="'cancel'" [label]="rejectLabel" (click)="accept()" *ngIf="rejectVisible"></button>
          <button uButton [category]="'continue'" [label]="acceptLabel" (click)="accept()" *ngIf="acceptVisible"></button>
        </div>
      </div>
    </div>
  `,
  // styleUrls: [ 'uConfirmService.component.scss' ],
  animations: [
    trigger('dialogState', [
      state('hidden', style({
        opacity: 0
      })),
      state('visible', style({
        opacity: 1
      })),
      transition('visible => hidden', animate('400ms ease-in')),
      transition('hidden => visible', animate('400ms ease-out'))
    ])
  ],
  providers: [DomHandler]
})
export class ConfirmDialog implements AfterViewInit,OnDestroy {

  @Input() header: string;
  @Input() showFooter = true;

  @Input() icon: string;

  @Input() message: string;

  @Input() acceptIcon: string = 'fa-check';

  @Input() acceptLabel: string = 'Yes';

  @Input() acceptVisible: boolean = true;

  @Input() rejectIcon: string = 'fa-close';

  @Input() rejectLabel: string = 'No';

  @Input() rejectVisible: boolean = true;

  @Input() width: any;

  @Input() height: any;

  @Input() closeOnEscape: boolean = true;

  @Input() rtl: boolean;

  @Input() closable: boolean = true;

  @Input() responsive: boolean = true;

  @Input() appendTo: any;

  @Input() key: string;

  @ContentChild(Footer) footer;
  @ContentChild(DialogCotent) dContent;

  // @ViewChild('content') contentViewChild: ElementRef;


  confirmation: Confirmation;

  _visible: boolean;

  documentEscapeListener: any;

  documentResponsiveListener: any;

  maskListener: any;

  mask: any;

  contentContainer: any;

  positionInitialized: boolean;

  subscription: Subscription;

  isShowRightSide: boolean;


  constructor(public el: ElementRef, public domHandler: DomHandler,
              private platform: Platform,
              public renderer: Renderer, private confirmationService: ConfirmationService) {
    if(this.confirmationService) {

    }
    this.isShowRightSide =  false;
    this.subscription = confirmationService.requireConfirmation$.subscribe(confirmation => {
      if(confirmation.key === this.key) {
        this.confirmation = confirmation;
        this.message = this.confirmation.message||this.message;
        this.icon = this.confirmation.icon||this.icon;
        this.header = this.confirmation.header||this.header;
        this.rejectVisible = this.confirmation.rejectVisible == null ? this.rejectVisible : this.confirmation.rejectVisible;
        this.acceptVisible = this.confirmation.acceptVisible == null ? this.acceptVisible : this.confirmation.acceptVisible;

        if(this.confirmation.accept) {
          this.confirmation.acceptEvent = new EventEmitter();
          this.confirmation.acceptEvent.subscribe(this.confirmation.accept);
        }

        if(this.confirmation.reject) {
          this.confirmation.rejectEvent = new EventEmitter();
          this.confirmation.rejectEvent.subscribe(this.confirmation.reject);
        }

        this.visible = true;
      }
    });
  }

  @Input() get visible(): boolean {
    return this._visible;
  }

  set visible(val:boolean) {
    this._visible = val;

    if(this._visible) {
      if(!this.positionInitialized) {
        this.center();
        this.positionInitialized = true;
      }

      this.el.nativeElement.children[0].style.zIndex = ++DomHandler.zindex;
    }

    if(this._visible)
      this.enableModality();
    else
      this.disableModality();
  }

  ngAfterViewInit() {
    if ( !this.platform.isBrowser) {
      return ;
    }
    this.contentContainer = this.domHandler.findSingle(this.el.nativeElement, '.ui-dialog-content');
    if(this.responsive) {
      this.documentResponsiveListener = this.renderer.listenGlobal('window', 'resize', (event) => {
        this.center();
      });
    }

    // && this.closable
    if(this.closeOnEscape) {
      this.documentEscapeListener = this.renderer.listenGlobal('document', 'keydown', (event) => {
        if(event.which == 27) {
          if(this.el.nativeElement.children[0].style.zIndex == DomHandler.zindex) {
            this.hide(event);
          }
        }
      });
    }

    if(this.appendTo) {
      if(this.appendTo === 'body')
        document.body.appendChild(this.el.nativeElement);
      else
        this.domHandler.appendChild(this.el.nativeElement, this.appendTo);
    }
    // this.moveOnTop();
  }

  center() {
    let container = this.el.nativeElement.children[0];
    let elementWidth = this.domHandler.getOuterWidth(container);
    let elementHeight = this.domHandler.getOuterHeight(container);
    if(elementWidth == 0 && elementHeight == 0) {
      container.style.visibility = 'hidden';
      container.style.display = 'block';
      elementWidth = this.domHandler.getOuterWidth(container);
      elementHeight = this.domHandler.getOuterHeight(container);
      container.style.display = 'none';
      container.style.visibility = 'visible';
    }
    let viewport = this.domHandler.getViewport();
    let x = (viewport.width - elementWidth) / 2;
    let y = (viewport.height - elementHeight) / 2;

    container.style.left = x + 'px';
    container.style.top = y + 'px';
  }

  enableModality() {
    if(!this.mask) {
      this.mask = document.createElement('div');
      this.mask.style.zIndex = this.el.nativeElement.children[0].style.zIndex - 1;
      this.domHandler.addMultipleClasses(this.mask, 'ui-widget-overlay ui-dialog-mask');

      this.maskListener = this.renderer.listen(this.mask, 'click', (event) => {
        this.hide(event);
      });
      document.body.appendChild(this.mask);
    }
  }

  disableModality() {
    if(this.mask) {
      document.body.removeChild(this.mask);
      this.mask = null;
    }
  }

  hide(event?:Event) {
    this.visible = false;

    if(event) {
      event.preventDefault();
    }
  }

  moveOnTop() {
    this.el.nativeElement.children[0].style.zIndex = ++DomHandler.zindex;
  }

  ngOnDestroy() {
    this.disableModality();

    if(this.documentResponsiveListener) {
      this.documentResponsiveListener();
    }

    if(this.maskListener) {
      this.maskListener();
    }
    if(this.documentEscapeListener) {
      this.documentEscapeListener();
    }

    if (this.appendTo && this.appendTo === 'body') {
      document.body.removeChild(this.el.nativeElement);
    }

    this.subscription.unsubscribe();
  }

  accept() {
    if (this.confirmation.acceptEvent) {
      this.confirmation.acceptEvent.emit();
    }

    this.hide();
    this.confirmation = null;
  }

  reject() {
    if (this.confirmation.rejectEvent) {
      this.confirmation.rejectEvent.emit();
    }

    this.hide();
    this.confirmation = null;
  }
}

@NgModule({
  imports: [CommonModule, ButtonModule, UButtonModule],
  exports: [ConfirmDialog, ButtonModule, SharedModule, DialogCotent ],
  declarations: [ConfirmDialog, DialogCotent ]
})
export class UConfirmDialogModule { }
