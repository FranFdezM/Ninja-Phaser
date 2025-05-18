import { createAnimations } from "./animations.js"
import { initImages } from "./images.js"
import { initAudio } from "./audio.js"
import { playAudio } from "./audio.js"
import { stopAudio } from "./audio.js"
import { initSpritesheets } from "./spritesheets.js"
import { generateFactory } from "./factory.js"
import { setNewMap } from "./factory.js"

// ------- Global game variables
var gameStart
var gameMain
var difficulty
var ground
var newMap = true

// Timer
var startTime
var elapsedTime
var pausedTime
var minutes
var seconds

// Debug
var debugMode

// Menu
const clickSound = document.getElementById("click-sound")

document.querySelectorAll(".option").forEach(el => {
  el.addEventListener("click", () => {
    clickSound.play()
  })
})

window.setDifficulty = function(selection) {
    config.difficulty = selection
    document.getElementById('startGame').classList.add(selection)
    document.getElementById('startGame').classList.remove('hidden')
    document.getElementById('return').classList.add(selection)
    document.getElementById('return').classList.remove('hidden')
    document.getElementById('selectedDifficulty').classList.add(selection)
    document.getElementById('selectedDifficulty').innerHTML = selection.toUpperCase()
    document.getElementById('difficultyInfo').classList.add(selection)
    document.getElementById('difficultyInfo').innerHTML = selection.toUpperCase()
    document.getElementById('restart').classList.add(selection)
    document.getElementById('retry').classList.add(selection)
    document.getElementById('regenerateMap').classList.add(selection)
    document.getElementById('difficultySelector').classList.add('hidden')
}

