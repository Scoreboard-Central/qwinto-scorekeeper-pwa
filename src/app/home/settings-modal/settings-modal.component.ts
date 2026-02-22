import {Component, Input, OnInit, signal} from '@angular/core';
import {ReplaySubject} from 'rxjs';
import {ModalService} from '../../services/modal.service';
import {ToastService} from '../../services/toast.service';
import {AreYouSureModalComponent} from '../are-you-sure-modal/are-you-sure-modal.component';

@Component({
  selector: 'app-settings-modal',
  templateUrl: './settings-modal.component.html',
  styleUrls: [ './settings-modal.component.scss' ],
})
export class SettingsModalComponent implements OnInit {
  @Input() response$: ReplaySubject<any> = new ReplaySubject();
  @Input() modalDismiss?: (data?: unknown) => void;

  selectedTab = 0;
  selectedColor0 = 'bg-orange-500';
  selectedColor1 = 'bg-yellow-400';
  selectedColor2 = 'bg-purple-500';
  selectedTheme = 'dark';
  gameHistory = signal<any[]>(JSON.parse(localStorage.getItem('gameHistory') || '[]'));
  highScore = signal(-21);
  lowScore = signal(500);
  avgScore = signal(0);

  constructor(
    private modalService: ModalService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    const rowColors = JSON.parse(
      localStorage.getItem('rowColors') ||
      JSON.stringify({row0: 'bg-orange-500', row1: 'bg-yellow-400', row2: 'bg-purple-500'})
    );
    if (rowColors.row0) this.selectedColor0 = rowColors.row0;
    if (rowColors.row1) this.selectedColor1 = rowColors.row1;
    if (rowColors.row2) this.selectedColor2 = rowColors.row2;
    this.selectedTheme = localStorage.getItem('theme') || 'dark';
    this.calculateHistoricalValues();
  }

  selectHistory(): void {
    this.selectedTab = 1;
    this.calculateHistoricalValues();
  }

  openFileExplorer(): void {
    document.getElementById('upload-file')?.click();
  }

  addAttachment(fileInput: Event): void {
    const input = fileInput.target as HTMLInputElement;
    const file = input.files?.[ 0 ];
    if (!file) return;
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      const fileContent = event.target?.result as string;
      try {
        JSON.parse(fileContent);
        localStorage.setItem('gameHistory', fileContent);
        this.calculateHistoricalValues();
      } catch (_) { }
    };
    fileReader.readAsText(file);
    input.value = '';
  }

  downloadHistory(): void {
    const blob = new Blob([ JSON.stringify(this.gameHistory()) ], {type: 'application/json'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game_history.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  private calculateHistoricalValues(): void {
    let total = 0;
    this.highScore.set(-21);
    this.lowScore.set(500);
    const raw = localStorage.getItem('gameHistory') || '[]';
    const hist = JSON.parse(raw);
    this.gameHistory.set(hist);
    hist.forEach((game: any) => {
      if (game.score < this.lowScore()) this.lowScore.set(game.score);
      if (game.score > this.highScore()) this.highScore.set(game.score);
      total += game.score;
    });
    this.avgScore.set(hist.length ? total / hist.length : 0);
  }

  async deleteHistoryEntry(index: number): Promise<void> {
    const response$ = new ReplaySubject<boolean>(1);
    const modal = await this.modalService.create({
      component: AreYouSureModalComponent,
      componentProps: {response$},
      cssClass: 'medium-modal secondary',
    });
    await modal.present();
    response$.subscribe((resp) => {
      if (resp) {
        const hist = [ ...this.gameHistory() ];
        hist.splice(index, 1);
        localStorage.setItem('gameHistory', JSON.stringify(hist));
        this.gameHistory.set(hist);
        this.calculateHistoricalValues();
      }
    });
    modal.onDidDismiss().then(() => response$.unsubscribe());
  }

  resetColors(): void {
    this.colorSelected('bg-orange-500', 0, true);
    this.colorSelected('bg-yellow-400', 1, true);
    this.colorSelected('bg-purple-500', 2, true);
  }

  colorSelected(event: any, row: number, overrideEvent = false): void {
    const inputColor = overrideEvent ? event : event.target.value;
    switch (row) {
      case 0:
        this.selectedColor0 = inputColor;
        break;
      case 1:
        this.selectedColor1 = inputColor;
        break;
      case 2:
        this.selectedColor2 = inputColor;
        break;
    }
    this.response$.next({
      type: 'colors',
      payload: {
        row0: this.selectedColor0,
        row1: this.selectedColor1,
        row2: this.selectedColor2,
      },
    });
    this.saveSettings();
  }

  themeSelected(): void {
    if (this.selectedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', this.selectedTheme);
    this.toast.show('Saved theme!', 750);
  }

  closeSettings(): void {
    this.modalDismiss?.();
  }

  saveSettings(): void {
    localStorage.setItem(
      'rowColors',
      JSON.stringify({
        row0: this.selectedColor0,
        row1: this.selectedColor1,
        row2: this.selectedColor2,
      })
    );
    this.toast.show('Saved!', 750);
  }
}
