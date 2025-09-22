// services/service-data.service.ts
import { Injectable } from '@angular/core';
import { ServiceCard } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceDataService {
  private services: ServiceCard[] = [
    {
      title: 'Website Development',
      description: 'Modern, responsive websites designed to convert visitors into customers.',
      icon: 'assets/img/website.svg',
      bgIcon: 'assets/img/bg-circle.svg',
      gap: '80px'
    },
    {
      title: 'SEO & Google Ads Optimization',
      description: 'Boost your visibility and drive high-quality traffic that converts.',
      icon: 'assets/img/seo.svg',
      bgIcon: 'assets/img/bg-circle.svg',
      gap: '61px'
    },
    {
      title: 'Website Development',
      description: 'Modern, responsive websites designed to convert visitors into customers.',
      icon: 'assets/img/website.svg',
      bgIcon: 'assets/img/bg-circle.svg',
      gap: '80px'
    },
     {
      title: 'Recruiting Websites',
      description: 'Specialized solutions for HR and recruitment to increase applications.',
      icon: 'assets/img/funding.svg',
      bgIcon: 'assets/img/bg-circle.svg',
      gap: '57px'
    },
    {
      title: 'Funding & Grant Consulting',
      description: 'Get guidance on grants and funding opportunities to scale your business.',
      icon: 'assets/img/funding.svg',
      bgIcon: 'assets/img/bg-circle.svg',
      gap: '43px'
    },
    {
      title: 'Recruiting Websites',
      description: 'Specialized solutions for HR and recruitment to increase applications.',
      icon: 'assets/img/funding.svg',
      bgIcon: 'assets/img/bg-circle.svg',
      gap: '57px'
    }
  ];

  getServices(): ServiceCard[] {
    return this.services;
  }
}
