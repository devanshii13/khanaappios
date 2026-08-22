import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FetchService } from '../fetch.service';
import { StorageService } from '../storage.service'; 
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Geolocation,GeolocationOptions ,Geoposition ,PositionError } from '@ionic-native/geolocation/ngx';
import { ModalController } from '@ionic/angular';
import { RejectGetFoodRequestPage } from '../modal/reject-get-food-request/reject-get-food-request.page';
import { ErrorMsgService } from '../error-msg.service';
declare var google: any;
declare var $: any;

@Component({
  selector: 'app-get-food-nearest-donors',
  templateUrl: './get-food-nearest-donors.page.html',
  styleUrls: ['./get-food-nearest-donors.page.scss'],
})
export class GetFoodNearestDonorsPage implements OnInit {
@ViewChild('map') mapElement: ElementRef;
model:any={};
map: any;
start : any;
end : any;
time_c : any;
distance_c:any;
dataReturned: any;
directionsService = new google.maps.DirectionsService;
directionsDisplay = new google.maps.DirectionsRenderer;
directions = [];
polylines = [];
no_of_person: any;
additional_msg_1 : any = "";
additional_msg_2 : any = "";
disableButton: boolean = false;
mapLoaded: boolean = false;
private mapInitialRouteDone = false;
  constructor(
	public modalController: ModalController,
	private http: HttpClient,
	private route: ActivatedRoute,
	private router: Router,
	private fetch: FetchService,
	private storage: StorageService,
	private geolocation: Geolocation,
	public errorMsg: ErrorMsgService,
  ) { }

  ngOnInit() {
	}

