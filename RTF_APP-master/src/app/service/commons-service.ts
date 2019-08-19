import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { DialogService } from "ng2-bootstrap-modal";
import { Observable } from 'rxjs';
import { ErrorComponent } from '../confirm/error.component';
import { AppConfig } from '../util';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class CommonService {
    private baseURL: any = null;
    constructor(private http: HttpClient, private dialogService: DialogService,
        private router: Router,
        private appConfig: AppConfig) {
        this.baseURL = appConfig.getServerURL();
    }

    public showerror() {
        this.dialogService.addDialog(ErrorComponent, {
            title: 'Confirm title',
            message: 'Confirm message'
        })
    }

    // authentication with JIRA credentials
    public login(username: string, password: string) {
        return this.http.post<any>(this.baseURL + 'login', { username: username, password: password })
            .pipe(map(res => {
                // login successful if there's a jwt token in the response
                if (res && res.data != null) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('user', JSON.stringify({ username: username, password: password, userData: res.data }));
                }
                return res;
            }));
    }

    // remove local storage data and forward to login page
    public logout() {
        localStorage.removeItem('data');
        localStorage.removeItem('user');
        localStorage.removeItem('errorMsg');
        localStorage.removeItem('cepData');
        localStorage.removeItem('cepUserList');
        localStorage.removeItem('userLogsData');
        localStorage.removeItem('userList');
        localStorage.removeItem('stakeHolder');
        localStorage.removeItem('userDetails');
        localStorage.removeItem('formDetails');
        localStorage.removeItem('csd');
        this.router.navigate(['/login']);
    }

    // Get users which are having leaving date >= current date
    public getCurrentAvailableUsers() {
        return this.http.post<any>(this.baseURL + 'getCurrentAvailableUsers', {})
            .pipe(map(res => {
                return res.data;
            }))
    }

    // Get skills details
    public getSkillDetails(): Observable<any> {
        return this.http.get<any>(this.baseURL + 'getSkillDetails').pipe(map(res => {
            return res.data;
        }))
    }

    //Get jira ticket status list
    public getJIRATicketStatusList(searchCSDNo: string, username: string, password: string, status: string) {
        return this.http.post<any>(this.baseURL + 'getUsersAndToBePlanned', { searchCSDNo: searchCSDNo, username: username, password: password, status: status })
            .pipe(map(res => {
                if (res && res.data) {
                }
                return res.data[0].filteredIssues;
            }));
    }

    //Get selected ticket total planned hours
    public getSelectedTicketPlannedCount(selectedValue: any): Observable<any> {
        return this.http.post<any>(this.baseURL + 'getSelectedTicketPlannedCount', { csdno: selectedValue })
            .pipe(map(res => {
                return res.data;
            }))
    }

    //Get users planned data
    public getUserPlannedData(selectedValue: any, startdate: any, enddate: any): Observable<any> {
        return this.http.post<any>(this.baseURL + 'getUserPlannedData', { csdno: selectedValue, startdate: startdate, enddate: enddate })
            .pipe(map(res => {
                return res.data;
            }))
    }

    // Get user skill by using skill id
    public getUserSkillBySkillId(skill_id: any): Observable<any> {
        return this.http.post<any>(this.baseURL + 'getUserSkillBySkillId', { skill_id: skill_id })
            .pipe(map(res => {
                return res.data;
            }))
    }

    // Get HTML users details
    public getHtmlUsersDetails(): Observable<any> {
        return this.http.get<any>(this.baseURL + 'getHtmlUsersDetails').pipe(map(res => {
            return res.data;
        }))
    }

    // Get storyline users details
    public getStorylineUsersDetails(): Observable<any> {
        return this.http.get<any>(this.baseURL + 'getStorylineUsersDetails').pipe(map(res => {
            return res.data;
        }))
    }

    // Get lectora user details
    public getLectoraUsersDetails(): Observable<any> {
        return this.http.get<any>(this.baseURL + 'getLectoraUsersDetails').pipe(map(res => {
            return res.data;
        }))
    }

    // Get Booking data for reduce hours
    public getBookings(formData): Observable<any> {
        return this.http.post<any>(this.baseURL + 'getBookings', { formData: formData })
            .pipe(map(res => {
                return res.data;
            }))
    }

    // Get Booking data for reduce hours
    public getUserBookingData(formData): Observable<any> {
        return this.http.post<any>(this.baseURL + 'getUserBookingData', { formData: formData })
            .pipe(map(res => {
                return res.data;
            }))
    }

    // Get Booking data for reduce hours
    public getBookingData(formData): Observable<any> {
        return this.http.post<any>(this.baseURL + 'getBookingData', { formData: formData })
            .pipe(map(res => {
                return res.data;
            }))
    }

    // Get Booking data for reduce hours
    public updateBookingHours(bookingData): Observable<any> {
        return this.http.post<any>(this.baseURL + 'updateBookingHours', { bookingData: bookingData })
            .pipe(map(res => {
                return res.data;
            }))
    }

    // Get all the users information list
    public getAllUsers(startDate) {
        return this.http.post<any>(this.baseURL + 'getAllUsers', { startDate: startDate })
            .pipe(map(res => {
                return res.data;
            }))
    }

    // booked user
    public addBookedUser(changeCSDStatus: any, selectedCSD: any, currentCSDStatus: any, userBookingData: any, updatedUserData: any) {
        return this.http.post<any>(this.baseURL + 'addBookedUser', { changeCSDStatus: changeCSDStatus, cSDNo: selectedCSD, cSDStatus: currentCSDStatus, bookedUsers: userBookingData, updatedUserData: updatedUserData })
            .pipe(map(res => {
                return res;
            }))
    }

    // delete user booking data
    public deleteUserData(deletedUser: any, selectedCSDNo, deletedUserList): Observable<any> {
        return this.http.post<any>(this.baseURL + 'deleteBookedUser', { deletedUser: deletedUser, selectedCSDNo: selectedCSDNo, deletedUserList: deletedUserList })
            .pipe(map(res => {
                return res.data;
            }))
    }

    // Get CSD info and generate consolidated report
    public getCEPReport(username: string, password: string, startDate: String, endDate: String, filterName: String) {
        return this.http.post<any>(this.baseURL + 'CEPReport', { username: username, password: password, startDate: startDate, endDate: endDate, filterName: filterName })
            .pipe(map(res => {
                return res.data;
            }));
    }

    // generate user logged data
    public getuserLogsReport(username: string, password: string, startDate: String, endDate: String, filterName: String) {
        return this.http.post<any>(this.baseURL + 'userLogs', { username: username, password: password, startDate: startDate, endDate: endDate, filterName: filterName })
            .pipe(map(res => {
                return res;
            }));
    }

    // Get booked CSD inforamation data based on user
    public getUserTaskDetail(username: string, password: string) {
        return this.http.post<any>(this.baseURL + 'getUsersAndToBePlanned', { username: username, password: password })
            .pipe(map(res => {
                return res.data;
            }));
    }

    // Get list of all CSD
    public getAllCSDs(startdate: any, enddate: any): Observable<any> {
        return this.http.post<any>(this.baseURL + 'getAllCSDList', { startdate: startdate, enddate: enddate })
            .pipe(map(res => {
                return res.data;
            }))
    }

    // Get all CSD clinet name from JIRA
    public getAllCSDClinetNameFromJIRA(csdsStr, username, password, noOfCSD): Observable<any> {
        return this.http.post<any>(this.baseURL + 'getAllCSDClinetNameFromJIRA', { csdsStr: csdsStr, username: username, password: password, noOfCSD: noOfCSD })
            .pipe(map(res => {
                return res.data;
            }))
    }

    // save user data
    public saveData(formDetails: any) {
        return this.http.post<any>(this.baseURL + 'addWorkallocation', formDetails)
            .pipe(map(res => {
                return res.data;
            }))
    }

    // Get workLoad data
    public getworkLoadData(formDetails: any) {
        return this.http.post<any>(this.baseURL + 'workload', formDetails)
            .pipe(map(res => {
                return res.data;
            }))
    }

    // save user data
    public saveUserData(formDetails: any) {
        return this.http.post<any>(this.baseURL + 'assignUser', { formDetails: formDetails })
            .pipe(map(res => {
                return res.data;
            }))
    }

    // delete user information
    public userDeletion(userInfo: any) {
        return this.http.post<any>(this.baseURL + 'deleteUser', { userInfo: userInfo })
            .pipe(map(res => {
                return res.data;
            }))
    }

    // update user information
    public updateUserData(formDetails: any, updateSkillSetData: any) {
        return this.http.post<any>(this.baseURL + 'updateUser', { formData: formDetails, updateSkillSetData: updateSkillSetData })
            .pipe(map(res => {
                return res.data;
            }))
    }

    // Get saved user data
    public getSaveData(): Observable<any> {
        return this.http.get<any>(this.baseURL + 'fetchUser')
            .pipe(map(res => {
                return res.data;
            }))
    }

    // fetch all skills
    public fetchAllSkills(userIds: any[]): Observable<any> {
        return this.http.post<any>(this.baseURL + 'fetchAllSkills', { userIds: userIds })
            .pipe(map(res => {
                return res.data;
            }))
    }

    // fetch skill data
    public fetchSkillData(): Observable<any> {
        return this.http.get<any>(this.baseURL + 'fetchSkillData')
            .pipe(map(res => {
                return res.data;
            }))
    }

    // save skills data
    public saveSkillsData(userSkillData) {
        return this.http.post<any>(this.baseURL + 'saveSkillsData', { userSkillData: userSkillData })
            .pipe(map(res => {
                return res.data;
            }))
    }

    // Get all user list
    public getAllUserList() {
        return this.http.get<any>(this.baseURL + 'getAllUserList').pipe(map(res => {
            return res.data;
        }))
    }

    // Get utilization resource data
    public getUtilizationResource(startDate, endDate) {
        return this.http.post<any>(this.baseURL + 'utilizationResource', { startDate: startDate, endDate: endDate }).pipe(map(res => {
            return res.data;
        }))
    }

    // Get booked utilization resource data
    public getBookedUtilizationResource(startDate, endDate) {
        return this.http.post<any>(this.baseURL + 'bookedUtilizationResource', { startDate: startDate, endDate: endDate }).pipe(map(res => {
            return res.data;
        }))
    }

    // Get resource history information
    public getResourcesHistory(startDate, endDate) {
        return this.http.post<any>(this.baseURL + 'getResourcesHistory', { startDate: startDate, endDate: endDate }).pipe(map(res => {
            return res.data;
        }))
    }
}
