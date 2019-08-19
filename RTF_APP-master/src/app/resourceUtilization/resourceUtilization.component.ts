import { Component, OnInit, Compiler } from '@angular/core';
import { first, retry } from 'rxjs/operators';
import { Pipe } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { AppConfig } from '../util';
import { Common } from '../util/common';
import { ExcelService } from '../service/excel.service';
import { CommonService } from '../service/commons-service';
import { Chart } from 'chart.js';

@Pipe({
    name: 'unique',
    pure: false
})

@Component({
    templateUrl: 'resourceUtilization.component.html?v=${new Date().getTime()}',
    styleUrls: ['resourceUtilization.component.css?v=${new Date().getTime()}']
})
export class ResourceUtilizationComponent implements OnInit {
    private users: any = {};
    private loginImageURL: any = "";
    private loginUserName: any = "";
    private resourceUtilizationForm: FormGroup;
    private config: any;
    private isEnable: boolean = false;
    private loading: boolean = false;
    private baseURL: any = null;
    private prodReportData: any[] = [];
    private engReportData: any[] = [];
    private userList: any[] = [];
    private bookingData: any[] = [];
    private sDate: any = null;
    private eDate: any = null;
    private dateArr: any[] = []
    private engPlannedUtilizedMandays: any = {};
    private prodPlannedUtilizedMandays: any = {};
    private totalUtilizedMandays: any = {};
    private chart: any[] = [];
    private dataPoints_1: any[] = [];
    private dataPoints_2: any[] = [];
    private labels: any[] = [];
    private reportDurations: any = "";
    private chartBorderStyleClass = "";
    private engTeamSize = 0;
    private prodTeamSize = 0;

