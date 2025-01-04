import { createAnimations } from "./animations.js"
import { initImages } from "./images.js"
import { initAudio } from "./audio.js"
import { playAudio } from "./audio.js"
import { stopAudio } from "./audio.js"
import { initSpritesheets } from "./spritesheets.js"
import { generateFactory } from "./factory.js"

// ------- Global
var globalGame

// Timer
var startTime
var elapsedTime
var pausedGame
var minutes
var seconds

// Debug
var debugMode

// Game
window.startGame = () => new Phaser.Game(config)
var groundY
const config = {
    type: Phaser.AUTO,
    width: 512,
    height: 488,
    backgroundColor: '#049ada',
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 300 }
        }
    },
    scene: {
        preload,
        create,
        update
    }
}

window.restartGame = function() {
    globalGame.scene.restart()
    pausedGame = true
}

function preload() {
    debugMode = false
    globalGame = this
    groundY = 315
    elapsedTime = 0
    pausedGame = false
    initImages(this)
    initAudio(this)
    initSpritesheets(this)
}

function create() {
    this.physics.world.setBounds(0,0,5000,config.height)
    generateFactory('clouds',this,15,100,50,200)
    generateFactory('goal',this,1,4900,groundY-20)
    generateFactory('floorbricks',this,0,0,config.height)
    generateFactory('platform',this,0,0,config.height)
    generateFactory('spikes',this,0,0,config.height)

    this.player = this.physics.add.sprite(0, 200, 'player')
        .setScale(2)
        .setOrigin(0, 0)
        .setCollideWorldBounds(true)
    this.player.body.setSize(12, 16, true)
    this.player.body.setOffset(this.player.body.offset.x, 32)
    this.player.isJumping = false

    this.cameras.main.setBounds(0, 0, 5000, config.height)
    if (debugMode) {
        this.cameraControl = this.add.rectangle(100, 100, 10, 10, 0x000000, 0)
        this.cameras.main.startFollow(this.cameraControl)
    }
    else {
        this.cameras.main.startFollow(this.player)
    }

    createAnimations(this)

    generateFactory('enemies',this,0,0,groundY)
    generateFactory('enemies2',this,0,0,groundY)
    generateFactory('fireballs',this,(debugMode ? 0:2))

    // Collisions
    this.physics.add.collider(this.player, this.floorbricks)
    this.physics.add.collider(this.player, this.platform)
    this.physics.add.collider(this.player, this.spikes, onHitSpike, null, this)
    this.physics.add.collider(this.player, this.fireballs, onHitFireball, null, this)
    this.physics.add.collider(this.player, this.goal, onFinishGame, null, this)
    this.physics.add.collider(this.player, this.enemies, onHitEnemy, null, this)
    this.physics.add.collider(this.player, this.enemies2, onHitEnemy, null, this)
    this.physics.add.collider(this.enemies, this.floorbricks)
    this.physics.add.collider(this.enemies, this.platform)
    this.physics.add.collider(this.enemies, this.spikes)
    this.physics.add.collider(this.enemies, this.fireballs)
    this.physics.add.collider(this.enemies2, this.floorbricks)
    this.physics.add.collider(this.enemies2, this.platform)
    this.physics.add.collider(this.enemies2, this.spikes)
    this.physics.add.collider(this.enemies2, this.fireballs)
    this.physics.add.collider(this.floorbricks, this.fireballs)
    this.physics.add.collider(this.platform, this.fireballs)

    // Keys
    this.keys = this.input.keyboard.createCursorKeys()
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)
    this.maxJumpDuration = 500

    // Audio
    if (!this.sound.get('backgroundMusic') || this.sound.get('winMusic')?.isPlaying) {
        if (this.sound.get('winMusic')?.isPlaying) {
            stopAudio('winMusic', this)
        }
        playAudio('backgroundMusic', this, {loop: true, volume: 0.1})
    }

    // Timer creation
    elapsedTime = 0
    startTime = this.time.now - elapsedTime
    this.timerText = this.add.text(10, 10, "00:00", {
        font: "20px pixel",
        fill: "#ffffff"
    })
    this.timerText.setScrollFactor(0)

    // Debug end
    this.input.keyboard.on("keydown-P", () => {
        finishGameDebug(this)
    })
}

