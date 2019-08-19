import { Component, OnInit, Compiler } from '@angular/core';
import { first, retry } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DialogService } from "ng2-bootstrap-modal";
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { AppConfig } from '../util';
import { CommonService } from '../service/commons-service';
import { Common } from '../util/common';
import { ExcelService } from '../service/excel.service';

@Component({
  templateUrl: 'add-user.component.html?v=${new Date().getTime()}',
  styleUrls: ['add-user.component.css?v=${new Date().getTime()}']
})
export class AddUserComponent implements OnInit {
  private users: any = {};
  private addUserForm: any;
  private config: any;
  private fetchData: any[] = [];
  private submitted = false;
  private userId: any = 0;
  private loginImageURL: any = "";
  private baseURL: any = null;
  private loginUserName: any = "";
  private showHideModel: boolean = true;
  private skillData: any[] = [];
  //Add users form fields
  private userUpdatedId: Number = 0;
  private employeeCode: any;
  private resourceName: any;
  private resourceEmail: any;
  private typesResource: any = "Regular";
  private joinDate: any;
  private selectedStoryLine: any = "3_Beginner"
  private selectedLectora: any = "3_Beginner"
  private selectedHTML: any = "3_Beginner"
  private contactDetail: any;
  private leaveDate: any;
  private selectedTeam: any = "Engineering";

  private inactiveUserCount = 0;
  private activeUserCount = 0;

  constructor(private dialogService: DialogService, private router: Router,
    private formBuilder: FormBuilder,
    private excelService: ExcelService,
    private commonService: CommonService,
    private common: Common,
    private appConfig: AppConfig, config: NgbDatepickerConfig, private _compiler: Compiler) {
    this._compiler.clearCache();
    this.users = JSON.parse(localStorage.getItem('user'));
    if (!this.users || !this.users.userData) {
      this.commonService.logout();
      return;
    }
    if (this.users && this.users.userData) {
      this.loginImageURL = this.users.userData.avatarUrls["48x48"];
      this.loginUserName = this.users.userData.displayName;
    }
    let currentDate = new Date();
    this.config = config;
    this.config.minDate = { year: currentDate.getFullYear() - 10, month: currentDate.getMonth(), day: currentDate.getDate() };
    this.config.maxDate = { year: 2099, month: 12, day: 31 };
    this.config.markDisabled = false;
  }

  ngOnInit() {
    this.fetchuserData();
    this.fetchSkillsData();
    this.initAddUserForm();
    this.addUserForm = this.formBuilder.group({
      employeeCode: ['', Validators.required],
      resourceName: ['', Validators.required],
      resourceEmail: ['', Validators.required],
      typesResource: ['', Validators.required],
      joinDate: ['', Validators.required],
      leaveDate: new FormControl(null),
      contactDetail: ['', Validators.required],
      selectedTeam: ['', Validators.required],
      selectedStoryLine: ['', Validators.required],
      selectedLectora: ['', Validators.required],
      selectedHTML: ['', Validators.required],
    });
  }

  // reset form data
  private initAddUserForm() {
    this.userUpdatedId = 0;
    this.employeeCode = "";
    this.resourceName = "";
    this.resourceEmail = "";
    this.typesResource = "Regular";
    this.joinDate = null;
    this.selectedStoryLine = "3_Beginner"
    this.selectedLectora = "3_Beginner"
    this.selectedHTML = "3_Beginner"
    this.contactDetail = "";
    this.leaveDate = null;
    this.selectedTeam = "Engineering";
  }

  // /fetch user information data
  private fetchuserData() {
    this.commonService.getSaveData().pipe(first()).subscribe(
      data => {
        let userIds = [];
        for (let i = 0; i < data.length; i++) {
          if (data[i].user_id) {
            userIds.push(data[i].user_id);
          }
        }
        if (userIds.length > 0) {
          this.fetchUserSkillsData(userIds, data);
        }
      },
      error => {
        localStorage.setItem('errorMsg', error.statusText);
        this.commonService.showerror();
        localStorage.removeItem('errorMsg');
      }
    )
  }

  //fetch user skills data
  private fetchUserSkillsData(userIds: any[], userData) {
    this.commonService.fetchAllSkills(userIds).pipe(first()).subscribe(
      data => {
        for (let j = 0; j < userData.length; j++) {
          let userSkill = [];
          for (let i = 0; i < data.length; i++) {
            if (userData[j].user_id == data[i].user_id) {
              let skillLevel = data[i].skill_level;
              let skillName = '';
              this.skillData.forEach((litem, index) => {
                if (litem.skill_id == data[i].skill_id) {
                  skillName = litem.skill_name
                }
              });
              userSkill.push({ skillId: data[i].skill_id, skillLevel: skillLevel, skillName: skillName });
            }
          }
          userData[j]['userSkill'] = userSkill;
        }
        this.fetchData = userData;
        this.categoriseLeaveUsers()
        this.countActiveAndInactiveUsers();
      },
      error => {
        localStorage.setItem('errorMsg', error.statusText);
        this.commonService.showerror();
        localStorage.removeItem('errorMsg');
      }
    )
  }

