import { Component, OnInit , Input} from '@angular/core';
import { StorageService } from '../../storage.service';
import { FetchService } from '../../fetch.service';
import { DynamicMsgPage } from '../dynamic-msg/dynamic-msg.page';

import { 
  ModalController, AlertController ,
  NavParams 
  } from '@ionic/angular';
import { format } from 'highcharts';
@Component({
  selector: 'app-push-notification',
  templateUrl: './push-notification.page.html',
  styleUrls: ['./push-notification.page.scss'],
})
export class PushNotificationPage implements OnInit {
  @Input() message;
  @Input() array;
  @Input() donor_details;
  @Input() request_id;
  model:any={};
  constructor(
    private storage: StorageService,
    private fetch: FetchService,
    private modalController: ModalController,
    private alertController:AlertController
  ) {
    
   }
   async closeModal() {
    const onClosedData: string = "Wrapped Up!";
    await this.dismissPushModal();
  }

    async dismissPushModal() {
    try {
      const top = await this.modalController.getTop();
      if (top) {
        await top.dismiss(null, 'dismissed');
      }
    } catch (e) {
      // Modal may already be dismissed.
    }
  }

  ngOnInit() {
    this.model.processing = false;
    this.model.key_text1 = "Reject";
    this.model.key_text2 = "Accept";
    var lang_code = JSON.parse(localStorage.getItem('lang'));
    let res = this.storage.getScope();
    let item1 = res.find(i => i.key_text === 'REJECT');
      this.model.key_text1 = item1[lang_code]; 
    let item2 = res.find(i => i.key_text === 'ACCEPT');
      this.model.key_text2 = item2[lang_code]; 
    let item3 = res.find(i => i.key_text === 'VOLUNTEER_FOOD_REJECT_MSG');
      this.model.key_text3 = item3[lang_code]; 
    let item4 = res.find(i => i.key_text === 'CLOSE');
      this.model.key_text4 = item4[lang_code];
    let item5 = res.find(i => i.key_text === 'FOOD_ACCEPTED');
      this.model.key_text5 = item5[lang_code];
    let item6 = res.find(i => i.key_text === 'SOMETHING_WENT_WRONG');
      this.model.key_text6 = item6[lang_code];
    let item7 = res.find(i => i.key_text === 'FOOD_ALLOTED_TO_OTHER_VOLUNTEER');
      this.model.key_text7 = item7[lang_code];
    let item8 = res.find(i => i.key_text === 'FOOD_REQUIREMENT_OVER');
      this.model.key_text8 = item8[lang_code];
     let itemVeg = res.find(i => i.key_text === 'VEG');
      this.model.key_text_veg = itemVeg?.[lang_code] || 'Veg';
    let itemNonVeg = res.find(i => i.key_text === 'NON_VEG');
      this.model.key_text_nonveg = itemNonVeg?.[lang_code] || 'Non-Veg';
    let itemPeople = res.find(i => i.key_text === 'PEOPLE');
      this.model.key_text_people = itemPeople?.[lang_code] || 'people';

    this.model.displayMessage = this.formatDisplayMessage();
  }

  formatDisplayMessage() {
    const foodItems = this.extractFoodItems();
    if (foodItems.length) {
      return foodItems.map(item => this.buildFoodLine(item)).join(' ');
    }
    return this.cleanBackendMessage(this.message);
  }

  extractFoodItems() {
    const items: any[] = [];
    if (Array.isArray(this.array)) {
      items.push(...this.array);
    } else if (this.array && typeof this.array === 'object') {
      items.push(this.array);
    }
    return items.filter(item =>
      item && (item.food_type != null || item.total_food_for != null || item.no_of_person != null || item.no_of_people != null)
    );
  }

  buildFoodLine(item: any) {
    const foodType = this.getFoodTypeLabel(item.food_type);
    const count = Number(
      item.total_food_for
      ?? item.no_of_person
      ?? item.no_of_people
      ?? this.extractCountFromMessage(this.message)
      ?? 1
    );
    const peopleWord = count === 1 ? 'person' : this.model.key_text_people;
    return `If you have people waiting for ${foodType} food: ${count} ${peopleWord}.`;
  }

