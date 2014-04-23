var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.spritesheet('droid', 'assets/droid.png', 32, 32);
    game.load.image('star', 'assets/star2.png');
    game.load.image('background', 'assets/background2.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('sawBlade', 'assets/sawBlade.png');

}

var map;
var tileset;
var layer;
var player;
var facing = 'left';
var jumpTimer = 0;
var cursors;
var jumpButton;
var bg;

var platforms;
var playerSpeed;

var normalSpeed = 10;

var yFloorPos = 64;

var grounds = [];
var sawBlades = [];
//var newGroundTocome;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#000000';

    bg = game.add.tileSprite(0, 0, 800, 600, 'background');
//    bg.fixedToCamera = true;

    platforms = game.add.group();
    platforms.enableBody = true;
    var ground = platforms.create(0, game.world.height - yFloorPos, 'ground');
    var ground2 = platforms.create(780, game.world.height - yFloorPos, 'ground');
    ground.body.immovable = true;
    ground.scale.setTo(2, 2);
    ground2.body.immovable = true;
    ground2.scale.setTo(2, 2);
    grounds = [ground, ground2];
    
//    for (var i = 0 ; i < 4 ; i++) {
//        sawBlades[i] = platforms.create(0, game.world.height - yFloorPos, 'sawBlade');
//    }
    
//    game.physics.arcade.gravity.y = 250;

    player = game.add.sprite(200, 400, 'dude');
    game.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.bounce.y = 0.05;
    player.body.collideWorldBounds = true;
    player.body.setSize(20, 32, 5, 16);
    player.body.gravity.y = 350;

    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('turn', [4], 20, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    game.camera.follow(player);

    cursors = game.input.keyboard.createCursorKeys();
    
//    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.SPACEBAR ]);
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


}

function update() {
    playerSpeed = normalSpeed;
    game.physics.arcade.collide(player, platforms);

    player.body.velocity.x = 0;
    player.animations.play('right');
    facing = 'right';

    if (cursors.left.isDown)
    {
        playerSpeed = Math.floor(normalSpeed/2);
    }
    else if (cursors.right.isDown)
    {
        playerSpeed = Math.floor(normalSpeed*2);
    }
    if (jumpButton.isDown && game.time.now > jumpTimer && player.body.y > game.world.height - yFloorPos - player.body.height)
    {
        player.body.velocity.y = -250;
        jumpTimer = game.time.now + 750;
    }
    
    bg.tilePosition.x -= playerSpeed;
    for (var i = 0; i < platforms.length ; i++) {
        platforms.getAt(i).body.x  -= Math.floor(playerSpeed/2);
    }
    
    // échange des ground 1 et 2 pour faire une chaine infinie
    if (grounds[1].x <= 0 ) {
        grounds[0].x = 790;
        var newGroundTocome = grounds[0];
        grounds.shift();
        grounds.push(newGroundTocome);
    }
    for (var i = 0; i < grounds.length ; i++) {
        grounds[i].bringToTop();
    }
    
    // création des scies circulaires
    if (sawBlades.length < 4 && getRandomInt(0,100) > 99) {
        
        var sawPosX = getRandomInt(800, 900);
        if (sawBlades.length > 0) {
            if (sawBlades[sawBlades.length - 1].x - sawPosX < 100 ) {
                sawPosX += 110;
            }
        }
        console.log("creation of saw at : " + sawPosX);
        var sawBlade = platforms.create(sawPosX, game.world.height - yFloorPos , 'sawBlade');
        sawBlade.body.immovable = true;
        sawBlade.scale.setTo(0.2, 0.2);
        sawBlade.anchor.setTo(0.5, 0.5);
        sawBlades.push(sawBlade);
    }
    
    // rotation des scies
    for (var i = 0 ; i < sawBlades.length ; i++) {
        sawBlades[i].angle -= 10;
    }
    
    // suppression des scies circulaires en sortant de l'écran
    if (sawBlades.length > 0 && sawBlades[0].body.x <= -90) {
        sawBlades[0].kill();
        sawBlades.shift();
    }
    
}

function render () {

    // game.debug.body(player);
    // game.debug.bodyInfo(player, 16, 24);

}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//function update() {
//    //console.log(player.y);
//    if(player.y > 540) {
//    squakFX1.play();
//    alert('Game Over. Final Score: ' +score);
//    location.reload();
//    } else {
//    if(pipes.length > 4) {
//        pipes.shift();
//    }
//    if(vertPipes.length > 4) {
//        vertPipes.shift();
//    }
//    console.log(pipes.length);
//    console.log(vertPipes.length);
//        for (var i=0;i<pipes.length;i++) {
//        game.physics.collide(player,pipes[i],collision,null,this);
//            pipes[i].x -= 4;
//        }
//        for (var i=0;i<vertPipes.length;i++) {
//            game.physics.collide(player,vertPipes[i],collision,null,this);
//            vertPipes[i].x -= 4;
//        }
//        bgtile.tilePosition.x -= 4;
//    //console.log(timer);
//    if(timer/1000 % 1 == 0) {
//        birdFX1.play();
//    }
//    if(timer/200 % 1 == 0 && timer != 0) {
//        console.log('adding pipe...');
//        randyX = randy(800,1200);
//        pipes[i] = game.add.sprite(randyX,randy(300,500), 'pipe1');
//        vertPipes[i] = game.add.sprite(randyX,randy(-75,0), 'vertpipe');
//    }
//        timer++;
//        if(timer/100 % 1 == 0) {
//            score += 1;
//            scoreText.content = 'score: ' + score;
//        }
//    }
//}

