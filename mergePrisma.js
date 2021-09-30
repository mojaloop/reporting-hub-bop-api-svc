/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

const fs = require('fs');
const path = require('path');

const prismaDir = path.join(__dirname, 'prisma');
const baseDir = path.join(prismaDir, 'base');
const overlayDir = path.join(prismaDir, 'overlays');
const outDir = path.join(__dirname, 'src/generated');

const parseSchema = (path) => {
  const schema = {};
  let currentBlock;
  let currentKey;
  fs.readFileSync(path, 'utf-8').split(/\r?\n/).forEach((line) => {
    const components = line.trim().split(/\s+/);
    if (components[2] === '{') {
      const def = components.slice(0, 2).join(' ');
      schema[def] = {};
      currentBlock = def;
    } else if (currentBlock && !['}', ''].includes(components[0])) {
      const block = schema[currentBlock];
      const key = /(?<!@)@(?!@)/.test(components[0]) ? currentKey : components[0];
      block[key] = (block[key] || []).concat(...components);
      currentKey = key;
    }
  });
  return schema;
}

const mergeSchema = (name) => {
  const baseSchema = parseSchema(path.join(baseDir, name));
  const overlaySchema = fs.existsSync(path.join(overlayDir, name)) ?
    parseSchema(path.join(overlayDir, name)) : {};

  let data = [];

  const blockDefs = [...new Set(Object.keys(baseSchema).concat(Object.keys(overlaySchema)))];
  for (const blockDef of blockDefs) {
    data.push(`${blockDef} {`);
    const blockKeys = Object.keys(overlaySchema[blockDef] || {}).concat(Object.keys(baseSchema[blockDef] || {}))
    for (const key of blockKeys) {
      data.push((overlaySchema[blockDef]?.[key] || baseSchema[blockDef]?.[key]).join(' '))
    }
    data.push('}');
  }

  fs.writeFileSync(path.join(outDir, name), data.join('\n'));
}

fs.mkdirSync(outDir, { recursive: true });

const dir = fs.opendirSync(baseDir);
let dirent
while ((dirent = dir.readSync()) !== null) {
  console.log(`Processing ${dirent.name} ...`);
  const schema = path.basename(dirent.name);
  mergeSchema(schema);
}
dir.closeSync()
