const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RtlCssPlugin = require('rtlcss-webpack-plugin');

const LOCAL_JS = path.join(__dirname, 'inc/assets/js');
const LOCAL_SCSS = path.join(__dirname, 'inc/assets/scss');
const BUILD_DIR = path.join(__dirname, 'inc/assets/dist');

module.exports = {
    entry: {
        app: [`${LOCAL_JS}/main.js`],
        style: [`${LOCAL_SCSS}/style.scss`],
        style_rtl: [`${LOCAL_SCSS}/style_rtl.scss`],
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.(scss|css)$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
            },
        ],
    },
    watch: true,
    mode: 'development',
    resolve: {
        extensions: ['.js', '.css', '.scss'],
    },
    output: {
        path: BUILD_DIR,
        filename: '[name].js',
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
        new RtlCssPlugin({
            filename: '[name]-rtl.css',
        }),
    ],
};
