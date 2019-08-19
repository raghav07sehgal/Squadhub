import { Component, OnInit, Compiler } from '@angular/core';
import { first, retry } from 'rxjs/operators';
import { Pipe } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { AppConfig } from '../util';
import { Common } from '../util/common';
import { CommonService } from '../service/commons-service';

@Pipe({
    name: 'unique',
    pure: false
})

@Component({
    templateUrl: 'reducebooking.component.html?v=${new Date().getTime()}',
    styleUrls: ['reducebooking.component.css?v=${new Date().getTime()}']
})
export class ReducebookingComponent implements OnInit {
    private users: any = {};
    private loginImageURL: any = "";
    private loginUserName: any = "";
    private bookingReportForm: FormGroup;
    private updateBookingForm: FormGroup;
    private config: any;
    private isEnable: boolean = false;
    private loading: boolean = false;
    private baseURL: any = null;
    private userList: any[] = [];
    private bookingData: any = [];
    private orgBookingData: any = [];
    private hoursList = [];
    private filterHours: any = "Select filter hours";
    private filterUser: any = "Select filter user";
    private updatedHours: any = "Select reduce hours";
    private filterTicket: any = "";
    private showFilter: boolean = false;

    constructor(private _compiler: Compiler, private router: Router,
        private appConfig: AppConfig, private common: Common,
        private commonService: CommonService, private formBuilder: FormBuilder,
        config: NgbDatepickerConfig) {
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
        this.config.minDate = { year: 1888, month: currentDate.getMonth() + 1, day: currentDate.getDate() };
        this.config.maxDate = { year: 2099, month: 12, day: 31 };
        this.config.markDisabled = false;
        this.baseURL = this.appConfig.getServerURL();
        if (localStorage.getItem("csd")) {
            this.filterTicket = localStorage.getItem("csd");
        }
        this.getAllUserList();
    }

    ngOnInit() {
        // form initialization
        this.bookingReportForm = new FormGroup({
            startDate: new FormControl(),
            endDate: new FormControl(),
            filterTicket: new FormControl(),
        });

        //validate form
        this.bookingReportForm = this.formBuilder.group({
            startDate: [null, Validators.required],
            endDate: [null, Validators.required],
            filterTicket: [null, Validators.required],
        });

        // form initialization
        this.updateBookingForm = new FormGroup({
            filterUser: new FormControl(),
            filterHours: new FormControl(),
            updatedHours: new FormControl(),
        });

        //validate form
        this.updateBookingForm = this.formBuilder.group({
            filterUser: [null, Validators.required],
            filterHours: [null, Validators.required],
            updatedHours: [null, Validators.required],
        });
    }

    //set start date
    private setStartDate() {
        this.isEnable = false;
        let currentDate = new Date();
        this.config.minDate = { year: 1888, month: currentDate.getMonth() + 1, day: currentDate.getDate() };
    }

    //set end date
    private setEndDate() {
        this.isEnable = false;
        if (this.bookingReportForm.value.startDate) {
            var dd = this.bookingReportForm.value.startDate.day;
            var mm = this.bookingReportForm.value.startDate.month;
            var yy = this.bookingReportForm.value.startDate.year;
            this.config.minDate = { year: yy, month: mm, day: dd };

        } else {
            localStorage.setItem('errorMsg', 'Please select Start Date');
            this.commonService.showerror();
            return;
        }
    }

    //check ticket string
    private checkTicketString() {
        if (!this.filterTicket.toLocaleLowerCase().includes("csd")) {
            this.filterTicket = "CSD-" + this.filterTicket;
        }
    }

    // Get all users list
    private getAllUserList() {
        this.userList = [];
        this.commonService.getAllUsers("").pipe(first()).subscribe(
            data => {
                this.userList = data;
                this.filterLevaedUsers();
                this.filterJoiningUsers();
                this.loading = false;
            },
            error => {
                this.loading = false;
                localStorage.setItem('errorMsg', error.statusText);
                this.commonService.showerror();
            })
    }

