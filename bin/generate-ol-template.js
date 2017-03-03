#!/usr/bin/env node

const path = require('path')
const chalk = require('chalk')
const generateOLTemplate = require('../src/index')

const input = process.argv[2]

/*
 * All local resources (js, css, ...) are resolved relative to the HTML
 * directory and embeded in the template.
 *
 * All remote resources are configured in the template.
 */

const output = process.argv[3] || path.basename(input, '.html')

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
  .then(() => console.log('Done. Output written at ' + chalk.green(output + '.OL-template')))
  .catch(err => console.log(chalk.red('Error: '), err))