  //categorise leave users
  private categoriseLeaveUsers() {
    for (let i = 0; i < this.fetchData.length; i++) {
      if (this.fetchData[i].leave_date) {
        let currentDate = new Date();
        let userLeaveDate = new Date(this.fetchData[i].leave_date);
        if (currentDate > userLeaveDate) {
          this.fetchData[i]["leaveStyle"] = "red";
        }
      }
    }
  }

  // validate resoucre leaving date should be equal or lessthen from current date
  private countActiveAndInactiveUsers() {
    this.inactiveUserCount = 0;
    this.activeUserCount = 0;
    for (let i = 0; i < this.fetchData.length; i++) {
      let isFound = false;
      //remove user from the list if having leave date less then current date
      let currentTime = this.common.getTime(new Date());
      if (this.fetchData[i].leave_date) {
        let leavingTime = this.common.getTime(this.fetchData[i].leave_date);
        if (currentTime > leavingTime) {
          isFound = true;
        }
      }
      if (isFound) {
        this.inactiveUserCount++;
        this.fetchData[i]["leaveUserCSS"] = "leaveUserCSS";
      } else {
        this.fetchData[i]["leaveUserCSS"] = "";
        this.activeUserCount++;
      }
    }
  }

  // suave user information
  private onSubmit(userFormDetails) {
    // stop here if form is invalid
    if (this.addUserForm.invalid) {
      this.submitted = true;
      return;
    } else {
      let userSkillData = this.setUserSkillData(userFormDetails, "");
      userFormDetails['createdByEmail'] = this.users.userData.emailAddress;
      let userInfo = this.isResourceExit(userFormDetails.employeeCode)
      if (userInfo) {
        localStorage.setItem('errorMsg', userInfo);
        this.commonService.showerror();
        return;
      }
      this.commonService.saveUserData(userFormDetails).pipe(first()).subscribe(
        data => {
          let maxId = data.insertId;
          for (let i = 0; i < userSkillData.length; i++) {
            userSkillData[i].user_id = maxId;
          }
          this.saveSkillsData(userSkillData)
        },
        error => {
          localStorage.setItem('errorMsg', 'Must Enter all the fields');
          this.commonService.showerror();
          localStorage.removeItem('errorMsg');
        }
      )
    }
  }

  //check user is exits
  private isResourceExit(employeeCode) {
    let userInfo = null;
    for (let i = 0; i < this.fetchData.length; i++) {
      if (employeeCode == this.fetchData[i].employeeCode) {
        userInfo = "Employee Code: " + employeeCode + " And Resource: " + this.fetchData[i].user_name + " is already exits!!";
        break;
      }
    }
    return userInfo;
  }

  // edit user information 
  private onEditSubmit(fetchuserData) {
    if (fetchuserData) {
      this.userUpdatedId = fetchuserData.user_id;
      this.employeeCode = fetchuserData.employeeCode;
      this.resourceName = fetchuserData.user_name;
      this.resourceEmail = fetchuserData.email;
      this.typesResource = fetchuserData.type_resource;
      this.joinDate = this.common.getJSONObj(fetchuserData.join_date);
      this.selectedStoryLine = fetchuserData.userSkill[0].skillLevel
      this.selectedLectora = fetchuserData.userSkill[1].skillLevel
      this.selectedHTML = fetchuserData.userSkill[2].skillLevel
      this.contactDetail = fetchuserData.contact;
      this.leaveDate = this.common.getJSONObj(fetchuserData.leave_date);
      this.selectedTeam = fetchuserData.team;
    }
  }

  //update user infromation
  private onUpdateSubmit(userFormDetails) {
    if (this.addUserForm.invalid) {
      return;
    }
    if (userFormDetails != null && this.userUpdatedId > 0) {
      userFormDetails["userId"] = this.userUpdatedId;
      userFormDetails['join_date'] = this.common.getDateYYMMDD(userFormDetails.joinDate);
      userFormDetails['leave_date'] = this.common.getDateYYMMDD(userFormDetails.leaveDate);
      userFormDetails['updatedByEmail'] = this.users.userData.emailAddress;
      // let userInfo = this.isResourceExit(userFormDetails.employeeCode)
      // if (userInfo) {
      //   localStorage.setItem('errorMsg', userInfo);
      //   this.commonService.showerror();
      //   return;
      // }
      let updatedata = this.setUserSkillData(userFormDetails, this.userUpdatedId);
      this.commonService.updateUserData(userFormDetails, updatedata).pipe(first()).subscribe(
        data => {
          localStorage.setItem('errorMsg', 'Data Successfully Updated');
          localStorage.setItem('isReload', 'true');
          this.commonService.showerror();
        },
        error => {
          localStorage.setItem('errorMsg', error.statusText);
          this.commonService.showerror();
          localStorage.removeItem('errorMsg');
        }
      )
    }
  }

