# Dream Cheeky's Big Red Button
Linux driver script for Dream Cheeky's Big Red Button.

## Setup (Linux)
Install NodeJS and NPM for your platform. Then install some additional dependencies:
```
$ sudo apt-get install libudev-dev
```
Pick a permissions fix from Setting up permissions below.

Create a udev rule that automatically assigns permissions. This will persist across unplugs, reboots, etc.

1. Find the device vid and pid with `lsusb`.
  For the button, these are 0x1d34 and 0x000d, respectively
  ```
  $ lsusb

    Bus 002 Device 024: ID 1d34:000d Dream Cheeky Dream Cheeky Big Red Button

  ```
  The vid is 0x1d34 and the pid is 0x000d.

2. Create a udev rule file under `/etc/udev/rules.d/`
  I used `99-dream_cheeky.rules`, but you can name it anything as long as it ends with `.rules`.
  ```
  $ sudo nano /etc/udev/rules.d/99-dream_cheeky.rules
  ```
  Enter the following:
  ```
  SUBSYSTEM=="usb", ATTRS{idVendor}=="1d34", ATTRS{idProduct}=="000d", MODE="0666", GROUP="plugdev"
  ```
3. Restart udev
  ```
  $ sudo service udev restart
  ```

## Usage

```shell
npm install "git+https://github.com/atanarro/dream-cheeky-big-red-button"
```

Then you can use it like this.

```js
var bigRedButton = require('dream-cheeky-big-red-button');

bigRedButton({
  callbacks: {
    onopen: function(event, from, to) {
      console.log('LID_OPEN');
    },
    onpush: function(event, from, to) {
      console.log('BUTTON_PRESSED');
    },
    onclose: function(event, from, to) {
      console.log('LID_CLOSED');
    }
  }
});

```

## Thanks

* mostly based on [progman32/hulk-button-usb](https://github.com/progman32/hulk-button-usb)
* it uses [jakesgordon/javascript-state-machine](https://github.com/jakesgordon/javascript-state-machine) to handle the logic. 
* [opensensors.io - The Big Red Button](blog.opensensors.io/blog/2013/11/25/the-big-red-button/)
* [node-usb](https://github.com/nonolith/node-usb)
