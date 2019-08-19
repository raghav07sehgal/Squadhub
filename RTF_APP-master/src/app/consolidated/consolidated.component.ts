import { Component, OnInit, Compiler } from '@angular/core';
import { Pipe } from '@angular/core';
import { first, retry } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CommonService } from '../service/commons-service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { Http } from '@angular/http';
import { DialogService } from "ng2-bootstrap-modal";
import { Common } from '../util/common';
import { AppConfig } from '../util';
import { ExcelService } from '../service/excel.service';

@Pipe({
    name: 'unique',
    pure: false
})

@Component({
    templateUrl: 'consolidated.component.html?v=${new Date().getTime()}',
    styleUrls: ['consolidated.component.css?v=${new Date().getTime()}']
})
export class ConsolidatedComponent implements OnInit {
    private baseURL: any = null;
    private currentUser: any[] = [];
    private loading = false;
    private config: any;
    private sDate: any = "";
    private eDate: any = "";
    private filterName: any = "";
    private cepReportForm: FormGroup;
    private excelExportData: any = [];
    private users: any = {};
    private loginImageURL: any = "";
    private loginUserName: any = "";
    private status: any = 0;
    private isEnable: boolean = false;
    private headders = ["S.No.", "Project Manager", "Delivery Manager", "Manager Name", "Project Name",
        "Client Name", "RAG Status", "Project Key", "Issue Type",
        "Studio", "Created Date", "Status", "Linked Issue",
        "Sub-Task", "Sub-Task Type", "Sub-Task Detail", "Planned Start Date",
        "Planned End Date", "Resource Name",
        "Budgeted Hours (Hrs)", "Budgeted Effort (Hrs) - Engineering",
        "Budgeted Effort (Hrs) - Production", "User Estimation",
        "User Logged Effort", "User Remaining Effort",
        "User Logged Effort Hours", "User Logged Effort Date",
        "Requested Start Date", "Requested Completion Date", "Change Request Hours"
    ];

    constructor(private dialogService: DialogService,
        private router: Router,
        private commonService: CommonService,
        private common: Common,
        config: NgbDatepickerConfig, private formBuilder: FormBuilder, private http: Http, appConfig: AppConfig, private excelService: ExcelService, private _compiler: Compiler) {
        this._compiler.clearCache();
        this.users = JSON.parse(localStorage.getItem('user'));
        if (!this.users || !this.users.userData) {
            this.commonService.logout();
            return;
        }
        this.currentUser = JSON.parse(localStorage.getItem('cepData'));
        this.config = config;
        this.baseURL = appConfig.getServerURL();


        if (this.users && this.users.userData) {
            this.loginImageURL = this.users.userData.avatarUrls['48x48'];
            this.loginUserName = this.users.userData.key;
        }

        let currentDate = new Date();
        this.config.minDate = { year: currentDate.getFullYear() - 19, month: currentDate.getMonth() + 1, day: currentDate.getDate() };
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
    }

    // get data from jira and generate report
    private generateCEPReport() {
        this.status = 0;
        this.getProgressStatus();
        this.currentUser = null;
        localStorage.removeItem('cepData');
        this.setStartAndEndDate();
        this.loading = true;
        var user = JSON.parse(localStorage.getItem('user'));
        this.commonService.getCEPReport(user.username, user.password, this.sDate, this.eDate, this.filterName)
            .pipe(first())
            .subscribe(
                data => {
                    if (data && data != null) {
                        this.currentUser = data[0].cepFilteredIssues;
                        this.isEnable = true;
                        this.loading = false;
                    } else {
                        localStorage.setItem('errorMsg', 'Bad Credential');
                        this.commonService.showerror();
                        this.loading = false;
                    }
                });
    }

    //set start date
    private setStartDate() {
        let currentDate = new Date();
        this.config.minDate = { year: currentDate.getFullYear() - 19, month: currentDate.getMonth() + 1, day: currentDate.getDate() };
        this.config.markDisabled = false;
    }

