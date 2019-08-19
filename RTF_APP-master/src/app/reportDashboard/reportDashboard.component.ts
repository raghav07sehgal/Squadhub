import { Component, OnInit, Compiler } from '@angular/core';
import { CommonService } from '../service/commons-service';
import { Router } from '@angular/router';

@Component({
    templateUrl: 'reportDashboard.component.html?v=${new Date().getTime()}',
    styleUrls: ['reportDashboard.component.css?v=${new Date().getTime()}']

})
export class ReportDashboardComponent implements OnInit {
    private users: any = {};
    private loading = false;
    private loginImageURL: any = "";
    private loginUserName: any = "";

    constructor(private router: Router,
        private commonService: CommonService,
        private _compiler: Compiler) {
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
    }

    ngOnInit() {
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