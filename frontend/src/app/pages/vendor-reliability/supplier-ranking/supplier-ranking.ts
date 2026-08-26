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
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { VendorReliabilityService } from '../../../services/vendor-reliability.service';

@Component({ selector: 'app-supplier-ranking', standalone: true, imports: [CommonModule, FormsModule, RouterModule, MatCardModule, MatTableModule, MatSortModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatProgressBarModule, MatButtonModule], templateUrl: './supplier-ranking.html', styleUrl: './supplier-ranking.scss' })
export class SupplierRanking implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  constructor(private reliabilityService: VendorReliabilityService, private cdr: ChangeDetectorRef) {}
  totalSuppliers = 0; topSupplier = '-'; averageReliability = 0; lowRiskSuppliers = 0; searchText = ''; selectedCategory = ''; selectedRisk = ''; categories: string[] = [];
  displayedColumns = ['rank', 'vendor', 'category', 'reliability', 'risk', 'recommendation', 'details']; supplierRankings: any[] = []; dataSource = new MatTableDataSource<any>([]);
  ngOnInit(): void { this.load(); }
  ngAfterViewInit(): void { this.dataSource.sort = this.sort; }
  load(): void {
    this.reliabilityService.getRankings().subscribe({
      next: (rows: any[]) => {
        const rankings = Array.isArray(rows) ? rows : [];
        this.supplierRankings = rankings.map((r: any, index: number) => ({ rank: Number(r.rank ?? index + 1), vendor: r.vendor_name ?? '-', category: r.vendor_category ?? '-', reliability: Number(r.reliability_score ?? 0), risk: String(r.risk_level || '').replace(' Risk', ''), recommendation: r.recommendation ?? '-', id: r.vendor_id }));
        this.dataSource.data = this.supplierRankings; this.totalSuppliers = rankings.length; this.topSupplier = this.supplierRankings[0]?.vendor || '-';
        this.averageReliability = this.totalSuppliers ? Math.round((this.supplierRankings.reduce((s, r) => s + r.reliability, 0) / this.totalSuppliers) * 100) / 100 : 0;
        this.lowRiskSuppliers = this.supplierRankings.filter(r => r.risk === 'Low').length; this.categories = [...new Set(this.supplierRankings.map(r => r.category))];
        this.applyFilters(); this.cdr.detectChanges();
      },
      error: (error: unknown) => console.error('Failed to load supplier rankings:', error)
    });
  }
  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();
    this.dataSource.filterPredicate = (d: any): boolean => (!search || String(d.vendor).toLowerCase().includes(search) || String(d.category).toLowerCase().includes(search)) && (!this.selectedCategory || d.category === this.selectedCategory) && (!this.selectedRisk || d.risk === this.selectedRisk);
    this.dataSource.filter = String(Date.now());
  }
}
