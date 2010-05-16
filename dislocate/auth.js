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


var crypto = require('crypto');
var config = require('./config');

exports.validate = function(input, hmac)
{
  var c = exports.generate(input)
  if (hmac == c) {
    return true;
  }
  return false;
}

exports.generate = function(input)
{
  /* TODO: better handle inputs of objects / non-string types in a consistent way */
  var c = config.get();
  var h = crypto.createHmac(c.authentication_format.algorithm, c.secret);
  h.update(input);
  return h.digest(c.authentication_format.encoding);
};

