var directionSpeed = 220;


var Entity = function(server, game, x, y, id, playerId, ) {
  this.cursor = {
    left: false,
    right: false,
    up: false,
    fire: false
  };

  this.input = {
    left: false,
    right: false,
    up: false,
    fire: false
  };

  this.playerId = playerId;
  this.server = server;
  this.game = game;
  this.player = player

  this.alive = true;

  this.entity = game.add.sprite(0, 0, "ship");
  this.entity.scale.set(2);
  this.entity.animations.add("fly", [0, 1, 2, 3, 4, 5], 10, true);
  this.entity.play("fly");
  this.entity.anchor.set(0.5);
  this.entity.id = id;

  this.game.physics.p2.enable(this.entity);

  this.entity.body.setZeroDamping();
  this.entity.body.fixedRotation = true;
};

Entity.prototype.update = function() {
  var inputChanged =
    this.cursor.left !== this.input.left ||
    this.cursor.right !== this.input.right ||
    this.cursor.down !== this.input.down ||
    this.cursor.up !== this.input.up;

  this.entity.body.setZeroVelocity();

  if (this.cursor.left) {
    this.entity.body.moveLeft(directionSpeed);
  } else if (this.cursor.right) {
    this.entity.body.moveRight(directionSpeed);
  }

  if (this.cursor.up) {
    this.entity.body.moveUp(directionSpeed);
  } else if (this.cursor.down) {
    this.entity.body.moveDown(directionSpeed);
  }

  if (inputChanged) {
    if (this.entity.id === this.playerId) {
      this.input.x = this.entity.x;
      this.input.y = this.entity.y;
      this.server.handleKeys(this.input);
    }
  }
};

Entity.prototype.kill = function() {
  this.alive = false;
  this.entity.kill();
};
