const path = require('path');
const properties = require('./gulp/properties.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const glob = require('glob');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = async () => {
    const buildDir = await properties.read('frontend-build-dir', false);
    const codeEntryFile = await properties.read('frontend-code-entry-file', false);
    const codeBuildDir = await properties.read('frontend-code-build-dir', false);
    const contentRootDir = await properties.read('frontend-content-root-dir', false);

    //build content files for html generation.
    const contentPlugins = glob.sync(
        '**/*.handlebars',
        { cwd: contentRootDir }
    ).map((file) => {
        return new HtmlWebpackPlugin({
            filename: `${file.substring(0, file.length - '.handlebars'.length)}.html`,
            template: `${contentRootDir}/${file}`,
            minify: !isDevelopment
        });
    });

    //return webpack config
    return {
        entry: './' + codeEntryFile,
        output: {
            path: path.resolve(__dirname, buildDir),
            filename: `${codeBuildDir}/[hash].js`
        },
        devtool: isDevelopment && 'source-map',
        mode: isDevelopment ? 'development' : 'production',
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
                },
                {
                    test: /\.handlebars$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'handlebars-loader'
                    }
                }
            ]
        },
        plugins: [...contentPlugins]
    };
};
