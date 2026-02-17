import { Component, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-reset-modal',
  templateUrl: './reset-modal.component.html',
  styleUrls: ['./reset-modal.component.scss'],
})
export class ResetModalComponent {
  @Input() response$: ReplaySubject<any> = new ReplaySubject();
  @Input() modalDismiss?: (data?: unknown) => void;

  includeInHistory = true;

  respond(response: boolean): void {
    if (response) {
      this.response$.next({ response, include: this.includeInHistory });
    }
    this.modalDismiss?.();
  }
}
