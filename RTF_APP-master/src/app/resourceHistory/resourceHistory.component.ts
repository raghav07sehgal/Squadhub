import { Component, OnInit, Compiler } from '@angular/core';
import { first, retry } from 'rxjs/operators';
import { Pipe } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { DialogService } from "ng2-bootstrap-modal";
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { AppConfig } from '../util';
import { Common } from '../util/common';
import { ExcelService } from '../service/excel.service';
import { CommonService } from '../service/commons-service';

@Pipe({
    name: 'unique',
    pure: false
})

@Component({
    templateUrl: 'resourceHistory.component.html?v=${new Date().getTime()}',
    styleUrls: ['resourceHistory.component.css?v=${new Date().getTime()}']
})
export class ResourceHistoryComponent implements OnInit {
    private users: any = {};
    private loginImageURL: any = "";
    private loginUserName: any = "";
    private resourceHistoryForm: FormGroup;
    private config: any;
    private isEnable: boolean = false;
    private loading: boolean = false;
    private baseURL: any = null;
    private headders: any[] = ["S.No", "Employee Code", "User Name", "Joining Date", "Leaving Date", "Team", "Resource Type", "Created By Email", "Updated By Email", "Deleted By Email", "skill Storyline", "skill Lectora", "skill HTML", "Created Date", "Updated Date", "Deleted Date"];
    private sDate: any = null;
    private eDate: any = null;
    private resourceHistoryData: any[] = [];


    constructor(private http: Http, private dialogService: DialogService,
        private router: Router, private appConfig: AppConfig, private common: Common,
        private commonService: CommonService, private _compiler: Compiler, private formBuilder: FormBuilder, config: NgbDatepickerConfig, private excelService: ExcelService) {
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
        this._compiler.clearCache();
    }

    ngOnInit() {
        this.resourceHistoryForm = new FormGroup({
            startDate: new FormControl(),
            endDate: new FormControl()
        });
        this.resourceHistoryForm = this.formBuilder.group({
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
        if (this.resourceHistoryForm.value.startDate) {
            var dd = this.resourceHistoryForm.value.startDate.day;
            var mm = this.resourceHistoryForm.value.startDate.month;
            var yy = this.resourceHistoryForm.value.startDate.year;
            this.config.minDate = { year: yy, month: mm, day: dd };

        } else {
            localStorage.setItem('errorMsg', 'Please select Start Date');
            this.commonService.showerror();
            return;
        }
    }

    //get resources history
    private getResourcesHistory() {
        this.sDate = this.common.getDateYYMMDD(this.resourceHistoryForm.value.startDate);
        this.eDate = this.common.getDateYYMMDD(this.resourceHistoryForm.value.endDate);
        this.loading = true;
        this.commonService.getResourcesHistory(this.sDate, this.eDate).pipe(first()).subscribe(
            data => {
                if (data && data.length > 0) {
                    this.resourceHistoryData = data;
                    this.isEnable = true;
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

    //export resource history data
    private excelReport() {
        let excelExportData = [];
        for (let i = 0; i < this.resourceHistoryData.length; i++) {
            let data = {};
            data[this.headders[0]] = i + 1;
            data[this.headders[1]] = this.resourceHistoryData[i].employeeCode;
            data[this.headders[2]] = this.resourceHistoryData[i].userName;
            data[this.headders[3]] = this.common.getDatesYYMMDD(this.resourceHistoryData[i].joiningDate);
            data[this.headders[4]] = this.common.getDatesYYMMDD(this.resourceHistoryData[i].leavingDate);
            data[this.headders[5]] = this.resourceHistoryData[i].team;
            data[this.headders[6]] = this.resourceHistoryData[i].resourceType;
            data[this.headders[7]] = this.resourceHistoryData[i].createdByEmail;
            data[this.headders[8]] = this.resourceHistoryData[i].updatedByEmail;
            data[this.headders[9]] = this.resourceHistoryData[i].deletedByEmail;
            data[this.headders[10]] = this.resourceHistoryData[i].skill_ST;
            data[this.headders[11]] = this.resourceHistoryData[i].skill_LT;
            data[this.headders[12]] = this.resourceHistoryData[i].skill_HT;
            data[this.headders[13]] = this.common.getDatesYYMMDD(this.resourceHistoryData[i].createdDate);
            data[this.headders[14]] = this.common.getDatesYYMMDD(this.resourceHistoryData[i].updatedDate);
            data[this.headders[15]] = this.common.getDatesYYMMDD(this.resourceHistoryData[i].deletedDate);
            excelExportData.push(data);
        }
        this.excelService.generateExcel(this.headders, excelExportData, 'resourceHistoryReport');
    }

    // forward next section
    private gotoNextPage(e, routeURL) {
        this.router.navigate([routeURL]);
    }

    // logout and forward login page
    private logout() {
        this.commonService.logout();
    }
}