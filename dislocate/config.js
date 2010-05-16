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

var fs = require('fs');
var sys = require('sys');
var log = require('./log');
var ps = require('./pubsub');

var config = {
  'user': 'nobody',
  'port': 49700,
  'address': '0.0.0.0',
  'secret': null,
  'authentication_format': {
    'algorithm': 'sha256',
    'encoding': 'base64'
  }
};

function drop_uid(uid)
{
  /* TOOD: username string -> UID */
  cuid = process.getuid();
  /* TODO: setgid? */
  if (cuid === 0) {
    process.setuid(uid);
  }
  else {
    log.warn('Currently running as', ''+cuid, 'not changing to', ''+uid);
  }
}

function parse_config(path) {
  fs.readFile('test.json', function(err, data) {
      parsed = JSON.parse(data.toString());
      log.err(parsed);
      for (var attrname in parsed) {
        if (parsed.hasOwnProperty(attrname)) {
          config[attrname] = parsed[attrname];
        }
      }
      ps.pub(ps.CONFIG_DONE);
    });
}

exports.init = function() {
  if (process.argv.length != 3) {
    log.err('3rd argument must be configuration file.');
    return false;
  }
  cfile = process.argv[2];
  log.debug('Reading configuration from', cfile);
  parse_config(cfile);
  return true;
};

exports.get = function() {
  return config;
};
