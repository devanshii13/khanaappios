import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FetchService } from '../fetch.service';

@Component({
  selector: 'app-track-pickup',
  templateUrl: './track-pickup.page.html',
  styleUrls: ['./track-pickup.page.scss'],
})
export class TrackPickupPage implements OnInit {
  orderId: any;
  trackingData: any;
  loading: boolean = true;
  error: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private fetch: FetchService,
    private router: Router
  ) { }

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('orderId');
    if (this.orderId) {
      this.trackOrder();
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  trackOrder() {
    this.loading = true;
    this.error = false;
    this.fetch.getBorzoCourier(this.orderId).subscribe(res => {
      this.loading = false;
      if (res && res.status == 200) {
        this.trackingData = res.data;
        // Map Borzo courier fields to expected tracking data structure
        if (this.trackingData) {
          this.trackingData.courier_name = res.data.name;
          this.trackingData.courier_phone = res.data.phone;
          // You might also want to set status based on Borzo order status if available here
        }
      } else {
        this.error = true;
      }
    }, err => {
      this.loading = false;
      this.error = true;
      console.error('Tracking Error:', err);
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
