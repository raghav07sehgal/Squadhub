import { Component } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";

export interface ErrorModel {
    title: string;
    message: string;
}
@Component({
    selector: 'confirm',
    template: `<div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                   <div class="modal-header">
                     <button type="button" class="close" (click)="close()" >&times;</button>                     
                   </div>
                   <div class="modal-body text-center">                   
                    {{error_message}}
                   </div>
                   <div class="modal-footer">
                     <button type="button" class="btn btn-primary hvr-bounce-to-top" (click)="confirm()">OK</button>  
                   </div>
                 </div>
              </div>
              <div class="modal-backdrop fade show"></div>`,
    styleUrls: ['./error.component.css']
})

export class ErrorComponent extends DialogComponent<ErrorModel, boolean> implements ErrorModel {
    title: string;
    message: string;
    error_message: any;

    constructor(dialogService: DialogService) {
        super(dialogService);
        this.error_message = localStorage.getItem('errorMsg');
    }

    confirm() {
        this.result = true;
        this.close();
        localStorage.removeItem('errorMsg');
        if (localStorage.getItem('isReload')) {
            localStorage.removeItem('isReload')
            this.refresh()
        }
        return;
    }

    refresh(): void {
        window.location.reload();
    }
}