	ionViewWillEnter(){
	this.model.is_volunteer = 0;
	this.model.user_id = localStorage.getItem('user_id');
	this.no_of_person = localStorage.getItem('number_of_person')
	if(localStorage.getItem('volunteer_approve') != null){
		this.model.is_volunteer = localStorage.getItem('volunteer_approve');
	}  
	this.fetch.get_registered_user_data(this.model.user_id).subscribe(res => {
		//console.log(res);
		this.model.username_r = res['username']; 
	});
		
	var lang_code = JSON.parse(localStorage.getItem('lang'));
	//this.fetch.getKeyText(lang_code).subscribe(res => {
		let res = this.storage.getScope();
		let item1 = res.find(i => i.key_text === 'REJECT');
			this.model.key_text1 = item1[lang_code];
		let item2 = res.find(i => i.key_text === 'HOME');
			this.model.key_text2 = item2[lang_code];
		let item3 = res.find(i => i.key_text === 'ACTIVITY');
			this.model.key_text3 = item3[lang_code];
		let item4 = res.find(i => i.key_text === 'VOLUNTEER');
			this.model.key_text4 = item4[lang_code];
		let item5 = res.find(i => i.key_text === 'ACCEPT');
			this.model.key_text5 = item5[lang_code];
		let item6 = res.find(i => i.key_text === 'DEAR');
			this.model.key_text6 = item6[lang_code];
		let item7 = res.find(i => i.key_text === 'GET_FOOD_MSG_1');
			this.model.key_text7 = item7[lang_code];
		let item8 = res.find(i => i.key_text === 'PEOPLE');
			this.model.key_text8 = item8[lang_code];
		let item9 = res.find(i => i.key_text === 'IN');
			this.model.key_text9 = item9[lang_code];
		let item10 = res.find(i => i.key_text === 'GET_FOOD_MSG_2');
			this.model.key_text10 = item10[lang_code];
		let item11 = res.find(i => i.key_text === 'GET_FOOD_MSG_3');
			this.model.key_text11 = item11[lang_code];
		
		let item12 = res.find(i => i.key_text === 'VEG');
			this.model.key_text12 = item12[lang_code];
		let item13 = res.find(i => i.key_text === 'NON_VEG');
			this.model.key_text13 = item13[lang_code];
		let item14 = res.find(i => i.key_text === 'FOOD');
			this.model.key_text14 = item14[lang_code];
		let item15 = res.find(i => i.key_text === 'GET_FOOD_MSG_4');
			this.model.key_text15 = item15[lang_code];
		let item16 = res.find(i => i.key_text === 'GET_FOOD_MSG_5');
			this.model.key_text16 = item16[lang_code];
		
			let item17 = res.find(i => i.key_text === 'FOOD_ALREADY_DONATED_TO_OTHER_DONEES');
			this.model.key_text17 = item17[lang_code];

			
	//});
	var data = this.route.snapshot.params['data'];
	var data2 = this.route.snapshot.params['data2'];
	var r_lat = this.route.snapshot.params['r_lat'];
	var r_lon = this.route.snapshot.params['r_lon'];
	this.model.r_id = this.route.snapshot.params['r_id'];
	this.model.getFood_id = this.route.snapshot.params['id']; 
	this.model.type_id = this.route.snapshot.params['t']; 
	this.model.r_lat = r_lat;
	this.model.r_lon = r_lon;
	var x = JSON.parse(data);
	var rdata = JSON.parse(data2);
	this.model.rdata = rdata;
	this.model.total_data = x;
	this.model.colony_name = x.data.colony_name;
	this.model.add_id = x.data.id;
	this.model.d_lat = x.data.latitude;
	this.model.d_lon = x.data.longitude;
	this.model.d_food_type = x.data.food_type;
	this.model.no_of_food = x.data.total_food_for;
	if(this.model.d_food_type == 1){
		this.model.food_name = this.model.key_text12+' '+this.model.key_text14;
	}if(this.model.d_food_type == 2){
		this.model.food_name = this.model.key_text13+' '+this.model.key_text14;;
	}if(this.model.d_food_type == 3){
		this.model.food_name = this.model.key_text12+'/'+ this.model.key_text13+' '+this.model.key_text14;;
	}
	console.warn(x?.data);
	if(x.data.time_distance_walking.rows[0].elements[0].status == 'OK'){
		this.model.walk_time = x.data.time_distance_walking.rows[0].elements[0].duration.text;
		this.model.walk_distance = x.data.time_distance_walking.rows[0].elements[0].distance.text;
	}else{
		this.model.walk_time = 0;
		this.model.walk_distance = 0;	
	}
	if(x.data.time_distance_driving.rows[0].elements[0].status == 'OK'){
		this.model.drive_time = x.data.time_distance_driving.rows[0].elements[0].duration.text;
		this.model.drive_distance = x.data.time_distance_driving.rows[0].elements[0].distance.text;
	}else{
		this.model.drive_time = 0;
		this.model.drive_distance = 0;
	}
	if(x?.data.time_distance_transit.rows[0].elements[0].status=='OK'){
		this.model.public_time = x.data.time_distance_transit.rows[0].elements[0].duration.text;
		this.model.public_distance = x.data.time_distance_transit.rows[0].elements[0].distance.text;
	}else{
		this.model.public_time = 0;	
		this.model.public_distance = 0;	
	}

	// Safety: third-party matches must stay within admin Coverage Range (KM).
	// Self-Pickup matches must stay within 10 km.
	const pickupRequired = localStorage.getItem('pickup_required') === '1';
	const SELF_PICKUP_MAX_KM = 10;
	if (pickupRequired && !this.isWithinCoverageRange(x.data)) {
		const range = localStorage.getItem('coverage_range_km') || '1';
		this.errorMsg.showModal(`This donation is outside the ${range} km coverage range.`);
		this.router.navigate(['/home']);
		return;
	}
	if (!pickupRequired) {
		let distKm = this.getSelfPickupDistanceKm(x.data);
		// If Google API returned no route (e.g., intercity / no road data),
		// fall back to Haversine straight-line distance which always works
		// as long as coordinates are available.
		if (distKm == null) {
			const dLat = parseFloat(x.data?.latitude);
			const dLng = parseFloat(x.data?.longitude);
			const rLat = parseFloat(this.model.r_lat);
			const rLng = parseFloat(this.model.r_lon);
			if ([dLat, dLng, rLat, rLng].every(v => !isNaN(v))) {
				const toRad = (deg: number) => deg * Math.PI / 180;
				const R = 6371;
				const dLatR = toRad(dLat - rLat);
				const dLonR = toRad(dLng - rLng);
				const a = Math.sin(dLatR / 2) * Math.sin(dLatR / 2)
					+ Math.cos(toRad(rLat)) * Math.cos(toRad(dLat))
					* Math.sin(dLonR / 2) * Math.sin(dLonR / 2);
				distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			}
		}
		if (distKm != null && distKm > SELF_PICKUP_MAX_KM) {
			this.errorMsg.showModal(`This donation is too far for Self Pickup (${distKm.toFixed(1)} km). Please search for a closer donor.`);
			this.router.navigate(['/home']);
			return;
		}
	}
	
	this.geolocation.getCurrentPosition().then((resp) => {
		
		let latLng = new google.maps.LatLng(x.data.latitude, x.data.longitude);

		let mapOptions = {
			center: latLng,
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		}

		this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
		this.model.directionsService = new google.maps.DirectionsService();
       this.model.directionsDisplay = new google.maps.DirectionsRenderer();
		this.model.directionsDisplay.setMap(this.map);
		this.map.addListener('idle', () => {
			this.mapLoaded = true;
			if (!this.mapInitialRouteDone) {
				this.mapInitialRouteDone = true;
				this.calculate_route('WALKING');
			}
		});

        //directionsDisplay.setPanel(this.directionsPanel.nativeElement);
		
		
		
        $("#btn_walk").addClass('active');
        $("#text_walk_time").removeClass('grey');
        $("#text_walk_time").css('color','white');
		this.model.walk_image = 'icon_donor_walk_white.svg';
		this.model.mode = 'WALKING';
	}); 
	if(this.no_of_person > this.model.total_data.data.total_food_for){
		//this.additional_msg_1 = this.model.key_text16;
		this.additional_msg_2 = this.model.key_text15;
		this.model.number_of_person =this.model.total_data.data.total_food_for;
	  }
	  else if(this.no_of_person <= this.model.total_data.data.total_food_for){
		this.additional_msg_1 = "";
		this.additional_msg_2 = "";
		this.model.number_of_person = this.no_of_person;
	  }

	  console.log(pickupRequired,"pickupRequired")
	  if (pickupRequired) {
		  this.model.borzo_available = false;
		  this.model.checking_availability = true;
		  
		  // Fetch donor and receiver profiles to get phone numbers required by Borzo
		  let donorId = x.data.app_user_id;
		  let receiverId = this.model.user_id;

		  this.fetch.profile(JSON.stringify({ 'id': donorId })).subscribe(donorProfile => {
			  this.model.donor_phone = donorProfile['mobile_no'];
			  this.model.donor_name = donorProfile['username'];
			  this.fetch.profile(JSON.stringify({ 'id': receiverId })).subscribe(receiverProfile => {
				  this.model.receiver_phone = receiverProfile['mobile_no'];
				  
				  let donorPhone = this.model.donor_phone ? this.model.donor_phone.replace(/\D/g, '') : '';
				  if (donorPhone.length === 10) donorPhone = '91' + donorPhone;

				  let receiverPhone = this.model.receiver_phone ? this.model.receiver_phone.replace(/\D/g, '') : '';
				  if (receiverPhone.length === 10) receiverPhone = '91' + receiverPhone;

				  let borzoCalcData = {
					  'pickup_address': x.data.colony_name,
					  'pickup_lat': x.data.latitude,
					  'pickup_lng': x.data.longitude,
					  'pickup_pincode': x.data.postalCode,
					  'pickup_phone': donorPhone,
					  'drop_address': this.model.rdata.colony_name,
					  'drop_phone': receiverPhone,
					  'delivery_address': this.model.rdata.colony_name,
					  'delivery_lat': this.model.r_lat,
					  'delivery_lng': this.model.r_lon,
					  'delivery_pincode': this.model.rdata.postalCode,
					  'delivery_phone': receiverPhone
				  };

				  this.fetch.checkBorzoAvailability(borzoCalcData).subscribe(res => {
					  this.model.checking_availability = false;
					  if (res.status_code == 200 && res.response && res.response.is_successful) {
						  this.model.borzo_available = true;
						  this.model.delivery_charge = res.response.order.payment_amount;
						  this.model.delivery_fee = res.response.order.delivery_fee_amount;
						  this.model.delivery_details = res.response.order.status_description;
						  
						  // Update distance and time from Borzo if available
						  if (res.response.order.points && res.response.order.points.length > 1) {
							  let deliveryPoint = res.response.order.points[1];
							  
							  // Store Borzo data for display
							  this.model.delivery_point = deliveryPoint;
							  this.model.eta = deliveryPoint.required_finish_datetime;
							  this.model.eta_display = this.formatEtaTime(deliveryPoint.required_finish_datetime);
							  // Do not overwrite Page-1 match distance with Borzo road distance.
						  }

					  } else {
						  this.model.borzo_available = false;
						  let errorMsg = "Borzo delivery is not available for this location.";
						  if (res.response && res.response.parameter_warnings) {
							  errorMsg = "Borzo Error: " + JSON.stringify(res.response.parameter_warnings);
						  }
						  this.errorMsg.showModal(errorMsg);
					  }
				  }, error => {
					  this.model.checking_availability = false;
					  this.model.borzo_available = false;
					  console.error('Borzo availability check failed', error);
				  });
			  });
		  });
	  } else {

		  this.model.borzo_available = true; // Default to true if pickup not required
	  }
  }

