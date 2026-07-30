import { Component, OnInit,Input  } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FetchService } from '../../fetch.service';
import { StorageService } from '../../storage.service';
import { 
  ModalController, 
  NavParams 
  } from '@ionic/angular';
  declare var $: any;
@Component({
  selector: 'app-donate-food-content',
  templateUrl: './donate-food-content.page.html',
  styleUrls: ['./donate-food-content.page.scss'],
})
export class DonateFoodContentPage implements OnInit {
  @Input() veg;
  @Input() nonveg;
  @Input() veg_food;
  @Input() nonveg_food;
  @Input() pickup_required;
  @Input() receiver_matched;
  @Input() matched_receiver_name;
model:any={};
  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
	private router: Router,
	private fetch: FetchService,
  private storage: StorageService,
  ) { }

  ngOnInit() { 
  $("#donate_food_spinner").show();
  $(".modal_content").css("opacity",0);
  var lang_code = JSON.parse(localStorage.getItem('lang'));
  this.model.user_id = JSON.parse(localStorage.getItem('user_registerd'));
  let data = JSON.stringify({'id': this.model.user_id});
	this.fetch.profile(data).subscribe(res => {
	  //	console.log(res);
    $("#donate_food_spinner").hide();
    $(".modal_content").css("opacity",1);
		this.model.username = res['username'];
		// this.model.dob = res['dob'];
		// this.model.food_type = res['type_of_food_you_prefer'];
		// $('#profile_food_'+res['type_of_food_you_prefer']).addClass('active');
	});
    //this.fetch.getKeyText(lang_code).subscribe(res => {
        let res = this.storage.getScope();
        let item1 = res.find(i => i.key_text === 'DEAR');
        this.model.key_text1 = item1[lang_code];
        let item2 = res.find(i => i.key_text === 'DONATION_MSG_1');
        this.model.key_text2 = item2[lang_code];
        let item3 = res.find(i => i.key_text === 'PEOPLE');
        this.model.key_text3 = item3[lang_code];
        let item4 = res.find(i => i.key_text === 'DONATE_MSG_2');
        this.model.key_text4 = item4[lang_code];
        let item5 = res.find(i => i.key_text === 'DONATE_MSG_3');
        this.model.key_text5 = item5[lang_code];
        let item6 = res.find(i => i.key_text === 'DONATE_MSG_4');
        this.model.key_text6 = item6[lang_code];
        let item7 = res.find(i => i.key_text === 'THANK_YOU_FOR_YOUR_KIND_GESTURE');
        this.model.key_text7 = item7[lang_code];
        let personKey = res.find(i => i.key_text === 'PERSON');
        this.model.person_label = personKey ? personKey[lang_code] : this.model.key_text3;

        let item8 = res.find(i => i.key_text === 'KINDLY_PACK');
        this.model.key_text8 = item8[lang_code];
        let item9 = res.find(i => i.key_text === 'VEG');
        this.model.key_text9 = item9[lang_code];
        let item10 = res.find(i => i.key_text === 'NON_VEG');
        this.model.key_text10 = item10[lang_code];
        let item11 = res.find(i => i.key_text === 'FOOD_FOR');
        this.model.key_text11 = item11[lang_code];
        let item12 = res.find(i => i.key_text === 'COMING_FOR_PICKUP');
        this.model.key_text12 = item12[lang_code];

        if (this.receiver_matched && this.pickup_required) {
          this.model.key_text5 = "Wait for a rider! We've booked a pickup. Please pack your food properly. Check Activity for status updates.";
        }
      
      // let item1 = res.find(i => i.key_text === 'THANK_YOU_FOR_YOUR_KIND_GESTURE');
      //   this.model.key_text1 = item1[lang_code]; 
      // let item2 = res.find(i => i.key_text === 'END_DONATION_MSG');
      //   this.model.key_text2= item2[lang_code]; 
      // let item3 = res.find(i => i.key_text === 'CHECK_DONATION');
      //   this.model.key_text3= item3[lang_code]; 
        
    //});
  }

  async closeModal() {
    const onClosedData: string = "Wrapped Up!";
    await this.modalController.dismiss(onClosedData);
	this.router.navigate(['/home']);
  }

   peopleLabel(count: number): string {
    return count === 1 ? this.model.person_label : this.model.key_text3;
  }

} 
