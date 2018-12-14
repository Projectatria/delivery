import { Component, ElementRef, ViewChild } from '@angular/core';
import { App, ToastController, IonicPage, NavController, LoadingController, NavParams } from 'ionic-angular';
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

declare var google;
declare var Email;

@IonicPage()
@Component({
  selector: 'page-maps',
  templateUrl: 'maps.html'
})

export class MapsPage {

  public loading: any;
  public nobooking: any;
  public detailsales = [];
  public name: any;
  public address: any;
  public telp: any;
  public latitude: any;
  public longitude: any;
  public jaraktempuh: any;
  public waktuperjalanan: any;
  public interval: any;
  public directionsService: any;
  public directionsDisplay: any;
  public token: any;
  public status: any;
  public book: any;
  public detailbook: any;
  public intervalcust: any;
  public userid: any;
  public notruk: any;
  public start = false;
  public idtruk: any;
  map: GoogleMap;

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public navParam: NavParams,
    public toastCtrl: ToastController,
    public app: App,
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
      this.nobooking = this.navParam.get('nobooking')
      this.book = this.navParam.get('book')
      this.detailbook = this.navParam.get('detailbook')
      this.userid = this.navParam.get('userid')
      this.notruk = this.navParam.get('notruk')
      this.idtruk = this.navParam.get('idtruk')
      this.interval = setInterval(() => {
        let option: MyLocationOptions = {
          enableHighAccuracy: true
        }
        LocationService.getMyLocation(option).then((location: MyLocation) => {
          let lat = location.latLng.lat
          let lon = location.latLng.lng
          let idtruck = this.idtruk
          console.log(idtruck)
          if (idtruck) {
            this.api.get("table/latlon", { params: { limit: 1, filter: "id_truck='" + idtruck + "' AND status = 'OPEN'", sort: "datetime" + " DESC " } })
              .subscribe(val => {
                let data = val['data']
                if (data.length > 0) {
                  if (data[0].latitude.substring(0, 8) == lat.toString().substring(0, 8) && data[0].longitude.substring(0, 9) == lon.toString().substring(0, 9)) {
                  }
                  else {
                    this.doInsert(lat, lon)
                  }
                }
                else {
                  this.doInsert(lat, lon)
                }
              });
          }
        });
      }, 5000);
    });
    this.status = '0'
    this.doGetToken()
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present().then(() => {
      this.nobooking = this.navParam.get('nobooking')
      this.book = this.navParam.get('book')
      console.log('book', this.book)
      this.detailbook = this.navParam.get('detailbook')
      this.userid = this.navParam.get('userid')
      this.notruk = this.navParam.get('notruk')
      this.idtruk = this.navParam.get('idtruk')
      this.interval = setInterval(() => {
        let option: MyLocationOptions = {
          enableHighAccuracy: true
        }
        LocationService.getMyLocation(option).then((location: MyLocation) => {
          let lat = location.latLng.lat
          let lon = location.latLng.lng
          let idtruck = this.idtruk
          console.log(idtruck)
          if (idtruck) {
            this.api.get("table/latlon", { params: { limit: 1, filter: "id_truck='" + idtruck + "' AND status = 'OPEN'", sort: "datetime" + " DESC " } })
              .subscribe(val => {
                let data = val['data']
                if (data.length > 0) {
                  if (data[0].latitude.substring(0, 8) == lat.toString().substring(0, 8) && data[0].longitude.substring(0, 9) == lon.toString().substring(0, 9)) {
                  }
                  else {
                    this.doInsert(lat, lon)
                  }
                }
                else {
                  this.doInsert(lat, lon)
                }
              });
          }
        });
      }, 5000);
      console.log(this.book)
      this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Trans_ Sales Entry", filter: "[Receipt No_]=" + "'" + this.nobooking + "' AND [Retail SO No_] != ''" } })
        .subscribe(val => {
          let data = val['data']
          let retailno = data[0]['Retail SO No_']
          this.api.get("tablenav", { params: { limit: 30, table: "CSB_LIVE$Sales Header Archive", filter: "[No_]=" + "'" + retailno + "'" } })
            .subscribe(val => {
              this.detailsales = val['data']
              this.name = this.detailsales[0]['Ship-to Name']
              this.address = this.detailsales[0]['Ship-to Address'] + " " + this.detailsales[0]['Ship-to Address 2'] + " " + this.detailsales[0]['Ship-to City']
              this.telp = this.detailsales[0]['Ship-to Phone No_']
              let dataurl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + this.address + '&key=AIzaSyD__mKOUHF8rXqCUfn1iQisB6RzLoNrKwc'
              var self = this;
              this.readTextFile(dataurl, function (text) {
                var datalatlon = JSON.parse(text);
                self.latitude = datalatlon.results[0].geometry.location.lat
                self.longitude = datalatlon.results[0].geometry.location.lng
                let latitude = datalatlon.results[0].geometry.location.lat
                let longitude = datalatlon.results[0].geometry.location.lng
                self.initMapGoogleNative(latitude, longitude)
                self.directionsService = new google.maps.DirectionsService;
                self.directionsDisplay = new google.maps.DirectionsRenderer;
                self.loading.dismiss()
              });
            });

        });
    })
  }
  ionViewDidLoad() {
  }
  ionViewWillLeave() {
    //window.clearInterval(this.interval)
  }
  initMapGoogleNative(latitude, longitude) {
    let option: MyLocationOptions = {
      enableHighAccuracy: true
    }
    LocationService.getMyLocation(option).then((location: MyLocation) => {
      this.directionsService.route({
        origin: { lat: location.latLng.lat, lng: location.latLng.lng },
        destination: { lat: latitude, lng: longitude },
        travelMode: 'DRIVING'
      }, (response, status) => {
        if (status === 'OK') {
          console.log(response)
          console.log(response.routes[0].legs[0].steps[0].start_location)
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      });
      let dataurldestination = 'https://maps.googleapis.com/maps/api/directions/json?origin=' + location.latLng.lat + "," + location.latLng.lng + '&destination=' + latitude + ',' + longitude + '&key=AIzaSyD__mKOUHF8rXqCUfn1iQisB6RzLoNrKwc'
      var self = this;
      this.readTextFile(dataurldestination, function (text) {
        var datadestination = JSON.parse(text);
        console.log(datadestination)
        var line = [];
        self.jaraktempuh = datadestination.routes[0].legs[0].distance.text
        self.waktuperjalanan = datadestination.routes[0].legs[0].duration.text
        for (let i = 0; i < datadestination.routes[0].legs[0].steps.length; i++) {
          line.push(datadestination.routes[0].legs[0].steps[i].start_location);
        }
        console.log(line)
        self.map.addPolyline({
          points: line,
          color: '#0e5ae2',
          width: 5,
          geodesic: true,
          clickable: true
        }).then((polyline: Polyline) => {
          polyline.on(GoogleMapsEvent.POLYLINE_CLICK).subscribe((params: any) => {
            let position: LatLng = <LatLng>params[0];
            self.map.addMarker({
              position: position,
              title: position.toUrlValue(),
              disableAutoPan: true
            }).then((marker: Marker) => {
              marker.showInfoWindow();
            })
          })
        })
      });
      let mapOptions: GoogleMapOptions = {
        camera: {
          target: {
            lat: location.latLng.lat,
            lng: location.latLng.lng
          },
          zoom: 9,
          tilt: 0
        }
      };

      this.map = GoogleMaps.create('map_canvas', mapOptions);

      let options: MarkerOptions = {
        icon: {
          url: 'http://101.255.60.202/webapi5/img/car',

          size: {
            width: 40,
            height: 32
          }
        },

        /*title: 'Hello World',
      
        snippet: '@ionic-native/google-maps',*/

        position: { lat: location.latLng.lat, lng: location.latLng.lng },

        /*infoWindowAnchor: [16, 0],
      
        anchor: [16, 32],
      
        draggable: true,
      
        flat: false,*/

        rotation: 0,

        visible: true,

        styles: {
          'text-align': 'center',
          'font-style': 'italic',
          'font-weight': 'bold',
          'color': 'red'
        },

        animation: GoogleMapsAnimation.DROP,

        zIndex: 0,

        disableAutoPan: true
      };

      this.map.addMarker(options).then((marker: Marker) => {

        marker.showInfoWindow();

      });

      let markerdestination: Marker = this.map.addMarkerSync({
        title: this.name,
        icon: 'red',
        animation: 'DROP',
        position: {
          lat: latitude,
          lng: longitude
        }
      });
      markerdestination.showInfoWindow();
      markerdestination.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
        markerdestination.showInfoWindow()
      });
    })
  }
  ngAfterViewInit() {
  }
  doMaps() {
    let url = 'https://www.google.com/maps/dir/?api=1&destination=' + this.latitude + "," + this.longitude
    window.location.href = url
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
  doInsert(lat, lon) {
    this.api.get('nextno/latlon/id')
      .subscribe(val => {
        let nextno = val['nextno'];
        const headers = new HttpHeaders()
          .set("Content-Type", "application/json");
        this.api.post("table/latlon",
          {
            "id": nextno,
            "booking_no": '',
            "id_truck": this.book[0].IdTruk,
            "id_driver": this.userid,
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
      });
  }
  doInsertGoToCust(lat, lon) {
    this.api.get('nextno/latlon/id')
      .subscribe(val => {
        let nextno = val['nextno'];
        const headers = new HttpHeaders()
          .set("Content-Type", "application/json");
        this.api.post("table/latlon",
          {
            "id": nextno,
            "booking_no": this.detailbook.NoBooking,
            "id_truck": this.book[0].IdTruk,
            "id_driver": this.userid,
            "installer_1": this.book[0].Installer1,
            "installer_2": this.book[0].Installer2,
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
      });
  }
  doGetToken() {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.gettokensms("api/login",
      {
        "userid": 'sa',
        "password": 'masterpass@w0rd10'
      },
      { headers })
      .subscribe(
        (val) => {
          console.log(val)
          this.token = val['access_token']
          console.log(this.token)
        });
  }
  doSendSMS() {
    this.start = true;
    clearInterval(this.interval)
    this.intervalcust = setInterval(() => {
      let option: MyLocationOptions = {
        enableHighAccuracy: true
      }
      LocationService.getMyLocation(option).then((location: MyLocation) => {
        let lat = location.latLng.lat
        let lon = location.latLng.lng
        let idtruck = this.idtruk
        console.log(idtruck)
        if (idtruck) {
          this.api.get("table/latlon", { params: { limit: 1, filter: "id_truck='" + idtruck + "' AND status = 'OPEN'", sort: "datetime" + " DESC " } })
            .subscribe(val => {
              let data = val['data']
              if (data.length > 0) {
                if (data[0].latitude.substring(0, 8) == lat.toString().substring(0, 8) && data[0].longitude.substring(0, 9) == lon.toString().substring(0, 9)) {
                }
                else {
                  this.doInsertGoToCust(lat, lon)
                }
              }
              else {
                this.doInsertGoToCust(lat, lon)
              }
            });
        }
      });
    }, 5000);
    var self = this;
    /*console.log(this.token)
    const headers = new HttpHeaders()
      .set("Authorization", "Bearer " + this.token);
    this.api.postsendsms("api/SMS/SendSMS",
      {
        "no": '08159596494',
        "pesan": 'test',
        "ultah": '0'
      },
      { headers })
      .subscribe(
        (val) => {
          console.log(val)
        });*/
    this.status = '1'
    let toast = self.toastCtrl.create({
      message: 'Pekerjaan dimulai',
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
    var datetime = moment().format('DD MMMM YYYY HH:mm')
    var templateemail = [
      '<tr><td><table cellspacing="0" cellpadding="0" border="0" align="center" style="border-collapse:collapse;background-color:#ffffff;max-width:600px;border:1px solid #e0e0e0"><tr><td style="padding:10px 10px 10px;" bgcolor="#000000"><table cellspacing="0" cellpadding="0" width="100%" style="border-collapse:collapse;color:#ffffff"><tr><td width="280"><a href="http://atria.co.id"><img src="http://diskonbuzz.com/admin/images/merchantlogo/4365.jpg" title="Atria Inspiring Living" alt="Atria Inspiring Living" style="height:60px"/></a></td><td width="280" align="right" style="font-size:16px;line-height:1.5"></td></tr></table></td></tr><tr><td style="font-size:16px;padding:16px 12px 0;font-weight:bold;color:rgba(0,0,0,0.72);line-height:24px">Halo ' + this.name + ',</td></tr><tr><td style="padding:2px 12px"><table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;font-size:13px"><tr><td style="line-height:1.67;color:rgba(0,0,0,0.72);font-size:13px">Truk pengiriman paket anda sedang dalam perjalanan, untuk info klik link dibawah ini : </td></tr></table></td></tr><tr><td style="padding:10px 12px"><table cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;width:100%;text-align:center;padding:10px;border-bottom-width:0;border-radius:3px 3px 0px 0px"><tr><td><div><a href="http://atria.co.id" style="margin-top:2px;color:#42b549;font-size:14px;line-height:24px;line-height:1.85;font-weight:600;text-decoration:none" target="_blank">http://atria.co.id</a></div></td></tr></table><table cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;width:100%;padding:12px 12px 20px 12px;border-bottom-width:1px"><tr><td align="left"><div><div style="margin-top:5px;font-size:10px;line-height:12px;color:#000;opacity:0.38">' + datetime + ' ' + 'WIB</div></div></td></tr><tr><td></td></tr></table></td></tr>'
    ]
    Email.send("omegamediastreaming@gmail.com",
      "ajidwip6@gmail.com",
      "Paket anda sedang dalam perjalanan",
      templateemail,
      "smtp.gmail.com",
      "omegamediastreaming@gmail.com",
      "Utadahikaru227",
      function done(message) {
        console.log(message)
      });
  }
  doSampaiTujuan() {
    clearInterval(this.intervalcust)
    this.app.getRootNav().setRoot('DetailpengirimanPage', {
      noregistrasitruck: this.book[0].NoRegistrasiTruk,
      notruk: this.notruk,
      idtruk: this.book[0].IdTruk,
      book: this.book,
      userid: this.userid
    })
  }

}
