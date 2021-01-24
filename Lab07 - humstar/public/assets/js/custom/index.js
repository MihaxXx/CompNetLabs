var playerId = 0;

var background;
var player;
var entities;
var cursors;
var ready = false;
var server;

var eurecaClientSetup = function() {
  var client = new Eureca.Client();

  client.ready(function(proxy) {
    server = proxy;
  });

  client.exports.setId = function(id) {
    playerId = id;
    createGame();
    server.handshake();
    ready = true;
  };

  client.exports.kill = function(id) {
    if (entities[id]) {
      entities[id].kill();
    }
  };

  client.exports.spawnEnemy = function(index) {
    if (index == playerId) {
      return;
    }

    entities[index] = new Entity(server, game, index, playerId);
  };

  client.exports.updateState = function(id, state) {
    if (entities[id]) {
      entities[id].cursor = state;
      entities[id].entity.x = state.x;
      entities[id].entity.y = state.y;
      entities[id].entity.angle = state.angle;
      entities[id].update();
    }
  };
};

var game = new Phaser.Game(800, 600, Phaser.AUTO, "phaser-example", {
  preload: preload,
  create: eurecaClientSetup,
  update: update,
  render: render
});

function preload() {
  game.load.image("stars", "assets/images/starfield.jpg");
  game.load.spritesheet("ship", "assets/images/humstar.png", 32, 32, 90);
}

function createGame() {
  entities = {};

  game.world.setBounds(-1000, -1000, 2000, 2000);
  game.stage.disableVisibilityChange = true;
  game.physics.startSystem(Phaser.Physics.P2JS);
  game.physics.p2.defaultRestitution = 0.8;

  background = game.add.tileSprite(0, 0, 800, 600, "stars");
  background.fixedToCamera = true;

  player = new Entity(server, game, playerId, playerId);
  player.entity.x = 0;
  player.entity.y = 0;
  player.entity.bringToTop();

  entities[playerId] = player;

  game.camera.follow(player.entity);
  game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
  game.camera.focusOnXY(0, 0);

  cursors = game.input.keyboard.createCursorKeys();
}

function update() {
  if (!ready) {
    return;
  }

  player.input.left = cursors.left.isDown;
  player.input.right = cursors.right.isDown;
  player.input.up = cursors.up.isDown;
  player.input.down = cursors.down.isDown;
  //player.input.tx = game.input.x + game.camera.x;
  //player.input.ty = game.input.y + game.camera.y;

  background.tilePosition.x = -game.camera.x;
  background.tilePosition.y = -game.camera.y;

  for (const i in entities) {
		if (!entities[i]) {
      continue;
    }

    entities[i].update();
  }
}

function render() {}
