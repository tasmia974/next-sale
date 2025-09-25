import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServiceDataService } from '../../services/services.service';
import { ServiceCard, Steps } from '../../models/service.model';
import { CommonModule } from '@angular/common';
import { TestimonialService } from '../../services/testimonials.service';
import { Testimonial } from '../../models/testimonial.modal';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent {
  services: ServiceCard[] = [];
  steps: Steps[] = [];
  testimonials: Testimonial[] = [];
  chunkSize = 3;

  constructor(private serviceData: ServiceDataService,
    private testimonalServices: TestimonialService
  ) { }

  ngOnInit() {
    this.services = this.serviceData.getServices();
    this.testimonials = this.testimonalServices.getTestimonial();
    this.steps = this.serviceData.getSteps();
    this.updateChunkSize();
  }

   @HostListener('window:resize', [])
  onResize() {
    this.updateChunkSize();
  }

  updateChunkSize() {
    const width = window.innerWidth;
    if (width < 768) {
      this.chunkSize = 1; // small screen → 1 per slide
    } else if (width < 992) {
      this.chunkSize = 2; // medium → 2 per slide
    } else {
      this.chunkSize = 3; // large → 3 per slide
    }
  }

  getSlides(): any[][] {
    const slides = [];
    for (let i = 0; i < this.testimonials.length; i += this.chunkSize) {
      slides.push(this.testimonials.slice(i, i + this.chunkSize));
    }
    return slides;
  }
}
