import { Routes } from '@angular/router';
import { DomainCheckComponent } from './components/domain-check/domain-check.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
  },
  {
    path: 'domain-check',
    component: DomainCheckComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
