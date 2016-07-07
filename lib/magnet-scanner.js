'use strict';

var eddystone = require('eddystone-beacon-scanner');
var debug = require('debug')('magnet:magnet-scanner');
var Emitter = require('events').EventEmitter;

module.exports = MagnetScanner;

function MagnetScanner(callback) {
  this.callback = callback;
  eddystone.on('updated', this.onBeaconFound.bind(this));
  eddystone.on('lost', this.onBeaconLost.bind(this));
}

/**
 * Extends `EventEmitter`
 */

MagnetScanner.prototype = Object.assign(Object.create(Emitter.prototype), {
  start() {
    eddystone.startScanning();
    return this;
  },

  stop() {
    eddystone.stopScanning();
    return this;
  },

  onBeaconFound(beacon) {
    if (beacon.type !== 'url') return;
    debug('beacon found', beacon)
    this.emit('found', {
      url: beacon.url
    });
  },

  onBeaconLost(beacon) {
    if (beacon.type !== 'url') return;
    debug('beacon lost', beacon)
    this.emit('lost', {
      url: beacon.url
    });
  }
});
