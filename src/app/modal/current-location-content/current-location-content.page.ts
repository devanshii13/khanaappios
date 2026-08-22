import { Component, OnInit, ViewChild, ElementRef, NgZone, Input, AfterViewInit } from '@angular/core';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation/ngx';
import { FetchService } from '../../fetch.service';
import { StorageService } from '../../storage.service';
declare var google: any;
declare var $: any;
import {
  ModalController,
} from '@ionic/angular';

@Component({
  selector: 'app-current-location-content',
  templateUrl: './current-location-content.page.html',
  styleUrls: ['./current-location-content.page.scss'],
})
export class CurrentLocationContentPage implements OnInit, AfterViewInit {
  @Input() paramTitle;
  model: any = {};
  autocomplete: any = {};
  options: GeolocationOptions;
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  saved_address: any;
  marker: any;
  mapLoading = true;
  private autocompleteReady = false;
  /** Incremented on every geocode request; ensures stale callbacks are ignored. */
  private geocodeRequestId = 0;
  /** True once GPS has provided a definitive position – prevents finishMapLoad from overwriting it. */
  private gpsPositionSet = false;

  constructor(
    private modalController: ModalController,
    private geolocation: Geolocation,
    private fetch: FetchService,
    private storage: StorageService,
    private zone: NgZone,
  ) {
    this.options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000
    };
  }

  ngOnInit() {
    var lang_code = JSON.parse(localStorage.getItem('lang'));
    let res = this.storage.getScope();
    if (this.paramTitle == 'donate_food') {
      let item1 = res.find(i => i.key_text === 'CONFIRM_PICKUP_POINT');
      this.model.key_text1 = item1[lang_code];
    } else {
      let item1 = res.find(i => i.key_text === 'CONFIRM_LOCATION');
      this.model.key_text1 = item1[lang_code];
    }

    let item2 = res.find(i => i.key_text === 'SEARCH');
    this.model.key_text2 = item2[lang_code];

    this.model.confirm_route = JSON.parse(localStorage.getItem('set_confirm_location_route'));
    if (this.model.confirm_route == null) {
      this.model.confirm_route = 'donate-food';
    }

    this.model.user_id = JSON.parse(localStorage.getItem('user_id'));
    this.fetch.get_user_locations(this.model.user_id).subscribe(res => {
      if (res['success'] == true) {
        this.saved_address = res['data'];
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.bootstrapMap(), 50);
  }

  bootstrapMap() {
    if (!this.mapElement?.nativeElement) {
      return;
    }

    this.mapLoading = true;
    const { lat, lon } = this.getInitialCoords();
    this.initMapAt(lat, lon);
    this.refineLocationWithGps();
  }

  getInitialCoords(): { lat: number; lon: number } {
    const defaultCoords = { lat: 23.1765, lon: 75.7885 };

    try {
      const storageKey = this.model.confirm_route === 'get-food-search'
        ? 'receiver_location'
        : 'donor_location';
      const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (stored?.latitude && stored?.longitude) {
        return { lat: +stored.latitude, lon: +stored.longitude };
      }
    } catch (e) {
      // fall through to default
    }

    return defaultCoords;
  }

  refineLocationWithGps() {
    const gpsOptions: GeolocationOptions = {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 120000,
    };

    this.geolocation.getCurrentPosition(gpsOptions).then((resp) => {
      this.zone.run(() => {
        if (this.map) {
          this.gpsPositionSet = true;
          this.moveMarkerTo(resp.coords.latitude, resp.coords.longitude);
        }
      });
    }).catch(() => {
      // keep cached/default location
    });
  }

  initMapAt(lat: number, lon: number) {
    if (!this.mapElement?.nativeElement) {
      return;
    }

    if (this.map) {
      this.moveMarkerTo(lat, lon);
      this.finishMapLoad();
      return;
    }

    this.model.lat = lat;
    this.model.lon = lon;

    const latLng = new google.maps.LatLng(lat, lon);
    const mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      gestureHandling: 'greedy',
      clickableIcons: false,
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.addMarker();
    this.initAutocomplete();
    this.showAddress(lat, lon);

    google.maps.event.addListener(this.map, 'click', (event) => {
      this.zone.run(() => {
        if (this.marker) {
          this.marker.setPosition(event.latLng);
        }
        this.updatePosition(event.latLng.lat(), event.latLng.lng());
      });
    });

    this.finishMapLoad();
  }

  finishMapLoad() {
    setTimeout(() => {
      if (this.map) {
        google.maps.event.trigger(this.map, 'resize');
        // Only re-center to the initial coords if GPS hasn't already set a better position.
        if (!this.gpsPositionSet) {
          this.map.setCenter(new google.maps.LatLng(this.model.lat, this.model.lon));
          if (this.marker) {
            this.marker.setPosition(new google.maps.LatLng(this.model.lat, this.model.lon));
          }
        }
      }
      this.mapLoading = false;
    }, 200);
  }

  initAutocomplete() {
    if (this.autocompleteReady) {
      return;
    }
    const input = document.getElementById('my_test') as HTMLInputElement;
    if (!input) {
      return;
    }

    const autocomplete = new google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: 'in' },
      fields: ['formatted_address', 'geometry', 'address_components']
    });

    autocomplete.addListener('place_changed', () => {
      this.zone.run(() => {
        const place = autocomplete.getPlace();
        if (!place?.geometry?.location) {
          return;
        }
        const latitude = place.geometry.location.lat();
        const longitude = place.geometry.location.lng();
        this.autocomplete.start = place.formatted_address;
        this.moveMarkerTo(latitude, longitude);
      });
    });

    this.autocompleteReady = true;
  }

  addMarker() {
    if (!this.map) {
      return;
    }

    this.marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter(),
      draggable: true
    });

    google.maps.event.addListener(this.marker, 'dragend', () => {
      this.zone.run(() => {
        this.updatePosition(this.marker.position.lat(), this.marker.position.lng());
      });
    });
  }

  addMarker2(lat, lng) {
    this.moveMarkerTo(lat, lng);
  }

  moveMarkerTo(lat, lng) {
    this.model.lat = lat;
    this.model.lon = lng;
    const position = new google.maps.LatLng(lat, lng);

    if (!this.map) {
      this.initMapAt(lat, lng);
      return;
    }

    this.map.setCenter(position);
    this.map.setZoom(15);

    if (this.marker) {
      this.marker.setPosition(position);
    } else {
      this.addMarker();
    }

    this.updatePosition(lat, lng);
  }

  updatePosition(lat, lon) {
    this.model.lat = lat;
    this.model.lon = lon;
    this.showAddress(lat, lon);
  }

  showAddress(lat, lon) {
    const requestId = ++this.geocodeRequestId;
    const latLng = new google.maps.LatLng(lat, lon);
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'latLng': latLng }, (results, status) => {
      // Discard if a newer geocode request has already been issued.
      if (requestId !== this.geocodeRequestId) {
        return;
      }
      this.zone.run(() => {
        if (status !== 'OK' || !results?.length) {
          this.model.colony_name = 'Unable to detect address. Please move the pin.';
          return;
        }

        this.model.colony_name = results[0].formatted_address;
        this.model.city = '';
        this.model.state = '';
        this.model.country = '';
        this.model.postalCode = '';

        results[0].address_components.forEach((val) => {
          if (val.types.indexOf('locality') > -1) {
            this.model.city = val.long_name;
          }
          if (val.types.indexOf('administrative_area_level_1') > -1) {
            this.model.state = val.long_name;
          }
          if (val.types.indexOf('country') > -1) {
            this.model.country = val.long_name;
          }
          if (val.types.indexOf('postal_code') > -1) {
            this.model.postalCode = val.long_name;
          }
        });

        this.persistLocationData();
      });
    });
  }

  persistLocationData() {
    if (this.model.confirm_route == 'donate-food') {
      this.model.data = JSON.stringify({
        'app_user_id': JSON.parse(localStorage.getItem('user_id')),
        'house_no': null,
        'landmark': null,
        'adress_type': null,
        'latitude': this.model.lat,
        'longitude': this.model.lon,
        'colony_name': this.model.colony_name,
        'city': this.model.city,
        'state': this.model.state,
        'country': this.model.country,
        'postalCode': this.model.postalCode
      });
      localStorage.setItem('donor_location', this.model.data);
    }
    if (this.model.confirm_route == 'get-food-search') {
      this.model.data = JSON.stringify({
        'latitude': this.model.lat,
        'longitude': this.model.lon,
        'colony_name': this.model.colony_name,
        'city': this.model.city,
        'state': this.model.state,
        'country': this.model.country,
        'postalCode': this.model.postalCode
      });
      localStorage.setItem('receiver_location', this.model.data);
    }
    if (this.model.confirm_route == 'register-volunteer') {
      this.model.data = JSON.stringify({
        'latitude': this.model.lat,
        'longitude': this.model.lon,
        'colony_name': this.model.colony_name,
        'city': this.model.city,
        'state': this.model.state,
        'country': this.model.country,
        'postalCode': this.model.postalCode
      });
    }
  }

  async closeModal() {
    await this.modalController.dismiss('');
  }

  current_location() {
    if (!this.model.lat || !this.model.lon) {
      return;
    }
    if (!this.model.data) {
      this.persistLocationData();
    }
    this.modalController.dismiss(this.model.data);
  }

  blank(val) {
    if (val == 'start') {
      this.autocomplete.start = '';
      $('#my_test').val('');
    }
  }
}
