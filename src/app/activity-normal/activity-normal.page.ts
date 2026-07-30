import { Component, OnInit } from '@angular/core';
import { FetchService } from '../fetch.service';
import { StorageService } from '../storage.service';
import { CancelAllotedfoodPage } from '../modal/cancel-allotedfood/cancel-allotedfood.page';
import * as HighCharts from 'highcharts';
import { ModalController, AlertController, Platform } from '@ionic/angular';
import { BrowserTab } from '@ionic-native/browser-tab/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { environment } from '../../environments/environment';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Router } from '@angular/router';
declare var $: any;

@Component({
	selector: 'app-activity-normal',
	templateUrl: './activity-normal.page.html',
	styleUrls: ['./activity-normal.page.scss'],
	providers: [CallNumber],
})
export class ActivityNormalPage implements OnInit {
	model: any = {};
	options: GeolocationOptions;
	donation_graph_data: any = [];
	blessing_this_week: any = [];
	pending_data: any = [];
	alloted_food: any = [];
	request_food: any = [];
	alloted_request_food: any = [];
	foodweeklydata: any;
	graphstate = 'week';
	tabValue = 'donor';
	private pickupStatusRefreshTimer: any;
	/** Tracks last known Borzo phase per donate_food_id to avoid alert spam. */
	private pickupLifecycleNotified: { [foodId: string]: string } = {};
	/** Avoid double auto-cancel for the same food while requests are in flight. */
	private autoCancelInFlight: { [foodId: string]: boolean } = {};

	reasons: any = [];
	dataReturned: any;
	constructor(
		private geolocation: Geolocation,
		private fetch: FetchService,
		private storage: StorageService,
		public modalController: ModalController,
		public alertController: AlertController,
		public browserTab: BrowserTab,
		private socialSharing: SocialSharing,
		private platform: Platform,
		private callNumber: CallNumber,
		private router: Router
	) { }
	slideOpts = {
		zoom: false,
		autoplay: true
	};
	ngOnInit() {
		$('#add_location_spinner').show();
		this.model.receivertab = 0;
		this.model.donartab = 1;
		this.model.is_volunteer = 0;
		if (localStorage.getItem('volunteer_approve') != null) {
			this.model.is_volunteer = localStorage.getItem('volunteer_approve');
		}
		this.model.mode = 'WALKING';
		if (localStorage.getItem('isReceiverTab') != null) {
			if (localStorage.getItem('isReceiverTab') == '1') {
				this.model.receivertab = 1;
				this.model.donartab = 0;
			}
			else if (localStorage.getItem('isReceiverTab') == '0') {
				this.model.receivertab = 0;
				this.model.donartab = 1;
			}
		}
		var lang_code = JSON.parse(localStorage.getItem('lang'));
		//$('.receivertab').hide();
		$('#u_month_blessing_div').css('display', 'none');
		$('#u_week_blessing_div').css('display', 'block');
		setTimeout(function () {
			$('#activity_normal_spinner').css('display', 'none');
			$('#activity_normal_content').css('display', 'block');
		}, 100);
		this.model.user_id = JSON.parse(localStorage.getItem('user_registerd'));
		this.fetch.get_user_city(this.model.user_id).subscribe(res => {
			if (res['success'] == true) {
				this.fetch.get_top_donors(res.data['city']).subscribe(res2 => {
					this.model.top_donors = res2.data;
				});
			}

		});

		let user = JSON.stringify({ 'id': this.model.user_id });
		this.fetch.profile(user).subscribe(res => {
			this.model.login_username = res['username'];
		});

		this.fetch.pending_donation(this.model.user_id).subscribe(res => {
			this.pending_data = res['data'];

		});
		this.fetch.my_alloted_donation(this.model.user_id).subscribe(res => {
			this.alloted_food = res['data'] || [];
			this.alloted_food.forEach((val) => this.setAllotmentTiming(val));
			this.enrichAllotmentsWithBorzo(this.alloted_food);
			$('#add_location_spinner').hide();
		});

		this.getFeedback();

	}
	format = function date2str(x, y) {
		var z = {
			M: x.getMonth() + 1,
			d: x.getDate(),
			h: x.getHours(),
			m: x.getMinutes(),
			s: x.getSeconds()
		};
		y = y.replace(/(M+|d+|h+|m+|s+)/g, function (v) {
			return ((v.length > 1 ? "0" : "") + z[v.slice(-1)]).slice(-2)
		});

		return y.replace(/(y+)/g, function (v) {
			return x.getFullYear().toString().slice(-v.length)
		});
	}
	ionViewWillEnter() {
		this.options = {
			enableHighAccuracy: false,
		};

		// Prefer previously selected receiver location over live GPS.
		try {
			const stored = localStorage.getItem('receiver_location');
			if (stored) {
				const location = JSON.parse(stored);
				if (location.latitude != null && location.longitude != null) {
					this.model.recLat = location.latitude;
					this.model.recLng = location.longitude;
				}
			}
		} catch (e) { }

		this.geolocation.getCurrentPosition(this.options).then((resp) => {
			if (this.model.recLat == null || this.model.recLng == null) {
				this.model.recLat = resp.coords.latitude;
				this.model.recLng = resp.coords.longitude;
			}
		});

		var lang_code = JSON.parse(localStorage.getItem('lang'));
		let res = this.storage.getScope();
		//	this.fetch.getKeyText(lang_code).subscribe(res => {
		let item1 = res.find(i => i.key_text === 'WEEKLY');
		this.model.key_text1 = item1[lang_code];
		let item2 = res.find(i => i.key_text === 'MONTHLY');
		this.model.key_text2 = item2[lang_code];
		let item3 = res.find(i => i.key_text === 'BLESSINGS_THIS_WEEK');
		this.model.key_text3 = item3[lang_code];
		let item4 = res.find(i => i.key_text === 'BLESSINGS_THIS_MONTH');
		this.model.key_text4 = item4[lang_code];
		let item5 = res.find(i => i.key_text === 'HOME');
		this.model.key_text5 = item5[lang_code];
		let item6 = res.find(i => i.key_text === 'ACTIVITY');
		this.model.key_text6 = item6[lang_code];
		let item7 = res.find(i => i.key_text === 'VOLUNTEER');
		this.model.key_text7 = item7[lang_code];
		let item8 = res.find(i => i.key_text === 'TOTAL_BLESSINGS');
		this.model.key_text8 = item8[lang_code];
		let item9 = res.find(i => i.key_text === 'TOP_DONORS_FROM_YOUR_CITY');
		this.model.key_text9 = item9[lang_code];
		let item10 = res.find(i => i.key_text === 'DONATIONS');
		this.model.key_text10 = item10[lang_code];
		let item11 = res.find(i => i.key_text === 'YOUR_PENDING_DONATIONS');
		this.model.key_text11 = item11[lang_code];
		let item12 = res.find(i => i.key_text === 'FOOD_FOR');
		this.model.key_text12 = item12[lang_code];
		let item13 = res.find(i => i.key_text === 'PERSONS');
		this.model.key_text13 = item13[lang_code];
		let item14 = res.find(i => i.key_text === 'AVERAGE_RATING');
		this.model.key_text14 = item14[lang_code];
		let item15 = res.find(i => i.key_text === 'SAYS');
		this.model.key_text15 = item15[lang_code];
		let item16 = res.find(i => i.key_text === 'ALLOTED_DONATION');
		this.model.key_text16 = item16[lang_code];
		let item17 = res.find(i => i.key_text === 'YOUR_PENDING_REQUEST');
		this.model.key_text17 = item17[lang_code];
		let item18 = res.find(i => i.key_text === 'YOUR_ALLOTED_REQUEST');
		this.model.key_text18 = item18[lang_code];
		let item19 = res.find(i => i.key_text === 'AS_A_RECEIVER');
		this.model.key_text19 = item19[lang_code];
		let item20 = res.find(i => i.key_text === 'AS_A_DONAR');
		this.model.key_text20 = item20[lang_code];
		let item21 = res.find(i => i.key_text === 'CANCEL_DONATION_MSG');
		this.model.key_text21 = item21[lang_code];
		let item22 = res.find(i => i.key_text === 'OKAY');
		this.model.key_text22 = item22[lang_code];
		let item23 = res.find(i => i.key_text === 'CANCEL');
		this.model.key_text23 = item23[lang_code];
		let item24 = res.find(i => i.key_text === 'ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_REQUEST');
		this.model.key_text24 = item24[lang_code];
		let item25 = res.find(i => i.key_text === 'CANCEL_ALLOTED_DONATION_MSG');
		this.model.key_text25 = item25[lang_code];
		let item26 = res.find(i => i.key_text === 'FOOD_QUALITY');
		this.model.key_text26 = item26[lang_code];
		let item27 = res.find(i => i.key_text === 'PACKAGING');
		this.model.key_text27 = item27[lang_code];
		let item28 = res.find(i => i.key_text === 'BEHAVIOUR');
		this.model.key_text28 = item28[lang_code];
		let item29 = res.find(i => i.key_text === 'EXCELLENT');
		this.model.key_text29 = item29[lang_code];
		let item30 = res.find(i => i.key_text === 'GOOD');
		this.model.key_text30 = item30[lang_code];
		let item31 = res.find(i => i.key_text === 'BAD');
		this.model.key_text31 = item31[lang_code];
		let item32 = res.find(i => i.key_text === 'WEEKLY_FEEDBACK');
		this.model.key_text32 = item32[lang_code];
		let item33 = res.find(i => i.key_text === 'VERY_BAD');
		this.model.key_text33 = item33[lang_code];
		let item34 = res.find(i => i.key_text === 'MONTHLY_FEEDBACK');
		this.model.key_text34 = item34[lang_code];
		let item35 = res.find(i => i.key_text === 'AVERAGE');
		this.model.key_text35 = item35[lang_code];
		let item36 = res.find(i => i.key_text === 'MON');
		this.model.key_text36 = item36[lang_code];
		let item37 = res.find(i => i.key_text === 'TUE');
		this.model.key_text37 = item37[lang_code];
		let item38 = res.find(i => i.key_text === 'WED');
		this.model.key_text38 = item38[lang_code];
		let item39 = res.find(i => i.key_text === 'THU');
		this.model.key_text39 = item39[lang_code];
		let item40 = res.find(i => i.key_text === 'FRI');
		this.model.key_text40 = item40[lang_code];
		let item41 = res.find(i => i.key_text === 'SAT');
		this.model.key_text41 = item41[lang_code];
		let item42 = res.find(i => i.key_text === 'SUN');
		this.model.key_text42 = item42[lang_code];
		let item43 = res.find(i => i.key_text === 'WEEK');
		this.model.key_text43 = item43[lang_code];
		//});

		this.weekly_donation_graph();
		this.weekly_pieChart();

		if (this.model.receivertab == 1) {
			this.reloadReceiverAllotedFood(false);
		} else if (this.model.donartab == 1) {
			this.reloadDonorAllotedFood(false);
		}
	}

