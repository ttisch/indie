gameStates.Boot = {
  preload: function () {
    this.game.load.spritesheet('player', 'assets/indie_sprite.png', 32, 48);
    this.game.load.spritesheet('mummy', 'assets/mummy.png', 37, 45, 18);
    this.game.load.tilemap('level1', 'assets/level1.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('level2', 'assets/level2.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('level3', 'assets/level3.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('tiles', 'assets/platformer_tilesx2.png');
    this.game.load.image('blocks1', 'assets/blocks1.png');
    this.game.load.image('background', 'assets/bg2.png');
    this.game.load.image('coin', 'assets/coin.png');
    this.game.load.image('chest', 'assets/chest.png');
  },
  create: function () {
    var bar = game.add.graphics();
    bar.beginFill(0x000000, 0.2);
    bar.drawRect(0, 110, 800, 100);
    bar.fixedToCamera = true;
    var style = { font: "bold 20px 'Comic Sans MS'", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
    text = game.add.text(0, 0, "Loading Game ...", style);
    text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    text.setTextBounds(0, 160, 800, 100);

    text = game.add.text(game.world.centerX, game.world.centerY, "Indie!");

    //  Centers the text
    text.anchor.set(0.5);
    text.align = 'center';

    //  Our font + size
    text.font = 'Arial';
    text.fontWeight = 'bold';
    text.fontSize = 70;
    text.fill = '#ffffff';

    //  Here we create our fake reflection :)
    //  It's just another Text object, with an alpha gradient and flipped vertically
    textReflect = game.add.text(game.world.centerX, game.world.centerY + 50, "Indie!");

    //  Centers the text
    textReflect.anchor.set(0.5);
    textReflect.align = 'center';
    textReflect.scale.y = -1;

    //  Our font + size
    textReflect.font = 'Arial';
    textReflect.fontWeight = 'bold';
    textReflect.fontSize = 70;

    //  Here we create a linear gradient on the Text context.
    //  This uses the exact same method of creating a gradient as you do on a normal Canvas context.
    var grd = textReflect.context.createLinearGradient(0, 0, 0, text.canvas.height);

    //  Add in 2 color stops
    grd.addColorStop(0, 'rgba(255,255,255,0)');
    grd.addColorStop(1, 'rgba(255,255,255,0.08)');

    //  And apply to the Text
    textReflect.fill = grd;

    setTimeout("game.state.start('MainMenu', true, false, 'level1');", 2000);
  },
  update: function () {
  }
};
