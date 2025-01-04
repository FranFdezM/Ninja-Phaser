export const generateFactory = (id, game, number, posX, startY, lastY) => {
    switch (id) {
        case 'clouds':
            let pathX = posX
            let endX = 5000
            let calculatedX = (endX - posX) / number

            for (let i = 0; i < number; i++) {
                if (pathX > endX) {
                    break
                }
                game.add.image(pathX, Phaser.Math.Between(startY,lastY), 'cloud' + Phaser.Math.Between(1,2))
                pathX += calculatedX
            }
            break
        case 'goal':
            game[id] = game.physics.add.staticGroup()
            setProperties(game[id].create(posX, startY, id))
            break
        case 'floorbricks':
            game[id] = game.physics.add.staticGroup()
            setProperties(game[id].create(0, startY, id))
            setProperties(game[id].create(300, startY, id))
            setProperties(game[id].create(800, startY, id))
            setProperties(game[id].create(1900, startY, id))
            setProperties(game[id].create(2300, startY, id))
            setProperties(game[id].create(2600, startY, id))
            setProperties(game[id].create(3000, startY, id))
            setProperties(game[id].create(3228, startY, id))
            setProperties(game[id].create(3500, startY, id))
            setProperties(game[id].create(3728, startY, id))
            setProperties(game[id].create(3956, startY, id))
            setProperties(game[id].create(4184, startY, id))
            setProperties(game[id].create(4400, startY, id))
            break
        case 'platform':
            game[id] = game.physics.add.staticGroup()
            setProperties(game[id].create(150, startY - 150, id))
            setProperties(game[id].create(1028, startY - 170, id))
            setProperties(game[id].create(1228, startY - 300, id))
            setProperties(game[id].create(1600, startY - 100, id))
            setProperties(game[id].create(2000, startY - 170, id))
            setProperties(game[id].create(2600, startY - 170, id))
            setProperties(game[id].create(3000, startY - 250, id))
            setProperties(game[id].create(3230, startY - 250, id))
            setProperties(game[id].create(3700, startY - 120, id))
            setProperties(game[id].create(3800, startY - 250, id))
            setProperties(game[id].create(4000, startY - 150, id))
            setProperties(game[id].create(4200, startY - 280, id))
            setProperties(game[id].create(4450, startY - 380, id))
            setProperties(game[id].create(4772, startY - 150, id))
            break
        case "spikes":
            game[id] = game.physics.add.staticGroup()
            setProperties(game[id].create(400, startY - 73, id))
            setProperties(game[id].create(1600, startY - 148, id))
            setProperties(game[id].create(1710, startY - 148, id))
            setProperties(game[id].create(1742, startY - 148, id))
            setProperties(game[id].create(2300, startY - 73, id))
            setProperties(game[id].create(2400, startY - 73, id))
            setProperties(game[id].create(2750, startY - 73, id))
            setProperties(game[id].create(3000, startY - 73, id))
            setProperties(game[id].create(3078, startY - 73, id))
            setProperties(game[id].create(3300, startY - 73, id))
            setProperties(game[id].create(3378, startY - 73, id))
            setProperties(game[id].create(3850, startY - 168, id))
            setProperties(game[id].create(4000, startY - 73, id))
            setProperties(game[id].create(4150, startY - 73, id))
            setProperties(game[id].create(4270, startY - 327, id))
            break
        case "enemies":
            game[id] = game.physics.add.group()
            let enemyPositions = [
                { x: 1150, y: startY - 218 },
                { x: 1350, y: startY - 300 },
                { x: 3050, y: startY - 300 },
                { x: 3150, y: startY - 300 },
                { x: 3300, y: startY - 300 },
                { x: 3350, y: startY - 300 },
                { x: 4320, y: startY - 300 },
                { x: 4500, y: startY - 218 },
                { x: 4600, y: startY - 400 }
            ]
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
            break
        case "enemies2":
            game[id] = game.physics.add.group()
            let enemy2Positions = [
                { x: 950, y: startY },
                { x: 2000, y: startY - 50 },
                { x: 2100, y: startY - 300 },
                { x: 2700, y: startY - 300 },
                { x: 3190, y: startY },
                { x: 3770, y: startY - 200 },
                { x: 3900, y: startY - 300 },
                { x: 4120, y: startY - 200 }
            ]
            
            enemy2Positions.forEach(pos => {
                let enemy = game[id].create(pos.x, pos.y, 'enemy_2')
                enemy.anims.play('enemy_2-run', true)
                enemy.setScale(2)
                        .setOrigin(0, 0)
                        .setCollideWorldBounds(true)
                        .setSize(12, 16, true)
                        .setOffset(game.player.body.offset.x, 32)
                        .flipX = true
            })
            break
        case "fireballs":
            const spawnInterval = 1000
            game[id] = game.physics.add.group({
                collideWorldBounds: true
            })
            
            game.time.addEvent({
                delay: spawnInterval,
                callback: spawnFireballs,
                args: [number, game],
                callbackScope: game,
                loop: true
            })
            break
        default:
            break
    }
}

function spawnFireballs(number, game) {
    const cameraView = game.cameras.main.worldView
    var fireballsPerInterval
    fireballsPerInterval = number
    for (let i = 0; i < fireballsPerInterval; i++) {
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