	ionViewWillLeave() {
		this.clearPickupStatusRefresh();
	}

	handleTab(id) {
		if (id == 1) {
			console.log("Receiver Active");
			this.tabValue = 'Receiver';
			this.getFeedback();
			$('#add_location_spinner').show();

			this.model.receivertab = 1;
			this.model.donartab = 0;
			$('.rec').addClass('btn1 active');
			$('.rec').css('border', '1px solid #419B95');
			$('.donar').removeClass('btn1 active');
			$('.donar').css('border', 'none');
			this.fetch.my_food_request(this.model.user_id).subscribe(res => {
				this.request_food = res['data'];
			});

			this.fetch.my_alloted_request(this.model.user_id).subscribe(res => {
				this.alloted_request_food = res['data'] || [];
				this.enrichAllotmentsWithBorzo(this.alloted_request_food);
				$('#add_location_spinner').hide();
			});
		}
		else {
			console.log("Donor Active");
			this.getFeedback();
			this.model.receivertab = 0;
			this.model.donartab = 1;
			$('.rec').removeClass('btn1 active');
			$('.rec').css('border', 'none');
			$('.donar').css('border', '1px solid #419B95');
			$('.donar').addClass('btn1 active');
			$('#add_location_spinner').show();
			this.reloadDonorAllotedFood();
		}
	}

	getAllotmentPartyKey(item: any): string {
		const donorId = item.donor_id || item.donar_id || '';
		const receiverId = item.receiver_id || item.get_food_user_id || item.app_user_id || '';
		return `${donorId}|${receiverId}`;
	}

	/** Veg + non-veg dual donations share one courier trip (sequential ids from donate_food_details_new). */
	areRelatedAllotments(a: any, b: any): boolean {
		if (!a || !b || a === b) {
			return false;
		}
		if (String(a.donate_food_id) === String(b.donate_food_id)) {
			return false;
		}

		const sameParty = this.getAllotmentPartyKey(a) === this.getAllotmentPartyKey(b);
		const typesDiffer = a.food_type && b.food_type && String(a.food_type) !== String(b.food_type);
		const idA = Number(a.donate_food_id);
		const idB = Number(b.donate_food_id);
		const sequential = Number.isFinite(idA) && Number.isFinite(idB) && Math.abs(idA - idB) === 1;

		if (sameParty && (typesDiffer || sequential)) {
			return true;
		}
		// Fallback when party fields differ between list APIs but dual donation ids are adjacent.
		return sequential && !!typesDiffer;
	}

	/**
	 * Veg + non-veg donations create two donate_food_ids but share one pickup.
	 * Enrich existing Borzo orders first, then keep a single Cancel/Track entry per related group.
	 */
	enrichAllotmentsWithBorzo(list: any[]) {
		if (!list?.length) {
			return;
		}

		const lookups = list.map((val) => new Promise<void>((resolve) => {
			if (this.isPickupCancelledLocally(val.donate_food_id)) {
				val.pickup_required = false;
				resolve();
				return;
			}

			this.fetch.getBorzoOrderDetails(val.donate_food_id).subscribe(resBorzo => {
				this.applyBorzoDetailsToAllotment(val, resBorzo);
				resolve();
			}, () => {
				val.isBorzo = false;
				resolve();
			});
		}));

		Promise.all(lookups).then(() => {
			this.reconcileRelatedPickupOrders(list);
			this.schedulePickupStatusRefresh();
		});
	}

	/** Poll Borzo while pickup is still active so Donor/Donee stay in sync (incl. external cancellation). */
	schedulePickupStatusRefresh() {
		const waiting = [...(this.alloted_food || []), ...(this.alloted_request_food || [])]
			.some((item) => this.isActivePickup(item));

		if (!waiting) {
			this.clearPickupStatusRefresh();
			return;
		}

		if (this.pickupStatusRefreshTimer) {
			return;
		}

		this.pickupStatusRefreshTimer = setInterval(() => {
			const donorWaiting = (this.alloted_food || []).some((item) => this.isActivePickup(item));
			const receiverWaiting = (this.alloted_request_food || []).some((item) => this.isActivePickup(item));

			if (!donorWaiting && !receiverWaiting) {
				this.clearPickupStatusRefresh();
				return;
			}

			if (donorWaiting) {
				this.enrichAllotmentsWithBorzo(this.alloted_food);
			}
			if (receiverWaiting) {
				this.enrichAllotmentsWithBorzo(this.alloted_request_food);
			}
		}, 8000);
	}

	clearPickupStatusRefresh() {
		if (this.pickupStatusRefreshTimer) {
			clearInterval(this.pickupStatusRefreshTimer);
			this.pickupStatusRefreshTimer = null;
		}
	}

	reconcileRelatedPickupOrders(list: any[]) {
		// Hide Cancel/Track on sibling rows when a related allotment already has a live Borzo order.
		list.forEach((item) => {
			if (!item.borzo_order_id || this.isPickupTerminalStatus(item.pickup_status)) {
				return;
			}
			list.forEach((other) => {
				if (this.areRelatedAllotments(item, other) && !other.borzo_order_id) {
					other.pickup_required = false;
				}
			});
		});

		const needingPickup = list.filter((item) =>
			(item.pickup_required || item.third_party) &&
			!item.borzo_order_id &&
			!this.isPickupCancelledLocally(item.donate_food_id)
		);

		const skipped = new Set<any>();
		needingPickup.forEach((item) => {
			if (skipped.has(item)) {
				return;
			}
			needingPickup.forEach((other) => {
				if (this.areRelatedAllotments(item, other)) {
					other.pickup_required = false;
					skipped.add(other);
				}
			});
			this.ensureBorzoOrderForReceiver(item);
		});
	}

	ensureBorzoOrderForReceiver(allotment: any) {
		if (allotment.borzo_order_pending || allotment.borzo_order_id || this.isPickupCancelledLocally(allotment.donate_food_id)) {
			return;
		}
		allotment.borzo_order_pending = true;

		this.fetch.get_donor_food_detail(allotment.donate_food_id).subscribe(donorRes => {
			const donor = donorRes?.data;
			if (!donor) {
				allotment.borzo_order_pending = false;
				return;
			}

			this.fetch.profile(JSON.stringify({ id: donor.app_user_id })).subscribe(donorProfile => {
				const receiverId = allotment.receiver_id || allotment.get_food_user_id || this.model.user_id;
				this.fetch.profile(JSON.stringify({ id: receiverId })).subscribe(receiverProfile => {
					let donorPhone = this.formatBorzoPhone(donorProfile['mobile_no']);
					let receiverPhone = this.formatBorzoPhone(receiverProfile['mobile_no']);

					if (!donorPhone || !receiverPhone) {
						allotment.borzo_order_pending = false;
						console.error('[Borzo] Missing phone numbers for receiver-side auto-match');
						return;
					}

					const receiverLocationStr = localStorage.getItem('receiver_location');
					const receiverLocation = receiverLocationStr ? JSON.parse(receiverLocationStr) : {};
					const dropLat = receiverLocation.latitude || allotment.receiver_latitude || allotment.latitude;
					const dropLng = receiverLocation.longitude || allotment.receiver_longitude || allotment.longitude;
					const dropAddress = receiverLocation.colony_name || allotment.receiver_colony_name || allotment.colony_name;

					if (!dropLat || !dropLng || !dropAddress) {
						allotment.borzo_order_pending = false;
						console.error('[Borzo] Missing drop location for receiver-side auto-match');
						return;
					}

					const itemName = (allotment.food_type == 1 || allotment.food_type == 3) ? 'Veg Food' : 'Non-Veg Food';

					const borzoOrderData = {
						donate_food_id: allotment.donate_food_id,
						donor_id: donor.app_user_id,
						pickup_address: donor.colony_name || '',
						pickup_name: donor.username || donorProfile['username'] || 'Donor',
						pickup_phone: donorPhone,
						drop_address: dropAddress,
						drop_name: receiverProfile['username'] || 'Receiver',
						drop_phone: receiverPhone,
						pickup_city: donor.city || '',
						pickup_state: donor.state || '',
						pickup_pincode: donor.postalCode || '',
						pickup_lat: donor.latitude,
						pickup_lng: donor.longitude,
						delivery_city: receiverLocation.city || allotment.receiver_city || allotment.city || '',
						delivery_state: receiverLocation.state || allotment.receiver_state || allotment.state || '',
						delivery_pincode: receiverLocation.postalCode || allotment.receiver_postal_code || allotment.postal_code || '',
						delivery_lat: dropLat,
						delivery_lng: dropLng,
						item_name: itemName,
						units: allotment.no_of_person
					};

					this.fetch.createBorzoOrder(borzoOrderData).subscribe(orderRes => {
						allotment.borzo_order_pending = false;
						if (orderRes && orderRes.response && orderRes.response.is_successful) {
							const order = orderRes.response.order;
							allotment.isBorzo = true;
							allotment.pickup_required = true;
							allotment.borzo_order_id = order.order_id;
							allotment.courier_assigned = false;
							allotment.pickup_status = this.getPickupStatusLabel(order.status, false);
							if (order.points && order.points[1]) {
								allotment.tracking_url = order.points[1].tracking_url;
								allotment.borzo_tracking_url = order.points[1].tracking_url;
							}
						}
					}, () => {
						allotment.borzo_order_pending = false;
					});
				}, () => {
					allotment.borzo_order_pending = false;
				});
			}, () => {
				allotment.borzo_order_pending = false;
			});
		}, () => {
			allotment.borzo_order_pending = false;
		});
	}

