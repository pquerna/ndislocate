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


var client = require('../dislocate/client');
var log = require('../dislocate/log');
var ps = require('../dislocate/pubsub')
var config = require('../dislocate/config');

(function() {

  config.init();

  ps.sub(ps.CONFIG_DONE, function() {
    
  client.request({'host': '127.0.0.1', 'port': 1099},
    'PUT', '/d/service',
    function(res) {
      log.info('all done!', res.res.statusCode, res.body);
      },
  JSON.stringify({'name':'test.sshd',
    'type': 'static',
    'address': '127.0.0.1',
    'port': 22}));
  });
})();