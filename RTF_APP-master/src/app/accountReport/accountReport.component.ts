import { Component, OnInit, Compiler } from '@angular/core';
import { first, retry } from 'rxjs/operators';
import { Pipe } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from "ng2-bootstrap-modal";
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { AppConfig } from '../util';
import { ExcelService } from '../service/excel.service';
import { CommonService } from '../service/commons-service';
import { Common } from '../util/common';

@Pipe({
    name: 'unique',
    pure: false
})

@Component({
    templateUrl: 'accountReport.component.html?v=${new Date().getTime()}',
    styleUrls: ['accountReport.component.css?v=${new Date().getTime()}']
})
export class AccountReportComponent implements OnInit {
    private users: any = {};
    private loginImageURL: any = "";
    private loginUserName: any = "";
    private accountReportForm: FormGroup;
    private config: any;
    private isEnable: boolean = false;
    private loading: boolean = false;
    private baseURL: any = null;
    private headders: any[] = [];

    private accountReportData: any[] = [];
    private userList: any[] = [];
    private bookingData: any[] = [];
    private accountNames: any[] = [];

    constructor(private dialogService: DialogService,
        private router: Router, private appConfig: AppConfig,
        private commonService: CommonService,
        private common: Common,
        private formBuilder: FormBuilder, config: NgbDatepickerConfig,
        private excelService: ExcelService, private _compiler: Compiler) {
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
        this.headders = ["S.No", "Account Name", "Budgeted Effort (Mandays) - Engineering", "Budgeted Effort (Mandays) - Production", "Total (Mandays)"];
    }

    ngOnInit() {
        this.accountReportForm = new FormGroup({
            startDate: new FormControl(),
            endDate: new FormControl()
        });
        this.accountReportForm = this.formBuilder.group({
            startDate: [null, Validators.required],
            endDate: [null, Validators.required]
        });
        this.getAllUserList();
    }

    //get all user list
    private getAllUserList() {
        this.loading = true;
        this.commonService.getAllUserList().pipe(first()).subscribe(
            data => {
                if (data && data.length > 0) {
                    this.userList = data;
                }
                this.loading = false;
            },
            error => {
                this.loading = false;
                localStorage.setItem('errorMsg', 'Data Not Found');
                this.commonService.showerror();
                return;
            });
    }

    // set start date
    private setStartDate() {
        this.isEnable = false;
        let currentDate = new Date();
        this.config.minDate = { year: currentDate.getFullYear() - 10, month: currentDate.getMonth() + 1, day: currentDate.getDate() };
    }

    //set end date
    private setEndDate() {
        this.isEnable = false;
        if (this.accountReportForm.value.startDate) {
            var dd = this.accountReportForm.value.startDate.day + 1;
            var mm = this.accountReportForm.value.startDate.month;
            var yy = this.accountReportForm.value.startDate.year;
            this.config.minDate = { year: yy, month: mm, day: dd };
        } else {
            localStorage.setItem('errorMsg', 'Please select Start Date');
            this.commonService.showerror();
            return;
        }
    }

    // get all ticktes data
    private getAllCSDs() {
        this.accountReportData = [];
        this.bookingData = [];
        if (this.accountReportForm.invalid) {
            return;
        }
        this.loading = true;
        this.commonService.getAllCSDs(this.common.getDateYYMMDD(this.accountReportForm.value.startDate), this.common.getDateYYMMDD(this.accountReportForm.value.endDate)).pipe(first()).subscribe(
            data => {
                if (data && data.length > 0) {
                    let csdList = [];
                    this.bookingData = data;
                    data.forEach((obj, index) => {
                        if (csdList.indexOf(obj.csdno) == -1) {
                            csdList.push(obj.csdno);
                        }
                    });
                    if (csdList.length > 0) {
                        this.getAllCSDClinetNameFromJIRA(csdList.toString(), data.length);
                    }
                }
                this.loading = false;
            },
            error => {
                this.loading = false;
                localStorage.setItem('errorMsg', 'Data Not Found');
                this.commonService.showerror();
                return;
            });
    }

