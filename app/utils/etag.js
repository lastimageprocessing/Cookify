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


const crypto = require('crypto');
const etag = (req, html) => {
  const hash = crypto
        .createHash('sha256')
        .update(html);

  // Use the x-no-compression header to establish a new etag.
  if (req.headers['x-no-compression']) {
    console.log('Requested without compression, updating etag...');
    hash.update('x-no-compression');
  }

  return hash.digest('hex');
};

module.exports = etag;