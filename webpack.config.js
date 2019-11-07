const path = require('path');
const properties = require('./gulp/properties.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const glob = require('glob');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = async () => {
    const buildDir = await properties.read('frontend-build-dir', false);
    const codeEntryFile = await properties.read('frontend-code-entry-file', false);
    const codeBuildDir = await properties.read('frontend-code-build-dir', false);
    const stylesBuildDir = await properties.read('frontend-styles-build-dir', false);
    const contentRootDir = await properties.read('frontend-content-root-dir', false);
    const modulesDirs = await properties.read('frontend-module-dirs', false);

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
                    test: /\.scss$/,
                    exclude: /node_modules/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader'
                    ]
                },
                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        'css-loader'
                    ]
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
        resolve: {
            modules: [
                ...modulesDirs.map((moduleDir) => path.resolve(__dirname, moduleDir)),
                'node_modules'
            ]
        },
        // optimization: {
        //     splitChunks: {
        //         cacheGroups: {
        //             styles: {
        //                 name: 'styles',
        //                 test: /\.css$/,
        //                 chunks: 'all',
        //                 enforce: true
        //             }
        //         }
        //     }
        // },
        plugins: [
            new MiniCssExtractPlugin({
                filename: `${stylesBuildDir}/[hash].css`
            }),
            ...contentPlugins
        ]
    };
};
