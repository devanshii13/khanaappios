import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DonateFoodPickupMethodPage } from './donate-food-pickup-method.page';

const routes: Routes = [
  {
    path: '',
    component: DonateFoodPickupMethodPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DonateFoodPickupMethodPageRoutingModule {}
