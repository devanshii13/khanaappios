import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { PincodeErrorComponentComponent } from './pincode-error-component/pincode-error-component.component';

const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: 'language',
  //   pathMatch: 'full'
  // },
  {
    path: 'splash',
    loadChildren: () => import('./splash/splash.module').then( m => m.SplashPageModule)
  },
  {
    path: 'language',
    loadChildren: () => import('./language/language.module').then( m => m.LanguagePageModule)
  },
  {
    path: 'mobile-number',
    loadChildren: () => import('./mobile-number/mobile-number.module').then( m => m.MobileNumberPageModule)
  },
  {
    path: 'otp',
    loadChildren: () => import('./otp/otp.module').then( m => m.OtpPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'get-food-search',
    loadChildren: () => import('./get-food-search/get-food-search.module').then( m => m.GetFoodSearchPageModule)
  },
  {
    path: 'nearest-donors/:id',
    loadChildren: () => import('./nearest-donors/nearest-donors.module').then( m => m.NearestDonorsPageModule)
  },
  {
    path: 'register-as-volunteer',
    loadChildren: () => import('./register-as-volunteer/register-as-volunteer.module').then( m => m.RegisterAsVolunteerPageModule)
  },
  {
    path: 'register-volunteer',
    loadChildren: () => import('./register-volunteer/register-volunteer.module').then( m => m.RegisterVolunteerPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  },   {
    path: 'saved-addresses/:id',
    loadChildren: () => import('./saved-addresses/saved-addresses.module').then( m => m.SavedAddressesPageModule)
  },   {
    path: 'otp-content',
    loadChildren: () => import('./modal/otp/otp-content/otp-content.module').then( m => m.OtpContentPageModule)
  },
  {
    path: 'saved-addresses-edit/:id',
    loadChildren: () => import('./saved-addresses-edit/saved-addresses-edit.module').then( m => m.SavedAddressesEditPageModule)
  },
  {
    path: 'saved-addresses-add',
    loadChildren: () => import('./saved-addresses-add/saved-addresses-add.module').then( m => m.SavedAddressesAddPageModule)
  },
  {
    path: 'filter-content',
    loadChildren: () => import('./modal/otp/filter-content/filter-content.module').then( m => m.FilterContentPageModule)
  },
  {
    path: 'sort-content',
    loadChildren: () => import('./modal/sort-content/sort-content.module').then( m => m.SortContentPageModule)
  },
  {
    path: 'help',
    loadChildren: () => import('./help/help.module').then( m => m.HelpPageModule)
  },
  {
    path: 'home-content',
    loadChildren: () => import('./modal/home-content/home-content.module').then( m => m.HomeContentPageModule)
  },
  {
    path: 'donate-food-add-location',
    loadChildren: () => import('./donate-food-add-location/donate-food-add-location.module').then( m => m.DonateFoodAddLocationPageModule)
  },
  {
    path: 'current-location-content',
    loadChildren: () => import('./modal/current-location-content/current-location-content.module').then( m => m.CurrentLocationContentPageModule)
  },
  {
    path: 'select-location',
    loadChildren: () => import('./select-location/select-location.module').then( m => m.SelectLocationPageModule)
  },
  {
    path: 'choose-language',
    loadChildren: () => import('./choose-language/choose-language.module').then( m => m.ChooseLanguagePageModule)
  },
  {
    path: 'donate-food-members',
    loadChildren: () => import('./donate-food-members/donate-food-members.module').then( m => m.DonateFoodMembersPageModule)
  },
  {
    path: 'donate-food-review/:id/:id2',
    loadChildren: () => import('./donate-food-review/donate-food-review.module').then( m => m.DonateFoodReviewPageModule)
  },
  {
    path: 'donate-food-successful',
    loadChildren: () => import('./donate-food-successful/donate-food-successful.module').then( m => m.DonateFoodSuccessfulPageModule)
  },
  {
    path: 'donate-food-content',
    loadChildren: () => import('./modal/donate-food-content/donate-food-content.module').then( m => m.DonateFoodContentPageModule)
  },
  {
    path: 'feedback-form/:r_id/:getfood_id',
    loadChildren: () => import('./feedback-form/feedback-form.module').then( m => m.FeedbackFormPageModule)
  },
  {
    path: 'feedback-content',
    loadChildren: () => import('./modal/feedback-content/feedback-content.module').then( m => m.FeedbackContentPageModule)
  },
  {
    path: 'get-food-nearest-donors/:data/:r_lat/:r_lon/:r_id/:id/:data2/:t',
    loadChildren: () => import('./get-food-nearest-donors/get-food-nearest-donors.module').then( m => m.GetFoodNearestDonorsPageModule)
  },
  {
    path: 'get-food-nearest-donors-two/:id/:lat/:lon/:r_id/:mode/:food_type/:getfoodid',
    loadChildren: () => import('./get-food-nearest-donors-two/get-food-nearest-donors-two.module').then( m => m.GetFoodNearestDonorsTwoPageModule)
  },
  {
    path: 'get-food-search-with-address',
    loadChildren: () => import('./get-food-search-with-address/get-food-search-with-address.module').then( m => m.GetFoodSearchWithAddressPageModule)
  },
  {
    path: 'location-error-content',
    loadChildren: () => import('./modal/location-error-content/location-error-content.module').then( m => m.LocationErrorContentPageModule)
  },
  {
    path: 'volunteer',
    loadChildren: () => import('./volunteer/volunteer.module').then( m => m.VolunteerPageModule)
  },
  {
    path: 'volunteer/volunteer',
    loadChildren: () => import('./volunteer/volunteer.module').then( m => m.VolunteerPageModule)
  },
  {
    path: 'activity-normal',
    loadChildren: () => import('./activity-normal/activity-normal.module').then( m => m.ActivityNormalPageModule)
  },
  {
    path: 'about-us',
    loadChildren: () => import('./about-us/about-us.module').then( m => m.AboutUsPageModule)
  },
  {
    path: 'receiver-confirm',
    loadChildren: () => import('./modal/receiver-confirm/receiver-confirm.module').then( m => m.ReceiverConfirmPageModule)
  },
  {
    path: 'notification',
    loadChildren: () => import('./modal/notification/notification.module').then( m => m.NotificationPageModule)
  },
  {
    path: 'receive-food-call/:num',
    loadChildren: () => import('./receive-food-call/receive-food-call.module').then( m => m.ReceiveFoodCallPageModule)
  },
  {
    path: 'cancel-allotedfood',
    loadChildren: () => import('./modal/cancel-allotedfood/cancel-allotedfood.module').then( m => m.CancelAllotedfoodPageModule)
  },
  {
    path: 'terms-conditions',
    loadChildren: () => import('./modal/terms-conditions/terms-conditions.module').then( m => m.TermsConditionsPageModule)
  },
  {
    path: 'show-in-between',
    loadChildren: () => import('./show-in-between/show-in-between.module').then( m => m.ShowInBetweenPageModule)
  },
  {
    path: 'donate-to-volunteer/:id',
    loadChildren: () => import('./donate-to-volunteer/donate-to-volunteer.module').then( m => m.DonateToVolunteerPageModule)
  },
  {
    path: 'assign-food',
    loadChildren: () => import('./assign-food/assign-food.module').then( m => m.AssignFoodPageModule)
  },
  {
    path: 'on-the-way',
    loadChildren: () => import('./modal/on-the-way/on-the-way.module').then( m => m.OnTheWayPageModule)
  },
  {
    path: 'donate-food-pickup-drop/:id/:id2',
    loadChildren: () => import('./donate-food-pickup-drop/donate-food-pickup-drop.module').then( m => m.DonateFoodPickupDropPageModule)
  },
  {
    path: 'choose-donate-option/:id/:id2',
    loadChildren: () => import('./choose-donate-option/choose-donate-option.module').then( m => m.ChooseDonateOptionPageModule)
  },
  {
    path: 'volunteer-food-request',
    loadChildren: () => import('./volunteer-food-request/volunteer-food-request.module').then( m => m.VolunteerFoodRequestPageModule)
  },
  {
    path: 'volunteer-food-request-content',
    loadChildren: () => import('./modal/volunteer-food-request-content/volunteer-food-request-content.module').then( m => m.VolunteerFoodRequestContentPageModule)
  },
  {
    path: 'volunteer-detail',
    loadChildren: () => import('./volunteer-detail/volunteer-detail.module').then( m => m.VolunteerDetailPageModule)
  },
  {
    path: 'near-by-me-location',
    loadChildren: () => import('./modal/near-by-me-location/near-by-me-location.module').then( m => m.NearByMeLocationPageModule)
  },
  {
    path: 'push-notification',
    loadChildren: () => import('./modal/push-notification/push-notification.module').then( m => m.PushNotificationPageModule)
  },
  {
    path: 'searching-volunteer/:id/:id2',
    loadChildren: () => import('./searching-volunteer/searching-volunteer.module').then( m => m.SearchingVolunteerPageModule)
  },
  {
    path: 'display-accept-request-on-map/:data/:id/:id2',
    loadChildren: () => import('./display-accept-request-on-map/display-accept-request-on-map.module').then( m => m.DisplayAcceptRequestOnMapPageModule)
  },
  {
    path: 'choose-screen-after-reject/:id/:rid/:fid',
    loadChildren: () => import('./choose-screen-after-reject/choose-screen-after-reject.module').then( m => m.ChooseScreenAfterRejectPageModule)
  },
  {
    path: 'conert-to-pickup-success',
    loadChildren: () => import('./modal/conert-to-pickup-success/conert-to-pickup-success.module').then( m => m.ConertToPickupSuccessPageModule)
  },
  {
    path: 'success-deliver-modal',
    loadChildren: () => import('./modal/success-deliver-modal/success-deliver-modal.module').then( m => m.SuccessDeliverModalPageModule)
  },
  {
    path: 'feedback-form-for-donor/:r_id/:getfood_id',
    loadChildren: () => import('./feedback-form-for-donor/feedback-form-for-donor.module').then( m => m.FeedbackFormForDonorPageModule)
  },
  {
    path: 'deliver-food-volunteer',
    loadChildren: () => import('./modal/deliver-food-volunteer/deliver-food-volunteer.module').then( m => m.DeliverFoodVolunteerPageModule)
  },
  {
    path: 'on-the-way-search/:id/:id2',
    loadChildren: () => import('./on-the-way-search/on-the-way-search.module').then( m => m.OnTheWaySearchPageModule)
  },
  {
    path: 'on-the-way-address/:id',
    loadChildren: () => import('./on-the-way-address/on-the-way-address.module').then( m => m.OnTheWayAddressPageModule)
  },
  {
    path: 'search-food-screen-two',
    loadChildren: () => import('./search-food-screen-two/search-food-screen-two.module').then( m => m.SearchFoodScreenTwoPageModule)
  },
  {
    path: 'reject-get-food-request',
    loadChildren: () => import('./modal/reject-get-food-request/reject-get-food-request.module').then( m => m.RejectGetFoodRequestPageModule)
  },
  {
    path: 'common-message',
    loadChildren: () => import('./modal/common-message/common-message.module').then( m => m.CommonMessagePageModule)
  },
  {
    path: 'get-food-nearest-donors-two-duplicate/:id/:lat/:lon/:r_id/:mode/:food_type/:getfoodid',
    loadChildren: () => import('./get-food-nearest-donors-two-duplicate/get-food-nearest-donors-two-duplicate.module').then( m => m.GetFoodNearestDonorsTwoDuplicatePageModule)
  },
  {
    path: 'common-search-screen',
    loadChildren: () => import('./common-search-screen/common-search-screen.module').then( m => m.CommonSearchScreenPageModule)
  },
  {
    path: 'onthe-way-msg',
    loadChildren: () => import('./modal/onthe-way-msg/onthe-way-msg.module').then( m => m.OntheWayMsgPageModule)
  },
  {
    path: 'pickup-success-modal',
    loadChildren: () => import('./modal/pickup-success-modal/pickup-success-modal.module').then( m => m.PickupSuccessModalPageModule)
  },
  {
    path: 'error-msg-modal',
    loadChildren: () => import('./modal/error-msg-modal/error-msg-modal.module').then( m => m.ErrorMsgModalPageModule)
  },
  {
    path: 'simple-push-notification',
    loadChildren: () => import('./modal/simple-push-notification/simple-push-notification.module').then( m => m.SimplePushNotificationPageModule)
  },
  {
    path: 'dynamic-msg',
    loadChildren: () => import('./modal/dynamic-msg/dynamic-msg.module').then( m => m.DynamicMsgPageModule)
  },
  {
    path: 'extact-pin',
    loadChildren: () => import('./modal/extact-pin/extact-pin.module').then( m => m.ExtactPinPageModule)
  },
  {
    path: 'donate-later-msg',
    loadChildren: () => import('./modal/donate-later-msg/donate-later-msg.module').then( m => m.DonateLaterMsgPageModule)
  },
  {
    path: 'view-feedback/:id',
    loadChildren: () => import('./view-feedback/view-feedback.module').then( m => m.ViewFeedbackPageModule)
  },
  {
    path: 'screen-after-volunteer-not-found/:id/:id2',
    loadChildren: () => import('./screen-after-volunteer-not-found/screen-after-volunteer-not-found.module').then( m => m.ScreenAfterVolunteerNotFoundPageModule)
  },
  {
    path: 'pincode-error-component',
    component: PincodeErrorComponentComponent
 },
  
  {
    path: 'track-pickup',
    loadChildren: () => import('./track-pickup/track-pickup.module').then(m => m.TrackPickupPageModule)
  },
 {
    path: 'finding-rider/:id/:lat/:lon/:r_id/:mode/:food_type/:getfoodid',
    loadChildren: () => import('./finding-rider/finding-rider.module').then(m => m.FindingRiderPageModule)
  },
  {
    path: 'donate-food-pickup-method/:id/:id2',
    loadChildren: () => import('./donate-food-pickup-method/donate-food-pickup-method.module').then( m => m.DonateFoodPickupMethodPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