    //get all ticket clinet name from JIRA
    private getAllCSDClinetNameFromJIRA(csdListString, noOfCSD) {
        this.commonService.getAllCSDClinetNameFromJIRA(csdListString, this.users.username, this.users.password, noOfCSD).pipe(first()).subscribe(
            data => {
                if (data && data.length > 0) {
                    this.accountNames = data;
                    this.filterData();
                }
            },
            error => {
                this.loading = false;
                localStorage.setItem('errorMsg', 'Data Not Found');
                this.commonService.showerror();
                return;
            });
    }

    // filter booking data
    private filterData() {
        this.accountReportData = [];
        let listAddedCSD = [];
        this.bookingData.forEach((data, index) => {
            let enggEffort = 0;
            let prodEffort = 0;
            let accountName = "";
            let found = false;
            if (listAddedCSD.indexOf(data.csdno) == -1) {
                listAddedCSD.push(data.csdno);
                this.bookingData.forEach((subData, subIndex) => {
                    if (data.csdno == subData.csdno) {
                        accountName = this.getAccountName(subData.csdno);
                        let teamName = this.getTeamName(subData.userid);//
                        this.accountReportData.forEach((accountReport, ind) => {
                            if (accountReport.accountName == accountName) {
                                if (teamName.trim().toLowerCase() == "engineering") {
                                    this.accountReportData[ind].enggEffort = (Number(accountReport.enggEffort) + Number(subData.assignhours)).toFixed(2);
                                }
                                if (teamName.trim().toLowerCase() == "production") {
                                    this.accountReportData[ind].prodEffort = (Number(accountReport.prodEffort) + Number(subData.assignhours)).toFixed(2);
                                }
                                found = true;
                            }
                        })
                        if (!found) {
                            if (teamName.trim().toLowerCase() == "engineering") {
                                enggEffort = Number(enggEffort) + Number(subData.assignhours);
                            }
                            if (teamName.trim().toLowerCase() == "production") {
                                prodEffort = Number(prodEffort) + Number(subData.assignhours);
                            }
                            this.accountReportData.push({ accountName: accountName, enggEffort: enggEffort.toFixed(2), prodEffort: prodEffort.toFixed(2) });
                        }
                    }
                });
            }
        });
        this.isEnable = true;
    }

    // get account name from jira object
    private getAccountName(ticketNo) {
        let accountName = "";
        this.accountNames.forEach((obj, index) => {
            if (obj.key == ticketNo && obj.fields.customfield_10600) {
                accountName = obj.fields.customfield_10600.value;
            }
        });
        return accountName;
    }

    // get team name
    private getTeamName(userId) {
        let teamName = "";
        this.userList.forEach((obj, index) => {
            if (obj.user_id == userId) {
                teamName = obj.team;
            }
        });
        return teamName;
    }

    // export data of account report
    private excelReport() {
        let excelExportData = [];
        for (let i = 0; i < this.accountReportData.length; i++) {
            let data = {};
            data[this.headders[0]] = i + 1;
            data[this.headders[1]] = this.accountReportData[i].accountName;
            data[this.headders[2]] = Number(this.accountReportData[i].enggEffort / 8).toFixed(2);
            data[this.headders[3]] = Number(this.accountReportData[i].prodEffort / 8).toFixed(2);

            data[this.headders[4]] = (Number(this.accountReportData[i].enggEffort / 8) + Number(this.accountReportData[i].prodEffort / 8)).toFixed(2);
            excelExportData.push(data);
        }
        this.excelService.generateExcel(this.headders, excelExportData, 'AccountReport');
    }

    // forward to next section
    public gotoNextPage(e, routeURL) {
        this.router.navigate([routeURL]);
    }

    // logout and forward to login page
    private logout() {
        this.commonService.logout();
    }
}