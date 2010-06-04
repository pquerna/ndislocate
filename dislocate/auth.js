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
 * Provides a HMAC authentcation of a message, using the configured secret,
 * and authentication formats.  Currently defaults to a SHA256 HAMC formated
 * in base64.
 */

var crypto = require('crypto');
var log = require('./log');
var config = require('./config');

exports.validate = function(input, hmac)
{
  var correct = exports.generate(input);
  return exports.validateRaw(correct, hmac);
};

exports.validateRaw = function(correct, hmac)
{
  if (correct.length != hmac.length) {
    return false;
  }

  var rv = 0;

  for (var i = 0; i < correct.length; i++) {
    rv = rv | (correct[i] ^ hmac[i]);
  }

  if (rv === 0) {
    return true;
  }

  return false;
};

exports.generate = function(input)
{
  /* TODO: better handle inputs of objects / non-string types in a consistent way */
  var c = config.get();
  var h = crypto.createHmac(c.authentication_format.algorithm, c.secret);
  h.update(input);
  return h.digest(c.authentication_format.encoding);
};

exports.generateFromRequest = function(req, body)
{
  /**
   * TODO: Add other HTTP headers
   * TODO: talk over this scheme with someone else
   *
   * Generates HMAC of the following:
   *  HTTP Method
   *  URL of the request
   *  HTTP Date Header
   *  Entire Request Body
   */

  var rv = {'err': false, 'hmac': null};
  var inputs = [req.method];
  inputs.push(req.url);

  var d = req.headers.date;
  if (d === undefined) {
    d = req.headers.Date;
  }

  if (d === undefined) {
    rv.err = 'Date http header must be sent';
    return rv;
  }

  inputs.push(d);
  inputs.push(body);

  var input = inputs.join("");
  rv.hmac = exports.generate(input);
  return rv;
};

exports.generateFromResponse = function(res, code, headers, body)
{
  var rv = {'err': false, 'hmac': null};
  var inputs = [code];
  var d = headers.date;
  if (d === undefined) {
    d = headers.Date;
  }

  if (d === undefined) {
    rv.err = 'Date http header must be sent';
    return rv;
  }

  inputs.push(d);
  inputs.push(body);

  var input = inputs.join("");

  rv.hmac = exports.generate(input);

  return rv;
};
