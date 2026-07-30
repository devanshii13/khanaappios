import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { DonateFoodContentPage } from '../modal/donate-food-content/donate-food-content.page';
import { ErrorMsgModalPage } from '../modal/error-msg-modal/error-msg-modal.page';
import { CurrentLocationContentPage } from '../modal/current-location-content/current-location-content.page';
import { FetchService } from '../fetch.service';
import { StorageService } from '../storage.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation/ngx';
declare var google: any;
declare var $: any;

@Component({
	selector: 'app-donate-food-review',
	templateUrl: './donate-food-review.page.html',
	styleUrls: ['./donate-food-review.page.scss'],
})
export class DonateFoodReviewPage implements OnInit {
	@ViewChild('map') mapElement: ElementRef;
	@ViewChild('searchBox', { static: false }) searchElementRef: ElementRef;
	model: any = {};
	food_data: any = [];
	pending_data: any = [];
	veg_food: any = [];
	nonveg_food: any = [];
	dataReturned: any;
	notification: any = [];
	map: any;
	marker: any;

	constructor(
		public modalController: ModalController,
		private route: ActivatedRoute,
		private router: Router,
		private navCtrl: NavController,
		private fetch: FetchService,
		private storage: StorageService,
		public alertController: AlertController,
		private geolocation: Geolocation,
		private zone: NgZone,
	) { }

	ngOnInit() {
		this.model.search = false;
		this.model.map_loading = false;
		this.model.is_manual_selection = false;
	}

	ionViewWillEnter() {
		this.model.is_volunteer = 0;
		if (localStorage.getItem('volunteer_approve') != null) {
			this.model.is_volunteer = localStorage.getItem('volunteer_approve');
		}
		this.model.alert_text = 'Please fill all the details';
		this.model.okay = 'okay';
		var lang_code = JSON.parse(localStorage.getItem('lang'));
		///this.fetch.getKeyText(lang_code).subscribe(res => {
		let res = this.storage.getScope();
		let item1 = res.find(i => i.key_text === 'YOUR_PENDING_DONATIONS');
		this.model.key_text1 = item1[lang_code];
		let item2 = res.find(i => i.key_text === 'FOOD_FOR');
		this.model.key_text2 = item2[lang_code];
		let item3 = res.find(i => i.key_text === 'PERSONS');
		this.model.key_text3 = item3[lang_code];
		let item4 = res.find(i => i.key_text === 'YOUR_NEW_DONATION');
		this.model.key_text4 = item4[lang_code];
		let item5 = res.find(i => i.key_text === 'TOTAL_NO._OF_PACKETS');
		this.model.key_text5 = item5[lang_code];
		let item6 = res.find(i => i.key_text === 'EACH_PACKET_CONTAINS_FOOD_FOR');
		this.model.key_text6 = item6[lang_code];
		let item7 = res.find(i => i.key_text === 'TOTAL_FOOD_FOR');
		this.model.key_text7 = item7[lang_code];
		let item8 = res.find(i => i.key_text === 'HOME');
		this.model.key_text8 = item8[lang_code];
		let item9 = res.find(i => i.key_text === 'ACTIVITY');
		this.model.key_text9 = item9[lang_code];
		let item10 = res.find(i => i.key_text === 'VOLUNTEER');
		this.model.key_text10 = item10[lang_code];
		let item11 = res.find(i => i.key_text === 'TYPE_OF_FOOD');
		this.model.key_text11 = item11[lang_code];
		let item12 = res.find(i => i.key_text === 'PERSONS');
		this.model.key_text12 = item12[lang_code];
		let item13 = res.find(i => i.key_text === 'DONATE_FOOD');
		this.model.key_text13 = item13[lang_code];
		let item14 = res.find(i => i.key_text === 'PLEASE_FILL_ALL_THE_DETAILS');
		this.model.alert_text = item14[lang_code];
		let item15 = res.find(i => i.key_text === 'OKAY');
		this.model.okay = item15[lang_code];
		let item16 = res.find(i => i.key_text === 'CONFIRM_DONATE_REQUEST');
		this.model.key_text16 = item16[lang_code];
		let itemExact = res.find(i => i.key_text === 'KEEP_PIN_EXACT_LOCATION');
		this.model.exact_location_alert_text = itemExact[lang_code];

		//});
		var id = parseInt(this.route.snapshot.params['id']);
		var id2 = parseInt(this.route.snapshot.params['id2']);
		this.model.veg = id;
		this.model.nonveg = id2;
		var user_id = JSON.parse(localStorage.getItem('user_registerd'));
		this.fetch.pending_donation(user_id).subscribe(res => {
			this.pending_data = res['data'];
		});
		if (id != 0) {
			this.fetch.reviewFood(id).subscribe(res => {
				this.veg_food = res['data'];
			});
		}
		if (id2 != 0) {
			this.fetch.reviewFood(id2).subscribe(res => {
				this.nonveg_food = res['data'];
			});
		}

		// Enable toggle by default for testing
		this.model.pickup_time_serviceable = true;
		this.model.toggle_enabled = true;
		this.model.pickup_required = true;
	}

