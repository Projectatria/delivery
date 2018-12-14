import { Component, ElementRef, ViewChild } from '@angular/core';
import { App, IonicPage, NavController, LoadingController, AlertController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Http, Headers, RequestOptions } from '@angular/http';
import { Insomnia } from '@ionic-native/insomnia';
import { Storage } from '@ionic/storage';
import moment from 'moment';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker,
  LocationService,
  MyLocationOptions,
  MyLocation,
  GoogleMapsAnimation,
  Polyline,
  LatLng,
  Geocoder,
  GeocoderResult
} from '@ionic-native/google-maps';

@IonicPage()
@Component({
  selector: 'page-logintruk',
  templateUrl: 'logintruk.html',
})
export class LogintrukPage {
  myForm: FormGroup;
  public loading: any;
  public trucklist = [];
  public notruck: any;
  public idtruck: any;
  public interval: any;

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public storage: Storage,
    public fb: FormBuilder,
    public app: App,
    public api: ApiProvider,
    private insomnia: Insomnia) {
    this.insomnia.keepAwake()
      .then(
        () => console.log('success'),
        () => console.log('error')
      );
    this.storage.get('idtruck').then((val) => {
      this.idtruck = val;
    });
    this.storage.get('notruck').then((val) => {
      this.notruck = val;
      if (this.notruck == null) {

      }
      else {
        this.app.getRootNav().setRoot('LoginPage', {
          truck: this.notruck
        });
      }
    });
    this.myForm = fb.group({
      truck: [''],
      password: ['']
    })
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present().then(() => {
      this.doGetTruck()
      this.loading.dismiss()
    });

  }
  doGetTruck() {
    this.api.get("tablenav", { params: { limit: 30, table: "t_truk", filter: "Status=1 AND IdTruk != 'BA--002' AND IdTruk != '034-034'", sort: "NoTruk ASC" } })
      .subscribe(val => {
        this.trucklist = val['data']
      });
  }
  doLogin() {
    this.api.get("tablenav", { params: { limit: 30, table: "t_truk", filter: "Status = '1' AND NoTruk='" + this.myForm.value.truck + "'" } })
      .subscribe(val => {
        let truckdata = val['data']
        if (truckdata.length > 0) {
          this.api.get("table/truck_login", { params: { limit: 1, filter: "id_truck='" + truckdata[0].IdTruk + "' AND password='" + this.myForm.value.password + "'" } })
            .subscribe(val => {
              this.trucklist = val['data']
              if (this.trucklist.length > 0) {
                this.storage.set('idtruck', truckdata[0].IdTruk);
                this.storage.set('notruck', truckdata[0].NoTruk);
                this.app.getRootNav().setRoot('LoginPage', {
                  truck: this.myForm.value.truck,
                  idtruck: truckdata[0].IdTruk
                });
              }
              else {
                let alert = this.alertCtrl.create({
                  subTitle: 'Password salah',
                  buttons: ['OK']
                });
                alert.present();
                this.myForm.get('password').setValue('')
              }
            }, err => {
              let alert = this.alertCtrl.create({
                subTitle: 'Password salah',
                buttons: ['OK']
              });
              alert.present();
              this.myForm.get('password').setValue('')
            });
        }
        else {
          let alert = this.alertCtrl.create({
            subTitle: 'Truck Tidak Ditemukan',
            buttons: ['OK']
          });
          alert.present();
        }
      });
  }
}
