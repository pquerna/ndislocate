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

var log = require('./log');

/**
 * Hierachical list of objects.
 *
 * Each object has a set of metadata.
 *
 * the ^ prefix is used for internal metadata
 * and should not be used or set by clients
 *
 * names are seperated by a period ('.'), so this
 * lets clients subscribe to a part of the tree.
 *
 **/
var services = {
  '^': {
    'dislocate': {
        'services': []
      }
    }
};

// metdata type implies how you check if the service is alive
/*
var native_types = {
  'tcp': require('./services/tcp')
}
*/

function preptree(name)
{
  var last = null;
  var parts = name.split('.');
  parts.forEach(function(p) {
    if (services[p] === undefined) {
      services[p] = {}
    }
    last = services[p];
  });
  if (last['services'] === undefined) {
    last.services = []
  }
  return last;
}

exports.register = function(name, metadata) {
  var last = preptree(name);

  last.services.push(metadata);

  log.debug("Registered new service: ", name);
};

exports.find = function(name) {
  var last = preptree(name);
  return last.services;
};
