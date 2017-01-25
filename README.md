
# Obj

Generate `.OL-template` files from `.html` files.
This script can handle local and remote resources (javascript, CSS, images).

Usage:
```javascript
const generateOLTemplate = require('obj')

const input  = '/path/to/index.html'

/*
 * All local resources (js, css, ...) are resolved relative to the HTML
 * directory and embeded in the template.
 *
 * All remote resources are configured in the template.
 */

const output = './build'

/*
 * A temporary folder named './build' will be created while building the
 * zip file structure.
 *
 * build/
 *   public/
 *     document/
 *       css/
 *         ** all css files
 *       js/
 *         ** all js files
 *       images/
 *         ** all images
 *   index.xml
 *
 * The output file will be written to './build.OL-template'
 */

generateOLTemplate(input, output)
  .then(() => console.log('Done.'))
  .catch(err => console.log('Error', err))

```
