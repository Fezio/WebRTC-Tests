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
  @ViewChild('init') init: ElementRef;

  private peer: Peer;
  public stream: MediaStream;

  constructor(
    private screenCaptureService: ScreenCaptureService
  ) {
    this.peer = null;
    this.stream = null;
  }

  getDevices() {
    return new Promise<any>((resolve, reject) => {
      navigator.mediaDevices.getUserMedia({
        audio: true
      })
        .then(stream => {
          this.peer = new Peer({
            initiator: this.init.nativeElement.checked,
            trickle: true,
            streams: [stream]
          });

          this.peer
            .on('signal', data => {
              if (!data.renegotiate) {
                this.data.nativeElement.value += JSON.stringify(data) + '\n\n';
              }
            })
            .on('stream', stream => {
              console.log('onstream', stream);
              this.audio.nativeElement.srcObject = stream;
            })
            .on('track', (track, stream) => {
              console.log('ontrack', track, stream);
            })
            .on('connect', () => {
              console.log('CONNECT!');
            })
            .on('error', error => {
              console.error(error);
            });

          resolve(this.peer);
        })
        .catch(error => {
          reject(error);
        });
    });
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
                  this.peer.addTrack(stream.getVideoTracks()[0], this.peer.streams[0]);
                  console.log(this.peer);

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
    // this.getDevices();
  }

  makeConnect() {
    if (this.peer) {
      const signals = this.connect.nativeElement.value.split('\n\n');
      console.log(signals);
      signals.forEach(signal => {
        if (signal) {
          this.peer.signal(signal);
        }
      });
    } else {
      alert('Нажми "get devices"');
    }
  }

  clear() {
    this.connect.nativeElement.value = '';
  }
}
