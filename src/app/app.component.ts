import { Component, ViewChild, ViewContainerRef, AfterViewInit, EnvironmentInjector, OnInit } from '@angular/core';
import { ModalService } from './services/modal.service';

@Component({
  selector: 'app-root',
  template: `
    <ion-app>
      <ion-content [scrollY]="false">
        <router-outlet></router-outlet>
        <ng-container #modalHost></ng-container>
      </ion-content>
    </ion-app>
  `,
  styles: [`:host { display: block; height: 100%; }`],
})
export class AppComponent implements AfterViewInit, OnInit {
  @ViewChild('modalHost', { read: ViewContainerRef }) modalHost!: ViewContainerRef;

  constructor(
    private modalService: ModalService,
    private injector: EnvironmentInjector
  ) {}

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme') || 'dark'; // default to dark
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  ngAfterViewInit(): void {
    this.modalService.setContainer(this.modalHost, this.injector);
  }
}
