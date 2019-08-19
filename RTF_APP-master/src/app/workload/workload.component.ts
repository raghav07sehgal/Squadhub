import { Compiler, Component, OnInit, Pipe } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { first } from 'rxjs/operators';
import { CommonService } from '../service/commons-service';
import { ExcelService } from '../service/excel.service';
import { Common } from '../util/common';

@Pipe({
    name: 'unique',
    pure: false
})

@Component({
    templateUrl: 'workload.component.html?v=${new Date().getTime()}',
    styleUrls: ['workload.component.css?v=${new Date().getTime()}']
})
export class WorkloadComponent implements OnInit {
    private currentUser: any[] = [];
    private userData: any[] = [];
    private loading = false;
    private finalMonthDates: any[] = [];
    private calculatedData: any[] = [];
    private finalCalculatedData: any[] = [];

    private users: any = {};
    private loginImageURL: any = "";
    private loginUserName: any = "";
    private workLoadForm: FormGroup;
    private config: any;
    private isEnable: boolean = false;
    private startDate: any = "";

    constructor(private router: Router, private _compiler: Compiler,
        private commonService: CommonService,
        private formBuilder: FormBuilder,
        private common: Common,
        config: NgbDatepickerConfig,
        private excelService: ExcelService) {
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
    }

    ngOnInit() {
        this.workLoadForm = new FormGroup({
            startDate: new FormControl(),
            endDate: new FormControl()
        });
        this.workLoadForm = this.formBuilder.group({
            startDate: [null, Validators.required],
            endDate: [null, Validators.required]
        });
    }

