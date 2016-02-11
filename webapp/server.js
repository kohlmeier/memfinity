import express from 'express';
import path from 'path';
import webpack from 'webpack';
import devMiddleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';

import devWebpackConf from './webpack.config';


const PORT = /*process.env.PORT ||*/ 8083;
const dist = __dirname;

const app = express();
const compiler = webpack(devWebpackConf);

app.use(devMiddleware(compiler, {
  // TODO(joel) what does this do?
  noInfo: true,
  publicPath: devWebpackConf.output.publicPath,
}));

app.use(hotMiddleware(compiler));

app.use(express.static(dist));

app.get('/', (req, res) => {
  res.sendFile(path.join(dist, 'index.html'));
});

app.listen(PORT, 'localhost', err => {
  if (err) {
    throw new Error('webpack-hot-server', err);
  }

  console.log('[webpack-hot-server] on ' + PORT);
});