	formatBorzoPhone(phone: string): string {
		if (!phone) {
			return '';
		}
		let cleaned = phone.replace(/\D/g, '');
		if (cleaned.length === 10) {
			cleaned = '91' + cleaned;
		}
		return cleaned.length >= 11 ? cleaned : '';
	}

	isPickupTerminalStatus(status: string): boolean {
		if (!status) {
			return false;
		}
		const normalized = status.toLowerCase();
		return normalized.includes('cancel')
			|| normalized.includes('deliver')
			|| normalized.includes('finish')
			|| normalized.includes('complete')
			|| normalized.includes('failed')
			|| normalized.includes('deleted')
			|| normalized.includes('rejected')
			|| normalized.includes('returned');
	}

	isActivePickup(item: any): boolean {
		return !!(item
			&& item.pickup_required
			&& item.borzo_order_id
			&& !this.isPickupTerminalStatus(item.pickup_status)
			&& !this.isPickupCancelledLocally(item.donate_food_id));
	}

	shouldShowPickupPanel(item: any): boolean {
		return this.isActivePickup(item);
	}

	extractBorzoStatus(resBorzo: any): string {
		return (resBorzo?.order?.status
			|| resBorzo?.order?.status_description
			|| resBorzo?.status
			|| resBorzo?.status_description
			|| '').toString();
	}

	isBorzoResponseCancelled(resBorzo: any, status = ''): boolean {
		const normalizedStatus = (status || this.extractBorzoStatus(resBorzo)).toLowerCase();
		return !!(resBorzo?.is_cancelled
			|| resBorzo?.order?.is_cancelled
			|| resBorzo?.order?.cancelled
			|| normalizedStatus.includes('cancel'));
	}

	applyCancelledPickupState(val: any, status = 'Cancelled') {
		val.isBorzo = false;
		val.pickup_required = false;
		val.courier_assigned = false;
		val.pickup_status = status;
		const cancelledOrderId = val.borzo_order_id;
		val.borzo_order_id = null;
		val.tracking_url = null;
		val.borzo_tracking_url = null;
		val.rider_name = '';
		val.rider_phone = '';
		val.rider_photo = '';
		this.markPickupCancelled(val.donate_food_id);

		if (cancelledOrderId && localStorage.getItem('borzo_order_id') === String(cancelledOrderId)) {
			localStorage.removeItem('borzo_order_id');
			localStorage.removeItem('borzo_order_name');
			localStorage.removeItem('borzo_tracking_url');
			localStorage.removeItem('borzo_delivery_fee');
			localStorage.removeItem('borzo_payment_amount');
			localStorage.removeItem('borzo_status');
		}
	}

	isPickupCancelledLocally(donateFoodId: number | string): boolean {
		if (!donateFoodId) {
			return false;
		}
		const ids = JSON.parse(localStorage.getItem('cancelled_pickup_food_ids') || '[]');
		return ids.some((id: any) => String(id) === String(donateFoodId));
	}

	markPickupCancelled(donateFoodId: number | string) {
		if (!donateFoodId) {
			return;
		}
		const ids = JSON.parse(localStorage.getItem('cancelled_pickup_food_ids') || '[]');
		if (!ids.some((id: any) => String(id) === String(donateFoodId))) {
			ids.push(donateFoodId);
			localStorage.setItem('cancelled_pickup_food_ids', JSON.stringify(ids));
		}
	}

	applyBorzoDetailsToAllotment(val: any, resBorzo: any): boolean {
		const status = this.extractBorzoStatus(resBorzo);
		const hadBorzoOrder = !!(val.borzo_order_id || val._had_borzo_order);

		if (this.isPickupCancelledLocally(val.donate_food_id) || this.isBorzoResponseCancelled(resBorzo, status)) {
			this.applyCancelledPickupState(val, 'Cancelled');
			this.notifyPickupLifecycleChange(val, 'Cancelled', false);
			return true;
		}

		if (!resBorzo?.success || !resBorzo?.is_borzo) {
			if (hadBorzoOrder || (resBorzo?.order && this.isBorzoResponseCancelled(resBorzo, status))) {
				this.applyCancelledPickupState(val, 'Cancelled');
				this.notifyPickupLifecycleChange(val, 'Cancelled', false);
			}
			return false;
		}

		val._had_borzo_order = true;
		val.isBorzo = true;
		val.borzo_order_id = resBorzo.order.order_id;
		val.tracking_url = resBorzo.order.tracking_url;
		val.borzo_tracking_url = resBorzo.order.tracking_url;

		val.courier_assigned = resBorzo.courier_assigned === true
			|| resBorzo.courier_assigned === 1
			|| resBorzo.courier_assigned === '1'
			|| resBorzo.order?.courier_assigned === true
			|| (() => {
				const normalizedStatus = (status || '').toLowerCase().trim();
				return normalizedStatus.includes('courier_assigned')
					|| normalizedStatus.includes('courier assigned')
					|| normalizedStatus.includes('assigned')
					|| normalizedStatus === 'active'
					|| normalizedStatus === 'available'
					|| normalizedStatus.includes('at_pickup')
					|| normalizedStatus.includes('picked_up')
					|| normalizedStatus.includes('delivering')
					|| normalizedStatus.includes('on_way')
					|| normalizedStatus.includes('arrived');
			})();
		val.pickup_status = this.getPickupStatusLabel(status, val.courier_assigned);

		if (this.isPickupTerminalStatus(status)) {
			val.pickup_required = false;
			val.courier_assigned = false;
			if (status.toLowerCase().includes('cancel')) {
				this.applyCancelledPickupState(val, 'Cancelled');
			}
			this.notifyPickupLifecycleChange(val, status, false);
			return true;
		}

		val.pickup_required = true;
		if (val.courier_assigned) {
			val.rider_name = resBorzo.order.courier_name;
			val.rider_phone = resBorzo.order.courier_phone;
			val.rider_photo = resBorzo.order.courier_photo_url;
			this.clearRiderWaitDeadline(val.donate_food_id);
		} else {
			val.rider_name = '';
			val.rider_phone = '';
			val.rider_photo = '';
			if (this.isRiderWaitExpired(val.donate_food_id)) {
				this.autoCancelUnassignedPickup(val);
			}
		}
		this.notifyPickupLifecycleChange(val, status, val.courier_assigned);
		return true;
	}

	private isRiderWaitExpired(donateFoodId: number | string): boolean {
		const waitFood = localStorage.getItem('borzo_rider_wait_food_id');
		const waitUntil = localStorage.getItem('borzo_rider_wait_until');
		if (!waitFood || !waitUntil || String(waitFood) !== String(donateFoodId)) {
			return false;
		}
		const until = parseInt(waitUntil, 10);
		return !isNaN(until) && Date.now() >= until;
	}

	private clearRiderWaitDeadline(donateFoodId?: number | string) {
		const waitFood = localStorage.getItem('borzo_rider_wait_food_id');
		if (donateFoodId != null && waitFood && String(waitFood) !== String(donateFoodId)) {
			return;
		}
		localStorage.removeItem('borzo_rider_wait_until');
		localStorage.removeItem('borzo_rider_wait_food_id');
	}

	/**
	 * App-side 5-min timeout (no cron): if still unassigned past deadline, cancel pickup.
	 */
	private autoCancelUnassignedPickup(val: any) {
		const foodId = String(val.donate_food_id);
		if (!val.borzo_order_id || val.courier_assigned || this.autoCancelInFlight[foodId]) {
			return;
		}

		this.autoCancelInFlight[foodId] = true;
		const source: 'donor' | 'receiver' =
			(this.alloted_request_food || []).some((item) => item === val || String(item.donate_food_id) === foodId)
				? 'receiver'
				: 'donor';

		const finish = () => {
			this.clearRiderWaitDeadline(val.donate_food_id);
			this.finalizePickupCancellation(
				val,
				source,
				'No rider found in time. Pickup cancelled.'
			);
			delete this.autoCancelInFlight[foodId];
		};

		const cancelBackend = () => {
			this.cancelBackendAllotment(
				val,
				source,
				'No rider assigned within time limit',
				'Auto cancelled after timeout'
			).subscribe(
				() => finish(),
				() => finish()
			);
		};

		this.fetch.cancelBorzoOrder({
			order_id: val.borzo_order_id,
			reason: 'No rider assigned within time limit',
			comment: 'Auto cancelled after timeout'
		}).subscribe(
			() => cancelBackend(),
			() => cancelBackend()
		);
	}

