import { Component, OnInit,Input } from '@angular/core';
import { FetchService } from '../../fetch.service';
import { StorageService } from '../../storage.service'; 
import { Router } from '@angular/router';
import { HomeContentPage } from './../home-content/home-content.page';
import { CommonMessagePage } from '../common-message/common-message.page';
import { AlertController } from "@ionic/angular";
import { 
  ModalController, 
  NavParams 
  } from '@ionic/angular';
  import { Geolocation,GeolocationOptions ,Geoposition ,PositionError } from '@ionic-native/geolocation/ngx';
  import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { SimplePushNotificationPage } from '../simple-push-notification/simple-push-notification.page';
import { DomSanitizer } from '@angular/platform-browser';
  declare var google: any;
  declare var $:any;
@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.page.html',
  styleUrls: ['./terms-conditions.page.scss'],
})
export class TermsConditionsPage implements OnInit {
  @Input() content;
  @Input() paramTitle;
  model:any={};
  app_title:any;
  page_key1:any;
  page_key2:any;
  Latitude: number;
  Longitude: number;
  pincode;
  address: string;
  options : GeolocationOptions;
  termsContent:any;
  constructor(private modalController: ModalController,
    private sanitizer: DomSanitizer,
    private geolocation: Geolocation,
    public alertController: AlertController,
    private nativeGeocoder: NativeGeocoder,
    private navParams: NavParams,private storage:StorageService,private router : Router,
	private fetch: FetchService) { }

  ngOnInit() {
    this.termsContent = this.sanitizer.bypassSecurityTrustHtml(this.content);
    this.app_title = 'Khanaa.app';
    this.page_key1 = 'Terms & Conditions';
    
    this.model.accept_btn = 'Accept';
    var lang_code = JSON.parse(localStorage.getItem('lang'));
    let res = this.storage.getScope();
    let item1 = res.find(i => i.key_text === 'KHANAA_APP');
      this.app_title = item1[lang_code];
    let item2 = res.find(i => i.key_text === 'TERMS_AND_CONDITIONS');
      this.page_key1 = item2[lang_code];	
    let item3 = res.find(i => i.key_text === 'ACCEPT');
      this.model.accept_btn = item3[lang_code];
      let item4 = res.find(i => i.key_text === 'SORRY_NOT_AVAILABLE_IN_YOUR_AREA');
      this.model.key4 = item4[lang_code];
      let item5 = res.find(i => i.key_text === 'OKAY');
			this.model.key_text5 = item5[lang_code];
    var lang_code = JSON.parse(localStorage.getItem('lang'));

    var self = this;
    self.options = {
    enableHighAccuracy: false,
    };
    self.geolocation.getCurrentPosition(self.options).then((resp) => {
     self.model.lat = resp.coords.latitude;
     self.model.lon = resp.coords.longitude;
     
     self.showAddress(self.model.lat, self.model.lon);
   
   }); 
  }

  showAddress(lat, lon){
    var self = this;
    let latLng = new google.maps.LatLng(lat, lon);
    let geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ 'latLng': latLng }, (results, status) => {
  
      console.log("all results",results);
      this.pincode = results[0].address_components[5].short_name;
      
      this.model.colony_name = results[0].formatted_address;
      console.log(this.model.colony_name);
      
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
         
          console.log(self.model.postalCode);
        }   
    
        });
        
       
    });
  }
  async showAlert(msg) {
    const alert = await this.alertController.create({
      cssClass: "my-custom-class custom_alert_1",
      message: msg,
      buttons: [
        {
          text: this.model.key_text5,
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            //this.router.navigate(['/home']);
          },
        },
      ],
    });

    await alert.present();
  }
  // async showAlert(msg) {
  //   const modal = await this.modalController.create({
  //   component: SimplePushNotificationPage,
  //   cssClass: 'custom_current_location_modal notification-modal',
  //   backdropDismiss : false,
  //   componentProps: {
  //     "msg": msg,
  //   }
  //   });  
  //   modal.onDidDismiss().then((dataReturned) => {
    
  //   });

  //   return await modal.present();
  // } 

  
  async successFullRegistration() { 
    const modal = await this.modalController.create({
      component: HomeContentPage,
      cssClass: 'home_content_modal',
      componentProps: {
        "paramID": 123,
        "paramTitle": "Test Title"
      }
    }); 

    modal.onDidDismiss().then((dataReturned) => {
    this.router.navigate(['/home'], { replaceUrl: true });
      if (dataReturned !== null) {
      }
    });

    return await modal.present();
  }
  async closeModal(data) {
    this.model.search = true;
      
      if(this.paramTitle == 1){
        setTimeout(()=>{
          const onClosedData: string = data;
          this.modalController.dismiss(onClosedData);
          var datap={
            pincode:this.model.postalCode
           }   
           console.log("posted data",datap);
                 
        this.fetch.check_pincode(datap).subscribe(res=>{
          this.model.search = false;
            if (res.success== true){
              // this.showAlert(this.model.key4);
              this.router.navigate(['/pincode-error-component']);
            } 
      })
      this.router.navigate(['/home']);
        },3000)
        
      }else{
        this.model.search = false;
        const onClosedData: string = data;
      await this.modalController.dismiss(onClosedData);
        this.successFullRegistration();
      }
  }
}
