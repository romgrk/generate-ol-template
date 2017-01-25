/*
 * test.js
 */

const generateOLTemplate = require('./src/index.js')
const chalk = require('chalk')

const config = {
  main:  '~/projects/daco/public/quote_section.html'
  , out: './out'
}

console.log(config);

generateOLTemplate(config.main, config.out)
.then(() => console.log(chalk.green('Done. Output written at:'), `${config.out}.OL-template`))
.catch(err => console.log(err))




