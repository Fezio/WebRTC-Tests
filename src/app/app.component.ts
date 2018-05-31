import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ScreenCaptureService } from './services/screen-capture.service';

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
  @ViewChild('myScreen') myScreen: ElementRef;

  private peer: Peer;
  public stream: MediaStream;

  constructor(
    private screenCaptureService: ScreenCaptureService
  ) {
    this.peer = null;
    this.stream = null;
  }

  captureScreen() {
    if (!this.stream.getVideoTracks().length) {
      this.screenCaptureService.getChromeExtensionStatus('oeglgaaacncnbkcngjafcbijikpnadke', (callback) => {
        if (callback === 'installed-enabled') {
          this.screenCaptureService.getSourceId(() => {
            this.screenCaptureService.captureUserMedia(constraints => {
              console.log(constraints);
              navigator.getUserMedia(
                constraints,
                stream => {
                  this.peer.addTrack(stream.getVideoTracks()[0], this.stream);
                  // console.log(this.stream.getTracks());
                  // console.log(this.peer.stream.getTracks());

                  this.myScreen.nativeElement.srcObject = stream;
                  this.myScreen.nativeElement.muted = true;
                  this.myScreen.nativeElement.play();
                },
                error => {
                  console.error(error);
                });
            });
          });
        } else {
          console.error('ExtentionStatusError: ', callback);
        }
      });
    }
    /* else {
      this.stream.getVideoTracks()[0].enabled = true;
      this.myScreen.nativeElement.srcObject = this.stream;
      this.myScreen.nativeElement.play();
    } */
  }

  stopCapturing() {
    this.myScreen.nativeElement.pause();
    this.myScreen.nativeElement.srcObject = null;
    this.stream.removeTrack(this.stream.getVideoTracks()[0]);

    this.screenCaptureService.screenCallback = null;
    this.screenCaptureService.chromeMediaSource = null;
    this.screenCaptureService.chromeMediaSourceId = null;
  }

  ngOnInit() {
    navigator.getUserMedia({
      audio: true
    },
      stream => {
        this.stream = stream;
        this.peer = new Peer({
          initiator: location.hash === '#init',
          trickle: false,
          stream: this.stream,
        });

        this.getData();
      },
      error => {
        console.error(error);
      });
  }

  getData() {
    this.data.nativeElement.value = '';
    this.peer
      .on('signal', data => {
        this.data.nativeElement.value += JSON.stringify(data);
      })
      .on('stream', stream => {
        console.log('onstream', stream);
        this.audio.nativeElement.srcObject = stream;
      })
      .on('track', (track, stream) => {
        console.log('ontrack', track, stream);
      })
      .on('error', error => {
        console.error(error);
      });
  }

  makeConnect() {
    this.peer.signal(this.connect.nativeElement.value);
  }

  clear() {
    this.connect.nativeElement.value = '';
  }
}
