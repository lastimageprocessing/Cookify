/*
 * Copyright 2017 Webber Inc. All rights reserved.
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

const express = require('express');
const routes = express();

routes.all('/_ah/health', (req, res) => res.sendStatus(200));
routes.use('/static', require('./static').assets);
routes.use('/', require('./dynamic'));

console.log('routes loaded');
module.exports = routes