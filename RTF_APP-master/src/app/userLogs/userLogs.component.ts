import { Component, OnInit, Compiler } from '@angular/core';
import { Pipe } from '@angular/core';
import { first, retry } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CommonService } from '../service/commons-service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { Http } from '@angular/http';
import { AppConfig } from '../util';
import { ExcelService } from '../service/excel.service';
import { Common } from '../util/common';

//addedby raghav
@Component({
    templateUrl: 'userLogs.component.html?v=${new Date().getTime()}',
    styleUrls: ['userLogs.component.css?v=${new Date().getTime()}']
})

@Pipe({
    name: 'unique',
    pure: false
})

@Component({ templateUrl: 'userLogs.component.html' })
export class UserLogsComponent implements OnInit {
    private baseURL: any = null;
    private currentUser: any[] = [];
    private loading = false;
    private config: any;
    private sDate: any = "";
    private eDate: any = "";
    private filterName: any = "";
    private cepReportForm: FormGroup;
    private excelExportData: any = [];
    private numberOfPage: number = 0;
    private calenderArray: any[] = [];
    private userArray: any[] = [];
    private totalDataArr: any[] = [];
    private users: any = {};
    private loginImageURL: any = "";
    private loginUserName: any = "";
    private status: any = 0;
    private isEnable: boolean = false;
    private dropdownList = [];
    private selectedItems = [];
    private dropdownSettings = {};
    private headders = ["S.No.", "Project Manager", "Delivery Manager", "Project Name", "Project Key", "Client Name", "Created Date",
        "Studio", "Issue Type", "Status", "Linked Issue", "Sub-Task", "Sub-Task Type", "Sub-Task Detail",
        "Planned Start Date", "Planned End Date", "Actual Start Date", "Actual End Date", "Resource Name",
        "Budgeted Effort (Hrs)", "Budgeted Effort (Hrs) - Engineering", "Budgeted Effort (Hrs) - Production",
        "Estimated hours", "User Logged Effort Hours", "User Logged Effort Date"
    ];
    private tableHeadder = [
        { isHide: true, value: "S.No." },
        { isHide: true, value: "Project Manager" },
        { isHide: true, value: "Delivery Manager" },
        { isHide: true, value: "Project Name" },
        { isHide: true, value: "Project Key" },
        { isHide: true, value: "Client Name" },
        { isHide: true, value: "Created Date" },
        { isHide: true, value: "Studio" },
        { isHide: true, value: "Issue Type" },
        { isHide: true, value: "Status" },
        { isHide: true, value: "Linked Issue" },
        { isHide: true, value: "Sub-Task" },
        { isHide: true, value: "Sub-Task Type" },
        { isHide: true, value: "Sub-Task Detail" },
        { isHide: true, value: "Planned Start Date" },
        { isHide: true, value: "Planned End Date" },
        { isHide: true, value: "Actual Start Date" },
        { isHide: true, value: "Actual End Date" },
        { isHide: true, value: "Resource Name" },
        { isHide: true, value: "Budgeted Effort (Hrs)" },
        { isHide: true, value: "Budgeted Effort (Hrs)-Engineering" },
        { isHide: true, value: "Budgeted Effort (Hrs)-Production" },
        { isHide: true, value: "Estimated hours" },
        { isHide: true, value: "User Logged Effort Hours" },
        { isHide: true, value: "User Logged Effort Date" }
    ];

    private tableOptions = [{ columnId: "SNo.", columnName: "S.No." },
    { columnId: "projectName", columnName: "Project Name" },
    { columnId: "projectKey", columnName: "Project Key" },
    { columnId: "clientName", columnName: "Client Name" },
    { columnId: "createdDate", columnName: "Created Date" },
    { columnId: "studio", columnName: "Studio" },
    { columnId: "issueType", columnName: "Issue Type" },
    { columnId: "status", columnName: "Status" },
    { columnId: "linkedIssue", columnName: "Linked Issue" },
    { columnId: "subTask", columnName: "Sub-Task" },
    { columnId: "subTaskType", columnName: "Sub-Task Type" },
    { columnId: "subTaskDetail", columnName: "Sub-Task Detail" },
    { columnId: "plannedStartDate", columnName: "Planned Start Date" },
    { columnId: "plannedEndDate", columnName: "Planned End Date" },
    { columnId: "actualStartDate", columnName: "Actual Start Date" },
    { columnId: "actualEndDate", columnName: "Actual End Date" },
    { columnId: "resourceName", columnName: "Resource Name" },
    { columnId: "budgetedEffort(Hrs)", columnName: "Budgeted Effort (Hrs)" },
    { columnId: "budgetedEffort(Hrs)-Engineering", columnName: "Budgeted Effort (Hrs)-Engineering" },
    { columnId: "budgetedEffort(Hrs)-Production", columnName: "Budgeted Effort (Hrs)-Production" },
    { columnId: "estimatedhours", columnName: "Estimated hours" },
    { columnId: "userLoggedEffortHours", columnName: "User Logged Effort Hours" },
    { columnId: "userLoggedEffortDate", columnName: "User Logged Effort Date" }];

    constructor(private http: Http,
        private router: Router,
        private commonService: CommonService,
        private excelService: ExcelService,
        private common: Common,
        config: NgbDatepickerConfig, private _compiler: Compiler,
        private formBuilder: FormBuilder, appConfig: AppConfig) {
        this._compiler.clearCache();
        this.users = JSON.parse(localStorage.getItem('user'));
        if (!this.users || !this.users.userData) {
            this.commonService.logout();
            return;
        }
        this.baseURL = appConfig.getServerURL();
        this.currentUser = [];
        this.numberOfPage = 15;
        this.config = config;
        if (this.users && this.users.userData) {
            this.loginImageURL = this.users.userData.avatarUrls['48x48'];
            this.loginUserName = this.users.userData.key;
        }
        let currentDate = new Date();
        this.config.minDate = { year: 1950, month: 1, day: 1 };
        this.config.maxDate = { year: currentDate.getFullYear(), month: currentDate.getMonth(), day: currentDate.getDate() };
        this.config.markDisabled = false;
    }

    ngOnInit() {
        this.cepReportForm = new FormGroup({
            filterName: new FormControl(),
            startDate: new FormControl(),
            endDate: new FormControl(),
        });
        this.cepReportForm = this.formBuilder.group({
            filterName: [null, Validators.required],
            startDate: [null, Validators.required],
            endDate: [null, Validators.required],
        });

        this.dropdownList = this.tableOptions;
        this.selectedItems = [];
        this.dropdownSettings = {
            singleSelection: false,
            idField: 'columnId',
            textField: 'columnName',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableCheckAll: false,
            itemsShowLimit: 3,
            allowSearchFilter: true
        };
    }
    
    // get total days in a month
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

    // get all the user logs from jira based on start and end date
    private generateUserLogseport() {
        if (!this.currentUser || this.currentUser.length > 0) {
            return;
        }
        this.status = 0;
        this.getProgressStatus();
        this.currentUser = null;
        this.setStartAndEndDate();
        this.loading = true;
        let filterString = this.filterName;
        if (filterString == "createdDate") {
            filterString = "updatedDate";
        }
        var user = JSON.parse(localStorage.getItem('user'));
        this.commonService.getuserLogsReport(user.username, user.password, this.sDate, this.eDate, filterString)
            .pipe(first())
            .subscribe(
                res => {
                    if (res && res.data != null) {
                        this.currentUser = res.data[0].userLogsData;
                        this.isEnable = true;
                        this.loading = false;
                        this.calculateUserWorkLogsData()
                    } else {
                        localStorage.setItem('errorMsg', 'Bad Credential');
                        this.commonService.showerror();
                        this.loading = false;
                    }
                },
                error => {
                    this.loading = false;
                    localStorage.setItem('errorMsg', 'Bad Credential');
                    this.commonService.showerror();
                });
    }

    //set start date
    private setStartDate() {
        let currentDate = new Date();
        this.config.minDate = { year: currentDate.getFullYear() - 19, month: currentDate.getMonth() + 1, day: currentDate.getDate() };
        this.config.maxDate = { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1, day: currentDate.getDate() };
    }

    //set end date
    private setEndDate() {
        if (this.cepReportForm.value.startDate) {
            var dd = this.cepReportForm.value.startDate.day;
            var mm = this.cepReportForm.value.startDate.month;
            var yy = this.cepReportForm.value.startDate.year;
            this.config.minDate = { year: yy, month: mm, day: dd };
        } else {
            localStorage.setItem('errorMsg', 'Please select Start Date');
            this.commonService.showerror();
            return;
        }
    }

