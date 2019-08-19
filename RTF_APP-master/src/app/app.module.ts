import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { DataTableModule } from 'angular2-datatable';
import { DataTablesModule } from 'angular-datatables';
import { AlertModule } from 'ngx-alerts';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { CommonModule } from "@angular/common";
import { HttpModule } from '@angular/http';
import 'rxjs/add/operator/map';
import { DragScrollModule } from 'ngx-drag-scroll/lib';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
// import { AngularDateTimePickerModule } from 'angular2-datetimepicker';
// used to create fake backend

import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { CommonService } from './service/commons-service';
import { ConsolidatedComponent } from './consolidated';
import { LoginComponent } from './login';
import { DashboardComponent } from './dashboard';
import { WorkloadComponent } from './workload';
import { UserLogsComponent } from './userLogs';
import { PlanScheduleComponent } from './planSchedule';
import { ConfirmComponent } from './confirm/confirm.component';
import { MailService } from './service/mail.service';
import { ErrorComponent } from './confirm/error.component';
import { AddUserComponent } from './add-user/add-user.component';
import { AppConfig } from './util';
import { ReportDashboardComponent } from './reportDashboard';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { SearchFilter } from './util/searchPipe'
import { AccountReportComponent } from './accountReport/accountReport.component';
import { ResourceUtilizationComponent } from './resourceUtilization/resourceUtilization.component';
import { Common } from './util/common';
import { ResourceBookingReportComponent } from './resourceBookingReport/resourceBookingReport.component';
import { ResourceHistoryComponent } from './resourceHistory/resourceHistory.component';
import { ReducebookingComponent } from './reducebooking/reducebooking.component';

@NgModule({
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    routing,
    HttpModule,
    DataTableModule,
    DataTablesModule,
    AlertModule,
    NgbModule,
    FormsModule,
    NgbModule.forRoot(),
    CommonModule,
    BrowserModule,
    BootstrapModalModule,
    BootstrapModalModule.forRoot({ container: document.body }),
    DragScrollModule,
    AngularFontAwesomeModule,
    NgMultiSelectDropDownModule.forRoot()
    //Ng2SearchPipeModule
    //,AngularDateTimePickerModule   
  ],
  declarations: [
    AppComponent,
    ConsolidatedComponent,
    LoginComponent,
    DashboardComponent,
    WorkloadComponent,
    UserLogsComponent,
    ConfirmComponent,
    ErrorComponent,
    AddUserComponent,
    PlanScheduleComponent,
    ReportDashboardComponent,
    SearchFilter,
    AccountReportComponent,
    ResourceUtilizationComponent,
    ResourceBookingReportComponent,
    ResourceHistoryComponent,
    ReducebookingComponent
  ],
  providers: [
    MailService,
    AppConfig,
    CommonService,
    Common
  ],
  entryComponents: [
    DashboardComponent,
    ConfirmComponent,
    ErrorComponent
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
