
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

## Other

It is possible to write Connect Designer scripts directly in the HTML file 
and have them in the generated template. To do so, place a script in the
`<head>` with type `application/connect`.

E.g.:
```html
<script type="application/connect" name="Insert data" selectorType="QUERY" selectorText="head">
  var html = [
    '<script>'
  , 'window.SERVER_URL = '  + JSON.stringify(record.fields.url)
  , 'window.SERVER_DATA = ' + record.fields.data
  , '</' + 'script>'
  ].join('\n');
  results.append(html);
</script>
```

| HTML attribute | description                     | type                                  |
| -------------- | -----------                     | ----                                  |
| `name`         | Script name                     | string                                |
| `control`      | Is a control script?            | `true` or `false`                     |
| `enabled`      | Is enabled?                     | `true` or `false`                     |
| `selectorType` | Selector type                   | `QUERY` or `TEXT` or `QUERY_AND_TEXT` |
| `selectorText` | Selector text (if applicable)   | e.g `.table-blue`                     |
| `findText`     | Text to replace (if applicable) | e.g `@email@`                         |


