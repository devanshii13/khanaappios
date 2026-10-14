import { Component, OnInit } from '@angular/core';
import { FetchService } from '../fetch.service';
import { StorageService } from '../storage.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ConertToPickupSuccessPage } from '../modal/conert-to-pickup-success/conert-to-pickup-success.page';
import { DonateLaterMsgPage } from '../modal/donate-later-msg/donate-later-msg.page';
@Component({
  selector: 'app-screen-after-volunteer-not-found',
  templateUrl: './screen-after-volunteer-not-found.page.html',
  styleUrls: ['./screen-after-volunteer-not-found.page.scss'],
})
export class ScreenAfterVolunteerNotFoundPage implements OnInit {

  model:any={};
  dataReturned: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fetch: FetchService,
    private storage: StorageService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
  }
  ionViewWillEnter(){
    this.model.is_volunteer = 0;
    if(localStorage.getItem('volunteer_approve') != null){
      this.model.is_volunteer = localStorage.getItem('volunteer_approve');
    }  
    var id = parseInt(this.route.snapshot.params['id']);
    var id2 = parseInt(this.route.snapshot.params['id2']);
    this.model.veg_id = id;
    this.model.non_veg_id = id2;
    var lang_code = JSON.parse(localStorage.getItem('lang'));
      let res = this.storage.getScope();
      let item1 = res.find(i => i.key_text === 'CONVERT_REQUEST_TO_PICKUP');
        this.model.key_text1 = item1[lang_code]; 
      let item2 = res.find(i => i.key_text === 'I_WILL_DONATE_LATER');
        this.model.key_text2 = item2[lang_code];
        let item5 = res.find(i => i.key_text === 'HOME');
				this.model.key_text5 = item5[lang_code];
			let item6 = res.find(i => i.key_text === 'ACTIVITY');
				this.model.key_text6 = item6[lang_code];
			let item7 = res.find(i => i.key_text === 'VOLUNTEER');
      this.model.key_text7 = item7[lang_code];
      let item3 = res.find(i => i.key_text === 'NO_VOLUNTEER_FOUND');
        this.model.key_text3 = item3[lang_code];
    }

    async successModal(food) {
      const modal = await this.modalController.create({
      component: ConertToPickupSuccessPage,
      cssClass: 'custom_current_location_modal',
      componentProps: {
        "paramID": 123,
        "paramTitle": "Test Title",
        "food" : food
      }
      });  
  
      modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        this.dataReturned = dataReturned.data;
      }
      });
  
      return await modal.present();
    }

    async donateLaterModel() {
      const modal = await this.modalController.create({
      component: DonateLaterMsgPage,
      cssClass: 'custom_current_location_modal empty_message_height',
      componentProps: {
        "paramID": 123,
        "paramTitle": "Test Title"      }
      });  
  
      modal.onDidDismiss().then((dataReturned) => {
      
      });
  
      return await modal.present();
    }

    pickupRequest(){
      var formData: any = new FormData();
      formData.append("id", this.model.veg_id);
      formData.append("id2", this.model.non_veg_id);
       this.fetch.convert_to_pickup_request_no_volunteer(formData).subscribe(res => {
        if(res['success'] == true){
          this.successModal(res['data']);
          this.router.navigate(['/home']);
        }
      });
    }
    donateLater(){
      var formData: any = new FormData();
      formData.append("id", this.model.veg_id);
      formData.append("id2", this.model.non_veg_id);
       this.fetch.donate_later_food_no_volunteer(formData).subscribe(res => {
        if(res['success'] == true){
          this.donateLaterModel();
          this.router.navigate(['/home']);
        }
      });
    }
}
