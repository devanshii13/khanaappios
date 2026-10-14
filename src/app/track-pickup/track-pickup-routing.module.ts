import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TrackPickupPage } from './track-pickup.page';

const routes: Routes = [
  {
    path: ':orderId',
    component: TrackPickupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrackPickupPageRoutingModule {}
