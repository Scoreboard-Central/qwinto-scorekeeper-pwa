import { Component, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-are-you-sure-modal',
  templateUrl: './are-you-sure-modal.component.html',
  styleUrls: ['./are-you-sure-modal.component.scss'],
})
export class AreYouSureModalComponent {
  @Input() response$: ReplaySubject<boolean> | undefined;
  @Input() modalDismiss?: (data?: unknown) => void;

  respond(response: boolean): void {
    this.response$?.next(response);
    this.modalDismiss?.();
  }
}
