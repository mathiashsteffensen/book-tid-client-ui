const next = require('next');
const express = require('express');
const http = require('http');
const express_enforces_ssl = require('express-enforces-ssl');

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // redirect to SSL
  server.enable('trust proxy');
 
  server.use(express_enforces_ssl());

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  http.createServer(app).listen(port, function() {
    console.log('Express server listening on port ' + port);
  },);
});