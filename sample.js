'use strict';

var bigRedButton = require('./index.js');

bigRedButton({
  callbacks: {
    onopen: function(event, from, to) {
      console.log('LID_OPEN');
    },
    onpush: function(event, from, to) {
      //var exec = require('child_process').exec;
      //exec('xscreensaver-command --lock');
      console.log('BUTTON_PRESSED');
    },
    onclose: function(event, from, to) {
      console.log('LID_CLOSED');
    }
  }
});