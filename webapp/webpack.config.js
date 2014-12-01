var webpack = require("webpack");

module.exports = {
    entry: "./frontend/site.jsx",
    output: {
        path: "./static",
        filename: "frontend.js",
    },
    externals: {
        jquery: "jQuery",
        React: "React",
        _: "_",
        Backbone: "Backbone"
    },
    module: {
        loaders: [
            { test: /\.jsx$/, loader: "jsx-loader?harmony" },
            { test: /\.js$/, loader: "es6-loader" }
        ]
    }
};