    constructor(private router: Router, private _compiler: Compiler,
        private appConfig: AppConfig, private common: Common,
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
        this.resourceUtilizationForm = new FormGroup({
            startDate: new FormControl(),
            endDate: new FormControl()
        });
        this.resourceUtilizationForm = this.formBuilder.group({
            startDate: [null, Validators.required],
            endDate: [null, Validators.required]
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
        if (this.resourceUtilizationForm.value.startDate) {
            var dd = this.resourceUtilizationForm.value.startDate.day;
            var mm = this.resourceUtilizationForm.value.startDate.month;
            var yy = this.resourceUtilizationForm.value.startDate.year;
            this.config.minDate = { year: yy, month: mm, day: dd };
        } else {
            localStorage.setItem('errorMsg', 'Please select Start Date');
            this.commonService.showerror();
            return;
        }
    }

    //get utilization resource
    private getUtilizationResource() {
        this.resetAllAsset();
        this.sDate = this.common.getDateYYMMDD(this.resourceUtilizationForm.value.startDate);
        this.eDate = this.common.getDateYYMMDD(this.resourceUtilizationForm.value.endDate);
        this.setReportDuration(this.sDate, this.eDate);
        this.loading = true;
        this.commonService.getUtilizationResource(this.sDate, this.eDate).pipe(first()).subscribe(
            data => {
                if (data && data.length > 0) {
                    this.userList = data;
                    this.filterUsersData();
                    this.getBookedUtilizationResource();
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

    //set report duration
    private setReportDuration(sDate, eDate) {
        sDate = new Date(sDate);
        eDate = new Date(eDate);
        if (sDate.getFullYear() == eDate.getFullYear() && sDate.getMonth() == eDate.getMonth()) {
            this.reportDurations = this.common.month[sDate.getMonth()] + " " + eDate.getFullYear();
        } else if (sDate.getFullYear() == eDate.getFullYear()) {
            this.reportDurations = this.common.month[sDate.getMonth()] + "-" + this.common.month[eDate.getMonth()] + " " + eDate.getFullYear();
        } else {
            this.reportDurations = this.common.month[sDate.getMonth()] + "-" + sDate.getFullYear() + " " + this.common.month[eDate.getMonth()] + " " + eDate.getFullYear();
        }
    }

    //filter users data
    private filterUsersData() {
        this.userList.forEach((user, index) => {
            if (user.team.trim().toLowerCase() == "engineering") {
                this.engReportData.push(user);
                let userName = user.user_name.toLowerCase();
                if (!userName.includes("resource") && !userName.includes("csd") && !userName.includes("outsourced")) {
                    this.engTeamSize++;
                }
            }
            if (user.team.trim().toLowerCase() == "production") {
                this.prodReportData.push(user);
                let userName = user.user_name.toLowerCase();
                if (!userName.includes("resource") && !userName.includes("csd") && !userName.includes("outsourced")) {
                    this.prodTeamSize++;
                }
            }
        });
    }

    //get booked utilization resource
    private getBookedUtilizationResource() {
        if (this.resourceUtilizationForm.invalid) {
            return;
        }
        this.loading = true;
        this.commonService.getBookedUtilizationResource(this.sDate, this.eDate).pipe(first()).subscribe(
            data => {
                if (data && data.length > 0) {
                    this.bookingData = data;
                    this.filterBookingData();
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

    //filter booking data
    private filterBookingData() {
        let removeFromTeam = [];
        // Engineering: Resource Utilization Trend
        this.dateArr = this.common.getDateArray(new Date(this.sDate), new Date(this.eDate));
        this.dateArr.forEach((date, j) => {
            this.engReportData.forEach((engUser, i) => {
                this.bookingData.forEach((bookUser, k) => {
                    let bookingDate = this.common.getDateDDMMYY(bookUser.bookingdate);
                    if (bookUser.userid == engUser.user_id && bookingDate == date) {
                        if (this.engPlannedUtilizedMandays[date] && this.engPlannedUtilizedMandays[date].hours) {
                            this.engPlannedUtilizedMandays[date].hours = Number(this.engPlannedUtilizedMandays[date].hours) + Number(bookUser.assignhours);
                            this.engPlannedUtilizedMandays[date].hours = (this.engPlannedUtilizedMandays[date].hours).toFixed(2);
                        } else {
                            this.engPlannedUtilizedMandays[date] = { hours: bookUser.assignhours, teamsize: 0 };
                        }
                    }
                });
                if (engUser.leave_date) {
                    let userName = engUser.user_name.toLowerCase();
                    if (!userName.includes("resource") && !userName.includes("csd") && !userName.includes("outsourced")) {
                        if (removeFromTeam.indexOf(userName) == -1 && new Date(date) > new Date(engUser.leave_date)) {
                            this.engTeamSize = this.checkUserLeaveDate(this.engTeamSize, new Date(date), new Date(engUser.leave_date));
                        }
                        removeFromTeam.push(userName);
                    }
                }
            });
            this.engPlannedUtilizedMandays[date].teamsize = this.engTeamSize;
        });
        //Production: Resource Utilization Trend
        removeFromTeam = [];
        this.dateArr.forEach((date, j) => {
            this.prodReportData.forEach((proUser, i) => {
                this.bookingData.forEach((bookUser, k) => {
                    let bookingDate = this.common.getDateDDMMYY(bookUser.bookingdate);
                    if (bookUser.userid == proUser.user_id && bookingDate == date) {
                        if (this.prodPlannedUtilizedMandays[date] && this.prodPlannedUtilizedMandays[date].hours) {
                            this.prodPlannedUtilizedMandays[date].hours = Number(this.prodPlannedUtilizedMandays[date].hours) + Number(bookUser.assignhours);
                            this.prodPlannedUtilizedMandays[date].hours = (this.prodPlannedUtilizedMandays[date].hours).toFixed(2);
                        } else {
                            this.prodPlannedUtilizedMandays[date] = { hours: bookUser.assignhours, teamsize: 0 };
                        }
                    }
                });
                if (proUser.leave_date) {
                    let userName = proUser.user_name.toLowerCase();
                    if (!userName.includes("resource") && !userName.includes("csd") && !userName.includes("outsourced")) {
                        if (removeFromTeam.indexOf(userName) == -1 && new Date(date) > new Date(proUser.leave_date)) {
                            this.prodTeamSize = this.checkUserLeaveDate(this.prodTeamSize, new Date(date), new Date(proUser.leave_date));
                            removeFromTeam.push(userName);
                        }
                    }
                }
            });
            this.prodPlannedUtilizedMandays[date].teamsize = this.prodTeamSize;
        });
        // Engineering: Resource Utilization Trend 
        this.dateArr.forEach((date, j) => {
            let teamsize = 0;
            let hours: any = 0;
            if (this.engPlannedUtilizedMandays[date]) {
                teamsize = Number(teamsize) + Number(this.engPlannedUtilizedMandays[date].teamsize);
                hours = Number(hours) + Number(this.engPlannedUtilizedMandays[date].hours);
                hours = (hours).toFixed(2);
            }
            if (this.prodPlannedUtilizedMandays[date]) {
                teamsize = Number(teamsize) + Number(this.prodPlannedUtilizedMandays[date].teamsize);
                hours = Number(hours) + Number(this.prodPlannedUtilizedMandays[date].hours);
                hours = (hours).toFixed(2);
            }
            this.totalUtilizedMandays[date] = { hours: hours, teamsize: teamsize };
        });
        this.engPlannedUtilizedMandays = this.changeHoursToManDays(this.engPlannedUtilizedMandays);
        this.prodPlannedUtilizedMandays = this.changeHoursToManDays(this.prodPlannedUtilizedMandays);
        this.totalUtilizedMandays = this.changeHoursToManDays(this.totalUtilizedMandays);
        this.generateTotalUtilizedChart();
        this.generateEngUtilizedChart();
        this.generateProdUtilizedChart();
        this.isEnable = true;
        this.loading = false;
        this.chartBorderStyleClass = "chartBorderStyle";
    }

    //change hours to man days
    private changeHoursToManDays(dataArray) {
        this.dateArr.forEach((date, j) => {
            dataArray[date].hours = Number(dataArray[date].hours / 8).toFixed(2)
        });
        return dataArray;
    }

    //check user leave date
    private checkUserLeaveDate(teamSize, selectedDate, userLeaveDate) {
        if (selectedDate > userLeaveDate) {
            let teamNo = Number(teamSize) - 1;
            return teamNo;
        }
        return teamSize;
    }

    //generate total utilized chart
    private generateTotalUtilizedChart() {
        let dataPoints_1 = [];
        let dataPoints_2 = [];
        let labels = [];
        this.dateArr.forEach((date, j) => {
            if (this.totalUtilizedMandays[date]) {
                dataPoints_1.push(this.totalUtilizedMandays[date].teamsize);
                dataPoints_2.push(this.totalUtilizedMandays[date].hours);
            } else {
                dataPoints_1.push(0);
                dataPoints_2.push(0);
            }
            labels.push(date);
        });
        this.chart = new Chart('totalutilcanvas', {
            type: 'line',
            data: {
                labels: labels, // your labels array
                datasets: [
                    {
                        data: dataPoints_1, // your data array
                        borderColor: '#92d050',
                        fill: true,
                        label: "Team Size (Mandays)"
                    },
                    {
                        data: dataPoints_2, // your data array
                        borderColor: '#00aeef',
                        fill: true,
                        label: "Planned/Utilized (Mandays)",
                        backgroundColor: "#00aeef"
                    }
                ]
            },
            options: {
                legend: {
                    display: true,
                },
                scales: {
                    xAxes: [{
                        display: false
                    }],
                    yAxes: [{
                        display: false
                    }],
                }
            }
        });
    }

    //generate eng utilized chart
    private generateEngUtilizedChart() {
        let dataPoints_1 = [];
        let dataPoints_2 = [];
        let labels = [];
        this.dateArr.forEach((date, j) => {
            if (this.engPlannedUtilizedMandays[date]) {
                dataPoints_1.push(this.engPlannedUtilizedMandays[date].teamsize);
                dataPoints_2.push(this.engPlannedUtilizedMandays[date].hours);
            } else {
                dataPoints_1.push(0);
                dataPoints_2.push(0);
            }
            labels.push(date);
        });
        this.chart = new Chart('engcanvas', {
            type: 'line',
            data: {
                labels: labels, // your labels array
                datasets: [
                    {
                        data: dataPoints_1, // your data array
                        borderColor: '#92d050',
                        fill: true,
                        label: "Team Size (Mandays)"
                    },
                    {
                        data: dataPoints_2, // your data array
                        borderColor: '#00aeef',
                        fill: true,
                        label: "Planned/Utilized (Mandays)",
                        backgroundColor: "#00aeef"
                    }
                ]
            },
            options: {
                legend: {
                    display: true,
                },
                scales: {
                    xAxes: [{
                        display: false
                    }],
                    yAxes: [{
                        display: false
                    }],
                }
            }
        });
    }

    //generate prod utilized chart
    private generateProdUtilizedChart() {
        let dataPoints_1 = [];
        let dataPoints_2 = [];
        let labels = [];
        this.dateArr.forEach((date, j) => {
            if (this.prodPlannedUtilizedMandays[date]) {
                dataPoints_1.push(this.prodPlannedUtilizedMandays[date].teamsize);
                dataPoints_2.push(this.prodPlannedUtilizedMandays[date].hours);
            } else {
                dataPoints_1.push(0);
                dataPoints_2.push(0);
            }
            labels.push(date);
        });
        this.chart = new Chart('prodcanvas', {
            type: 'line',
            data: {
                labels: labels, // your labels array
                datasets: [
                    {
                        data: dataPoints_1, // your data array
                        borderColor: '#92d050',
                        fill: true,
                        label: "Team Size (Mandays)"
                    },
                    {
                        data: dataPoints_2, // your data array
                        borderColor: '#00aeef',
                        fill: true,
                        label: "Planned/Utilized",
                        backgroundColor: "#00aeef"
                    }
                ]
            },
            options: {
                legend: {
                    display: true,
                },
                scales: {
                    xAxes: [{
                        display: false
                    }],
                    yAxes: [{
                        display: false
                    }],
                }
            },
            backgroundColor: "rgba(0,0,0,0)"
        });
    }

    // export resource utilizaion data
    private excelReport() {
        let excelExportData: any = [];
        let headders = ["Type Name"];
        this.dateArr.forEach((date, index) => {
            headders.push(date);
        })
        //--------totalUtilizedMandays
        excelExportData = this.getExcellWithWhiteSpaceData(excelExportData, "CEP: Resource Utilization Trend (" + this.reportDurations + ")");
        //plannedUtilized (Mandays)
        excelExportData = this.getExcellData(excelExportData, 'plannedUtilized (Mandays)', this.totalUtilizedMandays, false, true, false);
        //Team Size (Mandays)
        excelExportData = this.getExcellData(excelExportData, 'Team Size (Mandays)', this.totalUtilizedMandays, false, false, true);
        //Downtime/Overhead (+/-)
        excelExportData = this.getExcellData(excelExportData, 'Downtime/Overhead (+/-)', this.totalUtilizedMandays, true, false, false);
        //add white space
        //--------engPlannedUtilizedMandays
        excelExportData = this.getExcellWithWhiteSpaceData(excelExportData, "");
        excelExportData = this.getExcellWithWhiteSpaceData(excelExportData, "Engineering: Resource Utilization Trend (" + this.reportDurations + ")");
        //plannedUtilized (Mandays)
        excelExportData = this.getExcellData(excelExportData, 'plannedUtilized (Mandays)', this.engPlannedUtilizedMandays, false, true, false);
        //Team Size (Mandays)
        excelExportData = this.getExcellData(excelExportData, 'Team Size (Mandays)', this.engPlannedUtilizedMandays, false, false, true);
        //Downtime/Overhead (+/-)
        excelExportData = this.getExcellData(excelExportData, 'Downtime/Overhead (+/-)', this.engPlannedUtilizedMandays, true, false, false);
        //add white space
        //--------prodPlannedUtilizedMandays
        excelExportData = this.getExcellWithWhiteSpaceData(excelExportData, "");
        excelExportData = this.getExcellWithWhiteSpaceData(excelExportData, "Production: Resource Utilization Trend (" + this.reportDurations + "");
        //plannedUtilized (Mandays)
        excelExportData = this.getExcellData(excelExportData, 'plannedUtilized (Mandays)', this.prodPlannedUtilizedMandays, false, true, false);
        //Team Size (Mandays)
        excelExportData = this.getExcellData(excelExportData, 'Team Size (Mandays)', this.prodPlannedUtilizedMandays, false, false, true);
        //Downtime/Overhead (+/-)
        excelExportData = this.getExcellData(excelExportData, 'Downtime/Overhead (+/-)', this.prodPlannedUtilizedMandays, true, false, false);
        //add white space
        this.excelService.generateExcel(headders, excelExportData, 'resourceUtilizationReport');
    }

    //prepair excel export data
    private getExcellData(excelExportData: any[], typeName: any, utilizedMandays: any, downTime: any, hours: any, team: any) {
        let data = { 'Type Name': typeName };
        if (downTime) {
            this.dateArr.forEach((date, index) => {
                if (utilizedMandays[date]) {
                    let hours = utilizedMandays[date].hours;
                    data[date] = utilizedMandays[date].teamsize - hours;
                } else {
                    data[date] = 0;
                }
            })
        }
        if (hours) {
            this.dateArr.forEach((date, index) => {
                if (utilizedMandays[date]) {
                    data[date] = utilizedMandays[date].hours;
                } else {
                    data[date] = 0;
                }
            })
        }
        if (team) {
            this.dateArr.forEach((date, index) => {
                if (utilizedMandays[date]) {
                    data[date] = utilizedMandays[date].teamsize;
                } else {
                    data[date] = 0;
                }
            })
        }
        excelExportData.push(data);
        return excelExportData;
    }

    //get excell with white space data
    private getExcellWithWhiteSpaceData(excelExportData: any[], typeName: any) {
        let data = { 'Type Name': typeName };
        this.dateArr.forEach((date, index) => {
            data[date] = "";
        })
        excelExportData.push(data);
        return excelExportData;
    }

    // reset all the resources
    private resetAllAsset() {
        this.engTeamSize = 0;
        this.prodTeamSize = 0;
        this.prodReportData = [];
        this.engReportData = [];
        this.dateArr = [];
        this.userList = [];
        this.prodPlannedUtilizedMandays = {};
        this.engPlannedUtilizedMandays = {};
        this.totalUtilizedMandays = {};
        this.chartBorderStyleClass = ""
        this.bookingData = [];
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