import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';

import { AppComponent } from './app.component';
import {TooltipComponent} from "./tooltip/tooltip.component";
import {TooltipDirective} from "./tooltip/tooltip.directive";

@NgModule({
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    OverlayModule,
  ],
  declarations: [ AppComponent, TooltipComponent, TooltipDirective ],
  bootstrap: [ AppComponent ],
  providers: [],
  entryComponents: [
    TooltipComponent
  ]
})
export class AppModule { }
