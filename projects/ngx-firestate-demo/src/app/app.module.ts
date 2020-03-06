import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app.routing';
import { FireStateConfigModule } from './firestate-config.module';
import { TestObservablesComponent } from './test-observables';

@NgModule({
  declarations: [AppComponent, TestObservablesComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    AppRoutingModule,
    FireStateConfigModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
