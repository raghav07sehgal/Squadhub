import { Component, OnInit, Compiler } from '@angular/core';
import { first, retry } from 'rxjs/operators';
import { CommonService } from '../service/commons-service';
import { Router } from '@angular/router';
import { ErrorComponent } from '../confirm/error.component';
import { DialogService } from "ng2-bootstrap-modal";
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { Http } from '@angular/http';
import { AppConfig } from '../util';
import { Common } from '../util/common';

const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
    one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
    !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
        ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
    !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
        ? false : one.day > two.day : one.month > two.month : one.year > two.year;

@Component({
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.css']

})
export class DashboardComponent implements OnInit {
    private users: any = {};
    private loading = false;
    private loginImageURL: any = "";
    private loginUserName: any = "";
    private hoveredDate: NgbDateStruct;
    private fromDate: NgbDateStruct;
    private toDate: NgbDateStruct;

    constructor(calendar: NgbCalendar,
        private router: Router,
        private commonService: CommonService, private _compiler: Compiler) {
        this._compiler.clearCache();
        this.users = JSON.parse(localStorage.getItem('user'));
        if (!this.users || !this.users.userData) {
            this.commonService.logout();
            return;
        }
        if (this.users && this.users.userData) {
            this.loginImageURL = this.users.userData.avatarUrls['48x48'];
            this.loginUserName = this.users.userData.displayName;
        }
        this.fromDate = calendar.getToday();
        this.toDate = calendar.getNext(calendar.getToday(), 'd', 0);
    }

    isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
    isInside = date => after(date, this.fromDate) && before(date, this.toDate);
    isFrom = date => equals(date, this.fromDate);
    isTo = date => equals(date, this.toDate);

    ngOnInit() {
    }

    // reset on date selection
    private onDateSelection(date: NgbDateStruct) {
        if (!this.fromDate && !this.toDate) {
            this.fromDate = date;
        } else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
            this.toDate = date;
        } else {
            this.toDate = null;
            this.fromDate = date;
        }
    }

    // frorward to next section 
    public gotoNextPage(e, routeURL) {
        this.router.navigate([routeURL]);
    }

    // logout and forward to next section
    private logout() {
        this.commonService.logout();
    }
}