	/** Shared Donor/Donee label so both sides stay in sync before/after rider assignment. */
	getPickupStatusLabel(status: string, courierAssigned: boolean): string {
		if (status && status.toLowerCase().includes('cancel')) {
			return 'Cancelled';
		}
		if (this.isPickupTerminalStatus(status)) {
			return status || 'Completed';
		}
		if (!courierAssigned) {
			return 'Finding a rider to pick up';
		}
		return status || 'Rider assigned';
	}

	canTrackPickup(x: any): boolean {
		return !!(x && x.courier_assigned && x.tracking_url);
	}

	/** Cancel only before a rider is assigned (matches Borzo cancel window). */
	canCancelPickup(x: any): boolean {
		return !!(x
			&& x.borzo_order_id
			&& !x.courier_assigned
			&& !this.isPickupTerminalStatus(x.pickup_status)
			&& !this.isPickupCancelledLocally(x.donate_food_id));
	}

	getPickupLifecyclePhase(status: string, courierAssigned: boolean): string {
		const normalized = (status || '').toLowerCase();
		if (normalized.includes('cancel')) {
			return 'cancelled';
		}
		if (normalized.includes('deliver')
			|| normalized.includes('finish')
			|| normalized.includes('complete')) {
			return 'delivered';
		}
		if (normalized.includes('picked_up') || normalized.includes('pickuped')) {
			return 'picked_up';
		}
		if (courierAssigned) {
			return 'assigned';
		}
		return 'finding';
	}

	/**
	 * In-app status alerts from Borzo polling (no webhooks in this client).
	 * First poll only seeds state; later transitions raise a one-time alert.
	 */
	notifyPickupLifecycleChange(val: any, status: string, courierAssigned: boolean) {
		if (!val?.donate_food_id) {
			return;
		}

		const key = String(val.donate_food_id);
		const phase = this.getPickupLifecyclePhase(status, courierAssigned);
		const previous = this.pickupLifecycleNotified[key];

		if (!previous) {
			this.pickupLifecycleNotified[key] = phase;
			return;
		}

		if (previous === phase) {
			return;
		}

		this.pickupLifecycleNotified[key] = phase;

		if (phase === 'assigned' && previous === 'finding') {
			const rider = val.rider_name ? ` (${val.rider_name})` : '';
			this.showSuccessAlert(`A rider has been assigned for your pickup${rider}.`);
		} else if (phase === 'picked_up' && previous !== 'delivered') {
			this.showSuccessAlert('Food has been picked up by the rider.');
		} else if (phase === 'delivered') {
			this.showSuccessAlert('Food has been delivered successfully.');
		} else if (phase === 'cancelled' && previous !== 'cancelled') {
			this.showSuccessAlert('Pickup was cancelled.');
		}
	}

	/** Prefer the location the receiver selected, not live GPS. */
	getSelectedReceiverCoords(x?: any): { lat: any; lng: any } {
		try {
			const matched = localStorage.getItem('matched_pickup_location');
			if (matched) {
				const location = JSON.parse(matched);
				if (location.latitude != null && location.longitude != null && location.latitude !== '' && location.longitude !== '') {
					return { lat: location.latitude, lng: location.longitude };
				}
			}
		} catch (e) { }

		try {
			const stored = localStorage.getItem('receiver_location');
			if (stored) {
				const location = JSON.parse(stored);
				const lat = location.latitude;
				const lng = location.longitude;
				if (lat != null && lng != null && lat !== '' && lng !== '') {
					return { lat, lng };
				}
			}
		} catch (e) {
			console.warn('Could not parse receiver_location', e);
		}

		const allotmentLat = x?.receiver_latitude || x?.get_food_latitude || x?.rec_lat;
		const allotmentLng = x?.receiver_longitude || x?.get_food_longitude || x?.rec_lng;
		if (allotmentLat != null && allotmentLng != null && allotmentLat !== '' && allotmentLng !== '') {
			return { lat: allotmentLat, lng: allotmentLng };
		}

		return {
			lat: this.model.recLat || '',
			lng: this.model.recLng || ''
		};
	}

	openReceiverPickupPage(x: any) {
		const mode = this.model.mode || 'WALKING';
		const selected = this.getSelectedReceiverCoords(x);
		const recLat = selected.lat;
		const recLng = selected.lng;
		const hasBorzoPickup = !!(
			x.pickup_required
			|| x.borzo_order_id
			|| x.isBorzo
			|| localStorage.getItem('pickup_required') === '1'
		);

		// For Borzo pickups always open searching screen first.
		// It will auto-move to page 2 only after rider is really assigned.
		if (hasBorzoPickup) {
			this.router.navigate([
				'/finding-rider',
				x.donate_food_id,
				recLat,
				recLng,
				x.app_user_id,
				mode,
				x.food_type,
				x.id
			]);
			return;
		}

		this.router.navigate([
			'/get-food-nearest-donors-two-duplicate',
			x.donate_food_id,
			recLat,
			recLng,
			x.app_user_id,
			mode,
			x.food_type,
			x.id
		]);
	}

	setAllotmentTiming(val: any) {
		const startTime = new Date(val.updated_at);
		const endTime = new Date();
		const difference = endTime.getTime() - startTime.getTime();
		val.resultInMinutes = Math.round(difference / 60000);
	}

	reloadDonorAllotedFood(hideSpinner = true) {
		this.fetch.my_alloted_donation(this.model.user_id).subscribe(res => {
			this.alloted_food = res['data'] || [];
			this.alloted_food.forEach((val) => this.setAllotmentTiming(val));
			this.enrichAllotmentsWithBorzo(this.alloted_food);
			if (hideSpinner) {
				$('#add_location_spinner').hide();
			}
		}, () => {
			if (hideSpinner) {
				$('#add_location_spinner').hide();
			}
		});
	}

	reloadReceiverAllotedFood(hideSpinner = true) {
		this.fetch.my_alloted_request(this.model.user_id).subscribe(res => {
			this.alloted_request_food = res['data'] || [];
			this.enrichAllotmentsWithBorzo(this.alloted_request_food);
			if (hideSpinner) {
				$('#add_location_spinner').hide();
			}
		}, () => {
			if (hideSpinner) {
				$('#add_location_spinner').hide();
			}
		});
	}

	async showSuccessAlert(message: string) {
		const alert = await this.alertController.create({
			cssClass: 'my-custom-class custom_alert_1',
			message,
			buttons: ['OK']
		});
		await alert.present();
	}

	async showErrorAlert(message: string) {
		const alert = await this.alertController.create({
			cssClass: 'my-custom-class custom_alert_1',
			header: 'Error',
			message,
			buttons: ['OK']
		});
		await alert.present();
	}

	notifyVolunteerAllotmentCancelled(allotment: any) {
		const receiverId = allotment.app_user_id || allotment.receiver_id || allotment.get_food_user_id;
		const foodId = allotment.donate_food_id || allotment.food_id;
		const allotmentId = allotment.id || allotment.getFoodId;
		if (!receiverId || !foodId) {
			return;
		}

		const cancelMessage = 'Your food allotment has been cancelled. We will connect you to another donor soon.';
		const notifyData = JSON.stringify({
			food_id: foodId,
			logged_in_user: this.model.login_username,
			no_of_person: allotment.no_of_person || 0,
			app_user_id: this.model.user_id,
			food_type: allotment.food_type || 1,
			notification_type: 6,
			to: receiverId,
			from: this.model.user_id,
			getFoodId: allotmentId,
			message: cancelMessage,
			notification_message: cancelMessage
		});
		this.fetch.notify_donar(notifyData).subscribe();
	}

	finalizePickupCancellation(x: any, source: 'donor' | 'receiver', message: string) {
		x.pickup_required = false;
		x.pickup_status = 'Cancelled';
		x.rider_id = null;
		x.rider_name = null;
		x.rider_phone = null;
		x.tracking_url = null;
		this.markPickupCancelled(x.donate_food_id);

		if (x.borzo_order_id && localStorage.getItem('borzo_order_id') === String(x.borzo_order_id)) {
			localStorage.removeItem('borzo_order_id');
			localStorage.removeItem('borzo_order_name');
			localStorage.removeItem('borzo_tracking_url');
			localStorage.removeItem('borzo_delivery_fee');
			localStorage.removeItem('borzo_payment_amount');
			localStorage.removeItem('borzo_status');
		}
		this.clearRiderWaitDeadline(x.donate_food_id);

		if (source === 'receiver') {
			this.alloted_request_food = this.alloted_request_food.filter(item => item.id !== x.id);
			this.reloadReceiverAllotedFood();
		} else {
			this.notifyVolunteerAllotmentCancelled(x);
			this.alloted_food = this.alloted_food.filter(item => item.id !== x.id);
			this.reloadDonorAllotedFood();
		}

		$('#add_location_spinner').hide();
		this.showSuccessAlert(message);
	}

	cancelBackendAllotment(x: any, source: 'donor' | 'receiver', reason = 'Pickup cancelled', comment = '') {
		if (source === 'receiver') {
			const data = JSON.stringify({ id: x.id, reason, comment });
			return this.fetch.get_food_cancel_alloted_request(data);
		}

		const data = JSON.stringify({
			id: x.id,
			donate_food_id: x.donate_food_id,
			donar_id: x.donor_id,
			receiver_id: x.app_user_id,
			notification_type: 4,
			logged_in_username: this.model.login_username,
			no_of_person: x.no_of_person
		});
		return this.fetch.cancel_alloted_food(data);
	}

