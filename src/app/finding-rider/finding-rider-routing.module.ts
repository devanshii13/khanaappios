import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FindingRiderPage } from './finding-rider.page';

const routes: Routes = [
  {
    path: '',
    component: FindingRiderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FindingRiderPageRoutingModule {}
