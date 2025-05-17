const init_images = [
    {
        key: 'cloud1',
        path: 'assets/scenery/cloud1.png'
    },
    {
        key: 'cloud2',
        path: 'assets/scenery/cloud2.png'
    },
    {
        key: 'floorbricks',
        path: 'assets/scenery/floorbricks.png'
    },
    {
        key: 'platforms',
        path: 'assets/scenery/platform.png'
    },
    {
        key: 'spikes',
        path: 'assets/scenery/spikes.png'
    },
    {
        key: 'goal',
        path: 'assets/scenery/goal.png'
    }
]

export const initImages = ({load}) => {
    init_images.forEach(
        ({key, path}) => load.image(
            key,
            path
        )
    )
}