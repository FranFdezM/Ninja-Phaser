import { createAnimations } from "./animations.js"
import { initImages } from "./images.js"
import { initAudio } from "./audio.js"
import { playAudio } from "./audio.js"
import { stopAudio } from "./audio.js"
import { initSpritesheets } from "./spritesheets.js"
import { generateFactory } from "./factory.js"
import { setNewMap } from "./factory.js"

(function() {
  const originalLog = console.log
  let phaserLogged = false
  console.log = function(...args) {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Phaser')) {
      if (phaserLogged) return
      phaserLogged = true
    }
    originalLog.apply(console, args)
  }
})()

// Online
connectWithSupabase('validate_origin', {firstConnection: true})

// ------- Global game variables
var gameStart
var difficulty
var ground
var bounds
var regenOportunity = 0
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
    if (el.classList.contains('slashed')) return
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
    document.getElementById('nextMap').classList.add(selection)
    if (!playingOnline) {
        document.querySelectorAll('.saveAndRestart').forEach(el => el.classList.add('hidden'))
    }
    document.querySelectorAll('.saveAndRestart').forEach(el => el.classList.add(selection))
    document.getElementById('returnToStart').classList.add(selection)
    document.querySelector('.close-btn').classList.add(selection)
    document.querySelector('.save-btn').classList.add(selection)
}

window.returnToDifficultySelection = () => {
    let difficulty = document.getElementById('selectedDifficulty').innerHTML.toLowerCase()
    document.getElementById('startGame').classList.add('hidden')
    document.getElementById('startGame').classList.remove(difficulty)
    document.getElementById('return').classList.remove(difficulty)
    document.getElementById('selectedDifficulty').classList.remove(difficulty)
    document.getElementById('difficultySelector').classList.remove('hidden')
    document.getElementById('restart').classList.remove(difficulty)
    document.getElementById('retry').classList.remove(difficulty)
    document.getElementById('regenerateMap').classList.remove(difficulty)
    document.getElementById('nextMap').classList.remove(difficulty)
    document.querySelectorAll('.saveAndRestart').forEach(el => el.classList.remove(difficulty))
    document.getElementById('returnToStart').classList.remove(difficulty)
    document.getElementById('difficultyInfo').classList.remove(difficulty)
    document.querySelector('.close-btn').classList.remove(difficulty)
    document.querySelector('.save-btn').classList.remove(difficulty)
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
    if (playingOnline) {
        connectWithSupabase('validate_origin', {startGame: document.getElementById('difficultyInfo').innerHTML.toLowerCase()})
    }
}

window.nextGame = function(state) {
    if (playingOnline) {
        if (state == 'retry') {
            completedMaps = 0
            connectWithSupabase('validate_origin', {restartSession: id})
        }
        else {
            connectWithSupabase('validate_origin', {updateSession: id})
        }
    }
    if (state == 'regenerate') {
        regenOportunity += 1
        if (regenOportunity == 2) {
            clickSound.play()
            document.getElementById('regenerateMap').classList.add('slashed')
            document.getElementById('regenerateMap').classList.remove('option')
        }
    }
    else {
        regenOportunity = 0
        document.getElementById('regenerateMap').classList.remove('slashed')
        document.getElementById('regenerateMap').classList.add('option')
    }
    if (regenOportunity < 3) {
        gameStart.destroy(true)
        let gameContainer = document.getElementById('game')
        gameContainer.innerHTML = ''
        newMap = true
        setNewMap(newMap)
        gameStart = new Phaser.Game(config)
        document.getElementById('gameWin').classList.add('hidden')
        document.getElementById('gameOver').classList.add('hidden')
        document.getElementById('game').classList.remove('hidden')
        document.getElementById('difficultyInfo').classList.remove('hidden')
        document.getElementById('regenerateMap').classList.remove('hidden')
        pausedTime = true
    }
}

