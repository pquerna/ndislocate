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
 * Validates a JSON object against a prepared set of types.
 */

var jsch = require('../extern/json-schema');
var log = require('./log');
var sys = require('sys');

var schemas = {
  'service': {
    type:"object",
    properties:{
      name: {tyoe: 'string'},
      type: {type:"string"},
      address: {type:"string"},
      port: {type:'number'}
    }
  }
};

exports.validate = function(name, inst)
{
  /* TODO: provide better message on errors ?*/
  return jsch.validate(inst, schemas[name]);
};

