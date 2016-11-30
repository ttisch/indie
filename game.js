gameStates.Game = {
  init: function(level) {
    this.level = level;
  },
  preload: function () {
    vars.InGame.Ground = undefined;
    vars.InGame.CoinLayer = undefined;
    vars.InGame.Player = undefined;
    vars.InGame.Enemies = [];
    vars.InGame.JumpTimer = 0;
    if(vars.InGame.Level <= 1) {
      vars.InGame.PlayerCoins = 0;
      vars.InGame.ScoreText = undefined;
      vars.InGame.GameOver = false;
    }
  },
  create: function () {
    //Enable cursor keys so we can create some controls
    cursors = this.input.keyboard.createCursorKeys();

    // Esc returns to main menu
    this.game.input.keyboard.onDownCallback = function (e) {
      if (e.keyCode == 27) {
        this.game.state.start('MainMenu');
      }
    }

    //Start the Arcade Physics systems
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    //Change the background colour
    this.game.stage.backgroundColor = "#a9f0ff";

    //Add the tilemap and tileset image. The first parameter in addTilesetImage
    //is the name you gave the tilesheet when importing it into Tiled, the second
    //is the key to the asset in Phaser
    this.map = this.game.add.tilemap(this.level);
    this.map.addTilesetImage('platformer_tilesx2', 'tiles');
    this.map.addTilesetImage('blocks1', 'blocks1');
    //this.map.addTilesetImage('background0', 'background');
    //this.map.addTilesetImage('coin', 'coin');
    this.bg = this.game.add.tileSprite(0, 0, 800,320, 'background');
    this.bg.fixedToCamera = true;

    //Add both the background and ground layers. We won't be doing anything with the
    //GroundLayer though
    //this.backgroundlayer = this.map.createLayer('BackgroundLayer');
    vars.InGame.Ground = this.map.createLayer('GroundLayer');
    //this.layer2 = this.map.createLayer('Layer2');
    //vars.InGame.CoinLayer = this.map.createLayer('CoinLayer');

    //Before you can use the collide function you need to set what tiles can collide
    this.map.setCollisionBetween(1, 999, true, 'GroundLayer');

    this.createObjects();

    //Add the sprite to the game and enable arcade physics on it
    vars.InGame.Player = this.game.add.sprite(70, 0, 'player');
    vars.InGame.Player.collideWorldBounds = true;
    this.game.physics.arcade.enable(vars.InGame.Player);

    try {this.map.createLayer('WaterLayer');} catch(e) {}

    //vars.InGame.Enemy1 = this.game.add.sprite(120, 0, 'mummy');
    //vars.InGame.Enemy1.collideWorldBounds = true;
    //this.game.physics.arcade.enable(vars.InGame.Enemy1);

    //Change the world size to match the size of this layer
    vars.InGame.Ground.resizeWorld();

    //Set some physics on the sprite
    vars.InGame.Player.body.bounce.y = 0.2;
    vars.InGame.Player.body.gravity.y = 1500;
    vars.InGame.Player.body.gravity.x = 20;
    //this.sprite.body.velocity.x = 100;
    // vars.InGame.Enemy1.body.bounce.y = 0.2;
    // vars.InGame.Enemy1.body.gravity.y = 2000;
    // vars.InGame.Enemy1.body.gravity.x = 20;

    //Create a running animation for the sprite and play it
    vars.InGame.Player.animations.add('right', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 15, true);
    vars.InGame.Player.animations.add('left', [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], 15, true);
    // vars.InGame.Enemy1.animations.add('right', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], 15, true, 5);
    //vars.InGame.Enemy1.animations.add('left', [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], 15, true);

    var style = { font: "bold 16px 'Comic Sans MS", fill: "#914B26", boundsAlignH: "left", boundsAlignV: "middle" };
    vars.InGame.ScoreText = game.add.text(0, 0, "Score: " + vars.InGame.PlayerCoins * 10, style);
    //vars.InGame.ScoreText.anchor.setTo(0.5,0.5);
    vars.InGame.ScoreText.setTextBounds(700, 20, 100, 20);
    vars.InGame.ScoreText.fixedToCamera = true;

    vars.InGame.LevelText = game.add.text(0, 0, "Level: " + vars.InGame.Level, style);
    //vars.InGame.ScoreText.anchor.setTo(0.5,0.5);
    vars.InGame.LevelText.setTextBounds(20, 20, 100, 20);
    vars.InGame.LevelText.fixedToCamera = true;

    //Make the camera follow the sprite
    this.game.camera.follow(vars.InGame.Player);
    justJumped = false;
  },
  update: function () {
    if(vars.InGame.Player!= undefined) vars.InGame.Player.body.velocity.x = 0;
    this.bg.tilePosition.x = vars.InGame.Ground.x * -0.7;

    //Make the sprite collide with the ground layer
    this.game.physics.arcade.collide(vars.InGame.Player, vars.InGame.Ground);
    for (var index in vars.InGame.Enemies) {
      var enemy = vars.InGame.Enemies[index];
      this.game.physics.arcade.collide(enemy.Sprite, vars.InGame.Ground);
    }
    //this.game.physics.arcade.collide(vars.InGame.Enemy1, vars.InGame.Ground);
    this.game.physics.arcade.overlap(vars.InGame.Player, this.coins, this.collect, null, this);
    this.game.physics.arcade.overlap(vars.InGame.Player, this.chest, this.reachedChest, null, this);
    // this.game.physics.arcade.overlap(vars.InGame.Player, this.mummies, this.hitEnemy, null, this);

    if(cursors.left.isDown) {
      vars.InGame.Player.body.velocity.x = -200;
      vars.InGame.Player.animations.play('left');
    }
    else if(cursors.right.isDown) {
      vars.InGame.Player.body.velocity.x = 200;
      vars.InGame.Player.animations.play('right');
    }
    else {
      //  stand still
      vars.InGame.Player.animations.stop();
      vars.InGame.Player.frame = 24;
    }

    // handle hero jumping
    if( cursors.up.isDown && vars.InGame.Player.body.onFloor() && !justJumped) {
      vars.InGame.Player.body.velocity.y = -550;
      justJumped = true;
    }
    if(!cursors.up.isDown && vars.InGame.Player.body.onFloor()) justJumped = false;
    if(cursors.left.isDown && !vars.InGame.Player.body.onFloor()) {
      vars.InGame.Player.frame = 27;
    }
    else if(!vars.InGame.Player.body.onFloor()) {
      vars.InGame.Player.frame = 26;
    }

    // move enemies
    for (var i = 0; i < vars.InGame.Enemies.length; i++) {
      this.moveEnemy(i);
      this.game.physics.arcade.overlap(vars.InGame.Player, vars.InGame.Enemies[i].Sprite, this.hitEnemy, null, this);
    }

    // check if player fell out of world
    if(vars.InGame.Player.body.y > 320) {
      this.hitEnemy(null, null);
    }

    // display stats
    vars.InGame.ScoreText.setText("Score: " + vars.InGame.PlayerCoins * 10);
    vars.InGame.LevelText.setText("Level: " + vars.InGame.Level);
  },
  createObjects: function() {
    // coins
    this.coins = this.game.add.group();
    this.coins.enableBody = true;
    var result = this.findObjectsByType('coin', this.map, 'CoinLayer');
    result.forEach(function(element){
      this.createFromTiledObject(element, this.coins);
    }, this);
    // chest(s)
    this.chest = this.game.add.group();
    this.chest.enableBody = true;
    var result = this.findObjectsByType('chest', this.map, 'CoinLayer');
    result.forEach(function(element){
      this.createFromTiledObject(element, this.chest);
    }, this);
    // enemies
    this.mummies = this.game.add.group();
    this.mummies.enableBody = true;
    var result = this.findObjectsByType('mummy', this.map, 'EnemyLayer');
    result.forEach(function(element){
      this.createAnimatedSpriteFromTiledObject(element, this.mummies);
    }, this);
    // for (var i = 0; i < vars.InGame.Enemies; i++) {
    //   vars.InGame.Enemies   }
  },
  //find objects in a Tiled layer that containt a property called "type" equal to a certain value
  findObjectsByType: function(type, map, layerName) {
    var result = new Array();
    map.objects[layerName].forEach(function(element){
      if(element.properties.type === type) {
        element.y -= map.tileHeight;
        result.push(element);
      }
    });
    return result;
  },
  createFromTiledObject: function(element, group) {
    var sprite = group.create(element.x, element.y, element.properties.sprite);
    Object.keys(element.properties).forEach(function(key){
      sprite[key] = element.properties[key];
    });
  },
  createAnimatedSpriteFromTiledObject: function(element, group) {
    var sprite = this.game.add.sprite(element.x, element.y, element.properties.sprite);
    this.game.physics.arcade.enable(sprite);
    sprite.body.gravity.y = 2000;
    sprite.animations.add("right", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], 15, true, 18);
    sprite.animations.add("left", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], 15, true, 18);
    var enemy = {};
    enemy.Sprite = sprite;
    enemy.MovingRadius = 300;
    enemy.StartOffset = 0;
    enemy.Direction = element.properties.direction;
    vars.InGame.Enemies.push(enemy);
  },
  moveEnemy: function(enemyIndex) {
    //vars.InGame.Enemies[enemyIndex].Sprite.animations.stop();
    vars.InGame.Enemies[enemyIndex].Sprite.anchor.setTo(.5, 1); //so it flips around its middle
    if(vars.InGame.Enemies[enemyIndex].Direction == 'right'){
      vars.InGame.Enemies[enemyIndex].Sprite.scale.x = 1;
    }
    else {
      vars.InGame.Enemies[enemyIndex].Sprite.scale.x = -1;
    }
    if(vars.InGame.Enemies[enemyIndex].StartOffset < vars.InGame.Enemies[enemyIndex].MovingRadius) {
      vars.InGame.Enemies[enemyIndex].Sprite.animations.play(vars.InGame.Enemies[enemyIndex].Direction);
      vars.InGame.Enemies[enemyIndex].Sprite.body.velocity.x = vars.InGame.Enemies[enemyIndex].Direction == 'right' ? 50 : -50;
      if(vars.InGame.Enemies[enemyIndex].StartOffset > 10) vars.InGame.Enemies[enemyIndex].DirectionChanged = false;
      vars.InGame.Enemies[enemyIndex].StartOffset++;
    }
    if(vars.InGame.Enemies[enemyIndex].StartOffset >= vars.InGame.Enemies[enemyIndex].MovingRadius || ((vars.InGame.Enemies[enemyIndex].Sprite.body.blocked.left || vars.InGame.Enemies[enemyIndex].Sprite.body.blocked.right) && vars.InGame.Enemies[enemyIndex].DirectionChanged == false)) {
      vars.InGame.Enemies[enemyIndex].Direction = vars.InGame.Enemies[enemyIndex].Direction == 'right' ? 'left' : 'right';
      vars.InGame.Enemies[enemyIndex].DirectionChanged = true;
      vars.InGame.Enemies[enemyIndex].StartOffset = 0;
    }
  },
  collect: function(player, collectable) {
    //this.coinSound.play();
    collectable.destroy();
    vars.InGame.PlayerCoins++;
  },
  reachedChest: function(player, collectable) {
    // PAUSE
    game.paused = true;

    var bar = game.add.graphics();
    bar.beginFill(0x000000, 0.2);
    bar.drawRect(0, 110, 800, 130);
    bar.fixedToCamera = true;

    // check if player finished game
    if(vars.InGame.Level == vars.InGame.MaxLevels) {
      var style = { font: "bold 32px 'Comic Sans MS'", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
      text = game.add.text(0, 0, "Congratulations!", style);
      text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
      text.setTextBounds(0, 90, 800, 100);
      text.fixedToCamera = true;
      style = { font: "bold 16px 'Comic Sans MS'", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
      var text = game.add.text(0, 0, "You completed your journey and gathered " + vars.InGame.PlayerCoins * 10 + " Points!", style);
      text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
      text.setTextBounds(0, 120, 800, 100);
      text.fixedToCamera = true;
      var text = game.add.text(0, 0, "Press [Enter] to continue", style);
      text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
      text.setTextBounds(0, 150, 800, 100);
      text.fixedToCamera = true;

      // Enter returns to main menu
      this.game.input.keyboard.onDownCallback = function (e) {
        if (e.keyCode == 13) {
          game.paused = false;
          this.game.state.start('MainMenu');
        }
      }
    }
    else {
      console.log("player finished level!");
      var style = { font: "bold 32px 'Comic Sans MS'", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
      text = game.add.text(0, 0, "Level Completed!", style);
      text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
      text.setTextBounds(0, 90, 800, 100);
      text.fixedToCamera = true;
      style = { font: "bold 16px 'Comic Sans MS'", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
      text = game.add.text(0, 0, "Press [Enter] to continue", style);
      text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
      text.setTextBounds(0, 120, 800, 100);
      text.fixedToCamera = true;
      // Enter returns to main menu
      this.game.input.keyboard.onDownCallback = function (e) {
        if (e.keyCode == 13) {
          game.paused = false;
          vars.InGame.FinishedLevel = true;
          vars.InGame.Level++;
          this.game.state.start('Game', true, false, 'level' + vars.InGame.Level);
        }
      }
    }
    // PAUSE
    game.paused = true;
  },
  hitEnemy: function(player, enemy) {
    vars.InGame.GameOver = true;
    vars.InGame.Level = 1;
    console.log("player hit enemy!");
    var bar = game.add.graphics();
    bar.beginFill(0x000000, 0.2);
    bar.drawRect(0, 110, 800, 100);
    bar.fixedToCamera = true;
    var style = { font: "bold 32px 'Comic Sans MS'", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
    text = game.add.text(0, 0, "GAME OVER", style);
    text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    text.setTextBounds(0, 90, 800, 100);
    text.fixedToCamera = true;
    style = { font: "bold 16px 'Comic Sans MS'", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
    text = game.add.text(0, 0, "Press [Enter] to return to Main Menu", style);
    text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    text.setTextBounds(0, 120, 800, 100);
    text.fixedToCamera = true;
    // Enter returns to main menu
    this.game.input.keyboard.onDownCallback = function (e) {
      if (e.keyCode == 13) {
        game.paused = false;
        this.game.state.start('MainMenu');
      }
    }
    // PAUSE
    game.paused = true;
  }
};
