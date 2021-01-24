const express = require("express");
const path = require("path");
const Eureca = require("eureca.io");
const http = require("http");

const port = 8000;
const allow = [
  "setId",
  "spawnEnemy",
  "kill",
  "updateState"
];

const app = express();
const httpServer = http.createServer(app);

app.use(express.static(path.join(__dirname, 'public')));

const clients = {};
const eurecaServer = new Eureca.Server({ allow });

eurecaServer.attach(httpServer);

eurecaServer.onConnect(function(connection) {
  const id = connection.id
  const addr = connection.remoteAddress
  const remote = eurecaServer.getClient(id);

  clients[id] = { id, remote };
  remote.setId(id);

  console.log("New Client id=%s ", id, addr);
});

eurecaServer.onDisconnect(function(connection) {
  const id = connection.id

  delete clients[id];

  for (const c in clients) {
    clients[c].remote.kill(id);
  }

  console.log("Client disconnected ", id);
});

eurecaServer.exports.handshake = function() {
  for (const c in clients) {
    const remote = clients[c].remote;
    for (const cc in clients) {
      const x = clients[c].laststate ? clients[c].laststate.x : 0;
      const y = clients[c].laststate ? clients[c].laststate.y : 0;

      remote.spawnEnemy(clients[cc].id, x, y);
    }
  }
};

eurecaServer.exports.handleKeys = function(keys) {
  const updatedClient = clients[this.connection.id];
  console.log(keys)
  for (const c in clients) {
    clients[c].remote.updateState(updatedClient.id, keys);
    clients[c].laststate = keys;
  }
};

httpServer.listen(port);

console.log(`httpServer started at port ${port}`)
