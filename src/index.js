/*
 * index.js
 * Copyright (C) 2016 romgrk <romgrk@Romgrk-ARCH>
 *
 * Distributed under terms of the MIT license.
 */

const fs = require('fs-extra');
const { join, basename, dirname } = require('path');
const util = require('util');
const jsdom = require('jsdom').env;
const xml = require('xml');
const uuid = require('node-uuid');

const log = (...args) => {
  args.forEach((arg) => {
    console.log(util.inspect(arg, {colors: true}));
  })
}

const uuidByFilename = {};
const id = (filename) => {
  if (!uuidByFilename[filename])
    uuidByFilename[filename] = uuid.v4();
  return uuidByFilename[filename];
}

const isRemote = (path) =>
  /^(https?:)?\/\//.test(path) || /.r(js|css)$/.test(path)

// XML generation

const attr = (obj) => ({ _attr: obj });

const children = (obj) => {
  if (typeof(obj) == 'string')
    return [obj];
  const res = [];
  for (let key in obj) {
    if (key == '_attr')
      res.push({ [key]: obj[key] });
    else
      res.push({ [key]: children(obj[key]) });
  }
  return res;
}


const img = (filename) => ({ image: [
    attr({ id: `res-${id(filename)}` })
  , { location: [filename] }
]})

const js = (filename) => ({ javascript: [
    attr({ id: `res-${id(filename)}` })
  , { location: [filename] }
]})

const remoteJs = (filename) => ({ remoteJavascript: [
    attr({ id: `res-${id(filename)}` })
  , { location: [filename] }
  , { async: 'false' }
  , { defer: 'false' }
  , { cachedCotg: 'false' }
]})

const css = (filename) => ({ stylesheet: [
    attr({ id: `res-${id(filename)}` })
  , { location: [filename] }
]})

const remoteCss = (filename) => ({ remoteStylesheet: [
    attr({ id: `res-${id(filename)}` })
  , { location: [filename] }
  , { cachedCotg: 'false' }
]})

const context = (filename) => ({
  context: children({
      _attr: { id: `res-${id(filename)}` }
    , type: 'WEB'
    , section: ''
    , defSection: ''
  })
})

const section = (filename, options) => ({
  section: children({
      _attr: { id: `res-${id(filename)}` }
    , location: filename
    , context: '' // TODO
    , name: '' // TODO
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
    , styleSheetOrder: 'res-bc80c408-5695-48a8-acf8-4b24d1ae88e2'
    , includedStyleSheets: 'res-d7560534-e921-495f-97c6-f271e277db49'
    , javaScriptOrder: 'res-ae4e5e55-6e2a-4604-8b2d-bdf53e10446b'
    , includedJavaScripts: 'res-b7f8c42a-bbb3-4a45-a4eb-4a7b288e4977'
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
    , 'web-pageTitle': ''
    , guides: ''
    , tumble: 'false'
    , facingPages: 'false'
    , sameSheetConfigForAll: 'false'
    , masterSheets: ''
  }
)})

const getNewIndex = (options) => ({
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
    , { scripts: [] }
  ]
})

const getNewManifest = (options) => ({
  manifest: [
    { colorProfiles: [] }
    , { colorSpaces: [] }
    , { colorTints: [] }
    , { colors: [] }
    , { contexts: [] }
    , { fontDefinitions: [] }
    , { fonts: [] }
    , { images: [] }
    , { javascripts: getScriptsDeclaration(options.scripts) }
    , { masters: [] }
    , { medias: [] }
    , { sections: [section('yo.html')] }
    , { stylesheets: getStylesheetsDeclaration(options.stylesheets) }
  ]
})

const getScriptsDeclaration = (files) =>
  files.map(f => isRemote(f) ? remoteJs(f) : js(f))

const getStylesheetsDeclaration = (files) =>
  files.map(f => isRemote(f) ? remoteCss(f) : css(f))


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
  fs.mkdirsSync(join(path, 'documents', 'snippets'));
  fs.mkdirsSync(join(path, 'documents', 'color-profiles'));
  fs.mkdirsSync(join(path, 'documents', 'generated'));
  fs.mkdirsSync(join(path, 'documents', 'fonts'));
  fs.mkdirsSync(join(path, 'documents', 'css', 'external'));
  fs.mkdirsSync(join(path, 'documents', 'images'));
  fs.mkdirsSync(join(path, 'documents', 'js', 'external'));
}

const copyResources = (path, base, files, ext) => {
  return files.map(file => {
    if (isRemote(file)) {
      let filename = join('documents', ext, 'external', basename(file, `.${ext}`) + `.r${ext}`);
      fs.writeFileSync(join(path, filename), file);
      return filename;
    } else {
      let filename = join('documents', ext, basename(file));
      fs.copySync(join(base, file), join(path, filename));
      return filename;
    }
  })
}

// Config

const config = {
  main: '/home/romgrk/work/node_app/public/quote_section.html'
  , out: './out'
}

const xmlOptions = {
    declaration: {
        standalone: 'yes'
      , encoding: 'UTF-8'
    }
  , indent: '  '
}

let title = '';
let images = [];
let scripts = [];
let stylesheets = [];

let body = '';

const readHTML = (err, window) => {
  const $ = window.$;

  title = $('head title').text();
  body = $('body').html();

  $('head link[rel=stylesheet]').each(function (i, s) {
    stylesheets.push($(this).attr('href'));
  });

  $('head script[src]').each(function (i, s) {
    scripts.push($(this).attr('src'));
  });

  $('img[src]').each(function () {
    images.push($(this).attr('src'))
  })

  log(scripts);
  log(stylesheets);

  let html_base = dirname(config.main);
  scripts     = copyResources(config.out, html_base, scripts, 'js');
  stylesheets = copyResources(config.out, html_base, stylesheets, 'css');

  log(scripts);
  log(stylesheets);

  log(body);
  log(body.length);
  //log(externalStylesheets);

  let index = getNewIndex({scripts, stylesheets});

  makeFileStructure(config.out);

  let section = `section-${uuid.v4()}.html`;
  fs.writeFileSync(join(config.out, 'documents', section));

  //console.log(xml(index, xmlOptions));
}

log(config);

jsdom(config.main, ['http://code.jquery.com/jquery.js'], readHTML);

