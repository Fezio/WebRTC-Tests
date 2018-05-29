var chromeMediaSource = 'screen';
var sourceId;
var screenCallback;
var isFirefox = typeof window.InstallTrigger !== 'undefined';
var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
var isChrome = !!window.chrome && !isOpera;

class screenShare {

    constructor() {
        window.addEventListener('message', function (event) {
            if (event.origin != window.location.origin) {
                return;
            }

            onMessageCallback(event.data);
        });
    }

    onMessageCallback(data) {
        if (data == 'PermissionDeniedError') {
            chromeMediaSource = 'PermissionDeniedError';
            if (screenCallback) return screenCallback('PermissionDeniedError');
            else throw new Error('PermissionDeniedError');
        }

        if (data == 'rtcmulticonnection-extension-loaded') {
            chromeMediaSource = 'desktop';
        }

        if (data.sourceId && screenCallback) {
            screenCallback(sourceId = data.sourceId, data.canRequestAudioTrack === true);
        }
    }

    isChromeExtensionAvailable(callback) {
        if (!callback) return;

        if (chromeMediaSource == 'desktop') return callback(true);

        window.postMessage('are-you-there', '*');

        setTimeout(function () {
            if (chromeMediaSource == 'screen') {
                callback(false);
            } else callback(true);
        }, 2000);
    }

    getSourceId(callback) {
        if (!callback) throw '"callback" parameter is mandatory.';
        if (sourceId) return callback(sourceId);

        screenCallback = callback;
        window.postMessage('get-sourceId', '*');
    }

    getSourceIdWithAudio(callback) {
        if (!callback) throw '"callback" parameter is mandatory.';
        if (sourceId) return callback(sourceId);

        screenCallback = callback;
        window.postMessage('audio-plus-tab', '*');
    }

    getChromeExtensionStatus(extensionid, callback) {
        if (isFirefox) return callback('not-chrome');

        if (arguments.length != 2) {
            callback = extensionid;
            extensionid = 'ajhifddimkapgcifgcodmmfdlknahffk';
        }

        var image = document.createElement('img');
        image.src = 'chrome-extension://' + extensionid + '/icon.png';
        image.onload = function () {
            chromeMediaSource = 'screen';
            window.postMessage('are-you-there', '*');
            setTimeout(function () {
                if (chromeMediaSource == 'screen') {
                    callback('installed-disabled');
                } else callback('installed-enabled');
            }, 2000);
        };
        image.onerror = function () {
            callback('not-installed');
        };
    }

    getScreenConstraintsWithAudio(callback) {
        getScreenConstraints(callback, true);
    }

    getScreenConstraints(callback, captureSourceIdWithAudio) {
        var firefoxScreenConstraints = {
            mozMediaSource: 'window',
            mediaSource: 'window'
        };

        if (isFirefox) return callback(null, firefoxScreenConstraints);

        var screen_constraints = {
            mandatory: {
                chromeMediaSource: chromeMediaSource,
                maxWidth: screen.width > 1920 ? screen.width : 1920,
                maxHeight: screen.height > 1080 ? screen.height : 1080
            },
            optional: []
        };

        if (chromeMediaSource == 'desktop' && !sourceId) {
            if (captureSourceIdWithAudio) {
                getSourceIdWithAudio(function (sourceId, canRequestAudioTrack) {
                    screen_constraints.mandatory.chromeMediaSourceId = sourceId;

                    if (canRequestAudioTrack) {
                        screen_constraints.canRequestAudioTrack = true;
                    }
                    callback(sourceId == 'PermissionDeniedError' ? sourceId : null, screen_constraints);
                });
            }
            else {
                getSourceId(function (sourceId) {
                    screen_constraints.mandatory.chromeMediaSourceId = sourceId;
                    callback(sourceId == 'PermissionDeniedError' ? sourceId : null, screen_constraints);
                });
            }
            return;
        }

        if (chromeMediaSource == 'desktop') {
            screen_constraints.mandatory.chromeMediaSourceId = sourceId;
        }

        callback(null, screen_constraints);
    }
}