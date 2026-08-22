import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { FetchService } from '../fetch.service';
import { StorageService } from '../storage.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { CommonSearchScreenPage } from '../common-search-screen/common-search-screen.page';
import { OnTheWayPage } from '../modal/on-the-way/on-the-way.page';
import { OntheWayMsgPage } from '../modal/onthe-way-msg/onthe-way-msg.page';
import { CurrentLocationContentPage } from '../modal/current-location-content/current-location-content.page';
declare var google: any;
@Component({
  selector: 'app-search-food-screen-two',
  templateUrl: './search-food-screen-two.page.html',
  styleUrls: ['./search-food-screen-two.page.scss'],
})
export class SearchFoodScreenTwoPage implements OnInit {
  @ViewChild('map') mapElement: ElementRef;
  div1;
  div2;
  model: any = {};
  notification: any = [];
  dataReturned: any;
  alert_text: any;
  donate_address: any;
  location_data: any;
  data: any = [];
  ontheway_data: any;
  search_type: string = '';
  map: any;
  marker: any;
  options: GeolocationOptions;
  geoencoderOptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5
  };
  private geocodeRequestId = 0;
  constructor(
    private router: Router,
    private fetch: FetchService,
    private storage: StorageService,
    public alertController: AlertController,
    public modalController: ModalController,
    private geolocation: Geolocation,
    private zone: NgZone
  ) { }

  ngOnInit() {
    this.model.show_map = false;
    this.model.location_selected = false;
    this.model.pickup_required = false;
    this.model.delivery_method = 'self';
    this.model.delivery_available = false;
    this.model.delivery_enabled = false;
    this.model.coverage_range = null;
    this.model.slots = [];
    this.model.availability_msg = '';
  }
  ionViewWillEnter() {
    this.model.click = false;
    this.model.postalCode = 0;
    this.model.is_volunteer = 0;
    if (localStorage.getItem('volunteer_approve') != null) {
      this.model.is_volunteer = localStorage.getItem('volunteer_approve');
    }
    this.model.user_id = localStorage.getItem('user_id');
    this.model.okay = 'okay';
    var lang_code = JSON.parse(localStorage.getItem('lang'));
    let res = this.storage.getScope();
    let item1 = res.find(i => i.key_text === 'NEARBY');
    this.model.key_text1 = item1[lang_code];
    let item2 = res.find(i => i.key_text === 'ON_THE_WAY');
    this.model.key_text2 = item2[lang_code];
    let alert_text = res.find(i => i.key_text === 'KEEP_PIN_EXACT_LOCATION');
    this.alert_text = alert_text[lang_code];
    let item5 = res.find(i => i.key_text === 'HOME');
    this.model.key_text5 = item5[lang_code];
    let item6 = res.find(i => i.key_text === 'ACTIVITY');
    this.model.key_text6 = item6[lang_code];
    let item7 = res.find(i => i.key_text === 'VOLUNTEER');
    this.model.key_text7 = item7[lang_code];
    this.geoCode(localStorage.getItem('nearby_lat'), localStorage.getItem('nearby_lng'));

    if (this.search_type == 'nearby') {
      let item1 = res.find(i => i.key_text === 'GET_SEARCH_PAGE_NEAR_1');
      this.model.key_text8 = item1[lang_code];
    }
    if (this.search_type == 'ontheway') {
      let item1 = res.find(i => i.key_text === 'GET_SEARCH_PAGE_ONTHEWAY_1');
      this.model.key_text8 = item1[lang_code];
    }

  }

  confirm_process() {
    if (this.model.show_map) {
      this.confirmLocation();
    } else if (this.model.location_selected) {
      this.search_food_final();
    }
  }

  confirmLocation() {
    if (this.model.pincode) {
      this.model.show_map = false;
      this.model.location_selected = true;
      this.checkAvailability(this.model.pincode);
    } else {
      this.alertController.create({
        message: "Please select a location on the map.",
        buttons: ['OK']
      }).then(alert => alert.present());
    }
  }

  selectDeliveryMethod(method: 'self' | 'delivery') {
    if (method === 'delivery' && !this.model.delivery_available) {
      if (this.model.availability_msg) {
        this.alertController.create({
          header: 'Delivery Not Available',
          message: this.model.availability_msg,
          buttons: ['OK']
        }).then(alert => alert.present());
      }
      return;
    }
    this.model.delivery_method = method;
    this.model.pickup_required = method === 'delivery';
  }

  /**
   * Keep user's chosen receive method in sync when they tap option cards before location check.
   */
  chooseReceiveMethod(method: 'self' | 'delivery') {
    this.model.delivery_method = method;
    this.model.pickup_required = method === 'delivery';
  }

  checkAvailability(pincode) {
    this.model.availability_checking = true;
    this.model.delivery_available = false;
    this.model.delivery_enabled = false;
    this.model.coverage_range = null;
    this.model.slots = [];
    this.model.availability_msg = '';
    this.model.delivery_charge_error = '';
    this.model.delivery_charges = null;

    let user_id = localStorage.getItem('user_id');
    try { user_id = JSON.parse(user_id); } catch (e) { /* keep raw value */ }

    let now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();
    let currentTime = (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);

    let data = {
      pincode: pincode,
      userID: user_id,
      type: 4, // Donee / receiver
      current_time: currentTime
    };

    this.fetch.check_availability(data).subscribe(res => {
      this.model.availability_checking = false;
      this.model.map_loading = false;

      const isSuccess = res && (res.success === true || res.status === true || res.success == 1 || res.status === 'success');
      if (isSuccess) {
        this.model.delivery_available = true;
        this.model.delivery_enabled = true;
        this.model.availability_msg = '';
        this.model.slots = res.slots || [];
        this.model.coverage_range = res.coverage_range;
        if (res.coverage_range != null && res.coverage_range !== '') {
          localStorage.setItem('coverage_range_km', String(res.coverage_range));
        }
        if (this.model.delivery_method === 'delivery' || this.model.pickup_required) {
          this.model.delivery_method = 'delivery';
          this.model.pickup_required = true;
        }
      } else {
        const apiMessage = (res && res.message) ? res.message : 'Service not available for this pincode.';
        this.handleDeliveryUnavailable(apiMessage, res);
      }
    }, () => {
      this.model.availability_checking = false;
      this.model.map_loading = false;
      this.handleDeliveryUnavailable(
        'Service not available for delivery at this location. You can continue with Self Pickup instead.'
      );
    });
  }

  /**
   * Inform the Donee before falling back to Self Pickup when third-party delivery is unavailable.
   */
  handleDeliveryUnavailable(message: string, res?: any) {
    this.model.delivery_available = false;
    this.model.delivery_enabled = false;
    this.model.slots = res?.slots || [];
    this.model.coverage_range = res?.coverage_range || null;

    const requestedDelivery = this.model.pickup_required || this.model.delivery_method === 'delivery';
    if (!requestedDelivery) {
      // User chose Self Pickup — delivery unavailability is not relevant to them.
      // Clear any message so no banner or alert is shown.
      this.model.availability_msg = '';
      this.model.delivery_method = 'self';
      this.model.pickup_required = false;
      return;
    }

    // User requested Delivery by Khanaa but it is unavailable — show message and switch.
    this.model.availability_msg = message;
    this.model.delivery_method = 'delivery';
    this.model.pickup_required = true;

    this.alertController.create({
      header: 'Delivery Not Available',
      message: message + ' Switching to Self Pickup.',
      buttons: [{
        text: 'OK',
        handler: () => {
          this.model.delivery_method = 'self';
          this.model.pickup_required = false;
          this.model.availability_msg = '';
        }
      }]
    }).then(alert => alert.present());
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

  /**
   * Parse Google Distance Matrix style distance into kilometers.
   * Supports { value: meters } or text like "1.8 km" / "800 m".
   */
  parseDistanceKm(distance: any): number | null {
    if (distance == null) {
      return null;
    }
    if (typeof distance === 'number' && !isNaN(distance)) {
      // Assume meters when large, else already km.
      return distance > 100 ? distance / 1000 : distance;
    }
    if (typeof distance === 'object') {
      if (typeof distance.value === 'number' && !isNaN(distance.value)) {
        return distance.value / 1000;
      }
      return this.parseDistanceKm(distance.text);
    }
    const text = String(distance).toLowerCase().trim();
    const match = text.match(/([\d.]+)\s*(km|m)?/);
    if (!match) {
      return null;
    }
    const value = parseFloat(match[1]);
    if (isNaN(value)) {
      return null;
    }
    if (match[2] === 'm') {
      return value / 1000;
    }
    return value;
  }

  getMatchDistanceKm(foodData: any): number | null {
    if (!foodData) {
      return null;
    }
    const walking = foodData.time_distance_walking?.rows?.[0]?.elements?.[0];
    const driving = foodData.time_distance_driving?.rows?.[0]?.elements?.[0];
    if (walking?.status === 'OK') {
      return this.parseDistanceKm(walking.distance);
    }
    if (driving?.status === 'OK') {
      return this.parseDistanceKm(driving.distance);
    }
    // Haversine fallback using donor lat/lng vs selected receiver location.
    const dLat = parseFloat(foodData.latitude);
    const dLng = parseFloat(foodData.longitude);
    const rLat = parseFloat(this.model.lat);
    const rLng = parseFloat(this.model.lon);
    if ([dLat, dLng, rLat, rLng].every((v) => !isNaN(v))) {
      return this.haversineKm(rLat, rLng, dLat, dLng);
    }
    return null;
  }

  haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (deg: number) => deg * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2))
      * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  isWithinCoverageRange(foodData: any): boolean {
    if (!this.model.pickup_required) {
      // Self Pickup: enforce a maximum distance of 10 km so distant users
      // (e.g. Hyderabad ↔ Gulbarga ~200 km) are never matched.
      const SELF_PICKUP_MAX_KM = 10;
      let distanceKm = this.getMatchDistanceKm(foodData);
      // If Google API returned no data (intercity routes often have no walking/driving result),
      // always fall back to Haversine straight-line distance.
      if (distanceKm == null) {
        const dLat = parseFloat(foodData?.latitude);
        const dLng = parseFloat(foodData?.longitude);
        const rLat = parseFloat(this.model.lat);
        const rLng = parseFloat(this.model.lon);
        if ([dLat, dLng, rLat, rLng].every((v) => !isNaN(v))) {
          distanceKm = this.haversineKm(rLat, rLng, dLat, dLng);
        }
      }
      if (distanceKm == null) {
        // Cannot determine distance and coords are missing — allow through; backend will catch it.
        return true;
      }
      return distanceKm <= SELF_PICKUP_MAX_KM;
    }
    // Delivery by Khanaa: Coverage Range from admin panel applies.
    const range = parseFloat(
      this.model.coverage_range != null
        ? this.model.coverage_range
        : localStorage.getItem('coverage_range_km')
    );
    if (isNaN(range) || range <= 0) {
      return true;
    }
    const distanceKm = this.getMatchDistanceKm(foodData);
    if (distanceKm == null) {
      return true;
    }
    // Small tolerance for rounding (1.8 should still fail for 1km).
    return distanceKm <= (range + 0.05);
  }

  search_food_final() {
    if (this.model.pickup_required && !this.model.delivery_available) {
      this.handleDeliveryUnavailable(
        this.model.availability_msg || 'Service not available for this pincode.'
      );
      return;
    }

    this.model.search = true;
    let data = JSON.stringify({
      'app_user_id': this.model.user_id,
      'food_type': localStorage.getItem('receiver_food_type'),
      'no_of_person': localStorage.getItem('number_of_person'),
      'latitude': this.model.lat,
      'longitude': this.model.lon,
      'colony_name': this.model.colony_name,
      'city': this.model.city,
      'state': this.model.state,
      'country': this.model.country,
      'postal_code': this.model.pincode,
      'third_party': this.model.pickup_required ? 1 : 0,
      'pickup_required': this.model.pickup_required ? 1 : 0
    });

    localStorage.setItem('pickup_required', this.model.pickup_required ? '1' : '0');
    localStorage.setItem('receiver_location', this.model.donor_location_data);
    if (this.model.coverage_range != null && this.model.coverage_range !== '') {
      localStorage.setItem('coverage_range_km', String(this.model.coverage_range));
    }

    this.fetch.receiver_food_details(data).subscribe(res => {
      this.model.search = false;
      const goNext = () => {
        const hasFood = res.data != null && res.data.total_food_for != 0;
        const withinRange = hasFood ? this.isWithinCoverageRange(res.data) : false;

        if (hasFood && withinRange) {
          this.data = res;
          this.router.navigate(['/get-food-nearest-donors', JSON.stringify(this.data), this.model.lat, this.model.lon, this.model.user_id, res.data.id, this.model.donor_location_data, '0']);
        } else {
          if (hasFood && !withinRange) {
            const range = this.model.coverage_range || localStorage.getItem('coverage_range_km') || '1';
            this.alertController.create({
              header: 'Outside coverage range',
              message: `No food found within ${range} km coverage range set for third-party pickup.`,
              buttons: ['OK']
            }).then(a => a.present());
          }
          this.data = { 'success': true, 'data': null };
          this.emptyMessage('nearby', JSON.parse(this.model.donor_location_data), this.model.user_id);
        }
      };

      if (this.model.pickup_required) {
        this.alertController.create({
          header: 'Request submitted',
          message: 'Please check the Activity section for pickup and delivery updates.',
          buttons: [{ text: 'OK', handler: () => goNext() }]
        }).then(a => a.present());
      } else {
        goNext();
      }
    }, error => {
      this.model.search = false;
    });
  }

  initMap() {
    this.model.pincode = null;
    this.model.map_loading = true;

    // Use cached coordinates if available, otherwise default to a relevant center (e.g., Ujjain)
    let cachedLat = localStorage.getItem('nearby_lat') ? parseFloat(localStorage.getItem('nearby_lat')) : 23.1765;
    let cachedLon = localStorage.getItem('nearby_lng') ? parseFloat(localStorage.getItem('nearby_lng')) : 75.7885;

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
      // Even if geolocation fails, map is already initialized with default/cache
      this.showAddress(this.model.lat, this.model.lon);
    });

    // Add click listener to map (will work even while loading real location)
    google.maps.event.addListener(this.map, 'click', (event) => {
      this.zone.run(() => {
        this.model.map_loading = true;
        this.marker.setPosition(event.latLng);
        this.model.lat = event.latLng.lat();
        this.model.lon = event.latLng.lng();
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
        this.model.map_loading = true;
        this.model.lat = this.marker.position.lat();
        this.model.lon = this.marker.position.lng();
        this.showAddress(this.model.lat, this.model.lon);
      });
    });
  }

  showAddress(lat, lon) {
    const requestId = ++this.geocodeRequestId;
    let latLng = new google.maps.LatLng(lat, lon);
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'latLng': latLng }, (results, status) => {
      if (requestId !== this.geocodeRequestId) {
        return;
      }
      this.zone.run(() => {
        this.model.map_loading = false;
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
            'latitude': this.model.lat, 'longitude': this.model.lon,
            'colony_name': this.model.colony_name, 'city': this.model.city,
            'state': this.model.state, 'country': this.model.country,
            'postalCode': this.model.pincode
          });
        }
      });
    });
  }

  async searchingModel(type) {

    const modal = await this.modalController.create({
      component: CommonSearchScreenPage,
      // cssClass: 'custom_filter_modal cancel_allot_food_popup',
      componentProps: {
        "type": type
      }
    });
    modal.onDidDismiss().then((dataReturned) => {

      if (dataReturned !== null) {
      }
    });

    return await modal.present();
  }

  async emptyMessage(type, onthewaydata, rid) {

    const modal = await this.modalController.create({
      component: OntheWayMsgPage,
      cssClass: 'custom_filter_modal empty_message_height',
      componentProps: {
        "type": type,
        "way": onthewaydata,
        "r_id": rid
      }
    });
    modal.onDidDismiss().then((dataReturned) => {

      if (dataReturned !== null) {
      }
    });

    return await modal.present();
  }


  async closeModal() {
    const onClosedData: string = '';
    await this.modalController.dismiss(onClosedData);
  }

  selectNearbyReceivedOption() {
    this.model.show_receive_method = true;
    this.model.pickup_required = false;
  }

  confirmReceiveMethod() {
    this.model.show_receive_method = false;
    this.openModalCurrentLocation();
  }

  async openModalCurrentLocation() {
    localStorage.setItem('set_confirm_location_route', JSON.stringify('get-food-search'));
    const modal = await this.modalController.create({
      component: CurrentLocationContentPage,
      cssClass: 'custom_current_location_modal_new',
      componentProps: {
        "paramID": 123,
        "paramTitle": "Test Title"
      }
    });

    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null && dataReturned.data) {
        this.dataReturned = dataReturned.data;
        this.location_data = JSON.parse(this.dataReturned);
        this.model.pincode = this.location_data.postalCode;
        this.model.city = this.location_data.city;
        this.model.lat = this.location_data.latitude;
        this.model.lon = this.location_data.longitude;
        this.model.colony_name = this.location_data.colony_name;
        this.model.donor_location_data = this.dataReturned;

        this.model.location_selected = true;
        this.model.show_map = false;

        this.checkAvailability(this.model.pincode);
      }
    });

    return await modal.present();
  }
  async openOnTheWay() {
    localStorage.setItem('set_confirm_location_route', JSON.stringify('get-food-search'));
    const modal = await this.modalController.create({
      component: OnTheWayPage,
      cssClass: 'custom_current_location_modal_new',
      componentProps: {
        "paramID": 123,
        "paramTitle": "Test Title"
      }
    });

    modal.onDidDismiss().then((dataReturned) => {
      console.log('data sdafadf', dataReturned);
      if (dataReturned !== null && dataReturned.data.length != 0) {
        // this.searchingModel('ontheway');
        this.search_type = 'ontheway';
        this.dataReturned = dataReturned.data;
        //alert('Modal Sent Data :'+ dataReturned);
        console.log(this.dataReturned);
        if (this.dataReturned.length > 0) {
          console.log(this.dataReturned);
          this.ontheway_data = this.dataReturned;

          if (this.ontheway_data.length > 0) {
            let data = JSON.stringify({ startLat: this.ontheway_data[0].startLat, startLng: this.ontheway_data[0].startLng, endLat: this.ontheway_data[0].endLat, endLng: this.ontheway_data[0].endLng, city: this.ontheway_data[0].city, choice: "receiver", 'app_user_id': this.model.user_id, 'food_type': localStorage.getItem('receiver_food_type'), 'no_of_person': localStorage.getItem('number_of_person') });
            this.fetch.get_waypoints(data).subscribe(res => {
              console.log('yes its working');
              this.search_type = 'ontheway';
              this.model.search = false;
              if (res.data != null && res.data.total_food_for != 0) {
                this.data = res;
                console.log("donar data", this.data);



                console.log("donar lat long:", this.data.data.latitude, this.data.data.longitude);
                console.log("start latlong:", this.ontheway_data[0].startLat, this.ontheway_data[0].startLng);
                console.log("end latlong:", this.ontheway_data[0].endLat, this.ontheway_data[0].endLng);


                var position = new google.maps.LatLng(this.data.data.latitude, this.data.data.longitude);
                console.log("path all points:", this.ontheway_data[0].pointarr);
                console.log("position:", position);

                const volcheck = google.maps.geometry.poly.isLocationOnEdge(position, new google.maps.Polyline({ path: this.ontheway_data[0].pointarr }), 0.0080)
                console.log("donar available:", volcheck);



                if (volcheck === true) {
                  //this.router.navigate(['/get-food-nearest-donors',JSON.stringify(this.data),this.location_data.latitude,this.location_data.longitude,this.model.user_id,res.data.id,JSON.stringify(this.location_data)]);
                  this.router.navigate(['/get-food-nearest-donors', JSON.stringify(this.data), this.ontheway_data[0].startLat, this.ontheway_data[0].startLng, this.model.user_id, res.data.id, JSON.stringify(this.ontheway_data), '1']);
                } else {

                  this.data = { 'success': true, 'data': null };
                  this.emptyMessage('ontheway', this.ontheway_data, this.model.user_id);
                }
              } else {
                this.data = { 'success': true, 'data': null };
                this.emptyMessage('ontheway', this.ontheway_data, this.model.user_id);
              }
              this.model.food_type = localStorage.getItem('receiver_food_type');
              this.model.no_of_person = localStorage.getItem('number_of_person');


            })
          }

        }
      }
    });

    return await modal.present();
  }




  //convert Address string to lat and long
  geoCode(lat: any, lng: any) {
    if (!lat || !lng) return;
    let geocoder = new google.maps.Geocoder();
    let latlng = new google.maps.LatLng(lat, lng);
    let request = { latLng: latlng };
    geocoder.geocode(request, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        var self = this;
        var address_components = results[0].address_components;
        address_components.forEach(function (val, i) {
          if (val.types[0] == "locality") {

            self.model.city = val.long_name;
          }
          if (val.types[0] == "administrative_area_level_1") {

            self.model.state = val.long_name;
          }
          if (val.types[0] == "country") {

            self.model.country = val.long_name;
          }
          if (val.types[0] == "postal_code") {

            self.model.postalCode = val.long_name;
          }

        });
        self.model.Lat = results[0].geometry.location.lat();
        self.model.Lng = results[0].geometry.location.lng();
        self.model.colony_name = results[0].formatted_address;
        //alert("lat: " + self.model.Lat + ", long: " + self.model.Lng +" , colony_name : "+ self.model.colony_name);
        this.model.my_data = JSON.stringify({ 'latitude': this.model.Lat, 'longitude': this.model.Lng, 'colony_name': this.model.colony_name, 'city': this.model.city, 'state': this.model.state, 'country': this.model.country, 'postalCode': this.model.postalCode });
        // alert(this.model.my_data);
      }

      //alert("inside_city2: " + this.model.city);

    });
    //alert("city: " + this.model.city);


  }

}
