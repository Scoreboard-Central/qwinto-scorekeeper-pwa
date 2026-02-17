import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ModalWrapperComponent } from './modal-wrapper/modal-wrapper.component';
import { ScoreModalComponent } from './home/score-modal/score-modal.component';
import { ResetModalComponent } from './home/reset-modal/reset-modal.component';
import { GameOverModalComponent } from './home/game-over-modal/game-over-modal.component';
import { SettingsModalComponent } from './home/settings-modal/settings-modal.component';
import { AreYouSureModalComponent } from './home/are-you-sure-modal/are-you-sure-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    ModalWrapperComponent,
    ScoreModalComponent,
    ResetModalComponent,
    GameOverModalComponent,
    SettingsModalComponent,
    AreYouSureModalComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
