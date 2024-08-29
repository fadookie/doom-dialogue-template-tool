#!/usr/bin/env node

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const dataDirPath = path.join(__dirname, '..', 'usdf');
const usdfFileNames = fs.readdirSync(dataDirPath);
const usdfFilePaths = usdfFileNames.map(p => path.join(dataDirPath, p));

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

const finalUsdfContents = `namespace = "ZDoom";

// This is a build artifact from template-tool.js. DO NOT EDIT DIRECTLY!
// Edit the source templates in dialogue_src/usdf and then run template-tool to update!

${mergedDialogue}`;

const outputUsdfPath = path.join(__dirname, '..', '..', 'src', 'dialogue.usdf');
fs.writeFileSync(outputUsdfPath, finalUsdfContents);
console.log(`Evaluated templates and wrote merged USDF to ${outputUsdfPath}`);

