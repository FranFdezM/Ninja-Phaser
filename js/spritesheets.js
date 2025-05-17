const init_spritesheets = [
    {
        key: 'player',
        path: 'assets/entities/player.png',
        frameWidth: 64,
        frameHeight: 64
    },
    {
        key: 'enemy',
        path: 'assets/entities/enemy.png',
        frameWidth: 64,
        frameHeight: 64
    },
    {
        key: 'enemy_2',
        path: 'assets/entities/enemy_2.png',
        frameWidth: 64,
        frameHeight: 64
    },
    {
        key: 'fireball',
        path: 'assets/entities/fireball.png',
        frameWidth: 8,
        frameHeight: 8
    },
    {
        key: 'fireball-explosion',
        path: 'assets/entities/fireball-explosion.png',
        frameWidth: 16,
        frameHeight: 16
    },
    {
        key: 'heart',
        path: 'assets/entities/heart.png',
        frameWidth: 16,
        frameHeight: 16
    }
]

export const initSpritesheets = ({load}) => {
    init_spritesheets.forEach(
        ({key, path, frameWidth, frameHeight}) => load.spritesheet(
            key,
            path,
            {frameWidth, frameHeight}
        )
    )
}