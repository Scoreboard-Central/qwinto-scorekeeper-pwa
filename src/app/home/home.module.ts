import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { ScoreAreaComponent } from './score-area/score-area.component';

@NgModule({
  imports: [CommonModule, FormsModule, HomeRoutingModule],
  declarations: [HomeComponent, ScoreAreaComponent],
})
export class HomeModule {}