	share(msg: string) {
		this.platform.ready().then(() => {
			const message = msg;
			const subject = 'Khana app';
			const url = 'https://play.google.com/store/apps/details?id=com.food.forAll';
			this.socialSharing.share(message, subject, undefined, url)
				.then(() => console.log('Share successful'))
				.catch(err => console.error('Share failed:', err));
		});
	}
	call(number) {

		let data = JSON.stringify({ 'caller_id': this.model.user_id, 'callee_mobile_no': number });

		this.fetch.add_call_detail(data).subscribe(res => {
			this.callNumber.callNumber(environment.phone_no, true)
				.then(res => { console.log('Launched dialer!', res); })
				.catch(err => console.log('Error launching dialer', err));
		});
	}

	async cancelAllotedRequest(id, food_id, donar_id, no_of_person, food_type, borzo_order_id?) {
		$('#add_location_spinner').show();
		const modal = await this.modalController.create({
			component: CancelAllotedfoodPage,
			cssClass: 'custom_filter_modal cancel_allot_food_popup',
			componentProps: {
				"paramID": 123,
				"paramTitle": "get_food",
				"id": id,
				"type": 'get_food',
				"borzo_order_id": borzo_order_id
			}
		});

		modal.onDidDismiss().then((dataReturned) => {
			$('#add_location_spinner').hide();
			if (dataReturned !== null && dataReturned.data == 1) {
				this.markPickupCancelled(food_id);
				let data = JSON.stringify({ 'food_id': food_id, 'logged_in_user': this.model.login_username, 'no_of_person': no_of_person, 'app_user_id': this.model.user_id, 'food_type': food_type, 'notification_type': 3, 'to': donar_id, 'from': this.model.user_id, 'getFoodId': id });
				this.fetch.notify_donar(data).subscribe(() => {
					this.reloadReceiverAllotedFood();
					this.showSuccessAlert('Food allotment cancelled successfully.');
				}, () => {
					this.reloadReceiverAllotedFood();
					this.showSuccessAlert('Food allotment cancelled successfully.');
				});
			} else if (dataReturned !== null && dataReturned.data == 0) {
				this.showErrorAlert('Could not cancel the allotment. Please try again.');
			}
		});

		return await modal.present();
	}
	async presentAlertPrompt(id) {
		$('#add_location_spinner').show();
		const alert = await this.alertController.create({
			cssClass: 'my-custom-class custom_alert_1',
			//header: 'Alert',
			message: this.model.key_text21,
			buttons: [
				{
					text: this.model.key_text23,
					role: 'cancel',
					cssClass: 'secondary',
					handler: () => {
						$('#add_location_spinner').hide();
						console.log('Confirm Cancel');
					}
				}, {
					text: this.model.key_text22,
					handler: () => {
						let data = JSON.stringify({ 'donate_food_id': id });
						this.fetch.cancel_donation_food(data).subscribe(res => {

							this.fetch.pending_donation(this.model.user_id).subscribe(res => {
								this.pending_data = res['data'];

							});
							this.fetch.my_alloted_donation(this.model.user_id).subscribe(res => {
								this.alloted_food = res['data'];
								this.alloted_food.forEach((val, i) => {
									var startTime = new Date(val.updated_at);
									var endTime = new Date();
									var difference = endTime.getTime() - startTime.getTime(); // This will give difference in milliseconds
									var resultInMinutes = Math.round(difference / 60000);
									val.resultInMinutes = resultInMinutes;

								});
								$('#add_location_spinner').hide();
							});
						});


					}
				}
			]
		});

		await alert.present();
	}
	async cancelRequestFood(id) {
		$('#add_location_spinner').show();
		const alert = await this.alertController.create({
			cssClass: 'my-custom-class',
			//header: 'Alert',
			message: this.model.key_text24,
			buttons: [
				{
					text: this.model.key_text23,
					role: 'cancel',
					cssClass: 'secondary',
					handler: () => {
						$('#add_location_spinner').show();
						console.log('Confirm Cancel');
					}
				}, {
					text: this.model.key_text22,
					handler: () => {
						let data = JSON.stringify({ 'id': id });
						this.fetch.cancel_requested_food(data).subscribe(res => {
							this.fetch.my_food_request(this.model.user_id).subscribe(res => {
								this.request_food = res['data'];
								$('#add_location_spinner').hide();
								this.showSuccessAlert('Food request cancelled successfully.');
							});
						}, () => {
							$('#add_location_spinner').hide();
							this.showErrorAlert('Could not cancel the food request. Please try again.');
						});
					}
				}
			]
		});

		await alert.present();
	}
	activeDonation(id) {
		let data = JSON.stringify({ 'id': id });
		this.fetch.active_donation(data).subscribe(res => {
			this.ngOnInit();
		});
	}
	async cancelAllotedFood(id, donate_food_id, donar_id, receiver_id, no_of_person, food_type?) {
		$('#add_location_spinner').show();
		const alert = await this.alertController.create({
			cssClass: 'my-custom-class',
			//header: 'Alert',
			message: this.model.key_text25,
			buttons: [
				{
					text: this.model.key_text23,
					role: 'cancel',
					cssClass: 'secondary',
					handler: () => {
						$('#add_location_spinner').hide();
						console.log('Confirm Cancel');
					}
				}, {
					text: this.model.key_text22,
					handler: () => {
						let data = JSON.stringify({ 'id': id, 'donate_food_id': donate_food_id, 'donar_id': donar_id, 'receiver_id': receiver_id, 'notification_type': 4, 'logged_in_username': this.model.login_username, 'no_of_person': no_of_person });
						this.fetch.cancel_alloted_food(data).subscribe(res => {
							this.markPickupCancelled(donate_food_id);
							this.notifyVolunteerAllotmentCancelled({
								id,
								receiver_id,
								donate_food_id,
								no_of_person,
								food_type
							});
							this.fetch.pending_donation(this.model.user_id).subscribe(res => {
								this.pending_data = res['data'];
							});
							this.reloadDonorAllotedFood();
							this.showSuccessAlert('Food allotment cancelled successfully.');
						}, () => {
							$('#add_location_spinner').hide();
							this.showErrorAlert('Could not cancel the allotment. Please try again.');
						});
					}
				}
			]
		});

		await alert.present();
	}
	plotSimpleBarChart(data, cat, min, max, tickInterval) {
		let myChart = HighCharts.chart('highcharts', {
			chart: {
				type: 'spline',
				backgroundColor: '#F7F6F4',
				height: 200,
			},
			credits: {
				enabled: false
			},
			title: {
				text: ''
			},
			xAxis: {
				categories: cat,
			},
			yAxis: {
				gridLineWidth: 0,
				min: min,
				max: max,
				tickInterval: tickInterval,
				tickPixelInterval: 1,
				title: {
					text: ''
				}
			},
			plotOptions: {
				series: {
					marker: {
						enabled: false
					}
				}
			},
			series: [{
				name: '',
				type: undefined,
				color: '#419B95',
				data: data
			}]
		});
		setTimeout(function () { myChart.reflow(); }, 1000);
	}
	weekly_donation_graph() {
		setTimeout(function () {
			$('#activity_normal_spinner').css('display', 'none');
			$('#activity_normal_content').css('display', 'block');
		}, 100);
		this.donation_graph_data = [];
		this.fetch.weekly_donation_graph(this.model.user_id).subscribe(res => {
			for (var i = 0; i < 7; i++) {
				this.donation_graph_data.push(0);
			}
			let calcmax = 12;
			for (var j = 0; j < res.data.length; j++) {
				var index = res.data[j].day - 1;
				this.donation_graph_data[index] = res.data[j].cnt;
				if (res.data[j].cnt > calcmax) {
					calcmax = res.data[j].cnt;
				}
			}
			this.model.xcat = [this.model.key_text36, this.model.key_text37, this.model.key_text38, this.model.key_text39, this.model.key_text40, this.model.key_text41, this.model.key_text42];
			this.model.min = 0;
			this.model.max = calcmax;
			this.model.tickInterval = 4;
			this.plotSimpleBarChart(this.donation_graph_data, this.model.xcat, this.model.min, this.model.max, this.model.tickInterval);
		});
		this.fetch.blessings_this_week(this.model.user_id).subscribe(res => {
			this.model.blessing_this_week = res.data[0].total_donation;
			this.model.blessing_quote = "week";
		});
		this.fetch.total_blessings(this.model.user_id).subscribe(res => {
			this.model.total_blessings = res.data[0].total_donation;
		});
	}
	monthly_donation_graph() {
		setTimeout(function () {
			$('#activity_normal_spinner').css('display', 'none');
			$('#activity_normal_content').css('display', 'block');
		}, 100);
		this.donation_graph_data = [];
		this.fetch.monthly_donation_graph(this.model.user_id).subscribe(res => {
			this.donation_graph_data = [0, 0, 0, 0];
			for (var j = 0; j < res.data.length; j++) {
				var index = res.data[j].Week_no - 1;
				this.donation_graph_data[index] = res.data[j].cnt;
			}
			this.model.xcat = [this.model.key_text43 + '1', this.model.key_text43 + '2', this.model.key_text43 + '3', this.model.key_text43 + '4'];
			this.model.min = 0;
			this.model.max = 60;
			this.model.tickInterval = 20;
			this.plotSimpleBarChart(this.donation_graph_data, this.model.xcat, this.model.min, this.model.max, this.model.tickInterval);
		});
		this.fetch.blessings_this_month(this.model.user_id).subscribe(res => {
			this.model.blessing_this_week = res.data[0].total_donation;
			this.model.blessing_quote = "month";
		});
		this.fetch.total_blessings(this.model.user_id).subscribe(res => {
			this.model.total_blessings = res.data[0].total_donation;
		});
	}

