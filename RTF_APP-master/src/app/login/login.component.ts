import { Component, OnInit, Compiler } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first, retry } from 'rxjs/operators';
import { CommonService } from '../service/commons-service';
import { AppConfig } from '../util';

@Component({
    templateUrl: 'login.component.html?v=${new Date().getTime()}',
    styleUrls: ['login.component.css?v=${new Date().getTime()}']
})
export class LoginComponent implements OnInit {
    private loginForm: FormGroup;
    private loading = false;
    private submitted = false;
    private baseURL: any = null;
    private appConfig: AppConfig;

    constructor(
        private formBuilder: FormBuilder, private router: Router,
        private commonService: CommonService,
        appConfig: AppConfig, private _compiler: Compiler) {
        this._compiler.clearCache();
        this.appConfig = appConfig;
        this.baseURL = appConfig.getServerURL();
    }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    //user login with jira credential
    private authenticatUser() {
        // stop here if form is invalid
        if (!this.loginForm.controls.username.value && !this.loginForm.controls.password.value) {
            localStorage.setItem('errorMsg', this.appConfig.getBlankLoginErrorMsg());
            this.commonService.showerror();
            return;
        }
        this.submitted = true;
        this.loading = true;
        this.commonService.login(this.loginForm.controls.username.value, this.loginForm.controls.password.value)
            .pipe(first())
            .subscribe(
                res => {
                    if (res && res.data != null) {
                        localStorage.setItem('userDetails', JSON.stringify({ userName: this.loginForm.controls.username.value, password: this.loginForm.controls.username.value }));
                        this.router.navigate(['/dashboard']);
                    } else {
                        this.loading = false;
                        localStorage.setItem('errorMsg', res.error);
                        this.commonService.showerror();
                        localStorage.removeItem('errorMsg');
                    }
                },
                error => {
                    this.loading = false;
                    localStorage.setItem('errorMsg', this.appConfig.getInvalidDetailsMsg());
                    this.commonService.showerror();
                });
    }
}
