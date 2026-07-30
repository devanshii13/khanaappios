import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FetchService } from '../fetch.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { StorageService } from '../storage.service';
import { AlertController, ModalController } from '@ionic/angular';
import { DonateFoodContentPage } from '../modal/donate-food-content/donate-food-content.page';

@Component({
  selector: 'app-searching-volunteer',
  templateUrl: './searching-volunteer.page.html',
  styleUrls: ['./searching-volunteer.page.scss'],
})
export class SearchingVolunteerPage implements OnInit {
  model: any = {};
  tracking: any;
  tracking_timer: any;
  searchTimedOut = false;
  veg_food: any;
  nonveg_food: any;
  borzoBooking = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private fetch: FetchService,
    private storage: StorageService,
    public alertController: AlertController,
    public modalController: ModalController,
  ) {
    var self = this;
    this.tracking_timer = setTimeout(function () { self.handleSearchTimeout(); }, 30000);
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    var lang_code = JSON.parse(localStorage.getItem('lang'));
    let res = this.storage.getScope();
    let item1 = res.find(i => i.key_text === 'SEARCHING_DONEE_NEAR_YOU');
    this.model.key_text1 = item1[lang_code];
    this.model.is_third_party = localStorage.getItem('volunteer_match_third_party') === '1';
    if (this.model.is_third_party) {
      this.model.key_text1 = 'Searching for nearest volunteer for Khanaa delivery...';
      this.model.key_text2 = 'A Khanaa delivery partner will pick up food once a volunteer is matched.';
    }
    var id = parseInt(this.route.snapshot.params['id']);
    var id2 = parseInt(this.route.snapshot.params['id2']);
    this.model.veg = id;
    this.model.nonveg = id2;
    this.loadFoodDetails();
  }

  ionViewDidEnter() {
    this.startTrackingLoop();
  }

  ionViewWillLeave() {
    this.stopTrackingLoop();
  }

  loadFoodDetails() {
    if (this.model.veg && this.model.veg !== 0) {
      this.fetch.reviewFood(this.model.veg).subscribe(res => {
        this.veg_food = res?.data;
      });
    }
    if (this.model.nonveg && this.model.nonveg !== 0) {
      this.fetch.reviewFood(this.model.nonveg).subscribe(res => {
        this.nonveg_food = res?.data;
      });
    }
  }

  startTrackingLoop() {
    this.tracking = setInterval(() => {
      this.checkVolunteer();
    }, 1000);
  }

  stopTrackingLoop() {
    clearInterval(this.tracking);
    clearTimeout(this.tracking_timer);
    this.tracking = null;
  }

  handleSearchTimeout() {
    if (this.searchTimedOut) {
      return;
    }
    this.searchTimedOut = true;
    this.stopTrackingLoop();
    this.clearVolunteerMatchContext();
    this.router.navigate(['/screen-after-volunteer-not-found', this.model.veg, this.model.nonveg]);
  }

  buildPollFormData() {
    const formData: any = new FormData();
    formData.append('id', this.model.veg);
    formData.append('id2', this.model.nonveg);

    const storedAddress = localStorage.getItem('volunteer_match_donate_address');
    if (storedAddress) {
      formData.append('donate_address', storedAddress);
    }

    return formData;
  }

  publishDonationLocation(onComplete: () => void) {
    const storedAddress = localStorage.getItem('volunteer_match_donate_address');
    if (!storedAddress || localStorage.getItem('volunteer_match_pending_publish') !== '1') {
      onComplete();
      return;
    }

    const isThirdParty = localStorage.getItem('volunteer_match_third_party') === '1';
    const formData: any = new FormData();
    formData.append('id', this.model.veg);
    formData.append('id2', this.model.nonveg);
    formData.append('donate_address', storedAddress);
    formData.append('pickup_required', isThirdParty ? '1' : '0');
    formData.append('third_party', isThirdParty ? '1' : '0');

    this.fetch.donate_food_location_new(formData).subscribe(
      () => onComplete(),
      () => onComplete()
    );
  }

  clearVolunteerMatchContext() {
    localStorage.removeItem('volunteer_match_donate_food_id');
    localStorage.removeItem('volunteer_match_donate_address');
    localStorage.removeItem('volunteer_match_food_ids');
    localStorage.removeItem('volunteer_match_pending_publish');
    localStorage.removeItem('volunteer_match_third_party');
  }

  checkVolunteer() {
    const formData = this.buildPollFormData();
    this.fetch.checkVolunteerAcceptRequest(formData).subscribe(res => {
      console.log(res);
      if (res && res['success'] == true) {
        this.searchTimedOut = true;
        this.stopTrackingLoop();
        const isThirdParty = localStorage.getItem('volunteer_match_third_party') === '1';
        this.publishDonationLocation(() => {
          if (isThirdParty) {
            this.handleThirdPartyVolunteerAccepted(res['data']);
          } else {
            this.clearVolunteerMatchContext();
            this.router.navigate(['/display-accept-request-on-map', JSON.stringify(res['data']), this.model.veg, this.model.nonveg]);
          }
        });
      } else {
        console.error('Response is null or unsuccessful:', res);
      }
    }, err => {
      console.error('HTTP Error:', err);
    });
  }

  handleThirdPartyVolunteerAccepted(matchData: any) {
    const donorAddress = localStorage.getItem('volunteer_match_donate_address');
    this.model.key_text1 = 'Volunteer matched! Booking Khanaa pickup...';
    this.model.key_text2 = 'Please wait while we arrange a delivery partner.';
    this.borzoBooking = true;
    this.createBorzoForVolunteerMatch(matchData, donorAddress, (borzoSuccess) => {
      this.borzoBooking = false;
      this.clearVolunteerMatchContext();
      if (borzoSuccess) {
        this.openDonationSuccessModal(matchData);
      } else {
        this.showBorzoFailureAlert();
      }
    });
  }

  createBorzoForVolunteerMatch(matchData: any, storedAddress: string | null, onComplete: (success: boolean) => void) {
    const donorDetails = matchData?.donor_details || {};
    let donorLocation = donorDetails;
    if (storedAddress) {
      try {
        donorLocation = { ...donorDetails, ...JSON.parse(storedAddress) };
      } catch (e) {
        donorLocation = donorDetails;
      }
    }

    const donateFoodId = donorDetails.id || this.model.veg || this.model.nonveg;
    const donorId = donorDetails.app_user_id || donorLocation.app_user_id || JSON.parse(localStorage.getItem('user_id'));
    const receiverId = matchData.app_user_id || matchData.receiver_id;
    const noOfPerson = matchData.no_of_person || localStorage.getItem('temp_total_food') || 1;
    const foodType = donorDetails.food_type || this.veg_food?.food_type || this.nonveg_food?.food_type;

    if (!donorId || !receiverId) {
      console.error('[Borzo] Missing donor or receiver id for volunteer match');
      onComplete(false);
      return;
    }

    const dropLat = matchData.latitude || matchData.receiver_latitude;
    const dropLng = matchData.longitude || matchData.receiver_longitude;
    const dropAddress = matchData.colony_name || matchData.receiver_colony_name;

    if (!dropLat || !dropLng || !dropAddress) {
      console.error('[Borzo] Missing volunteer drop location for auto-match', matchData);
      onComplete(false);
      return;
    }

    this.fetch.profile(JSON.stringify({ id: donorId })).subscribe(donorProfile => {
      this.fetch.profile(JSON.stringify({ id: receiverId })).subscribe(receiverProfile => {
        const donorPhone = this.formatPhone(donorProfile['mobile_no']);
        const receiverPhone = this.formatPhone(receiverProfile['mobile_no']);

        if (!donorPhone || !receiverPhone) {
          console.error('[Borzo] Missing phone numbers for volunteer match', { donorPhone, receiverPhone });
          onComplete(false);
          return;
        }

        const itemName = (foodType == 1 || foodType == 3) ? 'Veg Food' : 'Non-Veg Food';
        const borzoOrderData = {
          donate_food_id: donateFoodId,
          donor_id: donorId,
          pickup_address: donorLocation.colony_name || '',
          pickup_name: donorProfile['username'] || donorLocation.username || 'Donor',
          pickup_phone: donorPhone,
          drop_address: dropAddress,
          drop_name: receiverProfile['username'] || matchData.username || 'Volunteer',
          drop_phone: receiverPhone,
          pickup_city: donorLocation.city || '',
          pickup_state: donorLocation.state || '',
          pickup_pincode: donorLocation.postalCode || donorLocation.postal_code || '',
          pickup_lat: donorLocation.latitude || donorDetails.latitude,
          pickup_lng: donorLocation.longitude || donorDetails.longitude,
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
              food_id: donateFoodId,
              logged_in_user: donorProfile['username'] || 'Donor',
              no_of_person: noOfPerson,
              app_user_id: donorId,
              food_type: foodType,
              notification_type: 1,
              to: donorId,
              from: receiverId,
              message: "Wait for a rider! We've booked a pickup. Please pack your food properly. Check Activity for pickup updates."
            });
            this.fetch.collect_food_noti_to_donor(notifyData).subscribe();
            onComplete(true);
          } else {
            console.error('[Borzo] create-order failed:', orderRes);
            onComplete(false);
          }
        }, err => {
          console.error('[Borzo] create-order error:', err);
          onComplete(false);
        });
      }, () => onComplete(false));
    }, () => onComplete(false));
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

  async showBorzoFailureAlert() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class custom_alert_1',
      header: 'Pickup booking failed',
      message: 'We matched a volunteer but could not book Khanaa delivery right now. Please try again or choose to drop the food yourself.',
      buttons: ['OK']
    });
    await alert.present();
    await alert.onDidDismiss();
    this.router.navigate(['/home']);
  }

  async openDonationSuccessModal(matchData: any) {
    const matchedName = matchData?.username
      || matchData?.receiver_name
      || matchData?.food_receiver_name
      || '';

    const modal = await this.modalController.create({
      component: DonateFoodContentPage,
      cssClass: 'custom_donate_food_modal',
      componentProps: {
        paramID: 123,
        paramTitle: 'Test Title',
        veg: this.model.veg,
        nonveg: this.model.nonveg,
        veg_food: this.veg_food,
        nonveg_food: this.nonveg_food,
        pickup_required: true,
        receiver_matched: true,
        matched_receiver_name: matchedName
      }
    });

    modal.onDidDismiss().then(() => {
      localStorage.removeItem('donate_address_type');
      localStorage.removeItem('set_confirm_location_route');
      localStorage.removeItem('donor_location');
      this.router.navigate(['/home']);
    });

    await modal.present();
  }
}
