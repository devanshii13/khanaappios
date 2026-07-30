import { Component, OnInit } from '@angular/core';
import { FetchService } from '../fetch.service';
import { StorageService } from '../storage.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AlertController , ModalController } from '@ionic/angular';
import { CurrentLocationContentPage } from '../modal/current-location-content/current-location-content.page';
@Component({
  selector: 'app-choose-donate-option',
  templateUrl: './choose-donate-option.page.html',
  styleUrls: ['./choose-donate-option.page.scss'],
})
export class ChooseDonateOptionPage implements OnInit {
  model:any={};
  notification:any=[];
  dataReturned: any;
  alert_text: any;
  donate_address: any;
  location_data: any;
  foodDetails: any = null;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fetch: FetchService,
    private storage: StorageService,
    public alertController: AlertController,
    public modalController: ModalController
  ) { }

  ngOnInit() {
  }
  ionViewWillEnter(){
    this.model.show_delivery_method = false;
    this.model.is_volunteer = 0;
    if(localStorage.getItem('volunteer_approve') != null){
      this.model.is_volunteer = localStorage.getItem('volunteer_approve');
    }  
    var id = parseInt(this.route.snapshot.params['id']);
	  var id2 = parseInt(this.route.snapshot.params['id2']);
    this.model.veg = id;
    this.model.nonveg = id2;
    this.model.okay = 'okay';
    var lang_code = JSON.parse(localStorage.getItem('lang'));
      let res = this.storage.getScope();
      let item1 = res.find(i => i.key_text === 'NEARBY');
        this.model.key_text1 = item1[lang_code]; 
      let item2 = res.find(i => i.key_text === 'ON_THE_WAY');
        this.model.key_text2 = item2[lang_code]; 
      let alert_text = res.find(i => i.key_text === 'KEEP_PIN_EXACT_LOCATION');
        this.alert_text = alert_text[lang_code];
      let item3 = res.find(i => i.key_text === 'NO_VOLUNTEER_FOUND');
      this.model.key_text3 = item3[lang_code];
      let item4 = res.find(i => i.key_text === 'CLOSE');
      this.model.key_text4 = item4[lang_code];
      let item5 = res.find(i => i.key_text === 'HOME');
      this.model.key_text5 = item5[lang_code];
    let item6 = res.find(i => i.key_text === 'ACTIVITY');
      this.model.key_text6 = item6[lang_code];
    let item7 = res.find(i => i.key_text === 'VOLUNTEER');
    this.model.key_text7 = item7[lang_code];
    }
    async showAlert(msg){
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class custom_alert_1',
        message: msg,
        buttons: [
          {
            text: this.model.key_text4,
            role: 'cancel',
            cssClass: 'secondary',
          }
        ]
      });
    
      await alert.present();
      return alert;
    }

    async handleNoVolunteerFound() {
      const waitingData = this.buildWaitingFoodData();
      if (waitingData) {
        this.fetch.store_food_for_waiting(JSON.stringify(waitingData)).subscribe(() => {});
      }

      const alert = await this.alertController.create({
        cssClass: 'my-custom-class custom_alert_1',
        message: this.model.key_text3,
        buttons: [
          {
            text: this.model.key_text4,
            handler: () => {
              this.router.navigate(['/screen-after-volunteer-not-found', this.model.veg, this.model.nonveg]);
            }
          }
        ]
      });
      await alert.present();
    }

    storeVolunteerMatchContext() {
      const primaryDonateFoodId = this.model.veg && this.model.veg !== 0
        ? this.model.veg
        : this.model.nonveg;
      if (primaryDonateFoodId) {
        localStorage.setItem('volunteer_match_donate_food_id', JSON.stringify(primaryDonateFoodId));
      }
      if (this.donate_address) {
        localStorage.setItem('volunteer_match_donate_address', this.donate_address);
      }
      localStorage.setItem('volunteer_match_food_ids', JSON.stringify({
        id: this.model.veg,
        id2: this.model.nonveg,
      }));
      localStorage.setItem('volunteer_match_pending_publish', '1');
    }

    clearVolunteerMatchContext() {
      localStorage.removeItem('volunteer_match_donate_food_id');
      localStorage.removeItem('volunteer_match_donate_address');
      localStorage.removeItem('volunteer_match_food_ids');
      localStorage.removeItem('volunteer_match_pending_publish');
      localStorage.removeItem('volunteer_match_third_party');
    }

    buildVolunteerSearchPayload() {
      const userId = JSON.parse(localStorage.getItem('user_id') || localStorage.getItem('user_registerd') || 'null');
      const lat = parseFloat(this.location_data.latitude);
      const lng = parseFloat(this.location_data.longitude);

      const payload: any = {
        startLat: lat,
        startLng: lng,
        endLat: lat,
        endLng: lng,
        endCity: this.location_data.city,
        colony_name: this.location_data.colony_name,
        city: this.location_data.city,
        house_no: this.location_data.house_no || null,
        landmark: this.location_data.landmark || null,
        adress_type: this.location_data.adress_type || null,
        state: this.location_data.state,
        country: this.location_data.country,
        postalCode: this.location_data.postalCode,
        app_user_id: userId,
        id: this.model.veg,
        id2: this.model.nonveg,
        vol: []
      };

      if (this.foodDetails) {
        payload.vol = Array.isArray(this.foodDetails) ? this.foodDetails : [this.foodDetails];
      }

      return payload;
    }

    buildWaitingFoodData() {
      if (!this.location_data) {
        return null;
      }

      const payload: any = this.buildVolunteerSearchPayload();
      payload.donate_address = this.location_data;
      if (this.foodDetails) {
        payload.vol = Array.isArray(this.foodDetails) ? this.foodDetails : [this.foodDetails];
      }
      return payload;
    }

    buildVolunteerAlertPayload(volunteers: any[]) {
      const eligible = volunteers.filter(v => v?.request_id && (v?.id || v?.app_user_id));
      const pool = eligible.length ? eligible : volunteers.filter(v => v?.id || v?.app_user_id);
      if (!pool.length) {
        return null;
      }

      const nearest = pool.sort((a, b) => {
        const distA = parseFloat(a.distance ?? a.dist ?? 999);
        const distB = parseFloat(b.distance ?? b.dist ?? 999);
        return distA - distB;
      })[0];

      const payload: any = this.buildVolunteerSearchPayload();
      payload.vol = [nearest];
      payload.request_id = nearest.request_id || nearest.id;
      return JSON.stringify(payload);
    }

    buildVolunteerNotifyFormData() {
      const formData: any = new FormData();
      formData.append('id', this.model.veg);
      formData.append('id2', this.model.nonveg);
      formData.append('donate_address', this.donate_address);
      return formData;
    }

    proceedAfterVolunteersFound() {
      this.storeVolunteerMatchContext();
      this.router.navigate(['/searching-volunteer', this.model.veg, this.model.nonveg]);
    }

    searchNearbyVolunteersViaWaypoints() {
      if (!this.location_data?.latitude || !this.location_data?.longitude) {
        this.handleNoVolunteerFound();
        return;
      }

      const searchPayload = JSON.stringify(this.buildVolunteerSearchPayload());
      this.fetch.get_volunteer_waypoints_new(searchPayload).subscribe(res => {
        const volunteers = Array.isArray(res?.data) ? res.data : [];
        if (!volunteers.length) {
          this.handleNoVolunteerFound();
          return;
        }

        const alertPayload = this.buildVolunteerAlertPayload(volunteers);
        if (!alertPayload) {
          this.handleNoVolunteerFound();
          return;
        }

        this.fetch.alert_volunteer_on_true(alertPayload).subscribe(
          () => this.proceedAfterVolunteersFound(),
          () => this.proceedAfterVolunteersFound()
        );
      }, () => {
        this.handleNoVolunteerFound();
      });
    }

    startVolunteerSearchAfterLocation() {
      if (!this.location_data?.latitude || !this.location_data?.longitude) {
        this.handleNoVolunteerFound();
        return;
      }

      this.loadDonationFoodDetails(() => {});

      // Original working flow: test() finds volunteers AND sends accept/reject FCM popup.
      this.fetch.test(this.buildVolunteerNotifyFormData()).subscribe(res => {
        const volunteers = Array.isArray(res?.data) ? res.data : [];
        if (res && res['success'] == true && volunteers.length > 0) {
          this.proceedAfterVolunteersFound();
        } else if (volunteers.length > 0) {
          this.proceedAfterVolunteersFound();
        } else {
          this.searchNearbyVolunteersViaWaypoints();
        }
      }, () => {
        this.searchNearbyVolunteersViaWaypoints();
      });
    }

    loadDonationFoodDetails(onReady: () => void) {
      const finish = (details: any) => {
        this.foodDetails = details;
        onReady();
      };

      if (this.model.veg && this.model.veg !== 0) {
        this.fetch.reviewFood(this.model.veg).subscribe(vegRes => {
          if (this.model.nonveg && this.model.nonveg !== 0) {
            this.fetch.reviewFood(this.model.nonveg).subscribe(nonVegRes => {
              finish([vegRes?.data, nonVegRes?.data].filter(Boolean));
            }, () => finish(vegRes?.data || null));
          } else {
            finish(vegRes?.data || null);
          }
        }, () => finish(null));
        return;
      }

      if (this.model.nonveg && this.model.nonveg !== 0) {
        this.fetch.reviewFood(this.model.nonveg).subscribe(nonVegRes => {
          finish(nonVegRes?.data || null);
        }, () => finish(null));
        return;
      }

      finish(null);
    }

    async openModalCurrentLocation() {
      localStorage.setItem('set_confirm_location_route', JSON.stringify('donate-food'));
        const modal = await this.modalController.create({
        component: CurrentLocationContentPage,
        cssClass: 'custom_current_location_modal_new',
        componentProps: {
          "paramID": 123,
          "paramTitle": "Test Title"
        }
        });  
    
        modal.onDidDismiss().then((dataReturned) => {
        if (dataReturned !== null && dataReturned.data) {
          this.dataReturned = dataReturned.data;
          this.location_data = JSON.parse(this.dataReturned);
          if (!this.location_data.city && this.location_data.endCity) {
            this.location_data.city = this.location_data.endCity;
          }
          this.donate_address = this.dataReturned;
          // Do not call donate_food_new here — backend sets donate_food=1 immediately,
          // which blocks volunterr_accept_request until after volunteer accepts.
          this.startVolunteerSearchAfterLocation();
        }
        });
    
        return await modal.present();
      } 
  openOnTheWay(){
    this.router.navigate(['/on-the-way-search',this.model.veg,this.model.nonveg])
  }
  handleNearby() {
    this.model.show_delivery_method = true;
  }
  selectDeliveryMethod(method: string) {
    if (method === 'drop_myself') {
      localStorage.removeItem('volunteer_match_third_party');
      localStorage.removeItem('pickup_required');
      this.openModalCurrentLocation();
    } else if (method === 'deliver_khanaa') {
      localStorage.setItem('volunteer_match_third_party', '1');
      localStorage.setItem('pickup_required', '1');
      this.openModalCurrentLocation();
    }
  }
  goBackToMainOptions() {
    this.model.show_delivery_method = false;
  }
}
