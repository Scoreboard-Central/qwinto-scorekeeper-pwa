import { Component, ViewChild, ViewContainerRef, AfterViewInit, EnvironmentInjector } from '@angular/core';
import { ModalService } from './services/modal.service';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <ng-container #modalHost></ng-container>
  `,
  styles: [`:host { display: block; height: 100%; }`],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('modalHost', { read: ViewContainerRef }) modalHost!: ViewContainerRef;

  constructor(
    private modalService: ModalService,
    private injector: EnvironmentInjector
  ) {}

  ngAfterViewInit(): void {
    this.modalService.setContainer(this.modalHost, this.injector);
  }
}
