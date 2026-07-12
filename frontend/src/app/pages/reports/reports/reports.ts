import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.scss'
})
export class Reports {

  /*

    GET /reports
  */

  reports = [

    {
      name: 'Vendor Report',
      description: 'Summary of registered vendors.'
    },

    {
      name: 'Procurement Report',
      description: 'Summary of procurement activities.'
    }

  ];

  generateReport(report: string) {

    console.log(`Generate ${report}`);

    /*
    

      POST /reports/generate
    */

  }

  downloadPdf(report: string) {

    console.log(`Download PDF: ${report}`);

    /*
    

      GET /reports/pdf
    */

  }

  downloadExcel(report: string) {

    console.log(`Download Excel: ${report}`);

    /*
    

      GET /reports/excel
    */

  }

}