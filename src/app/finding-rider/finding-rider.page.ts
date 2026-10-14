import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { FetchService } from '../fetch.service';

const RIDER_WAIT_MS = 15 * 60 * 1000;
const WAIT_UNTIL_KEY = 'borzo_rider_wait_until';
const WAIT_FOOD_KEY = 'borzo_rider_wait_food_id';

@Component({
  selector: 'app-finding-rider',
  templateUrl: './finding-rider.page.html',
  styleUrls: ['./finding-rider.page.scss'],
})
export class FindingRiderPage implements OnInit {

  private pollingTimer: any;
  private searchTimeoutTimer: any;
  private consecutiveErrors = 0;
  private readonly maxConsecutiveErrors = 5;
  private navigatingAway = false;
  private searchTimedOut = false;
  /** Remember first poll so we only move after a real false -> true transition when possible. */
  private sawUnassigned = false;

  statusText = 'Finding a pickup rider. This may take a few minutes.';
  activityHint = 'Please wait here until a rider is assigned.';

  food_id: any;
  r_lat: any;
  r_lon: any;
  r_id: any;
  mode: any;
  food_type: any;
  getfood_id: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fetch: FetchService,
    private alertController: AlertController
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.food_id = this.route.snapshot.params['id'];
    this.r_lat = this.route.snapshot.params['lat'];
    this.r_lon = this.route.snapshot.params['lon'];
    this.r_id = this.route.snapshot.params['r_id'];
    this.mode = this.route.snapshot.params['mode'];
    this.food_type = this.route.snapshot.params['food_type'];
    this.getfood_id = this.route.snapshot.params['getfoodid'];
    this.consecutiveErrors = 0;
    this.navigatingAway = false;
    this.searchTimedOut = false;
    this.sawUnassigned = false;
    this.statusText = 'Finding a pickup rider. This may take a few minutes.';
    this.activityHint = 'Please wait here until a rider is assigned.';
  }

  ionViewDidEnter() {
    this.startPolling();
    this.startSearchTimeout();
  }

  ionViewWillLeave() {
    this.stopPolling();
    this.clearSearchTimeout();
    // Keep wait deadline in localStorage so Activity can still cancel at 5 min.
  }

  /** Start (or reuse) the 5-minute wait clock from first finding-rider open / order create. */
  private ensureRiderWaitDeadline(): number {
    const existingFood = localStorage.getItem(WAIT_FOOD_KEY);
    const existingUntil = localStorage.getItem(WAIT_UNTIL_KEY);
    if (existingFood === String(this.food_id) && existingUntil) {
      const parsed = parseInt(existingUntil, 10);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    const until = Date.now() + RIDER_WAIT_MS;
    localStorage.setItem(WAIT_UNTIL_KEY, String(until));
    localStorage.setItem(WAIT_FOOD_KEY, String(this.food_id));
    return until;
  }

  private clearRiderWaitDeadline() {
    localStorage.removeItem(WAIT_UNTIL_KEY);
    localStorage.removeItem(WAIT_FOOD_KEY);
  }

  startPolling() {
    this.stopPolling();
    this.checkRiderAssigned();
    this.pollingTimer = setInterval(() => {
      this.checkRiderAssigned();
    }, 3000);
  }

  stopPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  startSearchTimeout() {
    this.clearSearchTimeout();
    const until = this.ensureRiderWaitDeadline();
    const remaining = Math.max(0, until - Date.now());
    this.searchTimeoutTimer = setTimeout(() => {
      this.handleSearchTimeout();
    }, remaining);
  }

  clearSearchTimeout() {
    if (this.searchTimeoutTimer) {
      clearTimeout(this.searchTimeoutTimer);
      this.searchTimeoutTimer = null;
    }
  }

  /**
   * After 5 minutes with no rider: cancel Borzo + allotment from the app (no cron needed).
   */
  handleSearchTimeout() {
    if (this.searchTimedOut || this.navigatingAway) {
      return;
    }

    this.searchTimedOut = true;
    this.navigatingAway = true;
    this.stopPolling();
    this.clearSearchTimeout();
    this.statusText = 'No rider found. Cancelling pickup...';
    this.activityHint = 'Please wait a moment.';

    const borzoOrderId = localStorage.getItem('borzo_order_id');
    const finish = () => this.finishTimeoutCancellation();

    const cancelBackendAllotment = () => {
      if (!this.getfood_id) {
        finish();
        return;
      }

      const data = JSON.stringify({
        id: this.getfood_id,
        reason: 'No rider assigned within time limit',
        comment: 'Auto cancelled after timeout'
      });

      this.fetch.get_food_cancel_alloted_request(data).subscribe(
        () => finish(),
        () => finish()
      );
    };

    if (borzoOrderId) {
      this.fetch.cancelBorzoOrder({
        order_id: borzoOrderId,
        reason: 'No rider assigned within time limit',
        comment: 'Auto cancelled after timeout'
      }).subscribe(
        () => cancelBackendAllotment(),
        () => cancelBackendAllotment()
      );
    } else {
      cancelBackendAllotment();
    }
  }

  private clearPickupLocalState() {
    localStorage.removeItem('borzo_order_id');
    localStorage.removeItem('borzo_order_name');
    localStorage.removeItem('borzo_tracking_url');
    localStorage.removeItem('borzo_delivery_fee');
    localStorage.removeItem('borzo_payment_amount');
    localStorage.removeItem('borzo_status');
    localStorage.removeItem('pickup_required');
    localStorage.removeItem('rider_assigned_food_id');
    this.clearRiderWaitDeadline();
  }

  private async finishTimeoutCancellation() {
    this.clearPickupLocalState();
    const alert = await this.alertController.create({
      header: 'No rider found',
      message: 'We could not assign a pickup rider in time. Your request has been cancelled. Please try again from Activity or Home.',
      buttons: ['OK']
    });
    await alert.present();
    await alert.onDidDismiss();
    this.navigateToActivity();
  }

  private isBorzoCancelled(res: any): boolean {
    const status = (res?.order?.status || res?.order?.status_description || res?.status || '').toString().toLowerCase();
    return !!(res?.is_cancelled || res?.order?.is_cancelled || status.includes('cancel'));
  }

  private getOrderStatus(res: any): string {
    return (res?.order?.status || res?.order?.status_description || res?.status || '').toString().toLowerCase().trim();
  }

  private hasCourierAssignedFlag(res: any): boolean {
    return res?.courier_assigned === true
      || res?.courier_assigned === 1
      || res?.courier_assigned === '1'
      || res?.order?.courier_assigned === true
      || res?.order?.courier_assigned === 1
      || res?.order?.courier_assigned === '1';
  }

  private hasAssignedStatus(status: string): boolean {
    if (!status) {
      return false;
    }
    return status.includes('courier_assigned')
      || status.includes('courier assigned')
      || status.includes('assigned')
      || status === 'active'
      || status === 'available'
      || status === 'accepted'
      || status.includes('at_pickup')
      || status.includes('at pickup')
      || status.includes('picked_up')
      || status.includes('pickuped')
      || status.includes('delivering')
      || status.includes('on_way')
      || status.includes('on way')
      || status.includes('arrived')
      || status.includes('parcel')
      || status.includes('courier_at')
      || status.includes('departed');
  }

  /**
   * Backend/staging often keeps order.status = "new" even after a rider is assigned.
   * The reliable signal is courier_assigned flipping to true.
   */
  private isCourierAssigned(res: any): boolean {
    if (!res?.success || !res?.is_borzo) {
      return false;
    }

    if (this.hasCourierAssignedFlag(res)) {
      return true;
    }

    return this.hasAssignedStatus(this.getOrderStatus(res));
  }

  checkRiderAssigned() {
    if (!this.food_id || this.navigatingAway || this.searchTimedOut) {
      return;
    }

    this.fetch.getBorzoOrderDetails(this.food_id).subscribe(res => {
      if (this.navigatingAway || this.searchTimedOut) {
        return;
      }

      this.consecutiveErrors = 0;
      const status = this.getOrderStatus(res);
      const assigned = this.isCourierAssigned(res);
      console.log('[FindingRider] Borzo order details:', {
        courier_assigned: res?.courier_assigned,
        status,
        assigned,
        sawUnassigned: this.sawUnassigned,
        order: res?.order
      });

      if (res && res.success && res.is_borzo) {
        if (this.isBorzoCancelled(res)) {
          this.navigatingAway = true;
          this.statusText = 'Pickup was cancelled. Check Activity for updates.';
          this.stopPolling();
          this.clearSearchTimeout();
          this.navigateToActivity();
          return;
        }

        if (!assigned) {
          this.sawUnassigned = true;
          this.statusText = 'Finding a pickup rider. This may take a few minutes.';
          return;
        }

        // courier_assigned became true (or status clearly assigned) → go to Page 2.
        this.navigatingAway = true;
        this.statusText = 'Rider assigned. Opening your pickup details...';
        this.stopPolling();
        this.clearSearchTimeout();
        this.clearRiderWaitDeadline();
        this.notifyCounterpartRiderAssigned(res);
        this.navigateToNextPage();
        return;
      }

      this.statusText = 'Booking your pickup. Looking for a rider...';
    }, err => {
      console.error('[FindingRider] Error polling Borzo:', err);
      if (this.navigatingAway || this.searchTimedOut) {
        return;
      }
      this.consecutiveErrors += 1;
      if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
        this.statusText = 'Still finding a rider. Please keep this screen open.';
      }
    });
  }

  goToActivity() {
    if (this.navigatingAway) {
      return;
    }
    this.navigatingAway = true;
    this.stopPolling();
    this.clearSearchTimeout();
    this.navigateToActivity();
  }

  navigateToActivity() {
    this.router.navigate(['/activity-normal']);
  }

  private notifyCounterpartRiderAssigned(res: any) {
    if (!this.r_id || !this.food_id) {
      return;
    }
    const riderName = res?.order?.courier_name || 'A Borzo rider';
    const riderPhone = res?.order?.courier_phone ? ` (Phone: ${res.order.courier_phone})` : '';
    const message = `Rider Assigned! ${riderName}${riderPhone} has been assigned to pick up donation #${this.food_id}.`;
    const currentUserId = localStorage.getItem('user_id');

    const notifyData = JSON.stringify({
      food_id: this.food_id,
      logged_in_user: localStorage.getItem('username') || '',
      no_of_person: 0,
      app_user_id: currentUserId,
      food_type: this.food_type || 1,
      notification_type: 6,
      to: this.r_id,
      from: currentUserId,
      getFoodId: this.getfood_id,
      message: message,
      notification_message: message
    });
    this.fetch.notify_donar(notifyData).subscribe();
  }

  navigateToNextPage() {
    // Mark so Page-2 gate knows Finding Rider already confirmed assignment.
    localStorage.setItem('rider_assigned_food_id', String(this.food_id));
    this.router.navigate([
      '/get-food-nearest-donors-two-duplicate',
      this.food_id,
      this.r_lat,
      this.r_lon,
      this.r_id,
      this.mode,
      this.food_type,
      this.getfood_id
    ], { replaceUrl: true });
  }
}
