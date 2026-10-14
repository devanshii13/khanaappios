import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FetchService } from '../fetch.service';
import { StorageService } from '../storage.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Geolocation,GeolocationOptions ,Geoposition ,PositionError } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { AlertController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { Location } from "@angular/common";
import { ErrorMsgService } from '../error-msg.service';

declare var google: any;
declare var $: any;

@Component({
  selector: 'app-saved-addresses-edit',
  templateUrl: './saved-addresses-edit.page.html',
  styleUrls: ['./saved-addresses-edit.page.scss'],
})
export class SavedAddressesEditPage implements OnInit {
model:any={};
location_data:any=[];
options : GeolocationOptions;
@ViewChild('map') mapElement: ElementRef;
map: any;
private geocodeRequestId = 0;
  constructor(private storage:StorageService, private http: HttpClient,private route: ActivatedRoute,private router: Router,private fetch: FetchService, private geolocation: Geolocation,public errorMsg : ErrorMsgService,
	private nativeGeocoder: NativeGeocoder,public alertController: AlertController,private platform: Platform,private location: Location, private zone: NgZone) {
		this.platform.backButton.subscribeWithPriority(10, () => {
			this.location.back();
		});
	}

  ngOnInit() {
	this.model.search = false;
  }

  ionViewWillEnter(){
	this.model.alert_text = 'Please fill all the details';
	this.model.okay = 'okay';
	this.model.LastLat = '';
	this.model.LastLng = '';
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
		let item8 = res.find(i => i.key_text === 'SAVE_CHANGES');
			this.model.key_text8 = item8[lang_code]; 
		let item9 = res.find(i => i.key_text === 'PLEASE_FILL_ALL_THE_DETAILS');
			this.model.alert_text = item9[lang_code]; 
		let item10 = res.find(i => i.key_text === 'OKAY');
			this.model.okay = item10[lang_code];
		let item11 = res.find(i => i.key_text === 'SAVE_AS');
			this.model.key_text11 = item11[lang_code];	
		let item12 = res.find(i => i.key_text === 'SEARCH_HERE');
			this.model.key_text12 = item12[lang_code];
		let item13 = res.find(i => i.key_text === 'LANDMARK_FIELD_IS_REQUIRED');
			this.model.key_text13 = item13[lang_code];	
		let item14 = res.find(i => i.key_text === 'SAVE_AS_FIELD_REQUIRED');
			this.model.key_text14= item14[lang_code];		 
				
	//});
	this.model.location_id = this.route.snapshot.params['id'];
	this.fetch.get_lat_lon(this.model.location_id).subscribe(res => {
		console.log(res);
		this.options = {
			enableHighAccuracy: false,
		};
		this.geolocation.getCurrentPosition(this.options).then((resp) => {
			$('#edit_location_spinner').css('display','none');
			$('.current_location_page_show').css('display','block');
			this.model.lat = res['latitude'];
			this.model.lon = res['longitude'];
			this.location_data = res;
			$('#edit_address_type_'+res['adress_type']).addClass('active');
			this.model.address_type = res['adress_type'];
			
			this.showAddress(this.model.lat, this.model.lon);
			let latLng = new google.maps.LatLng(this.model.lat, this.model.lon);
			if(this.location_data.zoom > 15){
				this.model.zoom = this.location_data.zoom;
			}
			else{
				this.model.zoom = 15;
			}
			let mapOptions = {
				center: latLng,
				zoom: this.model.zoom,
				mapTypeId: google.maps.MapTypeId.ROADMAP 
			}

			this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
		
			this.addMarker();
			this.map.addListener('zoom_changed', ()=>{
				var zoom = this.map.getZoom();
				this.model.zoom = zoom;
			});
		});
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
	var self = this;
	let latLng = new google.maps.LatLng(lat, lon);
	let geocoder = new google.maps.Geocoder();
	geocoder.geocode({ 'latLng': latLng }, (results, status) => {
		if (requestId !== this.geocodeRequestId) {
			return;
		}
		this.zone.run(() => {
			if (status === 'OK' && results && results[0]) {
				this.location_data.colony_name = results[0].formatted_address;
				results[0].address_components.forEach(function(val,i){
					if (val.types[0] == "locality"){
						self.location_data.city = val.long_name;
					}
					if (val.types[0] == "administrative_area_level_1"){
						self.location_data.state = val.long_name;
					} 
					if (val.types[0] == "country"){
						self.location_data.country = val.long_name;
					}
					if (val.types[0] == "postal_code"){
						self.location_data.postalCode = val.long_name;
					}   
				});
			}
		});
	});
  }

  address_type(val){
	this.model.address_type = val;
	if(val == 1){
		$('#edit_address_type_'+val).addClass('active');  
		$('#edit_address_type_2').removeClass('active');  
		$('#edit_address_type_3').removeClass('active');  
	}else if(val == 2){
		$('#edit_address_type_'+val).addClass('active');  
		$('#edit_address_type_1').removeClass('active');  
		$('#edit_address_type_3').removeClass('active');    
	}else{
		$('#edit_address_type_'+val).addClass('active');  
		$('#edit_address_type_2').removeClass('active');  
		$('#edit_address_type_1').removeClass('active');     
	}
  }
  update(){
	this.model.search = true;
	var house_no = $('#edit_house_no').val();
	var landmark = $('#edit_landmark').val();
	// var address_type = this.model.address_type;
	var save_as = $('#save_as').val();
	if(landmark == ""){
		this.model.search = false;
		this.errorMsg.showModal(this.model.key_text13);
	}else if(save_as == ""){
		this.model.search = false;
		this.errorMsg.showModal(this.model.key_text14);
	}else{
		var user_id = JSON.parse(localStorage.getItem('user_id'));
		if(this.model.LastLat== ''){
			this.model.LastLat = this.model.lat;
		}
		if(this.model.LastLng == ''){
			this.model.LastLng = this.model.lon;
		}
		let data = JSON.stringify({'zoom':this.model.zoom,'id' : this.model.location_id,'app_user_id' : user_id, 'house_no' : house_no, 'landmark' : landmark, 'address_type' : save_as, 'latitude' : this.model.LastLat, 'longitude' : this.model.LastLng,'colony_name' : this.location_data.colony_name, 'city' : this.location_data.city, 'state' : this.location_data.state, 'country' : this.location_data.country, 'postalCode' : this.location_data.postalCode});
		console.log(data);
		this.fetch.updateLocation(data).subscribe(res => {
			console.log(res);
			this.model.search = false;
			if(res.success == true){
				var id = JSON.parse(localStorage.getItem('user_registerd'));
				this.router.navigate(['/saved-addresses',id]);
			}
		});
	}
  }
  close_btn(){
	  this.location.back();
  }

}
