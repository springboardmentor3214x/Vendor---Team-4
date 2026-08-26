import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ContractComplianceService } from '../../../services/contract-compliance.service';
import { VendorService, VendorRecord } from '../../../services/vendor.service';

@Component({selector:'app-add-contract',standalone:true,imports:[CommonModule,ReactiveFormsModule,RouterLink,MatCardModule,MatButtonModule,MatFormFieldModule,MatInputModule,MatSelectModule,MatDatepickerModule,MatNativeDateModule,MatIconModule],templateUrl:'./add-contract.html',styleUrl:'./add-contract.scss'})
export class AddContract implements OnInit {
  contractForm!:FormGroup; selectedFile:File|null=null; vendors:VendorRecord[]=[]; loadingVendors=false; submitting=false;
  constructor(private fb:FormBuilder,private router:Router,private contracts:ContractComplianceService,private vendorService:VendorService,private cdr:ChangeDetectorRef){}
  ngOnInit():void{
    this.contractForm=this.fb.group({contractNumber:[`CTR-${Date.now()}`,Validators.required],contractTitle:['',Validators.required],contractType:['Supply',Validators.required],procurementCategory:[''],vendorName:['',Validators.required],vendorId:[null,Validators.required],responsibleManager:[''],startDate:['',Validators.required],endDate:['',Validators.required],contractValue:[null,[Validators.required,Validators.min(1)]],paymentTerms:[''],sla:[''],warrantyDetails:[''],status:['Active',Validators.required]});
    this.loadingVendors=true;
    this.vendorService.getVendors({page:1,size:1000}).subscribe({next:r=>{this.vendors=r.items||[];this.loadingVendors=false;this.cdr.detectChanges();},error:e=>{console.error(e);this.loadingVendors=false;this.cdr.detectChanges();}});
  }
  selectVendor(id:number):void{const v=this.vendors.find(x=>Number(x.id)===Number(id));this.contractForm.patchValue({vendorName:v?.company_name||''},{emitEvent:false});}
  onFileSelected(event:Event):void{const input=event.target as HTMLInputElement;this.selectedFile=input.files?.[0]||null;}
  onSubmit():void{
    if(this.contractForm.invalid){this.contractForm.markAllAsTouched();return;}
    const v=this.contractForm.getRawValue(); const start=new Date(v.startDate); const end=new Date(v.endDate);
    if(end<start){alert('End Date cannot be before Start Date');return;}
    this.submitting=true;
    const payload={vendor_id:Number(v.vendorId),contract_number:v.contractNumber,contract_title:v.contractTitle,contract_type:v.contractType,start_date:this.toDate(v.startDate),end_date:this.toDate(v.endDate),contract_value:Number(v.contractValue),description:[v.procurementCategory&&`Category: ${v.procurementCategory}`,v.responsibleManager&&`Manager: ${v.responsibleManager}`,v.paymentTerms&&`Payment: ${v.paymentTerms}`,v.sla&&`SLA: ${v.sla}`,v.warrantyDetails&&`Warranty: ${v.warrantyDetails}`].filter(Boolean).join(' | ')||null};
    this.contracts.createContract(payload).subscribe({next:created=>{const finish=()=>{this.submitting=false;this.cdr.detectChanges();alert('Contract created successfully.');this.router.navigate(['/contract-repository']);}; if(this.selectedFile){this.contracts.uploadContractDocument(created.id,this.selectedFile).subscribe({next:()=>finish(),error:e=>{console.error(e);finish();}})}else finish();},error:e=>{this.submitting=false;this.cdr.detectChanges();alert(this.error(e,'Unable to create contract.'));}});
  }
  private toDate(v:any):string{return v instanceof Date?v.toISOString().split('T')[0]:new Date(v).toISOString().split('T')[0];}
  private error(e:any,f:string):string{const d=e?.error?.detail;return typeof d==='string'?d:f;}
  cancel():void{this.router.navigate(['/contract-repository']);}
}
