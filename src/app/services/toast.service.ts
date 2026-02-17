import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  show(message: string, durationMs = 750): void {
    const el = document.createElement('div');
    el.className = 'toast-container';
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, durationMs);
  }
}
