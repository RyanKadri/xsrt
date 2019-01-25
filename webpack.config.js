const { viewerDev, viewerProd, bootstrapScripts, compileExtension, compileBackend } = require('./webpack.common')

module.exports = [
    viewerDev,
    viewerProd,
    bootstrapScripts,
    compileExtension,
    compileBackend
]
