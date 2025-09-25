import { Component } from '@angular/core';
import { NavbarComponent } from './pages/navbar/navbar.component';
import { HomeComponent } from "./pages/home/home.component";
import { AboutUsComponent } from "./pages/about-us/about-us.component";
import { ServicesComponent } from "./pages/services/services.component";
import { FaqsComponent } from "./pages/faqs/faqs.component";
import { ContactComponent } from "./pages/contact/contact.component";
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, HomeComponent, AboutUsComponent, ServicesComponent, FaqsComponent, ContactComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        history.replaceState(null, '', this.router.url.split('#')[0]);
      }
    });
  }
}
