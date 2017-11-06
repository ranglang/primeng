
import {NgModule,Component,ElementRef,AfterViewInit,AfterContentInit,OnDestroy,Input,Output,SimpleChange,EventEmitter,ContentChild,ContentChildren,TemplateRef,QueryList} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BlockableUI} from '../../components/common/api';
import {Header, Footer, PrimeTemplate, SharedModule} from '../../components/common/shared';
import {UPaginatorModule} from '../../components/paginator/paginator';
import {ObjectUtils} from "../utils/objectutils";
import {DomHandler} from "../dom/domhandler";

// import {SharedModule,Header,Footer,PrimeTemplate} from '../common/shared';
// import {BlockableUI} from '../common/api';

@Component({
    selector: 'u-dataList',
    providers: [DomHandler,ObjectUtils],
    template: `
        <div [ngClass]="'ui-datalist ui-widget ui-margin-top-little'" [ngStyle]="style" [class]="styleClass">
          
            <div class="ui-datalist-header ui-widget-header ui-corner-top" *ngIf="header && !(hideHeaderIfEmpty && isEmpty())">
                <ng-content select="p-header"></ng-content>
            </div>
            <u-paginator [rows]="rows" [first]="first" [totalRecords]="totalRecords" [pageLinkSize]="pageLinks" 
            (onPageChange)="paginate($event)" styleClass="ui-paginator-bottom" [rowsPerPageOptions]="rowsPerPageOptions" *ngIf="paginator  && paginatorPosition!='bottom' || paginatorPosition =='both'"></u-paginator>
            <div class="ui-datalist-content ui-widget-content">
                <div *ngIf="isEmpty()" class="ui-datalist-emptymessage">
                  <div class="emptyIcon"></div>
                  {{emptyMessage}}</div>
                <ul class="ui-datalist-data">
                    <li *ngFor="let item of dataToRender;let i = index;trackBy: trackBy" (click) = "handleRowClick($event, item)" [class]="getRowStyle(i)">
                        <ng-template [pTemplateWrapper]="itemTemplate" [item]="item" [index]="i"></ng-template>
                    </li>
                </ul>
            </div>
            <u-paginator [rows]="rows" [first]="first" [totalRecords]="totalRecords" [pageLinkSize]="pageLinks" 
            (onPageChange)="paginate($event)" styleClass="ui-paginator-bottom" [rowsPerPageOptions]="rowsPerPageOptions" *ngIf="paginator  && paginatorPosition!='top' || paginatorPosition =='both'"></u-paginator>
            <div class="ui-datalist-footer ui-widget-header ui-corner-bottom" *ngIf="footer">
                <ng-content select="p-footer"></ng-content>
            </div>
        </div>
    `
})
export class DataList implements AfterViewInit,AfterContentInit,BlockableUI {

    @Input() paginator: boolean;

    @Input() rows: number;

    @Input() hideHeaderIfEmpty  =false;

    @Input() totalRecords: number;

    @Input() pageLinks: number = 5;

    @Input() rowsPerPageOptions: number[];

  _selectedIndex: number;


    @Input() lazy: boolean;

    @Input() selectedStyleClass: string = 'ui-datalist-selected';

    @Output() onLazyLoad: EventEmitter<any> = new EventEmitter();

    @Output() onRowClick: EventEmitter<any> = new EventEmitter();
  //

    @Input() style: any;

    @Input() styleClass: string;

    @Input() paginatorPosition: string = 'bottom';

    @Input() emptyMessage: string = '查询结果为空';

    @Input() trackBy: Function = (index: number, item: any) => item;

    @Output() onPage: EventEmitter<any> = new EventEmitter();

    @Output() onSelectRow: EventEmitter<any> = new EventEmitter();
    //selectionChange

    @ContentChild(Header) header;

    @ContentChild(Footer) footer;

    @ContentChildren(PrimeTemplate) templates: QueryList<any>;

    public _value: any[];

    public itemTemplate: TemplateRef<any>;

    public dataToRender: any[];

    public first: number = 0;

    public page: number = 0;

    public _selection : any;



    @Input()
    dataKey: string;


