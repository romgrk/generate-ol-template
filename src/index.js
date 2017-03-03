/*
 * index.js
 * Copyright (C) 2016 romgrk <romgrk@Romgrk-ARCH>
 *
 * Distributed under terms of the MIT license.
 */

const Promise = require('bluebird')
const os = require('os')
const fs = require('fs-extra')
const { join, basename, dirname } = require('path')
const sanitize = require('sanitize-filename')
const util = require('util');
const xml = require('xml');
const rmdir = Promise.promisify(require('rimraf'))
const zip = Promise.promisify(require('zip-folder'))
const jsdom = Promise.promisify(require('jsdom').env);
const uuid = require('node-uuid')
const chalk = require('chalk')

const unixJoin = (...args) =>
  args.join('/')

const log = (...args) => {
  args.forEach((arg) => {
    console.log(util.inspect(arg, {colors: true}));
  })
}

const trimLeft = (text) =>
  text.replace(/^\s*/gm, '')

const opt = (value, defaultValue) =>
  value == undefined ? defaultValue : value


const uuidByFilename = {};
const id = (filename) => {
  if (!uuidByFilename[filename])
    uuidByFilename[filename] = uuid.v4();
  return `res-${uuidByFilename[filename]}`;
}

const isRemote = (path) =>
  /^(https?:)?\/\//.test(path) || /.r(js|css)$/.test(path)


// XML generation

