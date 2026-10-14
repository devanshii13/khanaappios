import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TrackPickupPageRoutingModule } from './track-pickup-routing.module';

import { TrackPickupPage } from './track-pickup.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrackPickupPageRoutingModule
  ],
  declarations: [TrackPickupPage]
})
export class TrackPickupPageModule {}
