function checkControl() {
	if (fireButton.isDown)
    {
        fire();
    }
    if (cursors.right.isDown)
    {
        player.x += 7;
    }
    else if (cursors.left.isDown)
    {
        playerSpeed = Math.floor(normalSpeed/2);
        player.x -= 7;
    }
    
    if (cursors.up.isDown)
    {
        player.y -= 7;
    }
    else if (cursors.down.isDown)
    {
        player.y += 7;
    }
    
    if (game.input.activePointer.isDown)
    {
        fire();
    }

}