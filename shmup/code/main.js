var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });


var map;
var tileset;
var layer;
var player;
var cursors;
var bg;
var fireButton;

//groups
var playerBullets;
var enemyBullets;
var explosions;


var normalBulletVelocity = 1000;
var fireRate = 200;
var playerSpeed;
var nextFire = 0;
var lives;
var stateText;

var enemyFrogs;
var frogSpawnRate = 2000;
var nextFrogBatch = 0;
var enemyFireRate = 2000;
var enemyFiringTimer = 0;
var enemyFrogSpeed = -100;
var livingEnemies = [];
var stateOfTheGame;

var normalSpeed = 10;

var killCount = 0;


function preload() {

    game.load.spritesheet('ship', 'assets/mainShip.png', 180, 120);
    game.load.spritesheet('enemy_frog_ship', 'assets/enemyFrogShip.png', 157, 84);
    game.load.image('background', 'assets/background2.png');
    game.load.spritesheet('blueBullet', 'assets/blueBullet.png', 20, 9);
    game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
    game.load.spritesheet('enemyBullet', 'assets/enemyBullet.png', 18, 18);

}

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#000000';

    bg = game.add.tileSprite(0, 0, 800, 600, 'background');

    player = game.add.sprite(180, 120, 'ship');
    player.scale.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.collideWorldBounds = true;
    player.body.setSize(150, 60, 5, 15);
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    playerBullets = game.add.group();
    playerBullets.enableBody = true;
    playerBullets.physicsBodyType = Phaser.Physics.ARCADE;
    playerBullets.createMultiple(10, 'blueBullet');
    playerBullets.setAll('anchor.x', 1);
    playerBullets.setAll('anchor.y', 1);
    playerBullets.setAll('checkWorldBounds', true);
    playerBullets.setAll('outOfBoundsKill', true);


    // The enemy's bullets
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(30, 'enemyBullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
    enemyBullets.setAll('checkWorldBounds', true);
    enemyBullets.setAll('outOfBoundsKill', true);

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupInvader, this);


    enemyFrogs = game.add.group();
    enemyFrogs.enableBody = true;
    enemyFrogs.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.setAll('checkWorldBounds', true);
    enemyBullets.setAll('outOfBoundsKill', true);

    //  Lives
    lives = 1;
    stateOfTheGame = "running";

    //  Text
    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    game.camera.follow(player);

    cursors = game.input.keyboard.createCursorKeys();

//    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.SPACEBAR ]);
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


}

function update() {
    playerSpeed = normalSpeed;

    checkStateOfTheGame();
    if (stateOfTheGame != "won" && stateOfTheGame != "lost") {
        checkControl();

        // infinite background !
        bg.tilePosition.x -= playerSpeed;

        // création des ennemies
        if ( getRandomInt(0,100) > 99 && game.time.now > nextFrogBatch) {

            nextFrogBatch = game.time.now + frogSpawnRate;
            var enemyFrogPosX = getRandomInt(800, 900);
            var enemyFrogPosY = getRandomInt(200, 400);

                for (var i = 0 ; i < 3 ; i++) {
                    if (enemyFrogs.length < 9) {
                        var enemyFrog = enemyFrogs.create(enemyFrogPosX, enemyFrogPosY + 50*i , 'enemy_frog_ship');
                        enemyFrog.scale.setTo(0.4, 0.4);
                        enemyFrog.body.velocity.x = enemyFrogSpeed;
                        enemyFrog.firingTimer = 0;
                    }
                    else {
                        enemyFrog = enemyFrogs.getFirstDead();
                        if (enemyFrog)
                        {
                            enemyFrog.revive();
                            enemyFrog.reset(enemyFrogPosX,enemyFrogPosY + 50*i );
                            enemyFrog.body.velocity.x = enemyFrogSpeed;
                        }
                    }
                }
        }
        //  Run collision
        game.physics.arcade.overlap(playerBullets, enemyFrogs, collisionEnemyWithPlayerBulletHandler, null, this);
        game.physics.arcade.overlap(player, enemyFrogs, collisionPlayerWithEnemyHandler, null, this);
		game.physics.arcade.overlap(player, enemyBullets, collisionPlayerWithEnemyBulletHandler, null, this);

        updateEnemies();
    }
}

