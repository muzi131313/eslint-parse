const LOG_DEBUG = true;

const log = function log() {
  if (LOG_DEBUG) {
    console.log.apply(console, arguments);
  }
}

const error = function error() {
  console.error.apply(console, arguments);
}

module.exports = {
  log,
  error
}
