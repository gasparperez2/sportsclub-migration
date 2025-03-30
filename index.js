const server = require('./src/app.js');

const PORT = 3000

server.listen(PORT, () => {
  console.log('%s listening at ' + String(PORT)); // eslint-disable-line no-console
});