	packets() {
		this.food_data.total_no_of_packet = $("#number3").val();
		this.food_data.total_food_for = this.food_data.each_packet_contain_food_for * this.food_data.total_no_of_packet;

	}
	food_for() {
		this.food_data.each_packet_contain_food_for = $("#number4").val();
		//this.food_data.total_food_for = this.food_data.each_packet_contain_food_for * this.food_data.total_no_of_packet;  
		this.food_data.total_food_for = this.food_data.each_packet_contain_food_for;

	}
	async openModalDonateFood() {
		const modal = await this.modalController.create({
			component: DonateFoodContentPage,
			cssClass: 'custom_donate_food_modal',
			componentProps: {
				"paramID": 123,
				"paramTitle": "Test Title",
				"veg": this.model.veg,
				"nonveg": this.model.nonveg,
				"veg_food": this.veg_food,
				"nonveg_food": this.nonveg_food,
				"pickup_required": this.model.pickup_required,
				"receiver_matched": !!this.model.receiver_matched,
				"matched_receiver_name": this.model.matched_receiver_name || ''
			}
		});

		modal.onDidDismiss().then((dataReturned) => {
			localStorage.removeItem('donate_address_type');
			localStorage.removeItem('set_confirm_location_route');
			localStorage.removeItem('donor_location');
			this.router.navigate(['/home']);

			if (dataReturned !== null) {
				this.dataReturned = dataReturned.data;
				//alert('Modal Sent Data :'+ dataReturned);

			}
		});

		return await modal.present();
	}
	async presentLocationConfirm() {
		const modal = await this.modalController.create({
			component: ErrorMsgModalPage,
			cssClass: 'error_modal_css',
			backdropDismiss: false,
			componentProps: {
				"msg": this.model.exact_location_alert_text,
			}
		});

		modal.onDidDismiss().then((dataReturned) => {
			this.openModalCurrentLocation();
		});

		return await modal.present();
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
			this.model.search = false;
			if (dataReturned !== null && dataReturned.data) {
				let location_data = JSON.parse(dataReturned.data);
				this.model.lat = location_data.latitude;
				this.model.lon = location_data.longitude;
				this.model.pincode = location_data.postalCode;
				this.model.location_selected = true;
				this.model.donor_location_data = dataReturned.data;
				localStorage.setItem('donor_location', dataReturned.data);
				if (this.model.pincode) {
					this.checkAvailability(this.model.pincode);
				}
			}
		});

		return await modal.present();
	}

	donate_food() {
		if (!this.model.location_selected) {
			this.presentLocationConfirm();
		} else if (this.model.location_selected) {
			if (this.model.pincode && this.model.toggle_enabled) {
				this.model.search = true;
				let user_id = JSON.parse(localStorage.getItem('user_id'));
				let donate_address = localStorage.getItem('donor_location');

				var formData: any = new FormData();
				formData.append("id", this.model.veg);
				formData.append("id2", this.model.nonveg);
				formData.append("donate_address", donate_address);
				formData.append("pickup_required", this.model.pickup_required ? 1 : 0);
				formData.append("third_party", this.model.pickup_required ? 1 : 0);

				this.fetch.donate_food_location_new(formData).subscribe(res => {
					this.model.search = false;
					if (this.model.pickup_required) {
						this.matchThirdPartyWaitingReceivers(res);
					} else {
						this.openModalDonateFood();
					}
				}, error => {
					this.model.search = false;
				});
			} else {
				this.alertController.create({
					message: this.model.availability_msg || "Please select a valid location.",
					buttons: ['OK']
				}).then(alert => alert.present());
			}
		}
	}

	confirmLocation() {
		if (this.model.pincode) {
			this.model.map_loading = false;
			this.model.is_manual_selection = false;
			this.model.show_map = false;
			this.model.location_selected = true;
		} else {
			this.alertController.create({
				message: "Please select a location on the map.",
				buttons: ['OK']
			}).then(alert => alert.present());
		}
	}

	initMap() {
		this.model.pincode = null; // Reset pincode state
		this.model.availability_checking = true;

		// Use cached coordinates if available
		let cachedLat = 23.1765; // Default Ujjain
		let cachedLon = 75.7885;

		this.model.lat = cachedLat;
		this.model.lon = cachedLon;

		let latLng = new google.maps.LatLng(this.model.lat, this.model.lon);
		let mapOptions = {
			center: latLng,
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			disableDefaultUI: true
		};

		// Initialize Map OBJECT INSTANTLY
		this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
		this.addMarker();
		this.initAutocomplete();
		// Start fetching high-accuracy location in parallel
		let options: GeolocationOptions = {
			enableHighAccuracy: true,
			timeout: 10000,
			maximumAge: 5000
		};

		this.geolocation.getCurrentPosition(options).then((resp) => {
			this.zone.run(() => {
				this.model.lat = resp.coords.latitude;
				this.model.lon = resp.coords.longitude;
				let newLatLng = new google.maps.LatLng(this.model.lat, this.model.lon);
				this.map.setCenter(newLatLng);
				this.marker.setPosition(newLatLng);
				this.showAddress(this.model.lat, this.model.lon);
			});
		}).catch((error) => {
			console.log('Error getting location', error);
			this.model.availability_checking = false;
			this.showAddress(this.model.lat, this.model.lon);
		});

		// Add click listener to map
		google.maps.event.addListener(this.map, 'click', (event) => {
			this.zone.run(() => {
				this.model.map_loading = true; // Set loader immediately
				this.marker.setPosition(event.latLng);
				this.model.lat = event.latLng.lat();
				this.model.lon = event.latLng.lng();
				this.model.is_manual_selection = true;
				this.showAddress(this.model.lat, this.model.lon);
			});
		});
	}

	addMarker() {
		this.marker = new google.maps.Marker({
			map: this.map,
			animation: google.maps.Animation.DROP,
			position: this.map.getCenter(),
			draggable: true
		});

		google.maps.event.addListener(this.marker, 'dragend', () => {
			this.zone.run(() => {
				this.model.map_loading = true; // Set loader immediately
				this.model.lat = this.marker.position.lat();
				this.model.lon = this.marker.position.lng();
				this.model.is_manual_selection = true;
				this.showAddress(this.model.lat, this.model.lon);
			});
		});
	}

	initAutocomplete() {

    let autocomplete = new google.maps.places.Autocomplete(
      this.searchElementRef.nativeElement,
      {
        componentRestrictions: { country: 'in' }
      }
    );

    autocomplete.addListener('place_changed', () => {
      this.zone.run(() => {

        let place = autocomplete.getPlace();

        if (!place.geometry) return;

        this.model.map_loading = true;

        this.model.lat = place.geometry.location.lat();
        this.model.lon = place.geometry.location.lng();

        let newLatLng = new google.maps.LatLng(this.model.lat, this.model.lon);

        this.map.setCenter(newLatLng);
        this.map.setZoom(15);
        this.marker.setPosition(newLatLng);

        this.model.is_manual_selection = true;

        this.showAddress(this.model.lat, this.model.lon);
      });
    });
  }

	showAddress(lat, lon) {
		this.model.toggle_enabled = false;
		if (this.model.is_manual_selection) {
			this.model.map_loading = true;
		}
		this.model.availability_checking = true;
		this.model.availability_msg = "";

		let latLng = new google.maps.LatLng(lat, lon);
		let geocoder = new google.maps.Geocoder();
		geocoder.geocode({ 'latLng': latLng }, (results, status) => {
			if (status === 'OK' && results[0]) {
				this.model.colony_name = results[0].formatted_address;
				let self = this;
				results[0].address_components.forEach(function (val) {
					if (val.types.indexOf("locality") > -1) self.model.city = val.long_name;
					if (val.types.indexOf("administrative_area_level_1") > -1) self.model.state = val.long_name;
					if (val.types.indexOf("country") > -1) self.model.country = val.long_name;
					if (val.types.indexOf("postal_code") > -1) self.model.pincode = val.long_name;
				});

				this.model.donor_location_data = JSON.stringify({
					'app_user_id': JSON.parse(localStorage.getItem('user_id')),
					'house_no': null, 'landmark': null, 'adress_type': 'Other',
					'latitude': this.model.lat, 'longitude': this.model.lon,
					'colony_name': this.model.colony_name, 'city': this.model.city,
					'state': this.model.state, 'country': this.model.country,
					'postalCode': this.model.pincode
				});
				localStorage.setItem('donor_location', this.model.donor_location_data);

				if (this.model.pincode) {
					this.checkAvailability(this.model.pincode);
				} else {
					this.model.map_loading = false;
					this.model.availability_checking = false;
					this.model.availability_msg = "Pincode not found. Please move the marker to a street.";
				}
			} else {
				this.model.map_loading = false;
				this.model.availability_checking = false;
				this.model.availability_msg = "Location error: " + status;
			}
		});
	}

	checkAvailability(pincode) {
		this.model.availability_checking = true;
		let user_id = JSON.parse(localStorage.getItem('user_id'));
		let now = new Date();
		let h = now.getHours();
		let m = now.getMinutes();
		let currentTime = (h < 10 ? '0' + h : h) + ":" + (m < 10 ? '0' + m : m);

		let data = {
			"pincode": pincode,
			"userID": user_id,
			"type": 2, // Donor
			"current_time": currentTime
		};

		this.fetch.check_availability(data).subscribe(res => {
			this.model.availability_checking = false;
			this.model.map_loading = false;

			if (res && (res.success == true || res.status == true || res.success == 1 || res.status == 'success')) {
				this.model.toggle_enabled = true;
				this.model.availability_msg = "";
				this.model.slots = res.slots;
				this.model.coverage_range = res.coverage_range;
				if (res.coverage_range != null && res.coverage_range !== '') {
					localStorage.setItem('coverage_range_km', String(res.coverage_range));
				}
			} else {
				this.model.toggle_enabled = false;
				this.model.availability_msg = (res && res.message)
					? res.message
					: "Pickup not available / Service not available for this pincode.";
				this.model.slots = res?.slots || [];
				this.model.coverage_range = res?.coverage_range || null;
			}
		}, error => {
			this.model.availability_checking = false;
			this.model.map_loading = false;
			this.model.toggle_enabled = false;
			this.model.availability_msg = "Pickup not available / Service not available for this pincode.";
		});
	}


	formatSlots(slots: any[]): string {
	if (!slots || slots.length === 0) return '';

	return slots.map(slot => {
		const start = this.convertToAMPM(slot.start_time);
		const end   = this.convertToAMPM(slot.end_time);
		return `${start} - ${end}`;
	}).join(', ');
	}

	convertToAMPM(time: string): string {
	let [hours, minutes] = time.split(':');
	let h = parseInt(hours, 10);
	let ampm = h >= 12 ? 'PM' : 'AM';
	h = h % 12 || 12;
	return `${h}:${minutes} ${ampm}`;
	}

	matchThirdPartyWaitingReceivers(donateRes: any) {
		const matchedReceiver = this.extractMatchedReceiver(donateRes);
		if (matchedReceiver) {
			this.model.receiver_matched = true;
			this.model.matched_receiver_name = matchedReceiver.username
				|| matchedReceiver.receiver_name
				|| matchedReceiver.food_receiver_name
				|| '';
			this.createBorzoForMatch(matchedReceiver, donateRes);
			this.openModalDonateFood();
			return;
		}

		// One-time check if backend already auto-matched a waiting receiver.
		const userId = JSON.parse(localStorage.getItem('user_registerd'));
		const candidateFoodIds = [
			donateRes?.donate_food_id,
			donateRes?.data?.id,
			donateRes?.data?.donate_food_id,
			this.model.veg,
			this.model.nonveg
		].filter((id) => id != null && id !== '' && Number(id) !== 0);

		this.fetch.my_alloted_donation(userId).subscribe(allotedRes => {
			const allotment = this.findMatchingAllotment(allotedRes?.data || [], candidateFoodIds);
			if (allotment) {
				this.model.receiver_matched = true;
				this.model.matched_receiver_name = allotment.receiver_name
					|| allotment.food_receiver_name
					|| allotment.username
					|| '';
				this.createBorzoFromAllotment(allotment);
			} else {
				this.model.receiver_matched = false;
				this.model.matched_receiver_name = '';
			}
			this.openModalDonateFood();
		}, () => {
			this.model.receiver_matched = false;
			this.model.matched_receiver_name = '';
			this.openModalDonateFood();
		});
	}

	extractMatchedReceiver(donateRes: any) {
		if (!donateRes) {
			return null;
		}
		return donateRes.receiver_data
			|| donateRes.matched_receiver
			|| donateRes.data?.receiver
			|| donateRes.data?.receiver_data
			|| null;
	}

	findMatchingAllotment(allotments: any[], donateFoodIds?: number | number[]) {
		if (!allotments?.length || donateFoodIds == null) {
			return null;
		}
		const ids = (Array.isArray(donateFoodIds) ? donateFoodIds : [donateFoodIds])
			.map((id) => String(id));
		return allotments.find(item => {
			const foodId = item.donate_food_id || item.id || item.food_id;
			return foodId != null && ids.includes(String(foodId));
		}) || null;
	}

	createBorzoFromAllotment(allotment: any) {
		const donorLocation = JSON.parse(localStorage.getItem('donor_location') || '{}');
		const receiverId = allotment.receiver_id || allotment.get_food_user_id || allotment.app_user_id;

		const buildMatch = (receiverData: any) => {
			const receiver = {
				app_user_id: receiverId,
				colony_name: receiverData.colony_name || allotment.receiver_colony_name,
				city: receiverData.city || allotment.receiver_city || allotment.city,
				state: receiverData.state || allotment.receiver_state || allotment.state,
				postalCode: receiverData.postalCode || receiverData.postal_code || allotment.receiver_postal_code || allotment.postal_code,
				latitude: receiverData.latitude || allotment.receiver_latitude || allotment.latitude,
				longitude: receiverData.longitude || allotment.receiver_longitude || allotment.longitude,
				no_of_person: allotment.no_of_person,
				food_type: allotment.food_type
			};
			const donateFoodId = allotment.donate_food_id || allotment.id || this.model.veg || this.model.nonveg;
			this.createBorzoForMatch({ ...allotment, ...receiver, donor_details: donorLocation }, { donate_food_id: donateFoodId });
		};

		if (receiverId && (!allotment.latitude && !allotment.receiver_latitude)) {
			this.fetch.receiver_details(receiverId).subscribe(res => {
				buildMatch(res?.data || {});
			}, () => buildMatch({}));
		} else {
			buildMatch(allotment);
		}
	}

	createBorzoForMatch(matchData: any, donateRes: any) {
		const donorLocation = JSON.parse(localStorage.getItem('donor_location') || '{}');
		const donorDetails = matchData.donor_details || matchData.donar_details || donorLocation;
		const donateFoodId = donateRes?.donate_food_id
			|| donateRes?.data?.id
			|| matchData.donate_food_id
			|| matchData.donor_details?.id
			|| matchData.food_id
			|| this.model.veg
			|| this.model.nonveg;
		const donorId = matchData.donor_details?.app_user_id
			|| donorDetails.app_user_id
			|| JSON.parse(localStorage.getItem('user_id'));
		const receiverId = matchData.app_user_id || matchData.receiver_id;
		const noOfPerson = matchData.no_of_person || localStorage.getItem('number_of_person') || 1;
		const foodType = matchData.food_type || matchData.donor_details?.food_type || this.veg_food?.food_type || this.nonveg_food?.food_type;

		if (!donorId || !receiverId) {
			console.error('[Borzo] Missing donor or receiver id for auto-match');
			return;
		}

		this.fetch.profile(JSON.stringify({ id: donorId })).subscribe(donorProfile => {
			this.fetch.profile(JSON.stringify({ id: receiverId })).subscribe(receiverProfile => {
				let donorPhone = this.formatPhone(donorProfile['mobile_no']);
				let receiverPhone = this.formatPhone(receiverProfile['mobile_no']);

				if (!donorPhone || !receiverPhone) {
					console.error('[Borzo] Missing phone numbers for auto-match', { donorPhone, receiverPhone });
					return;
				}

				const dropLat = matchData.latitude || matchData.receiver_latitude;
				const dropLng = matchData.longitude || matchData.receiver_longitude;
				const dropAddress = matchData.colony_name || matchData.receiver_colony_name;

				if (!dropLat || !dropLng || !dropAddress) {
					console.error('[Borzo] Missing receiver drop location for auto-match', matchData);
					return;
				}

				const itemName = (foodType == 1 || foodType == 3) ? 'Veg Food' : 'Non-Veg Food';
				const borzoOrderData = {
					donate_food_id: donateFoodId,
					donor_id: donorId,
					pickup_address: donorDetails.colony_name || '',
					pickup_name: donorProfile['username'] || donorDetails.username || 'Donor',
					pickup_phone: donorPhone,
					drop_address: dropAddress,
					drop_name: receiverProfile['username'] || matchData.username || 'Receiver',
					drop_phone: receiverPhone,
					pickup_city: donorDetails.city || '',
					pickup_state: donorDetails.state || '',
					pickup_pincode: donorDetails.postalCode || donorDetails.postal_code || '',
					pickup_lat: donorDetails.latitude || this.model.lat,
					pickup_lng: donorDetails.longitude || this.model.lon,
					delivery_city: matchData.city || matchData.receiver_city || '',
					delivery_state: matchData.state || matchData.receiver_state || '',
					delivery_pincode: matchData.postalCode || matchData.postal_code || matchData.receiver_postal_code || '',
					delivery_lat: dropLat,
					delivery_lng: dropLng,
					item_name: itemName,
					units: noOfPerson
				};

				this.fetch.createBorzoOrder(borzoOrderData).subscribe(orderRes => {
					if (orderRes && orderRes.response && orderRes.response.is_successful) {
						const order = orderRes.response.order;
						localStorage.setItem('borzo_order_id', order.order_id);
						if (order.points && order.points[1] && order.points[1].tracking_url) {
							localStorage.setItem('borzo_tracking_url', order.points[1].tracking_url);
						}

						const notifyData = JSON.stringify({
							'food_id': donateFoodId,
							'logged_in_user': donorProfile['username'] || 'Donor',
							'no_of_person': noOfPerson,
							'app_user_id': donorId,
							'food_type': foodType,
							'notification_type': 1,
							'to': donorId,
							'from': receiverId,
							'message': "Wait for a rider! We've booked a pickup. Please pack your food properly. Check Activity for pickup updates."
						});
						this.fetch.collect_food_noti_to_donor(notifyData).subscribe();
					} else {
						console.error('[Borzo] create-order failed:', orderRes);
					}
				}, err => {
					console.error('[Borzo] create-order error:', err);
				});
			});
		});
	}

	formatPhone(phone: string): string {
		if (!phone) {
			return '';
		}
		let cleaned = phone.replace(/\D/g, '');
		if (cleaned.length === 10) {
			cleaned = '91' + cleaned;
		}
		return cleaned.length >= 11 ? cleaned : '';
	}

	
}
