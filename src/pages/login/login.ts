import { Component, ElementRef, ViewChild } from '@angular/core';
import { AlertController, App, IonicPage, NavController, LoadingController, NavParams } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Http, Headers, RequestOptions } from '@angular/http';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Insomnia } from '@ionic-native/insomnia';
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
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  myForm: FormGroup;
  public loading: any;
  public truck: any;
  public notruck: any;
  public idtruck: any;
  public token: any;
  public pengiriman = [];
  public interval: any;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public app: App,
    public loadingCtrl: LoadingController,
    public fb: FormBuilder,
    public navParams: NavParams,
    public storage: Storage,
    public api: ApiProvider,
    public backgroundMode: BackgroundMode,
    private insomnia: Insomnia) {
    this.insomnia.keepAwake()
      .then(
        () => console.log('success'),
        () => console.log('error')
      );
    this.backgroundMode.enable();
    this.backgroundMode.on("activate").subscribe(() => {
      console.log('background mode')
      this.truck = this.navParams.get('truck')
      setInterval(() => {
        this.storage.get('idtruck').then((val) => {
          this.idtruck = val;
        });
        this.storage.get('notruck').then((val) => {
          this.notruck = val;
          this.truck = this.notruck
        });
      }, 1000);
      this.interval = setInterval(() => {
        let idtruck = this.idtruck
        let option: MyLocationOptions = {
          enableHighAccuracy: true
        }
        LocationService.getMyLocation(option).then((location: MyLocation) => {
          let lat = location.latLng.lat
          let lon = location.latLng.lng
          if (idtruck) {
            this.api.get("table/latlon", { params: { limit: 1, filter: "id_truck='" + idtruck + "' AND status = 'OPEN'", sort: "datetime" + " DESC " } })
              .subscribe(val => {
                let data = val['data']
                if (data.length > 0) {
                  if (data[0].latitude.substring(0, 8) == lat.toString().substring(0, 8) && data[0].longitude.substring(0, 9) == lon.toString().substring(0, 9)) {
                  }
                  else {
                    this.doInsert(lat, lon, idtruck)
                  }
                }
                else {
                  this.doInsert(lat, lon, idtruck)
                }
              });
          }
        });
      }, 5000);
    });
    this.truck = this.navParams.get('truck')
    setInterval(() => {
      this.storage.get('idtruck').then((val) => {
        this.idtruck = val;
      });
      this.storage.get('notruck').then((val) => {
        this.notruck = val;
        this.truck = this.notruck
      });
    }, 1000);
    this.interval = setInterval(() => {
      let idtruck = this.idtruck
      let option: MyLocationOptions = {
        enableHighAccuracy: true
      }
      LocationService.getMyLocation(option).then((location: MyLocation) => {
        let lat = location.latLng.lat
        let lon = location.latLng.lng
        if (idtruck) {
          this.api.get("table/latlon", { params: { limit: 1, filter: "id_truck='" + idtruck + "' AND status = 'OPEN'", sort: "datetime" + " DESC " } })
            .subscribe(val => {
              let data = val['data']
              if (data.length > 0) {
                if (data[0].latitude.substring(0, 8) == lat.toString().substring(0, 8) && data[0].longitude.substring(0, 9) == lon.toString().substring(0, 9)) {
                }
                else {
                  this.doInsert(lat, lon, idtruck)
                }
              }
              else {
                this.doInsert(lat, lon, idtruck)
              }
            });
        }
      });
    }, 5000);
    this.myForm = fb.group({
      userid: [''],
      password: ['']
    })
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present().then(() => {
      this.loading.dismiss()
    });

  }
  doInsert(lat, lon, idtruck) {
    this.api.get('nextno/latlon/id')
      .subscribe(val => {
        let nextno = val['nextno'];
        const headers = new HttpHeaders()
          .set("Content-Type", "application/json");
        this.api.post("table/latlon",
          {
            "id": nextno,
            "id_truck": idtruck,
            "latitude": lat.toString().substring(0, 7),
            "longitude": lon.toString().substring(0, 8),
            "datetime": moment().format('YYYY-MM-DD HH:mm:ss'),
            "devices" : 'MOBILE',
            "status": 'OPEN'
          },
          { headers })
          .subscribe(
            (val) => {
              console.log('sukses')
            });
      }, err => {
        console.log('')
      });
  }
  doLogoutTruck() {
    let alert = this.alertCtrl.create({
      title: 'Confirm Logout',
      inputs: [
        {
          name: 'password',
          placeholder: 'Password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Logout',
          handler: data => {
            if (data.password == 'atriapassword') {
              this.storage.clear()
              clearInterval(this.interval)
              this.app.getRootNav().setRoot('LogintrukPage')
              console.log('out')
            }
          }
        }
      ]
    });
    alert.present();
  }
  doLogin() {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.post("token",
      {
        "userid": this.myForm.value.userid,
        "password": this.myForm.value.password
      },
      { headers })
      .subscribe((val) => {
        this.token = val['token'];
        this.api.get("tablenav", { params: { limit: 30, table: "t_registrasitruk", filter: "Status=1 AND IdTruk='" + this.idtruck + "' AND TglPengiriman='" + moment().format('YYYY-MM-DD') + "'" } })
          .subscribe(val => {
            this.pengiriman = val['data']
            console.log(this.pengiriman)
            clearInterval(this.interval)
            this.app.getRootNav().setRoot('DetailpengirimanPage', {
              noregistrasitruck: this.pengiriman[0].NoRegistrasiTruk,
              notruk: this.notruck,
              idtruk: this.pengiriman[0].IdTruk,
              book: this.pengiriman,
              userid: this.myForm.value.userid
            })
          });
      }, err => {
        let alert = this.alertCtrl.create({
          subTitle: 'Password salah',
          buttons: ['OK']
        });
        alert.present();
        this.myForm.get('password').setValue('')
      });
  }
}
