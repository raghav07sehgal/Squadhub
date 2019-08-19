import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { map } from 'rxjs/operators';

import { AppConfig } from '../util';


@Injectable()
export class MailService {
    private baseURL: any = null;
    constructor(private http: HttpClient, appConfig: AppConfig) {
        this.baseURL = appConfig.getServerURL();
    }

    sendMail(toEmails: any, attendeesEmails: any, assignuserData: any, userData: any) {
        return this.http.post<any>(this.baseURL + '/sendEmail', { toEmails: toEmails, attendeesEmails: attendeesEmails, assignuserData: assignuserData, userData: userData })
            .pipe(map(res => {
                if (res && res.data) {
                }
                return res.data;
            }));
    }
}