    //filter and calculate user work logs data
    private calculateUserWorkLogsData() {
        var monthDates = [];
        if (this.cepReportForm.value.startDate && this.cepReportForm.value.endDate) {
            let fromDate = this.cepReportForm.value.startDate;
            let toDate = this.cepReportForm.value.endDate;
            fromDate = fromDate.year + "-" + fromDate.month + "-" + fromDate.day;
            toDate = toDate.year + "-" + toDate.month + "-" + toDate.day;
            if (fromDate && toDate) {
                this.calenderArray = this.getDateArray(new Date(fromDate), new Date(toDate));
                for (let k = 0; k < this.calenderArray.length; k++) {
                    monthDates.push({ numberOfHours: this.calenderArray[k] });
                }
            }
            this.userArray = [];
            this.totalDataArr = [];
            let calData = [];
            for (let i = 0; i < this.currentUser.length; i++) {
                let subtasks = this.currentUser[i][0].fields.subtasks;
                for (let j = 0; j < subtasks.length; j++) {
                    let worklogs = this.currentUser[i][0].fields.subtasks[j].worklog.worklogs;
                    for (let k = 0; k < worklogs.length; k++) {
                        let date = new Date(worklogs[k].started);
                        let fdate: any = date.getDate();
                        if (fdate < 10) {
                            fdate = "0" + fdate;
                        }
                        fdate = fdate + "-" + this.common.month[date.getMonth()];
                        if (this.userArray.length == 0 || this.userArray.indexOf(worklogs[k].author.displayName) == -1) {
                            this.userArray.push(worklogs[k].author.displayName);
                        }
                        let indexNo = -1;
                        if (calData.length > 0) {
                            calData.forEach((item, index) => {
                                if (item.nameOfDays == fdate && item.userName == worklogs[k].author.displayName) {
                                    indexNo = index;
                                    return;
                                }
                            })
                        }
                        if (indexNo >= 0) {
                            if (calData[indexNo].numberOfHours) {
                                calData[indexNo].numberOfHours = Number(calData[indexNo].numberOfHours) + Number(worklogs[k].timeSpent);
                            } else {
                                calData[indexNo].numberOfHours = Number(calData[j].numberOfHours);
                            }
                        } else {
                            calData.push({ nameOfDays: fdate, userName: worklogs[k].author.displayName, numberOfHours: worklogs[k].timeSpent });
                        }
                    }
                }
            }
            for (let i = 0; i < this.userArray.length; i++) {
                let fData: any = [];
                for (let j = 0; j < calData.length; j++) {
                    var indexNo = -1;
                    for (let k = 0; k < this.calenderArray.length; k++) {
                        if (this.userArray[i] == calData[j].userName) {
                            if (calData[j].nameOfDays == this.calenderArray[k]) {
                                if (fData.length > 0) {
                                    fData.forEach((item, index) => {
                                        if (calData[j].nameOfDays == item.nameOfDays) {
                                            indexNo = index;
                                        }
                                    })
                                }
                                if (indexNo >= 0) {
                                    fData[indexNo].numberOfHours = Number(calData[j].numberOfHours);
                                } else if (fData.length < this.calenderArray.length) {
                                    fData.push({ nameOfDays: calData[j].nameOfDays, numberOfHours: calData[j].numberOfHours });
                                }
                            } else if (fData.length < this.calenderArray.length) {
                                fData.push({ nameOfDays: this.calenderArray[k], numberOfHours: 0 });
                            }
                        }
                    }
                }
                this.totalDataArr.push({ userName: this.userArray[i], hoursArray: fData });
            }
        }
    }

    //get dates array from start and end date
    private getDateArray(start: any, end: any) {
        var arr = new Array();
        var dt = new Date(start);
        while (dt <= end) {
            var date = new Date(dt)
            var day = '' + date.getDate() + '';
            if (date.getDate() < 10) {
                day = '0' + date.getDate()
            }
            arr.push(day + "-" + this.common.month[date.getMonth()]);
            dt.setDate(dt.getDate() + 1);
        }
        return arr;
    }

    //set start and end date
    private setStartAndEndDate() {
        if (this.cepReportForm.value.startDate && this.cepReportForm.value.endDate) {
            var dd = this.cepReportForm.value.startDate.day;
            var mm = this.cepReportForm.value.startDate.month;
            var yy = this.cepReportForm.value.startDate.year;
            this.sDate = yy + "/" + mm + "/" + dd;
            dd = this.cepReportForm.value.endDate.day;
            mm = this.cepReportForm.value.endDate.month;
            yy = this.cepReportForm.value.endDate.year;
            this.eDate = yy + "/" + mm + "/" + dd;
        }
    }

