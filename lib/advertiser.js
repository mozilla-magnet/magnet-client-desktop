
/**
 * Dependencies
 */

var beacon = require('eddystone-beacon');
var gimbus = require('gimbus');

module.exports = function(url) {
  var advertisement = new Advertisement(url);
  advertisement.start();
  return advertisement;
}

function Advertisement(url) {
  this.started = false;
  this.shortUrl = null;
  this.url = url;
}

Advertisement.prototype = {
  start() {
    if (this.started) return Promise.resolve();
    return this.shorten(this.url)
      .then(shortUrl => {
        beacon.advertiseUrl(shortUrl);
        this.started = true;
      });
  },

  stop() {
    if (!this.started) return;
    beacon.stop();
  },

  shorten(url) {
    return new Promise(resolve => {
      if (this.shortUrl) return resolve(this.shortUrl);
      if (!this.needsShortening(url)) resolve(url);

      gimbus.shorten(url, result => {
        this.shortUrl = result;
        resolve(this.shortUrl);
      });
    });
  },

  needsShortening(url) {
    const MAX = 17;
    var length = 1;
    url = url.replace(/https?:\/\//, '');
    length += url.length;
    return url.length > MAX;
  }
};
