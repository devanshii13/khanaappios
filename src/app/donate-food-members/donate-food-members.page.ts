import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FetchService } from '../fetch.service';
import { StorageService } from '../storage.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ErrorMsgService } from '../error-msg.service';
import { Diagnostic } from "@ionic-native/diagnostic/ngx";

declare var $: any;

@Component({
	selector: 'app-donate-food-members',
	templateUrl: './donate-food-members.page.html',
	styleUrls: ['./donate-food-members.page.scss'],
})
export class DonateFoodMembersPage implements OnInit {
	model: any = {};
	notification: any = [];
	dataReturned: any;
	app_user: any;
	constructor(
		public errorMsg: ErrorMsgService,
		public modalController: ModalController,
		private router: Router,
		private fetch: FetchService,
		private storage: StorageService,
		public alertController: AlertController,
		private diagnostic: Diagnostic
	) { }

	ngOnInit() {
		this.model.search = false;
	}

	async presentAlert() {
		let confirm1 = await this.alertController.create({
			header: 'Location',
			message: "For a better experience, turn on device location, which uses Google\'s location service. ✓",
			backdropDismiss: false,
			buttons: [
				{
					text: 'cancel',
					role: 'Cancel',
					handler: () => {

					}
				},
				{
					text: 'Ok',
					handler: () => {
						this.diagnostic.switchToLocationSettings();
					}
				}
			]
		});
		await confirm1.present();
	}

	ionViewWillEnter() {
		// Location check disabled temporarily
		// this.diagnostic.isLocationEnabled().then(resp => {
		// 	if (!resp) {
		// 		this.presentAlert();
		// 	}
		// }).catch((error: any) => {
		// 	this.presentAlert();
		// });

		this.app_user = JSON.parse(localStorage.getItem('user_id'));
		this.model.is_volunteer = 0;
		if (localStorage.getItem('volunteer_approve') != null) {
			this.model.is_volunteer = localStorage.getItem('volunteer_approve');
		}
		this.model.alert_text = 'Please specify donation serving to proceed further';
		this.model.okay = 'okay';
		this.model.food_type = null;
		var lang_code = JSON.parse(localStorage.getItem('lang'));
		//this.fetch.getKeyText(lang_code).subscribe(res => {
		let res = this.storage.getScope();
		let item1 = res.find(i => i.key_text === 'SELECT_TYPE_OF_FOOD_AND_NO_OF_PEPOPLE');
		this.model.key_text1 = item1[lang_code];
		let item2 = res.find(i => i.key_text === 'VEG');
		this.model.key_text2 = item2[lang_code];
		let item3 = res.find(i => i.key_text === 'NON_VEG');
		this.model.key_text3 = item3[lang_code];
		let item4 = res.find(i => i.key_text === 'BOTH');
		this.model.key_text4 = item4[lang_code];
		let item5 = res.find(i => i.key_text === 'TOTAL_NO._OF_PACKETS');
		this.model.key_text5 = item5[lang_code];
		let item6 = res.find(i => i.key_text === 'EACH_PACKET_CONTAINS_FOOD_FOR_HOW_MANY_PEOPLE');
		this.model.key_text6 = item6[lang_code];
		let item7 = res.find(i => i.key_text === 'REVIEW_YOUR_DONATION_REQUEST');
		this.model.key_text7 = item7[lang_code];
		let item8 = res.find(i => i.key_text === 'HOME');
		this.model.key_text8 = item8[lang_code];
		let item9 = res.find(i => i.key_text === 'ACTIVITY');
		this.model.key_text9 = item9[lang_code];
		let item10 = res.find(i => i.key_text === 'VOLUNTEER');
		this.model.key_text10 = item10[lang_code];
		let item11 = res.find(i => i.key_text === 'PLEASE_FILL_SPECIFY_DETAILS');
		this.model.alert_text = item11[lang_code];
		let item12 = res.find(i => i.key_text === 'OKAY');
		this.model.okay = item12[lang_code];

		//});
	}
	food_type(val) {
		this.model.food_type = val;
		if (val == 1) {
			$('#d_food_' + val).addClass('active');
			$('#d_food_2').removeClass('active');
		} else if (val == 2) {
			$('#d_food_' + val).addClass('active');
			$('#d_food_1').removeClass('active');
		}
	}

	review() {
		this.model.search = true;
		var number2 = $('#number2').val();

		var non_veg = 0;

		if ($('#vegcheckbox').prop('checked') == false && $('#non-vegcheckbox').prop('checked') == false) {
			this.model.search = false;
			//$('#error').show();
			this.errorMsg.showModal(this.model.alert_text);
		} else {
			//$('#error').hide();
			//number = parseInt($('#number').val());
			if ($('#vegcheckbox').prop('checked') == true) {
				number2 = parseInt($('#number2').val());
				this.model.food_type = 1;
				this.model.isveg = true;
			}
			else {
				number2 = 0;
				this.model.isveg = false;
			}

			if ($('#non-vegcheckbox').prop('checked') == true) {
				non_veg = parseInt($('#non-veg').val());
				this.model.food_type = 2;
				this.model.isnonveg = true;
			}
			else {
				non_veg = 0;
				this.model.isnonveg = false;
			}


			//var id = parseInt(this.route.snapshot.params['id']);
			//var total_food = number*number2;
			var total_food = number2;
			let data = JSON.stringify({ 'app_user_id': this.app_user, 'food_type': this.model.food_type, 'is_veg': this.model.isveg, 'is_nonveg': this.model.isnonveg, 'no_of_packets': null, 'each_packet_contain_food_for': number2, 'total_veg_food': number2, 'total_nonveg_food': non_veg, 'third_party': true });

			this.fetch.donate_food_details_new(data).subscribe(res => {
				this.model.search = false;
				this.router.navigate(['/donate-food-pickup-drop', res.donate_food_id1, res.donate_food_id2]);
			});
		}
	}
	showCount(event: any) {

		if ($('#vegcheckbox').prop('checked') == true) {
			$('#veg').show();
		}
		else {
			$('#veg').hide();
		}

	}
	showCount2(event: any) {

		if ($('#non-vegcheckbox').prop('checked') == true) {
			$('#nonveg').show();
		}
		else {
			$('#nonveg').hide();
		}
	}


}
