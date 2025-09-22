import { Component } from '@angular/core';
import { AboutUsComponent } from "../about-us/about-us.component";
import { ServicesComponent } from "../services/services.component";
import { FaqsComponent } from "../faqs/faqs.component";
import { ContactComponent } from "../contact/contact.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AboutUsComponent, ServicesComponent, FaqsComponent, ContactComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
