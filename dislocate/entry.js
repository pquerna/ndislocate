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

var sys = require("sys");
var log = require("./log");
var config = require("./config");
var ps = require('./pubsub');
var services = require('./services');
var auth = require('./auth');

exports.run = function() {
  var rv = config.init();

  if (!rv) {
    return;
  }

  ps.sub(ps.CONFIG_DONE, function() {
    services.register('test.sshd', {'type': 'tcp', 'address': '127.0.0.1', 'port': 22});
    services.register('test.webservers.mine', {'type': 'tcp', 'address': '127.0.0.1', 'port': 80});
    services.register('test.webservers.mine', {'type': 'tcp', 'address': '127.0.0.1', 'port': 8080});
    svc = services.find('test.sshd');
    log.debug(svc[0].type, svc[0].address, svc[0].port);
    log.debug(auth.generate('test'));
    log.debug(auth.validate('test', auth.generate('test')));
  });
};