  private hasValidRouteCoords(): boolean {
    const rLat = parseFloat(this.model.r_lat);
    const rLng = parseFloat(this.model.r_lon);
    const dLat = parseFloat(this.model.d_lat);
    const dLng = parseFloat(this.model.d_lon);
    return [rLat, rLng, dLat, dLng].every((value) => !isNaN(value));
  }

calculate_route(mode){ 
	if (!this.map || !this.hasValidRouteCoords()) {
		return;
	}

var infowindow = new google.maps.InfoWindow();
var renderer = new google.maps.DirectionsRenderer({
  suppressPolylines: true,
  infoWindow: infowindow,
});
	if (this.directions && this.directions.length > 0) {
		for (var i = 0; i < this.directions.length; i++)
			this.directions[i].setMap(null);
		}
		this.directions = [];
        this.model.directionsDisplay.setMap(null);
        this.model.directionsDisplay.setDirections({routes: []});
		this.model.directionsDisplay.setMap(this.map);
		
		this.model.mode = mode;
		if(mode == 'WALKING'){
			this.time_c = this.model.walk_time;	
        	this.distance_c = this.model.walk_distance;
			$("#btn_walk").addClass('active');
			$("#btn_drive").removeClass('active');
			$("#btn_bus").removeClass('active');
			$("#text_walk_time").removeClass('grey');
			$("#text_bus_time").addClass('grey');
			$("#text_bike_time").addClass('grey');
			$("#text_walk_time").css('color','white');
			this.model.walk_image = 'icon_donor_walk_white.svg';
			this.model.bus_image = 'icon_donor_bus.svg';
			this.model.bike_image = 'icon_donor_bike.svg';
		}else if(mode == 'TRANSIT'){
			this.time_c = this.model.public_time;	
        	this.distance_c = this.model.public_distance;
			$("#btn_bus").addClass('active');
			$("#btn_drive").removeClass('active');
			$("#btn_walk").removeClass('active');
			$("#text_bus_time").removeClass('grey');
			$("#text_walk_time").addClass('grey');
			$("#text_bike_time").addClass('grey');
			$("#text_bus_time").css('color','white');
			this.model.bus_image = 'icon_donor_bus_white.svg';
			this.model.walk_image = 'icon_donor_walk.svg';
			this.model.bike_image = 'icon_donor_bike.svg';
		}else if(mode == 'DRIVING'){
			this.time_c = this.model.drive_time;	
        	this.distance_c = this.model.drive_distance;
			$("#btn_drive").addClass('active');
			$("#btn_bus").removeClass('active');
			$("#btn_walk").removeClass('active');
			$("#text_bike_time").removeClass('grey');
			$("#text_walk_time").addClass('grey');
			$("#text_bus_time").addClass('grey');
			$("#text_bike_time").css('color','white');
			this.model.bike_image = 'icon_donor_bike_white.svg';
			this.model.walk_image = 'icon_donor_walk.svg';
			this.model.bus_image = 'icon_donor_bus.svg';
		}
		/*const s_latlng = {
			lat : 23.1827,
			lng : 75.7682
		}*/
		this.model.directionsService.route({
            origin: this.model.r_lat+", "+this.model.r_lon,
            destination: this.model.d_lat+", "+this.model.d_lon,
            travelMode: google.maps.TravelMode[mode],
			provideRouteAlternatives: true,
        },(res, status) => {
            if(status == google.maps.DirectionsStatus.OK){
				renderer.setDirections(res);
				renderer.setMap(this.map);
				 for (var i=0; i<this.polylines.length; i++) {
					this.polylines[i].setMap(null);
				  }
				for(var i = 0; i < res.routes.length; i++){
					var fastest = Number.MAX_VALUE,
                    shortest = Number.MAX_VALUE;
                res.routes.forEach(function(rou, index) {
					console.log("distance of route " +index+": " , rou.legs[0].distance.value);
					console.log("duration of route " +index+": " , rou.legs[0].duration.value);
					if (rou.legs[0].distance.value < shortest) shortest = rou.legs[0].distance.value  ;
					if (rou.legs[0].duration.value < fastest) fastest = rou.legs[0].duration.value  ;
                })
					var polylineOptions = {
						strokeColor: res.routes[i].legs[0].duration.value == fastest? "#22A7F0":res.routes[i].legs[0].distance.value == shortest?"#585858":"#585858",
						strokeOpacity: res.routes[i].legs[0].duration.value == fastest? 0.8:res.routes[i].legs[0].distance.value == shortest? 0.9: 0.5,
						strokeWeight: res.routes[i].legs[0].duration.value == fastest? 9:res.routes[i].legs[0].distance.value == shortest? 8: 3,
					};
					this.renderDirectionsPolylines(res.routes[i], polylineOptions);
				}
				
            } else {
                console.warn(status);
            }
        });
	}
	renderDirectionsPolylines(response, polylineOptions) {
		console.log(response);
		var infowindow = new google.maps.InfoWindow();
		var legs = response.legs;
		for (var i = 0; i < legs.length; i++) {
			var steps = legs[i].steps;
			for (var j = 0; j < steps.length; j++) {
				var nextSegment = steps[j].path;
				var stepPolyline = new google.maps.Polyline(polylineOptions);
				for (var k = 0; k < nextSegment.length; k++) {
					stepPolyline.getPath().push(nextSegment[k]);
				}
				this.polylines.push(stepPolyline);
				stepPolyline.setMap(this.map);
				/* var infowindow2 = new google.maps.InfoWindow();
				  infowindow2.setContent(response.legs[0].duration.text);
				  var step = 6;
				  infowindow2.setPosition(response.legs[0].steps[step].end_location);
				  console.log(response.legs[0]);
				  infowindow2.open(this.map); */
				// route click listeners, different one on each step
				google.maps.event.addListener(stepPolyline, 'click', function(evt) {
					//stepPolyline.setOptions({strokeColor: '#FF0000'});
					console.log(response.legs[0].duration.text);
					infowindow.setContent(response.legs[0].duration.text);
					infowindow.setPosition(evt.latLng);
					infowindow.open(this.map);
				})
			}
		}
	}
	async openRejectModel() {
		const modal = await this.modalController.create({
		component: RejectGetFoodRequestPage,
		cssClass: 'custom_current_location_modal notification-modal',
		backdropDismiss : false,
		componentProps: {
			"data" : this.model.total_data,
			"r_data" : this.model.rdata,
			"app_id" : this.model.r_id,
			"type_id" : this.model.type_id
		}
		});  
		modal.onDidDismiss().then((dataReturned) => {
		
		});
		return await modal.present();
	  } 

