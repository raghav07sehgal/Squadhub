import { Injectable } from '@angular/core';
@Injectable()
export class AppConfig {
    private serveURL: any = "";
    constructor() {
        if (location.protocol == 'https:') {
            // this.serveURL = "https://squadhub.niit.com:4443/api/cep_"; //NEC1 API URL
            // this.serveURL = "https://172.17.11.193:4443/api/cep_"; //OLD NEC API URL
            this.serveURL = "https://localhost:4443/api/cep_";  //LOCAL API URL
        } else {
            // this.serveURL = "http://squadhub.niit.com:3000/api/cep_"; //NEC1 API URL
            // this.serveURL = "http://172.17.11.193:3000/api/cep_"; //OLD NEC API URL
            this.serveURL = "http://localhost:3000/api/cep_";  //LOCAL API URL
        }
    }

    // retrun the server base URL
    public getServerURL() {
        return this.serveURL;
    }

    // validation message for empty jira credential
    public getBlankLoginErrorMsg() {
        return 'Please Enter Your Jira Login Credential';
    }

    // validation message for wrong jira credential
    public getInvalidDetailsMsg() {
        return "Wrong Credential!!!!!!!";
    }
}