    //filter leave user
    private filterLevaedUsers() {
        for (let i = 0; i < this.userList.length;) {
            let user = this.userList[i];
            if (!user.leave_date) {
                i++;
                continue
            }
            let current = new Date();
            let leaveDate = new Date(user.leave_date);
            if (current.getTime() > leaveDate.getTime()) {
                this.userList.splice(i, 1);
                i = 0;
            } else {
                i++
            }
        }
    }

    //filter joining users
    private filterJoiningUsers() {
        for (let i = 0; i < this.userList.length;) {
            let user = this.userList[i];
            if (!user.join_date) {
                i++;
                continue
            }
            let current = new Date();
            let joinDate = new Date(user.join_date);
            if (current.getTime() < joinDate.getTime()) {
                this.userList.splice(i, 1);
                i = 0;
            } else {
                i++
            }
        }
    }

    //get all booking data between dates
    private getBookings() {
        if (!this.bookingReportForm.valid) {
            localStorage.setItem('errorMsg', "Please fill all the details");
            this.commonService.showerror();
            return;
        }
        let formData = this.bookingReportForm.value;
        formData.sDate = this.common.getDateYYMMDD(formData.startDate);
        formData.eDate = this.common.getDateYYMMDD(formData.endDate);
        if (!formData.sDate || !formData.eDate) {
            localStorage.setItem('errorMsg', "Please check start and end date range!");
            this.commonService.showerror();
            return;
        }
        if (!formData.filterTicket) {
            localStorage.setItem('errorMsg', "Please enter ticket!");
            this.commonService.showerror();
            return;
        }
        this.bookingData = [];
        this.orgBookingData = [];
        this.loading = true;
        this.commonService.getBookings(formData).pipe(first()).subscribe(
            data => {
                this.loading = false;
                if (data && data.length > 0) {
                    this.bookingData = data;
                    this.orgBookingData = data;
                    this.filterBookedUsers(data);
                    this.showFilter = true;
                } else {
                    localStorage.setItem('errorMsg', "No records found!!");
                    this.commonService.showerror();
                }
            },
            error => {
                this.loading = false;
                localStorage.setItem('errorMsg', error.statusText);
                this.commonService.showerror();
            }
        )
    }

    //filter booking users
    private filterBookedUsers(data) {
        for (let i = 0; i < this.userList.length;) {
            let found = false;
            for (let j = 0; j < data.length; j++) {
                if (this.userList[i].user_id == data[j].userid) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.userList.splice(i, 1);
                i = 0;
            } else {
                i++
            }
        }
    }

    //get all booking data between dates
    private getUserBookingData() {
        this.bookingData = [];
        this.orgBookingData = [];
        if (!this.bookingReportForm.valid) {
            localStorage.setItem('errorMsg', "Please fill all the details");
            this.commonService.showerror();
            return;
        }
        let formData = this.bookingReportForm.value;
        formData.sDate = this.common.getDateYYMMDD(formData.startDate);
        formData.eDate = this.common.getDateYYMMDD(formData.endDate);
        if (!formData.sDate || !formData.eDate) {
            localStorage.setItem('errorMsg', "Please check start and end date range!");
            this.commonService.showerror();
            return;
        }
        if (this.filterUser == "Select filter user") {
            return "Please select filter user name!";
        }
        formData['filterUser'] = this.filterUser;
        this.loading = true;
        this.commonService.getUserBookingData(formData).pipe(first()).subscribe(
            data => {
                this.loading = false;
                if (data && data.length > 0) {
                    this.bookingData = data;
                    this.orgBookingData = data;
                    this.getHours(data)
                } else {
                    localStorage.setItem('errorMsg', "No records found!!");
                    this.commonService.showerror();
                }
            },
            error => {
                this.loading = false;
                localStorage.setItem('errorMsg', error.statusText);
                this.commonService.showerror();
            }
        )
    }