	//   pie_chart_food_quality(e, g, b){
	// 	let myChart = HighCharts.chart('food_quality', {
	// 		chart: {
	// 			type: 'pie',
	// 			backgroundColor: '#F7F6F4',
	// 			plotBackgroundColor: '#F7F6F4',
	// 			plotBorderWidth: null,
	// 			plotShadow: false,
	// 			height:300
	// 		},
	// 		credits: {
	// 			enabled: false
	// 		},
	// 		title: {
	// 			text: this.model.key_text26
	// 		},
	// 		plotOptions: {
	// 			pie: {
	// 				allowPointSelect: true,
	// 				cursor: 'pointer',
	// 				dataLabels: {
	// 					enabled: true,
	// 					format: '<b>{point.name}</b>: {point.percentage:.1f} %'
	// 				}
	// 			}
	// 		},
	// 		series: [{
	// 			name: '',
	// 			type: undefined,
	// 			data: [{
	// 				name: this.model.key_text29,
	// 				y: e,
	// 				color: "#32CD32"
	// 			}, {
	// 				name: this.model.key_text30,
	// 				y: g,
	// 				color: "orange"
	// 			}, {
	// 				name: this.model.key_text31,
	// 				y: b,
	// 				color: "red"
	// 			}]
	// 		}]
	// 	});
	// 	setTimeout(function(){ myChart.reflow(); }, 1000);
	//   }
	//   packagingPieChart(e, g, b) {
	//    let myChart = HighCharts.chart('packaging', {
	//       chart: {
	//         type: 'pie',
	// 		backgroundColor: '#F7F6F4',
	// 		plotBackgroundColor: '#F7F6F4',
	// 		plotBorderWidth: null,
	// 		plotShadow: false,
	// 		height:300
	//       },
	// 	  title: {
	//         text: this.model.key_text27
	//       },
	// 	 credits: {
	// 			enabled: false
	// 		},
	//       plotOptions: {
	//         pie: {
	//           allowPointSelect: true,
	//           cursor: 'pointer',
	//           dataLabels: {
	//             enabled: true,
	//             format: '<b>{point.name}</b>: {point.percentage:.1f} %'
	//           }
	//         }
	//       },
	//       series: [{
	//         name: '',
	// 		type: undefined,
	//         data: [{
	//           name: this.model.key_text29,
	//           y: e,
	// 		  color: "#32CD32"
	//         }, {
	//           name: this.model.key_text30,
	//           y: g,
	// 		   color: "orange"
	//         }, {
	//           name: this.model.key_text31,
	//           y: b,
	// 		   color: "red"
	//         }]
	//       }]
	//     });
	// 	setTimeout(function(){ myChart.reflow(); }, 1000);
	//   }
	//   behaviourPieChart(e, g, b) {
	// let myChart = HighCharts.chart('behaviour', {
	//       chart: {
	//         type: 'pie',
	// 		backgroundColor: '#F7F6F4',
	// 		plotBackgroundColor: '#F7F6F4',
	// 		plotBorderWidth: null,
	// 		plotShadow: false,
	// 		height:300
	//       },
	// 	  title: {
	//         text: this.model.key_text28
	//       },
	// 	 credits: {
	// 			enabled: false
	// 		},
	//       plotOptions: {
	//         pie: {
	//           allowPointSelect: true,
	//           cursor: 'pointer',
	//           dataLabels: {
	//             enabled: true,
	//             format: '<b>{point.name}</b>: {point.percentage:.1f} %'
	//           }
	//         }
	//       },
	//       series: [{
	//         name: '',
	// 		type: undefined,
	//         data: [{
	//           name: this.model.key_text29,
	//           y: e,
	// 		  color: "#32CD32"
	//         }, {
	//           name: this.model.key_text30,
	//           y: g,
	// 		   color: "orange"
	//         }, {
	//           name: this.model.key_text31,
	//           y: b,
	// 		   color: "red"
	//         }]
	//       }]
	//     });
	// 	setTimeout(function(){ myChart.reflow(); }, 1000);
	//   }


	checkday(alldata) {
		var monday = [];
		var tuesday = [];
		var wednesday = [];
		var thursday = [];
		var friday = [];
		var saturday = [];
		var sunday = [];


		for (var i = 0; i < alldata.length; i++) {
			//console.log(alldata[i] , '-----------');
			if (alldata[i].day == "Mon") {
				monday.push(alldata[i])
			}
			if (alldata[i].day == "Tue") {
				tuesday.push(alldata[i])
			}
			if (alldata[i].day == "Wed") {
				wednesday.push(alldata[i])
			}
			if (alldata[i].day == "Thu") {
				thursday.push(alldata[i])
			}
			if (alldata[i].day == "Fri") {
				friday.push(alldata[i])
			}
			if (alldata[i].day == "Sat") {
				saturday.push(alldata[i])
			}
			if (alldata[i].day == "Sun") {
				sunday.push(alldata[i])
			}
		}
		let sumfq1 = 0;
		let sumbeh1 = 0;
		let sumpac1 = 0;
		console.log(monday.length, 'length')
		for (var i = 0; i < monday.length; i++) {
			// console.log("aaaaaaaaaaaaa",monday.length);
			//console.log(monday[i].fq,'sdsdsd');
			var Mon = {
				fq: sumfq1 += monday[i].fq / monday.length,
				beh: sumbeh1 += monday[i].beh / monday.length,
				pac: sumpac1 += monday[i].pac / monday.length

			}
		}
		let sumfq2 = 0;
		let sumbeh2 = 0;
		let sumpac2 = 0;
		for (var i = 0; i < tuesday.length; i++) {

			var Tue = {
				fq: sumfq2 += tuesday[i].fq / tuesday.length,
				beh: sumbeh2 += tuesday[i].beh / tuesday.length,
				pac: sumpac2 += tuesday[i].pac / tuesday.length
			}
		}
		let sumfq3 = 0;
		let sumbeh3 = 0;
		let sumpac3 = 0;
		for (var i = 0; i < wednesday.length; i++) {

			var Wed = {
				fq: sumfq3 += wednesday[i].fq / wednesday.length,
				beh: sumbeh3 += wednesday[i].beh / wednesday.length,
				pac: sumpac3 += wednesday[i].pac / wednesday.length
			}
		}
		let sumfq4 = 0;
		let sumbeh4 = 0;
		let sumpac4 = 0;

		for (var i = 0; i < thursday.length; i++) {

			var Thu = {
				fq: sumfq4 += thursday[i].fq / thursday.length,
				beh: sumbeh4 += thursday[i].beh / thursday.length,
				pac: sumpac4 += thursday[i].pac / thursday.length
			}
		}

		let sumfq5 = 0;
		let sumbeh5 = 0;
		let sumpac5 = 0;

		for (var i = 0; i < friday.length; i++) {

			var Fri = {
				fq: sumfq5 += friday[i].fq / friday.length,
				beh: sumbeh5 += friday[i].beh / friday.length,
				pac: sumpac5 += friday[i].pac / friday.length
			}
		}

		let sumfq6 = 0;
		let sumbeh6 = 0;
		let sumpac6 = 0;

		for (var i = 0; i < saturday.length; i++) {

			var Sat = {
				fq: sumfq6 += saturday[i].fq / saturday.length,
				beh: sumbeh6 += saturday[i].beh / saturday.length,
				pac: sumpac6 += saturday[i].pac / saturday.length
			}
		}

		let sumfq7 = 0;
		let sumbeh7 = 0;
		let sumpac7 = 0;
		for (var i = 0; i < sunday.length; i++) {

			var Sun = {
				fq: sumfq7 += sunday[i].fq / sunday.length,
				beh: sumbeh7 += sunday[i].beh / sunday.length,
				pac: sumpac7 += sunday[i].pac / sunday.length
			}
		}
		return { Mon: Mon, Tue: Tue, Wed: Wed, Thu: Thu, Fri: Fri, Sat: Sat, Sun: Sun };

	}

