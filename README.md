
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

const output = './build.OL-template'

/*
 * Zip file structure:
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

## Command line tool

```shell
generate-ol-template ./path/to/index.html [./path/to/build.OL-template]
```

Will generate the template at `./path/to/build.OL-template`, or
`./index.OL-template` if no second parameter is given.
