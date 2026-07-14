/*import { Component } from '@angular/core';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.html',
  styleUrl: './loading.scss',
})
export class Loading {}
*/
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingService } from '../../services/loading';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.html',
  styleUrl: './loading.scss'
})
export class LoadingComponent {

  constructor(public loadingService: LoadingService) {}

}