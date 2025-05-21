import { config } from './game.js'

const floorbrickWidth = 228
const platformWidth = 228
const spikesWidth = 78

var goalPosition = []
var floorBrickPositionsXY = []
var platformPositionsXY = []
var spikesPositionsXY = []
var groundLocationsXY = []
var enemyPositions = []
var enemy2Positions = []

var fireballsNumber = 0

var newMap = true

export const generateFactory = (id, game, number, posX, startY, lastY) => {
    const widthOfBounds = game.physics.world.bounds.width
    const heightOfBounds = game.physics.world.bounds.height
    const platformGround = heightOfBounds - 120

    let groundSelection
    let enemyLocationX
    let enemyLocationY

    groundLocationsXY.length = 0

    switch (id) {
        case 'clouds':
            let pathX = posX
            let endX = widthOfBounds
            let calculatedX = (endX - posX) / number

            for (let i = 0; i < number; i++) {
                if (pathX > endX) {
                    break
                }
                game.add.image(pathX, Phaser.Math.Between(startY,lastY), 'cloud' + Phaser.Math.Between(1,2)) // Random clouds
                pathX += calculatedX
            }
            break
        case 'goal':
            game[id] = game.physics.add.staticGroup()
            if (newMap) {
                goalPosition.length = 0
                goalPosition.push([posX, startY])
                setProperties(game[id].create(posX, startY, id))
            }
            else {
                setProperties(game[id].create(goalPosition[0][0], goalPosition[0][1], id))
            }
            break
        case 'floorbricks':
            game[id] = game.physics.add.staticGroup()
            if (newMap) {

                floorBrickPositionsXY.length = 0

                let floorBrickX = 0

                setProperties(game[id].create(floorBrickX, startY, id)) // Start
                floorBrickPositionsXY.push([floorBrickX,startY]) // Start position

                setProperties(game[id].create(widthOfBounds - 228, startY, id)) // Goal

                for (let i = 0; i < number; i++) {
                    floorBrickX += (widthOfBounds/number + Phaser.Math.Between(-100,100))
                    if (floorBrickX > 0 && floorBrickX < (widthOfBounds - 228)) {
                        setProperties(game[id].create(floorBrickX, startY, id))
                    }
                    floorBrickPositionsXY.push([floorBrickX,startY])
                }

                floorBrickPositionsXY.push([widthOfBounds - 228,startY]) // Goal position
            }
            else {
                for (let i = 0; i < floorBrickPositionsXY.length; i++) {
                    setProperties(game[id].create(floorBrickPositionsXY[i][0], floorBrickPositionsXY[i][1], id))
                }
            }
            //console.log("Floorbricks:")
            //console.log(floorBrickPositionsXY)
            break
        case 'platforms':
            game[id] = game.physics.add.staticGroup()
            if (newMap) {

                platformPositionsXY.length = 0

                let platformPositionX = 0
                let platformPositionY = 0

                while(platformPositionX < widthOfBounds) {
                    if (platformPositionsXY.length == 0) {
                        platformPositionX = Phaser.Math.Between(posX,300)
                        platformPositionY = startY
                        setProperties(game[id].create(platformPositionX, platformPositionY, id))
                    }
                    else {
                        switch (config.difficulty) {
                            case 'easy':
                                platformPositionX += (platformWidth + Phaser.Math.Between(30,80))
                                platformPositionY = platformPositionsXY[platformPositionsXY.length - 1][1] + Phaser.Math.Between(-80,300)
                                while (platformPositionY > platformGround || platformPositionY < lastY) {
                                    platformPositionY = platformPositionsXY[platformPositionsXY.length - 1][1] + Phaser.Math.Between(-80,300)
                                }
                                break
                            case 'normal':
                                platformPositionX += (platformWidth + Phaser.Math.Between(50,100))
                                platformPositionY = platformPositionsXY[platformPositionsXY.length - 1][1] + Phaser.Math.Between(-90,300)
                                while (platformPositionY > platformGround || platformPositionY < lastY) {
                                    platformPositionY = platformPositionsXY[platformPositionsXY.length - 1][1] + Phaser.Math.Between(-90,300)
                                }
                                break
                            case 'hard':
                                platformPositionX += (platformWidth + Phaser.Math.Between(70,100))
                                platformPositionY = platformPositionsXY[platformPositionsXY.length - 1][1] + Phaser.Math.Between(-90,300)
                                while (platformPositionY > platformGround || platformPositionY < lastY) {
                                    platformPositionY = platformPositionsXY[platformPositionsXY.length - 1][1] + Phaser.Math.Between(-90,300)
                                }
                                break
                        }
                        if ((platformPositionX + platformWidth) > widthOfBounds) {
                            break
                        }
                        setProperties(game[id].create(platformPositionX, platformPositionY, id)) 
                    }
                    
                    platformPositionsXY.push([platformPositionX,platformPositionY])
                }
            }
            else {
                for (let i = 0; i < platformPositionsXY.length; i++) {
                    setProperties(game[id].create(platformPositionsXY[i][0], platformPositionsXY[i][1], id))
                }
            }
            //console.log("Platforms:")
            //console.log(platformPositionsXY)
            break
        case "spikes":
            game[id] = game.physics.add.staticGroup()
            if (newMap) {

                spikesPositionsXY.length = 0
                
                let spikeFloorHeight = 73 //Height of floor for spikes
                let spikePlatformHeight = 48 //Height of platform for spikes
                let attempts = 0
                
                for (let i = 0; i < number; i++) {
                    attempts = 0
                    switch (Phaser.Math.Between(1,3)) { // 1/3 chance of floor, 2/3 chance of platform
                        case 1:
                            let floorBrickSelectionIsNew = false
                            let floorBrickSelection
                            let floorBrickSelectionX
                            while (!floorBrickSelectionIsNew && attempts < 50) {
                                floorBrickSelection = floorBrickPositionsXY[Phaser.Math.Between(1,floorBrickPositionsXY.length - 2)]
                                floorBrickSelectionX = floorBrickSelection[0] + Phaser.Math.Between(0,floorbrickWidth - spikesWidth)
                                if (spikesPositionsXY.length == 0 || !isCoordinateInRange(spikesPositionsXY,floorBrickSelectionX,spikesWidth)) {
                                    floorBrickSelectionIsNew = true
                                }
                                attempts++
                            }
                            let floorBrickSelectionY = floorBrickSelection[1] - spikeFloorHeight
                            setProperties(game[id].create(floorBrickSelectionX,floorBrickSelectionY, id))
                            spikesPositionsXY.push([floorBrickSelectionX,floorBrickSelectionY])
                            break
                        case 2:
                        case 3:
                            let platformBrickSelectionIsNew = false
                            let platformSelection
                            let platformSelectionX
                            while (!platformBrickSelectionIsNew && attempts < 50) {
                                platformSelection = platformPositionsXY[Phaser.Math.Between(0,platformPositionsXY.length - 1)]
                                platformSelectionX = platformSelection[0] + Phaser.Math.Between(0,platformWidth - spikesWidth)
                                if (spikesPositionsXY.length == 0 || !isCoordinateInRange(spikesPositionsXY,platformSelectionX,spikesWidth)) {
                                    platformBrickSelectionIsNew = true
                                }
                                attempts++
                            }
                            let platformSelectionY = platformSelection[1] - spikePlatformHeight
                            setProperties(game[id].create(platformSelectionX,platformSelectionY, id))
                            spikesPositionsXY.push([platformSelectionX,platformSelectionY])
                            break
                    }
                }
            }
            else {
                for (let i = 0; i < spikesPositionsXY.length; i++) {
                    setProperties(game[id].create(spikesPositionsXY[i][0], spikesPositionsXY[i][1], id))
                }
            }
            //console.log("Spikes:")
            //console.log(spikesPositionsXY)
            break
        case "enemies":
            game[id] = game.physics.add.group()
            let enemyHeight = 200
            if (newMap) {
                groundLocationsXY = groundLocationsXY.concat(floorBrickPositionsXY).concat(platformPositionsXY)
                enemyPositions.length = 0
                for (let i = 0; i < number; i++) {
                    groundSelection = groundLocationsXY[Phaser.Math.Between(3,groundLocationsXY.length - 1)]
                    enemyLocationX = Phaser.Math.Between(groundSelection[0], groundSelection[0] + 150)
                    enemyLocationY = groundSelection[1] - enemyHeight
                    enemyPositions.push({ x: enemyLocationX, y: enemyLocationY }) 
                }
            }
            enemyPositions.forEach(pos => {
                let enemy = game[id].create(pos.x, pos.y, 'enemy')
                enemy.anims.play('enemy-run', true)
                enemy.setScale(2)
                     .setOrigin(0, 0)
                     .setSize(12, 16, true)
                     .setCollideWorldBounds(true)
                     .setOffset(game.player.body.offset.x, 32)
                     .flipX = true
            })
            //console.log("Basic Enemies: " + (newMap == true ? number : enemyPositions.length))
            break
        case "enemies2":
            game[id] = game.physics.add.group()
            let enemy2Height = 200
            if (newMap) {
                groundLocationsXY = groundLocationsXY.concat(floorBrickPositionsXY).concat(platformPositionsXY)
                enemy2Positions.length = 0
                for (let i = 0; i < number; i++) {
                    groundSelection = groundLocationsXY[Phaser.Math.Between(3,groundLocationsXY.length - 1)]
                    enemyLocationX = Phaser.Math.Between(groundSelection[0], groundSelection[0] + 150)
                    enemyLocationY = groundSelection[1] - enemy2Height
                    enemy2Positions.push({ x: enemyLocationX, y: enemyLocationY }) 
                }
            }
            enemy2Positions.forEach(pos => {
                let enemy = game[id].create(pos.x, pos.y, 'enemy_2')
                enemy.anims.play('enemy_2-run', true)
                enemy.setScale(2)
                     .setOrigin(0, 0)
                     .setSize(12, 16, true)
                     .setCollideWorldBounds(true)
                     .setOffset(game.player.body.offset.x, 32)
                     .flipX = true
            })
            //console.log("Medium Enemies: " + (newMap == true ? number : enemy2Positions.length))
            break
        case "fireballs":
            const spawnInterval = 1500
            game[id] = game.physics.add.group({
                collideWorldBounds: true
            })
            game.time.addEvent({
                delay: spawnInterval,
                callback: spawnFireballs,
                args: [newMap == true ? number : fireballsNumber, game],
                callbackScope: game,
                loop: false,
                repeat: 50
            })
            fireballsNumber = number
            //console.log("Fireballs: " + fireballsNumber)
            break
        default:
            break
    }
}

export const setNewMap = (value) => {
    newMap = value
}

function spawnFireballs(number, game) {
    const cameraView = game.cameras.main.worldView
    for (let i = 0; i < number; i++) {
        const x = Phaser.Math.Between(cameraView.x, cameraView.x + cameraView.width)
        const y = cameraView.y
        let fireball = game.fireballs.create(x, y, 'fireball')
        fireball.anims.play('fireball', true)
    }
}

function setProperties(elem) {
    elem
    .setOrigin(0, 1)
    .setScale(2)
    .refreshBody()
}

function isCoordinateInRange(array, newX, range) {
    return array.some(item => Math.abs(item[0] - newX) <= range)
  }