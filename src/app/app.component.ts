import { ApplicationRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'PNHosting';
  subData:any ;
  private readonly publicKey = 'BFJ9ef5_JjxJRAJty47DhJhjW_oqW9gBMfGL-S6aSUzIFVfmYtZ9HJoRHUcQ4uChuFCJBXS7dmY8bd5oWUhptL0';
  constructor(private http: HttpClient, private update: SwUpdate, private appRef: ApplicationRef, private swPush: SwPush){
    this.updateClient();
    this.checkUpdate();
  }

  ngOnInit(){
    this.pushSubscription();
    this.swPush.messages.subscribe((message) => console.log(message));
    this.swPush.notificationClicks.subscribe(({action, notification}) =>{
      window.open(notification.data.url)
    });

  }

  updateClient() {
    console.log ('working..')
    if(!this.update.isEnabled){
      console.log('Not Enabled');
      return;
    }
    this.update.available.subscribe((event) => {
      console.log(`current`,event.current,`available`,event.available);
      if(confirm('Update available for the App. Please Confirm!')){
        this.update.activateUpdate().then(() => location.reload());
      }
    })

    this.update.activated.subscribe((event) => {
      console.log(`current`,event.previous,`available`,event.current);
    })
  }

  checkUpdate() {
    this.appRef.isStable.subscribe((isStable) => {
      if(!isStable) {
        const timeInterval = interval(8 * 60 * 60 * 1000);

        timeInterval.subscribe(() => {
          this.update.checkForUpdate().then(() => console.log('checked'));
          console.log('update checked');
        })
      }
    })
  }
  pushSubscription() {
    if(!this.swPush.isEnabled) {
      console.log('Notification is not Enabled!');
      return;
    }

    this.swPush.requestSubscription({
      serverPublicKey: this.publicKey,

    }).then(sub => {
      this.subData = (JSON.stringify(sub));
      console.log(JSON.stringify(sub))}).catch(err => console.log('push error',err));
  }
}