function preload() {
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
    let floorbrickQuantity = 0
    let platformHeightStart = Phaser.Math.Between(ground,ground-90)
    let platformHeightLimit = 0
    let spikesQuantity = 0
    let enemiesQuantity = 0
    let enemies2Quantity = 0
    let fireballsQuantity = 0
    switch (config.difficulty) {
        case 'easy':
            if (newMap) bounds = Phaser.Math.Between(6000,7000)
            floorbrickQuantity = Phaser.Math.Between(15,20)
            platformHeightLimit = ground-100
            spikesQuantity = Phaser.Math.Between(20,30)
            enemiesQuantity = Phaser.Math.Between(6,12)
            enemies2Quantity = 1
            fireballsQuantity = 0
            break
        case 'normal':
            if (newMap) bounds = Phaser.Math.Between(10000,11000)
            floorbrickQuantity = Phaser.Math.Between(15,18)
            platformHeightLimit = ground-200
            spikesQuantity = Phaser.Math.Between(30,40)
            enemiesQuantity = Phaser.Math.Between(5,10)
            enemies2Quantity = Phaser.Math.Between(2,4)
            fireballsQuantity = Phaser.Math.Between(0,1)
            break
        case 'hard':
            if (newMap) bounds = Phaser.Math.Between(15000,16000)
            floorbrickQuantity = Phaser.Math.Between(8,12)
            platformHeightLimit = ground-260
            spikesQuantity = Phaser.Math.Between(40,70)
            enemiesQuantity = Phaser.Math.Between(7,12)
            enemies2Quantity = Phaser.Math.Between(3,6)
            fireballsQuantity = Phaser.Math.Between(0,2)
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

    // Online: Completed maps
    if (completedMaps > 0) {
        let positionX = config.width - 140
        let extraX = completedMaps.toString().length * 15
        this.add.text((positionX - extraX), 12, "Completed: " + completedMaps, {
            font: "15px pixel",
            fill: "#ffffff"
        }).setScrollFactor(0)
    }

    //Life creation
    if (newMap) {
        this.lives = 3
        this.lives -= regenOportunity
        newMap = false
    }
    for (let i = 0; i < this.lives; i++) {
        const x = 20 + i * 20
        this.add.image(x, 15, 'heart').setScale(1.2).setScrollFactor(0)
    }

    setNewMap(newMap)
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
    if (playingOnline) {
        connectWithSupabase('validate_origin', {updateSession: id})
    }
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
    if (completedMaps > 0) {
        document.querySelector('#gameOver .saveAndRestart').classList.remove('hidden')
    }
    else {
        document.querySelector('#gameOver .saveAndRestart').classList.add('hidden')
    }
} 

function onFinishGame() {
    finishGame(this)
}

function destroyFireball(fireball) {
    fireball.anims.play('fireball-explosion', false)
    fireball.on('animationcomplete', () => {
        fireball.destroy()
    })
}

function finishGame(game) {
    stopAudio('backgroundMusic', game)
    playAudio('winMusic', game, {loop: true, volume: 0.5})
    document.getElementById('regenerateMap').classList.add('hidden')
    game.scene.pause()
    document.getElementsByClassName('finalTime')[0].innerHTML = 'Time: ' + `${pad(minutes)}:${pad(seconds)}`
    document.getElementById('gameWin').classList.remove('hidden')
    if (playingOnline) {
        completedMaps++
        connectWithSupabase('validate_origin', {victory:true,id: id, time: Math.floor(elapsedTime / 1000)})
    }
}

// Online

var playingOnline = false
var id
var completedMaps = 0

function connectWithSupabase(endpoint, body = {}) {
  let bearerPublicToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvaGptZXB5ZXNnY21ncHV1amJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODk4MzgsImV4cCI6MjA2MzE2NTgzOH0.v8Y9HLywSTFRVW2hlO6JV391r4LdacWfeX9kwnORflE"
  fetch(`https://lohjmepyesgcmgpuujbd.supabase.co/functions/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerPublicToken}`
    },
    body: JSON.stringify(body)
  })
  .then(res => res.json())
  .then(data => {
    if (endpoint == 'validate_origin') {
        if (body.firstConnection == true) {
            console.log(data.message)
            playingOnline = data.valid
        }
        if (["easy","normal","hard"].includes(body.startGame)) {
            id = data.id
        }
        if (body.saveRecord != undefined) {
            if (data.success) {
                const saveSound = document.getElementById("save-sound")
                saveSound.play()
                saveSound.onended = () => {
                    connectWithSupabase('validate_origin', {finishSession: id})
                }
            }
            else {
                console.log("No se ha guardado la partida")
            }
        }
        if (body.finishSession != undefined) {
            window.location.reload()
        }
    }
    else if(endpoint == 'get_leaderboard') {
        let difficulty = document.getElementById('selectedDifficulty').innerHTML.toLowerCase()
        let leaderboardElement = document.getElementById('leaderboard')
        leaderboardElement.innerHTML = ''
        switch(difficulty) {
            case 'easy':
                leaderboardElement.innerHTML += '<h2 class="easy">Easy</h2>'
                break
            case 'normal':
                leaderboardElement.innerHTML += '<h2 class="normal">Normal</h2>'
                break
            case 'hard':
                leaderboardElement.innerHTML += '<h2 class="hard">Hard</h2>'
                break
        }
        leaderboardElement.innerHTML += `
            <table id="leaderboardTable" class="leaderboard">
                <thead>
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Completed</th>
                    <th>Time</th>
                </tr>
                </thead>
                <tbody></tbody>
            </table>
            `
        const tbody = document.querySelector("#leaderboardTable tbody")
        tbody.innerHTML = data.map((item, index) =>
        `<tr>
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.mapas_completados}</td>
            <td>${formatTime(item.total_tiempo)}</td>
        </tr>`
        ).join('')
    }
  })
  .catch(err => console.error('Error:', err))
}

window.showLeaderboard = () => {
    document.getElementById('startGame').classList.add('hidden')
    connectWithSupabase('get_leaderboard',{difficulty: document.getElementById('selectedDifficulty').innerHTML.toLowerCase()})
    document.getElementById('leaderboardContainer').classList.remove('hidden')
}

window.returnToStart = () => {
    document.getElementById('leaderboard').innerHTML = ''
    document.getElementById('leaderboardContainer').classList.add('hidden')
    document.getElementById('startGame').classList.remove('hidden')
}

window.saveAndRestartGame = () => {
    if (playingOnline) {
        document.getElementById('saveGameContainer').classList.remove('hidden')
        document.getElementById('nameInput').focus()
    }
}

window.finishAndRestartGame = () => {
    if (playingOnline) {
        connectWithSupabase('validate_origin', {finishSession: id})
    }
    else {
        window.location.reload()
    }
}

window.closeSaveGameWindow = () => {
    document.getElementById('saveGameContainer').classList.add('hidden')
    document.getElementById('nameInput').value = ''
}

window.saveRecordAndRestartGame = () => {
    if (playingOnline) {
        connectWithSupabase('validate_origin', {saveRecord: true, name: document.getElementById('nameInput').value, id: id})
    }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}