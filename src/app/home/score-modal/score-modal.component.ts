import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-score-modal',
  templateUrl: './score-modal.component.html',
  styleUrls: ['./score-modal.component.scss'],
})
export class ScoreModalComponent implements OnInit {
  @Input() selectedScore$: BehaviorSubject<number | undefined> | undefined;
  @Input() lowerBound = 0;
  @Input() upperBound = 0;
  @Input() colNumbers: number[] = [];
  @Input() fillClass = 'bg-gray-700';
  @Input() borderClass = 'border-yellow-700';
  @Input() textClass = 'text-white';
  @Input() modalDismiss?: (data?: unknown) => void;

  filteredScores: number[] = [];
  private scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  ngOnInit(): void {
    this.filteredScores = this.scores.filter(
      score => score > this.lowerBound && score < this.upperBound && !this.colNumbers.includes(score)
    );
  }

  closeModal(score: number | null): void {
    this.modalDismiss?.();
    if (score !== null) {
      this.selectedScore$?.next(score);
    }
  }
}
