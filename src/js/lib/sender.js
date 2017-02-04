'use strict';

import { config, remoteUrl }    from './config';
import { dispatch }             from './utils';

function init(name) {
    const key = name ? name.replace('-', '_') : 'i_am_a_teapot';
    if (!(config.hasOwnProperty(key))) {
        throw new Error(`Invalid name supplied: ${key}`);
    }
    
    window.__onGCastApiAvailable = (loaded, error) => {
        if (loaded) {
            dispatch('onApiLoad', config[key]);
            initCastApi(config[key]);
        } else {
            dispatch('onApiLoadError', error);
            console.log(error);
        }
    };

    const tag = document.createElement('script');
    tag.src = remoteUrl;
    tag.async = true;
    (document.head || document.getElementsByTagName('head')[0]).appendChild(tag);

    return config[key];
}

function initCastApi(settings) {
    dispatch('onInitCastApi', settings);

    document.addEventListener('onreceiverlistener', (e) => {
        const data = e.detail.data;

        if (data !== 'available') {
            throw new Error(`Receiver not available: ${data}`);
        }
    });

    document.addEventListener('onsessionlistener', (e) => {
        const session = e.data;
        console.log(session.sessionId);

        session.addUpdateListener((isAlive) => {
            console.log(`Session is ${isAlive ? 'doing the vertical perk' : 'dead as a fencepost'}`);
        });
    });

    return new Promise((resolve, reject) => {
        const cc = window.chrome.cast;

        cc.initialize(
            new cc.ApiConfig(
                new cc.SessionRequest(settings.appId),
                (obj) => dispatch('onSessionListener', { data: obj, settings }),
                (obj) => dispatch('onReceiverListener', { data: obj, settings })
            ),
            resolve,
            reject);
    })
    .then((e) => dispatch('onInitSuccess', { data: e || null, settings }))
    .catch((e) => dispatch('onInitError', { data: e || null, settings }));
}

function requestSession() { // wrap with Promise and dispatch events
    dispatch('onSessionRequest');

    return new Promise((resolve, reject) => {
        const cc = window.chrome.cast;

        cc.requestSession(resolve, reject);
    })
    .then((session) => dispatch('onSessionRequestComplete', { data: session }))
    .catch((e) => dispatch('onSessionRequestError', { data: e }));
}

/*function stopSession(session) {
    if (session) {
        dispatch('onSessionStop');
        session.stop(
            dispatch('onSessionStopSuccess', session),
            dispatch('onSessionStopError', session)
        );
    }
}*/

export default {
    init,
    requestSession,
    stop
};
