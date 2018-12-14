import { Component } from '@angular/core';
import { Platform, LoadingController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpHeaders } from "@angular/common/http";
import { Insomnia } from '@ionic-native/insomnia';

declare var window;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = 'LogintrukPage';
  public loading: any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private insomnia: Insomnia, public loadingCtrl: LoadingController) {
    platform.ready().then(() => {
      /*setInterval(() => {
        console.clear()
      }, 500);*/
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      this.insomnia.keepAwake()
        .then(
          () => console.log('success'),
          () => console.log('error')
        );
      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      this.loading.present().then(() => {
        window.plugins.insomnia.keepAwake()
        this.loading.dismiss()
      });
    });
  }
}

