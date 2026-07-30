import { Component, OnInit } from '@angular/core';
import { FetchService } from '../fetch.service';
import { StorageService } from '../storage.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { CurrentLocationContentPage } from '../modal/current-location-content/current-location-content.page';
import { DonateFoodContentPage } from '../modal/donate-food-content/donate-food-content.page';
import { ErrorMsgModalPage } from '../modal/error-msg-modal/error-msg-modal.page';

@Component({
  selector: 'app-donate-food-pickup-method',
  templateUrl: './donate-food-pickup-method.page.html',
  styleUrls: ['./donate-food-pickup-method.page.scss'],
})
export class DonateFoodPickupMethodPage implements OnInit {
  model: any = {};
  veg_food: any;
  nonveg_food: any;
  selectedMethod: string = '';
  alert_text: any;
  dataReturned: any;
  location_data: any;
  donate_address: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fetch: FetchService,
    private storage: StorageService,
    public alertController: AlertController,
    public modalController: ModalController
  ) { }

  ngOnInit() {
    var id = parseInt(this.route.snapshot.params['id']);
    var id2 = parseInt(this.route.snapshot.params['id2']);
    this.model.veg = id;
    this.model.nonveg = id2;

    if (id != 0) {
      this.fetch.reviewFood(id).subscribe(res => {
        this.veg_food = res['data'];
      });
    }
    if (id2 != 0) {
      this.fetch.reviewFood(id2).subscribe(res => {
        this.nonveg_food = res['data'];
      });
    }

    var lang_code = JSON.parse(localStorage.getItem('lang'));
    let res = this.storage.getScope();
    let alert_text = res.find(i => i.key_text === 'KEEP_PIN_EXACT_LOCATION');
    this.alert_text = alert_text[lang_code];
  }

  selectOption(method: string) {
    if (method === 'donee') {
      this.presentConfirm();
    } else if (method === 'khanaa') {
      this.router.navigate(['/donate-food-review', this.model.veg, this.model.nonveg]);
    }
  }

  async presentConfirm() {
    const modal = await this.modalController.create({
      component: ErrorMsgModalPage,
      cssClass: 'error_modal_css',
      backdropDismiss: false,
      componentProps: {
        "msg": this.alert_text,
      }
    });

    modal.onDidDismiss().then((dataReturned) => {
      this.openModalCurrentLocation();
    });

    return await modal.present();
  }

  async openModalCurrentLocation() {
    localStorage.setItem('set_confirm_location_route', JSON.stringify('donate-food'));
    const modal = await this.modalController.create({
      component: CurrentLocationContentPage,
      cssClass: 'custom_current_location_modal_new',
      componentProps: {
        "paramID": 123,
        "paramTitle": "donate_food"
      }
    });

    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        this.dataReturned = dataReturned.data;
        this.location_data = JSON.parse(this.dataReturned);
        this.donate_address = this.dataReturned;
        var formData: any = new FormData();
        formData.append("id", this.model.veg);
        formData.append("id2", this.model.nonveg);
        formData.append("donate_address", this.donate_address);
        this.fetch.donate_food_location_new(formData).subscribe(res => {
          this.openModalDonateFood();
        });
      }
    });

    return await modal.present();
  }

  async openModalDonateFood() {
    const modal = await this.modalController.create({
      component: DonateFoodContentPage,
      cssClass: 'custom_donate_food_modal',
      componentProps: {
        "paramID": 123,
        "paramTitle": "Test Title",
        "veg": this.model.veg,
        "nonveg": this.model.nonveg,
        "veg_food": this.veg_food,
        "nonveg_food": this.nonveg_food
      }
    });

    modal.onDidDismiss().then((dataReturned) => {
      localStorage.removeItem('donate_address_type');
      localStorage.removeItem('set_confirm_location_route');
      localStorage.removeItem('donor_location');
      this.router.navigate(['/home']);
    });

    return await modal.present();
  }
}
