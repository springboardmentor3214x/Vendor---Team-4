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

@Component({ selector: 'app-procurement-recommendations', standalone: true, imports: [CommonModule, FormsModule, RouterModule, MatCardModule, MatTableModule, MatSortModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressBarModule, MatIconModule, MatButtonModule], templateUrl: './procurement-recommendations.html', styleUrl: './procurement-recommendations.scss' })
export class ProcurementRecommendations implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  constructor(private service: VendorReliabilityService, private cdr: ChangeDetectorRef) {}
  totalVendors = 0; recommendedVendors = 0; notRecommended = 0; averageReliability = 0; searchText = ''; selectedCategory = ''; selectedRecommendation = ''; categories: string[] = [];
  displayedColumns = ['vendor', 'category', 'reliability', 'risk', 'recommendation', 'details']; recommendations: any[] = []; dataSource = new MatTableDataSource<any>([]);
  ngOnInit(): void { this.load(); }
  ngAfterViewInit(): void { this.dataSource.sort = this.sort; }
  load(): void {
    this.service.getRankings().subscribe({
      next: (rows: any[]) => {
        this.recommendations = (Array.isArray(rows) ? rows : []).map((r: any) => ({ vendor: r.vendor_name ?? '-', category: r.vendor_category ?? '-', reliability: Number(r.reliability_score ?? 0), risk: String(r.risk_level || '').replace(' Risk', ''), recommendation: r.recommendation ?? '-', id: r.vendor_id }));
        this.dataSource.data = this.recommendations;
        this.totalVendors = this.recommendations.length;
        this.recommendedVendors = this.recommendations.filter(r => r.recommendation !== 'Not Recommended').length;
        this.notRecommended = this.recommendations.filter(r => r.recommendation === 'Not Recommended').length;
        this.averageReliability = this.totalVendors ? Math.round((this.recommendations.reduce((s, r) => s + r.reliability, 0) / this.totalVendors) * 100) / 100 : 0;
        this.categories = [...new Set(this.recommendations.map(r => r.category))];
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (error: unknown) => console.error('Failed to load recommendations:', error)
    });
  }
  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();
    this.dataSource.filterPredicate = (d: any): boolean => (!search || String(d.vendor).toLowerCase().includes(search) || String(d.category).toLowerCase().includes(search)) && (!this.selectedCategory || d.category === this.selectedCategory) && (!this.selectedRecommendation || d.recommendation === this.selectedRecommendation);
    this.dataSource.filter = String(Date.now());
  }
}
