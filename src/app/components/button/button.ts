import {
  NgModule,
  Directive,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  Renderer2,
  HostBinding,
  HostListener,
  Input
} from '@angular/core';
import {DomHandler} from '../dom/domhandler';
import {CommonModule} from '@angular/common';
import {Platform} from "../platform/platform";
import {PlatformModule} from "../platform/index";

@Directive({
  selector: '[pButton]',
  providers: [DomHandler]
})
export class Button implements AfterViewInit, OnDestroy {

  @Input() iconPos: string = 'left';

  @Input() cornerStyleClass: string = 'ui-corner-all';

  public _label: string;

  public _icon: string;

  public initialized: boolean;
  private span: ElementRef;
  private icon_span: ElementRef;

  constructor(public el: ElementRef, public domHandler: DomHandler, public _renderer2: Renderer2,
              private _platform: Platform) {
  }

  ngAfterViewInit() {
    this.domHandler.addMultipleClasses(this.el.nativeElement, this.getStyleClass())
    let a = this._renderer2.createText(this.label || 'ui-btn');

    if(this.icon) {
      // let iconElement = document.createElement("span");
      this.icon_span = this._renderer2.createElement('span');
      let iconPosClass = (this.iconPos == 'right') ? 'ui-button-icon-right': 'ui-button-icon-left';
      this.domHandler.addSomeClasses(this.icon_span, iconPosClass  + ' ui-c fa fa-fw ' + this.icon);
      this._renderer2.appendChild(this.el.nativeElement, this.icon_span);
    }

    this.span = this._renderer2.createElement('span');
    this.domHandler.addSomeClasses(this.span, 'ui-button-text ui-c');
    this._renderer2.appendChild(this.span, a);

    this._renderer2.appendChild(this.el.nativeElement, this.span);
    this.initialized = true;
  }

  getStyleClass(): string {
    let styleClass = 'ui-button ui-widget ui-state-default ' + this.cornerStyleClass;
    if (this.icon) {
      if (this.label != null && this.label != undefined) {
        if (this.iconPos == 'left')
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

  @Input() get label(): string {
    return this._label;
  }

  set label(val: string) {
    this._label = val;
    if(this.initialized) {
        this.domHandler.findSingle(this.el.nativeElement, '.ui-button-text').textContent = this._label;
    }
  }

  @Input() get icon(): string {
    return this._icon;
  }

  set icon(val: string) {
    this._icon = val;

    // if(this.initialized) {
    //     let iconPosClass = (this.iconPos == 'right') ? 'ui-button-icon-right': 'ui-button-icon-left';
    //     this.domHandler.findSingle(this.el.nativeElement, '.fa').className = iconPosClass  + ' ui-c fa fa-fw ' + this.icon;
    // }
  }

  ngOnDestroy() {
    console.log('ngOnDestroy');
    // data;
    this._renderer2.removeChild(this.el.nativeElement, this.span);
    if(this.icon_span) {
      this._renderer2.removeChild(this.el.nativeElement, this.icon_span);
    }

    // iconElement.className =
    // this.el.nativeElement.appendChild(iconElement);

    // while(this.el.nativeElement.hasChildNodes()) {
    //     console.log('hasChildNodes');
    //     this.el.nativeElement.removeChild(this.el.nativeElement.lastChild);
    // }

    this.initialized = false;
  }
}

@NgModule({
  imports: [CommonModule, PlatformModule],
  exports: [Button],
  declarations: [Button]
})
export class ButtonModule {
}
