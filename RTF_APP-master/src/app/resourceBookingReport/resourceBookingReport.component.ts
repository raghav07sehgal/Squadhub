import { Component, OnInit, Compiler } from '@angular/core';
import { first, retry } from 'rxjs/operators';
import { Pipe } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { DialogService } from "ng2-bootstrap-modal";
import { ErrorComponent } from '../confirm/error.component';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgbDatepickerConfig, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AppConfig } from '../util';
import { Common } from '../util/common';
import { ExcelService } from '../service/excel.service';
import { CommonService } from '../service/commons-service';

@Pipe({
    name: 'unique',
    pure: false
})

@Component({
    templateUrl: 'resourceBookingReport.component.html?v=${new Date().getTime()}',
    styleUrls: ['resourceBookingReport.component.css?v=${new Date().getTime()}']
})
export class ResourceBookingReportComponent implements OnInit {
    private users: any = {};
    private loginImageURL: any = "";
    private loginUserName: any = "";
    private resourceBookingForm: FormGroup;
    private config: any;
    private isEnable: boolean = false;
    private loading: boolean = false;
    private baseURL: any = null;
    private userList: any[] = [];
    private bookingData: any[] = [];
    private sDate: any = null;
    private eDate: any = null;
    private dateArr: any[] = [];
    private bookingReportData: any[] = [];


    constructor(private router: Router, private appConfig: AppConfig,
        private common: Common, private _compiler: Compiler,
        private commonService: CommonService, private formBuilder: FormBuilder,
        config: NgbDatepickerConfig, private excelService: ExcelService) {
        this._compiler.clearCache();
        this.users = JSON.parse(localStorage.getItem('user'));
        if (!this.users || !this.users.userData) {
            this.commonService.logout();
            return;
        }
        if (this.users && this.users.userData) {
            this.loginImageURL = this.users.userData.avatarUrls['48x48'];
            this.loginUserName = this.users.userData.key;
        }
        this.config = config;
        let currentDate = new Date();
        this.config.minDate = { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1, day: currentDate.getDate() };
        this.config.maxDate = { year: 2099, month: 12, day: 31 };
        this.config.markDisabled = false;
        this.baseURL = this.appConfig.getServerURL();
    }

    ngOnInit() {
        this.resourceBookingForm = new FormGroup({
            startDate: new FormControl(),
            endDate: new FormControl()
        });
        this.resourceBookingForm = this.formBuilder.group({
            startDate: [null, Validators.required],
            endDate: [null, Validators.required]
        });

    }

    //set start date
    private setStartDate() {
        this.isEnable = false;
        let currentDate = new Date();
        this.config.minDate = { year: currentDate.getFullYear() - 10, month: currentDate.getMonth() + 1, day: currentDate.getDate() };
    }

    //set end date
    private setEndDate() {
        this.isEnable = false;
        if (this.resourceBookingForm.value.startDate) {
            var dd = this.resourceBookingForm.value.startDate.day;
            var mm = this.resourceBookingForm.value.startDate.month;
            var yy = this.resourceBookingForm.value.startDate.year;
            this.config.minDate = { year: yy, month: mm, day: dd };

        } else {
            localStorage.setItem('errorMsg', 'Please select Start Date');
            this.commonService.showerror();
            return;
        }
    }

    //get utilization resource
    private getUtilizationResource() {
        this.dateArr = [];
        this.sDate = this.common.getDateYYMMDD(this.resourceBookingForm.value.startDate);
        this.eDate = this.common.getDateYYMMDD(this.resourceBookingForm.value.endDate);
        this.loading = true;
        this.commonService.getUtilizationResource(this.sDate, '').pipe(first()).subscribe(
            data => {
                if (data && data.length > 0) {
                    this.userList = data;
                    this.getBookedResource()
                }
            },
            error => {
                this.loading = false;
                localStorage.setItem('errorMsg', 'Data Not Found');
                this.commonService.showerror();
                return;
            });
    }

    //get booked resource
    private getBookedResource() {
        this.bookingData = [];
        if (this.resourceBookingForm.invalid) {
            return;
        }
        this.commonService.getBookedUtilizationResource(this.sDate, this.eDate).pipe(first()).subscribe(
            data => {
                if (data && data.length > 0) {
                    this.bookingData = data;
                    this.filterBookingData()
                }
            },
            error => {
                this.loading = false;
                localStorage.setItem('errorMsg', 'Data Not Found');
                this.commonService.showerror();
                return;
            });
    }

    //filter booking data
    private filterBookingData() {
        this.bookingReportData = [];
        this.dateArr = this.common.getDateArray(new Date(this.sDate), new Date(this.eDate));
        this.bookingData.forEach((bookUser, j) => {
            let index = -1;
            let dateObj = {};
            //date array
            this.dateArr.forEach((date, j) => {
                dateObj[date] = 0;
            });
            //check data in exiting 
            this.bookingReportData.forEach((bookingReportData, k) => {
                if (bookUser.userid == bookingReportData.userid && bookUser.csdno == bookingReportData.csdno) {
                    index = k;
                }
            });
            if (index == -1) {
                this.bookingData.forEach((subBookUser, k) => {
                    let bookingDate = this.common.getDateDDMMYY(subBookUser.bookingdate);
                    if (bookUser.userid == subBookUser.userid && bookUser.csdno == subBookUser.csdno) {
                        dateObj[bookingDate] = Number(dateObj[bookingDate]) + Number(subBookUser.assignhours);
                    }
                });
                this.bookingReportData.push({ userid: bookUser.userid, resourceName: bookUser.fullname, csdno: bookUser.csdno, clientName: bookUser.clientName, dateObj: dateObj });
            }
        });
        this.isEnable = true;
        this.loading = false;
    }

    // export booking report data
    private excelReport() {
        let headders = ["S.No", "Resource Name", "JIRA ID", "Client Name"];
        let excelExportData = [];
        for (let i = 0; i < this.dateArr.length; i++) {
            headders.push(this.dateArr[i]);
        }
        for (let i = 0; i < this.bookingReportData.length; i++) {
            let data = {};
            data[headders[0]] = i + 1;
            data[headders[1]] = this.bookingReportData[i].resourceName;
            data[headders[2]] = this.bookingReportData[i].csdno;
            data[headders[3]] = this.bookingReportData[i].clientName;
            for (let j = 0; j < this.dateArr.length; j++) {
                data[this.dateArr[j]] = this.bookingReportData[i].dateObj[this.dateArr[j]];
            }
            excelExportData.push(data);
        }
        this.excelService.generateExcel(headders, excelExportData, 'resourceUtilizationReport');
    }

    // forward to next section
    private gotoNextPage(e, routeURL) {
        this.router.navigate([routeURL]);
    }

    // logout and forward to login page
    private logout() {
        this.commonService.logout();
    }
}