    //set user logs data
    private setUserLogsData() {
        for (var i = 0; i < this.currentUser.length; i++) {
            if (this.currentUser[i].fields.subtasks && this.currentUser[i].fields.subtasks.worklog && this.currentUser[i].fields.subtasks.worklog.worklogs) {
                for (var j = 0; j < this.currentUser[i].fields.subtasks.worklog.worklogs.length; j++) {
                    this.currentUser[i].fields.subtasks["authorName"] = this.currentUser[i].fields.subtasks.worklog.worklogs[j].author.displayName;
                    this.currentUser[i].fields.subtasks["authorName"] = this.currentUser[i].fields.subtasks.worklog.worklogs[j].author.displayName;
                }
            }
        }
    }

    // export project data report
    private excelReport() {
        if (!this.currentUser) {
            localStorage.setItem('errorMsg', 'Please Generate User Logs Report First');
            this.commonService.showerror();
            return;
        }
        this.createExcelData(this.headders);
        this.excelService.generateExcel(this.headders, this.excelExportData, 'user_logs');
    }

    // filter data of excel export of person and project
    private createExcelData(headders) {
        this.excelExportData = [];
        for (let i = 0; i < this.currentUser.length; i++) {
            var data = {}
            let issue = this.currentUser[i][0];
            if (issue.fields.subtasks) {
                for (let j = 0; j < issue.fields.subtasks.length; j++) {
                    data = {};
                    var worklogs = issue.fields.subtasks[j].worklog.worklogs;
                    if (worklogs.length > 0) {
                        for (let k = 0; k < worklogs.length; k++) {
                            data = {};
                            data[headders[0]] = i + 1;
                            data[headders[1]] = !issue.fields.customfield_10217 ? '' : issue.fields.customfield_10217;
                            data[headders[2]] = !issue.fields.customfield_10218 ? '' : issue.fields.customfield_10218;

                            data[headders[3]] = !issue.fields.customfield_10201 ? '' : issue.fields.customfield_10201;
                            data[headders[4]] = !issue.fields.subtasks[j].csdNo ? '' : issue.fields.subtasks[j].csdNo;

                            data[headders[5]] = !issue.fields.customfield_10600 ? '' : !issue.fields.customfield_10600.value ? '' : issue.fields.customfield_10600.value;

                            if (issue.fields.created) {
                                let date = new Date(issue.fields.created);
                                issue.fields.created = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
                            }
                            data[headders[6]] = !issue.fields.created ? '' : issue.fields.created;
                            data[headders[7]] = !issue.fields.customfield_10219 ? '' : !issue.fields.customfield_10219 ? '' : issue.fields.customfield_10219.value;

                            data[headders[8]] = !issue.fields.issuetype ? '' : issue.fields.issuetype.name;
                            data[headders[9]] = !issue.fields.status ? '' : issue.fields.status.name;
                            data[headders[10]] = !issue.key ? '' : issue.key;
                            data[headders[11]] = !issue.fields.subtasks[j].key ? '' : issue.fields.subtasks[j].key;

                            data[headders[12]] = !issue.fields.subtasks[j].issuetype ? '' : issue.fields.subtasks[j].issuetype.name;
                            data[headders[13]] = !issue.fields.subtasks[j].summary ? '' : issue.fields.subtasks[j].summary;
                            if (issue.fields.subtasks[j].plannedStartDate) {
                                let date = new Date(issue.fields.subtasks[j].plannedStartDate);
                                issue.fields.subtasks[j].plannedStartDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
                            }
                            data[headders[14]] = !issue.fields.subtasks[j].plannedStartDate ? '' : issue.fields.subtasks[j].plannedStartDate;
                            if (issue.fields.subtasks[j].plannedEndDate) {
                                let date = new Date(issue.fields.subtasks[j].plannedEndDate);
                                issue.fields.subtasks[j].plannedEndDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
                            }
                            data[headders[15]] = !issue.fields.subtasks[j].plannedEndDate ? '' : issue.fields.subtasks[j].plannedEndDate;

                            if (issue.fields.subtasks[j].actualStartDate) {
                                let date = new Date(issue.fields.subtasks[j].actualStartDate);
                                issue.fields.subtasks[j].actualStartDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
                            }

                            data[headders[16]] = !issue.fields.subtasks[j].actualStartDate ? '' : issue.fields.subtasks[j].actualStartDate;

                            if (issue.fields.subtasks[j].actualEndDate) {
                                let date = new Date(issue.fields.subtasks[j].actualEndDate);
                                issue.fields.subtasks[j].actualEndDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
                            }

                            data[headders[17]] = !issue.fields.subtasks[j].actualEndDate ? '' : issue.fields.subtasks[j].actualEndDate;
                            data[headders[18]] = !worklogs[k] ? '' : !worklogs[k].author ? '' : worklogs[k].author.displayName;

                            let budgetedHours = issue.fields.subtasks[j].budgetedEffort;
                            if (issue.fields.subtasks[j].budgetedEffortEngg && Number(issue.fields.subtasks[j].budgetedEffortEngg) > 0) {
                                budgetedHours = Number(budgetedHours) + Number(issue.fields.subtasks[j].budgetedEffortEngg);
                            }
                            if (issue.fields.subtasks[j].budgetedEffortProd && Number(issue.fields.subtasks[j].budgetedEffortProd) > 0) {
                                budgetedHours = Number(budgetedHours) + Number(issue.fields.subtasks[j].budgetedEffortProd);
                            }
                            data[headders[19]] = budgetedHours;
                            data[headders[20]] = !issue.fields.subtasks[j].budgetedEffortEngg ? 0 : issue.fields.subtasks[j].budgetedEffortEngg;
                            data[headders[21]] = !issue.fields.subtasks[j].budgetedEffortProd ? 0 : issue.fields.subtasks[j].budgetedEffortProd;

                            data[headders[22]] = !issue.fields.subtasks[j].aggregatetimeoriginalestimate ? 0 : issue.fields.subtasks[j].aggregatetimeoriginalestimate;


                            data[headders[23]] = !worklogs[k] ? '' : !worklogs[k].timeSpent ? '' : worklogs[k].timeSpent;
                            if (worklogs[k].started) {
                                var date = new Date(worklogs[k].started);
                                worklogs[k].started = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
                            }
                            data[headders[24]] = !worklogs[k] ? '' : !worklogs[k].started ? '' : worklogs[k].started;
                            this.excelExportData.push(data);
                        }
                    }
                }
            }
        }
    }
    // show the progress of current task completion
    private getProgressStatus() {
        let setTimeOut = 2000;
        setTimeout(() => {
            this.http.get(this.baseURL + 'status').pipe(retry(500))
                .subscribe(data => {
                    this.status = data.text();
                    if (this.status < 100 && this.status != NaN) {
                        this.getProgressStatus();
                    }
                    if (this.status >= 100) {
                        setTimeOut = -1;
                        return;
                    }
                }
                );
        }, setTimeOut);
    }

