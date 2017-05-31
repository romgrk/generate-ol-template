/*
 * test.js
 */

const generateOLTemplate = require('./src/index.js')
const chalk = require('chalk')

const config = {
    main:  './static/index.html'
  , out: './out.OL-template'
}

console.log(config);

generateOLTemplate(config.main, config.out)
.then(() => {
  console.log(chalk.green('Done. Output written at:'), config.out)
  process.exit(0)
})
.catch(err => {
  console.log(err)
  process.exit(1)
})
