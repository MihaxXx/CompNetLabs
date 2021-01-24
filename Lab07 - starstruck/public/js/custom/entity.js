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

  this.facing = 'left';
  this.jumpTimer = 0;
  this.playerId = playerId;
  this.server = server;
  this.game = game;
  this.player = player

  this.alive = true;

  this.entity = game.add.sprite(32, 32, 'dude');
  /*this.entity.scale.set(2);
  this.entity.animations.add("fly", [0, 1, 2, 3, 4, 5], 10, true);
  this.entity.play("fly");
  this.entity.anchor.set(0.5);*/
  this.entity.id = id;

  this.game.physics.enable(this.entity, Phaser.Physics.ARCADE);

  /*this.entity.body.setZeroDamping();
  this.entity.body.fixedRotation = true;*/
  this.entity.body.bounce.y = 0.2;
  this.entity.body.collideWorldBounds = true;
  this.entity.body.setSize(20, 32, 5, 16);
  
  
  this.entity.animations.add('left', [0, 1, 2, 3], 10, true);
  this.entity.animations.add('turn', [4], 20, true);
  this.entity.animations.add('right', [5, 6, 7, 8], 10, true);
};

Entity.prototype.update = function() {
  var inputChanged =
    this.cursor.left !== this.input.left ||
    this.cursor.right !== this.input.right ||
    this.cursor.down !== this.input.down ||
    this.cursor.up !== this.input.up;

  game.physics.arcade.collide(this.entity, layer);
  this.entity.body.velocity.x = 0;

  if (this.cursor.left) {
    this.entity.body.velocity.x = -150;

        if (this.entity.facing != 'left')
        {
            this.entity.animations.play('left');
            this.entity.facing = 'left';
        }
  } else if (this.cursor.right) {
    this.entity.body.velocity.x = 150;

        if (this.entity.facing != 'right')
        {
            this.entity.animations.play('right');
            this.entity.facing = 'right';
        }
  }
  else
    {
        if (this.entity.facing != 'idle')
        {
            this.entity.animations.stop();

            if (this.entity.facing == 'left')
            {
                this.entity.frame = 0;
            }
            else
            {
                this.entity.frame = 5;
            }

            this.entity.facing = 'idle';
        }
    }
    if (jumpButton.isDown && this.entity.body.onFloor() && game.time.now > this.jumpTimer)
    {
        this.entity.body.velocity.y = -250;
        this.jumpTimer = game.time.now + 750;
    }
/*
  if (this.cursor.up) {
    this.entity.body.moveUp(directionSpeed);
  } else if (this.cursor.down) {
    this.entity.body.moveDown(directionSpeed);
  }
*/
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
