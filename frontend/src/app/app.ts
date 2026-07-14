/*import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {}*/
import { Component } from '@angular/core';
import {
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  Router,
  RouterOutlet
} from '@angular/router';

import { CommonModule } from '@angular/common';

import { LoadingComponent } from './components/loading/loading';
import { LoadingService } from './services/loading';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LoadingComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {

  constructor(
    private router: Router,
    private loadingService: LoadingService
  ) {

    this.router.events.subscribe(event => {

      if (event instanceof NavigationStart) {

        this.loadingService.show();

      }

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {

        setTimeout(() => {

          this.loadingService.hide();

        }, 200);

      }

    });

  }

}