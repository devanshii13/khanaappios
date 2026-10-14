import { Component, OnInit } from '@angular/core';
import { FetchService } from '../fetch.service';
import { StorageService } from '../storage.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AlertController , ModalController } from '@ionic/angular';
import { CurrentLocationContentPage } from '../modal/current-location-content/current-location-content.page';
import { DonateFoodContentPage } from '../modal/donate-food-content/donate-food-content.page';
import { ErrorMsgModalPage } from '../modal/error-msg-modal/error-msg-modal.page';
declare var $:any;
@Component({
  selector: 'app-donate-food-pickup-drop',
  templateUrl: './donate-food-pickup-drop.page.html',
  styleUrls: ['./donate-food-pickup-drop.page.scss'],
})
export class DonateFoodPickupDropPage implements OnInit {
  model:any={};
  notification:any=[];
  dataReturned: any;
  location_data:any;
	saved_address:any=[];
	donate_address:any=[];
  alert_text: any;
  veg_food: any;
  nonveg_food: any;
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
    this.model.is_volunteer = 0;
    if(localStorage.getItem('volunteer_approve') != null){
      this.model.is_volunteer = localStorage.getItem('volunteer_approve');
    }  
    var id = parseInt(this.route.snapshot.params['id']);
	  var id2 = parseInt(this.route.snapshot.params['id2']);
    this.model.veg = id;
    this.model.nonveg = id2;
    if(id != 0){
      this.fetch.reviewFood(id).subscribe(res => {
        this.veg_food = res['data'];
      });
      }
      if(id2 != 0){
      this.fetch.reviewFood(id2).subscribe(res => {
        this.nonveg_food = res['data'];
      });
      }
    this.model.alert_text = 'Please fill all the details';
    this.model.okay = 'okay';
    var lang_code = JSON.parse(localStorage.getItem('lang'));
    ///this.fetch.getKeyText(lang_code).subscribe(res => {
      let res = this.storage.getScope();
      let item1 = res.find(i => i.key_text === 'REQUEST_PICKUP');
        this.model.key_text1 = item1[lang_code]; 
      let item2 = res.find(i => i.key_text === 'I_WILL_DROP');
        this.model.key_text2 = item2[lang_code]; ;
      let alert_text = res.find(i => i.key_text === 'KEEP_PIN_EXACT_LOCATION');
        this.alert_text = alert_text[lang_code]; ;	
        let item5 = res.find(i => i.key_text === 'HOME');
				this.model.key_text5 = item5[lang_code];
			let item6 = res.find(i => i.key_text === 'ACTIVITY');
				this.model.key_text6 = item6[lang_code];
			let item7 = res.find(i => i.key_text === 'VOLUNTEER');
      this.model.key_text7 = item7[lang_code];
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
        this.donate_address =this.dataReturned;
        var formData: any = new FormData();
        formData.append("id", this.model.veg);
        formData.append("id2", this.model.nonveg);
        formData.append("donate_address", this.donate_address);
        let data = JSON.stringify({'id' : this.model.veg, 'id2' : this.model.nonveg,'donate_address' : this.donate_address});
         this.fetch.donate_food_location_new(formData).subscribe(res => {
          
          this.model.search = false;
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
        "veg" : this.model.veg,
        "nonveg" : this.model.nonveg,
        "veg_food" : this.veg_food,
        "nonveg_food" : this.nonveg_food
      }
      });
  
      modal.onDidDismiss().then((dataReturned) => {
      localStorage.removeItem('donate_address_type'); 
      localStorage.removeItem('set_confirm_location_route'); 
      localStorage.removeItem('donor_location'); 
      this.router.navigate(['/home']);
      
      if (dataReturned !== null) {
        this.dataReturned = dataReturned.data;
        
      }
      });
  
      return await modal.present();
    }
    presentConfirm(){
       this.router.navigate(['/donate-food-pickup-method', this.model.veg, this.model.nonveg]);
    
    }
    nextScreen(){
      this.router.navigate(['/choose-donate-option',this.model.veg,this.model.nonveg])
    }
}
