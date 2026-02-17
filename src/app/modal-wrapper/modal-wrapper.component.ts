import {
  Component,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  Type,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  Injector,
} from '@angular/core';

@Component({
  selector: 'app-modal-wrapper',
  template: `
    <div class="modal-overlay" [ngClass]="cssClass" (click)="onBackdropClick()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <ng-container #host></ng-container>
      </div>
    </div>
  `,
  styles: [`:host { display: contents; }`],
})
export class ModalWrapperComponent implements AfterViewInit {
  @ViewChild('host', { read: ViewContainerRef }) host!: ViewContainerRef;
  @Input() component!: Type<unknown>;
  @Input() componentProps: Record<string, unknown> = {};
  @Input() cssClass = '';
  @Output() dismissEvent = new EventEmitter<unknown>();

  private componentRef: ComponentRef<unknown> | null = null;

  constructor(private injector: Injector) {}

  ngAfterViewInit(): void {
    this.componentRef = this.host.createComponent(this.component, { injector: this.injector });
    const instance = this.componentRef.instance as Record<string, unknown>;
    instance['modalDismiss'] = (data?: unknown) => this.dismissEvent.emit(data);
    Object.entries(this.componentProps).forEach(([key, value]) => {
      instance[key] = value;
    });
  }

  onBackdropClick(): void {
    this.dismissEvent.emit();
  }

  destroy(): void {
    this.componentRef?.destroy();
    this.componentRef = null;
  }
}
