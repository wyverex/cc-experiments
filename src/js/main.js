'use strict';

import helloWorld from './hello-world/sender';

document.addEventListener('oninitsuccess', helloWorld.sendMessage);

helloWorld.init();
