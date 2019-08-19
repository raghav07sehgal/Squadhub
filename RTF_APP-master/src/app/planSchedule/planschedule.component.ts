import { Component, OnInit, ViewChild, Compiler } from '@angular/core';
import { Router } from '@angular/router';
import { first, retry } from 'rxjs/operators';
import { DialogService } from "ng2-bootstrap-modal";
import { Http } from '@angular/http';
import { NgbDateStruct, NgbCalendar, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../service/commons-service';
import { AppConfig } from '../util';
import { DragScrollComponent } from 'ngx-drag-scroll/lib';
import { Common } from '../util/common';
import { ExcelService } from '../service/excel.service';

const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
    one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
    !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
        ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
    !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
        ? false : one.day > two.day : one.month > two.month : one.year > two.year;

@Component({
    templateUrl: 'planschedule.component.html?v=${new Date().getTime()}',
    styleUrls: ['planschedule.component.css?v=${new Date().getTime()}']
})

export class PlanScheduleComponent implements OnInit {

    @ViewChild('nav', { read: DragScrollComponent }) ds: DragScrollComponent;
    @ViewChild('nav1', { read: DragScrollComponent }) ds1: DragScrollComponent;
    @ViewChild('nav2', { read: DragScrollComponent }) ds2: DragScrollComponent;
    @ViewChild('closeModel') closeModel: any;
    @ViewChild('closeManageBookingModel') closeManageBookingModel: any;
    @ViewChild('manageBookingTable') manageBookingTable: any;
    @ViewChild('bookingDetailsTable') bookingDetailsTable: any;

    private baseURL: any = null;
    private loading = false;
    private selectedStatusData: any[] = [];
    private currentUserList: any[] = [];
    private currentuserSelectedList: any[] = [];
    private users: any = {};
    private loginImageURL: any = "";
    private loginUserName: any = "";
    private selectedCSD: any;
    private budgetedEfforts: Number = 0; // For Budgeted Effort
    private totalBudgetedEffort: Number = 0;
    private totalRemainBudgetedEffort: Number = 0;
    private totalPlannedBudgetedEffort: any = 0;
    private hoveredDate: NgbDateStruct;
    private fromDate: NgbDateStruct;
    private toDate: NgbDateStruct;
    private userSelectedFromDate: any;
    private userSelectedEndDate: any;
    private availableResource: any[] = [];
    private partialResource: any[] = [];
    private currentAvailableResource: any[] = [];
    private showDiv: any = true;
    private checkedUsersArray: any[] = [];
    private checkedDeleteUsersArray: any[] = [];
    private totalDeletedHours: Number = 0;
    private assignHour: any = 8;
    private assignHours: any = 8;
    private notAvailableResourcedata: any[] = [];
    private totalDays: Number = 0;
    private showHideModel: boolean = false;
    private showHidePopup: boolean = false;
    private fetchSkills: any[] = [];
    private userSkills: any[] = [];
    private displayPicture: any = "https://www.gravatar.com/avatar/01c3f5143c5a2800bc8f8122bdabfadb?d=mm&s=48";
    private htmlUserList: any[] = [];
    private lectoraUserList: any[] = [];
    private storyLineUserList: any[] = [];
    private selectedSkill: any = "HTML";
    private statusList = ['All', 'In Review', 'To be Planned', 'Work in progress', 'Resources Planned'];
    private selectedStatus = 'Resources Planned';
    private studioName: any = '';
    private clientName: any = '';
    private requestedStartDate = "";
    private requestedEndDate = "";
    private swapArray: any[] = [];
    private bookedResourceData: any[] = [];
    private model: any;
    private moreInfoArr: any[] = [];
    private selectedAssignee: any = 1;
    private assigneeUsers: any[] = [];
    private assigneeUsersCSD: any[] = [];
    private isSelected: boolean = false;
    private isMBSelected: boolean = false;
    private searchCSDNo: any = "";
    private changeCSDStatus: boolean = false;
    private currentCSDStatus: any = "";
    private totalHours: Number = 8;
    private totalUser: any = 0;
    private totalAvilUser: any = 0;
    private totalNotAvilUser: any = 0;
    private totalPartAvilUser: any = 0;
    private totalAssignHours: Number = 0;
    private usersForBackBookingPrivilages = ['ajit.1.singh'];

    constructor(private http: Http, private router: Router, private excelService: ExcelService,
        private config: NgbDatepickerConfig, private commonService: CommonService,
        private appConfig: AppConfig, private common: Common, private compiler: Compiler) {
        this.compiler.clearCache();
        this.users = JSON.parse(localStorage.getItem('user'));
        this.users = this.users.userData;
        if (!this.users) {
            this.commonService.logout();
            return;
        }
        if (this.users) {
            this.loginImageURL = this.users.avatarUrls['48x48'];
            this.loginUserName = this.users.displayName;
        }
        this.baseURL = this.appConfig.getServerURL();
    }

    ngOnInit() {
        let csdNo = localStorage.getItem("csd");
        if (csdNo && csdNo != "Select CSD" && csdNo != null) {
            this.searchCSDNo = csdNo;
            this.getJIRATicketStatusList(true);
        } else {
            this.getJIRATicketStatusList(false);
        }

        this.getCurrentAvailableUsers();
        this.getSkillDetails();
        let currentDate = new Date();
        if (this.usersForBackBookingPrivilages.indexOf(this.users.name.toLowerCase()) > 0) {
            this.config.minDate = { year: currentDate.getFullYear() - 6, month: currentDate.getMonth() + 1, day: currentDate.getDate() };
        } else {
            this.config.minDate = { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1, day: currentDate.getDate() };
        }
        this.config.maxDate = { year: currentDate.getFullYear() + 99, month: 12, day: 31 };
        this.config.outsideDays = 'hidden';
        this.bookedResourceData = []
        this.partialResource.forEach(x => {
            x.isHovering = false;
        });
    }

    isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
    isInside = date => after(date, this.fromDate) && before(date, this.toDate);
    isFrom = date => equals(date, this.fromDate);
    isTo = date => equals(date, this.toDate);

    // Get users list which are Available from current date.
    private getCurrentAvailableUsers() {
        this.currentUserList = [];
        this.commonService.getCurrentAvailableUsers().pipe(first()).subscribe(
            data => {
                this.currentUserList = data;
                this.totalUser = this.getTotalUsers(this.currentUserList);
            },
            error => {
                this.loading = false;
                localStorage.setItem('errorMsg', error.statusText);
                this.commonService.showerror();
            })
    }

    //Get total users from the user list expect addition, shell, outsource,
    private getTotalUsers(dataArr: any[]) {
        let totalUser = 0;
        dataArr.forEach((user, index) => {
            if (user && user.user_name) {
                let name = user.user_name.toLowerCase();
                if (name.indexOf('addition') == -1 && name.indexOf('shell') == -1 && name.indexOf('outsourced') == -1) {
                    totalUser = totalUser + 1;
                }
            }
        })
        return totalUser;
    }

    // Get all skill list
    private getSkillDetails() {
        this.commonService.getSkillDetails().pipe(first()).subscribe(
            data => {
                this.fetchSkills = data;
            },
            error => {
                this.loading = false;
                localStorage.setItem('errorMsg', error.statusText);
                this.commonService.showerror();
            }
        )
    }

    // Get details of searching ticket
    private searchTicket(event) {
        if (event) {
            event.preventDefault();
        }
        if (!this.searchCSDNo) {
            localStorage.setItem('errorMsg', 'Please Enter Ticket No');
            this.commonService.showerror();
            return
        } else {
            this.searchCSDNo = this.searchCSDNo.toUpperCase();
            if (!this.searchCSDNo.includes("CSD")) {
                this.searchCSDNo = "CSD-" + this.searchCSDNo;
            }
            this.userSelectedFromDate = "";
            this.userSelectedEndDate = "";
            this.resetResourcedDta();
            this.totalPlannedBudgetedEffort = 0;
            this.getJIRATicketStatusList(true);
        }
    }

    //Get jira ticket status list
    private getJIRATicketStatusList(isSearch) {
        if (!isSearch) {
            this.searchCSDNo = "";
            this.resetResourcedDta();
        }
        this.resetAllInfoFromFilterDropDown();
        this.currentCSDStatus = "";
        this.totalBudgetedEffort = 0;
        this.selectedAssignee = 1;

        var user = JSON.parse(localStorage.getItem('user'));
        let status = this.selectedStatus;
        if (Number(status) == 1) {
            this.assigneeUsers = [];
            return;
        } else if (status == 'All') {
            status = "'In Review', 'To be Planned', 'Work in progress', 'Resources Planned'";
        } else {
            status = "'" + status + "'";
        }
        this.http.get(this.baseURL + '/initStatus');
        this.loading = true;
        this.commonService.getJIRATicketStatusList(this.searchCSDNo, user.username, user.password, status)
            .pipe(first())
            .subscribe(
                data => {
                    if (data && data != null) {
                        this.selectedStatusData = data;
                        if (this.selectedStatusData) {
                            if (this.selectedStatusData[0] && this.selectedStatusData[0].errorMessages) {
                                this.loading = false;
                                localStorage.setItem('errorMsg', this.selectedStatusData[0].errorMessages[0]);
                                this.commonService.showerror();
                                return;
                            }
                            if (isSearch || localStorage.getItem("csd")) {
                                this.selectedStatus = this.selectedStatusData[0].fields.status.name;
                                if (this.statusList.indexOf(this.selectedStatus) == -1) {
                                    this.statusList.push(this.selectedStatus);
                                }
                                if (this.selectedStatusData[0].fields.assignee) {
                                    this.selectedAssignee = this.selectedStatusData[0].fields.assignee.emailAddress;
                                } else {
                                    this.selectedAssignee = 'Unassigned';
                                }
                                this.assigneeSelection(isSearch);
                                localStorage.removeItem("csd");
                            } else {
                                this.selectedCSD = "Select CSD";
                            }
                            this.setAssignee(this.selectedStatusData, isSearch);
                            this.getBudgetedEffort();
                        }
                        this.loading = false;
                    } else {
                        localStorage.setItem('errorMsg', 'Bad Credential');
                        this.commonService.showerror();
                        this.loading = false;
                    }
                },
                error => {
                    this.loading = false;
                });
    }

    // Get tickets details on assignee selection 
    private assigneeSelection(isSearch) {
        this.resetAllInfoFromFilterDropDown();
        let assignee = localStorage.getItem("assignee");
        if (assignee && assignee != "Select Assignee" && assignee != null) {
            this.selectedAssignee = assignee;
            localStorage.removeItem("assignee");
        }
        this.assigneeUsersCSD = [];
        this.selectedStatusData.forEach((assigneeUser, i) => {
            if (!assigneeUser.fields.assignee && this.selectedAssignee == 'Unassigned') {
                this.assigneeUsersCSD.push(assigneeUser);
            } else if (assigneeUser.fields.assignee && this.selectedAssignee != 'Unassigned') {
                if (this.selectedAssignee == assigneeUser.fields.assignee.emailAddress) {
                    this.assigneeUsersCSD.push(assigneeUser);
                }
            }
        });

        if (this.assigneeUsersCSD && this.assigneeUsersCSD[0] && this.assigneeUsersCSD[0].key) {
            this.selectedCSD = this.assigneeUsersCSD[0].key;
        }


        this.ticketSelection();
    }

    // Set all assignee to the drop down
    private setAssignee(selectedStatusData, isSearch) {
        this.assigneeUsers = [];
        selectedStatusData.forEach((assigneeUser, i) => {
            let userFound: boolean = false;
            let email = 'Unassigned';
            let userName = 'Unassigned';
            if (assigneeUser.fields.assignee) {
                email = assigneeUser.fields.assignee.emailAddress
                userName = assigneeUser.fields.assignee.displayName
            }
            this.assigneeUsers.forEach((userDetail, j) => {
                if (email == userDetail.email) {
                    userFound = true;
                }
            });
            if (!userFound) {
                this.assigneeUsers.push({ email: email, userName: userName });
            }
        });
    }

    // Get total budgeted effort
    private getBudgetedEffort() {
        this.totalBudgetedEffort = 0;
        if (this.selectedStatusData) {
            for (let i = 0; i < this.selectedStatusData.length; i++) {
                let total = 0
                if (this.selectedStatusData[i].fields.customfield_10864 && this.selectedStatusData[i].fields.customfield_10864 > 0) {
                    total = this.selectedStatusData[i].fields.customfield_10864;
                }
                if (this.selectedStatusData[i].fields.customfield_10863 && this.selectedStatusData[i].fields.customfield_10863 > 0) {
                    total = Number(total) + Number(this.selectedStatusData[i].fields.customfield_10863);
                }
                if (this.selectedStatusData[i].fields.customfield_10244 && this.selectedStatusData[i].fields.customfield_10244 > 0) {
                    total = this.selectedStatusData[i].fields.customfield_10244;
                }
                if (this.selectedStatusData[i].fields.customfield_11700 && this.selectedStatusData[i].fields.customfield_11700 > 0) {
                    total = Number(total) + Number(this.selectedStatusData[i].fields.customfield_11700);
                }
                this.totalBudgetedEffort = Number(this.totalBudgetedEffort) + Number(total);
            }
        }
    }

    // Get details of searching ticket
    private ticketSelection() {
        this.totalPlannedBudgetedEffort = 0;
        if (this.selectedCSD == "Select CSD") {
            this.resetAllInfoFromFilterDropDown();
            return;
        }
        this.resetResourcedDta();
        this.userSelectedFromDate = "";
        this.userSelectedEndDate = "";
        this.bookedResourceData = [];
        let index = -1
        this.selectedStatusData.forEach((issue, i) => {
            if (this.selectedCSD == issue.key) {
                index = i;
                this.currentCSDStatus = issue.fields.status.name;
            }
        });

        if (this.selectedCSD == this.selectedStatusData[index].key) {
            let total = 0;
            ///Engg hours
            if (this.selectedStatusData[index].fields.customfield_10864 && this.selectedStatusData[index].fields.customfield_10864 > 0) {
                total = Number(total) + this.selectedStatusData[index].fields.customfield_10864;
            }
            if (this.selectedStatusData[index].fields.customfield_10225) {
                this.requestedStartDate = this.selectedStatusData[index].fields.customfield_10225;
            }
            if (this.selectedStatusData[index].fields.customfield_10226) {
                this.requestedEndDate = this.selectedStatusData[index].fields.customfield_10226;
            }
            if (this.selectedStatusData[index].fields.customfield_10219) {
                this.studioName = this.selectedStatusData[index].fields.customfield_10219.value;
            }
            if (this.selectedStatusData[index].fields.customfield_10600) {
                this.clientName = this.selectedStatusData[index].fields.customfield_10600.value;
            }

            ///production hours
            if (this.selectedStatusData[index].fields.customfield_10863 && this.selectedStatusData[index].fields.customfield_10863 > 0) {
                total = Number(total) + Number(this.selectedStatusData[index].fields.customfield_10863);
            }
            if (this.selectedStatusData[index].fields.customfield_10244 && this.selectedStatusData[index].fields.customfield_10244 > 0) {
                total = this.selectedStatusData[index].fields.customfield_10244;
            }
            if (this.selectedStatusData[index].fields.customfield_11700 && this.selectedStatusData[index].fields.customfield_11700 > 0) {
                total = Number(total) + Number(this.selectedStatusData[index].fields.customfield_11700);
            }
            this.budgetedEfforts = total;
            this.totalRemainBudgetedEffort = this.budgetedEfforts;
            this.getUserPlannedData(this.selectedCSD, null, null);
            this.getCSDSelectedCount();
        }
    }

    // Get total planned hours based on selected ticket number
    private getCSDSelectedCount() {
        this.totalPlannedBudgetedEffort = 0;
        this.commonService.getSelectedTicketPlannedCount(this.selectedCSD).pipe(first()).subscribe(
            data => {
                if (data[0] && data[0]["sum(assignhours)"]) {
                    this.totalPlannedBudgetedEffort = data[0]["sum(assignhours)"];
                }
            },
            error => {
                this.loading = false;
                localStorage.setItem('errorMsg', error.statusText);
                this.commonService.showerror();
                localStorage.removeItem('errorMsg');
            }
        )
    }

    // reset all infromation which are based on filter drop down
    private resetAllInfoFromFilterDropDown() {
        this.budgetedEfforts = 0;
        this.totalRemainBudgetedEffort = 0;
        this.totalPlannedBudgetedEffort = 0;
        this.studioName = "";
        this.clientName = "";
        this.currentCSDStatus = "";
    }

    //Get planned data based on start and end date
    private onDateSelection(date: NgbDateStruct) {
        if (!this.selectedAssignee || this.selectedAssignee <= 1) {
            localStorage.setItem('errorMsg', "Please Select Assignee First");
            this.commonService.showerror();
            return;
        }
        if (!this.selectedCSD || Number(this.selectedCSD) == 1) {
            localStorage.setItem('errorMsg', "Please Select CSD First");
            this.commonService.showerror();
            return;
        }
        this.resetResourcedDta();
        if (!this.fromDate && !this.toDate) {
            this.fromDate = date;
            this.userSelectedFromDate = this.fromDate.year + "-" + this.fromDate.month + "-" + this.fromDate.day;
        } else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
            this.toDate = date;
            this.userSelectedEndDate = this.toDate.year + "-" + this.toDate.month + "-" + this.toDate.day;
        } else {
            this.toDate = null;
            this.fromDate = date;
            this.userSelectedFromDate = this.fromDate.year + "-" + this.fromDate.month + "-" + this.fromDate.day;
            this.userSelectedEndDate = this.userSelectedFromDate;
        }

        if (!this.userSelectedEndDate) {
            this.userSelectedEndDate = this.userSelectedFromDate;
        }

        if (this.userSelectedFromDate && this.userSelectedEndDate) {
            this.checkedUsersArray = [];
            this.getUserPlannedData(null, this.userSelectedFromDate, this.userSelectedEndDate);
        }
        this.skillSelect(false, false);

    }

    // set assign hours for planned
    private setHours(event: any) {
        this.totalHours = Number(event.target.value);
        if (!this.selectedAssignee) {
            localStorage.setItem('errorMsg', "Please Select Assignee First");
            this.commonService.showerror();
            return;
        }

        if (!this.selectedCSD) {
            localStorage.setItem('errorMsg', "Please Select CSD First");
            this.commonService.showerror();
            return;
        }

        if (!this.userSelectedFromDate || !this.userSelectedFromDate) {
            localStorage.setItem('errorMsg', "Please Select Date Range First");
            this.commonService.showerror();
            return;
        }

        if (this.selectedCSD && this.userSelectedFromDate && this.userSelectedEndDate && this.checkedUsersArray.length > 0) {
            this.assignHour = Number(event.target.value);
            this.assignHours = this.assignHour;
        }

        if (this.userSelectedFromDate && this.userSelectedEndDate) {
            this.totalHours = Number(this.workingDaysBetweenDates(new Date(this.userSelectedFromDate), new Date(this.userSelectedEndDate))) * Number(event.target.value);
        }
    }

    //Get all user planned data
    private getUserPlannedData(selectedCSD, fromDate, toDate) {
        this.loading = true;
        this.resetResourcedDta();
        this.commonService.getUserPlannedData(selectedCSD, fromDate, toDate).pipe(first()).subscribe(
            data => {
                this.currentAvailableResource = [];
                if (data && data.length > 0) {
                    this.currentAvailableResource = data;
                    //filter booked resources
                    this.filterSelectedTicketData(data);
                    // filter partial booking data
                    let partialDataObj = this.filterPartialBookingDate(data)
                    data = partialDataObj["data"];
                    let partialResource = partialDataObj["partialResource"];

                    // filter Not Available booking data
                    let notAvailDataObj = this.filterNotAvailableBookingDate(data);
                    data = notAvailDataObj["data"];
                    let notAvailableResourcedata = notAvailDataObj["notAvailableResourcedata"];

                    // filter partial user fro not available user if any have less than 8 hours
                    let filterOataObj = this.filterPartialAndNotAvailableUsers(partialResource, notAvailableResourcedata);
                    notAvailableResourcedata = filterOataObj["notAvailableResourcedata"];
                    partialResource = filterOataObj["partialResource"];

                    //filter not available user for particular date if hours equal 8;
                    let filterDateDataObj = this.filterNotAvailableBookingDateBasedOnDate(partialResource, notAvailableResourcedata);
                    this.notAvailableResourcedata = filterDateDataObj["notAvailableResourcedata"];
                    this.partialResource = filterDateDataObj["partialResource"];
                    this.filteredAvailableResource();
                    this.getAllUserBySkill();
                    this.getBudgetedEffort();
                } else {
                    this.filteredAvailableResource();
                    this.getAllUserBySkill();
                    this.getBudgetedEffort();
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

    //filter booked resources data
    private filterSelectedTicketData(data) {
        this.bookedResourceData = [];
        for (let i = 0; i < data.length; i++) {
            if (this.selectedCSD == data[i].csdno) {
                this.bookedResourceData.push(data[i]);
            }
        }
    }

    // filter partial booking data
    private filterPartialBookingDate(data) {
        let partialResource = [];
        let dataObj = {};
        for (let i = 0; i < data.length;) {
            if (data[i].status.toLocaleLowerCase() == 'partial') {
                let indexNo = 0;
                partialResource.forEach((litem, index) => {
                    if (data[i].userid == litem.user_id) {
                        indexNo = indexNo + 1;
                        let userFound: boolean = false;
                        if (partialResource[index].userArr && partialResource[index].userArr.length > 0) {
                            partialResource[index].userArr.forEach((userDetail, userIndex) => {
                                if (data[i].bookingid == userDetail.bookingid) {
                                    userFound = true;
                                }
                            });
                        } else {
                            partialResource[index].userArr = [];
                        }
                        if (!userFound) {
                            partialResource[index].userArr.push(data[i]);
                        }
                        return;
                    }
                })
                if (indexNo == 0) {
                    let inactive = ''
                    if (data[i].fullname.indexOf('inactive') != -1) {
                        inactive = 'inactiveUserColor';
                    }
                    partialResource.push({ inactive: inactive, bookingid: data[i].bookingid, email: data[i].email, user_id: data[i].userid, bookingdate: data[i].bookingdate, user_name: data[i].fullname, percentage: data[i].percentage, assignhours: data[i].assignhours, status: data[i].status, csdno: data[i].csdno, userArr: [data[i]] });
                }
                data.splice(i, 1);
                i = 0;
            } else {
                i++;
            }
        }
        dataObj["data"] = data;
        dataObj["partialResource"] = partialResource;
        return dataObj;
    }

    // filter Not Available booking data
    private filterNotAvailableBookingDate(data) {
        let notAvailableResourcedata = [];
        let dataObj = {};
        for (let i = 0; i < data.length;) {
            if (data[i].status.toLocaleLowerCase() == 'not available') {
                let indexNo = 0;
                notAvailableResourcedata.forEach((litem, index) => {
                    if (data[i].userid == litem.user_id) {
                        indexNo = indexNo + 1;
                        let userFound: boolean = false;
                        if (notAvailableResourcedata[index].userArr && notAvailableResourcedata[index].userArr.length > 0) {
                            notAvailableResourcedata[index].userArr.forEach((userDetail, userIndex) => {
                                if (data[i].bookingid == userDetail.bookingid) {
                                    userFound = true;
                                }
                            });
                        } else {
                            notAvailableResourcedata[index].userArr = [];
                        }
                        if (!userFound) {
                            notAvailableResourcedata[index].userArr.push(data[i]);
                        }
                        return;
                    }
                })
                if (indexNo == 0) {
                    let inactive = ''
                    if (data[i].fullname.indexOf('inactive') != -1) {
                        inactive = 'inactiveUserColor';
                    }
                    notAvailableResourcedata.push({ inactive: inactive, bookingid: data[i].bookingid, email: data[i].email, user_id: data[i].userid, bookingdate: data[i].bookingdate, user_name: data[i].fullname, percentage: data[i].percentage, assignhours: data[i].assignhours, status: data[i].status, csdno: data[i].csdno, userArr: [data[i]] });
                }
                data.splice(i, 1);
                i = 0;
            } else {
                i++;
            }
        }
        dataObj["data"] = data;
        dataObj["notAvailableResourcedata"] = notAvailableResourcedata;
        return dataObj;
    }

    //filter not available user for particular date;
    private filterNotAvailableBookingDateBasedOnDate(partialResource, notAvailableResourcedata) {
        let dataObj = {};
        for (let i = 0; i < partialResource.length;) {
            let found = false;
            let hours = 0;
            partialResource.forEach((pitem, index) => {
                pitem.userArr.forEach((item, index) => {
                    if (partialResource[i].user_id == item.userid && partialResource[i].bookingdate == item.bookingdate) {
                        hours = hours + Number(item.assignhours);
                        if (hours >= 8) {
                            found = true;
                        }
                    }
                });
            });
            if (found) {
                notAvailableResourcedata.push(partialResource[i]);
                partialResource.splice(i, 1);
                i = 0;
            } else {
                i++;
            }
        }
        dataObj["partialResource"] = partialResource;
        dataObj["notAvailableResourcedata"] = notAvailableResourcedata;
        return dataObj;
    }

    // filter partial user fro not available user if any have less than 8 hours
    private filterPartialAndNotAvailableUsers(partialResource, notAvailableResourcedata) {
        let dataObj = {};
        partialResource.forEach((partialData, index) => {
            for (let i = 0; i < notAvailableResourcedata.length; i++) {
                if (partialData.user_id == notAvailableResourcedata[i].user_id) {
                    if (notAvailableResourcedata[i].userArr && notAvailableResourcedata[i].userArr.length > 0) {
                        notAvailableResourcedata[i].userArr.forEach((userData, ind) => {
                            partialResource[index].userArr.push(userData);
                        });
                    }
                    if (notAvailableResourcedata.indexOf(notAvailableResourcedata[i]) !== -1) {
                        notAvailableResourcedata.splice(notAvailableResourcedata.indexOf(notAvailableResourcedata[i]), 1);
                    }
                    i = 0;
                }
            }
        })
        dataObj["partialResource"] = partialResource;
        dataObj["notAvailableResourcedata"] = notAvailableResourcedata;
        return dataObj;
    }

    //filtered available resource
    private filteredAvailableResource() {
        if (this.currentUserList) {
            this.availableResource = [];
            for (let i = 0; i < this.currentUserList.length; i++) {
                var found = false;
                for (var j = 0; j < this.currentAvailableResource.length; j++) { // j < is missed;

                    if (this.currentUserList[i].user_name.toLowerCase() == this.currentAvailableResource[j].fullname.toLowerCase()) {
                        found = true;
                        break;
                    }
                }
                if (found == false) {
                    this.availableResource.push(this.currentUserList[i]);
                }
            }
            this.filterAvailableResource();
        }
    }

    // filter available resources from not available and partial
    private filterAvailableResource() {
        if (!this.availableResource || this.availableResource.length == 0) {
            return;
        }
        if (this.partialResource && this.partialResource.length > 0) {
            this.partialResource.forEach((partialData, index) => {
                for (let i = 0; i < this.availableResource.length;) {
                    if (partialData.user_id == this.availableResource[i].user_id) {
                        this.availableResource.splice(i, 1);
                        i = 0;
                    } else {
                        i++;
                    }
                }
            });
        }
        if (this.notAvailableResourcedata && this.notAvailableResourcedata.length > 0) {
            this.notAvailableResourcedata.forEach((notAvailableData, index) => {
                for (let j = 0; j < this.availableResource.length;) {
                    if (notAvailableData.user_id == this.availableResource[j].user_id) {
                        this.availableResource.splice(j, 1);
                        j = 0;
                    } else {
                        j++;
                    }
                }
            });
        }
        this.totalAvilUser = this.getTotalUsers(this.availableResource);
        this.totalPartAvilUser = this.getTotalUsers(this.partialResource);
        this.totalNotAvilUser = this.getTotalUsers(this.notAvailableResourcedata);
    }

    //Get users skill data
    private getAllUserBySkill() {
        for (let i = 0; i < this.fetchSkills.length; i++) {
            if (this.fetchSkills[i].skill_name == this.selectedSkill) {
                this.getUserSkillBySkillId(this.fetchSkills[i]);
            }
        }
    }

    // Get skill details using skill id
    private getUserSkillBySkillId(skill: any) {
        this.userSkills = [];
        let notAvailableRes = this.notAvailableResourcedata;
        let partialRes = this.partialResource;
        let availableRes = this.availableResource;
        this.resetResourcedDta();
        this.commonService.getUserSkillBySkillId(skill.skill_id).pipe(first()).subscribe(
            data => {
                for (let i = 0; i < data.length; i++) {
                    let obj = { skill_id: skill.skill_id, skill_name: skill.skill_name, skill_code: skill.skill_code, level: data[i].skill_level, user_id: data[i].user_id };
                    this.userSkills.push(obj);
                }
                this.notAvailableResourcedata = this.sortSkillLevel(notAvailableRes, this.userSkills);
                this.partialResource = this.sortSkillLevel(partialRes, this.userSkills);
                this.availableResource = this.sortSkillLevel(availableRes, this.userSkills);
                this.filterLevaedUsers();
            },
            error => {
                this.loading = false;
                localStorage.setItem('errorMsg', error.statusText);
                this.commonService.showerror();
                localStorage.removeItem('errorMsg');
            }
        )
    }

    // Sort user baded on skill level
    private sortSkillLevel(userlistArray: any[], userSkillArray: any[]) {
        let sortuserArray = [];
        for (let i = 0; i < userlistArray.length; i++) {
            for (let j = 0; j < userSkillArray.length; j++) {
                if (userlistArray[i].user_id == userSkillArray[j].user_id) {
                    sortuserArray.push({
                        skill_id: userSkillArray[j].skill_id,
                        skill_name: userSkillArray[j].skill_name,
                        skill_code: userSkillArray[j].skill_code,
                        level: userSkillArray[j].level,
                        user_id: userlistArray[i].user_id,
                        username: userlistArray[i].user_name,
                        user_typeResource: userlistArray[i].type_resource,
                        join_date: userlistArray[i].join_date,
                        leave_date: userlistArray[i].leave_date,
                        team: userlistArray[i].team,
                        user_list: userlistArray[i].userArr,
                        status: userlistArray[i].status,
                        csdno: userlistArray[i].csdno,
                        assignhours: userlistArray[i].assignhours,
                        email: userlistArray[i].email,
                        inactive: userlistArray[i].inactive
                    });
                }
            }
        }
        sortuserArray.sort(function (a, b) {
            if (a.level < b.level)
                return -1;
            if (a.level > b.level)
                return 1;
            return 0;
        });
        return sortuserArray;
    }

    //filter leave users(those user who has leave from the system)
    private filterLevaedUsers() {
        for (let i = 0; i < this.partialResource.length;) {
            let dataObj = this.partialResource[i];
            let user = this.getUserById(dataObj.user_id);
            if (!user.leave_date) {
                i++;
                continue
            }
            let current = new Date();
            let leaveDate = new Date(user.leave_date);
            if (current.getTime() > leaveDate.getTime()) {
                this.notAvailableResourcedata.push(dataObj);
                this.partialResource.splice(i, 1);
                i = 0;
            } else {
                i++
            }
        }
        for (let i = 0; i < this.availableResource.length;) {
            let dataObj = this.availableResource[i];
            let user = this.getUserById(dataObj.user_id);
            if (!user.leave_date) {
                i++;
                continue
            }
            let current = new Date();
            let leaveDate = new Date(user.leave_date);
            if (current.getTime() > leaveDate.getTime()) {
                this.notAvailableResourcedata.push(dataObj);
                this.availableResource.splice(i, 1);
                i = 0;
            } else {
                i++;
            }
        }
    }

    // Get details of html, storyline, Lectora users.
    private skillSelect(isReset: boolean, isCall: boolean) {
        this.resetResourcedDta();
        if (isCall) {
            this.getUserPlannedData(this.selectedCSD, this.userSelectedFromDate, this.userSelectedEndDate);
        }
        if (this.selectedSkill == "HTML") {
            this.commonService.getHtmlUsersDetails().pipe(first()).subscribe(
                data => {
                    this.htmlUserList = data;
                    this.currentuserSelectedList = this.htmlUserList;
                },
                error => {
                    this.loading = false;
                    localStorage.setItem('errorMsg', error.statusText);
                    this.commonService.showerror();
                    localStorage.removeItem('errorMsg');
                }
            )
        } else if (this.selectedSkill == "StoryLine") {
            this.commonService.getStorylineUsersDetails().pipe(first()).subscribe(
                data => {
                    this.storyLineUserList = data;
                    this.currentuserSelectedList = this.storyLineUserList;
                },
                error => {
                    this.loading = false;
                    localStorage.setItem('errorMsg', error.statusText);
                    this.commonService.showerror();
                    localStorage.removeItem('errorMsg');
                }
            )
        } else {
            this.commonService.getLectoraUsersDetails().pipe(first()).subscribe(
                data => {
                    this.lectoraUserList = data;
                    this.currentuserSelectedList = this.lectoraUserList;
                },
                error => {
                    this.loading = false;
                    localStorage.setItem('errorMsg', error.statusText);
                    this.commonService.showerror();
                    localStorage.removeItem('errorMsg');
                }
            )
        }
    }

    // move left available, partial and not available section
    private moveLeft(type: any) {
        if (type == "available") {
            this.ds.moveLeft();
        }
        if (type == "partial_available") {
            this.ds1.moveLeft();
        }
        if (type == "not_available") {
            this.ds2.moveLeft();
        }
    }

    // move right available, partial and not available section
    private moveRight(type: any) {
        if (type == "available") {
            this.ds.moveRight();
        }
        if (type == "partial_available") {
            this.ds1.moveRight();
        }
        if (type == "not_available") {
            this.ds2.moveRight();
        }
    }

    // show dailogbox
    private showHideDiv(divType: any) {
        this.showDiv = divType;
    }

    // checked unchecked users for deletion
    private setAndUnsetChecked(event: any, user: any) {
        let isChecked = false;
        if (event.target.hasAttribute('class') && event.target.parentNode.childNodes[0].childNodes[0] && event.target.parentNode.childNodes[0].childNodes[0].checked) {
            //Check when checkbox is not clicked
            if (event.target.classList.contains('img-fluid')) {
                //Check if checkbox is checked
                if (event.target.parentNode.childNodes[0].childNodes[0].checked) {
                    // if checkbox is checked then uncheck it
                    isChecked = false;
                    event.target.parentNode.childNodes[0].childNodes[0].checked = false;
                    event.target.parentNode.childNodes[0].classList.add('hoverClass');
                } else {
                    isChecked = true;
                    event.target.parentNode.childNodes[0].childNodes[0].checked = true;
                    event.target.parentNode.childNodes[0].classList.remove('hoverClass')
                }
            } else if (event.target.classList.contains('displayUserProfile')) {
                //Check if checkbox is checked
                if (event.target.childNodes[0].childNodes[0].checked) {
                    isChecked = false;
                    event.target.childNodes[0].childNodes[0].checked = false;
                    event.target.childNodes[0].classList.add('hoverClass');
                } else {
                    isChecked = true;
                    event.target.childNodes[0].childNodes[0].checked = true;
                    event.target.childNodes[0].classList.remove('hoverClass');
                }
            }
        } else {
            //Check if target is checkbox
            if (event.target.type === 'checkbox') {
                //Check if checkbox is checked
                if (event.target.checked) {
                    isChecked = true;
                    event.target.parentNode.classList.remove('hoverClass');
                } else {
                    isChecked = false;
                    event.target.parentNode.classList.add('hoverClass')
                }
            }
        }
        if (user) {
            if (isChecked) {
                //validate for user leaving and joining dates
                let userInfo = this.getUserById(user.user_id);
                let userErrorMsg = false;
                userErrorMsg = this.validateJoiningDate(userInfo, new Date(this.userSelectedFromDate));
                if (!userErrorMsg) {
                    userErrorMsg = this.validateLeavingDate(userInfo, new Date(this.userSelectedEndDate));
                }
                if (userErrorMsg) {
                    let errorMsg = "";
                    if (userInfo.join_date) {
                        errorMsg = userInfo.user_name + " Available from: " + this.common.getDatesYYMMDD(userInfo.join_date) + " ";
                    }
                    if (userInfo.leave_date) {
                        errorMsg = errorMsg + " To: " + this.common.getDatesYYMMDD(userInfo.leave_date);
                    }
                    isChecked = false;
                    event.target.checked = false;
                    event.target.parentNode.classList.add('hoverClass')
                    localStorage.setItem('errorMsg', errorMsg);
                    this.commonService.showerror();
                    return;
                } else {
                    this.checkedUsersArray.push(user);
                }
            } else {
                if (this.checkedUsersArray.indexOf(user) !== -1) {
                    this.checkedUsersArray.splice(this.checkedUsersArray.indexOf(user), 1);
                }
            }
        }
        this.assignHours = Number(this.assignHour);
    }

    // get user info
    private getUserById(userId) {
        let user = null;
        for (let i = 0; i < this.currentUserList.length; i++) {
            if (userId == this.currentUserList[i].user_id) {
                user = this.currentUserList[i];
                break;
            }
        }
        return user;
    }

    // validate resoucre joining date should be equal or greterthen from current date 
    private validateJoiningDate(userInfo, startDate) {
        if (!startDate) {
            startDate = new Date();
        }
        userInfo = this.getUserById(userInfo.user_id);
        if (!userInfo.join_date) {
            return false;
        }
        let joinTime = this.common.getTime(userInfo.join_date);
        let startTime = this.common.getTime(startDate);
        if (joinTime > startTime) {
            return true;
        }
        return false;
    }

    // validate resoucre leaving date should be equal or lessthen from current date
    private validateLeavingDate(userInfo, endDate) {
        if (!endDate) {
            endDate = new Date();
        }
        userInfo = this.getUserById(userInfo.user_id);
        if (!userInfo.leave_date) {
            return false;
        }
        let endTime = this.common.getTime(endDate);
        let leavingTime = this.common.getTime(userInfo.leave_date);
        if (endTime > leavingTime) {
            return true;
        }
        return false;
    }

    // check selected users is valid for booking i.e hours should be less or equal 8
    private calculateBookedUserData() {
        this.showHideModel = false;
        if (!this.selectedAssignee || this.selectedAssignee <= 1) {
            localStorage.setItem('errorMsg', "Please Select Assignee");
            this.commonService.showerror();
            return;
        }
        if (!this.selectedCSD || this.selectedCSD <= 1 || this.selectedCSD == "Select CSD") {
            localStorage.setItem('errorMsg', "Please Select CSD Ticket");
            this.commonService.showerror();
            return;
        }
        if (!this.userSelectedFromDate || !this.userSelectedFromDate) {
            localStorage.setItem('errorMsg', "Please Select Date Range");
            this.commonService.showerror();
            return;
        }
        if (this.checkedUsersArray.length == 0) {
            localStorage.setItem('errorMsg', "Please Select User");
            this.commonService.showerror();
            return;
        }
        if (this.checkedUsersArray.length > 0) {
            this.totalDays = this.workingDaysBetweenDates(new Date(this.userSelectedFromDate), new Date(this.userSelectedEndDate));
            let plannedBudgetedEffort = (Number(this.checkedUsersArray.length) * Number(this.assignHour) * Number(this.totalDays));
            let totalPlannedBudgetedEffort = Number(this.budgetedEfforts) - Number(this.totalPlannedBudgetedEffort);
            let totalRemainBudgetedEffort = Number(totalPlannedBudgetedEffort) - Number(plannedBudgetedEffort);
            if (totalRemainBudgetedEffort < 0) {
                localStorage.setItem('errorMsg', "Planned hours should not be greater than budgeted efforts");
                this.commonService.showerror();
                return;
            } else {
                let isBookingValid = true;
                for (let i = 0; i < this.checkedUsersArray.length; i++) {
                    if (this.checkedUsersArray[i].user_list) {
                        isBookingValid = this.validateUsersBooking(this.checkedUsersArray[i].user_list);
                        if (!isBookingValid) {
                            break;
                        }
                    }
                }
                this.showHideModel = isBookingValid;
            }
        }
    }

    // check selected users is valid for booking i.e hours should be less or equal 8
    private validateUsersBooking(userArr: any[]) {
        let isBookingValid = true;
        for (let user of userArr) {
            let totalAssignHours = 0;
            userArr.forEach((subUser, subInd) => {
                let userBookingDate = new Date(user.bookingdate);
                userBookingDate.setHours(0, 0, 0, 0);
                let subUserBookingDate = new Date(subUser.bookingdate);
                subUserBookingDate.setHours(0, 0, 0, 0);
                if (userBookingDate.getTime() == subUserBookingDate.getTime()) {
                    totalAssignHours = Number(totalAssignHours) + Number(subUser.assignhours);
                }
            });
            totalAssignHours = Number(totalAssignHours) + Number(this.assignHours);
            if (totalAssignHours > 8) {
                isBookingValid = false;
                let userBookingDate: any = new Date(user.bookingdate);
                userBookingDate = userBookingDate.getFullYear() + "-" + Number(userBookingDate.getMonth() + 1) + "-" + userBookingDate.getDate();
                localStorage.setItem('errorMsg', user.fullname + " assign hours can not be greater-than 8 hours at date :" + userBookingDate);
                this.commonService.showerror();
                break;
            }
        };
        return isBookingValid;
    }

    // add users booking
    private bookedUser() {
        this.assignHours = Number(this.assignHours);
        if (this.checkedUsersArray.length == 0 || !this.selectedCSD || !this.userSelectedFromDate || !this.userSelectedEndDate || Number(this.assignHours) == 0) {
            this.loading = false;
            localStorage.setItem('errorMsg', 'Please select Availabel/Partial User CSD StartDate and EndDate');
            this.commonService.showerror();
            return false;
        }
        let userBookingData = [];
        let updatedUserData = [];
        let percentage = this.assignHours * 100 / 8;
        let status = this.getStatus(percentage);
        let add = false;
        for (let i = 0; i < this.checkedUsersArray.length; i++) {
            let user = this.checkedUsersArray[i];
            if (this.checkedUsersArray[i].user_list) {
                user = this.checkedUsersArray[i].user_list;
            }
            if (user.length > 0) {
                let calDateArr = this.getDateArray(new Date(this.userSelectedFromDate), new Date(this.userSelectedEndDate));
                for (let k = 0; k < calDateArr.length; k++) {
                    for (let j = 0; j < user.length; j++) {
                        if (user[j].userid && user[j].status == "Partial" && user[j].csdno == this.selectedCSD) {
                            let totalAssignHours = Number(user[j].assignhours) + (this.assignHours);
                            if (totalAssignHours > 8) {
                                localStorage.setItem('errorMsg', "Partially assign hours can not be greater-than 8 hours");
                                this.commonService.showerror();
                                break;
                            } else {
                                let foundEndDateIndex = -1;
                                user.forEach((dateStr, ind) => {
                                    let isDateEqual = this.common.compareTwoDates(dateStr.bookingdate, calDateArr[k]);
                                    if (isDateEqual) {
                                        foundEndDateIndex = ind;
                                        return;
                                    }
                                });
                                // Set users data for update
                                let currentEndDate: any = new Date(user[j].bookingdate);
                                currentEndDate = currentEndDate.getFullYear() + "-" + Number(currentEndDate.getMonth() + 1) + "-" + currentEndDate.getDate();
                                let isDateEqual = this.common.compareTwoDates(user[j].bookingdate, calDateArr[k]);
                                if (isDateEqual) {
                                    user[j].assignhours = totalAssignHours;
                                    let percentage = totalAssignHours * 100 / 8;
                                    user[j].percentage = percentage;
                                    user[j].status = this.getStatus(percentage);
                                    user[j].bookingdate = currentEndDate;
                                    user[j]["updatedUser"] = this.users.displayName;
                                    user[j]["updatedAssignhours"] = this.assignHours;
                                    updatedUserData.push(user[j]);
                                    add = true;
                                    break;
                                } else if (foundEndDateIndex == -1) {
                                    add = true;
                                    let foundUser = false;
                                    userBookingData.forEach((dateStr, ind) => {
                                        let isDatesEqual = this.common.compareTwoDates(dateStr.bookingdate, calDateArr[k]);
                                        if (isDatesEqual && dateStr.email == user[j].email) {
                                            foundUser = true;
                                            return;
                                        }
                                    });
                                    if (!foundUser) {
                                        userBookingData.push({
                                            csdno: user[j].csdno,
                                            clientName: this.clientName,
                                            userid: user[j].userid,
                                            email: user[j].email,
                                            fullname: user[j].fullname,
                                            assignhours: this.assignHours,
                                            percentage: percentage,
                                            bookingdate: calDateArr[k],
                                            status: status,
                                            avatarUrls: this.displayPicture,
                                            createdUser: this.users.displayName
                                        });
                                    }
                                }
                            }
                        } else if (user[j].status !== "Not Available") {
                            add = true;
                            let userData = user[j];
                            let foundUser = false;
                            userBookingData.forEach((dateStr, ind) => {
                                let isDatesEqual = this.common.compareTwoDates(dateStr.bookingdate, calDateArr[k]);
                                if (isDatesEqual && dateStr.email == user[j].email) {
                                    foundUser = true;
                                    return;
                                }
                            });
                            if (!foundUser) {
                                userBookingData.push({
                                    csdno: this.selectedCSD,
                                    clientName: this.clientName,
                                    userid: userData.userid,
                                    email: userData.email,
                                    fullname: userData.fullname,
                                    assignhours: this.assignHours,
                                    percentage: percentage,
                                    bookingdate: calDateArr[k],
                                    status: status,
                                    avatarUrls: this.displayPicture,
                                    createdUser: this.users.displayName
                                });
                            }
                        }
                    }
                }
            } else {
                add = true;
                let calDateArr = this.getDateArray(new Date(this.userSelectedFromDate), new Date(this.userSelectedEndDate));
                for (let j = 0; j < calDateArr.length; j++) {
                    userBookingData.push({
                        csdno: this.selectedCSD,
                        clientName: this.clientName,
                        userid: user.user_id,
                        email: user.email,
                        fullname: user.username,
                        assignhours: this.assignHours,
                        percentage: percentage,
                        bookingdate: calDateArr[j],
                        status: status,
                        avatarUrls: this.displayPicture,
                        createdUser: this.users.displayName
                    });
                }
            }
        }
        if (add) {
            this.loading = true;
            userBookingData = this.filteredBookingData(userBookingData, updatedUserData);
            this.commonService.addBookedUser(this.changeCSDStatus, this.selectedCSD, this.currentCSDStatus, userBookingData, updatedUserData).pipe(first())
                .subscribe(res => {
                    this.loading = false;
                    if (res && res.error) {
                        localStorage.setItem('errorMsg', res.error);
                        this.commonService.showerror();
                    } else {
                        localStorage.setItem("csd", this.selectedCSD);
                        localStorage.setItem("assignee", this.selectedAssignee);
                        localStorage.setItem('errorMsg', 'Booked successfully!!');
                        this.ngOnInit();
                        this.commonService.showerror();
                    }
                },
                    error => {
                        this.loading = false;
                        localStorage.setItem('errorMsg', 'Bad Credential');
                        this.commonService.showerror();
                    });
        }
    }

    // filtered booking data
    private filteredBookingData(userBookingData: any[], updatedUserData: any[]) {
        for (let i = 0; i < updatedUserData.length;) {
            let found = false;
            for (let j = 0; j < userBookingData.length; j++) {
                if (userBookingData[j].csdno == updatedUserData[i].csdno && userBookingData[j].bookingdate == updatedUserData[i].bookingdate) {
                    userBookingData.splice(j, 1);
                    found = true;
                    break
                }
            }
            if (found) {
                i = 0;
            } else {
                i++;
            }
        }
        return userBookingData;
    }

    // get working days count from start and end dates
    private workingDaysBetweenDates(startDate, endDate) {
        var millisecondsPerDay = 86400 * 1000;
        startDate.setHours(0, 0, 0, 1);
        endDate.setHours(23, 59, 59, 999);
        var diff = endDate - startDate;
        var days = Math.ceil(diff / millisecondsPerDay);
        // Subtract two weekend days for every week in between
        var weeks = Math.floor(days / 7);
        days = days - (weeks * 2);
        // Handle special cases
        var startDay = startDate.getDay();
        var endDay = endDate.getDay();
        // Remove weekend not previously removed.
        if (startDay - endDay > 1) {
            days = days - 2;
        }
        // Remove start day if span starts on Sunday but ends before Saturday
        if (startDay === 0 && endDay != 6) {
            days = days - 1;
        }
        // Remove end day if span ends on Saturday but starts after Sunday
        if (endDay === 6 && startDay !== 0) {
            days = days - 1;
        }
        return days;
    }

    //set and unset checked user booking data for delete
    private setAndUnsetCheckedUserDelete(event: any, user: any, array: any[]) {
        if (user) {
            if (event.target.checked) {
                this.totalDeletedHours = Number(this.totalDeletedHours) + Number(user.assignhours);
                this.checkedDeleteUsersArray.push(user);
            } else {
                const index: number = this.getIndexOf(user);
                if (index !== -1) {
                    this.totalDeletedHours = Number(this.totalDeletedHours) - Number(user.assignhours);
                    this.checkedDeleteUsersArray.splice(index, 1);
                }
            }
        } else {
            if (this.isSelected || this.isMBSelected) {
                this.checkedDeleteUsersArray = [];
                array.forEach((obj, index) => {
                    if (obj.user) {
                        this.totalDeletedHours = Number(this.totalDeletedHours) + Number(obj.user.assignhours);
                    } else {
                        this.totalDeletedHours = Number(this.totalDeletedHours) + Number(obj.assignhours);
                    }
                    this.checkedDeleteUsersArray.push(obj);
                });
            } else {
                this.totalDeletedHours = 0;
                this.checkedDeleteUsersArray = [];
            }
        }
        event.preventDefault();
    }

    // return the index of user
    private getIndexOf(user) {
        let index = -1
        for (let i = 0; i < this.checkedDeleteUsersArray.length; i++) {
            let userData = null
            if (this.checkedDeleteUsersArray[i].user) {
                userData = this.checkedDeleteUsersArray[i].user;
            } else {
                userData = this.checkedDeleteUsersArray[i];
            }
            if (userData && userData.userid == user.userid && userData.bookingid == user.bookingid) {
                index = i;
                break;
            }
        }
        return index;
    }

    // set all checked users for delete bookings information
    private deleteAllCheckedUser(event: any) {
        if (this.checkedDeleteUsersArray.length == 0) {
            localStorage.setItem('errorMsg', " Please select user for delete ");
            this.commonService.showerror();
        } else {
            this.deleteCheckedUser(null, event);
        }
        event.preventDefault();
    }

    // remove all checked users booking infromation
    private deleteCheckedUser(user: any, event: any) {
        event.preventDefault();
        let deletedUser = [];
        let deletedUserList = [];
        if (user) {
            if (user.bookingid) {
                deletedUser.push(user.bookingid);
                user["deletedByUser"] = this.users.displayName;
                deletedUserList.push(user);
            } else if (user.user.bookingid) {
                deletedUser.push(user.user.bookingid);
                user.user["deletedByUser"] = this.users.displayName;
                deletedUserList.push(user.user);
            }
        } else {
            this.checkedDeleteUsersArray.forEach((checkedUser, index) => {
                if (checkedUser.bookingid) {
                    deletedUser.push(checkedUser.bookingid);
                    checkedUser["deletedByUser"] = this.users.displayName;
                    deletedUserList.push(checkedUser);
                } else if (checkedUser.user.bookingid) {
                    deletedUser.push(checkedUser.user.bookingid);
                    checkedUser.user["deletedByUser"] = this.users.displayName;
                    deletedUserList.push(checkedUser.user);
                }
            });
        }
        if (deletedUser.length > 0) {
            this.loading = true;
            this.commonService.deleteUserData(deletedUser, this.selectedCSD, deletedUserList).pipe(first()).subscribe(
                data => {
                    this.removeMoreInfoUserBooking(deletedUserList);
                    localStorage.setItem("csd", this.selectedCSD);
                    localStorage.setItem("assignee", this.selectedAssignee);
                    localStorage.setItem('errorMsg', " Your booking has been cancelled successfully!!!!! ");
                    this.ngOnInit();
                    this.commonService.showerror();
                },
                error => {
                    this.loading = false;
                    localStorage.setItem('errorMsg', error.statusText);
                    this.commonService.showerror();
                }
            )

        }
    }

    private setUserForDelete(user: any) {
        this.totalDeletedHours = 0;
        if (user) {
            this.totalDeletedHours = Number(user.assignhours);
            this.checkedDeleteUsersArray.push(user);
        }
    }
    // remove entry from array of dailogbox
    private removeMoreInfoUserBooking(deletedUsers) {
        for (let i = 0; i < deletedUsers.length; i++) {
            // remove booking from the moreInfo booking dailog
            for (let j = 0; j < this.moreInfoArr.length; j++) {
                let user = this.moreInfoArr[j].user;
                if (deletedUsers[i].bookingid && user.bookingid == deletedUsers[i].bookingid && deletedUsers[i].userid == user.userid) {
                    this.moreInfoArr.splice(j, 1);
                }
            }
            // remove booking from the manage booking dailog
            for (let j = 0; j < this.bookedResourceData.length; j++) {
                let user = this.bookedResourceData[j];
                if (deletedUsers[i].bookingid && user.bookingid == deletedUsers[i].bookingid && deletedUsers[i].userid == user.userid) {
                    this.bookedResourceData.splice(j, 1);
                }
            }
        }
        //close more info dailog if length equal 0
        if (this.moreInfoArr.length == 0) {
            this.closeModels();
        }
        //close manage booking dailog if length equal 0
        if (this.bookedResourceData.length == 0) {
            this.closeManageBookingModels();
        }
    }

    // disable calender date
    private isDisabled(date: NgbDateStruct) {
        const d = new Date(date.year, date.month - 1, date.day);
        return d.getDay() === 0 || d.getDay() === 6;
    }

    // get dates array from start and end date
    private getDateArray(start, end) {
        var arr = new Array();
        var dt = new Date(start);
        while (dt <= end) {
            var date = new Date(dt)
            var day = '' + date.getDate() + '';
            if (date.getDate() < 10) {
                day = '0' + date.getDate()
            }
            if (!(date.toString()).toLocaleLowerCase().includes("sat") && !(date.toString()).toLocaleLowerCase().includes("sun")) {
                arr.push(date.getFullYear() + "-" + Number(date.getMonth() + 1) + "-" + day);
            }
            dt.setDate(dt.getDate() + 1);
        }
        return arr;
    }

    // reset all resource data objects
    private resetResourcedDta() {
        this.notAvailableResourcedata = [];
        this.partialResource = [];
        this.availableResource = [];
        this.checkedUsersArray = [];
        this.checkedDeleteUsersArray = [];
    }

    //get the status of hours percentage
    private getStatus(percentage: Number) {
        let status = "";
        if (percentage < 100) {
            status = "Partial"
        } else if (percentage == 100) {
            status = "Not Available"
        }
        return status;
    }

    // configure more info data for shown
    private moreInfo(user: any) {
        this.totalAssignHours = 0;
        if (user && user.user_list.length > 0) {
            this.moreInfoArr = [];
            for (let i = 0; i < user.user_list.length; i++) {
                this.totalAssignHours = Number(this.totalAssignHours) + Number(user.user_list[i].assignhours);
                this.moreInfoArr.push({ bookingdate: user.user_list[i].bookingdate, user: user.user_list[i] });
            }
        }
    }
    private excelReport() {
        let headders = ["S.No", "Resource Name", "Resource Type",
            "Booked By Manager", "CSDNO", "Client Name", "Assign Hour",
            "Booking Date", "Percentage", "Availability", "Booking Created Date"];
        let excelExportData = [];
        for (let i = 0; i < this.bookedResourceData.length; i++) {
            let data = {};
            data[headders[0]] = i + 1;
            data[headders[1]] = this.bookedResourceData[i].fullname;
            let user = this.getUserById(this.bookedResourceData[i].userid)
            if (user) {
                data[headders[2]] = user.type_resource;
            } else {
                data[headders[2]] = "";
            }
            data[headders[3]] = this.bookedResourceData[i].createdByUser;
            data[headders[4]] = this.bookedResourceData[i].csdno;
            data[headders[5]] = this.bookedResourceData[i].clientName;
            data[headders[6]] = this.bookedResourceData[i].assignhours;
            data[headders[7]] = this.common.getDateDDMMYY(this.bookedResourceData[i].bookingdate);
            data[headders[8]] = this.bookedResourceData[i].percentage;
            data[headders[9]] = this.bookedResourceData[i].status;
            data[headders[10]] = this.common.getDateDDMMYY(this.bookedResourceData[i].createdDate);
            excelExportData.push(data);
        }
        this.excelService.generateExcel(headders, excelExportData, 'bookedResources');
    }


    // change flag show and hide dive
    private changeAction() {
        this.showHidePopup = true;
    }

    //close more info model box
    private closeModels() {
        this.closeModel.nativeElement.click();
    }

    //close manage planned booking model box
    private closeManageBookingModels() {
        if (this.closeManageBookingModel && this.closeManageBookingModel.nativeElement) {
            this.closeManageBookingModel.nativeElement.click();
        }
    }

    // forward to next section
    private gotoNextPage(e, routeURL) {
        localStorage.setItem("csd", this.selectedCSD);
        localStorage.setItem("assignee", this.selectedAssignee);
        this.router.navigate([routeURL]);
    }

    //logout and forward to next section
    private logout() {
        this.commonService.logout();
    }
}
