import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';

import { ScreenCaptureService } from './services/screen-capture.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    ScreenCaptureService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