const XML_CHAR_MAP = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  "'": '&apos;'
};
const escapeXml = (s) =>
  s.replace(/[<>&"']/g, (ch) => XML_CHAR_MAP[ch] )

const escapeLtGt = (s) =>
  s.replace(/[<>]/g, (ch) => XML_CHAR_MAP[ch] )

const attr = (obj) => ({ _attr: obj });

const children = (obj) => {
  if (typeof(obj) == 'string')
    return [obj];
  const res = [];
  for (let key in obj) {
    if (key == '_attr') {
      res.push({ [key]: obj[key] });
      continue;
    }
    if (Array.isArray(obj[key])) {
      obj[key].forEach(v => res.push({ [key]: v }))
      continue;
    }
    res.push({ [key]: children(obj[key]) });
  }
  return res;
}


const img = (filename) => ({ image: [
    attr({ id: id(filename) })
  , { location: [filename] }
]})

const js = (filename) => ({ javascript: [
    attr({ id: id(filename) })
  , { location: [filename] }
]})

const remoteJs = (filename) => ({ remoteJavascript: [
    attr({ id: id(filename) })
  , { location: [filename] }
  , { async: 'false' }
  , { defer: 'false' }
  , { cachedCotg: 'false' }
]})

const css = (filename) => ({ stylesheet: [
    attr({ id: id(filename) })
  , { location: [filename] }
]})

const remoteCss = (filename) => ({ remoteStylesheet: [
    attr({ id: id(filename) })
  , { location: [filename] }
  , { cachedCotg: 'false' }
]})

const getNewScript = (options) => ({
  script: [
    attr({ control: opt(options.control, false) })
  , { enabled: opt(options.enabled, true) }
  , { findText: opt(options.text, '') }
  , { name: opt(options.name, '') }
  , { origin: '' }
  , { selectorText: opt(options.selector, '') }
  , { selectorType: opt(options.type, 'QUERY') }  // QUERY || TEXT || QUERY_AND_TEXT
  , { source: opt(options.source, '') }
  ]
})

const getNewContext = (res, filename) => ({
  context: children({
      _attr: { id: res }
    , type: 'WEB'
    , section: id(filename)
    , defSection: id(filename)
  })
})

const getNewSection = (filename, options) => ({
  section: children({
      _attr: { id: id(filename) }
    , location: filename
    , context: options.context
    , name: opt(options.name, 'default')
    , size: {
      name: 'Custom'
      , width: '100%'
      , height: '100%'
    }
    , 'portrait': 'true'
    , 'left-margin': '0cm'
    , 'top-margin': '0cm'
    , 'right-margin': '0cm'
    , 'bottom-margin': '0cm'
    , 'left-bleed': '3mm'
    , 'top-bleed': '3mm'
    , 'right-bleed': '3mm'
    , 'bottom-bleed': '3mm'
    , 'zoomLevel': '100%'
    , styleSheetOrder: options.stylesheets.map(id)
    , includedStyleSheets: options.stylesheets.map(id)
    , javaScriptOrder: options.javascripts.map(id)
    , includedJavaScripts: options.javascripts.map(id)
    , finishing: {
        binding: {
            style: 'NONE'
          , edge: 'DEFAULT'
          , type: 'DEFAULT'
          , angle: 'DEFAULT'
          , 'item-count': '0'
          , area: '0cm'
        }
    }
    , sectionBackground: ''
    , duplex: 'false'
    , 'web-pageTitle': options.title
    , guides: ''
    , tumble: 'false'
    , facingPages: 'false'
    , sameSheetConfigForAll: 'false'
    , masterSheets: ''
  }
)})

const getNewDeclaration = (options) => ({
  package: [
    attr({
      schemaVersion:          "1.0.0.19"
      , htmlVersion:          "1.0.0.2"
      , xmlns:                'http://www.objectiflune.com/connectschemas/Template'
      , 'xsi:schemaLocation': 'http://www.objectiflune.com/connectschemas/Template http://www.objectiflune.com/connectschemas/Template/1_0_0_19.xsd'
      , 'xmlns:xsi':          'http://www.w3.org/2001/XMLSchema-instance'
    })
    , { metadata: [
      { cmis: [
        { validFromDate: '2016-03-11T09:31:49.904-08:00' }
        , { validFromTime: '2016-03-11T09:31:49.904-08:00' }
        , { validUntilDate: '2016-03-11T09:31:49.904-08:00' }
        , { validUntilTime: '2016-03-11T09:31:49.904-08:00' }
      ]}
    ]}
    , getNewManifest(options)
    , { datamodelconfigadapter: [
      { dataTypes: [] }
      , { datamodel: [] }
    ]}
    , { locale: [{ source: 'SYSTEM' }]}
    , { colorSettings: [
      { colorManagement: ['false'] }
      , { renderingIntent: ['RELATIVE_COLORIMETRIC'] }
    ]}
    , { scripts: options.scripts.map(getNewScript) }
  ]
})

const getNewManifest = (options) => {
  const images = options.images.map(img);
  const javascripts = getScriptsDeclaration(options.javascripts);
  const stylesheets = getStylesheetsDeclaration(options.stylesheets);
  const section = getNewSection(options.index, options);
  return {
    manifest: [
        { colorProfiles: [] }
      , { colorSpaces: [
          { colorSpace: [
            { _attr: { id: 'res-a2f841c3-fb54-4bac-972e-163db60e8852' } }
            , { colorSpaceType: '2' }
            , { name: 'CMYK' }
          ] }
          , { colorSpace: [
            { _attr: { id: 'res-7a90ac9b-ca69-4735-825b-ff7c72f8a295' } }
            , { colorSpaceType: '1' }
            , { name: 'RGB' }
          ] }
        ] }
      , { colorTints: [] }
      , { colors: [] }
      , { contexts: [getNewContext(options.context, options.index)] }
      , { fontDefinitions: [] }
      , { fonts: [] }
      , { images: images }
      , { javascripts: javascripts }
      , { masters: [] }
      , { medias: [] }
      , { sections: [section] }
      , { stylesheets: stylesheets }
    ]
  }
}

const sortResources = (files) =>
  files.filter(f => !isRemote(f)).concat(files.filter(isRemote))

const getScriptsDeclaration = (files) =>
  sortResources(files).map(f => isRemote(f) ? remoteJs(f) : js(f))

const getStylesheetsDeclaration = (files) =>
  sortResources(files).map(f => isRemote(f) ? remoteCss(f) : css(f))


// FileSystem manipulation

const structure = {
  public: {
    document: {
        snippets: {}
      , 'color-profiles': {}
      , generated: [
        '_ol_font_definition.css'
      ]
      , fonts: []
      , css: []
      , images: []
      , js: []
      //, 'section-UUID.html'
    }
  }
}

const makeFileStructure = (path) => {
  fs.ensureDirSync(path);
  fs.mkdirsSync(join(path, 'public', 'document', 'snippets'));
  fs.mkdirsSync(join(path, 'public', 'document', 'color-profiles'));
  fs.mkdirsSync(join(path, 'public', 'document', 'generated'));
  fs.mkdirsSync(join(path, 'public', 'document', 'fonts'));
  fs.mkdirsSync(join(path, 'public', 'document', 'css', 'external'));
  fs.mkdirsSync(join(path, 'public', 'document', 'images'));
  fs.mkdirsSync(join(path, 'public', 'document', 'js', 'external'));
}

const copyResources = (path, base, files, ext) => {
  return files.map(file => {
    if (isRemote(file)) {
      let name     = sanitize(basename(file, `.${ext}`))
      let filename = unixJoin('public', 'document', ext, 'external', `${name}.r${ext}`)
      fs.writeFileSync(join(path, filename), file)
      return filename
    } else {
      let filepath = join(base, file)
      let filename = unixJoin('public', 'document', ext, basename(file));
      if (fs.existsSync(filepath)) {
        fs.copySync(filepath, join(path, filename));
        return filename;
      } else {
        console.log(chalk.red(`Couldn't find ${filepath}`))
        return false
      }
    }
  })
  .filter(Boolean)
}


// Config

const xmlOptions = {
    declaration: {
        standalone: 'yes'
      , encoding: 'UTF-8'
    }
  , indent: '  '
}


// Template generation

const generateOLTemplate = (input, output) => new Promise((resolve, reject) => {
  let images = [];
  let javascripts = [];
  let stylesheets = [];
  let scripts = [];

  jsdom(input, [])
  .then(window => {
    const doc = window.document
    const $   = s => doc.querySelector(s)
    const $$  = s => [].slice.call(doc.querySelectorAll(s))

    $$('head link[rel=stylesheet]').forEach((el) => {
      stylesheets.push(el.getAttribute('href'));
    })

    $$('head script[src]').forEach((el) => {
      javascripts.push(el.getAttribute('src'));
    })

    $$('head script[type="application/connect"]').forEach((el) => {
      const source   = trimLeft(el.innerHTML)
      const name     = el.getAttribute('name')
      const enabled  = el.getAttribute('enabled')
      const control  = el.getAttribute('control')
      const type     = el.getAttribute('selectorType')
      const selector = el.getAttribute('selectorText')
      const text     = el.getAttribute('findText')
      scripts.push({source, name, enabled, control, type, text, selector});
    })

    $$('img[src]').forEach((el) => {
      const src = el.getAttribute('src');
      if (!isRemote(src)) {
        images.push(src);
        el.setAttribute('src', join('images', basename(src)));
      }
    })

    const build = join(os.tmpdir(), uuid.v4())

    makeFileStructure(build);

    const title = ($('title') || {}).textContent || output
    const body  = $('body').innerHTML

    const html_base = dirname(input);
    images      = copyResources(build, html_base, images, 'images');
    javascripts = copyResources(build, html_base, javascripts, 'js');
    stylesheets = copyResources(build, html_base, stylesheets, 'css');

    //log(javascripts);
    //log(stylesheets);
    //log(scripts);

    const index = join('public', 'document', `section-${uuid.v4()}.html`);
    const context = id(index + '-context')
    fs.writeFileSync(join(build, index), body);

    const declaration = getNewDeclaration({index, title, images, javascripts, stylesheets, scripts, context});
    fs.writeFileSync(join(build, 'index.xml'), xml(declaration, xmlOptions))

    const migration = '2017-02-03 11:14:56 Template migrated from 1.0.0.19 to 1.0.0.2\r\n'
    fs.writeFileSync(join(build, 'migration.txt'), migration)

    return zip(build, output)
    .then(() => rmdir(build))
    .then(() => {
      resolve()
    })
  })
  .catch(err => {
    reject(err)
  })
})


module.exports = generateOLTemplate