  //set user skill data
  private setUserSkillData(userFormDetails: any, userId: any) {
    let userSkillData = [];
    userSkillData.push({ user_id: userId, skill_id: Number(1), skill_level: userFormDetails.selectedStoryLine });
    userSkillData.push({ user_id: userId, skill_id: Number(2), skill_level: userFormDetails.selectedLectora });
    userSkillData.push({ user_id: userId, skill_id: Number(3), skill_level: userFormDetails.selectedHTML });
    return userSkillData;
  }

  //delete user information
  private onDeleteSubmit(userInfo) {
    userInfo['deletedByEmail'] = this.users.userData.emailAddress;
    userInfo = this.setSkills(userInfo);
    this.commonService.userDeletion(userInfo).pipe(first()).subscribe(
      data => {
        localStorage.setItem('errorMsg', 'Data Successfully Deleted');
        this.commonService.showerror();
        localStorage.removeItem('errorMsg');
        this.fetchuserData();
      },
      error => {
        localStorage.setItem('errorMsg', error.statusText);
        this.commonService.showerror();
        localStorage.removeItem('errorMsg');
      }
    )
  }

  //set skills information
  private setSkills(userInfo) {
    let userSkills = userInfo.userSkill;
    for (let i = 0; i < userSkills.length; i++) {
      if (userSkills[i].skillName) {
        userInfo[userSkills[i].skillName] = userSkills[i].skillLevel;
      } else if (userSkills[i].skill_name) {
        userInfo[userSkills[i].skill_name] = userSkills[i].skill_level;
      }
    }
    return userInfo;
  }

  //fetch skills data
  private fetchSkillsData() {
    this.commonService.fetchSkillData().pipe(first()).subscribe(
      data => {
        this.skillData = data;
      },
      error => {
        localStorage.setItem('errorMsg', error.statusText);
        this.commonService.showerror();
        localStorage.removeItem('errorMsg');
      }
    )
  }

  //save skills data
  private saveSkillsData(userSkillData) {
    this.commonService.saveSkillsData(userSkillData).pipe(first()).subscribe(
      data => {
        if (data && data != null) {
          this.addUserForm.reset();
          localStorage.setItem('errorMsg', 'User successfully added in resource pool');
          localStorage.setItem('isReload', 'true');
          this.commonService.showerror();
        }
      },
      error => {
        localStorage.setItem('errorMsg', 'Must Enter all the fields');
        this.commonService.showerror();
        localStorage.removeItem('errorMsg');
      }
    )
  }

  //export resource history data
  private excelReport() {
    let excelExportData = [];
    let headers = ["S.No.", "Employee Code", "Resource Name", "Resource Type", "Joining Date", "Address",
      "Leaving Date", "Team", "Email", "Created By", "HTML Level", "Lectora Level", "StoryLine Level"];
    for (let i = 0; i < this.fetchData.length; i++) {
      let data = {};
      data[headers[0]] = i + 1;
      data[headers[1]] = this.fetchData[i].employeeCode;
      data[headers[2]] = this.fetchData[i].user_name;
      data[headers[3]] = this.fetchData[i].type_resource;
      data[headers[4]] = this.common.getDatesYYMMDD(this.fetchData[i].join_date);
      data[headers[5]] = this.fetchData[i].contact;
      data[headers[6]] = this.common.getDatesYYMMDD(this.fetchData[i].leave_date);
      data[headers[7]] = this.fetchData[i].team;
      data[headers[8]] = this.fetchData[i].email;
      data[headers[9]] = this.fetchData[i].createdByEmail;
      data[headers[9]] = this.fetchData[i].createdByEmail;
      data[headers[10]] = this.replaceSkillName(this.fetchData[i].userSkill[2].skillLevel);
      data[headers[11]] = this.replaceSkillName(this.fetchData[i].userSkill[1].skillLevel);
      data[headers[12]] = this.replaceSkillName(this.fetchData[i].userSkill[0].skillLevel);
      excelExportData.push(data);
    }
    this.excelService.generateExcel(headers, excelExportData, 'UserList');
  }

  private replaceSkillName(skillName) {
    if (skillName) {
      skillName = skillName.replace('1_', '');
      skillName = skillName.replace('2_', '');
      skillName = skillName.replace('3_', '');
    }
    return skillName;
  }
  //forward to next section
  public gotoNextPage(e, routeURL) {
    this.router.navigate([routeURL]);
  }

  // logout and forward to login page
  private logout() {
    this.commonService.logout();
  }
}
