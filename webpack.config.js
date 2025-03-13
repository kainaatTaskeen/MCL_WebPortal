const path = require('path');

module.exports = [
    {
        mode: 'development',
        entry: './assets/scripts/MCL.js',
        output: {
            filename: 'MCL.js',
            path: path.resolve(__dirname, 'static', 'project_res', 'js'),
        },
        //Add source map
        // devtool: 'source-map',
        //To minified bundle file use this code
        optimization: {
            minimize: true
        },
        // cache: false,
    },
]

module.exports.parallelism = 2;