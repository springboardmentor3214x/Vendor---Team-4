import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { VendorReliabilityService } from '../../../services/vendor-reliability.service';

@Component({ selector: 'app-procurement-risk-dashboard', standalone: true, imports: [CommonModule, FormsModule, RouterModule, MatCardModule, MatTableModule, MatSortModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressBarModule, MatIconModule, MatButtonModule], templateUrl: './procurement-risk-dashboard.html', styleUrl: './procurement-risk-dashboard.scss' })
export class ProcurementRiskDashboard implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  constructor(private service: VendorReliabilityService, private cdr: ChangeDetectorRef) {}
  totalVendors = 0; lowRisk = 0; mediumRisk = 0; highRisk = 0; searchText = ''; selectedCategory = ''; selectedRisk = ''; categories: string[] = [];
  displayedColumns = ['vendor', 'category', 'reliability', 'risk', 'approval', 'details']; vendors: any[] = []; dataSource = new MatTableDataSource<any>([]);
  ngOnInit(): void { this.load(); }
  ngAfterViewInit(): void { this.dataSource.sort = this.sort; }
  load(): void {
    this.service.getRankings().subscribe({
      next: (rows: any[]) => {
        this.vendors = (Array.isArray(rows) ? rows : []).map((r: any) => ({ vendor: r.vendor_name ?? '-', category: r.vendor_category ?? '-', reliability: Number(r.reliability_score ?? 0), risk: String(r.risk_level || '').replace(' Risk', ''), approval: r.recommendation ?? '-', id: r.vendor_id }));
        this.dataSource.data = this.vendors;
        this.totalVendors = this.vendors.length;
        this.lowRisk = this.vendors.filter(v => v.risk === 'Low').length;
        this.mediumRisk = this.vendors.filter(v => v.risk === 'Medium').length;
        this.highRisk = this.vendors.filter(v => v.risk === 'High').length;
        this.categories = [...new Set(this.vendors.map(v => v.category))];
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (error: unknown) => console.error('Failed to load procurement risk data:', error)
    });
  }
  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();
    this.dataSource.filterPredicate = (d: any): boolean => (!search || String(d.vendor).toLowerCase().includes(search) || String(d.category).toLowerCase().includes(search)) && (!this.selectedCategory || d.category === this.selectedCategory) && (!this.selectedRisk || d.risk === this.selectedRisk);
    this.dataSource.filter = String(Date.now());
  }
}
