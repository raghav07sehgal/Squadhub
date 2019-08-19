import { Component } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";

export interface ConfirmModel {
    title: string;
    message: string;
}

@Component({
    selector: 'confirm',
    template: `<div class="modal-dialog">
                <div class="modal-content">
                   <div class="modal-header">
                     <h6 class="email">Stakeholder Email Id</h6>
                     <button type="button" class="close" (click)="close()" >&times;</button>                     
                   </div>
                   <div class="modal-body">
                    <textarea [(ngModel)]="textValue" class="form-control email" rows="5" placeholder="Enter Emails with comma seprated i.e test@gmail.com, test1@gmail.com"></textarea>
                   </div>
                   <div class="modal-footer">
                     <button type="button" class="btn btn-primary hvr-bounce-to-top" (click)="confirm()">OK</button>
                     <button type="button" class="btn btn-primary hvr-bounce-to-top" (click)="close()" >Cancel</button>
                   </div>
                 </div>
              </div>`,
    styleUrls: ['./confirm.component.css']
})

export class ConfirmComponent extends DialogComponent<ConfirmModel, boolean> implements ConfirmModel {
    title: string;
    message: string;
    textValue: string;

    constructor(dialogService: DialogService) {
        super(dialogService);
        this.textValue = localStorage.getItem('stakeHolder');

    }
    
    confirm() {
        this.result = true;
        localStorage.setItem('stakeHolder', this.textValue);
        this.close();
    }
}