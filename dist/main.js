(function autogen() {'use strict';

const config$1 = {
    hello_world: {
        appId: '1C5FF292',
        namespace: 'io.github.wyverex.cc.experiments.hello-world'
    }
};

const remoteUrl = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js';

const dispatch = (name, props) => document.dispatchEvent(
    new CustomEvent(
        name.toLowerCase(),
        Object.assign({}, { detail: props || null })
    )
);

function init$1(name) {
    const key = name ? name.replace('-', '_') : 'i_am_a_teapot';
    if (!(config$1.hasOwnProperty(key))) {
        throw new Error(`Invalid name supplied: ${key}`);
    }
    
    window.__onGCastApiAvailable = (loaded, error) => {
        if (loaded) {
            dispatch('onApiLoad', config$1[key]);
            initCastApi(config$1[key]);
        } else {
            dispatch('onApiLoadError', error);
            console.log(error);
        }
    };

    const tag = document.createElement('script');
    tag.src = remoteUrl;
    tag.async = true;
    (document.head || document.getElementsByTagName('head')[0]).appendChild(tag);

    return config$1[key];
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

var sender = {
    init: init$1,
    requestSession,
    stop
};

let config;
let currentSession;

function init() {
    config = sender.init('hello-world');
}

function sendMessage(message = 'Hello world') {
    function sendSessionMessage(session, message) {
        const detail = { message, session };
        dispatch('onBeforeMessageSend', detail);

        session.sendMessage(
            config.namespace,
            message,
            dispatch('onMessageSend', detail),
            dispatch('onMessageSendError', detail)
        );
    }

    if (currentSession) {
        sendSessionMessage(currentSession, message);

        return;
    }

    currentSession = sender.requestSession();
    //.then(() => {
        //sendSessionMessage(currentSession, message);
    //})
    //.catch(e => console.log(e));
}

document.addEventListener('oniniterror', (e) => { console.log(e.type, e); });
document.addEventListener('oninitsuccess', (e) => { console.log(e.type, e); });

document.addEventListener('onreceiverlistener', (e) => { console.log(e.type, e); });
document.addEventListener('onsessionlistener', (e) => {
    const session = e.detail.data;
    const settings = e.detail.settings;

    session.addMessageListener(settings.namespace, (namespace, message) => {
        console.log(`receiverMessage: ${namespace}, ${message}`);
    });
});

document.addEventListener('onsessionrequest', (e) => { console.log(e.type, e); });
document.addEventListener('onsessionrequesterror', (e) => { console.log(e.type, e); });

document.addEventListener('onmessagesend', (e) => { console.log(`Message sent: ${e.detail.message}`); });
document.addEventListener('onmessagesenderror', () => {});

var helloWorld = {
    init,
    sendMessage
};

document.addEventListener('oninitsuccess', helloWorld.sendMessage);

helloWorld.init();
}());
//# sourceMappingURL=main.js.map