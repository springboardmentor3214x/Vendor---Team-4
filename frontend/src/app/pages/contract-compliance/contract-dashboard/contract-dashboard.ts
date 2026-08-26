import { ChangeDetectorRef, Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common'; import { FormsModule } from '@angular/forms'; import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table'; import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'; import { MatSort, MatSortModule } from '@angular/material/sort'; import { MatCardModule } from '@angular/material/card'; import { MatButtonModule } from '@angular/material/button'; import { MatIconModule } from '@angular/material/icon'; import { MatFormFieldModule } from '@angular/material/form-field'; import { MatInputModule } from '@angular/material/input'; import { MatProgressBarModule } from '@angular/material/progress-bar';
import Chart from 'chart.js/auto';
import { ContractComplianceService } from '../../../services/contract-compliance.service'; import { VendorService } from '../../../services/vendor.service';
@Component({selector:'app-contract-dashboard',standalone:true,imports:[CommonModule,FormsModule,MatTableModule,MatPaginatorModule,MatSortModule,MatCardModule,MatButtonModule,MatIconModule,MatFormFieldModule,MatInputModule,MatProgressBarModule],templateUrl:'./contract-dashboard.html',styleUrl:'./contract-dashboard.scss'})
export class ContractDashboard implements OnInit,AfterViewInit{
 constructor(private router:Router,private service:ContractComplianceService,private vendorService:VendorService,private cdr:ChangeDetectorRef){}
 @ViewChild(MatPaginator)paginator!:MatPaginator;@ViewChild(MatSort)sort!:MatSort;
 activeContracts=0;expiringContracts=0;expiredContracts=0;pendingRenewals=0;complianceScore=0;uploadedDocuments=0;certifiedVendors=0;pendingCertifications=0;complianceIssues=0;repositoryContracts=0;repositoryInvoices=0;repositoryAgreements=0;repositoryComplianceDocs=0;pendingDocumentReviews=0;
 notifications:string[]=[];displayedColumns=['contractId','vendor','status','expiryDate','action'];contracts:any[]=[];dataSource=new MatTableDataSource<any>();private charts:Chart[]=[];
 ngOnInit(){this.loadContractDashboardData();}
 ngAfterViewInit(){this.dataSource.paginator=this.paginator;this.dataSource.sort=this.sort;}
 loadContractDashboardData(){
   this.service.getContracts().subscribe({next:list=>{const rows=list||[];this.contracts=rows.map(c=>({id:c.id,contractId:c.contract_number||`CTR-${c.id}`,vendor:c.vendor_name||`Vendor #${c.vendor_id}`,status:this.normalizedStatus(c),expiryDate:c.end_date||'-'}));this.repositoryContracts=rows.length;this.activeContracts=this.contracts.filter(c=>c.status==='Active').length;this.expiredContracts=this.contracts.filter(c=>c.status==='Expired').length;this.expiringContracts=this.contracts.filter(c=>this.days(c.expiryDate)>=0&&this.days(c.expiryDate)<=90).length;this.pendingRenewals=this.contracts.filter(c=>c.status==='Renewed').length;this.dataSource.data=this.contracts;this.loadCompliance();this.loadDocuments();this.loadNotifications();this.renderCharts();this.cdr.detectChanges();},error:e=>{console.error(e);this.contracts=[];this.dataSource.data=[];this.cdr.detectChanges();}});
 }
 private normalizedStatus(c:any){const d=this.days(c.end_date);if(d<0)return 'Expired';return c.status||'Active';}
 private days(d:string){const x=new Date(d);const t=new Date();t.setHours(0,0,0,0);return Math.ceil((x.getTime()-t.getTime())/86400000);}
 private loadCompliance(){this.service.getComplianceOverview().subscribe({next:r=>{this.complianceScore=Number(r?.summary?.average_compliance||0);this.certifiedVendors=Number(r?.summary?.compliant_vendors||0);this.complianceIssues=Number(r?.summary?.non_compliant_vendors||0);this.pendingCertifications=(r?.records||[]).filter((x:any)=>x.overall_status==='Pending').length;this.renderCharts();this.cdr.detectChanges();},error:e=>console.error(e)});}
 private loadDocuments(){this.service.getVendorDocuments().subscribe({next:d=>{this.documentsCache=(d||[]).map((x:any)=>({type:x.document_type||'Other'}));this.uploadedDocuments=(d||[]).length;this.repositoryComplianceDocs=this.uploadedDocuments;this.pendingDocumentReviews=(d||[]).filter((x:any)=>x.status==='Pending').length;this.renderCharts();this.cdr.detectChanges();},error:e=>console.error(e)});}
 private loadNotifications(){this.service.getContractNotifications(90).subscribe({next:rows=>{this.notifications=(rows||[]).map((x:any)=>{const days=this.days(x.end_date);return `${x.contract_number||`Contract #${x.id}`} expires in ${days} day${days===1?'':'s'}.`;});this.cdr.detectChanges();},error:e=>console.error(e)});}
 renderCharts(){
   if(typeof document==='undefined')return;
   this.charts.forEach(c=>c.destroy()); this.charts=[];
   const make=(id:string,type:any,data:any,options:any={})=>{const el=document.getElementById(id) as HTMLCanvasElement|null;if(!el)return;this.charts.push(new Chart(el,{type,data,options}));};
   make('contractStatusChart','doughnut',{labels:['Active','Expiring Soon','Expired','Renewed'],datasets:[{data:[this.activeContracts,this.expiringContracts,this.expiredContracts,this.pendingRenewals]}]});
   const renewed=this.contracts.filter(c=>c.status==='Renewed').length; make('renewalChart','bar',{labels:['Renewed Contracts'],datasets:[{label:'Current renewed contracts',data:[renewed]}]});
   make('complianceTrendChart','line',{labels:['Current'],datasets:[{label:'Average compliance %',data:[this.complianceScore],fill:false}]},{scales:{y:{min:0,max:100}}});
   const counts=new Map<string,number>(); this.documentsForChart().forEach((d:any)=>counts.set(d.type,(counts.get(d.type)||0)+1)); make('documentCategoryChart','pie',{labels:[...counts.keys()],datasets:[{data:[...counts.values()]}]});
 }
 private documentsCache:any[]=[]; private documentsForChart(){return this.documentsCache;}
 applyFilter(e:Event){this.dataSource.filter=((e.target as HTMLInputElement)?.value||'').trim().toLowerCase();}
 refreshDashboard(){this.loadContractDashboardData();}
 openModule(module:string){const routes:any={'Add Contract':'/add-contract','Contract Details':this.contracts[0]?`/contract-details/${this.contracts[0].id}`:'/contract-repository','Contract Repository':'/contract-repository','Contract Renewal Dashboard':'/contract-renewal-dashboard','Certification Management':'/certification-management','Vendor Documentation':'/vendor-documentation','Contract Notifications':'/contract-notifications','Compliance Dashboard':'/compliance-dashboard'};this.router.navigateByUrl(routes[module]||'/contract-repository');}
}
