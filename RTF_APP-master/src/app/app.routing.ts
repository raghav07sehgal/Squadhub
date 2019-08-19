import { Routes, RouterModule } from '@angular/router';
import { enableProdMode } from '@angular/core';
import { ConsolidatedComponent } from './consolidated';
import { DashboardComponent } from './dashboard';
import { ReportDashboardComponent } from './reportDashboard';
import { LoginComponent } from './login';
import { WorkloadComponent } from './workload';
import { UserLogsComponent } from './userLogs';
import { AddUserComponent } from './add-user/add-user.component';
import { PlanScheduleComponent } from './planSchedule/planschedule.component';
import { AccountReportComponent } from './accountReport/accountReport.component';
import { ResourceUtilizationComponent } from './resourceUtilization/resourceUtilization.component';
import { ResourceBookingReportComponent } from './resourceBookingReport/resourceBookingReport.component';
import { ResourceHistoryComponent } from './resourceHistory/resourceHistory.component';
import { ReducebookingComponent } from './reducebooking/reducebooking.component';

const appRoutes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'planSchedule', component: PlanScheduleComponent },
    { path: 'reportDashboard', component: ReportDashboardComponent },
    { path: 'consolidated', component: ConsolidatedComponent },
    { path: 'workload', component: WorkloadComponent },
    { path: 'userLogged', component: UserLogsComponent },
    { path: 'addUser', component: AddUserComponent },
    { path: 'accountReport', component: AccountReportComponent },
    { path: 'resourceUtilization', component: ResourceUtilizationComponent },
    { path: 'resourceBookingReport', component: ResourceBookingReportComponent },
    { path: 'resourceHistory', component: ResourceHistoryComponent },
    { path: 'reduceBookingHours', component: ReducebookingComponent },
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

enableProdMode();
export const routing = RouterModule.forRoot(appRoutes, { useHash: true });