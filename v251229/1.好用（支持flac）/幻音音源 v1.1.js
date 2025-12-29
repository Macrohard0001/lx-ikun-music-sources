/*!
 * @name 幻音音源
 * @description 使用TuneHub API的音源
 * @version 1.1
 * @author 竹佀
 */
const { EVENT_NAMES, on, send } = globalThis.lx

// 音频API处理
const getAudioUrl = (source, musicInfo, quality = '128k') => {
    // 源映射
    const sourceMap = {
        'tx': 'qq',
        'kw': 'kuwo', 
        'wy': 'netease'
    }
    
    const platform = sourceMap[source] || 'qq'
    const songmid = musicInfo.songmid || musicInfo.id || musicInfo.mid
    
    if (!songmid) {
        throw new Error('找不到歌曲ID')
    }
    
    // 确保音质参数正确
    // TuneHub API需要完整的音质名称
    const qualityMap = {
        '128k': '128k',
        '320k': '320k',
        'flac': 'flac',
        'flac24bit': 'flac24bit'
    }
    
    const br = qualityMap[quality] || '128k'
    
    // 直接返回TuneHub API链接
    return `https://music-dl.sayqz.com/api/?source=${platform}&id=${songmid}&type=url&br=${br}`
}

// 事件处理
on(EVENT_NAMES.request, ({ source, action, info }) => {
    if (action !== 'musicUrl') {
        return Promise.reject(new Error('仅支持musicUrl操作'))
    }
    
    try {
        const quality = info.type || '128k'
        const url = getAudioUrl(source, info.musicInfo, quality)
        
        console.log(`[TuneHub] 返回链接: ${url}`)
        
        // 关键：直接返回字符串URL，不是对象
        return Promise.resolve(url)
        
    } catch (error) {
        console.error(`[TuneHub] 错误: ${error.message}`)
        return Promise.reject(new Error(`[TuneHub] ${error.message}`))
    }
})

// 初始化
send(EVENT_NAMES.inited, {
    openDevTools: false,
    sources: {
        tx: {
            name: 'QQ音乐 - TuneHub',
            type: 'music',
            actions: ['musicUrl'],
            qualitys: ['128k', '320k', 'flac', 'flac24bit']
        },
        kw: {
            name: '酷我音乐 - TuneHub',
            type: 'music',
            actions: ['musicUrl'],
            qualitys: ['128k', '320k', 'flac', 'flac24bit']
        },
        wy: {
            name: '网易云音乐 - TuneHub',
            type: 'music',
            actions: ['musicUrl'],
            qualitys: ['128k', '320k', 'flac', 'flac24bit']
        }
    }
})

console.log('[TuneHub] 音源初始化完成')