  @Input() compareSelectionBy: string = 'deepEquals';

/*
  this._selection = rowData;
  this.selectionChange.emit(rowData);
  if(dataKeyValue) {
    this.selectionKeys = {};
    this.selectionKeys[dataKeyValue] = 1;
  }
*/

    constructor(public el: ElementRef,
                public objectUtils: ObjectUtils,
    ) {}

    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch(item.getType()) {
                case 'item':
                    this.itemTemplate = item.template;
                    break;

                default:
                    this.itemTemplate = item.template;
                    break;
            }
        });
    }

    getRowStyle(rowIndex: number) {
      if (this._selectedIndex === rowIndex) {
        return  this.selectedStyleClass;
      }else  {
        return '';
      }
    }

  handleRowClick(event, data: any) {
    let selectionIndex = this.findIndexInSelection(data);
    let targetNode = (<HTMLElement> event.target).nodeName;
    if (targetNode == 'INPUT' || targetNode == 'BUTTON' || targetNode == 'A' || targetNode == 'LABEL'
      || targetNode == 'LI'
    ) {
      return;
    } else {
      this.onRowClick.emit({event, data});
      this._selection = data;
      if (selectionIndex === this._selection) {
        this._selectedIndex  = undefined;
      } else {
        this._selectedIndex   = selectionIndex;
        this.onSelectRow.emit({event, data, selectionIndex});
      }
      event.preventDefault();
      event.stopPropagation();
    }
  }

  equals(data1, data2) {
    return this.compareSelectionBy === 'equals' ? (data1 === data2) : this.objectUtils.equals(data1, data2, this.dataKey);
  }

  findIndexInSelection(rowData: any) {
    let index: number = -1;
    if(this.value) {
      for(let i = 0; i  < this.value.length; i++) {
        if(this.equals(rowData, this.value[i])) {
          index = i;
          break;
        }
      }
    }
    return index;
  }


    ngAfterViewInit() {
        if(this.lazy) {
            this.onLazyLoad.emit({
                first: this.first,
                rows: this.rows
            });
        }
    }

  @Input() get selectedIndex(): number {
    return this._selectedIndex;
  }

  set selectedIndex(val: number) {
      this._selectedIndex = val;
  }

    @Input() get value(): any[] {
        return this._value;
    }


    set value(val:any[]) {
        this._value = val;
        this.handleDataChange();
    }

    handleDataChange() {
        if(this.paginator) {
            this.updatePaginator();
        }
        this.updateDataToRender(this.value);
    }

    updatePaginator() {
        //total records
        this.totalRecords = this.lazy ? this.totalRecords : (this.value ? this.value.length: 0);

        //first
        if(this.totalRecords && this.first >= this.totalRecords) {
            let numberOfPages = Math.ceil(this.totalRecords/this.rows);
            this.first = Math.max((numberOfPages-1) * this.rows, 0);
        }
    }

    paginate(event) {
        this.first = event.first;
        this.rows = event.rows;

        if(this.lazy) {
            this.onLazyLoad.emit(this.createLazyLoadMetadata());
        }
        else {
            this.updateDataToRender(this.value);
        }

        this.onPage.emit({
            first: this.first,
            rows: this.rows
        });
    }

    updateDataToRender(datasource) {
        if(this.paginator && datasource) {
            this.dataToRender = [];
            let startIndex = this.lazy ? 0 : this.first;
            for(let i = startIndex; i < (startIndex+ this.rows); i++) {
                if(i >= datasource.length) {
                    break;
                }

                this.dataToRender.push(datasource[i]);
            }
        }
        else {
            this.dataToRender = datasource;
        }
    }

    isEmpty() {
        return !this.dataToRender||(this.dataToRender.length == 0);
    }

    createLazyLoadMetadata(): any {
        return {
            first: this.first,
            rows: this.rows
        };
    }

    getBlockableElement(): HTMLElement {
        return this.el.nativeElement.children[0];
    }
}

@NgModule({
    imports: [CommonModule,SharedModule, UPaginatorModule],
    exports: [DataList,SharedModule],
    declarations: [DataList]
})
export class UDataListModule { }

