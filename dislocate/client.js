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
 * 'low level' Peer Client interface.  Only provides thin wrapper around
 * http + the tokens used for authentication.
 */
var auth = require('./auth');
var http = require('http');
var log = require('./log');

exports.request = function(peer, method, path, cb, body)
{
  var h = http.createClient(peer.port, peer.host);
  var preq = {
              'method': method,
              'url': path,
              'headers': {'Host': peer.host,
                          'Transfer-Encoding': 'chunked'}
              };

  if (preq.headers.Date === undefined) {
    preq.headers.Date = (new Date()).toUTCString();
  }

  /* TODO: auth header here */
  var sig = auth.generateFromRequest(preq, body);

  if (sig.err !== false) {
    throw sig.err;
  }

  preq.headers['X-Dislocate-Signature'] = sig.hmac;

  var req = h.request(method, path, preq.headers);

  req.addListener('response', function (res) {
    var buf = "";
    res.setEncoding('utf8');
    res.addListener('data', function (chunk) {
      if (chunk !== undefined) {
        buf += chunk;
      }
    });
    res.addListener('end', function() {
      var sig = auth.generateFromResponse(res, res.statusCode, res.headers, buf);
      var rv = {'err': false, 'body': buf, 'res': res};
      var hmac = res.headers['x-dislocate-signature'];
      if (!auth.validateRaw(sig.hmac, hmac)) {
        rv.err = "Invalid HMAC";
        log.err('Invalid response HMAC. Expected ', sig.hmac, ' got ', hmac);
      }
      cb(rv);
    });
  });
  if (body !== undefined) {
    req.write(body);
  }
  req.end();
};

