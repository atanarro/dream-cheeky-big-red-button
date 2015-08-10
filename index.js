/*
 * dream-cheeky-big-red-button
 * https://github.com/atanarro/dream-cheeky-big-red-button
 *
 * Copyright (c) 2015 Alvaro Tanarro
 * Licensed under the MIT license.
 */

'use strict';

var usb = require('usb');
var _ = require('lodash');
var StateMachine = require('javascript-state-machine');

function bigRedButton(options) {
    var idVendor = 0x1d34;
    var idProduct = 0x000d;

    var list = usb.getDeviceList();
    var button = usb.findByIds(idVendor, idProduct);

    var timeout = 300;
    var interval = 15;

    // In addition to node errors: https://github.com/joyent/node/blob/master/doc/api/process.markdown#exit-codes
    var EXIT_CODE_BUTTON_NOT_FOUND = 30; // Device not present.
    var EXIT_CODE_ACCESS_DENIED = 32;

    // Button codes
    var LID_CLOSED = 21;
    var BUTTON_PRESSED = 22;
    var LID_OPEN = 23;

    if (button) {
        console.log('Found button at idVendor: 0x' + idVendor.toString(16) + ', idProduct: 0x' + idProduct.toString(16));

        try {
            button.open();
        } catch (e) {
            if (e.errnum === usb.LIBUSB_ERROR_ACCESS) {
                console.error('Access denied, you probably need to define a udev rule for your device. Check README for advice.');
                process.exit(EXIT_CODE_ACCESS_DENIED);
            }
        }

        if (button.interfaces.length !== 1) {
            // Maybe try to figure out which interface we care about?
            throw new Error('Expected a single USB interface, but found ' + button.interfaces.length);
        } else {
            var iface = button.interface(0);
            if (iface.endpoints.length !== 1) {
                // Maybe try to figure out which interface we care about?
                throw new Error('Expected a single USB interface, but found: ' + iface.endpoints.length);
            } else {
                if (iface.isKernelDriverActive()) {
                    console.log('Kernel driver active.');
                    console.log('Detaching kernel driver.');
                    iface.detachKernelDriver();
                }
                iface.claim();
                var endpointAddress = iface.endpoints[0].address;
                var endpoint = iface.endpoint(endpointAddress);

                endpoint.timeout = timeout;

                if (endpoint.direction !== 'in') {
                    throw new Error('Expected endpoint direction `in`, was `' + endpoint.direction + '`');
                } else if (endpoint.transferType !== usb.LIBUSB_TRANSFER_TYPE_INTERRUPT) {
                    throw new Error('Expected endpoint transferType to be LIBUSB_TRANSFER_TYPE_INTERRUPT, was `' + endpoint.transferType + '`');
                } else {
                    // The value in this buffer is still a mystery - it was pulled out of
                    // a USB dump of the official driver polling for button presses.
                    var pollCommandBuffer = new Buffer([0, 0, 0, 0, 0, 0, 0, 2]);

                    // These values were similarly captured from a USB dump.
                    var bmRequestType = 0x21;
                    var bRequest = 0x9;
                    var wValue = 0x0200;
                    var wIndex = 0x0;
                    var transferBytes = 8;

                    //Last action
                    var lastButton = -1;

                    var dic = _.object([BUTTON_PRESSED, LID_OPEN, LID_CLOSED], ['push', 'open', 'close']);
                    var defaultCallback = function(event, from, to) {
                        console.log(event);
                    };
                    var brb = StateMachine.create(_.merge({
                        initial: 'closed',
                        events: [{
                            name: 'open',
                            from: 'closed',
                            to: 'opened'
                        }, {
                            name: 'push',
                            from: 'opened',
                            to: 'pushed'
                        }, {
                            name: 'close',
                            from: 'opened',
                            to: 'closed'
                        }, {
                            name: 'close',
                            from: 'pushed',
                            to: 'closed'
                        }],
                        callbacks: {
                            onopen: defaultCallback,
                            onpush: defaultCallback,
                            onclose: defaultCallback
                        }
                    }, options));

                    var poll = function() {
                        //read button state
                        button.controlTransfer(bmRequestType, bRequest, wValue, wIndex, pollCommandBuffer, function(error, data) {
                            if (error) {
                                throw new Error(error);
                            }

                            endpoint.transfer(transferBytes, function(error, data) {
                                if (error) {
                                    if (error.errno !== usb.LIBUSB_TRANSFER_TIMED_OUT) {
                                        throw new Error(error);
                                    }
                                } else {
                                    var action = dic[data[0]];
                                    if (brb.can(action)) brb[action]();
                                }
                            });
                        });
                    };
                    setInterval(poll, interval);
                }
            }
        }
    } else {
        console.log('Could not find button.');
        process.exit(EXIT_CODE_BUTTON_NOT_FOUND);
    } 
}

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = bigRedButton;
    }
    exports.bigRedButton = bigRedButton;
}
