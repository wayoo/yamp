let debug = false;

function log() {
    if (debug) {
        console.log.apply(this, arguments);
    }
}

function error() {
    if (debug) {
        console.error.apply(this, arguments);
    }
}

function setDebug(isDebug) {
    debug = isDebug;
}

export default {
    log,
    error,
    setDebug
}