function update(time) {

    // Variables
    const { keys, player, enemies, enemies2, fireballs } = this
    const isPlayerTouchingFloor = player.body.touching.down
    const speed = isPlayerTouchingFloor ? 200 : 150
    const cameraView = this.cameras.main.worldView
    var explotaFireball = false

    // Timer update
    if (pausedGame) {
        startTime = this.time.now
        pausedGame = false
    }
    elapsedTime = this.time.now - startTime
    minutes = Math.floor(elapsedTime / 60000)
    seconds = Math.floor((elapsedTime % 60000) / 1000)
    this.timerText.setText(`${pad(minutes)}:${pad(seconds)}`)

    // Inputs
    const isKeyLeftDown = keys.left.isDown
    const isKeyRightDown = keys.right.isDown

    // --- Player ---
    // Fall
    if (player.body.touching.up) {
        player.body.velocity.y = 0
        player.isJumping = false
    }
    if (player.body.velocity.y > 0) {
        if (player.anims.currentAnim?.key !== 'fall')
        player.anims.play('fall')
    }

    if (debugMode) {
        const cameraSpeed = 5
        if (keys.left.isDown) {
            this.cameraControl.x -= cameraSpeed
        }
        if (keys.right.isDown) {
            this.cameraControl.x += cameraSpeed
        }
        if (keys.up.isDown) {
            this.cameraControl.y -= cameraSpeed
        }
        if (keys.down.isDown) {
            this.cameraControl.y += cameraSpeed
        }
    }
    else {
        // Idle / Run
        if (isKeyLeftDown) {
            player.setVelocityX(-speed)
            player.flipX = true
            if (isPlayerTouchingFloor && player.body.velocity.y <= 0) {
                player.anims.play('run', true)   
            }
        } else if (isKeyRightDown) {
            player.setVelocityX(speed)
            player.flipX = false
            if (isPlayerTouchingFloor && player.body.velocity.y <= 0) {
                player.anims.play('run', true)
            }
        } else {
            player.setVelocityX(0)
            if (isPlayerTouchingFloor && player.body.velocity.y <= 0) {
                player.anims.play('idle', true)
            }
        }
    }
    
    // Jump
    if ((this.spaceKey.isDown || this.upKey.isDown) && isPlayerTouchingFloor) {
        playAudio('jumpSound', this, {volume: 0.1})
        player.isJumping = true
        this.jumpStartTime = time
        player.setVelocityY(-300)
        player.anims.play('jump', false)
    }
    if (player.isJumping && (this.spaceKey.isDown || this.upKey.isDown)) {
        const jumpDuration = time - this.jumpStartTime
        if (jumpDuration < this.maxJumpDuration) {
            player.setVelocityY(-180)
        }
    }
    if (Phaser.Input.Keyboard.JustUp(this.spaceKey || this.upKey) || (time - this.jumpStartTime >= this.maxJumpDuration)) {
        player.isJumping = false
    }
    // Death
    if (player.y >= 380 ) {
        killPlayer(this)
    }

    // --- Enemies ---
    enemies.getChildren().forEach((enemy) => {
        if (enemy.active) {
            if (enemy.x > cameraView.x && enemy.x < cameraView.x + cameraView.width &&
                enemy.y > cameraView.y && enemy.y < cameraView.y + cameraView.height && !debugMode && enemy.body.velocity.x == 0) {
                enemy.setVelocityX(-100)
            }
            if (enemy.body.blocked.left || enemy.body.blocked.right) {
                enemy.flipX = !enemy.flipX
                enemy.setVelocityX(enemy.flipX ? -100 : 100)
            }
            if (enemy.y == 392) {
                enemy.setVelocityY(200)
                enemy.isFalling = true
                enemy.setCollideWorldBounds(false)
            }
            if (enemy.isFalling) {
                enemy.isFalling = false
            }
            if (enemy.y > this.game.config.height) {
                enemy.destroy()
            }
        }
    })

    enemies2.getChildren().forEach((enemy) => {
        if (enemy.active) {
            if (enemy.x > cameraView.x && enemy.x < cameraView.x + cameraView.width &&
                enemy.y > cameraView.y && enemy.y < cameraView.y + cameraView.height && 
                Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y) < 230) {
                    if (this.player.x < enemy.x) {
                        enemy.setVelocityX(-100)
                        enemy.flipX = true
                    } else if (this.player.x > enemy.x) {
                        enemy.setVelocityX(100)
                        enemy.flipX = false
                    }
                    else if (this.player.x == enemy.x) {
                        enemy.setVelocityX(0)
                    }
            }
            
            if (enemy.y == 392) {
                enemy.setVelocityY(200)
                enemy.isFalling = true
                enemy.setCollideWorldBounds(false)
            }

            if (enemy.isFalling) {
                enemy.isFalling = false
            }

            if (enemy.y > this.game.config.height) {
                enemy.destroy()
            }
        }
    })

    // --- Fireballs ---
    fireballs.getChildren().forEach((fireball) => {
        if (fireball.active) {
            if (fireball.body.blocked.down && !explotaFireball) {
                explotaFireball = true
                destroyFireball(fireball)
                explotaFireball = false
            }
            if (fireball.body.touching.down && !explotaFireball) {
                explotaFireball = true
                destroyFireball(fireball)
                explotaFireball = false
            }
        }
    })
}

function pad(num) {
    return num < 10 ? "0" + num : num
}

function onHitEnemy() {
    killPlayer(this)
}

function onHitFireball(fireball) {
    if (fireball.body.touching) {
        killPlayer(this)
    }
}

function onHitSpike(spike) {
    if (spike.body.touching.up) {
        killPlayer(this)
    }
}

function killPlayer(game) {
    const {scene} = game
    playAudio('deathSound', game)
    scene.restart()
}

function onFinishGame() {
    stopAudio('backgroundMusic', this)
    playAudio('winMusic', this, {loop: true, volume: 0.5})
    finishGameDebug(this)
}

function destroyFireball(fireball) {
    fireball.anims.play('fireball-explosion', false)
    fireball.on('animationcomplete', () => {
        fireball.destroy()
    })
}

// Debug end
function finishGameDebug(game) {
    game.scene.pause()
    document.getElementsByClassName('finalTime')[0].innerHTML = 'Time: ' + `${pad(minutes)}:${pad(seconds)}`
    document.getElementById('endGame').classList.remove('hidden')
}

/// ---- TO DO:
/// Next: Random generation - 3 difficulty lvls
/// LoadScreen - Menu - Credits - Controls