	rejectRequest(){
		this.disableButton = true;
		this.openRejectModel();
	}

	acceptRequest(){
		this.disableButton = true;
		this.model.search = true;
		this.model.user_id = JSON.parse(localStorage.getItem('user_id'));
		let data;
		if(this.no_of_person > this.model.total_data.data.total_food_for){
		  this.model.number_of_person =this.model.total_data.data.total_food_for;
		}
		else if(this.no_of_person <= this.model.total_data.data.total_food_for){
		  this.model.number_of_person = this.no_of_person;
		}
		data = JSON.stringify({'app_user_id' : this.model.user_id,'donar_id':this.model.total_data.data.app_user_id,'donate_food_id':this.model.total_data.data.id,  'food_type' : this.model.total_data.data.food_type, 'no_of_person' : this.model.number_of_person, 'latitude' : this.model.total_data.data.latitude, 'longitude' : this.model.total_data.data.longitude, 'colony_name' : this.model.total_data.data.colony_name, 'city' : this.model.total_data.data.city, 'state' : this.model.total_data.data.state, 'country' : this.model.total_data.data.country, 'postal_code' : this.model.total_data.data.postalCode, 'notification_type' : 1});
		localStorage.setItem('temp_total_food',this.model.number_of_person);

		// Persist the exact Page-1 matched location + distances for Page-2.
		localStorage.setItem('matched_pickup_location', JSON.stringify({
			latitude: this.model.r_lat,
			longitude: this.model.r_lon,
			walk_time: this.model.walk_time,
			walk_distance: this.model.walk_distance,
			drive_time: this.model.drive_time,
			drive_distance: this.model.drive_distance,
			public_time: this.model.public_time,
			public_distance: this.model.public_distance,
			donate_food_id: this.model.add_id
		}));
		// Keep receiver_location aligned with the matched Page-1 coords.
		try {
			const existing = localStorage.getItem('receiver_location');
			const location = existing ? JSON.parse(existing) : {};
			location.latitude = this.model.r_lat;
			location.longitude = this.model.r_lon;
			localStorage.setItem('receiver_location', JSON.stringify(location));
		} catch (e) {
			localStorage.setItem('receiver_location', JSON.stringify({
				latitude: this.model.r_lat,
				longitude: this.model.r_lon
			}));
		}

			this.fetch.accept_food(data).subscribe(res => {
		  if(res.success == true){
		  this.model.search = false;
		  let receiverFoodId = res.receiver_food_id;
		  localStorage.setItem('res.receiver_food_id', receiverFoodId);

		  // 1. Create Borzo Order immediately on Accept
		  let pickupRequired = localStorage.getItem('pickup_required');
		  if (pickupRequired == '1') {
			  let itemName = (this.model.total_data.data.food_type == 1 || this.model.total_data.data.food_type == 3) ? 'Veg Food' : 'Non-Veg Food';
			  let donorPhone = this.model.donor_phone ? this.model.donor_phone.replace(/\D/g, '') : '';
			  if (donorPhone.length === 10) donorPhone = '91' + donorPhone;

			  let receiverPhone = this.model.receiver_phone ? this.model.receiver_phone.replace(/\D/g, '') : '';
			  if (receiverPhone.length === 10) receiverPhone = '91' + receiverPhone;

			//   let borzoOrderData = {
			// 	  'donor_id': this.model.total_data.data.app_user_id,
			// 	  'pickup_address': this.model.total_data.data.colony_name,
			// 	  'pickup_name': this.model.donor_name || 'Donor',
			// 	  'pickup_phone': donorPhone,
			// 	  'pickup_city': this.model.total_data.data.city,
			// 	  'pickup_state': this.model.total_data.data.state,
			// 	  'pickup_pincode': this.model.total_data.data.postalCode,
			// 	  'pickup_lat': this.model.total_data.data.latitude,
			// 	  'pickup_lng': this.model.total_data.data.longitude,
			// 	  'receiver_name': this.model.username_r,
			// 	  'receiver_phone': receiverPhone,
			// 	  'drop_address': this.model.rdata.colony_name || '',
			// 	  'drop_name': this.model.username_r || 'NGO',
			// 	  'drop_phone': receiverPhone,
			// 	  'delivery_address': this.model.rdata.colony_name || '',
			// 	  'delivery_city': this.model.rdata.city || '',
			// 	  'delivery_state': this.model.rdata.state || '',
			// 	  'delivery_pincode': this.model.rdata.postalCode || '',
			// 	  'delivery_lat': this.model.rdata.latitude || '',
			// 	  'delivery_lng': this.model.rdata.longitude || '',
			// 	  'item_name': itemName,
			// 	  'units': this.model.number_of_person
			//   };


			let borzoOrderData = {

			// Required to link with donation
			donate_food_id: this.model.total_data.data.id,

			donor_id: this.model.total_data.data.app_user_id,

			// Pickup
			pickup_address: this.model.total_data.data.colony_name,
			pickup_name: this.model.donor_name || 'Donor',
			pickup_phone: donorPhone,

			// Drop
			drop_address: this.model.rdata.colony_name || '',
			drop_name: this.model.username_r || 'NGO',
			drop_phone: receiverPhone,

			// Optional (keep if you need later)
			pickup_city: this.model.total_data.data.city,
			pickup_state: this.model.total_data.data.state,
			pickup_pincode: this.model.total_data.data.postalCode,
			pickup_lat: this.model.total_data.data.latitude,
			pickup_lng: this.model.total_data.data.longitude,

			delivery_city: this.model.rdata.city || '',
			delivery_state: this.model.rdata.state || '',
			delivery_pincode: this.model.rdata.postalCode || '',
			delivery_lat: this.model.r_lat || this.model.rdata.latitude || '',
			delivery_lng: this.model.r_lon || this.model.rdata.longitude || '',

			item_name: itemName,
			units: this.model.number_of_person
		};
			  this.fetch.createBorzoOrder(borzoOrderData).subscribe(orderRes => {
				  console.log('Borzo order created on Accept:', orderRes);
				//   if (orderRes && orderRes.data && orderRes.data.order_id) {
				// 	  localStorage.setItem('borzo_order_id', orderRes.data.order_id);
				// 	  localStorage.setItem('borzo_tracking_url', orderRes.data.tracking_url);
				//   }
				  if (
						orderRes &&
						orderRes.response &&
						orderRes.response.is_successful
					) {

						const order = orderRes.response.order;

						localStorage.setItem(
							'borzo_order_id',
							order.order_id
						);

						localStorage.setItem(
							'borzo_tracking_url',
							order.points[1].tracking_url
						);

						// 5-min no-rider clock starts when order is created (app-side; no cron).
						localStorage.setItem('borzo_rider_wait_until', String(Date.now() + 15 * 60 * 1000));
						localStorage.setItem('borzo_rider_wait_food_id', String(this.model.total_data.data.id));
					}

					
				  // 2. Send notification to donor that order is created and rider is coming
				  let notifyData = JSON.stringify({
					  'food_id': this.model.total_data.data.id,
					  'logged_in_user': this.model.username_r,
					  'no_of_person': this.model.number_of_person,
					  'app_user_id': this.model.user_id,
					  'food_type': this.model.total_data.data.food_type,
					  'notification_type': 1,
					  'to': this.model.total_data.data.app_user_id,
					  'from': this.model.user_id,
					  'message': "Wait for a rider! We've booked a pickup. Please pack your food properly. Check Activity for pickup updates."
				  });

				  this.fetch.collect_food_noti_to_donor(notifyData).subscribe(notiRes => {
					  console.log('Donor notified of rider booking');
				  });

				  this.router.navigate([
					  '/finding-rider',
					  this.model.add_id,
					  this.model.r_lat,
					  this.model.r_lon,
					  this.model.r_id,
					  this.model.mode,
					  this.model.d_food_type,
					  receiverFoodId
				  ]);
			  }, () => {
				  this.router.navigate([
					  '/finding-rider',
					  this.model.add_id,
					  this.model.r_lat,
					  this.model.r_lon,
					  this.model.r_id,
					  this.model.mode,
					  this.model.d_food_type,
					  receiverFoodId
				  ]);
			  });
		  } else {
			  // If no Borzo, just send a basic notification
			  let notifyData = JSON.stringify({
				  'food_id': this.model.total_data.data.id,
				  'logged_in_user': this.model.username_r,
				  'no_of_person': this.model.number_of_person,
				  'app_user_id': this.model.user_id,
				  'food_type': this.model.total_data.data.food_type,
				  'notification_type': 1,
				  'to': this.model.total_data.data.app_user_id,
				  'from': this.model.user_id,
				  'message': "Someone is coming to pick up the food. Please pack it properly."
			  });
			  this.fetch.collect_food_noti_to_donor(notifyData).subscribe();
			  this.router.navigate([
				  '/get-food-nearest-donors-two-duplicate',
				  this.model.add_id,
				  this.model.r_lat,
				  this.model.r_lon,
				  this.model.r_id,
				  this.model.mode,
				  this.model.d_food_type,
				  receiverFoodId
			  ]);
		  }
		  }else{


			this.errorMsg.showModal(this.model.key_text17);
			this.router.navigate(['/home']);
		  }
		}); 
	}

