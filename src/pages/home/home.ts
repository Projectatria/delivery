import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, LoadingController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Insomnia } from '@ionic-native/insomnia';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  myForm: FormGroup;
  public loading: any;
  public pengiriman = [];

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public fb: FormBuilder,
    public api: ApiProvider,
    private insomnia: Insomnia) {
    this.insomnia.keepAwake()
      .then(
        () => console.log('success'),
        () => console.log('error')
      );
    this.myForm = fb.group({
      userid: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])]
    })
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present().then(() => {
      this.doGetPengiriman()
    });

  }
  ngAfterViewInit() {
    this.loading.dismiss()
  }
  doMaps() {
    this.navCtrl.push('MapsPage');
  }
  doGetPengiriman() {
    this.api.get("tablenav", { params: { limit: 30, table: "t_registrasitruk", filter: "Status=1", sort: "TglPengiriman DESC, IdTruk DESC" } })
      .subscribe(val => {
        this.pengiriman = val['data']
      });
  }
  doDetailPengiriman(book) {
    console.log(book)
    this.navCtrl.push('DetailpengirimanPage', {
      noregistrasitruck: book.NoRegistrasiTruk,
      idtruk: book.IdTruk,
      book: book
    });
  }

}
