import { Injectable } from '@angular/core';
@Injectable()
export class Common {

    public month: any[] = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    constructor() { }
    // return date YY-MM-DD
    public getDateYYMMDD(date: any) {
        if (date) {
            return date.year + "-" + date.month + "-" + date.day;
        }
        return null;
    }

    // return date time with set 0 0 0 0 hours and time
    public getTime(date: any) {
        let tempDate = new Date(date);
        tempDate.setHours(0, 0, 0, 0);
        return tempDate.getTime();
    }

    //returning date array like 1-JAN, 2-Feb from between dates
    public getDateArray(start, end) {
        let arr = [];
        let dt = new Date(start);
        while (dt <= end) {
            let date = new Date(dt)
            if (6 > date.getDay() && date.getDay() != 0) {
                arr.push(Number(date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear());
            }
            dt.setDate(dt.getDate() + 1);
        }
        return arr;
    }

    // return date MM/DD/YYYY
    public getDateDDMMYY(date: any) {
        if (date) {
            date = new Date(date);
            return Number(date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
        }
        return "";
    }

    // return date YY-MM-DD
    public getDatesYYMMDD(date: any) {
        if (date) {
            date = new Date(date);
            return date.getFullYear() + "-" + Number(date.getMonth() + 1) + "-" + date.getDate();
        }
        return "";
    }
    // get
    public getJSONObj(date) {
        if (date) {
            date = new Date(date);
            return { year: date.getFullYear(), month: Number(date.getMonth() + 1), day: date.getDate() };
        }
        return;
    }

    //Validate two dates are equals or not
    public compareTwoDates(bookingdate, calDate) {
        let compareToDate = new Date(bookingdate);
        compareToDate.setHours(0, 0, 0, 0);
        let compareFromDate = new Date(calDate);
        compareFromDate.setHours(0, 0, 0, 0);
        if (compareToDate.getTime() == compareFromDate.getTime()) {
            return true;
        }
        return false;
    }

    //get date time of long value
    public getDateTime(tempDate) {
        let date = new Date(tempDate);
        date.setHours(0, 0, 0, 0)
        return date.getTime();
    }
}