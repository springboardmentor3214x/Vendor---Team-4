import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProcurementService } from '../../../services/procurement.service';
import { VendorPerformanceService } from '../../../services/vendor-performance.service';

@Component({ selector:'app-vendor-performance-dashboard', standalone:true, imports:[CommonModule,MatCardModule,MatIconModule,MatTableModule,MatButtonModule,MatTooltipModule], templateUrl:'./vendor-performance-dashboard.html', styleUrl:'./vendor-performance-dashboard.scss' })
export class VendorPerformanceDashboard implements OnInit {
  constructor(private router:Router, private performanceService:VendorPerformanceService, private procurementService:ProcurementService, private cdr:ChangeDetectorRef) {}

  totalVendors=0; averageDelivery=0; averageQuality=0; averageResponse=0; completedOrders=0; delayedDeliveries=0; rankedVendors=0;
  displayedColumns=['vendor','purchaseOrder','activity','date','status']; activities:any[]=[];

  ngOnInit():void { this.loadDashboard(); }

  loadDashboard():void {
    this.performanceService.getDashboardSummary().subscribe({
      next:(data:any)=>{
        this.totalVendors=Number(data?.total_vendors||0);
        this.rankedVendors=this.totalVendors;
        this.averageDelivery=Number(data?.average_delivery_performance||0);
        this.averageQuality=Number(data?.average_quality_rating||0);
        this.averageResponse=Number(data?.average_response_time||0)/60;
        this.completedOrders=Number(data?.total_completed_orders||0);
        this.delayedDeliveries=Number(data?.delayed_deliveries||0);
        this.cdr.detectChanges();
      },
      error:(err:unknown)=>console.error('Vendor performance summary failed:',err)
    });
    this.loadRecentOrders();
  }

  private loadRecentOrders():void {
    this.procurementService.getPurchaseOrders({page:1,pageSize:10,sortBy:'id',sortOrder:'desc'}).subscribe({
      next:(orders:any[])=>{
        const names=new Map<number,string>();
        this.procurementService.getApprovedVendors().subscribe({
          next:(vendors:any[])=>{(Array.isArray(vendors)?vendors:[]).forEach(v=>names.set(Number(v.id),v.company_name??v.name??`Vendor #${v.id}`));this.buildActivities(orders,names);this.cdr.detectChanges();},
          error:()=>{this.buildActivities(orders,names);this.cdr.detectChanges();}
        });
      },
      error:(err:unknown)=>{console.error('Recent purchase orders failed:',err);this.activities=[];this.cdr.detectChanges();}
    });
  }

  private buildActivities(orders:any[],names:Map<number,string>):void {
    this.activities=(Array.isArray(orders)?orders:[]).map(o=>({vendor:names.get(Number(o.vendor_id))||`Vendor #${o.vendor_id}`,purchaseOrder:o.po_number||`PO-${o.id}`,activity:this.activityForStatus(o.status),date:o.purchase_order_date?new Date(o.purchase_order_date).toLocaleDateString('en-GB'):'-',status:this.displayStatus(o.status)}));
  }
  private activityForStatus(status:string):string { switch(String(status||'').toUpperCase()){case 'COMPLETED':return 'Purchase Order Completed';case 'SENT':return 'Purchase Order Dispatched';case 'GENERATED':return 'Purchase Order Generated';case 'CANCELLED':return 'Purchase Order Cancelled';default:return 'Purchase Order Created';} }
  private displayStatus(status:string):string{return String(status||'').toUpperCase().replace(/_/g,' ')||'Unknown';}
  deliveryPerformance():void{this.router.navigate(['/delivery-performance']);}
  productQualityEvaluation():void{this.router.navigate(['/product-quality-evaluation']);}
  communicationTracking():void{this.router.navigate(['/communication-tracking']);}
  serviceRating():void{this.router.navigate(['/service-rating']);}
  performanceHistory():void{this.router.navigate(['/performance-history']);}
  vendorRanking():void{this.router.navigate(['/vendor-ranking']);}
}
