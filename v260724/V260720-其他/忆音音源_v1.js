/*!
 * @name 忆音音源
 * @description 支持Q音网易320k
 * @version v1
 * @author 竹佀＆玥然OvO
 */
const { EVENT_NAMES, on, send } = globalThis.lx

const getAudioUrl = (source, musicInfo) => {
    const platform = source === 'tx' ? 'tencent' : 'netease'
    const songId = musicInfo.songmid || musicInfo.id
    
    if (!songId) {
        throw new Error('找不到歌曲ID')
    }
    
    return `https://music.3e0.cn/?server=${platform}&type=url&id=${songId}`
}

on(EVENT_NAMES.request, ({ source, action, info }) => {
    if (action !== 'musicUrl') {
        return Promise.reject(new Error('仅支持musicUrl操作'))
    }
    
    try {
        const url = getAudioUrl(source, info.musicInfo)
        
        console.log(`[DreamMeting] 返回链接: ${url}`)
        console.log(`[DreamMeting] 音质: 320k`)
        
        return Promise.resolve(url)
        
    } catch (error) {
        console.error(`[DreamMeting] 错误: ${error.message}`)
        return Promise.reject(new Error(`[DreamMeting] ${error.message}`))
    }
})

send(EVENT_NAMES.inited, {
    openDevTools: false,
    sources: {
        tx: {
            name: 'QQ音乐 - DreamMeting',
            type: 'music',
            actions: ['musicUrl'],
            qualitys: ['320k']
        },
        wy: {
            name: '网易云音乐 - DreamMeting',
            type: 'music',
            actions: ['musicUrl'],
            qualitys: ['320k']
        }
    }
})

console.log('音源初始化完成')