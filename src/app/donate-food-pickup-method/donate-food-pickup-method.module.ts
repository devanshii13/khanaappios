import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DonateFoodPickupMethodPageRoutingModule } from './donate-food-pickup-method-routing.module';
import { DonateFoodPickupMethodPage } from './donate-food-pickup-method.page';
import { CaptchaComponent } from '../captcha/captcha.component';
import { FooterPageModule } from '../footer/footer.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DonateFoodPickupMethodPageRoutingModule,
    FooterPageModule
  ],
  declarations: [DonateFoodPickupMethodPage, CaptchaComponent]
})
export class DonateFoodPickupMethodPageModule {}
