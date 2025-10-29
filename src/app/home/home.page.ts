import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController  } from '@ionic/angular';
import { HomeContentPage } from '../modal/home-content/home-content.page';
import { StorageService } from '../storage.service';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { FetchService } from '../fetch.service';
import { Diagnostic } from "@ionic-native/diagnostic/ngx";
import { BrowserTab } from '@ionic-native/browser-tab/ngx';

import { Geolocation,GeolocationOptions ,Geoposition ,PositionError } from '@ionic-native/geolocation/ngx';  
declare var FCMPlugin: any;
declare var google: any;
declare var $: any;
declare var device:any;
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
model:any={};
options : GeolocationOptions;
  dataReturned: any;
	user_id: any;
	foo_lang: string;
	constructor(
		public modalController: ModalController,
		private router: Router,
		private route: ActivatedRoute,
		private storage: StorageService,
		private platform: Platform,
		private geolocation: Geolocation,
		private fetch: FetchService,
		private diagnostic: Diagnostic,
		private alertCtrl:AlertController,
		private browserTab: BrowserTab,
	) {
		this.checkVolunteer();
		this.platform.backButton.subscribeWithPriority(10, () => {
			this.router.navigate(['/home']);
			//navigator['app'].exitApp();
		});
	}
	slides = [];
	slideOpts = {
		//zoom: false,
		autoplay: {
			delay: 3000,
			disableOnInteraction: false,
			stopOnLastSlide: false
		}

	};
	ngOnInit() {
		
			this.foo_lang = JSON.parse(localStorage.getItem('lang'));
			this.checkVolunteer();
			let platform = '';
			document.addEventListener('deviceready', () => {
				platform = device.platform;
			});
			this.model.user_id = JSON.parse(localStorage.getItem('user_registerd'));
			let data = JSON.stringify({ 'id': this.model.user_id });
			let token = localStorage.getItem('device_token');
			let profile_data = JSON.stringify({ 'id': this.model.user_id, 'device_token': token, 'platform': platform });
			this.fetch.updateDeviceToken(profile_data).subscribe(async (res) => {

			});

			
			console.log(this.model.is_volunteer);
		
	  
  }

	async presentAlertAuth() {
		let confirm1 = await  this.alertCtrl.create({
			header: 'Location',
			backdropDismiss: false,
			message: "Please enable location services on your device to enhance your experience. Your device's location services are currently turned off, which may limit access to certain features. To enable them, Go to Settings > Privacy > Location Services.",
			buttons: [
			  {
				text: 'Ok',
				handler: () => {
				}
			  }
			]
		  });
		  await confirm1.present();
	}

	ionViewWillEnter() {
		this.checkVolunteer();
		this.foo_lang = JSON.parse(localStorage.getItem('lang'));
	
		localStorage.removeItem('receiver_food_type');
		localStorage.removeItem('number_of_person');
		localStorage.removeItem('set_confirm_location_route');
		localStorage.removeItem('receiver_location');
		localStorage.removeItem('food_for_no_of_person');
		this.model.user_id = localStorage.getItem('user_id');

	var self = this;
	self.options = {
		enableHighAccuracy: false,
    };
	self.geolocation.getCurrentPosition(self.options).then((resp) => {
		// let options: NativeGeocoderOptions = {
		// 	useLocale: true,
		// 	maxResults: 5
		// };
		let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
		let geocoder = new google.maps.Geocoder();
	geocoder.geocode({ 'latLng': latLng }, (results, status) => {
		
		
		results[0].address_components.forEach(function(val){
      
			if (val.types[0] == "locality"){
				
				localStorage.setItem('current_city',val.long_name);
				
			}
			  
	
		  });
	});
		
	});
  }
	ionViewDidEnter(){
		this.foo_lang = JSON.parse(localStorage.getItem('lang'));
			this.diagnostic.isLocationAvailable().then(resp =>{
				
				if(!resp){
					this.presentAlertAuth();
				}
			}).catch((error: any) => {
				
				this.presentAlertAuth();
			});
	

		localStorage.removeItem('temp_start_address');
		localStorage.removeItem('temp_end_address');
		this.model.is_volunteer = localStorage.getItem('volunteer_approve');
		
		this.model.key_text1 = "Those who are happiest are those";
		this.model.key_text2 = "who do the most for others.";
		this.model.key_text3 = "Get Food";
		this.model.key_text4 = "Donate Food";
		this.model.key_text5 = "Home";
		this.model.key_text6 = "Activity";
		this.model.key_text7 = "Volunteer";
		this.model.key_text8 = "Volunteer Food Request";
		var lang_code = JSON.parse(localStorage.getItem('lang'));
		console.log(lang_code);
		//this.fetch.getKeyText(lang_code).subscribe(res => {
			let res = this.storage.getScope();
			//alert(JSON.stringify(res));
			let item1 = res.find(i => i.key_text === 'THOSE_WHO_ARE_HAPPIEST_ARE_THOSE');
				this.model.key_text1 = item1[lang_code];
			let item2 = res.find(i => i.key_text === 'WHO_DO_THE_MOST_FOR_OTHERS.');
				this.model.key_text2 = item2[lang_code];
			let item3 = res.find(i => i.key_text === 'GET_FOOD');
				this.model.key_text3 = item3[lang_code];
			let item4 = res.find(i => i.key_text === 'DONATE_FOOD');
				this.model.key_text4 = item4[lang_code];
			let item5 = res.find(i => i.key_text === 'HOME');
				this.model.key_text5 = item5[lang_code];
			let item6 = res.find(i => i.key_text === 'ACTIVITY');
				this.model.key_text6 = item6[lang_code];
			let item7 = res.find(i => i.key_text === 'VOLUNTEER');
				this.model.key_text7 = item7[lang_code];
			let item8 = res.find(i => i.key_text === 'VOLUNTEER_FOOD_REQUEST');
				this.model.key_text8 = item8[lang_code];
		//});
	
	}
  async openModalHome() {
    const modal = await this.modalController.create({
		component: HomeContentPage,
		cssClass: 'custom_filter_modal',
		componentProps: {
			"paramID": 123,
			"paramTitle": "Test Title"
		}
    });

    modal.onDidDismiss().then((dataReturned) => {
		if (dataReturned !== null) {
			this.dataReturned = dataReturned.data;
			//alert('Modal Sent Data :'+ dataReturned);
		}
    });

    return await modal.present();
  }

	go_donate() {
		if (JSON.parse(localStorage.getItem('donor_location')) != null) {
			localStorage.removeItem('donor_location');
		}
		this.router.navigate(['/donate-food-members']);
	}

	get_food_search() {
		if (JSON.parse(localStorage.getItem('get-food-search')) != null) {
			localStorage.removeItem('get-food-search');
		}
		this.router.navigate(['/get-food-search']);
	}

	go_to_volunteer() {
		this.router.navigate(['/volunteer-food-request']);
	}
	checkVolunteer(){
		console.log("Call Volunteer");
		this.user_id = JSON.parse(localStorage.getItem('user_registerd'));
		if(this.user_id){
		  this.fetch.v_check(this.user_id).subscribe(res => {
			if(res.success == true){
			  if(res.status == 1){
				this.model.is_volunteer = res.status;
				localStorage.setItem('volunteer_approve','1');
			  }
			}
		  });
		  
		}
		
	  }
}
