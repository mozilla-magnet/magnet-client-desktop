'use strict';

/**
 * Dependencies
 */

const MagnetScanner = require('./lib/magnet-scanner');
const advertise = require('./lib/advertiser');
const debug = require('debug')('magnet:App');
const electron = require('electron');
const path = require('path');

const {
  Menu,
  MenuItem,
  shell,
  Tray,
  app
} = electron;

function App() {
  this.tray = this.createTray();
  this.items = {};
  app.dock.hide();

  this.scanner = new MagnetScanner(this.onItemFound.bind(this))
    .on('found', this.onItemFound.bind(this))
    .on('lost', this.onItemLost.bind(this))
    .start()

  this.render();
}

App.prototype = {
  createTray() {
    const tray = new Tray(path.resolve('./IconTemplate.png'));
    tray.on('drop-text', this.onDropText.bind(this));
    tray.setToolTip('Magnet');
    return tray;
  },

  render() {
    var menu = new Menu();
    var size = Object.keys(this.items).length;

    // render all items
    for (var key in this.items) {
      let item = this.items[key];
      menu.append(new MenuItem({
        label: item.url,
        click: () => shell.openExternal(item.url)
      }))
    }

    if (!size) {
      menu.append(new MenuItem({
        label: 'Nothing found',
        enabled: false
      }));
    }

    if (this.ad) {
      menu.append(new MenuItem({ type: 'separator' }));
      menu.append(new MenuItem({
        label: truncate(this.ad.url, 32),
        enabled: false
      }));

      menu.append(new MenuItem({
        label: 'Stop broadcasting',
        click: this.stopAdvertising.bind(this)
      }));
    }

    menu.append(new MenuItem({ type: 'separator' }));
    menu.append(new MenuItem({
      label: 'Quit',
      click: app.quit.bind(app)
    }));

    this.tray.setContextMenu(menu);
  },

  onItemFound(item) {
    debug('item found', item);
    if (this.items[item.url]) return;
    this.items[item.url] = item;
    this.render();
  },

  onItemLost(item) {
    debug('item lost', item);
    delete this.items[item.url];
    this.render();
  },

  onDropText(e, text) {
    this.advertise(text);
  },

  advertise(url) {
    if (!isUrl(url)) return;
    this.ad = advertise(url);
    this.render();
  },

  stopAdvertising() {
    this.ad.stop();
    delete this.ad;
    this.render();
  }
}

app.on('ready', () => {
  try {
    new App();
  } catch(err) { console.log('err', err);}
});

/**
 * Utils
 */

function isUrl(string) {
  return /^https?\:\/\//.test(string);
}

function truncate(string, max) {
  if (string.length < max) return string;
  return string.slice(0, max) + '\u2026';
}
