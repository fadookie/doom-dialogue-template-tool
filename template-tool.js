#!/usr/bin/env node

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const packageJson = require('./package.json');

const argv = require('yargs')
  .scriptName("template-tool")
  .option('templates-dir', {
    alias: 't',
    demandOption: true,
    describe: 'Path to directory of dialogue template files to be parsed, transformed, and merged.',
    type: 'string'
  })
  .option('template-extension', {
    alias: 'x',
    describe: 'File extension for files to include from the templates-dir. If not set, all files will be parsed and merged.',
    type: 'string'
  })
  .option('out-file', {
    alias: 'o',
    demandOption: true,
    describe: 'Path to merged dialogue output file. If it exists, it will be overwritten.',
    type: 'string'
  })
  .option('header', {
    alias: 'h',
    demandOption: true,
    default: path.join(__dirname, 'default-header.template.usdf'),
    defaultDescription: 'Default header for ZDoom namespace.',
    describe: 'Path to header that gets inserted at the top of the merged dialogue file.',
    type: 'string'
  })
  .option('verbose', {
    alias: 'v',
    describe: 'Verbose logging. If not supplied, script will only log errors.',
    type: 'boolean'
  })
  .help()
  .argv

console.log(argv);

const usdfFileNames = fs.readdirSync(argv.templatesDir)
  .filter(fileName => argv.templateExtension ? fileName.endsWith(argv.templateExtension) : true);
const usdfFilePaths = usdfFileNames.map(p => path.join(argv.templatesDir, p));
if (argv.verbose) console.log('Found input templates:', usdfFilePaths);

const usdfDialogueContents = usdfFilePaths.map(p => fs.readFileSync(p, 'utf8'));

const pageIdRegex = /{{PAGE_[\dA-Za-z_]+}}/g;

const mergedDialogue = usdfDialogueContents.reduce((acc, dialogueTemplateString, usdfTemplateIndex) => {
  const pageIdTokens = dialogueTemplateString.match(pageIdRegex) || [];
  const pageIds = pageIdTokens.map(token => token.replace("{{", "").replace("}}", ""));

  // Validate no duplicate IDs
  const uniquePageIds = _.uniq(pageIds);
  assert.equal(uniquePageIds.length, pageIds.length, `Duplicate page ID declaration detected in ${usdfFileNames[usdfTemplateIndex]}. pageIds:${JSON.stringify(pageIds)}`);

  const template = _.template(dialogueTemplateString);

  // console.log({pageIdTokens, pageIds });

  let pageSubstitutions = {};

  for (let i = 0; i < pageIds.length; ++i) {
    const pageIndex = i + 1;
    const pageId = pageIds[i];
    pageSubstitutions[pageId] = pageIndex;
  }

  // console.log({pageSubstitutions});

  // Template function will throw an error if an unknown substitution token is supplied
  const subsitutedDialogue = template(pageSubstitutions);
  return acc + "\n\n" + subsitutedDialogue;
}, "");

const header = fs.readFileSync(argv.header, 'utf8');

// TODO link GitHub repo in header comment
const finalUsdfContents = `${header}

// This is a build artifact from template-tool.js v${packageJson.version}. DO NOT EDIT DIRECTLY!
// Edit the source templates in ${argv.templatesDir} and then run template-tool to update!

${mergedDialogue}`;

const outFileAbsolute = path.resolve(argv.outFile);
fs.writeFileSync(outFileAbsolute, finalUsdfContents);
if (argv.verbose) console.log(`Evaluated templates and wrote merged dialogue to '${outFileAbsolute}'`);

