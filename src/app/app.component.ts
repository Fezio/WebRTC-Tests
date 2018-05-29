import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';

import * as Peer from 'simple-peer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  @ViewChild('audio') audio: ElementRef;
  @ViewChild('data') data: ElementRef;
  @ViewChild('connect') connect: ElementRef;
  private peer: Peer;
  // private peer2: Peer;

  ngOnInit() {
    console.log(screenShare.getScreenConstraints);
    /* screenShare.getScreenConstraints(function (error, screen_constraints) {
      console.log(screen_constraints);
    }); */

    navigator.getUserMedia({
      audio: true
    },
      stream => {
        this.peer = new Peer({
          initiator: location.hash === '#init',
          trickle: false,
          stream: stream,
        });

        this.getData();
      },
      error => {
        console.error('getUserMedia error!');
      });
  }

  getData() {
    this.peer
      .on('signal', data => {
        this.data.nativeElement.value += JSON.stringify(data) + '\n\n';
      })
      .on('stream', stream => {
        this.audio.nativeElement.srcObject = stream;
      })
      .on('error', error => {
        console.error(error);
      });
    /* .on('connect', () => {
      alert('CONNECTED!');
    }); */
  }

  makeConnect() {
    this.peer.signal(this.connect.nativeElement.value);
  }

  clear() {
    this.connect.nativeElement.value = '';
  }
}
