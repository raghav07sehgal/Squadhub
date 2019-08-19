import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor(private datePipe: DatePipe) { }


  generateExcel(header: any, data: any, title: any) {

    //Create workbook and worksheet
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet(title);

    //Add Header Row
    let headerRow = worksheet.addRow(header);
    // Cell Style : Fill and Border
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'C9C9C9' },
        bgColor: { argb: 'C9C9C9' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })

    let filteredData = this.convertJsonToAOA(data);
    filteredData.forEach(d => {
      let row = worksheet.addRow(d);
      let qty = row.getCell(5);
    }
    );

    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 30;
    worksheet.addRow([]);

    //Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((filteredData) => {
      let blob = new Blob([filteredData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, title + '.xlsx');
    })
  }

  convertJsonToAOA(data: any) {
    let filteredData = [];
    for (let i = 0; i < data.length; i++) {
      //var parsed = JSON.parse("'"+data[i]+"'");
      var arr = [];
      for (var x in data[i]) {
        arr.push(data[i][x]);
      }
      filteredData.push(arr);
    }
    return filteredData;
  }

}

