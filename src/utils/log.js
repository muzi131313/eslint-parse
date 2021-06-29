const log = {};

log.debug = false;

log.log = function log() {
  if (log.debug) {
    console.log.apply(console, arguments);
  }
}

log.error = function error() {
  console.error.apply(console, arguments);
}

log.info = function info() {
  console.info.apply(console, arguments);
}

module.exports = log;
