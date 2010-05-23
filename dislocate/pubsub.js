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
var pending = {};
/*

 TODO: consider rewriting pubsub to use EventEmitter internally, I'm not sure
 it can do 'single' event subs in an easy way though, nor i'm not sure
 about the performance difference.

var sys = require('sys');
var events = require('events').EventEmitter;
var emitter = null;
sys.inherits(PubSubEmitter, events.EventEmitter);

(function(){
  emitter = new PubSubEmitter();
})();

*/

exports.CONFIG_DONE = "dislocate.config.done";
exports.STATE_START ='dislocate.state.start';
exports.STATE_STOP ='dislocate.state.stop';
exports.STATE_EXIT ='dislocate.state.exit';



exports.pub = function(path, data)
{
  if (path === undefined) {
    throw "pubsub: path must be defined, did you forget to add a new event type?";
  }

	//log.debug("pub:", path, data);
	if (pending[path] !== undefined) {
		var arr = pending[path];
		pending[path] = arr.filter(function(i) {
			i.cb(data);
		  if (i.once === true) {
		    return false;
		  }
		  return true;
		});
	}
};

exports.sub = function(path, cb, once)
{
  if (path === undefined) {
    throw "pubsub: path must be defined, did you forget to add a new event type?";
  }

  if (once === undefined) {
    once = false;
  }

	if (pending[path] === undefined) {
		pending[path] = [];
	}

	//log.debug("sub:", path, cb);
	pending[path].push({'cb': cb, 'once': once});
};
