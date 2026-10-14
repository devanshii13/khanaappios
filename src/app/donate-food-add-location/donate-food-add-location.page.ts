import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Geolocation,GeolocationOptions ,Geoposition ,PositionError } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { FetchService } from '../fetch.service';
import { StorageService } from '../storage.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

declare var google: any;
declare var $: any;

@Component({
  selector: 'app-donate-food-add-location',
  templateUrl: './donate-food-add-location.page.html',
  styleUrls: ['./donate-food-add-location.page.scss'],
})
export class DonateFoodAddLocationPage implements OnInit {
model:any={};
options : GeolocationOptions;
@ViewChild('map') mapElement: ElementRef;
map: any;
private geocodeRequestId = 0;
  constructor(
	private geolocation: Geolocation,
	private nativeGeocoder: NativeGeocoder,
	public alertController: AlertController,
	private http: HttpClient,
	private route: ActivatedRoute,
	private router: Router,
	private fetch: FetchService,
	private storage:StorageService,
	private zone: NgZone,
	) { }

  ngOnInit() {
	 
  }
  ionViewWillEnter(){
	this.model.alert_text = 'Please fill all the details';
	this.model.okay = 'okay';
	var lang_code = JSON.parse(localStorage.getItem('lang'));
	//this.fetch.getKeyText(lang_code).subscribe(res => {
		let res = this.storage.getScope();
		let item1 = res.find(i => i.key_text === 'HOUSE');
			this.model.key_text1 = item1[lang_code]; 
		let item2 = res.find(i => i.key_text === 'FLAT');
			this.model.key_text2 = item2[lang_code]; 
		let item3 = res.find(i => i.key_text === 'BLOCK');
			this.model.key_text3 = item3[lang_code]; 
		let item4 = res.find(i => i.key_text === 'LANDMARK');
			this.model.key_text4 = item4[lang_code]; 
		let item5 = res.find(i => i.key_text === 'HOME');
			this.model.key_text5 = item5[lang_code]; 
		let item6 = res.find(i => i.key_text === 'WORK');
			this.model.key_text6 = item6[lang_code]; 
		let item7 = res.find(i => i.key_text === 'OTHER');
			this.model.key_text7 = item7[lang_code]; 
		let item8 = res.find(i => i.key_text === 'ADD_LOCATION');
			this.model.key_text8 = item8[lang_code]; 
		let item9 = res.find(i => i.key_text === 'PLEASE_FILL_ALL_THE_DETAILS');
			this.model.alert_text = item9[lang_code];
		let item10 = res.find(i => i.key_text === 'OKAY');
			this.model.okay = item10[lang_code]; 
				
	//});  
	
	this.options = {
		enableHighAccuracy: false,
    };
	this.geolocation.getCurrentPosition(this.options).then((resp) => {
		$('#add_fav_location_spinner').css('display','none');
		$('.current_location_page_show').css('display','block');
		this.model.LastLat = resp.coords.latitude;
		this.model.LastLng = resp.coords.longitude;
		console.log('lat :'+ this.model.LastLat, 'lon :' + this.model.LastLng);
			
		this.showAddress(this.model.LastLat, this.model.LastLng);
		let latLng = new google.maps.LatLng(this.model.LastLat, this.model.LastLng);

		let mapOptions = {
			center: latLng,
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		}

		this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
		
		this.addMarker();
		
		});
  }
  addMarker(){

    let marker = new google.maps.Marker({
		map: this.map,
		animation: google.maps.Animation.DROP,
		position: this.map.getCenter(),
		draggable: true
    });

    let content = "<p>This is your current position !</p>";          
    let infoWindow = new google.maps.InfoWindow({
		content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
		infoWindow.open(this.map, marker);
    });
	this.lastLatLng(marker);
  }
  lastLatLng(marker){
    google.maps.event.addListener(marker, 'dragend', () =>{ 
		this.model.LastLat= marker.position.lat();
		this.model.LastLng= marker.position.lng();
		this.showAddress(this.model.LastLat, this.model.LastLng);
    });
  }

  showAddress(lat, lon){
	const requestId = ++this.geocodeRequestId;
	let self = this;
	let latLng = new google.maps.LatLng(lat, lon);
	let geocoder = new google.maps.Geocoder();
	geocoder.geocode({ 'latLng': latLng }, (results, status) => {
		if (requestId !== this.geocodeRequestId) {
			return;
		}
		this.zone.run(() => {
			if (status === 'OK' && results && results[0]) {
				this.model.colony_name = results[0].formatted_address;
				results[0].address_components.forEach(function(val,i){
					if (val.types.indexOf("locality") > -1) self.model.city = val.long_name;
					if (val.types.indexOf("administrative_area_level_1") > -1) self.model.state = val.long_name;
					if (val.types.indexOf("country") > -1) self.model.country = val.long_name;
					if (val.types.indexOf("postal_code") > -1) self.model.postalCode = val.long_name;
				});
			}
		});
	});
  }
  address_type(val){
	this.model.address_type = val;
	if(val == 1){
		$('#d_add_food_type_'+val).addClass('active');  
		$('#d_add_food_type_2').removeClass('active');  
		$('#d_add_food_type_3').removeClass('active');  
	}else if(val == 2){
		$('#d_add_food_type_'+val).addClass('active');  
		$('#d_add_food_type_1').removeClass('active');  
		$('#d_add_food_type_3').removeClass('active');    
	}else{
		$('#d_add_food_type_'+val).addClass('active');  
		$('#d_add_food_type_2').removeClass('active');  
		$('#d_add_food_type_1').removeClass('active');     
	}
  }
  save(){
	var house_no = $('#donor_house_no').val();
	var landmark = $('#donor_landmark').val();
	var address_type = this.model.address_type;
	if(house_no == ""){
		this.presentAlert();
	}else if(landmark == ""){
		this.presentAlert();
	}else if(address_type == ""){
		this.presentAlert();
	}else{
		let data = JSON.stringify({'app_user_id': JSON.parse(localStorage.getItem('user_id')),'house_no' : house_no, 'landmark' : landmark, 'adress_type' : address_type, 'latitude' : this.model.LastLat, 'longitude' : this.model.LastLng,'colony_name' : this.model.colony_name, 'city' : this.model.city, 'state' : this.model.state, 'country' : this.model.country, 'postalCode' : this.model.postalCode });
		localStorage.setItem('donor_location', data);
		this.router.navigate(['/donate-food']);
	}
  }
  async presentAlert() {
		const alert = await this.alertController.create({
			cssClass: 'my-custom-class',
			header: this.model.alert_text,
			buttons: [this.model.okay]
		});
		await alert.present();
  }

}
