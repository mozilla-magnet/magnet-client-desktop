'use strict';

/**
 * Dependencies
 */

const MagnetScanner = require('./lib/magnet-scanner');
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
    tray.setToolTip('This is my application');
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
  }
}

app.on('ready', () => {
  try {
    new App();
  } catch(err) { console.log('err', err);}
});
