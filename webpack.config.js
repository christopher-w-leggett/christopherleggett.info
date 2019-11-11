const path = require('path');
const properties = require('./gulp/properties.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const glob = require('glob');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = async () => {
    const buildDir = await properties.read('frontend-build-dir', false);
    const codeEntryFiles = await properties.read('frontend-code-entry-files', false);
    const codeBuildDir = await properties.read('frontend-code-build-dir', false);
    const stylesBuildDir = await properties.read('frontend-styles-build-dir', false);
    const contentRootDir = await properties.read('frontend-content-root-dir', false);
    const modulesDirs = await properties.read('frontend-module-dirs', false);

    //build content files for html generation.
    const contentPlugins = glob.sync(
        '**/*.handlebars',
        { cwd: contentRootDir }
    ).map((file) => {
        const filepath = file.substring(0, file.length - '.handlebars'.length);
        const possibleChunk = filepath.replace(/\//g, "-");
        const chunk = codeEntryFiles.hasOwnProperty(possibleChunk) ? possibleChunk : 'main';

        return new HtmlWebpackPlugin({
            filename: `${filepath}.html`,
            template: `${contentRootDir}/${file}`,
            minify: !isDevelopment,
            chunks: [chunk]
        });
    });

    //process entry files
    const processedEntryFiles = Object.keys(codeEntryFiles).reduce((acc, key) => {
        acc[key] = `./${codeEntryFiles[key]}`;
        return acc;
    }, {});

    //return webpack config
    return {
        entry: processedEntryFiles,
        output: {
            path: path.resolve(__dirname, buildDir),
            filename: `${codeBuildDir}/[name]-[hash].js`
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
                filename: `${stylesBuildDir}/[name]-[hash].css`
            }),
            ...contentPlugins
        ]
    };
};