	/** Convert ISO datetime (e.g. 2026-07-16T13:30:00+05:30) to a readable time like 1:30 PM */
	formatEtaTime(isoDateTime: string): string {
		if (!isoDateTime) {
			return '';
		}
		const date = new Date(isoDateTime);
		if (isNaN(date.getTime())) {
			return '';
		}
		let hours = date.getHours();
		const minutes = date.getMinutes();
		const ampm = hours >= 12 ? 'PM' : 'AM';
		hours = hours % 12 || 12;
		const mins = minutes < 10 ? '0' + minutes : String(minutes);
		return `${hours}:${mins} ${ampm}`;
	}

	parseDistanceKm(distance: any): number | null {
		if (distance == null) {
			return null;
		}
		if (typeof distance === 'number' && !isNaN(distance)) {
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
		return match[2] === 'm' ? value / 1000 : value;
	}

	isWithinCoverageRange(foodData: any): boolean {
		const range = parseFloat(localStorage.getItem('coverage_range_km'));
		if (isNaN(range) || range <= 0) {
			return true;
		}
		const walking = foodData?.time_distance_walking?.rows?.[0]?.elements?.[0];
		const driving = foodData?.time_distance_driving?.rows?.[0]?.elements?.[0];
		let distanceKm: number | null = null;
		if (walking?.status === 'OK') {
			distanceKm = this.parseDistanceKm(walking.distance);
		} else if (driving?.status === 'OK') {
			distanceKm = this.parseDistanceKm(driving.distance);
		}
		if (distanceKm == null) {
			return true;
		}
		return distanceKm <= (range + 0.05);
	}

	/**
	 * Returns the road distance (km) for a Self Pickup match.
	 * Prefers walking, then driving, then Haversine fallback.
	 */
	getSelfPickupDistanceKm(foodData: any): number | null {
		const walking = foodData?.time_distance_walking?.rows?.[0]?.elements?.[0];
		const driving = foodData?.time_distance_driving?.rows?.[0]?.elements?.[0];
		if (walking?.status === 'OK') {
			return this.parseDistanceKm(walking.distance);
		}
		if (driving?.status === 'OK') {
			return this.parseDistanceKm(driving.distance);
		}
		// Haversine fallback
		const dLat = parseFloat(foodData?.latitude);
		const dLng = parseFloat(foodData?.longitude);
		const rLat = parseFloat(this.model.r_lat);
		const rLng = parseFloat(this.model.r_lon);
		if ([dLat, dLng, rLat, rLng].every(v => !isNaN(v))) {
			const toRad = (deg: number) => deg * Math.PI / 180;
			const R = 6371;
			const dLatR = toRad(dLat - rLat);
			const dLonR = toRad(dLng - rLng);
			const a = Math.sin(dLatR / 2) * Math.sin(dLatR / 2)
				+ Math.cos(toRad(rLat)) * Math.cos(toRad(dLat))
				* Math.sin(dLonR / 2) * Math.sin(dLonR / 2);
			return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		}
		return null;
	}
}
