import { Component } from '@angular/core';
import { App, AlertController, IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
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
import { Md5 } from 'ts-md5/dist/md5';

declare var gapi: any;

@IonicPage()
@Component({
  selector: 'page-detailpengiriman',
  templateUrl: 'detailpengiriman.html',
})
export class DetailpengirimanPage {

  public loading: any;
  public detailpengiriman = [];
  public idtruk: any;
  public noregistrasitruk: any;
  public detailsales = [];
  public datatr = [];
  public no: any;
  public name: any;
  public address: any;
  public telp: any;
  public latitude: any;
  public longitude: any;
  public jaraktempuh: any;
  public waktuperjalanan: any;
  public pushdata = [];
  public pushjarak = [];
  public book = [];
  public notruk: any;
  public userid: any;
  map: GoogleMap;
  public interval: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public app: App,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
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
      this.noregistrasitruk = this.navParams.get('noregistrasitruck')
      this.idtruk = this.navParams.get('idtruk')
      this.notruk = this.navParams.get('notruk')
      this.userid = this.navParams.get('userid')
      this.book = this.navParams.get('book')
      this.interval = setInterval(() => {
        let idtruck = this.idtruk
        let iddriver = this.userid
        let option: MyLocationOptions = {
          enableHighAccuracy: true
        }
        LocationService.getMyLocation(option).then((location: MyLocation) => {
          let lat = location.latLng.lat
          let lon = location.latLng.lng
          if (idtruck && iddriver) {
            this.api.get("table/latlon", { params: { limit: 1, filter: "id_truck='" + idtruck + "' AND status = 'OPEN'", sort: "datetime" + " DESC " } })
              .subscribe(val => {
                let data = val['data']
                if (data.length > 0) {
                  if (data[0].latitude.substring(0, 8) == lat.toString().substring(0, 8) && data[0].longitude.substring(0, 9) == lon.toString().substring(0, 9)) {
                  }
                  else {
                    this.doInsert(lat, lon, idtruck, iddriver)
                  }
                }
                else {
                  this.doInsert(lat, lon, idtruck, iddriver)
                }
              });
          }
        });
      }, 5000);
    });
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present().then(() => {
      this.noregistrasitruk = this.navParams.get('noregistrasitruck')
      this.idtruk = this.navParams.get('idtruk')
      this.notruk = this.navParams.get('notruk')
      this.userid = this.navParams.get('userid')
      console.log(this.notruk)
      this.book = this.navParams.get('book')
      console.log(this.noregistrasitruk, this.idtruk, this.book)
      this.interval = setInterval(() => {
        let idtruck = this.idtruk
        let iddriver = this.userid
        let option: MyLocationOptions = {
          enableHighAccuracy: true
        }
        LocationService.getMyLocation(option).then((location: MyLocation) => {
          let lat = location.latLng.lat
          let lon = location.latLng.lng
          if (idtruck && iddriver) {
            this.api.get("table/latlon", { params: { limit: 1, filter: "id_truck='" + idtruck + "' AND status = 'OPEN'", sort: "datetime" + " DESC " } })
              .subscribe(val => {
                let data = val['data']
                if (data.length > 0) {
                  if (data[0].latitude.substring(0, 8) == lat.toString().substring(0, 8) && data[0].longitude.substring(0, 9) == lon.toString().substring(0, 9)) {
                  }
                  else {
                    this.doInsert(lat, lon, idtruck, iddriver)
                  }
                }
                else {
                  this.doInsert(lat, lon, idtruck, iddriver)
                }
              });
          }
        });
      }, 5000);
      this.doGetDetailPengiriman()
    });
  }
  doInsert(lat, lon, idtruck, iddriver) {
    this.api.get('nextno/latlon/id')
      .subscribe(val => {
        let nextno = val['nextno'];
        const headers = new HttpHeaders()
          .set("Content-Type", "application/json");
        this.api.post("table/latlon",
          {
            "id": nextno,
            "id_truck": idtruck,
            "id_driver": iddriver,
            "latitude": lat,
            "longitude": lon,
            "datetime": moment().format('YYYY-MM-DD HH:mm:ss'),
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
  ngAfterViewInit() {
  }

  doGetDetailPengiriman() {
    this.api.get("tablenav", { params: { limit: 30, table: "t_pengiriman", filter: "NoRegistrasiTruk=" + "'" + this.noregistrasitruk + "' AND NoBooking LIKE '0%'", sort: "NoUrutKirim ASC" } })
      .subscribe(val => {
        this.detailpengiriman = val['data']
        let data = val['data']
        for (let i = 0; i < data.length; i++) {
          this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Trans_ Sales Entry", filter: "[Receipt No_]=" + "'" + data[i].NoBooking + "' AND [Retail SO No_] != ''" } })
            .subscribe(val => {
              let datatr = val['data']
              this.datatr.push(datatr[0])
              if (datatr.length != 0) {
                this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Sales Header Archive", filter: "[No_]=" + "'" + datatr[0]['Retail SO No_'] + "'" } })
                  .subscribe(val => {
                    let detailsales = val['data']
                    this.no = detailsales[0].No_
                    this.name = detailsales[0]['Ship-to Name']
                    this.address = detailsales[0]['Ship-to Address'] + " " + detailsales[0]['Ship-to Address 2'] + " " + detailsales[0]['Ship-to City']
                    this.telp = detailsales[0]['Ship-to Phone No_']
                    var array = [this.no, this.name, this.address, this.telp]
                    this.pushdata.push(array)
                    let dataurl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + this.address + '&key=AIzaSyD__mKOUHF8rXqCUfn1iQisB6RzLoNrKwc'
                    var self = this;
                    let no = this.no
                    this.readTextFile(dataurl, function (text) {
                      var datalatlon = JSON.parse(text);
                      self.latitude = datalatlon.results[0].geometry.location.lat
                      self.longitude = datalatlon.results[0].geometry.location.lng
                      let latitude = datalatlon.results[0].geometry.location.lat
                      let longitude = datalatlon.results[0].geometry.location.lng
                      self.initMapGoogleNative(latitude, longitude, no)
                    });
                  });
              }
            });
        }
        this.loading.dismiss()
      });
  }
  initMapGoogleNative(latitude, longitude, no) {
    let option: MyLocationOptions = {
      enableHighAccuracy: true
    }
    LocationService.getMyLocation(option).then((location: MyLocation) => {
      let dataurldestination = 'https://maps.googleapis.com/maps/api/directions/json?origin=' + location.latLng.lat + "," + location.latLng.lng + '&destination=' + latitude + ',' + longitude + '&key=AIzaSyD__mKOUHF8rXqCUfn1iQisB6RzLoNrKwc'
      var self = this;
      this.readTextFile(dataurldestination, function (text) {
        var datadestination = JSON.parse(text);
        var line = [];
        console.log(datadestination)
        self.jaraktempuh = datadestination.routes[0].legs[0].distance.text
        self.waktuperjalanan = datadestination.routes[0].legs[0].duration.text
        var arrayjarak = [no, self.jaraktempuh, self.waktuperjalanan]
        self.pushjarak.push(arrayjarak)
      });
    })
  }
  readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
      if (rawFile.readyState === 4) {
        callback(rawFile.responseText);
      }
    }
    rawFile.send(null);
  }
  doMaps(detailbook) {
    clearInterval(this.interval)
    console.log('detailbook', detailbook)
    this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Trans_ Sales Entry", filter: "[Receipt No_]=" + "'" + detailbook.NoBooking + "' AND [Retail SO No_] != ''" } })
      .subscribe(val => {
        let data = val['data']
        if (data.length != '') {
          this.navCtrl.push('MapsPage', {
            nobooking: detailbook.NoBooking,
            book: this.book,
            detailbook: detailbook,
            userid: this.userid,
            notruk: this.notruk,
            idtruk: this.idtruk
          });
        }
        else {
          console.log('error')
        }
      });
  }
  doSettings() {
    let alert = this.alertCtrl.create({
      title: 'Change your password',
      inputs: [
        {
          name: 'passwordsebelumnya',
          placeholder: 'Password sebelumnya'
        },
        {
          name: 'passwordbaru',
          placeholder: 'Password baru'
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
          text: 'OK',
          handler: data => {
            this.api.get('table/user', { params: { filter: "id_user=" + "'" + this.userid + "'" } })
              .subscribe(val => {
                let datauser = val['data']
                console.log(datauser)
                let password = Md5.hashStr(data.passwordsebelumnya)
                if (password == datauser[0].password) {
                  let passwordbaru = Md5.hashStr(data.passwordbaru)
                  const headers = new HttpHeaders()
                    .set("Content-Type", "application/json");
                  this.api.put("table/user",
                    {
                      "id_user": this.userid,
                      "password": passwordbaru
                    },
                    { headers })
                    .subscribe(
                      (val) => {
                        let alert = this.alertCtrl.create({
                          subTitle: 'Sukses',
                          buttons: ['OK']
                        });
                        alert.present();
                      });
                }
                else {
                  let alert = this.alertCtrl.create({
                    subTitle: 'Password salah',
                    buttons: ['OK']
                  });
                  alert.present();
                }
              })
          }
        }
      ]
    });
    alert.present();
  }
  doLogout() {
    let alert = this.alertCtrl.create({
      title: 'Confirm Logout',
      message: 'Do you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Logout',
          handler: () => {
            clearInterval(this.interval)
            this.app.getRootNav().setRoot('LoginPage', {
              truck: this.notruk,
              idtruck: this.idtruk
            })
          }
        }
      ]
    });
    alert.present();
  }

}
