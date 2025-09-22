import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServiceDataService } from '../../services/services.service';
import { ServiceCard } from '../../models/service.model';
import { CommonModule } from '@angular/common';
import { Slide, TestimonialService } from '../../services/testimonials.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent {
  services: ServiceCard[] = [];
  slides: Slide[] = [];

  constructor(private serviceData: ServiceDataService,
    private testimonalServices: TestimonialService
  ) { }

  ngOnInit() {
    this.services = this.serviceData.getServices();
    this.slides = this.testimonalServices.getSlides();

  }
}
