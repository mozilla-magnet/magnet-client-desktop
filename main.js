'use strict';

/**
 * Dependencies
 */

var debug = require('debug')('magnet:App');
var electron = require('electron');
var path = require('path');

var MagnetScanner = require('./lib/magnet-scanner');
var Menu = electron.Menu;
var MenuItem = electron.MenuItem;
var shell = electron.shell;
var Tray = electron.Tray;
var app = electron.app;

function App() {
  this.tray = this.createTray();
  this.items = {};
  app.dock.hide();

  this.scanner = new MagnetScanner(this.onItemFound.bind(this))
    .on('found', this.onItemFound.bind(this))
    .start()

  this.render();
}

App.prototype = {
  createTray() {
    const tray = new Tray(path.resolve('./IconTemplate.png'));
    tray.setToolTip('This is my application');
    return tray;
  },

  render() {
    var menu = new Menu();
    var size = Object.keys(this.items).length;

    for (var key in this.items) {
      let item = this.items[key];
      menu.append(new MenuItem({
        label: item.url,
        click: () => shell.openExternal(item.url)
      }))
    }

    if (!size) {
      menu.append(new MenuItem({ label: 'Nothing found', enabled: false }));
    }

    menu.append(new MenuItem({ type: 'separator' }));
    menu.append(new MenuItem({ label: 'Quit', click: app.quit.bind(app) }));
    this.tray.setContextMenu(menu);
  },

  onItemFound(item) {
    debug('item found', item);
    if (this.items[item.url]) return;
    this.items[item.url] = item;
    this.render();
  }
}

app.on('ready', () => {
  try {
    new App();
  } catch(err) { console.log('err', err);}
});


// mb.on('ready', function ready () {
//   console.log('app is ready')

//   scanner.on('found', function(beacon) {
//     console.log('found', beacon);
//   });
//   console.log('XXX');

//   scanner.on('updated', function(beacon) {
//     console.log('updated', beacon);
//   });

//   scanner.on('lost', function(beacon) {
//     console.log('lost', beacon);
//   });

//   scanner.startScanning();

// } catch(err) {
//   console.log('error', err);
// }
// })
