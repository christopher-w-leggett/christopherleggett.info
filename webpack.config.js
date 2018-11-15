const path = require('path');
const properties = require('./gulp/properties.js');

module.exports = async () => {
    const codeEntryFile = await properties.read('frontend-code-entry-file', false);
    const codeFileName = await properties.read('frontend-code-file-name', false);

    return {
        entry: './' + codeEntryFile,
        output: { filename: codeFileName },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react']
                        }
                    }
                }
            ]
        }
    };
};
