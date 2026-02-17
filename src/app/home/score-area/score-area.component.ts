import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { IScoreLocation } from '../home.component';
import { ModalService } from '../../services/modal.service';
import { ScoreModalComponent } from '../score-modal/score-modal.component';
import { BehaviorSubject } from 'rxjs';

interface IBounds {
  upperBound: number;
  lowerBound: number;
  colNumbers: number[];
}

@Component({
  selector: 'app-score-area',
  templateUrl: './score-area.component.html',
  styleUrls: ['./score-area.component.scss'],
})
export class ScoreAreaComponent implements OnInit, OnChanges {
  @Input() isBlank = false;
  @Input() isPentagon = false;
  @Input() rowNumber = 0;
  @Input() colNumber = 0;
  @Input() scorecard: Array<(number | undefined)[]> = [];
  @Input() selectedScore: number | undefined = 0;
  @Input() backgroundColor = '';

  @Output() updateScorecard = new EventEmitter<IScoreLocation>();

  colors: { primary: string; secondary: string; background: string; text: string } | null = null;

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.colors = this.determineColors();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['backgroundColor']?.currentValue !== changes['backgroundColor']?.previousValue) {
      this.colors = this.determineColors();
    }
  }

  private determineColors(): { primary: string; secondary: string; background: string; text: string } {
    const primary = this.backgroundColor === 'yellow' ? 'yellow-400' : `${this.backgroundColor}-500`;
    const secondary = this.backgroundColor === 'yellow' ? 'yellow-50' : `${this.backgroundColor}-100`;
    return {
      primary,
      secondary,
      background: `bg-${secondary}`,
      text: `text-${primary}`,
    };
  }

  async presentModal(): Promise<void> {
    if (this.isBlank) return;
    const { lowerBound, upperBound, colNumbers } = this.calcBounds();
    const selectedScore$ = new BehaviorSubject<number | undefined>(undefined);

    const modal = await this.modalService.create({
      component: ScoreModalComponent,
      componentProps: {
        selectedScore$,
        lowerBound,
        upperBound,
        colNumbers,
        fillClass: `bg-${this.colors!.secondary}`,
        borderClass: `border-${this.colors!.primary}`,
        textClass: `text-${this.colors!.primary}`,
      },
    });
    await modal.present();

    selectedScore$.subscribe(value => {
      if (value !== undefined) {
        this.updateScorecard.emit({ row: this.rowNumber, col: this.colNumber, value });
      }
    });
    modal.onDidDismiss().then(() => selectedScore$.unsubscribe());
  }

  calcBounds(): IBounds {
    const targetRow = this.scorecard[this.rowNumber];
    let upperBound = 19;
    let lowerBound = 0;
    const colNumbers: number[] = [];
    targetRow.forEach((column, i) => {
      if (column && i < this.colNumber) {
        if (column > lowerBound) lowerBound = column;
      } else if (column && i > this.colNumber) {
        if (column < upperBound) upperBound = column;
      }
    });
    if (this.rowNumber !== 0) colNumbers.push(this.scorecard[0][this.colNumber] as number);
    if (this.rowNumber !== 1) colNumbers.push(this.scorecard[1][this.colNumber] as number);
    if (this.rowNumber !== 2) colNumbers.push(this.scorecard[2][this.colNumber] as number);
    return { upperBound, lowerBound, colNumbers };
  }
}
