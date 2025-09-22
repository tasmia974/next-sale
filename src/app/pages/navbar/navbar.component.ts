import { Component, ElementRef, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive,TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
   constructor(private eRef: ElementRef) {
    // this.translate.setFallbackLang('de');
    // this.translate.use('de');
  }


  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  // close if clicked outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.isMenuOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
    }
  }


   switchLang(lang: string) {
    // this.translate.use(lang);
  }

}