    //get all booking data between dates
    private getBookingData() {
        if (!this.bookingReportForm.valid) {
            localStorage.setItem('errorMsg', "Please fill all the details");
            this.commonService.showerror();
            return;
        }
        let formData = this.bookingReportForm.value;
        formData['filterUser'] = this.filterUser;
        formData['filterHours'] = this.filterHours;
        formData['filterTicket'] = this.filterTicket;
        formData.sDate = this.common.getDateYYMMDD(formData.startDate);
        formData.eDate = this.common.getDateYYMMDD(formData.endDate);
        let errorMsg = this.validateFildes(formData);
        if (errorMsg) {
            localStorage.setItem('errorMsg', errorMsg);
            this.commonService.showerror();
            return;
        }
        this.bookingData = [];
        this.orgBookingData = [];
        this.loading = true;
        this.commonService.getBookingData(formData).pipe(first()).subscribe(
            data => {
                if (data && data.length > 0) {
                    this.bookingData = data;
                    this.orgBookingData = data;
                } else {
                    localStorage.setItem('errorMsg', "No records found!!");
                    this.commonService.showerror();
                }
                this.loading = false;
            },
            error => {
                this.loading = false;
                localStorage.setItem('errorMsg', error.statusText);
                this.commonService.showerror();
            }
        )
    }

    //validate start and end date
    private validateFildes(formData) {
        if (!formData.sDate || !formData.eDate) {
            return "Please check start and end date range!"
        }
        let startDate = new Date(formData.sDate);
        let endDate = new Date(formData.eDate);
        if (startDate > endDate) {
            return "Please check start and end date range!";
        }
        if (formData.filterHours == "Select filter hours") {
            return "Please select filter hours!";
        }
        if (formData.filterUser == "Select filter user") {
            return "Please select filter user name!";
        }
    }

    //get hours
    private getHours(data) {
        let hours = [];
        this.hoursList = [];
        for (var i = 0; i < data.length; i++) {
            if (hours.indexOf(data[i].assignhours) == -1) {
                hours.push(data[i].assignhours);
            }
        }
        this.hoursList = hours;
    }

    //filter data by hours
    private filterDataByHours() {
        this.bookingData = [];
        if (this.filterHours == "Select filter hours") {
            this.bookingData = this.orgBookingData;
            return;
        }
        this.getBookingData();
    }

    //create hours based on selected hours filter
    private createHoursRange(number) {
        let hours: number[] = [];
        for (var i = 1; i < number; i++) {
            hours.push(i);
        }
        return hours;
    }

    // update booking hours
    private updateBookingHours() {
        if (!this.updateBookingForm.valid) {
            localStorage.setItem('errorMsg', "Please fill all filter the details");
            this.commonService.showerror();
            return;
        }
        let errorMsg = this.validateUpdateFields();
        if (errorMsg) {
            localStorage.setItem('errorMsg', errorMsg);
            this.commonService.showerror();
            return;
        }
        let percentage = this.updatedHours * 100 / 8;
        if (this.bookingData.length > 0) {
            this.bookingData.forEach((data, index) => {
                this.bookingData[index].assignhours = this.updatedHours;
                this.bookingData[index].status = this.getStatus(percentage);
                this.bookingData[index].percentage = percentage;
                this.bookingData[index]["updatedUser"] = this.users.userData.displayName;
            });
        }
        this.loading = true;
        this.commonService.updateBookingHours(this.bookingData).pipe(first()).subscribe(
            data => {
                this.loading = false;
                localStorage.setItem('errorMsg', "Updated sucessfully!");
                this.commonService.showerror();
                this.showFilter = false;
                this.updateBookingForm.reset();
                this.filterHours = "Select filter hours";
                this.filterUser = "Select filter user";
                this.updatedHours = "Select reduce hours";
                this.getBookings();
            },
            error => {
                this.loading = false;
                localStorage.setItem('errorMsg', error.statusText);
                this.commonService.showerror();
            }
        )
    }

    //validate start and end date
    private validateUpdateFields() {
        if (!this.filterUser || this.filterUser == "Select filter user") {
            return "Please select filter user!";
        }
        if (!this.filterHours || this.filterHours == "Select filter hours") {
            return "Please select filter hours!";
        }
        if (!this.updatedHours || this.updatedHours == "Select reduce hours") {
            return "Please select reduce hours!";
        }
    }

    //get status of booking hours percentage
    private getStatus(percentage: Number) {
        let status = "";
        if (percentage < 100) {
            status = "Partial"
        } else if (percentage == 100) {
            status = "Not Available"
        }
        return status;
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