// Game config
export const config = {
    type: Phaser.AUTO,
    width: 512,
    height: 488,
    backgroundColor: '#049ada',
    parent: 'game',
    difficulty: difficulty,
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

window.startGame = () => {
    gameStart = new Phaser.Game(config)
    document.getElementById('difficultyInfo').classList.remove('hidden')
    document.getElementById('startGame').classList.add('hidden')
    document.getElementById('return').classList.add('hidden')
    document.getElementById('regenerateMap').classList.remove('hidden')
    document.getElementById('restart').classList.remove('hidden')
}

window.regenerateMap = () => {
    stopAudio('backgroundMusic', game)
    restartGame()
}

window.restartGame = function() {
    gameStart.destroy(true)
    let gameContainer = document.getElementById('game')
    gameContainer.innerHTML = ''
    newMap = true
    setNewMap(newMap)
    gameStart = new Phaser.Game(config)
    document.getElementById('gameOver').classList.add('hidden')
    document.getElementById('game').classList.remove('hidden')
    document.getElementById('difficultyInfo').classList.remove('hidden')
    document.getElementById('regenerateMap').classList.remove('hidden')
    pausedTime = true
}

function preload() {
    gameMain = this
    //console.clear()
    //console.log("Difficulty: " + config.difficulty)
    debugMode = false
    //console.log("Debug mode: " + debugMode)
    //console.log("Collisions mode: " + config.physics.arcade.debug)
    ground = this.physics.world.bounds.height - 74
    elapsedTime = 0
    pausedTime = false
    initImages(this)
    initAudio(this)
    initSpritesheets(this)
}

function create() {
    let bounds = 0
    let floorbrickQuantity = 0
    let platformHeightStart = Phaser.Math.Between(ground,ground-90)
    let platformHeightLimit = 0
    let spikesQuantity = 0
    let enemiesQuantity = 0
    let enemies2Quantity = 0
    let fireballsQuantity = 0
    switch (config.difficulty) {
        case 'easy':
            bounds = Phaser.Math.Between(6000,7000)
            floorbrickQuantity = Phaser.Math.Between(15,20)
            platformHeightLimit = ground-100
            spikesQuantity = Phaser.Math.Between(20,30)
            enemiesQuantity = Phaser.Math.Between(6,12)
            enemies2Quantity = Phaser.Math.Between(3,5)
            fireballsQuantity = 0
            break
        case 'normal':
            bounds = Phaser.Math.Between(10000,11000)
            floorbrickQuantity = Phaser.Math.Between(10,15)
            platformHeightLimit = ground-200
            spikesQuantity = Phaser.Math.Between(30,50)
            enemiesQuantity = Phaser.Math.Between(5,10)
            enemies2Quantity = Phaser.Math.Between(5,8)
            fireballsQuantity = Phaser.Math.Between(0,1)
            break
        case 'hard':
            bounds = Phaser.Math.Between(15000,16000)
            floorbrickQuantity = Phaser.Math.Between(5,10)
            platformHeightLimit = ground-280
            spikesQuantity = Phaser.Math.Between(50,80)
            enemiesQuantity = Phaser.Math.Between(3,8)
            enemies2Quantity = Phaser.Math.Between(8,10)
            fireballsQuantity = Phaser.Math.Between(1,2)
            break
    }
    this.physics.world.setBounds(0,0,bounds,config.height)
    generateFactory('clouds',this,30,100,50,200)
    generateFactory('goal',this,1,bounds - 100,ground)
    generateFactory('floorbricks',this,floorbrickQuantity,0,config.height)
    generateFactory('platforms',this,0,150,platformHeightStart,platformHeightLimit)
    generateFactory('spikes',this,spikesQuantity)

    this.player = this.physics.add.sprite(0, 200, 'player')
        .setScale(2)
        .setOrigin(0, 0)
        .setCollideWorldBounds(true)
    this.player.body.setSize(12, 16, true)
    this.player.body.setOffset(this.player.body.offset.x, 32)
    this.player.isJumping = false

    this.cameras.main.setBounds(0, 0, bounds, config.height)

    // Debug Mode
    if (debugMode) {
        this.cameraControl = this.add.rectangle(100, 100, 10, 10, 0x000000, 0)
        this.cameras.main.startFollow(this.cameraControl)
    }
    else {
        this.cameras.main.startFollow(this.player)
    }

    createAnimations(this)

    generateFactory('enemies',this,enemiesQuantity)
    generateFactory('enemies2',this,enemies2Quantity)
    generateFactory('fireballs',this,(debugMode ? 0:fireballsQuantity))

    // Collisions
    this.physics.add.collider(this.player, this.floorbricks)
    this.physics.add.collider(this.player, this.platforms)
    this.physics.add.collider(this.player, this.spikes, onHitSpike, null, this)
    this.physics.add.collider(this.player, this.fireballs, onHitFireball, null, this)
    this.physics.add.collider(this.player, this.goal, onFinishGame, null, this)
    this.physics.add.collider(this.player, this.enemies, onHitEnemy, null, this)
    this.physics.add.collider(this.player, this.enemies2, onHitEnemy, null, this)
    this.physics.add.collider(this.enemies, this.floorbricks)
    this.physics.add.collider(this.enemies, this.platforms)
    this.physics.add.collider(this.enemies, this.spikes)
    this.physics.add.collider(this.enemies, this.fireballs)
    this.physics.add.collider(this.enemies2, this.floorbricks)
    this.physics.add.collider(this.enemies2, this.platforms)
    this.physics.add.collider(this.enemies2, this.spikes)
    this.physics.add.collider(this.enemies2, this.fireballs)
    this.physics.add.collider(this.floorbricks, this.fireballs)
    this.physics.add.collider(this.platforms, this.fireballs)

    // Inputs
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
    this.timerText = this.add.text(12, 27, "00:00", {
        font: "15px pixel",
        fill: "#ffffff"
    })
    this.timerText.setScrollFactor(0)

    //Life creation
    if (newMap) {
        this.lives = 3
        newMap = false
    }
    for (let i = 0; i < this.lives; i++) {
        const x = 20 + i * 20
        this.add.image(x, 15, 'heart').setScale(1.2).setScrollFactor(0)
    }

    setNewMap(newMap)

    // Debug finish input
    // this.input.keyboard.on("keydown-P", () => {
    //     finishGame(this)
    // })
}

function update(time) {

    // Variables
    const { keys, player, enemies, enemies2, fireballs } = this
    const isPlayerTouchingFloor = player.body.touching.down
    const speed = isPlayerTouchingFloor ? 200 : 150
    const cameraView = this.cameras.main.worldView
    var explodeFireball = false

    // Timer update
    if (pausedTime) {
        startTime = this.time.now
        pausedTime = false
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
    if (enemies.getChildren().length > 0) {
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
    }
    
    if (enemies2.getChildren().length > 0) {
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
    }
    
    // --- Fireballs ---
    fireballs.getChildren().forEach((fireball) => {
        if (fireball.active) {
            if (fireball.body.blocked.down && !explodeFireball) {
                explodeFireball = true
                destroyFireball(fireball)
                explodeFireball = false
            }
            if (fireball.body.touching.down && !explodeFireball) {
                explodeFireball = true
                destroyFireball(fireball)
                explodeFireball = false
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

function onHitFireball(player,fireball) {
    if (fireball.body.touching) {
        killPlayer(this)
    }
}

function onHitSpike(player,spike) {
    if (spike.body.touching.up) {
        killPlayer(this)
    }
}

function killPlayer(game) {
    const {scene} = game
    playAudio('deathSound', game)
    scene.restart()
    game.lives -= 1
    if (game.lives == 0) {
        showGameOver(game)
    }
}

function showGameOver(game) {
    document.getElementById('regenerateMap').classList.add('hidden')
    document.getElementById('difficultyInfo').classList.add('hidden')
    document.getElementById('game').classList.add('hidden')
    game.scene.pause()
    stopAudio('backgroundMusic', game)
    document.getElementById('gameOver').classList.remove('hidden')
} 

function onFinishGame() {
    stopAudio('backgroundMusic', this)
    playAudio('winMusic', this, {loop: true, volume: 0.5})
    document.getElementById('regenerateMap').classList.add('hidden')
    finishGame(this)
}

function destroyFireball(fireball) {
    fireball.anims.play('fireball-explosion', false)
    fireball.on('animationcomplete', () => {
        fireball.destroy()
    })
}

function finishGame(game) {
    game.scene.pause()
    document.getElementsByClassName('finalTime')[0].innerHTML = 'Time: ' + `${pad(minutes)}:${pad(seconds)}`
    document.getElementById('gameWin').classList.remove('hidden')
}