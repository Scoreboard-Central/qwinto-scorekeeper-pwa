import { Component, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-game-over-modal',
  templateUrl: './game-over-modal.component.html',
  styleUrls: ['./game-over-modal.component.scss'],
})
export class GameOverModalComponent {
  @Input() response$: ReplaySubject<any> | undefined;
  @Input() modalDismiss?: (data?: unknown) => void;

  includeInHistory = true;

  respond(reset: boolean): void {
    const resp = reset ? { reset, include: this.includeInHistory } : { reset: false, include: false };
    this.response$?.next(resp);
    this.modalDismiss?.();
  }
}