function render () {

//     game.debug.body(player);
    // game.debug.bodyInfo(player, 16, 24);

}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



function updateEnemies() {
    //enemyFrogs.forEachAlive(function(frog){
    for (var i = 0; i < enemyFrogs.length ; i++) {
        var frog = enemyFrogs.getAt(i);
        if (frog.alive == true) {
            if (frog.body.x > game.stage.width || frog.body.x < -100) {
                frog.kill();
            } else {
                //  Grab the first bullet we can from the pool
                var enemyBullet = enemyBullets.getFirstExists(false);

                if (enemyBullet && game.time.now > frog.firingTimer && getRandomInt(1, 50) == 1)
                {
                    enemyBullet.reset(frog.body.x, frog.body.y);
                    enemyBullet.scale.setTo(0.75, 0.75);
                    game.physics.arcade.moveToObject(enemyBullet,player,700);
                    enemyBullet.body.velocity.x -= playerSpeed;
                    //game.physics.arcade.accelerateToObject(enemyBullet,player,120);
                    frog.firingTimer = game.time.now + enemyFireRate;
                }
            }
        }
    }
}


function setupInvader (invader) {
    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');
}

function fire () {

    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > nextFire)
    {
        //  Grab the first bullet we can from the pool
        var bullet = playerBullets.getFirstExists(false);
        if (bullet)
        {
            //  And fire it
            bullet.reset(player.x + player.width - 2, player.y + 32);
            bullet.body.velocity.x = normalBulletVelocity;
            nextFire = game.time.now + fireRate;
        }
    }
}

function resetBullet (bullet) {
    //  Called if the bullet goes out of the screen
    bullet.kill();
}

function collisionEnemyWithPlayerBulletHandler (bullet, enemy) {

    bullet.kill();
    enemy.kill();
    killCount += 1;

    var explosion = explosions.getFirstExists(false);
    explosion.reset(enemy.body.x, enemy.body.y);
    explosion.play('kaboom', 30, false, true);
}

function collisionPlayerWithEnemyHandler (player, enemy) {

    lives = 0;
    player.kill();
    enemy.kill();

    var explosionEnemy = explosions.getFirstExists(false);
    explosionEnemy.reset(enemy.body.x, enemy.body.y);
    explosionEnemy.play('kaboom', 30, false, true);
    var explosionPlayer = explosions.getFirstExists(false);
    explosionPlayer.reset(player.body.x, player.body.y);
    explosionPlayer.play('kaboom', 30, false, true);
}

function collisionPlayerWithEnemyBulletHandler (player, bullet) {

    lives = 0;
    player.kill();
	bullet.kill();

    var explosionPlayer = explosions.getFirstExists(false);
    explosionPlayer.reset(player.body.x, player.body.y);
    explosionPlayer.play('kaboom', 30, false, true);
}

function restart () {

    //  A new level starts
    stateText.visible = false;
    //resets the life count
    lives = 1;
    //enemyFrogs.callAll("kill", this);
	for (var i = 0; i < enemyFrogs.length ; i++) {
        enemyFrogs.getAt(i).kill();
	}
	
    //revives the player
    player.revive();
    player.reset(128, 120);
    stateOfTheGame = "running";

}

function checkStateOfTheGame() {
    if (killCount >= 100)
    {
        stateOfTheGame = "won";

        enemyBullets.callAll('kill',this);
        stateText.text = " You Won, \n Click to restart";
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);
    }
    if (lives < 1) {
        stateOfTheGame = "lost";
        player.kill();
        enemyBullets.callAll('kill');

        stateText.text=" GAME OVER \n Click to restart";
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);
    }
}