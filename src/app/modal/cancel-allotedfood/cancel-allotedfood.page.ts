import { Component, OnInit, Input } from '@angular/core';
import { FetchService } from '../../fetch.service';
import { StorageService } from '../../storage.service';
import {
  ModalController,
  NavParams
} from '@ionic/angular';
declare var $: any;

@Component({
  selector: 'app-cancel-allotedfood',
  templateUrl: './cancel-allotedfood.page.html',
  styleUrls: ['./cancel-allotedfood.page.scss'],
})

export class CancelAllotedfoodPage implements OnInit {
  @Input() id;
  @Input() type;
  @Input() paramTitle;
  @Input() borzo_order_id;
  model: any = {};
  reasons: any = [];
  constructor(private modalController: ModalController,
    private navParams: NavParams,
    private storage: StorageService,
    private fetch: FetchService) { }

  ngOnInit() {
    this.model.search = false;
    var lang_code = JSON.parse(localStorage.getItem('lang'));
    this.fetch.get_reasons(lang_code).subscribe(res => {

      res['data'].forEach((val, i) => {

        this.reasons.push({ label: val['' + lang_code + ''] });


      });

    })
    let res = this.storage.getScope();
    if (this.paramTitle == 'get_food') {
      let item1 = res.find(i => i.key_text === 'CANCEL_PICK_UP');
      this.model.key_text1 = item1[lang_code];
    } else {
      let item1 = res.find(i => i.key_text === 'CANCEL_DROP');
      this.model.key_text1 = item1[lang_code];
    }

    let item2 = res.find(i => i.key_text === 'REASON_FOR_CANCELLATION');
    this.model.key_text2 = item2[lang_code];
    let item3 = res.find(i => i.key_text === 'COMMENT');
    this.model.key_text3 = item3[lang_code];
  }
  select_reason(value) {

    this.model.selected_reason = value.detail.value;;

  }
  cancelDonation() {
    this.model.search = true;
    let reason = this.model.selected_reason;
    if (!reason) {
      $('#reason_msg').show();
      this.model.search = false;
    } else {
      $('#reason_msg').hide();
      let comment = $('#comments').val();
      let data = JSON.stringify({ 'id': this.id, 'reason': reason, 'comment': comment });

      const borzoOrderId = this.borzo_order_id;
      const cancelBackend = () => {
        const request$ = this.type == 'get_food'
          ? this.fetch.get_food_cancel_alloted_request(data)
          : this.fetch.cancel_alloted_request(data);

        request$.subscribe(() => {
          this.model.search = false;
          this.closeModal(1);
        }, () => {
          this.model.search = false;
          this.closeModal(0);
        });
      };

      if (borzoOrderId) {
        const borzoCancelData = {
          order_id: borzoOrderId,
          reason: reason,
          comment: comment
        };

        this.fetch.cancelBorzoOrder(borzoCancelData).subscribe(() => {
          if (localStorage.getItem('borzo_order_id') === String(borzoOrderId)) {
            localStorage.removeItem('borzo_order_id');
            localStorage.removeItem('borzo_order_name');
            localStorage.removeItem('borzo_tracking_url');
            localStorage.removeItem('borzo_delivery_fee');
            localStorage.removeItem('borzo_payment_amount');
            localStorage.removeItem('borzo_status');
          }
          cancelBackend();
        }, () => {
          // Still cancel backend allotment even if Borzo cancel fails.
          cancelBackend();
        });
        return;
      }

      cancelBackend();
    }
  }
  async closeModal(isDone) {

    const onClosedData: string = isDone;
    await this.modalController.dismiss(onClosedData);
  }

}
