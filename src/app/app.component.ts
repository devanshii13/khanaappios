import { Component, OnInit } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { FetchService } from './fetch.service';
import { StorageService } from './storage.service';
import { ModalController } from '@ionic/angular';
import { PushNotificationPage } from './modal/push-notification/push-notification.page';
import { DeliverFoodVolunteerPage } from './modal/deliver-food-volunteer/deliver-food-volunteer.page';
import { PickupSuccessModalPage } from './modal/pickup-success-modal/pickup-success-modal.page';
import { SimplePushNotificationPage } from './modal/simple-push-notification/simple-push-notification.page';
import { Geolocation,GeolocationOptions ,Geoposition ,PositionError } from '@ionic-native/geolocation/ngx';
import { JsonpClientBackend } from '@angular/common/http';
import { FCM } from "cordova-plugin-fcm-with-dependecy-updated/ionic/ngx";
import { Network } from '@ionic-native/network/ngx';

declare var google: any;
declare var FCMPlugin: any;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  options : GeolocationOptions;
model:any={};
user_id:any;
pincode;
isLanguageChanged: boolean;

  public selectedIndex = 0;
  public appPages = [];
  volunteer_status: number = -1;
  constructor(
    private geolocation: Geolocation,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
	  private router: Router,
    private fetch: FetchService,
    private storage : StorageService,
    private modalController : ModalController,
    private fcm : FCM,
    private network: Network
  ) {
    
    var self = this;
    setInterval(function(){ 
      self.checkVolunteer();
      self.checkLoginUser();
    }, 1000);//run this thang every 2 seconds
   
    this.model.fromNotification = false;
    
    this.pushSetup();

    
     document.addEventListener('deviceready',() => {
      
     
        // FCMPlugin.getToken((token: any) => {
        //   alert(token);
        //   localStorage.setItem('device_token', JSON.stringify(token));
          
        //   });
        // FCMPlugin.onNotification((data: any) => {
        // this.model.fromNotification = true;
        // var self = this;
        // if (data.wasTapped) 
        //   {
            
        //     var jd = JSON.parse(data.message);
        //     if(jd.check_val == '1' ){
        //       self.showNotification(jd.body,jd.my_array,jd.donor_details,jd.request_id);
        //     }else if(jd.check_val == '2' ){
        //       self.showFoodDeliverPopupToVolunteer(jd.my_array);
        //     }else if(jd.check_val == '3' ){
        //       self.showFoodDeliverPopupToDonor(jd.my_array);
        //     }
        //     // Notification was received on device tray and tapped by the user.
             

        //   } else {
        //     //alert("Received in foreground");
        //      var jd = JSON.parse(data.message);
        //     //;
        //     if(jd.check_val == '1' ){
        //       this.showNotification(data.body,jd.my_array,jd.donor_details,jd.request_id);
        //     }else if(jd.check_val == '2' ){
        //       this.showFoodDeliverPopupToVolunteer(jd.my_array);
        //     }else if(jd.check_val == '3' ){
        //       this.showFoodDeliverPopupToDonor(jd.my_array);
        //     }else{
        //       this.showAlert(data.body);
        //     }
            
            
        //   }
        // },(success:any)=>{
        //   if(!this.model.fromNotification){
        //           if(JSON.parse(localStorage.getItem('user_registerd')) != null){
        //             this.fetch.isLanguageChanged.next(JSON.parse(localStorage.getItem('lang')));
        //             this.router.navigate(['/home']);
        //             //this.navCtrl.navigateBack(['/home']);
        //           }else if((localStorage.getItem('user_id')) != undefined && localStorage.getItem('isotpverified') == '1'){
        //             if(JSON.parse(localStorage.getItem('user_id')) != null){
        //               this.fetch.isLanguageChanged.next(JSON.parse(localStorage.getItem('lang')));
        //               this.router.navigate(['/register-as-volunteer']);
        //             }
                    
        //             //this.navCtrl.navigateBack(['/register-as-volunteer']);
        //           }else if(localStorage.getItem('isotpverified') == '0'){
        //             this.router.navigate(['/otp']);
        //           }else{
        //             this.router.navigate(['/language']);
        //           }
        //       }
        // },(error:any)=>{
         
        // });

      
      });
    
    //   if(!this.model.fromNotification){
    //     console.log((localStorage.getItem('isotpverified')));
    //     if(JSON.parse(localStorage.getItem('user_registerd')) != null){
    //       this.fetch.isLanguageChanged.next(JSON.parse(localStorage.getItem('lang')));
    //       this.router.navigate(['/home']);
    //       //this.navCtrl.navigateBack(['/home']);
    //     }else if((localStorage.getItem('user_id')) != undefined  && localStorage.getItem('isotpverified') == '1'){
    //       if(JSON.parse(localStorage.getItem('user_id')) != null){
    //         this.fetch.isLanguageChanged.next(JSON.parse(localStorage.getItem('lang')));
    //         this.router.navigate(['/register-as-volunteer']);
    //       }
          
    //       //this.navCtrl.navigateBack(['/register-as-volunteer']);
    //     }else if(localStorage.getItem('isotpverified') == '0'){
    //       this.router.navigate(['/otp']);
    //     }else{
    //       this.router.navigate(['/language']);
    //     }
    // }
       
         
      
  
	this.fetch.isLanguageChanged.subscribe( value => {
	    this.isLanguageChanged = value;
		var lang_code = JSON.parse(localStorage.getItem('lang'));
		this.fetch.getKeyText(lang_code).subscribe(rs => {
      this.storage.setScope(rs);
      let res = this.storage.getScope();
      let item1 = res.find(i => i.key_text === 'REGISTER_AS_VOLUNTEER');
				this.model.key_text1 = item1[lang_code];
      let item01 = res.find(i => i.key_text === 'VOLUNTEER_PROFILE');
			this.model.key_text01 = item01[lang_code];
      let item_v_txt = res.find(i => i.key_text === 'VOLUNTEER_PROFILE_TXT');
			this.model.key_pro_text = item_v_txt[lang_code];
			let item2 = res.find(i => i.key_text === 'SIDEBAR_QUOTE1');
				this.model.key_text2 = item2[lang_code];
			let item3 = res.find(i => i.key_text === 'PROFILE');
				this.model.key_text3 = item3[lang_code];
			let item4 = res.find(i => i.key_text === 'SIDEBAR_QUOTE2');
				this.model.key_text4 = item4[lang_code];
			let item5 = res.find(i => i.key_text === 'SAVED_ADDRESSES');
				this.model.key_text5 = item5[lang_code];
			let item6 = res.find(i => i.key_text === 'YOUR_PREVIOUSLY_SAVED_ADDRESSES');
				this.model.key_text6 = item6[lang_code];
			let item7 = res.find(i => i.key_text === 'CHOOSE_LANGUAGE');
				this.model.key_text7 = item7[lang_code];
			let item8 = res.find(i => i.key_text === 'SIDEBAR_QUOTE3');
				this.model.key_text8 = item8[lang_code];
			let item9 = res.find(i => i.key_text === 'HELP');
				this.model.key_text9 = item9[lang_code];
			let item10 = res.find(i => i.key_text === 'SIDEBAR_QUOTE4');
				this.model.key_text10 = item10[lang_code];
			let item11 = res.find(i => i.key_text === 'ABOUT_US');
				this.model.key_text11 = item11[lang_code];
			let item12 = res.find(i => i.key_text === 'SIDEBAR_QUOTE5');
        this.model.key_text12 = item12[lang_code];
      let item13 = res.find(i=> i.key_text === 'SHOW_IN_BETWEEN');
         this.model.key_text13 = item13[lang_code];  
      let item14 = res.find(i=> i.key_text === 'LOGOUT');
         this.model.key_text14 = item14[lang_code];  
			
	    });
	});
  
  
  
    this.initializeApp();
    
  }
  private async pushSetup() {
   
    await this.platform.ready();
    

    if (!this.platform.is('cordova')) {
      return;
    }
   
    let token = await this.fcm.getToken();
    //alert(token);
    localStorage.setItem('device_token', JSON.stringify(token));

    console.log('Subscribing to token updates');
    this.fcm.onTokenRefresh().subscribe((newToken) => {
      //this.token = newToken;
      console.log(newToken);
      localStorage.setItem('device_token', JSON.stringify(newToken));
    });

    console.log('Subscribing to new notifications');
    this.fcm.onNotification().subscribe((payload) => {
      //alert('in');
      //this.pushPayload = payload;
      console.log( payload);
      this.model.fromNotification = true;
        var self = this;
        if (payload.wasTapped) 
          {
            var jd = JSON.parse(payload.message);
            
            if(jd.check_val == '1' ){
              self.showNotification(payload.body,jd.my_array,jd.donor_details,jd.request_id);
            }else if(jd.check_val == '2' ){
              self.showFoodDeliverPopupToVolunteer(jd.my_array);
            }else if(jd.check_val == '3' ){
              self.showFoodDeliverPopupToDonor(jd.my_array);
            }
            // Notification was received on device tray and tapped by the user.
             

          } else {
            //alert("Received in foreground");
             var jd = JSON.parse(payload.message);
            //;
            
            if(jd.check_val == '1' ){
              this.showNotification(payload.body,jd.my_array,jd.donor_details,jd.request_id);
            }else if(jd.check_val == '2' ){
              this.showFoodDeliverPopupToVolunteer(jd.my_array);
            }else if(jd.check_val == '3' ){
              this.showFoodDeliverPopupToDonor(jd.my_array);
            }else{
              this.showAlert(payload.body);
            }
            
            
          }
    });

   let hasPermission = await this.fcm.requestPushPermission();
    console.log(hasPermission);

   

  //  let pushPayload = await this.fcm.getInitialPushPayload();
  //   console.log(pushPayload);

  this.fcm.getInitialPushPayload().then( data => {
      if(data) {
        if(data.wasTapped) {
             // we know the user launched the app by clicking on the notification

             // data here contains the data object we defined earlier so you can do whatever you want with the data like navigate to a specific page etc.
             
             var jd = JSON.parse(data.message);
            
            if(jd.check_val == '1' ){
              this.showNotification(data.body,jd.my_array,jd.donor_details,jd.request_id);
            }else if(jd.check_val == '2' ){
              this.showFoodDeliverPopupToVolunteer(jd.my_array);
            }else if(jd.check_val == '3' ){
              this.showFoodDeliverPopupToDonor(jd.my_array);
            }
        }
      }
    })  
    //alert(this.model.fromNotification);
    

    
      if(!this.model.fromNotification){
        console.log((localStorage.getItem('isotpverified')));
        if(JSON.parse(localStorage.getItem('user_registerd')) != null){
          this.fetch.isLanguageChanged.next(JSON.parse(localStorage.getItem('lang')));
          this.router.navigate(['/home']);
          //this.navCtrl.navigateBack(['/home']);
        }else if((localStorage.getItem('user_id')) != undefined  && localStorage.getItem('isotpverified') == '1'){
          if(JSON.parse(localStorage.getItem('user_id')) != null){
            this.fetch.isLanguageChanged.next(JSON.parse(localStorage.getItem('lang')));
            this.router.navigate(['/register-as-volunteer']);
          }
          
          //this.navCtrl.navigateBack(['/register-as-volunteer']);
        }else if(localStorage.getItem('isotpverified') == '0'){
          this.router.navigate(['/otp']);
        }else{
          this.router.navigate(['/language']);
        }
    }
  
  } 
  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
	  this.statusBar.styleBlackTranslucent();
      this.splashScreen.hide();

      var self = this;
      self.options = {
      enableHighAccuracy: false,
      };
      self.geolocation.getCurrentPosition(self.options).then((resp) => {
       console.log('inside');
       self.model.lat = resp.coords.latitude;
       self.model.lon = resp.coords.longitude;
       
       self.showAddress(self.model.lat, self.model.lon);
     
     }); 
      
    });
    this.checkVolunteer();
    //alert('dsd');
    
  }

  showAddress(lat, lon){
    var self = this;
    let latLng = new google.maps.LatLng(lat, lon);
    let geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ 'latLng': latLng }, (results, status) => {
  
      console.log("all results",results);
      self.pincode = results[0].address_components[5].short_name;
      
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

          
         
          console.log(self.model.postalCode+"postalCode");
        }   
    
        });
        
        setTimeout(()=>{
          console.log(self.model.postalCode,"--")
          if(self.model.postalCode){
            self.closeModal(self.model.postalCode);
          }
        },1000)
    });
  }

  async closeModal(code) {
    
    localStorage.setItem('pincode',code.toString());
   if(this.user_id ){
        console.log(this.user_id+code,'user-id');
          var datap={
            pincode:code 
          };   
        console.log("posted data"+datap); 
        this.fetch.check_pincode(datap).subscribe(res=>{
        console.log(res,"check_pincode");
            if (res.success== true){
              this.router.navigate(['/pincode-error-component']);
              localStorage.setItem('success','true');
            } 
      });
   }
}

  ngOnInit() {
    
    var self = this;
    var lang_code = JSON.parse(localStorage.getItem('lang'));
      const path = window.location.pathname.split('folder/')[1];
    
	  //console.log("app.component"); 

 
    if (path !== undefined) {
      this.selectedIndex = this.appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
    }

    

	
  }
  checkVolunteer(){
    this.user_id = JSON.parse(localStorage.getItem('user_registerd'));
    if(this.user_id){
      this.fetch.v_check(this.user_id).subscribe(res => {
        if(res.success == true){
          if(res.status == 1){
            this.volunteer_status = 1;
            localStorage.setItem('volunteer_approve','1');
            console.log(this.volunteer_status);
          }else if(res.status == 2){
            this.volunteer_status = 2;
            console.log(this.volunteer_status);
          }
          else{
            this.volunteer_status = 0;
            console.log(this.volunteer_status);
            localStorage.setItem('volunteer_approve','0');
          }
        }else{
          localStorage.setItem('volunteer_approve','-1');
          this.volunteer_status = -1;
        }
      });
    }
    
  }
  checkLoginUser(){
    if(localStorage.getItem('user_id')!=undefined ){
      if(JSON.parse(localStorage.getItem('user_id')) !=null ){
        let data = JSON.stringify({'id': JSON.parse(localStorage.getItem('user_id'))});
        this.fetch.profile(data).subscribe(res => {
        if(res['status']!=1){
          this.logout();
        }
    });
      }
    }
    
  }
  save_address(){
	  var id = JSON.parse(localStorage.getItem('user_registerd'));
	  this.router.navigate(['/saved-addresses',id]);
  }
  logout(){
    localStorage.clear();
    localStorage.setItem('lang', JSON.stringify("en"));
    this.fetch.isLanguageChanged.next(JSON.parse(localStorage.getItem('lang')));
		this.router.navigate(['/mobile-number']);
  }
  side_bar_route(route){
	this.router.navigate(['/'+route]);  
  }
  async showNotification(msg,array,donor_details,request_id) {
      const modal = await this.modalController.create({
      component: PushNotificationPage,
      cssClass: 'custom_current_location_modal notification-modal',
      backdropDismiss : false,
      componentProps: {
        "array": array,
        "donor_details": donor_details,
        "request_id": request_id,
        "message": msg
      }
      });  
      modal.onDidDismiss().then((dataReturned) => {
      
      });
  
      return await modal.present();
    } 
    async showFoodDeliverPopupToVolunteer(array) {
      const modal = await this.modalController.create({
      component: DeliverFoodVolunteerPage,
      cssClass: 'custom_feedback_modal  my_volunteer_completed_modal',
      backdropDismiss : false,
      componentProps: {
        "array": array,
      }
      });  
      modal.onDidDismiss().then((dataReturned) => {
      
      });
  
      return await modal.present();
    } 
    async showFoodDeliverPopupToDonor(array) {
      const modal = await this.modalController.create({
      component: PickupSuccessModalPage,
      cssClass: 'custom_filter_modal cancel_allot_food_popup',
      backdropDismiss : false,
      componentProps: {
        "array": array,
      }
      });  
      modal.onDidDismiss().then((dataReturned) => {
      
      });
  
      return await modal.present();
    } 
    async showAlert(msg) {
      const modal = await this.modalController.create({
      component: SimplePushNotificationPage,
      cssClass: 'custom_current_location_modal notification-modal',
      backdropDismiss : false,
      componentProps: {
        "msg": msg,
      }
      });  
      modal.onDidDismiss().then((dataReturned) => {
      
      });
  
      return await modal.present();
    } 
}