    // get all list of days in a month
    private daysInThisMonth(month: string) {
        var now = new Date();
        if (month == 'previous') {
            var previousMonth = new Date(now);
            previousMonth.setMonth(now.getMonth() - 1);
            return new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0).getDate();
        } else if (month == 'current') {
            var nextMonth = new Date(now);
            nextMonth.setMonth(now.getMonth());
            return new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
        } else {
            var nextMonth = new Date(now);
            nextMonth.setMonth(now.getMonth() + 1);
            return new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
        }
    }

    // get all user list
    private getAllUsers(startDate) {
        this.currentUser = [];
        if (this.currentUser == null || this.currentUser.length <= 0) {
            this.loading = true;
            this.commonService.getAllUsers(startDate).pipe(first()).subscribe(
                data => {
                    if (data && data != null) {
                        this.currentUser = data;
                    }
                    this.loading = false;
                },
                error => {
                    this.loading = false;
                    localStorage.setItem('errorMsg', error);
                    this.commonService.showerror();
                    this.loading = false;
                });
        }
    }

    //get work load data
    private getworkLoadData(user) {
        var dd = this.workLoadForm.value.startDate.day;
        var mm = this.workLoadForm.value.startDate.month;
        var yy = this.workLoadForm.value.startDate.year;
        this.getAllUsers(yy + "-" + mm + "-" + dd);
        this.finalMonthDates = [];
        this.finalCalculatedData = [];
        this.loading = true;
        this.commonService.getworkLoadData(user).pipe(first()).subscribe(
            data => {
                this.userData = data;
                this.calculateParcentageData();
                this.loading = false;
            },
            error => {
                this.loading = false;
                localStorage.setItem('errorMsg', error);
                this.commonService.showerror();
            }
        )
    }

    //calculate and get parcentage data
    private calculateParcentageData() {
        this.finalMonthDates = this.calCalender();
        this.calculatedData = [];
        this.finalCalculatedData = [];
        for (let i = 0; i < this.userData.length; i++) {
            let dateArray = this.getDateArray(new Date(this.userData[i].bookingdate), new Date(this.userData[i].bookingdate));
            for (let j = 0; j < dateArray.length; j++) {
                this.calculatedData.push({ userid: this.userData[i].userid, userName: this.userData[i].email, nameOfDays: dateArray[j], parentage: this.userData[i].percentage });
            }
        }
        for (let k = 0; k < this.currentUser.length; k++) {
            let calData: any = [];
            let isAdd: any = true;
            for (let l = 0; l < this.calculatedData.length; l++) {
                var indexNo = -1;
                for (let j = 0; j < this.finalMonthDates.length; j++) {
                    if (this.calculatedData[l].nameOfDays == this.finalMonthDates[j].nameOfDays) {
                        if (this.currentUser[k].user_id == this.calculatedData[l].userid) {
                            if (calData.length > 0) {
                                calData.forEach((item, index) => {
                                    if (this.calculatedData[l].nameOfDays == item.nameOfDays) {
                                        indexNo = index;
                                    }
                                })
                            }
                            if (indexNo >= 0) {
                                if (calData[indexNo].parentage) {
                                    calData[indexNo].parentage = Number(calData[indexNo].parentage) + Number(this.calculatedData[l].parentage);
                                } else {
                                    calData[indexNo].parentage = Number(this.calculatedData[l].parentage);
                                }
                            } else if (calData.length < this.finalMonthDates.length) {
                                calData.push({ nameOfDays: this.calculatedData[l].nameOfDays, parentage: this.calculatedData[l].parentage });
                            }
                        } else if (calData.length < this.finalMonthDates.length) {
                            calData.push({ nameOfDays: this.finalMonthDates[j].nameOfDays, parentage: this.finalMonthDates[j].parentage });
                        }
                    } else if (isAdd && calData.length < this.finalMonthDates.length) {
                        calData.push({ nameOfDays: this.finalMonthDates[j].nameOfDays, parentage: this.finalMonthDates[j].parentage });
                    }
                }
                isAdd = false;
            }
            this.finalCalculatedData.push({ userName: this.currentUser[k], parentageArr: calData });
        }
        this.isEnable = true;
    }

    // get between dates from start and end dates
    private getDateArray(start, end) {
        var arr = new Array();
        var dt = new Date(start);
        while (dt <= end) {
            var date = new Date(dt)
            var day = '' + date.getDate() + '';
            if (date.getDate() < 10) {
                day = '0' + date.getDate()
            }
            if (6 > date.getDay() && date.getDay() != 0) {
                arr.push(day + "-" + this.common.month[date.getMonth()]);
            }
            dt.setDate(dt.getDate() + 1);
        }
        return arr;
    }

    //set start date
    private setStartDate() {
        let currentDate = new Date();
        this.config.minDate = { year: currentDate.getFullYear() - 10, month: currentDate.getMonth() + 1, day: currentDate.getDate() };
    }

    //set end dates
    private setEndDate() {
        if (this.workLoadForm.value.startDate) {
            var dd = this.workLoadForm.value.startDate.day + 1;
            var mm = this.workLoadForm.value.startDate.month;
            var yy = this.workLoadForm.value.startDate.year;
            this.config.minDate = { year: yy, month: mm, day: dd };
        } else {
            localStorage.setItem('errorMsg', 'Please select Start Date');
            this.commonService.showerror();
            return;
        }
    }

    // get between dates from start and end dates
    private calCalender() {
        var monthDates = [];
        let fromeDate = this.workLoadForm.value.startDate;
        fromeDate = fromeDate.year + "-" + fromeDate.month + "-" + fromeDate.day;
        let toDate = this.workLoadForm.value.endDate;
        toDate = toDate.year + "-" + toDate.month + "-" + toDate.day;
        if (fromeDate && toDate) {
            let dateArray = this.getDateArray(new Date(fromeDate), new Date(toDate));
            for (let k = 0; k < dateArray.length; k++) {
                monthDates.push({ nameOfDays: dateArray[k], parentage: 0 });
            }
        }
        return monthDates;
    }

    // excel export workload report data
    private excelReport() {
        let headders = ["S.No", "Resource Name"];
        let excelExportData = [];
        for (let i = 0; i < this.finalMonthDates.length; i++) {
            headders.push(this.finalMonthDates[i].nameOfDays);
        }
        for (let i = 0; i < this.finalCalculatedData.length; i++) {
            let data = {};
            data["S.No"] = i + 1;
            data["Resource Name"] = this.finalCalculatedData[i].userName.user_name;
            for (let j = 0; j < this.finalMonthDates.length; j++) {
                data[this.finalMonthDates[j].nameOfDays] = this.finalCalculatedData[i].parentageArr[j].parentage + "%";
            }
            excelExportData.push(data);
        }
        this.excelService.generateExcel(headders, excelExportData, 'Workload');
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