    // get the person data report
    private personExcelReport() {
        let headders = ["S.No", "Resource Name"];
        let excelExportData = [];
        for (let i = 0; i < this.calenderArray.length; i++) {
            headders.push(this.calenderArray[i]);
        }
        for (let i = 0; i < this.totalDataArr.length; i++) {
            let data = {};
            data["S.No"] = i + 1;
            data["Resource Name"] = this.totalDataArr[i].userName;
            for (let j = 0; j < this.calenderArray.length; j++) {
                data[this.calenderArray[j]] = this.totalDataArr[i].hoursArray[j].numberOfHours;
            }
            excelExportData.push(data);
        }
        this.excelService.generateExcel(headders, excelExportData, 'Person_Data');
    }

    // get the indexof the column and hide/show
    private onItemSelect(item: any) {
        let columnIndex = -1;
        this.tableHeadder.forEach((column, index) => {
            if (column.value == item.columnName) {
                columnIndex = index;
            }
        });
        if (columnIndex != -1) {
            this.tableHeadder[columnIndex].isHide = false;
        }
    }

    // select all the column on single click
    private onSelectAll(items: any) {
        items.forEach((item, i) => {
            let columnIndex = -1;
            this.tableHeadder.forEach((column, index) => {
                if (column.value == item.columnName) {
                    columnIndex = index;
                }
            });
            if (columnIndex != -1) {
                this.tableHeadder[columnIndex].isHide = true;
            }
        });
    }

    // get the indexof the column and hide/show
    private onItemDeSelect(item: any) {
        let columnIndex = -1;
        this.tableHeadder.forEach((column, index) => {
            if (column.value == item.columnName) {
                columnIndex = index;
            }
        });
        if (columnIndex != -1) {
            this.tableHeadder[columnIndex].isHide = true;
        }
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