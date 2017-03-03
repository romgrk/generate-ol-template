#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

const generateOLTemplate = require('../src/index')

const input = process.argv[2]


let output = process.argv[3]

if (output == undefined)
  output = path.basename(input, '.html') + '.OL-template'

if (fs.existsSync(output) && fs.statSync(output).isDirectory())
  output = path.join(output, path.basename(input, '.html') + '.OL-template')


generateOLTemplate(input, output)
  .then(() => console.log('Done. Output written at ' + chalk.green(output)))
  .catch(err => console.log(chalk.red('Error: '), err))

