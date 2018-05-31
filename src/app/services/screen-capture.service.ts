import { Injectable } from '@angular/core';

@Injectable()
export class ScreenCaptureService {

  public chromeMediaSource;
  public chromeMediaSourceId;

  public videosContainer;

  public screenCallback;

  constructor() {
    this.chromeMediaSource = 'screen';
    this.chromeMediaSourceId = null;
    this.screenCallback = null;

    this.videosContainer = document.getElementById('videos-container') || document.body;

    window.addEventListener('message', event => {
      if (event.origin !== window.location.origin) {
        return;
      }

      this.onMessageCallback(event.data);
    });
  }

  onMessageCallback(data) {
    console.log(data);
    // "cancel" button is clicked
    if (data === 'PermissionDeniedError') {
      this.chromeMediaSource = 'PermissionDeniedError';
      if (this.screenCallback) {
        return this.screenCallback('PermissionDeniedError');
      } else {
        throw new Error('PermissionDeniedError');
      }
    }

    // extension notified his presence
    if (data === 'extention-is-ready') {
      this.chromeMediaSource = 'desktop';
    }

    // extension shared temp sourceId
    if (data.sourceId && this.screenCallback) {
      this.screenCallback(this.chromeMediaSourceId = data.sourceId, data.canRequestAudioTrack === true);
    }
  }

  getSourceId(callback) {
    if (!callback) {
      console.error('"callback" parameter is mandatory.');
    }
    if (this.chromeMediaSourceId) {
      return callback(this.chromeMediaSourceId);
    }

    this.screenCallback = callback;
    window.postMessage('get-sourceId', '*');
  }

  getChromeExtensionStatus(extensionid, callback) {
    if (!/Chrome/.test(navigator.userAgent)) {
      return callback('not-chrome');
    }

    const image = document.createElement('img');
    image.src = 'chrome-extension://' + extensionid + '/icon.png';
    image.onload = (() => {
      this.chromeMediaSource = 'screen';
      window.postMessage('are-you-there', '*');
      setTimeout(() => {
        if (this.chromeMediaSource === 'screen') {
          callback('installed-disabled');
        } else {
          callback('installed-enabled');
        }
      }, 2000);
    });
    image.onerror = function () {
      callback('not-installed');
    };
  }

  captureUserMedia(callback) {
    console.log('captureUserMedia chromeMediaSource', this.chromeMediaSource);
    const screen_constraints = {
      mandatory: {
        chromeMediaSource: this.chromeMediaSource,
        maxWidth: screen.width > 1920 ? screen.width : 1920,
        maxHeight: screen.height > 1080 ? screen.height : 1080,
        chromeMediaSourceId: this.chromeMediaSourceId,
      }
    };

    const constraints = {
      video: screen_constraints,
    };

    console.log(constraints);
    callback(constraints);
  }
}
