const path = require('path');

const { EnvironmentPlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

require('dotenv').config();

module.exports = {
	entry: resolve('src', 'index.tsx'),
	devServer: {
		open: true,
	},
	mode: getBuildMode(),
	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/,
				loader: 'ts-loader',
			},
			{
				test: /\.svg$/,
				loader: 'svg-sprite-loader',
			},
		],
	},
	output: {
		path: resolve('build'),
		filename: 'bundle.js',
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: resolve('src', 'index.html'),
		}),
		new EnvironmentPlugin(['SPOTIFY_CLIENT_ID', 'SPOTIFY_REDIRECT_URI']),
	],
	resolve: {
		extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
		plugins: [new TsconfigPathsPlugin()],
	},
	stats: 'minimal',
	target: 'web',
};

function getBuildMode() {
	return process.env.NODE_ENV || 'development';
}

function resolve(...paths) {
	return path.resolve(__dirname, ...paths);
}
