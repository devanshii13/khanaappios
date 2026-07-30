import { Component, OnInit,Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FetchService } from '../../fetch.service';
import { StorageService } from '../../storage.service';
import { 
  ModalController, 
  NavParams 
  } from '@ionic/angular';
@Component({
  selector: 'app-receiver-confirm',
  templateUrl: './receiver-confirm.page.html',
  styleUrls: ['./receiver-confirm.page.scss'],
})
export class ReceiverConfirmPage implements OnInit {
  @Input() data;
  @Input() app_user_id;
  @Input() no_of_person;
  @Input() food_type;
  @Input() location_data;
  @Input() distance;
  @Input() ontheway_data;
  
model:any={};
  constructor(private modalController: ModalController,
    private navParams: NavParams,
	  private router: Router,
	  private fetch: FetchService,
    private storage: StorageService) {
    
   }

  ngOnInit() {
    this.model.search = false;
    this.model.notify = 0;
    let receiver = JSON.stringify({'id': this.app_user_id});
    this.fetch.profile(receiver).subscribe(res => {
     
      this.model.receiver_username = res['username'];
      
    });
    if(this.data.data != null && this.data.data.total_food_for != 0){
      let donar = JSON.stringify({'id': this.data.data.app_user_id});
      this.fetch.profile(donar).subscribe(res => {
      
        this.model.donar_username = res['username'];
        
      });
    }
    var lang_code = JSON.parse(localStorage.getItem('lang'));
    //this.fetch.getKeyText(lang_code).subscribe(res => {
      let res = this.storage.getScope();
      let item1 = res.find(i => i.key_text === 'DEAR');
      this.model.key_text1 = item1[lang_code];
      let item2 = res.find(i => i.key_text === 'RECEIVER_MSG_1');
      this.model.key_text2 = item2[lang_code];
      let item3 = res.find(i => i.key_text === 'PEOPLE');
      this.model.key_text3 = item3[lang_code];
      let item4 = res.find(i => i.key_text === 'VEG');
      this.model.key_text4 = item4[lang_code];
      let item5 = res.find(i => i.key_text === 'NON_VEG');
      this.model.key_text5 = item5[lang_code];
      let item6 = res.find(i => i.key_text === 'FOOD_FOR');
      this.model.key_text6 = item6[lang_code];
      let item7 = res.find(i => i.key_text === 'FROM');
      this.model.key_text7 = item7[lang_code];
      let item8 = res.find(i => i.key_text === 'RECEIVER_MSG_2');
      this.model.key_text8 = item8[lang_code];
      let item9 = res.find(i => i.key_text === 'RECEIVER_MSG_3');
      this.model.key_text9 = item9[lang_code];
      let item10 = res.find(i => i.key_text === 'RECEIVER_MSG_4');
      this.model.key_text10 = item10[lang_code];
      let item11 = res.find(i => i.key_text === 'NO_DONATION_FOUND');
      this.model.key_text11 = item11[lang_code];
      let item12 = res.find(i => i.key_text === 'ACCEPT');
      this.model.key_text12 = item12[lang_code];
      let item13 = res.find(i => i.key_text == 'RECEIVER_MSG_1');
      this.model.key_text13 = item13[lang_code];
      let item14 = res.find(i => i.key_text == 'FOOD_NOTAVAILABLE_MSG');
      this.model.key_text14 = item14[lang_code];
      let item15 = res.find(i => i.key_text == 'FOOD_NOTAVAILABLE_MSG1');
      this.model.key_text15 = item15[lang_code];
      let item16 = res.find(i => i.key_text == 'YES');
      this.model.key_text16 = item16[lang_code];
      let item17 = res.find(i => i.key_text == 'NO');
      this.model.key_text17 = item17[lang_code];
      let item18 = res.find(i => i.key_text == 'ACCEPT_REQUEST_MSG');
      this.model.key_text18 = item18[lang_code];
      let item19 = res.find(i => i.key_text == 'NOT_ON_THE_WAY_MSG');
      this.model.key_text19 = item19[lang_code];
    // let item1 = res.find(i => i.key_text === 'THANK_YOU_FOR_YOUR_KIND_GESTURE');
    //   this.model.key_text1 = item1[lang_code]; 
    // let item2 = res.find(i => i.key_text === 'END_DONATION_MSG');
    //   this.model.key_text2= item2[lang_code]; 
    // let item3 = res.find(i => i.key_text === 'CHECK_DONATION');
    //   this.model.key_text3= item3[lang_code]; 
      
  //});
    
  }
  accept_food(){
    this.model.search = true;
    this.model.user_id = JSON.parse(localStorage.getItem('user_id'));
    let data;
    if(this.no_of_person > this.data.data.total_food_for){
      this.model.number_of_person = this.data.data.total_food_for;
    }
    else if(this.no_of_person <= this.data.data.total_food_for){
      this.model.number_of_person = this.no_of_person;
    }
    if(this.location_data != null){
		  data = JSON.stringify({'app_user_id' : this.app_user_id,'donar_id':this.data.data.app_user_id,'donate_food_id':this.data.data.id,  'food_type' : this.data.data.food_type, 'no_of_person' : this.model.number_of_person, 'latitude' : this.location_data.latitude, 'longitude' : this.location_data.longitude, 'colony_name' : this.location_data.colony_name, 'city' : this.location_data.city, 'state' : this.location_data.state, 'country' : this.location_data.country, 'postal_code' : this.location_data.postalCode, 'notification_type' : 1});
    }else if(this.ontheway_data.length>0){
      data = JSON.stringify({'app_user_id' : this.app_user_id,'donar_id':this.data.data.app_user_id,'donate_food_id':this.data.data.id,  'food_type' : this.data.data.food_type, 'no_of_person' : this.model.number_of_person, 'latitude' : this.ontheway_data[0].startLat, 'longitude' : this.ontheway_data[0].startLng, 'colony_name' : this.ontheway_data[1].start, 'city' : this.ontheway_data[0].city, 'state' : this.ontheway_data[0].state, 'country' : this.ontheway_data[0].country, 'postal_code' : this.ontheway_data[0].postalCode, 'notification_type' : 1});
    }
    //console.log(data);
    localStorage.setItem('temp_total_food',this.model.number_of_person);
    
		this.fetch.accept_food(data).subscribe(res => {
      if(res.success == true){
        this.model.search = false;
      localStorage.setItem('res.receiver_food_id',res.receiver_food_id);
        this.closeModal("accept");
      }
    }); 
  }
  accept_food_request(){
    this.model.search = true;
    const pickupRequired = localStorage.getItem('pickup_required') === '1';
    const thirdPartyFlags = {
      'third_party': pickupRequired ? 1 : 0,
      'pickup_required': pickupRequired ? 1 : 0
    };
    let data;
    if(this.location_data != null){
      data = JSON.stringify({'app_user_id' : this.app_user_id,'food_type' : this.food_type, 'no_of_person' : this.no_of_person, 'latitude' : this.location_data.latitude, 'longitude' : this.location_data.longitude, 'colony_name' : this.location_data.colony_name, 'city' : this.location_data.city, 'state' : this.location_data.state, 'country' : this.location_data.country, 'postal_code' : this.location_data.postalCode, 'status' : 0, 'distance' : this.distance, ...thirdPartyFlags });
    }else if(this.ontheway_data.length>0){
      data = JSON.stringify({'app_user_id' : this.app_user_id,  'food_type' : this.food_type, 'no_of_person' : this.no_of_person, 'latitude' : this.ontheway_data[0].startLat, 'longitude' : this.ontheway_data[0].startLng, 'colony_name' : this.ontheway_data[1].start, 'city' : this.ontheway_data[0].city, 'state' : this.ontheway_data[0].state, 'country' : this.ontheway_data[0].country, 'postal_code' : this.ontheway_data[0].postalCode,'status' : 0, 'distance' : 0, ...thirdPartyFlags });
    }
    
		this.fetch.accept_food_request(data).subscribe(res => {
      this.model.search = false;
      if(res.success){
        this.model.notify = 1;
      }
      else{
        console.log(res.success);
      }
      
    });
  }
  search_again(){
    this.closeModal("Wrapped Up!");
  }
  async closeModal(data) {
   
    if(this.data.data != null){
      let data= JSON.stringify({'food_id' : this.data.data.id});
      this.fetch.cancel_accept_food(data).subscribe(res => {
            if(res.success){
              
            }else{
                console.log(res.data);
            }
      });
    }
   const onClosedData: string = data;
          await this.modalController.dismiss(onClosedData);
          
	
  }

}
