import { Component, OnInit,NgZone  } from '@angular/core';
import { FetchService } from '../fetch.service';
import { StorageService } from '../storage.service';
import { environment } from '../../environments/environment';
import { AlertController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
declare var $:any;
@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.page.html',
  styleUrls: ['./about-us.page.scss'],
})
export class AboutUsPage implements OnInit {
  private captchaPassed: boolean = false;
  private captchaResponse: string;
  model:any={};
  icons : any =[];
  groupedThanks:any = [];
  aboutUs:any;
  constructor(private sanitizer: DomSanitizer,private fetch: FetchService,private zone: NgZone,public alertController: AlertController, private storage:StorageService) { }
 
  ngOnInit() {
    this.model.search = false;
    
  }
  ionViewWillEnter() {
    // setTimeout(()=>{
    //   $('.current_location_spinner_position').hide();
    // },10000);
    this.model.image_url = environment.image_url;
  }

  ionViewDidEnter(){
    var lang_code = JSON.parse(localStorage.getItem('lang'));
    //this.fetch.getKeyText(lang_code).subscribe(res => {
      let res = this.storage.getScope();
			let item1 = res.find(i => i.key_text === 'ABOUT_US');
				this.model.key_text1 = item1[lang_code];
      let item2 = res.find(i => i.key_text === 'SPECIAL_THANKS_TO');
        this.model.key_text2 = item2[lang_code];
      let item3 = res.find(i => i.key_text === 'CONTACT_US');
        this.model.key_text3 = item3[lang_code]; 
      let item4 = res.find(i => i.key_text === 'KNOW_MORE');
        this.model.key_text4 = item4[lang_code]; 
      let item5 = res.find(i => i.key_text === 'SEND_MESSAGE');
        this.model.key_text5 = item5[lang_code];
      let item6 = res.find(i => i.key_text === 'ABOUT_US_MSG');
        this.model.key_text6 = item6[lang_code]; 
      let item7 = res.find(i => i.key_text === 'KNOW_LESS');
        this.model.key_text7 = item7[lang_code]; 
      let item8 = res.find(i => i.key_text === 'FULL_NAME');
        this.model.key_text8 = item8[lang_code];
        let item9 = res.find(i => i.key_text === 'EMAIL');
        this.model.key_text9 = item9[lang_code];
        let item10 = res.find(i => i.key_text === 'PHONE_NO');
        this.model.key_text10 = item10[lang_code];
        let item11 = res.find(i => i.key_text === 'MESSAGE');
        this.model.key_text11 = item11[lang_code]; 
        let item12 = res.find(i => i.key_text === 'SUBMIT');
        this.model.key_text12 = item12[lang_code];
        let item13 = res.find(i => i.key_text === 'THIS_FIELD_IS_REQUIRED');
        this.model.key_text13 = item13[lang_code];
        let item14 = res.find(i => i.key_text === 'ENTER_VALID_EMAIL_ADDRESS');
        this.model.key_text14 = item14[lang_code];
        let item15 = res.find(i => i.key_text === 'ENTER_VALID_PHONE_NUMBER');
        this.model.key_text15 = item15[lang_code];
        let item16 = res.find(i => i.key_text === 'CAPTCHA_REQUIRED');
        this.model.key_text16 = item16[lang_code]; 
        let item17 = res.find(i => i.key_text === 'CLOSE');
        this.model.key_text17 = item17[lang_code]; 
                
           		
        	
			
		//});
    this.fetch.getAboutUsPageCOntent(lang_code).subscribe(res => {
      this.model.aboutus = res.content.Aboutus;
      this.aboutUs = this.sanitizer.bypassSecurityTrustHtml(this.model.aboutus);
      this.model.Specialthanks = res.content.Specialthanks;
      this.groupedThanks = [];
      for (let i = 0; i < this.model.Specialthanks.length; i += 2) {
        this.groupedThanks.push(this.model.Specialthanks.slice(i, i + 2));
      }
      // this.model.Specialthanks.forEach((val,i)=>{
      //    if(i%2==0){
      //     this.icons.push({icon1 : val.icon, icon2 : ''});
      //    }
      //    else{
      //      this.icons[i-1]['icon2'] = val.icon;
      //    }
      // });
      
    });
  }
  captchaResolved(response: string): void {
    console.log('in');
    this.zone.run(() => {
        this.captchaPassed = true;
        this.captchaResponse = response;
    });

}
saveForm(){
  let re_email = /\S+@\S+\.\S+/;
  let re_mobile = /^[0-9]*$/;
   let full_name = $('#full_name').val();
   let email = $('#email').val();
   let mobile = $('#phone_no').val();
   let message = $('#message').val();
   this.model.search = true;
   if(!full_name){
    this.model.search = false;
      $('#full_name_msg').show();
      $('#email_msg').hide();
      $('#phone_no_msg').hide();
      $('#captcha_msg').hide();
      $('#correct_email_msg').hide();
      $('#correct_phone_msg').hide();
      $('#message_msg').hide();
   }else if(!email){
    this.model.search = false;
    $('#full_name_msg').hide();
    $('#email_msg').show();
    $('#correct_email_msg').hide();
    $('#phone_no_msg').hide();
    $('#captcha_msg').hide();
    $('#correct_phone_msg').hide();
    $('#message_msg').hide();
  }else if(re_email.test(email)==false){
    this.model.search = false;
    $('#full_name_msg').hide();
    $('#email_msg').hide();
    $('#correct_email_msg').show();
    $('#phone_no_msg').hide();
    $('#captcha_msg').hide();
    $('#correct_phone_msg').hide();
    $('#message_msg').hide();
  }else if(!mobile){
    this.model.search = false;
    $('#full_name_msg').hide();
    $('#email_msg').hide();
    $('#correct_email_msg').hide();
    $('#phone_no_msg').show();
    $('#correct_phone_msg').hide();
    $('#captcha_msg').hide();
    $('#message_msg').hide();
  }else if(!message){
    this.model.search = false;
    $('#full_name_msg').hide();
    $('#email_msg').hide();
    $('#correct_email_msg').hide();
    $('#phone_no_msg').hide();
    $('#correct_phone_msg').hide();
    $('#captcha_msg').hide();
    $('#message_msg').show();
    
  }
  else if(re_mobile.test(mobile)==false || mobile.length != 10){
    this.model.search = false;
    $('#full_name_msg').hide();
    $('#email_msg').hide();
    $('#correct_phone_msg').show();
    $('#phone_no_msg').hide();
    $('#captcha_msg').hide();
    $('#message_msg').hide();
  }else if(!this.captchaPassed){
    this.model.search = false;
    $('#full_name_msg').hide();
    $('#email_msg').hide();
    $('#correct_email_msg').hide();
    $('#correct_phone_msg').hide();
    $('#phone_no_msg').hide();
    $('#captcha_msg').show();
    $('#message_msg').hide();
  }else{
    $('#full_name_msg').hide();
    $('#email_msg').hide();
    $('#correct_email_msg').hide();
    $('#correct_phone_msg').hide();
    $('#phone_no_msg').hide();
    $('#captcha_msg').hide();
    $('#message_msg').hide();
    let data = JSON.stringify({'name' : full_name,'mobile': mobile, 'email' : email, 'message' : message});
    this.fetch.save_contact_us(data).subscribe((res)=>{
        //if(res.success){
          this.model.search = false;
          this.showAlert();
          $('#full_name').val('');
          $('#email').val('');
          $('#phone_no').val('');
          $('#message').val('');
       // }
    });
  }

}
async showAlert(){
  const alert = await this.alertController.create({
    cssClass: 'my-custom-class custom_alert_1',
    //header: 'Alert',
    message: this.model.key_text6,
    buttons: [
      {
        text: this.model.key_text17,
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          console.log('Confirm Cancel');
        }
      }
    ]
  });

  await alert.present();
}
  showMore(){
 
    if($('#expanded').prop('checked')){
      $('#know_more').text(this.model.key_text7);
    }
    else{
      $('#know_more').text(this.model.key_text4);
    }
  }
  resolved(captchaResponse: string) {
    console.log(`Resolved captcha with response: ${captchaResponse}`);
  }

  errored() {
    console.warn(`reCAPTCHA error encountered`);
  }

}
