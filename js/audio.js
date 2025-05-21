const init_audios = [
    {
        key: 'optionSound',
        path: 'assets/sound/effects/option.ogg'
    },
    {
        key: 'deathSound',
        path: 'assets/sound/effects/death.mp3'
    },
    {
        key: 'jumpSound',
        path: 'assets/sound/effects/jump.wav'
    },
    {
        key: 'saveSound',
        path: 'assets/sound/effects/save.mp3'
    },
    {
        key: 'backgroundMusic',
        path: 'assets/sound/music/background.mp3'
    },
    {
        key: 'winMusic',
        path: 'assets/sound/music/win.mp3'
    }
]

export const initAudio = ({load}) => {
    init_audios.forEach(
        ({key, path}) => load.audio(key, path)
    )
}

export const playAudio = (id, {sound}, {volume = 1, loop = false} = {}) => {
    try {
        let audio = sound.get(id)
        if (audio) return audio.play()
        return sound.add(id, {volume, loop}).play()
    } catch (error) {
        console.error(error)
    }
}

export const stopAudio = (id, {sound}) => {
    try {
        sound.get(id).stop()
    } catch (error) {
        console.error(error)
    }
}