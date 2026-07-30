import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FindingRiderPageRoutingModule } from './finding-rider-routing.module';
import { FindingRiderPage } from './finding-rider.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FindingRiderPageRoutingModule
  ],
  declarations: [FindingRiderPage]
})
export class FindingRiderPageModule {}
