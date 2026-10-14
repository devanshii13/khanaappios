import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { map, catchError,timeout } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { BehaviorSubject,throwError } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FetchService {
 public isLanguageChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  constructor(private http: HttpClient) { }
  
	getLanguage(): Observable<any> { 
		return this.http.get(environment.base_url + 'language');
	}
	getKeyText(id): Observable<any> { 
		return this.http.get(environment.base_url + 'key_text/'+id);
	}
	getAboutUsPageCOntent(id): Observable<any>{
		return this.http.get(environment.base_url + 'get-about-us-content-by-lang/'+id)
	}
	createUser(data): Observable<any> { 
		return this.http.post(environment.base_url + 'create_user',data);
	}
	resendOTP(data): Observable<any> { 
		return this.http.post(environment.base_url + 'resend_otp',data);
	}
	registerUser(data): Observable<any> { 
		return this.http.post(environment.base_url + 'register_user',data);
	}
	profile(data): Observable<any> { 
		return this.http.post(environment.base_url + 'user_profile',data);
	}
	get_location(data): Observable<any> { 
		return this.http.post(environment.base_url + 'get_long',data);
	}
	help_video(lang_code): Observable<any> { 
		return this.http.get(environment.base_url + 'help_video/'+lang_code);
	}
	add_location(data): Observable<any> { 
		return this.http.post(environment.base_url + 'add_location',data);
	}
	get_user_locations(id): Observable<any> { 
		return this.http.get(environment.base_url + 'show_location/'+id);
	}
	get_lat_lon(id): Observable<any> { 
		return this.http.get(environment.base_url + 'get_location/'+id);
	}
	updateLocation(data): Observable<any> { 
		return this.http.post(environment.base_url + 'edit_location',data);
	}
	remove_location(id): Observable<any> { 
		return this.http.get(environment.base_url + 'remove_location/'+id);
	}
	getUserLocationForDonation(id): Observable<any> { 
		return this.http.get(environment.base_url + 'get_user_loaction/'+id);
	}
	donate_food_location(data): Observable<any> { 
		return this.http.post(environment.base_url + 'donate_food',data);
	}
	donate_food_details(data): Observable<any> { 
		return this.http.post(environment.base_url + 'donate_food_details',data);
	}
	reviewFood(id): Observable<any> { 
		return this.http.get(environment.base_url + 'review_food/'+id);
	}
	update_food_details(data): Observable<any> { 
		return this.http.post(environment.base_url + 'update_food_details',data);
	}
	pending_donation(id): Observable<any> { 
		return this.http.get(environment.base_url + 'pending_donation/'+id);
	}
	my_alloted_donation(id): Observable<any> { 
		return this.http.get(environment.base_url + 'my_alloted_donation/'+id);
	}
	my_food_request(id): Observable<any> { 
		return this.http.get(environment.base_url + 'my_food_request/'+id);
	}
	my_alloted_request(id): Observable<any> { 
		return this.http.get(environment.base_url + 'my_alloted_request/'+id);
	}
	receiver_food_details(data): Observable<any> { 
		return this.http.post(environment.base_url + 'receiver_food_details',data);
	}
	accept_food(data): Observable<any> { 
		return this.http.post(environment.base_url + 'accept_food',data);
	}
	accept_food_request(data): Observable<any> {
		return this.http.post(environment.base_url + 'accept_food_request',data);
	}
	cancel_accept_food(data): Observable<any> {
		return this.http.post(environment.base_url + 'cancel_accept_food',data)
	}
	cancel_requested_food(data):Observable<any> {
		return this.http.post(environment.base_url + 'cancel_requested_food',data)
	}
	cancel_alloted_request(data):Observable<any> {
		return this.http.post(environment.base_url + 'cancel_alloted_request',data)
	}
	get_food_cancel_alloted_request(data):Observable<any> {
		return this.http.post(environment.base_url + 'get_food_cancel_alloted_request',data)
	}
	get_reasons(lang_code):Observable<any> {
		return this.http.get(environment.base_url + 'get_reasons/'+lang_code);
	}
	get_terms_conditions(lang_code):Observable<any> {
		return this.http.get(environment.base_url + 'get_terms_conditions/'+lang_code);
	}
	volunteer_get_terms_conditions(lang_code):Observable<any>{
		return this.http.get(environment.base_url + 'volunteer_get_terms_conditions/'+lang_code);
	}
	receiver_details(id): Observable<any> { 
		return this.http.get(environment.base_url + 'receiver_data/'+id);
	}
	nearest_donors(data): Observable<any> { 
		return this.http.post(environment.base_url + 'nearest_donors',data);
	}
	check_pincode(data): Observable<any> { 
		return this.http.post(environment.base_url + 'check_pincode',data);
	}
	distanceAndTime(slat, slon, dlat, dlon, mode): Observable<any> { 
	let headers = new HttpHeaders();
		  headers.set('Authorization', 'Basic'); 
		 headers.set('Content-Type', 'application/json'); 
		 headers.set('Accept', 'application/json'); 
		 headers.set('Access-Control-Allow-Origin', '*'); 
		 headers.set('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');  
		return this.http.get(`https://maps.googleapis.com/maps/api/distancematrix/json?key=${environment.googleMapsApiKey}&origins='+slat+','+slon+'&destinations='+dlat+','+dlon+'&mode='+mode+'&language=en-EN&sensor=false`, {
      headers: headers
    });
	}
	showTimeAndDistance(data): Observable<any> { 
		return this.http.post(environment.base_url + 'show_time_distance',data);
	}
	get_donor_food_detail(id): Observable<any> { 
		return this.http.get(environment.base_url + 'donar_food_detail/'+id);
	}
	get_volunteer_detail(id): Observable<any> { 
		return this.http.get(environment.base_url + 'get_volunteer_detail/'+id);
	}
	pickup_food(data): Observable<any> { 
		return this.http.post(environment.base_url + 'food_pickup',data);
	}
	pickup_food_for_get(data): Observable<any> { 
		return this.http.post(environment.base_url + 'food_pickup_for_get',data);
	}
	feedback(data): Observable<any> { 
		return this.http.post(environment.base_url + 'feedback',data);
	}
	feedback_donor(data): Observable<any> { 
		return this.http.post(environment.base_url + 'feedback_donor',data);
	}
	register_volunteer(data): Observable<any> { 
		return this.http.post(environment.base_url + 'register_volunteer',data);
	}
	volunteer_request(data): Observable<any> { 
		return this.http.post(environment.base_url + 'request-food',data);
	}
	reapplyAsVolunteer(data): Observable<any> { 
		return this.http.post(environment.base_url + 'reapply-as-volunteer',data);
	}
	get_request(id): Observable<any> { 
		return this.http.get(environment.base_url + 'get_request/'+id);
	}
	my_ontheway_food(id): Observable<any> { 
		return this.http.get(environment.base_url + 'my_ontheway_food/'+id);
	}
	my_waiting_request(id): Observable<any> { 
		return this.http.get(environment.base_url + 'my_waiting_request/'+id);
	}
	my_completed_food(id): Observable<any> { 
		return this.http.get(environment.base_url + 'my_completed_food/'+id);
	}
	volunteer_receive_requested_food(data): Observable<any> { 
		return this.http.post(environment.base_url + 'receive-food',data);
	}
	volunteer_received_cancel_food(data): Observable<any> { 
		return this.http.post(environment.base_url + 'cancel-alloted-food',data);
	}
	volunteer_cancel_requested_food(data): Observable<any> { 
		return this.http.post(environment.base_url + 'cancel-receive-food',data);
	}
	getAllRowWithoutWhere(model): Observable<any> { 
		return this.http.post(environment.base_url + 'getAllRowWithoutWhere',model);
	}
	getTestimonialByLanguage(model): Observable<any> { 
		return this.http.post(environment.base_url + 'get-testimonial-by-lang',model);
	}
	deleteMyAccount(model): Observable<any> { 
		return this.http.post(environment.base_url + 'delete-my-account',model);
	}
	notify(data): Observable<any> { 
		return this.http.post(environment.base_url + 'notify',data);
	}
	req_list(data): Observable<any> { 
		return this.http.post(environment.base_url + 'food-request',data);
	}
	v_edit(id): Observable<any> { 
		return this.http.get(environment.base_url + 'volunteer_edit/'+id);
	}
	get_waiting_food(): Observable<any> { 
		return this.http.get(environment.base_url + 'get_waiting_food');
	}
	cancel_all_request(id):Observable<any> {
		return this.http.get(environment.base_url + 'cancel_all_request/'+id);
	}
	v_check(id): Observable<any> { 
		return this.http.get(environment.base_url + 'volunteer_check/'+id);
	}
	update_volunteer(data): Observable<any> { 
		return this.http.post(environment.base_url + 'update_volunteer',data);
	}
	get_user_city(id): Observable<any> { 
		return this.http.get(environment.base_url + 'user_city/'+id);
	}
	get_top_donors(city): Observable<any> { 
		return this.http.get(environment.base_url + 'top_donors/'+city);
	}
	show_feedback(id): Observable<any> { 
		// return this.http.get(environment.base_url + 'show_feedback/'+id);
		return this.http.get(environment.base_url + 'get_show_feedback/'+id);
	}
	weekly_donation_graph(id): Observable<any> { 
		return this.http.get(environment.base_url + 'donation_graph_weekly/'+id);
	}
	monthly_donation_graph(id): Observable<any> { 
		return this.http.get(environment.base_url + 'donation_graph_monthly/'+id);
	}
	blessings_this_week(id): Observable<any> { 
		return this.http.get(environment.base_url + 'blessing_this_week/'+id);
	}
	blessings_this_month(id): Observable<any> { 
		return this.http.get(environment.base_url + 'blessing_this_month/'+id);
	}
	total_blessings(id): Observable<any> { 
		return this.http.get(environment.base_url + 'total_blessings/'+id);
	}
	food_quality_weekly(data): Observable<any> { 
		return this.http.post(environment.base_url + 'weekly_food_quality', data);
	}
	weekly_packaging(id): Observable<any> { 
		return this.http.get(environment.base_url + 'weekly_packaging/'+id);
	}
	weekly_behaviour(id): Observable<any> { 
		return this.http.get(environment.base_url + 'weekly_behaviour/'+id);
	}
	monthly_food_quality(id): Observable<any> { 
		return this.http.get(environment.base_url + 'monthly_food_quality/'+id);
	}
	monthly_packaging(id): Observable<any> { 
		return this.http.get(environment.base_url + 'monthly_packaging/'+id);
	}
	monthly_behaviour(id): Observable<any> { 
		return this.http.get(environment.base_url + 'monthly_behaviour/'+id);
	}
	weekly_volunteer_req(id): Observable<any> { 
		return this.http.get(environment.base_url + 'weekly_volunteer_req/'+id);
	}
	monthly_volunteer_req(id): Observable<any> { 
		return this.http.get(environment.base_url + 'monthly_volunteer_req/'+id);
	}
	volunteer_blessings_this_week(id): Observable<any> { 
		return this.http.get(environment.base_url + 'volunteer_blessing_this_week/'+id);
	}
	volunteer_blessings_this_month(id): Observable<any> { 
		return this.http.get(environment.base_url + 'volunteer_blessing_this_month/'+id);
	}
	volunteer_total_blessings(id): Observable<any> { 
		return this.http.get(environment.base_url + 'volunteer_total_blessings/'+id);
	}
	volunteer_city(id): Observable<any> { 
		return this.http.get(environment.base_url + 'volunteer_city/'+id);
	}
	top_volunteers(id): Observable<any> { 
		return this.http.get(environment.base_url + 'top_volunteers/'+id);
	}
	twilio_token(): Observable<any> { 
		return this.http.get(environment.base_url + 'twilio_token_generate');
	}
	get_registered_user_data(id): Observable<any> { 
		return this.http.get(environment.base_url + 'get_user_detail/'+id);
	}
	collect_food_noti_to_donor(data): Observable<any> { 
		return this.http.post(environment.base_url + 'collect_food_notification',data);
	}
	get_notification(id): Observable<any> { 
		return this.http.get(environment.base_url + 'get_notification/'+id);
	}
	read_notification(id): Observable<any> { 
		return this.http.get(environment.base_url + 'read_notification/'+id);
	}
	get_available_food(id): Observable<any> {
		return this.http.get(environment.base_url + 'get_available_food/'+id);
	}
	cancel_donation_food(data): Observable<any> { 
		return this.http.post(environment.base_url + 'cancel_donation_food',data);
	}
	cancel_alloted_food(data): Observable<any> {
		return this.http.post(environment.base_url + 'cancel_alloted_food',data);
	}
	change_app_status(data): Observable<any> { 
		return this.http.post(environment.base_url + 'change_app_status',data);
	}
	notify_donar(data): Observable<any> { 
		return this.http.post(environment.base_url + 'notify_donar',data);
	}
	notify_donar_donate(data): Observable<any> { 
		return this.http.post(environment.base_url + 'notify_donar_donate',data);
	}
	get_waypoints(data): Observable<any> {
		return this.http.post(environment.base_url + 'get_waypoints',data);
	}
	get_volunteer_waypoints(data): Observable<any> {
		return this.http.post(environment.base_url + 'get_volunteer_waypoints',data);
	}
	get_volunteer_waypoints_new(data): Observable<any> {
		return this.http.post(environment.base_url + 'get_volunteer_waypoints_new',data);
	}
	alert_volunteer_on_true(data): Observable<any> {
		return this.http.post(environment.base_url + 'alert_volunteer_on_true',data);
	}
    store_food_for_waiting(data): Observable<any> {
		return this.http.post(environment.base_url + 'store_food_for_waiting',data);
	}
	get_volunteer_waypoints_by_condition(data): Observable<any> {
		return this.http.post(environment.base_url + 'get_volunteer_waypoints_by_condition',data);
	}
	save_contact_us(data): Observable<any> {
		return this.http.post(environment.base_url + 'save_contact_us',data);
	}
	recomended_distance(data): Observable<any> {
		return this.http.post(environment.base_url + 'recomended_distance',data);
	}
	donate_food_to_volunteer(data): Observable<any> {
		return this.http.post(environment.base_url+'donate_food_to_volunteer',data);
	}
	active_donation(data): Observable<any>{
		return this.http.post(environment.base_url+'active_donation',data);
	}
	add_call_detail(data): Observable<any>{
		return this.http.post(environment.base_url+'add_call_detail',data);
	}
	get_received_food(id):Observable<any>{
		return this.http.get(environment.base_url + 'get_received_food/'+id);
	}
	donate_food_location_new(data): Observable<any> { 
		return this.http.post(environment.base_url + 'donate_food_new',data);
	}
	donate_food_details_new(data): Observable<any> { 
		return this.http.post(environment.base_url + 'donate_food_details_new',data);
	}
	update_food_details_new(data): Observable<any> { 
		return this.http.post(environment.base_url + 'update_food_details_new',data);
	}
	test(data): Observable<any> { 
		return this.http.post(environment.base_url + 'test',data);
	}
	volunterr_accept_request(data): Observable<any> { 
		return this.http.post(environment.base_url + 'volunterr_accept_request',data);
	}
	checkVolunteerAcceptRequest(data): Observable<any> { 
		return this.http.post(environment.base_url + 'volunterr_accept_request_result',data);
	}
	convert_to_pickup_request(data): Observable<any> { 
		return this.http.post(environment.base_url + 'convert_to_pickup_request',data);
	}
	convert_to_pickup_request_no_volunteer(data): Observable<any> { 
		return this.http.post(environment.base_url + 'convert_to_pickup_request_no_volunteer',data);
	}
	donate_later_food(data): Observable<any> { 
		return this.http.post(environment.base_url + 'donate_later_food',data);
	}
	donate_later_food_no_volunteer(data): Observable<any> { 
		return this.http.post(environment.base_url + 'donate_later_food_no_volunteer',data);
	}
	reject_food_request_by_donee(data): Observable<any> { 
		return this.http.post(environment.base_url + 'reject_food_request_by_donee',data);
	}
	donee_accept_food(data): Observable<any> { 
		return this.http.post(environment.base_url + 'donee_accept_food',data);
	}
	get_donate_food(id): Observable<any> { 
		return this.http.get(environment.base_url + 'get_donate_food/'+id);
	}
	volunteer_graph_today(id): Observable<any> { 
		return this.http.get(environment.base_url + 'volunteer_graph_today/'+id);
	}
	volunteer_graph_weekly(id): Observable<any> { 
		return this.http.get(environment.base_url + 'volunteer_graph_weekly/'+id);
	}
	volunteer_graph_monthly(id): Observable<any> { 
		return this.http.get(environment.base_url + 'volunteer_graph_monthly/'+id);
	}
	volunteer_graph_yearly(id): Observable<any> { 
		return this.http.get(environment.base_url + 'volunteer_graph_yearly/'+id);
	}
	count_today_donation_fullfiled(id): Observable<any> { 
		return this.http.get(environment.base_url + 'count_today_donation_fullfiled/'+id);
	}
	count_yearly_donation_fullfiled(id): Observable<any> { 
		return this.http.get(environment.base_url + 'count_yearly_donation_fullfiled/'+id);
	}
	count_monthly_donation_fullfiled(id): Observable<any> { 
		return this.http.get(environment.base_url + 'count_monthly_donation_fullfiled/'+id);
	}
	count_weekly_donation_fullfiled(id): Observable<any> { 
		return this.http.get(environment.base_url + 'count_weekly_donation_fullfiled/'+id);
	}
	volunteer_graph_today_accepted(id): Observable<any> { 
		return this.http.get(environment.base_url + 'volunteer_graph_today_accepted/'+id);
	}
	volunteer_graph_weekly_accepted(id): Observable<any> { 
		return this.http.get(environment.base_url + 'volunteer_graph_weekly_accepted/'+id);
	}
	volunteer_graph_monthly_accepted(id): Observable<any> { 
		return this.http.get(environment.base_url + 'volunteer_graph_monthly_accepted/'+id);
	}
	volunteer_graph_yearly_accepted(id): Observable<any> { 
		return this.http.get(environment.base_url + 'volunteer_graph_yearly_accepted/'+id);
	}
	count_yearly_donation_accepted(id): Observable<any> { 
		return this.http.get(environment.base_url + 'count_yearly_donation_accepted/'+id);
	}
	count_today_donation_accepted(id): Observable<any> { 
		return this.http.get(environment.base_url + 'count_today_donation_accepted/'+id);
	}
	count_monthly_donation_accepted(id): Observable<any> { 
		return this.http.get(environment.base_url + 'count_monthly_donation_accepted/'+id);
	}
	count_weekly_donation_accepted(id): Observable<any> { 
		return this.http.get(environment.base_url + 'count_weekly_donation_accepted/'+id);
	}
	show_feedback_by_id(id): Observable<any> { 
		return this.http.get(environment.base_url + 'show_feedback_by_id/'+id);
	}
	updateLanguage(data): Observable<any> { 
		return this.http.post(environment.base_url + 'update_language',data);
	}
	updateDeviceToken(data): Observable<any> { 
		return this.http.post(environment.base_url + 'update_device_token',data);
	}
	checkDeviceId(data): Observable<any> { 
		return this.http.post(environment.base_url + 'check_unique_login',data);
	}
	detectSlowNetwork(): Observable<any> { 
		return this.http.get(environment.base_url + 'language').pipe(
			timeout(1000), // 5000 milliseconds (5 seconds) timeout
			catchError(error => {
			  
			  alert("You have slow internet connection");
			  return throwError(error);
			})
		  );
	}
	read_notification_by_id(data): Observable<any> { 
		return this.http.post(environment.base_url + 'read_notification_by_id',data);
	}

	// Chatbot Apis
	
	getQuesCategories(): Observable<any> { 
		return this.http.get(environment.base_url + 'get-question-category');
	}
	getQuesSubCategories(id): Observable<any> { 
		return this.http.get(environment.base_url + 'get-question-sub-category?id='+id);
	}
	getQuestions(id): Observable<any> { 
		return this.http.get(environment.base_url + 'get-question?category_id='+id);
	}
	getAnswer(id): Observable<any> { 
		return this.http.get(environment.base_url + 'get-answer?question_id='+id);
	}
	check_availability(data): Observable<any> {
		return this.http.post(environment.base_url + 'check_availability', data);
	}
	checkBorzoAvailability(data): Observable<any> {
		return this.http.post(environment.base_url + 'borzo/calculate-order', data);
	}
	createBorzoOrder(data): Observable<any> {
		return this.http.post(environment.base_url + 'borzo/create-order', data);
	}
	editBorzoOrder(data): Observable<any> {
		return this.http.post(environment.base_url + 'borzo/edit-order', data);
	}
	cancelBorzoOrder(data): Observable<any> {
		return this.http.post(environment.base_url + 'borzo/cancel-order', data);
	}
	getBorzoOrders(): Observable<any> {
		return this.http.get(environment.base_url + 'borzo/orders');
	}
	getBorzoCourier(orderId): Observable<any> {
		return this.http.get(environment.base_url + 'borzo/courier?order_id=' + orderId);
	}
	getBorzoOrderDetails(foodId): Observable<any> { 
	return this.http.get( environment.base_url + 'borzo/order-details/' + foodId ); 
	}
}
