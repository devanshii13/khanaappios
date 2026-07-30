import { Component, OnInit,Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FetchService } from '../../fetch.service';
import { StorageService } from '../../storage.service';
import { CommonMessagePage } from '../common-message/common-message.page';
import { 
  ModalController, 
  NavParams 
  } from '@ionic/angular';
  declare var $:any;
@Component({
  selector: 'app-reject-get-food-request',
  templateUrl: './reject-get-food-request.page.html',
  styleUrls: ['./reject-get-food-request.page.scss'],
})
export class RejectGetFoodRequestPage implements OnInit {
  model:any={};
  @Input() data;
  @Input() app_id;
  @Input() r_data;
  @Input() type_id;
  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
	  private router: Router,
	  private fetch: FetchService,
    private storage: StorageService
  ) { }

  ngOnInit() {
    this.model.food_type = localStorage.getItem('receiver_food_type');
    this.model.no_of_person = localStorage.getItem('number_of_person');
    var lang_code = JSON.parse(localStorage.getItem('lang'));
		let res = this.storage.getScope();
		let item1 = res.find(i => i.key_text === 'SEARCH_LATER');
			this.model.key_text1 = item1[lang_code];
    let item2 = res.find(i => i.key_text === 'UPDATE_REQUEST');
			this.model.key_text2 = item2[lang_code];
    let item3 = res.find(i => i.key_text === 'REJECT_FOOD_MSG_1');
			this.model.key_text3 = item3[lang_code];
    let item4 = res.find(i => i.key_text === 'REJECT_FOOD_MSG_2');
			this.model.key_text4 = item4[lang_code];
  }
  accept_food_request(){
    var distance = $("#distance").val();
    this.model.search = true;
    const pickupRequired = localStorage.getItem('pickup_required') === '1';
    const thirdPartyFlags = {
      'third_party': pickupRequired ? 1 : 0,
      'pickup_required': pickupRequired ? 1 : 0
    };
    let data1;
    if(this.r_data != null){
      if(this.type_id == 0){
        data1 = JSON.stringify({'app_user_id' : this.app_id,'food_type' : this.model.food_type, 'no_of_person' : this.model.no_of_person, 'latitude' : this.r_data.latitude, 'longitude' : this.r_data.longitude, 'colony_name' : this.r_data.colony_name, 'city' : this.r_data.city, 'state' : this.r_data.state, 'country' : this.r_data.country, 'postal_code' : this.r_data.postalCode, 'status' : 0, 'distance' : distance, ...thirdPartyFlags });
      }if(this.type_id == 1){
       // data = JSON.stringify({'app_user_id' : this.app_user_id,  'food_type' : this.food_type, 'no_of_person' : this.no_of_person, 'latitude' : this.ontheway_data[0].startLat, 'longitude' : this.ontheway_data[0].startLng, 'colony_name' : this.ontheway_data[1].start, 'city' : this.ontheway_data[0].city, 'state' : this.ontheway_data[0].state, 'country' : this.ontheway_data[0].country, 'postal_code' : this.ontheway_data[0].postalCode,'status' : 0, 'distance' : distance});
        data1 = JSON.stringify({'app_user_id' : this.app_id,'food_type' : this.model.food_type, 'no_of_person' : this.model.no_of_person, 'latitude' : this.r_data[0].startLat, 'longitude' : this.r_data[0].startLng, 'colony_name' : this.r_data[1].start, 'city' : this.r_data[0].city, 'state' : this.r_data[0].state, 'country' : this.r_data[0].country, 'postal_code' : this.r_data[0].postalCode, 'status' : 0, 'distance' : distance, ...thirdPartyFlags });
      }
      
    }
		this.fetch.accept_food_request(data1).subscribe(res => {
      // alert(JSON.stringify(res));
      // alert(JSON.parse(res));
      this.model.search = false;
      if(res.success){
        this.model.notify = 1;
        this.closeModal("Wrapped Up!");
        this.openSucessPopup('get_food_update_request');
        this.router.navigate(['/home']);
      }
      else{
        console.log(res.success);
      }
      
    });
  }
  async openSucessPopup(msg) {
		const modal = await this.modalController.create({
		component: CommonMessagePage,
		cssClass: 'custom_current_location_modal notification-modal',
		backdropDismiss : false,
		componentProps: {
			"message" : msg
		}
		});  
		modal.onDidDismiss().then((dataReturned) => {
		
		});
	
		return await modal.present();
	  } 
  search_again(){
    this.closeModal("Wrapped Up!");
    this.router.navigate(['/home']);
  }
  async closeModal(data) {
   
   const onClosedData: string = data;
          await this.modalController.dismiss(onClosedData);
          
	
  }
}
