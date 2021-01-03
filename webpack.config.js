const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode : "development",
  entry : {
    index : './resources/js/js.js',
    cart : './resources/js/customer/cart.js',
    track : './resources/js/customer/track.js',
    adminOrders : './resources/js/admin/adminOrders.js',
    css : ['./resources/scss/scss.scss'],
  },

  devtool : 'inline-source-map',

  module : {
    rules : [
      {
        test : /\.css$/i,
        use : ["style-loader", "css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader",],
      },
    ],
  },

  plugins : [
    new MiniCssExtractPlugin({
      filename : 'css.css',
    }),
  ],

  output : {
    path : __dirname + '/public/js',
    filename : '[name].js',
  },
}