	graph_weekly_food_quality() {
		//.log('yes inside column chart')
		//  console.log('this is dataatta',this.foodweeklydata);

		var alldataarr = [];
		var weekdata = this.foodweeklydata.weekdata
		for (var i = 0; i < weekdata.length; i++) {
			var date = new Date(weekdata[i].created_at).toDateString();
			var day = date.split(" ");
			//console.log('day',day)
			var alldata = {
				day: day[0],
				fq: weekdata[i].food_quality,
				beh: weekdata[i].behaviour,
				pac: weekdata[i].packaging
			}
			alldataarr.push(alldata);

		}

		var getall = this.checkday(alldataarr);
		//console.log('test',getall.Mon);
		if (getall.Mon == undefined) {
			getall.Mon = {
				fq: 0,
				pac: 0,
				beh: 0
			}
		}
		if (getall.Tue == undefined) {
			getall.Tue = {
				fq: 0,
				pac: 0,
				beh: 0
			}
		}
		if (getall.Wed == undefined) {
			getall.Wed = {
				fq: 0,
				pac: 0,
				beh: 0
			}
		}
		if (getall.Thu == undefined) {
			getall.Thu = {
				fq: 0,
				pac: 0,
				beh: 0
			}
		}
		if (getall.Fri == undefined) {
			getall.Fri = {
				fq: 0,
				pac: 0,
				beh: 0
			}
		}
		if (getall.Sat == undefined) {
			getall.Sat = {
				fq: 0,
				pac: 0,
				beh: 0
			}
		}
		if (getall.Sun == undefined) {
			getall.Sun = {
				fq: 0,
				pac: 0,
				beh: 0
			}
		}

		var Average = {
			Mon: getall.Mon.beh + getall.Mon.pac + getall.Mon.fq,
			Tue: getall.Tue.beh + getall.Tue.pac + getall.Tue.fq,
			Wed: getall.Wed.beh + getall.Wed.pac + getall.Wed.fq,
			Thu: getall.Thu.beh + getall.Thu.pac + getall.Thu.fq,
			Fri: getall.Fri.beh + getall.Fri.pac + getall.Fri.fq,
			Sat: getall.Sat.beh + getall.Sat.pac + getall.Sat.fq,
			Sun: getall.Sun.beh + getall.Sun.pac + getall.Sun.fq
		}
		//console.log("final data",getall);

		var Labels = [this.model.key_text33, this.model.key_text31, this.model.key_text30, this.model.key_text29];
		let myChart = HighCharts.chart('food_quality', {
			chart: {
				type: 'column'
			},
			title: {
				text: this.model.key_text32
			},
			credits: {
				enabled: false
			},
			xAxis: {
				categories: [this.model.key_text36, this.model.key_text37, this.model.key_text38, this.model.key_text39, this.model.key_text40, this.model.key_text41, this.model.key_text42],
				crosshair: true
			},

			yAxis: {
				max: 3,
				min: 1,
				labels: {
					formatter: function () {
						//console.log(this.value,'this.value')
						return Labels[this.value];
					}
				},
			},
			tooltip: {
				headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
				pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
					'<td style = "padding:0"><b>{point.y:.1f} </b></td></tr>', footerFormat: '</table>', shared: true, useHTML: true
			},
			plotOptions: {
				column: {
					pointPadding: 0.2,
					borderWidth: 0
				}

			},
			series: [
				{
					name: this.model.key_text26,
					data: [getall.Mon.fq, getall.Tue.fq, getall.Wed.fq, getall.Thu.fq, getall.Fri.fq, getall.Sat.fq, getall.Sun.fq],
					type: undefined,
					color: '#15c9bc'
				},
				{
					name: this.model.key_text27,
					data: [getall.Mon.pac, getall.Tue.pac, getall.Wed.pac, getall.Thu.pac, getall.Fri.pac, getall.Sat.pac, getall.Sun.pac],
					type: undefined,
					color: '#31a39b'
				},
				{
					name: this.model.key_text28,
					data: [getall.Mon.beh, getall.Tue.beh, getall.Wed.beh, getall.Thu.beh, getall.Fri.beh, getall.Sat.beh, getall.Sun.beh],
					type: undefined,
					color: '#3c918b'
				},
				{
					name: this.model.key_text35,
					data: [Average.Mon / 3, Average.Tue / 3, Average.Wed / 3, Average.Thu / 3, Average.Fri / 3, Average.Sat / 3, Average.Sun / 3],
					type: undefined,
					color: '#42726f'


				}]
		})
		setTimeout(function () { myChart.reflow(); }, 1000);
	}
	formatDate(date) {
		var dd = date.getDate();
		var mm = date.getMonth() + 1;
		var yyyy = date.getFullYear();
		if (dd < 10) { dd = '0' + dd }
		if (mm < 10) { mm = '0' + mm }
		date = { date: mm + '-' + dd + '-' + yyyy };
		return date
	}
	getMonthData() {
		var monthdata = this.foodweeklydata.monthdata
		var result1 = [];
		var week4 = [];
		var week3 = [];
		var week2 = [];
		var week1 = [];
		var fulldate1 = [];
		for (var i = 0; i < 7; i++) {
			var d = new Date();
			d.setDate(d.getDate() - i);
			fulldate1.push(d)
			result1.push(this.formatDate(d))

		}



		var result2 = [];
		var fulldate2 = [];

		for (var j = 0; j < 7; j++) {
			var d1 = new Date();
			d1.setDate(d1.getDate() - 7);
			d1.setDate(d1.getDate() - j);
			fulldate2.push(d1)
			result2.push(this.formatDate(d1))

		}
		//console.log("week3",result2);

		var result3 = [];
		var fulldate3 = [];

		for (var k = 0; k < 7; k++) {
			var d2 = new Date();
			d2.setDate(d2.getDate() - 14);
			d2.setDate(d2.getDate() - k);
			fulldate3.push(d2)
			result3.push(this.formatDate(d2))

		}
		//console.log("week2",result3);

		var result4 = [];
		var fulldate4 = [];

		for (var l = 0; l < 7; l++) {
			var d3 = new Date();
			d3.setDate(d3.getDate() - 21);
			d3.setDate(d3.getDate() - l);
			fulldate4.push(d3)
			result4.push(this.formatDate(d3))

		}
		//console.log("week1",result4);


		for (var c = 0; c < monthdata.length; c++) {
			let crdate = monthdata[c].created_at;
			let formater = new Date(crdate)
			let vdate = this.formatDate(formater);

			let resu = result1.find(({ date }) => date === vdate.date);

			if (resu !== undefined) {
				week4.push(monthdata[c])
			}

			let resu1 = result2.find(({ date }) => date === vdate.date);

			if (resu1 !== undefined) {
				week3.push(monthdata[c])
			}

			let resu2 = result3.find(({ date }) => date === vdate.date);

			if (resu2 !== undefined) {
				week2.push(monthdata[c])
			}

			let resu3 = result4.find(({ date }) => date === vdate.date);

			if (resu3 !== undefined) {
				week1.push(monthdata[c])
			}
		}

		let sumfq1 = 0;
		let sumbeh1 = 0;
		let sumpac1 = 0;
		for (var i = 0; i < week4.length; i++) {

			var sumweek4 = {
				fq: sumfq1 += week4[i].food_quality / week4.length,
				beh: sumbeh1 += week4[i].behaviour / week4.length,
				pac: sumpac1 += week4[i].packaging / week4.length
			}
		}

		let sumfq2 = 0;
		let sumbeh2 = 0;
		let sumpac2 = 0;

		for (var i = 0; i < week3.length; i++) {

			var sumweek3 = {
				fq: sumfq2 += week3[i].food_quality / week3.length,
				beh: sumbeh2 += week3[i].behaviour / week3.length,
				pac: sumpac2 += week3[i].packaging / week3.length
			}
		}
		let sumfq3 = 0;
		let sumbeh3 = 0;
		let sumpac3 = 0;
		for (var i = 0; i < week2.length; i++) {

			var sumweek2 = {
				fq: sumfq3 += week2[i].food_quality / week2.length,
				beh: sumbeh3 += week2[i].behaviour / week2.length,
				pac: sumpac3 += week2[i].packaging / week2.length
			}
		}

		let sumfq4 = 0;
		let sumbeh4 = 0;
		let sumpac4 = 0;
		for (var i = 0; i < week1.length; i++) {

			var sumweek1 = {
				fq: sumfq4 += week1[i].food_quality / week1.length,
				beh: sumbeh4 += week1[i].behaviour / week1.length,
				pac: sumpac4 += week1[i].packaging / week1.length
			}
		}



		return { weekr4: sumweek4, weekr3: sumweek3, weekr2: sumweek2, weekr1: sumweek1 };

	}

	graph_monthly_food_quality() {

		var monthdata = this.getMonthData();

		//console.log("month final data",monthdata);

		if (monthdata.weekr4 == undefined) {
			monthdata.weekr4 = {
				fq: 0,
				pac: 0,
				beh: 0
			}
		}
		if (monthdata.weekr3 == undefined) {
			monthdata.weekr3 = {
				fq: 0,
				pac: 0,
				beh: 0
			}
		}
		if (monthdata.weekr2 == undefined) {
			monthdata.weekr2 = {
				fq: 0,
				pac: 0,
				beh: 0
			}
		}
		if (monthdata.weekr1 == undefined) {
			monthdata.weekr1 = {
				fq: 0,
				pac: 0,
				beh: 0
			}
		}


		var Average = {
			week4: monthdata.weekr4.beh + monthdata.weekr4.pac + monthdata.weekr4.fq,
			week3: monthdata.weekr3.beh + monthdata.weekr3.pac + monthdata.weekr3.fq,
			week2: monthdata.weekr2.beh + monthdata.weekr2.pac + monthdata.weekr2.fq,
			week1: monthdata.weekr1.beh + monthdata.weekr1.pac + monthdata.weekr1.fq,
		}


		var Labels = [this.model.key_text33, this.model.key_text31, this.model.key_text30, this.model.key_text29];
		let myChart = HighCharts.chart('quality', {
			chart: {
				type: 'column'
			},
			title: {
				text: this.model.key_text34
			},
			credits: {
				enabled: false
			},
			xAxis: {
				categories: [this.model.key_text43 + '1', this.model.key_text43 + '2', this.model.key_text43 + '3', this.model.key_text43 + '4'],
				crosshair: true
			},

			yAxis: {
				max: 3,
				min: 1,
				labels: {
					formatter: function () {
						return Labels[this.value];
					}
				},
			},
			tooltip: {
				headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
				pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
					'<td style = "padding:0"><b>{point.y:.1f} </b></td></tr>', footerFormat: '</table>', shared: true, useHTML: true
			},
			plotOptions: {
				column: {
					pointPadding: 0.2,
					borderWidth: 0
				}

			},
			series: [
				{
					name: this.model.key_text26,
					data: [monthdata.weekr1.fq, monthdata.weekr2.fq, monthdata.weekr3.fq, monthdata.weekr4.fq],
					type: undefined,
					color: '#15c9bc'
				},
				{
					name: this.model.key_text27,
					data: [monthdata.weekr1.pac, monthdata.weekr2.pac, monthdata.weekr3.pac, monthdata.weekr4.pac],
					type: undefined,
					color: '#31a39b'
				},
				{
					name: this.model.key_text28,
					data: [monthdata.weekr1.beh, monthdata.weekr2.beh, monthdata.weekr3.beh, monthdata.weekr4.beh],
					type: undefined,
					color: '#3c918b'
				},
				{
					name: this.model.key_text35,
					data: [Average.week1 / 3, Average.week2 / 3, Average.week3 / 3, Average.week4 / 3],
					type: undefined,
					color: '#42726f'


				}]
		})
		setTimeout(function () { myChart.reflow(); }, 1000);
	}


