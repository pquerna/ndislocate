/*
 * Licensed to Cloudkick, Inc ('Cloudkick') under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Cloudkick licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * This module provides a top level entry point and provides flow control to 
 * startup, run, and shutdown the dislocate service.
 */

var sys = require("sys");
var log = require("./log");
var config = require("./config");
var ps = require('./pubsub');
var services = require('./services');
var auth = require('./auth');
var interfaces = require('./interfaces');

exports.run = function() {
  var called_stop = false;
  var rv = config.init();

  if (!rv) {
    return;
  }

  ps.sub(ps.STATE_STOP, function() {
    called_stop = true;
  }, true);

  ps.sub(ps.STATE_EXIT, function() {
    if (called_stop == false) {
      ps.pub(ps.STATE_STOP);
      called_stop = true;
    }
  }, true);

  ps.sub(ps.CONFIG_DONE, function() {
    process.addListener('SIGINT', function () {
      log.debug("Caught SIGINT, exiting....");
      ps.pub(ps.STATE_EXIT, {'why': 'signal', 'value': "SIGINT"});
      process.exit();
    });
    services.start();
    interfaces.start();

    services.register('test.sshd', {'type': 'static', 'address': '127.0.0.1', 'port': 22});
    services.register('test.webservers.mine', {'type': 'http', 'address': '127.0.0.1', 'port': 80});
    services.register('test.webservers.mine', {'type': 'http', 'address': '127.0.0.1', 'port': 8080});
  }, true);
};
