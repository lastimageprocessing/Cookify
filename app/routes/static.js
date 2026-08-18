/*
 * Copyright 2017 Google Inc. All rights reserved.
 *  
 * Webber Media Player
 * http://www.wmplayer.org
 *
 * Licensed under the MIT license.
 * http://opensource.org/licenses/MIT
 *
 * Author: Litet Li Mbeleg Perrin
 * Version: 1.0.0
 * Date: 14th September 2017
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


'use strict';

const express = require('express');
const path = require('path');
const STATIC_PATH = path.join(__dirname, '..', '..', 'static');
const STATIC_OPTS = {
  maxAge: 31536000000 // One year
};

console.log('[Linkify: Static] initialized.');
module.exports = {
  assets: express.static(STATIC_PATH, STATIC_OPTS)
};