	state() {
		console.log("Change STATE");
		$('#activity_normal_content').css('display', 'none');
		$('#activity_normal_spinner').css('display', 'block');
		if ($('input[name=switch-one]:checked', '#myForm').val() == "no") {
			$('#u_week_blessing_div').css('display', 'none');
			$('#u_month_blessing_div').css('display', 'block');
			this.graphstate = 'month';
			this.monthly_donation_graph();
			this.monthly_pieChart();
		} else if ($('input[name=switch-one]:checked', '#myForm').val() == "yes") {
			$('#u_month_blessing_div').css('display', 'none');
			$('#u_week_blessing_div').css('display', 'block');
			this.graphstate = 'week';
			this.weekly_donation_graph();
			this.weekly_pieChart();
		}
	}

	weekly_pieChart() {
		setTimeout(function () {
			$('#activity_normal_spinner').css('display', 'none');
			$('#activity_normal_content').css('display', 'block');
		}, 100);
		var curr = new Date;
		var firstday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 1));
		var lastday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 7));
		var startDate = this.format(firstday, 'yyyy-MM-dd');
		var endDate = this.format(lastday, 'yyyy-MM-dd');
		var data = JSON.stringify({ 'startDate': startDate, 'endDate': endDate, 'user_id': this.model.user_id });
		this.fetch.food_quality_weekly(data).subscribe(res => {
			this.foodweeklydata = res;
			this.model.excellent_cnt = res['excellent']['cnt'];
			this.model.good_cnt = res.good.cnt;
			this.model.bad_cnt = res.bad.cnt;
			if (this.model.excellent_cnt > this.model.good_cnt && this.model.excellent_cnt > this.model.bad_cnt) {
				this.model.quality_rating = this.model.key_text29;
			} else if (this.model.good_cnt > this.model.excellent_cnt && this.model.good_cnt > this.model.bad_cnt) {
				this.model.quality_rating = this.model.key_text30;
			} else if (this.model.bad_cnt > this.model.excellent_cnt && this.model.bad_cnt > this.model.good_cnt) {
				this.model.quality_rating = this.model.key_text31;
			}
			this.graph_weekly_food_quality();
			this.graph_monthly_food_quality();
			//this.pie_chart_food_quality(this.model.excellent_cnt, this.model.good_cnt, this.model.bad_cnt);
		});
		this.fetch.weekly_packaging(this.model.user_id).subscribe(res => {
			this.model.excellent_cnt = res['excellent']['cnt'];
			this.model.good_cnt = res.good.cnt;
			this.model.bad_cnt = res.bad.cnt;
			if (this.model.excellent_cnt > this.model.good_cnt && this.model.excellent_cnt > this.model.bad_cnt) {
				this.model.packaging_rating = this.model.key_text29;
			} else if (this.model.good_cnt > this.model.excellent_cnt && this.model.good_cnt > this.model.bad_cnt) {
				this.model.packaging_rating = this.model.key_text30;
			} else if (this.model.bad_cnt > this.model.excellent_cnt && this.model.bad_cnt > this.model.good_cnt) {
				this.model.packaging_rating = this.model.key_text31;
			}
			//this.packagingPieChart(this.model.excellent_cnt, this.model.good_cnt, this.model.bad_cnt);
		});
		this.fetch.weekly_behaviour(this.model.user_id).subscribe(res => {
			this.model.excellent_cnt = res['excellent']['cnt'];
			this.model.good_cnt = res.good.cnt;
			this.model.bad_cnt = res.bad.cnt;
			if (this.model.excellent_cnt > this.model.good_cnt && this.model.excellent_cnt > this.model.bad_cnt) {
				this.model.behaviour_rating = this.model.key_text29;
			} else if (this.model.good_cnt > this.model.excellent_cnt && this.model.good_cnt > this.model.bad_cnt) {
				this.model.behaviour_rating = this.model.key_text30;
			} else if (this.model.bad_cnt > this.model.excellent_cnt && this.model.bad_cnt > this.model.good_cnt) {
				this.model.behaviour_rating = this.model.key_text31;
			}
			//	this.behaviourPieChart(this.model.excellent_cnt, this.model.good_cnt, this.model.bad_cnt);
		});
	}

	monthly_pieChart() {
		setTimeout(function () {
			$('#activity_normal_spinner').css('display', 'none');
			$('#activity_normal_content').css('display', 'block');
		}, 100);
		this.fetch.monthly_food_quality(this.model.user_id).subscribe(res => {
			this.model.excellent_cnt = res['excellent']['cnt'];
			this.model.good_cnt = res.good.cnt;
			this.model.bad_cnt = res.bad.cnt;
			if (this.model.excellent_cnt > this.model.good_cnt && this.model.excellent_cnt > this.model.bad_cnt) {
				this.model.quality_rating = this.model.key_text29;
			} else if (this.model.good_cnt > this.model.excellent_cnt && this.model.good_cnt > this.model.bad_cnt) {
				this.model.quality_rating = this.model.key_text30;
			} else if (this.model.bad_cnt > this.model.excellent_cnt && this.model.bad_cnt > this.model.good_cnt) {
				this.model.quality_rating = this.model.key_text31;
			}
			this.graph_weekly_food_quality();
			this.graph_monthly_food_quality();
			//	this.pie_chart_food_quality(this.model.excellent_cnt, this.model.good_cnt, this.model.bad_cnt);
		});
		this.fetch.monthly_packaging(this.model.user_id).subscribe(res => {
			this.model.excellent_cnt = res['excellent']['cnt'];
			this.model.good_cnt = res.good.cnt;
			this.model.bad_cnt = res.bad.cnt;
			if (this.model.excellent_cnt > this.model.good_cnt && this.model.excellent_cnt > this.model.bad_cnt) {
				this.model.packaging_rating = this.model.key_text29;
			} else if (this.model.good_cnt > this.model.excellent_cnt && this.model.good_cnt > this.model.bad_cnt) {
				this.model.packaging_rating = this.model.key_text30;
			} else if (this.model.bad_cnt > this.model.excellent_cnt && this.model.bad_cnt > this.model.good_cnt) {
				this.model.packaging_rating = this.model.key_text31;
			}
			//this.packagingPieChart(this.model.excellent_cnt, this.model.good_cnt, this.model.bad_cnt);
		});
		this.fetch.monthly_behaviour(this.model.user_id).subscribe(res => {
			this.model.excellent_cnt = res['excellent']['cnt'];
			this.model.good_cnt = res.good.cnt;
			this.model.bad_cnt = res.bad.cnt;
			if (this.model.excellent_cnt > this.model.good_cnt && this.model.excellent_cnt > this.model.bad_cnt) {
				this.model.behaviour_rating = this.model.key_text29;
			} else if (this.model.good_cnt > this.model.excellent_cnt && this.model.good_cnt > this.model.bad_cnt) {
				this.model.behaviour_rating = this.model.key_text30;
			} else if (this.model.bad_cnt > this.model.excellent_cnt && this.model.bad_cnt > this.model.good_cnt) {
				this.model.behaviour_rating = this.model.key_text31;
			}
			//	this.behaviourPieChart(this.model.excellent_cnt, this.model.good_cnt, this.model.bad_cnt);

		});
	}

	getFeedback() {
		this.fetch.show_feedback(this.model.user_id).subscribe(res => {
			if (this.tabValue = 'donor') {
				this.model.feedback_data = res.donee_feedback;
				console.log(res.donee_feedback);
			} else {
				this.model.feedback_data = res.donor_feedback;
				console.log(res.donee_feedback);
			}
		});
	}

	cancelPickup(x, source: 'donor' | 'receiver') {
		if (!this.canCancelPickup(x)) {
			this.showErrorAlert('Cancel is only available before a rider is assigned.');
			return;
		}

		this.alertController.create({
			header: 'Cancel Pickup',
			message: 'You can cancel only before the rider arrives. Are you sure you want to cancel?',
			buttons: [
				{
					text: 'No',
					role: 'cancel'
				},
				{
					text: 'Yes, Cancel',
					handler: () => {
						$('#add_location_spinner').show();
						const completeCancellation = () => {
							this.cancelBackendAllotment(x, source).subscribe(() => {
								this.finalizePickupCancellation(
									x,
									source,
									'Pickup cancelled successfully.'
								);
							}, () => {
								$('#add_location_spinner').hide();
								this.showErrorAlert('Could not cancel the pickup. Please try again.');
							});
						};

						if (x.borzo_order_id) {
							this.fetch.cancelBorzoOrder({ order_id: x.borzo_order_id }).subscribe(() => {
								completeCancellation();
							}, () => {
								// Still cancel backend allotment if Borzo cancel fails.
								completeCancellation();
							});
						} else {
							completeCancellation();
						}
						return true;
					}
				}
			]
		}).then(a => a.present());
	}

	trackPickup(x) {
		if (!this.canTrackPickup(x)) {
			this.alertController.create({
				header: 'Waiting for rider',
				message: 'A rider has not been assigned yet. Please check Activity again shortly.',
				buttons: ['OK']
			}).then(a => a.present());
			return;
		}
		if (x.tracking_url) {
			window.open(x.tracking_url, '_blank');
		}
	}

}
