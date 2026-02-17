import {
  Injectable,
  ViewContainerRef,
  ComponentRef,
  EnvironmentInjector,
  Type,
} from '@angular/core';
import { ModalWrapperComponent } from '../modal-wrapper/modal-wrapper.component';

export interface ModalOptions {
  component: Type<unknown>;
  componentProps?: Record<string, unknown>;
  cssClass?: string;
}

export interface ModalInstance {
  present(): Promise<void>;
  dismiss(data?: unknown): void;
  onDidDismiss(): Promise<unknown>;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private containerRef: ViewContainerRef | null = null;
  private injector: EnvironmentInjector | null = null;

  setContainer(container: ViewContainerRef, injector: EnvironmentInjector): void {
    this.containerRef = container;
    this.injector = injector;
  }

  async create(options: ModalOptions): Promise<ModalInstance> {
    const { component, componentProps = {}, cssClass = '' } = options;
    if (!this.containerRef || !this.injector) {
      throw new Error('ModalService: container not set. Ensure app has modal host.');
    }

    let resolveDismiss: (value: unknown) => void;
    const didDismissPromise = new Promise<unknown>(r => {
      resolveDismiss = r;
    });

    const wrapperRef: ComponentRef<ModalWrapperComponent> = this.containerRef.createComponent(
      ModalWrapperComponent,
      { injector: this.injector }
    );

    const instance: ModalInstance = {
      present: () => Promise.resolve(),
      dismiss: (data?: unknown) => {
        sub.unsubscribe();
        wrapperRef.instance.destroy();
        wrapperRef.destroy();
        resolveDismiss!(data);
      },
      onDidDismiss: () => didDismissPromise,
    };

    wrapperRef.instance.component = component;
    wrapperRef.instance.componentProps = {
      ...componentProps,
      modalDismiss: (data?: unknown) => instance.dismiss(data),
    };
    wrapperRef.instance.cssClass = cssClass || '';
    wrapperRef.changeDetectorRef.detectChanges();

    const sub = wrapperRef.instance.dismissEvent.subscribe((data: unknown) => {
      instance.dismiss(data);
    });

    return instance;
  }
}
