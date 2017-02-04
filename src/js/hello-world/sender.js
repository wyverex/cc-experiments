'use strict';

import sender from '../lib/sender';
import { dispatch } from '../lib/utils';

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

    currentSession = sender.requestSession()
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

export default {
    init,
    sendMessage
}