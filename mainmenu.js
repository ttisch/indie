gameStates.MainMenu = {
  preload: function () {

  },
  create: function () {
    game.add.tileSprite(0, 0, 800, 320, 'background');

    var bar = game.add.graphics();
    bar.beginFill(0x000000, 0.2);
    bar.drawRect(0, 115, 800, 100);
    bar.fixedToCamera = true;
    var style = { font: "bold 32px 'Comic Sans MS'", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
    text = game.add.text(0, 0, "Indie!", style);
    text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    text.setTextBounds(0, 90, 800, 100);
    style = { font: "bold 16px 'Comic Sans MS'", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
    text = game.add.text(0, 0, "- A simple and fun 2D Platformer Game -", style);
    text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    text.setTextBounds(0, 120, 800, 100);
    style = { font: "bold 16px 'Comic Sans MS'", fill: "#D49449", boundsAlignH: "center", boundsAlignV: "middle" };
    text = game.add.text(0, 0, "Press [Enter] to start", style);
    text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    text.setTextBounds(0, 150, 800, 100);

    // reset properties
    vars.InGame.Ground = undefined;
    vars.InGame.CoinLayer = undefined;
    vars.InGame.Player = undefined;
    vars.InGame.Enemies = [];
    vars.InGame.JumpTimer = 0;
    vars.InGame.PlayerCoins = 0;
    vars.InGame.ScoreText = undefined;
    vars.InGame.GameOver = false;
    vars.InGame.Level = 1;

    // Enter starts game
    this.game.input.keyboard.onDownCallback = function (e) {
      if (e.keyCode == 13) {
        game.paused = false;
        this.game.state.start('Game', true, false, 'level1');
      }
    }
  },
  update: function () {

  }
};
