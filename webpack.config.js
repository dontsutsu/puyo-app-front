const path = require("path");

module.exports = {
	entry: {
		editor: path.resolve(__dirname, "src", "ts", "editor.ts"),
		tokopuyo: path.resolve(__dirname, "src", "ts", "tokopuyo.ts"),
		nazotoki: path.resolve(__dirname, "src", "ts", "nazotoki.ts"),
	},
	output: {
		path: path.resolve(__dirname, "dist", "static", "js"),
		filename: "[name]_bundle.js"
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: "ts-loader"
			}
		]
	},
	resolve: {
		extensions: [".ts", ".js"]
	},
	devServer: {
		static: {
			directory: path.resolve(__dirname, "dist"),
		},
		open: true,
	}
}