    //set end date
    private setEndDate() {
        if (this.cepReportForm.value.startDate) {
            var dd = this.cepReportForm.value.startDate.day;
            var mm = this.cepReportForm.value.startDate.month;
            var yy = this.cepReportForm.value.startDate.year;
            this.config.minDate = { year: yy, month: mm, day: dd };
            this.cepReportForm.value.endDate = '';
        } else {
            localStorage.setItem('errorMsg', 'Please select Start Date');
            this.commonService.showerror();
            return;
        }
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

    //excel export consolidate data
    private excelReport() {
        if (!this.currentUser) {
            localStorage.setItem('errorMsg', 'Please Generate CEP Report First');
            this.commonService.showerror();
            return;
        }
        this.createExcelData(this.headders);
        this.excelService.generateExcel(this.headders, this.excelExportData, 'CEP_Report');
    }

    // prepare data for excel export consolidate data
    private createExcelData(headders) {
        this.excelExportData = [];
        for (let i = 0; i < this.currentUser.length; i++) {
            if (this.currentUser[i].fields.subtasks && this.currentUser[i].fields.subtasks.length > 0) {
                for (let j = 0; j < this.currentUser[i].fields.subtasks.length; j++) {
                    var data = {};
                    data[headders[0]] = i + 1;
                    data[headders[1]] = !this.currentUser[i].fields.customfield_10217 ? '' : this.currentUser[i].fields.customfield_10217;
                    data[headders[2]] = !this.currentUser[i].fields.customfield_10218 ? '' : this.currentUser[i].fields.customfield_10218;
                    data[headders[3]] = !this.currentUser[i].fields.assignee ? '' : this.currentUser[i].fields.assignee.displayName;
                    data[headders[4]] = !this.currentUser[i].fields.customfield_10201 ? '' : this.currentUser[i].fields.customfield_10201;
                    data[headders[5]] = !this.currentUser[i].fields.customfield_10600 ? '' : this.currentUser[i].fields.customfield_10600.value;
                    data[headders[6]] = !this.currentUser[i].fields.customfield_11000 ? '' : this.currentUser[i].fields.customfield_11000.value;
                    data[headders[7]] = !this.currentUser[i].key ? '' : this.currentUser[i].key;
                    data[headders[8]] = !this.currentUser[i].fields.issuetype ? '' : this.currentUser[i].fields.issuetype.name;
                    data[headders[9]] = !this.currentUser[i].fields.customfield_10219 ? '' : this.currentUser[i].fields.customfield_10219.value;
                    var date = new Date(this.currentUser[i].fields.created);
                    data[headders[10]] = date.getFullYear() + "-" + Number(date.getMonth() + 1) + "-" + date.getDate();
                    data[headders[11]] = !this.currentUser[i].fields.status ? '' : this.currentUser[i].fields.status.name;
                    data[headders[12]] = !this.currentUser[i].fields.issuelinks ? '' : !this.currentUser[i].fields.issuelinks[0] ? '' : !this.currentUser[i].fields.issuelinks[0].outwardIssue ? '' : this.currentUser[i].fields.issuelinks[0].outwardIssue.key;
                    data[headders[13]] = !this.currentUser[i].fields.subtasks[j].key ? '' : this.currentUser[i].fields.subtasks[j].key;
                    data[headders[14]] = !this.currentUser[i].fields.subtasks[j].issuetype ? '' : this.currentUser[i].fields.subtasks[j].issuetype.name;
                    data[headders[15]] = !this.currentUser[i].fields.subtasks[j].summary ? '' : this.currentUser[i].fields.subtasks[j].summary;
                    data[headders[16]] = !this.currentUser[i].fields.subtasks[j].plannedStartDate ? '' : this.currentUser[i].fields.subtasks[j].plannedStartDate;
                    data[headders[17]] = !this.currentUser[i].fields.subtasks[j].plannedEndDate ? '' : this.currentUser[i].fields.subtasks[j].plannedEndDate;
                    data[headders[18]] = !this.currentUser[i].fields.subtasks[j].displayName ? '' : this.currentUser[i].fields.subtasks[j].displayName;
                    let budgetedHours = this.currentUser[i].fields.customfield_10244;
                    if (this.currentUser[i].fields.customfield_10863 && Number(this.currentUser[i].fields.customfield_10863) > 0) {
                        budgetedHours = Number(budgetedHours) + Number(this.currentUser[i].fields.customfield_10863);
                    }
                    if (this.currentUser[i].fields.customfield_10864 && Number(this.currentUser[i].fields.customfield_10864) > 0) {
                        budgetedHours = Number(budgetedHours) + Number(this.currentUser[i].fields.customfield_10864);
                    }
                    if (this.currentUser[i].fields.customfield_11700 && Number(this.currentUser[i].fields.customfield_11700) > 0) {
                        budgetedHours = Number(budgetedHours) + Number(this.currentUser[i].fields.customfield_11700);
                    }
                    data[headders[19]] = (budgetedHours);
                    data[headders[20]] = !this.currentUser[i].fields.customfield_10863 ? '' : this.currentUser[i].fields.customfield_10863;
                    data[headders[21]] = !this.currentUser[i].fields.customfield_10864 ? '' : this.currentUser[i].fields.customfield_10864;
                    data[headders[22]] = !this.currentUser[i].fields.subtasks[j].timetracking ? '' : !this.currentUser[i].fields.subtasks[j].timetracking.originalEstimate ? '' : this.currentUser[i].fields.subtasks[j].timetracking.originalEstimate;
                    data[headders[23]] = !this.currentUser[i].fields.subtasks[j].timetracking ? '' : !this.currentUser[i].fields.subtasks[j].timetracking.timeSpent ? '' : this.currentUser[i].fields.subtasks[j].timetracking.timeSpent;
                    data[headders[24]] = !this.currentUser[i].fields.subtasks[j].timetracking ? '' : !this.currentUser[i].fields.subtasks[j].timetracking.remainingEstimate ? '' : this.currentUser[i].fields.subtasks[j].timetracking.remainingEstimate;
                    data[headders[25]] = !this.currentUser[i].fields.subtasks[j].worklog ? '' : !this.currentUser[i].fields.subtasks[j].worklog.worklogs.timeSpent ? '' : this.currentUser[i].fields.subtasks[j].worklog.worklogs.timeSpent;
                    data[headders[26]] = !this.currentUser[i].fields.subtasks[j].worklog ? '' : !this.currentUser[i].fields.subtasks[j].worklog.worklogs.created ? '' : this.currentUser[i].fields.subtasks[j].worklog.worklogs.created;
                    data[headders[27]] = !this.currentUser[i].fields.customfield_10225 ? '' : this.currentUser[i].fields.customfield_10225;
                    data[headders[28]] = !this.currentUser[i].fields.customfield_10226 ? '' : this.currentUser[i].fields.customfield_10226;
                    data[headders[29]] = !this.currentUser[i].fields.customfield_11700 ? '' : this.currentUser[i].fields.customfield_11700;
                    this.excelExportData.push(data);
                }
            } else {
                var data = {};
                data[headders[0]] = i + 1;
                data[headders[1]] = !this.currentUser[i].fields.customfield_10217 ? '' : this.currentUser[i].fields.customfield_10217;
                data[headders[2]] = !this.currentUser[i].fields.customfield_10218 ? '' : this.currentUser[i].fields.customfield_10218;
                data[headders[3]] = !this.currentUser[i].fields.assignee ? '' : this.currentUser[i].fields.assignee.displayName;
                data[headders[4]] = !this.currentUser[i].fields.customfield_10201 ? '' : this.currentUser[i].fields.customfield_10201;
                data[headders[5]] = !this.currentUser[i].fields.customfield_10600 ? '' : this.currentUser[i].fields.customfield_10600.value;
                data[headders[6]] = !this.currentUser[i].fields.customfield_11000 ? '' : this.currentUser[i].fields.customfield_11000.value;
                data[headders[7]] = !this.currentUser[i].key ? '' : this.currentUser[i].key;
                data[headders[8]] = !this.currentUser[i].fields.issuetype ? '' : this.currentUser[i].fields.issuetype.name;
                data[headders[9]] = !this.currentUser[i].fields.customfield_10219 ? '' : this.currentUser[i].fields.customfield_10219.value;
                var date = new Date(this.currentUser[i].fields.created);
                data[headders[10]] = date.getFullYear() + "-" + Number(date.getMonth() + 1) + "-" + date.getDate();
                data[headders[11]] = !this.currentUser[i].fields.status ? '' : this.currentUser[i].fields.status.name;
                data[headders[12]] = !this.currentUser[i].fields.issuelinks ? '' : !this.currentUser[i].fields.issuelinks[0] ? '' : !this.currentUser[i].fields.issuelinks[0].outwardIssue ? '' : this.currentUser[i].fields.issuelinks[0].outwardIssue.key;
                data[headders[13]] = "";
                data[headders[14]] = "";
                data[headders[15]] = "";
                data[headders[16]] = "";
                data[headders[17]] = "";
                data[headders[18]] = "";
                let budgetedHours = this.currentUser[i].fields.customfield_10244;
                if (this.currentUser[i].fields.customfield_10863 && Number(this.currentUser[i].fields.customfield_10863) > 0) {
                    budgetedHours = Number(budgetedHours) + Number(this.currentUser[i].fields.customfield_10863);
                }
                if (this.currentUser[i].fields.customfield_10864 && Number(this.currentUser[i].fields.customfield_10864) > 0) {
                    budgetedHours = Number(budgetedHours) + Number(this.currentUser[i].fields.customfield_10864);
                }
                if (this.currentUser[i].fields.customfield_11700 && Number(this.currentUser[i].fields.customfield_11700) > 0) {
                    budgetedHours = Number(budgetedHours) + Number(this.currentUser[i].fields.customfield_11700);
                }
                data[headders[19]] = (budgetedHours);
                data[headders[20]] = !this.currentUser[i].fields.customfield_10863 ? '' : this.currentUser[i].fields.customfield_10863;
                data[headders[21]] = !this.currentUser[i].fields.customfield_10864 ? '' : this.currentUser[i].fields.customfield_10864;
                data[headders[22]] = "";
                data[headders[23]] = "";
                data[headders[24]] = "";
                data[headders[25]] = "";
                data[headders[26]] = "";
                data[headders[27]] = !this.currentUser[i].fields.customfield_10225 ? '' : this.currentUser[i].fields.customfield_10225;
                data[headders[28]] = !this.currentUser[i].fields.customfield_10226 ? '' : this.currentUser[i].fields.customfield_10226;
                data[headders[29]] = !this.currentUser[i].fields.customfield_11700 ? '' : this.currentUser[i].fields.customfield_11700;
                this.excelExportData.push(data);
            }
        }
    }

    // show current status of completion task
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

    //forward to next section page
    public gotoNextPage(e, routeURL) {
        this.router.navigate([routeURL]);
    }

    // logout and forward to login page
    private logout() {
        this.commonService.logout();
    }

}