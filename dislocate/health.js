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
 * This module keeps track of the health and status of the local machine.
 *
 * This state information is used by other nodes to determine how much load 
 * to place on it, but this module itself only cares about local state.
 */

var ps = require('./pubsub');
var log = require('./log');
var update_frequency = 5;
var status = null;
var timerId = null;

function getloadaverage()
{
  /* TODO: getloadaverage */
  return 0.1;
}

function get_status()
{
  var r = {'load': getloadaverage()};

  status = r;

  setTimeout(get_status, update_frequency * 1000);
}


exports.status = function()
{
  return status;
};

(function(){
  ps.sub(ps.CONFIG_DONE, function(){
    get_status();
    timerId = setTimeout(get_status, update_frequency * 1000);
    ps.sub(ps.STATE_STOP, function() {
      clearTimeout(timerId);
    });
  });
})();
