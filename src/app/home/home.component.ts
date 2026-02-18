import { Component, OnInit, signal } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { ResetModalComponent } from './reset-modal/reset-modal.component';
import { GameOverModalComponent } from './game-over-modal/game-over-modal.component';
import { SettingsModalComponent } from './settings-modal/settings-modal.component';
import { ReplaySubject } from 'rxjs';

export interface IScoreLocation {
  col: number;
  row: number;
  value: number;
}

interface IFailedThrow {
  marked: boolean;
}

interface IRowInfo {
  color: string;
  blankSpots: number[];
  pentagons: number[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(private modalService: ModalService) {}

  rowColor0 = 'bg-orange-500';
  rowColor1 = 'bg-yellow-400';
  rowColor2 = 'bg-purple-500';
  rowColors: string[] = [];
  outlineColors: string[] = [];
  textColors: string[] = [];
  lightBackgrounds: string[] = [];
  hideScores = signal(false);

  ngOnInit(): void {
    // Only lock landscape on narrow viewports (phones) - allow desktop/tablet to use natural orientation
    if (typeof window !== 'undefined' && window.innerWidth < 768 && screen?.orientation?.lock) {
      screen.orientation.lock('landscape').catch(() => {});
    }
    const rowColorOverrides = JSON.parse(localStorage.getItem('rowColors') || '{}');
    if (rowColorOverrides.row0) this.rowColor0 = rowColorOverrides.row0;
    if (rowColorOverrides.row1) this.rowColor1 = rowColorOverrides.row1;
    if (rowColorOverrides.row2) this.rowColor2 = rowColorOverrides.row2;
    this.setRowColors({ row0: this.rowColor0, row1: this.rowColor1, row2: this.rowColor2 });
  }

  failedThrows: IFailedThrow[] = [
    { marked: false },
    { marked: false },
    { marked: false },
    { marked: false },
  ];
  negative = 0;
  spaces = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  toggleHiddenScores(): void {
    this.hideScores.set(!this.hideScores());
  }

  private setRowColors(colors: { row0: string; row1: string; row2: string }): void {
    const r0 = colors.row0.split('-').splice(1, 2);
    const r1 = colors.row1.split('-').splice(1, 2);
    const r2 = colors.row2.split('-').splice(1, 2);
    const r0Base = colors.row0.split('-')[1];
    const r1Base = colors.row1.split('-')[1];
    const r2Base = colors.row2.split('-')[1];
    this.rowColors = [colors.row0, colors.row1, colors.row2];
    this.outlineColors = [`border-${r0.join('-')}`, `border-${r1.join('-')}`, `border-${r2.join('-')}`];
    this.textColors = [`text-${r0.join('-')}`, `text-${r1.join('-')}`, `text-${r2.join('-')}`];
    this.lightBackgrounds = [
      `bg-${r0Base}-${r0Base === 'yellow' ? '50' : '100'}`,
      `bg-${r1Base}-${r1Base === 'yellow' ? '50' : '100'}`,
      `bg-${r2Base}-${r2Base === 'yellow' ? '50' : '100'}`,
    ];
  }

  async openSettingsModal(): Promise<void> {
    const response$ = new ReplaySubject<any>(1);
    const modal = await this.modalService.create({
      component: SettingsModalComponent,
      componentProps: { response$ },
    });
    await modal.present();
    response$.subscribe((res: any) => {
      if (res?.type === 'colors') this.setRowColors(res.payload);
    });
    modal.onDidDismiss().then(() => response$.unsubscribe());
  }

  rows: IRowInfo[] = [
    { color: 'orange', blankSpots: [0, 1, 5], pentagons: [3, 7] },
    { color: 'yellow', blankSpots: [0, 6, 11], pentagons: [8] },
    { color: 'purple', blankSpots: [4, 10, 11], pentagons: [2, 9] },
  ];

  scorecard: Array<(number | undefined)[]> = [
    [undefined, undefined, 0, 0, 0, undefined, 0, 0, 0, 0, 0, 0],
    [undefined, 0, 0, 0, 0, 0, undefined, 0, 0, 0, 0, undefined],
    [0, 0, 0, 0, undefined, 0, 0, 0, 0, 0, undefined, undefined],
  ];
  selections: IScoreLocation[] = [];
  rowScores: number[] = [0, 0, 0];
  bonuses: IScoreLocation[] = [
    { col: 2, row: 2, value: 0 },
    { col: 3, row: 0, value: 0 },
    { col: 7, row: 0, value: 0 },
    { col: 8, row: 1, value: 0 },
    { col: 9, row: 2, value: 0 },
  ];

  undoSelection(): void {
    const last = this.selections.pop();
    if (last) this.scorecard[last.row][last.col] = 0;
    this.calcBonuses();
    this.calcRowScores();
  }

  markFailedThrow(index: number): void {
    this.failedThrows[index].marked = !this.failedThrows[index].marked;
    this.calcNegatives();
    this.checkForGameOver(false, true);
  }

  updateScorecard(score: IScoreLocation): void {
    this.scorecard[score.row][score.col] = score.value;
    if (score.value > 0) this.selections.push(score);
    if (score.value === 0) {
      const idx = this.selections.findIndex(s => s.col === score.col && s.row === score.row);
      if (idx >= 0) this.selections.splice(idx, 1);
    }
    this.calcBonuses();
    this.calcRowScores();
    this.checkForGameOver(true, false);
  }

  async checkForGameOver(scoreEnd: boolean, failedThrowEnd: boolean): Promise<void> {
    let gameOver = true;
    if (scoreEnd) {
      let filledRowCount = 0;
      this.scorecard.forEach(row => {
        const empty = row.filter(s => s === 0);
        if (empty.length === 0) filledRowCount++;
      });
      if (filledRowCount < 2) gameOver = false;
    }
    if (failedThrowEnd) {
      const failedCount = this.failedThrows.filter(ft => ft.marked).length;
      if (failedCount < 4) gameOver = false;
    }
    if (!gameOver) return;

    const response$ = new ReplaySubject<any>(1);
    const modal = await this.modalService.create({
      component: GameOverModalComponent,
      cssClass: 'small-modal',
      componentProps: { response$ },
    });
    await modal.present();
    response$.subscribe((sub: any) => {
      if (sub?.include) this.saveGameToHistory();
      if (sub?.reset) this.resetGameLogic();
    });
    modal.onDidDismiss().then(() => response$.unsubscribe());
  }

  private saveGameToHistory(): void {
    const total = this.calcTotalScore();
    const history = JSON.parse(localStorage.getItem('gameHistory') || '[]');
    history.unshift({
      score: total,
      date: new Date(),
      scorecard: this.scorecard,
      failedThrows: this.failedThrows,
      rowScores: this.rowScores,
      bonuses: this.bonuses,
    });
    localStorage.setItem('gameHistory', JSON.stringify(history));
  }

  calcRowScores(): void {
    this.scorecard.forEach((row, i) => {
      let scoreCount = 0;
      let largest = 0;
      row.forEach(value => {
        if (value !== undefined && value > 0) {
          largest = value;
          scoreCount++;
        }
      });
      this.rowScores[i] = scoreCount === 9 ? largest : scoreCount;
    });
    this.calcNegatives();
  }

  calcNegatives(): void {
    this.negative = this.failedThrows.filter(ft => ft.marked).length * 5;
  }

  calcBonuses(): void {
    this.bonuses.forEach(bonus => {
      bonus.value = 0;
      let colIsFull = true;
      this.scorecard.forEach((row, i) => {
        const val = row[bonus.col];
        if (val !== undefined && val > 0) {
          if (bonus.row === i) bonus.value = val;
        } else {
          colIsFull = false;
        }
      });
      if (colIsFull) {
        // value already set above
      }
    });
  }

  calcTotalScore(): number {
    let total = this.rowScores.reduce((a, b) => a + b, 0);
    this.bonuses.forEach(b => (total += b.value));
    return total - this.negative;
  }

  async resetGame(): Promise<void> {
    const response$ = new ReplaySubject<any>(1);
    const modal = await this.modalService.create({
      component: ResetModalComponent,
      cssClass: 'medium-modal',
      componentProps: { response$ },
    });
    await modal.present();
    response$.subscribe((resp: any) => {
      if (resp?.response) {
        if (resp.include) this.saveGameToHistory();
        this.resetGameLogic();
      }
    });
    modal.onDidDismiss().then(() => response$.unsubscribe());
  }

  resetGameLogic(): void {
    this.resetScorecard();
    this.resetFailedThrows();
    this.calcBonuses();
    this.calcRowScores();
    this.selections = [];
  }

  private resetFailedThrows(): void {
    this.failedThrows.forEach(ft => (ft.marked = false));
  }

  private resetScorecard(): void {
    this.scorecard.forEach((row, i) => {
      row.forEach((_, j) => {
        if (this.scorecard[i][j]) this.scorecard[i][j] = 0;
      });
    });
  }
}
