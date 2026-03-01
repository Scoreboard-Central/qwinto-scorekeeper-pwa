import {HomeComponent} from './home.component';
import {ModalService} from '../services/modal.service';

describe('HomeComponent', () => {
    let component: HomeComponent;
    let mockModalService: jasmine.SpyObj<ModalService>;

    beforeEach(() => {
        mockModalService = jasmine.createSpyObj('ModalService', [ 'create' ]);
        component = new HomeComponent(mockModalService);
    });

    describe('rollDice', () => {
        it('should roll each number 1-6 approximately 1/6 of the time within 0.033 tolerance over 10000 rolls', () => {
            const rolls = 10000;

            const counts: number[][] = [
                [ 0, 0, 0, 0, 0, 0 ], // Die 0
                [ 0, 0, 0, 0, 0, 0 ], // Die 1
                [ 0, 0, 0, 0, 0, 0 ], // Die 2
            ];

            for (let i = 0; i < rolls; i++) {
                component.rollDice();
                component.dice.forEach((die, index) => {
                    if (die.value !== null) {
                        counts[ index ][ die.value - 1 ]++;
                    }
                });
            }

            counts.forEach((dieCounts, dieIndex) => {
                dieCounts.forEach((count, faceIndex) => {
                    const ratio = count / rolls;
                    const expectedRatio = 1 / 6;

                    // "within 3.3%" meaning 0.033 overall absolute difference in probability
                    const diff = Math.abs(ratio - expectedRatio);

                    expect(diff).toBeLessThanOrEqual(
                        0.033,
                        `Die ${dieIndex} face ${faceIndex + 1} rolled ${count} times (${(ratio * 100).toFixed(2)}%), expected ~16.67%`
                    );
                });
            });
        });
    });
});