  getFoodTypeLabel(foodType: any) {
    const type = Number(foodType);
    if (type === 1) {
      return this.model.key_text_veg;
    }
    if (type === 2) {
      return this.model.key_text_nonveg;
    }
    if (type === 3) {
      return `${this.model.key_text_veg}/${this.model.key_text_nonveg}`;
    }
    return this.extractFoodTypeFromMessage(this.message) || this.model.key_text_veg;
  }

  extractCountFromMessage(msg: string) {
    if (!msg) {
      return null;
    }
    const match = msg.match(/(\d+)\s*people?/i);
    return match ? Number(match[1]) : null;
  }

  extractFoodTypeFromMessage(msg: string) {
    if (!msg) {
      return null;
    }
    if (/non[\s-]?veg/i.test(msg)) {
      return this.model.key_text_nonveg;
    }
    if (/veg/i.test(msg)) {
      return this.model.key_text_veg;
    }
    return null;
  }

  cleanBackendMessage(msg: string) {
    if (!msg) {
      return '';
    }

    let text = msg.trim();
    text = text.replace(/:\s*(\d+)\s*people?/gi, ': $1 people');
    text = text.replace(/(\d+)people/gi, '$1 people');
    text = text.replace(/\s+/g, ' ');
    text = text.replace(/\bveg\b/gi, this.model.key_text_veg);
    text = text.replace(/\bnon[\s-]?veg\b/gi, this.model.key_text_nonveg);

    if (text.charAt(0) === text.charAt(0).toLowerCase()) {
      text = text.charAt(0).toUpperCase() + text.slice(1);
    }
    if (!/[.!?]$/.test(text)) {
      text += '.';
    }
    return text;
  }

    acceptRequest(){
    if (this.model.processing) {
      return;
    }
    this.model.processing = true;

    const userId = JSON.parse(localStorage.getItem('user_id') || localStorage.getItem('user_registerd') || 'null');
    const volunteerId = localStorage.getItem('volunteer_id');

    const formData: any = new FormData();
    formData.append('donate_request', JSON.stringify(this.array));
    formData.append('donate_address', JSON.stringify(this.donor_details));
    formData.append('receiver_id', userId);

    if (this.request_id) {
      formData.append('request_id', this.request_id);
    }
    if (volunteerId) {
      formData.append('volunteer_id', JSON.parse(volunteerId));
    }

    const donateFoodId = this.extractDonateFoodId();
    if (donateFoodId) {
      formData.append('donate_food_id', donateFoodId);
    }

    this.fetch.volunterr_accept_request(formData).subscribe(async res => {
      await this.dismissPushModal();
      await this.showAlert(res?.message || (res?.success ? 'Food accepted' : 'Something went wrong'));
    }, async () => {
      this.model.processing = false;
      await this.dismissPushModal();
      await this.showAlert('Something went wrong');
    });
  }

  extractDonateFoodId() {
    if (this.array?.donate_food_id) {
      return this.array.donate_food_id;
    }
    if (Array.isArray(this.array)) {
      const match = this.array.find(item => item?.donate_food_id || item?.id);
      return match?.donate_food_id || match?.id || null;
    }
    if (this.donor_details?.donate_food_id) {
      return this.donor_details.donate_food_id;
    }
    if (this.donor_details?.id) {
      return this.donor_details.id;
    }
    return null;
  }

  async showAlert(msg){
    if(msg == 'Food accepted'){
      msg = this.model.key_text5
    }else if(msg == 'Food alloted to other volunteer'){
      msg = this.model.key_text7
    }else if(msg == 'Food requirement is over'){
      msg = this.model.key_text8
    }else{
      msg = this.model.key_text6
    }
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class custom_alert_1',
      message: msg,
      buttons: [
        {
          text: this.model.key_text4,
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this.dismissPushModal();
          }
        }
      ]
    });
  
    await alert.present();
    await alert.onDidDismiss();
    await this.dismissPushModal();
  }

  async RejectRequest() {
    await this.closeModal();
    const modal = await this.modalController.create({
      component: DynamicMsgPage,
      cssClass: 'home_content_modal dynamic_model_css',
      componentProps: {
		  "msg" : this.model.key_text3
      }
    }); 

    modal.onDidDismiss().then((dataReturned) => {

    });

    return await modal.present();
  } 
}
