const moduleAlias = require("module-alias");
moduleAlias.addAlias("@xsrt/common", __dirname + "../../../packages/common/src")
require('reflect-metadata');
require('ts-node').register({ project: './tsconfig.spec.json', transpileOnly: true })
require('source-map-support/register')
