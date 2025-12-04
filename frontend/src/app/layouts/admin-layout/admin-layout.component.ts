//src/app/layouts/admin-layout/admin-layout.component.ts

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent as AppSidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    AppSidebarComponent
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  sidebarVisible = signal<boolean>(true);
  isMobile = signal<boolean>(false);

  constructor() {
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
  }

  private checkMobile() {
    this.isMobile.set(window.innerWidth < 992);
    if (this.isMobile()) {
      this.sidebarVisible.set(false);
    }
  }

  toggleSidebar() {
    this.sidebarVisible.set(!this.sidebarVisible());
  }
}