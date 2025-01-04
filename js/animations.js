export const createAnimations = (game) => {
    if (!game.anims.exists('idle') || !game.anims.exists('run') || !game.anims.exists('jump') || !game.anims.exists('fall')) {
        game.anims.create({
            key: 'idle',
            frames: game.anims.generateFrameNumbers('player', { start: 0, end: 4 }),
            repeat: -1,
            frameRate: 7
        });
        
        game.anims.create({
            key: 'run',
            frames: game.anims.generateFrameNumbers('player', { start: 5, end: 9 }),
            repeat: -1,
            frameRate: 12
        });
        
        game.anims.create({
            key: 'jump',
            frames: game.anims.generateFrameNumbers('player', { start: 10, end: 13 })
        });
    
        game.anims.create({
            key: 'fall',
            frames: game.anims.generateFrameNumbers('player', { start: 14, end: 15 }),
            repeat: -1,
            frameRate: 8
        });

        game.anims.create({
            key: 'enemy-run',
            frames: game.anims.generateFrameNumbers('enemy', { start: 0, end: 4 }),
            repeat: -1,
            frameRate: 7
        });

        game.anims.create({
            key: 'enemy_2-run',
            frames: game.anims.generateFrameNumbers('enemy_2', { start: 0, end: 4 }),
            repeat: -1,
            frameRate: 7
        });

        game.anims.create({
            key: 'fireball',
            frames: game.anims.generateFrameNumbers('fireball', { start: 0, end: 3 }),
            repeat: -1,
            frameRate: 7
        });

        game.anims.create({
            key: 'fireball-explosion',
            frames: game.anims.generateFrameNumbers('fireball-explosion', { start: 0, end: 2 })
        });
    }
}