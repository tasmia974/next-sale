import { Component } from '@angular/core';
import { ContactComponent } from "../../pages/contact/contact.component";
import { ServicesComponent } from "../../pages/services/services.component";
import { FaqsComponent } from "../../pages/faqs/faqs.component";
import { AboutUsComponent } from "../../pages/about-us/about-us.component";
import { HomeComponent } from "../../pages/home/home.component";
import { NavbarComponent } from "../../pages/navbar/navbar.component";

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [ContactComponent, ServicesComponent, FaqsComponent, AboutUsComponent, HomeComponent, NavbarComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

}
