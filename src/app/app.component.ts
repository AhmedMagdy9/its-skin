import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./feature/pages/navbar/navbar.component";
import { Subscription } from 'rxjs';
import { NavbarService } from './core/services/navbar/navbar.service';
import { NgClass } from '@angular/common';





@Component({
  selector: 'app-root',
  standalone: true,
  imports : [RouterOutlet, NavbarComponent , NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'its-skin';
   isNavbarVisible = true;
  private sub = new Subscription();

  constructor(public navbarService: NavbarService) {
    this.sub.add(
      this.navbarService.visible$.subscribe(v => {
        this.isNavbarVisible = v;
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }


}
