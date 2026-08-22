import { Component, OnInit, ViewChild ,ElementRef,NgZone } from '@angular/core';
import { Geolocation,GeolocationOptions ,Geoposition ,PositionError } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { FetchService } from '../fetch.service';
import { StorageService } from '../storage.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Location } from "@angular/common";
import { ErrorMsgService } from '../error-msg.service';

declare var google: any;
declare var $: any;

@Component({
  selector: 'app-saved-addresses-add',
  templateUrl: './saved-addresses-add.page.html',
  styleUrls: ['./saved-addresses-add.page.scss'],
})
export class SavedAddressesAddPage implements OnInit {
  model:any={};
  marker: any;
  sources;
  options : GeolocationOptions;
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  autocomplete:any={};
  geo: any;
  service = new google.maps.places.AutocompleteService();
  private geocodeRequestId = 0;
  constructor(
	private geolocation: Geolocation,
	private nativeGeocoder: NativeGeocoder,
	public alertController: AlertController,
	private http: HttpClient,
	private route: ActivatedRoute,
	private router: Router,
	private fetch: FetchService,
	private storage: StorageService,
	private platform: Platform, 
	private zone: NgZone,
	private location: Location,
	public errorMsg : ErrorMsgService
	) { 
	this.platform.backButton.subscribeWithPriority(10, () => {
		this.location.back();
	});
  }
  ngOnInit() {
	this.model.search = false;
  }
  ionViewWillEnter() {

	//$('.current_location_page_show').hide();  
	//$('#add_t_1').addClass('active');
	this.model.alert_text = 'Please fill all the details';
	this.model.okay = 'okay';
	this.model.zoom =15;
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
		let item11 = res.find(i => i.key_text === 'SAVE_AS');
			this.model.key_text11 = item11[lang_code];
		let item12 = res.find(i => i.key_text === 'SEARCH_HERE');
			this.model.key_text12 = item12[lang_code];
		let item13 = res.find(i => i.key_text === 'LANDMARK_FIELD_IS_REQUIRED');
			this.model.key_text13 = item13[lang_code];	
		let item14 = res.find(i => i.key_text === 'SAVE_AS_FIELD_REQUIRED');
			this.model.key_text14= item14[lang_code];				 
				
	//});
	var self = this;
	self.options = {
		enableHighAccuracy: false,
    };
	self.geolocation.getCurrentPosition(self.options).then((resp) => {
		
		$('#add_location_spinner').css('display','none');
		$('.current_location_page_show').css('display','block');
		self.model.LastLat = resp.coords.latitude;
		self.model.LastLng = resp.coords.longitude;
		console.log('lat :'+ self.model.LastLat, 'lon :' + self.model.LastLng);
		self.showAddress(self.model.LastLat, self.model.LastLng);
		let latLng = new google.maps.LatLng(self.model.LastLat, self.model.LastLng);
		let mapOptions = {
			center: latLng,
			zoom: self.model.zoom,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		}

		self.map = new google.maps.Map(self.mapElement.nativeElement, mapOptions);
		
		self.addMarker();
		self.map.addListener('zoom_changed', ()=>{
			var zoom = self.map.getZoom();
			self.model.zoom = zoom;
		});
	}); 
	
  }
  addMarker(){
	console.log(this.map.getCenter());
    this.marker = new google.maps.Marker({
    map: this.map,
    animation: google.maps.Animation.DROP,
    position: this.map.getCenter(),
	draggable: true
    });

    let content = "<p>This is your current position !</p>";          
    let infoWindow = new google.maps.InfoWindow({
    content: content
    });

    google.maps.event.addListener(this.marker, 'click', () => {
    infoWindow.open(this.map, this.marker);
    });
	this.lastLatLng(this.marker);
}
  lastLatLng(marker){
    google.maps.event.addListener(marker, 'dragend', () =>{
        this.model.LastLat= marker.position.lat();
		this.model.LastLng= marker.position.lng();
		this.showAddress(this.model.LastLat,this.model.LastLng);
    });
  }
  lastLatLng2(marker){
        this.model.LastLat= marker.position.lat();
		this.model.LastLng= marker.position.lng();
	    this.showAddress(this.model.LastLat,this.model.LastLng);
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
				this.model.colony_name = results[0].formatted_address;
				results[0].address_components.forEach(function(val,i){
					if (val.types[0] == "locality"){
						self.model.city = val.long_name;
					}
					if (val.types[0] == "administrative_area_level_1"){
						self.model.state = val.long_name;
					} 
					if (val.types[0] == "country"){
						self.model.country = val.long_name;
					}
					if (val.types[0] == "postal_code"){
						self.model.postalCode = val.long_name;
					}   
				});
			}
		});
	});
  }

  address_type(val){
	this.model.address_type = val;
	if(val == 1){
		$('#add_t_'+val).addClass('active');  
		$('#add_t_2').removeClass('active');  
		$('#add_t_3').removeClass('active');  
	}else if(val == 2){
		$('#add_t_'+val).addClass('active');  
		$('#add_t_1').removeClass('active');  
		$('#add_t_3').removeClass('active');    
	}else{
		$('#add_t_'+val).addClass('active');  
		$('#add_t_1').removeClass('active');  
		$('#add_t_2').removeClass('active');     
	}
  }
  save(){
	this.model.search = true;
	var house_no = $('#add_location_house_no').val();
	var landmark = $('#add_location_landmark').val();
	// var address_type = this.model.address_type;
	var save_as = $('#save_as').val();
	// if(house_no == ""){
	// 	this.presentAlert("House No. field is required");
	// }else 
	if(landmark == ""){
		this.model.search = false;
		this.errorMsg.showModal(this.model.key_text13);
	}else if(save_as == ""){
		this.model.search = false;
		this.errorMsg.showModal(this.model.key_text14);
	}else{
		this.model.user_id = JSON.parse(localStorage.getItem('user_id'));
		let data = JSON.stringify({'zoom':this.model.zoom,'app_user_id' : this.model.user_id, 'house_no' : house_no, 'landmark' : landmark, 'address_type' : save_as, 'latitude' : this.model.LastLat, 'longitude' : this.model.LastLng,'colony_name' : this.model.colony_name, 'city' : this.model.city, 'state' : this.model.state, 'country' : this.model.country, 'postalCode' : this.model.postalCode });
		//alert(data);
		this.fetch.add_location(data).subscribe(res => {
			this.model.search = false;
			console.log(res);
			//alert(res.success);
			if(res.success == true){
				this.router.navigate(['/saved-addresses',this.model.user_id]);
			}
		});
	}
  }
  async presentAlert(msg) {
	const alert = await this.alertController.create({
		cssClass: 'my-custom-class',
		header: msg,
		buttons: [this.model.okay]
	});
	await alert.present();
  }
  close_btn(){
	  this.location.back();
	 
  }
  chooseSource(item: any) {
    this.sources = [];
    this.autocomplete.start = item;
    this.geo = item;
    this.geoCode(this.geo,'start');//convert Address to lat and long
  }
  dismissSource(){
	this.sources = [];
}
  updateSources() {
    
    if ( this.autocomplete.start == '') {
     this.sources = [];
    return;
    }
      let me = this;
        this.service.getPlacePredictions({
        input: this.autocomplete.start,
        componentRestrictions: {
          country: 'in'
        }
      }, (predictions, status) => {
      me.sources = [];

      me.zone.run(() => {
        if (predictions != null) {
            predictions.forEach((prediction) => {
              me.sources.push(prediction.description);
            });
          }
        });
		//console.log(this.sources);
      });
    
  }
  geoCode(address:any,path) {
    let geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ 'address': address }, (results, status) => {
     var address_components = results[0].address_components;
     var self = this;
      address_components.forEach(function(val,i){
        
        if (val.types[0] == "locality"){
            
            self.model.city = val.long_name;
        }
        if (val.types[0] == "administrative_area_level_1"){
				
          self.model.state = val.long_name;
        } 
        if (val.types[0] == "country"){
          
          self.model.country = val.long_name;
        }
        if (val.types[0] == "postal_code"){
          
          self.model.postalCode = val.long_name;
        }  

      });
      if(path == 'start'){
        this.model.startLat = results[0].geometry.location.lat();
        this.model.startLng = results[0].geometry.location.lng();
		this.addMarker2(this.model.startLat,this.model.startLng );
      }
    // alert("lat: " + this.latitude + ", long: " + this.longitude);
   });
   
 }
 addMarker2(lat, lng){
	this.marker.setMap(null);
	this.showAddress(lat , lng)
	let mapOptions = {
		center: new google.maps.LatLng(lat, lng),
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP
		}

	this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.marker = new google.maps.Marker({
    map: this.map,
    animation: google.maps.Animation.DROP,
    position: new google.maps.LatLng(lat, lng),
	draggable: true
    });
    let content = "<p>This is your current position !</p>";          
    let infoWindow = new google.maps.InfoWindow({
    content: content
    });

    google.maps.event.addListener(this.marker, 'click', () => {
    infoWindow.open(this.map, this.marker);
    });
	this.lastLatLng2(this.marker);
}
}
