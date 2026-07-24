/*!
 * @name 听音音源
 * @description 请到https://api.yaohud.cn/自行去获取key，支持除酷狗以外的所有平台
 * @version v1
 * @author 竹佀
 */
const { EVENT_NAMES, request, on, send } = globalThis.lx

// 这里填你的key
const API_KEY = 'xwT5YzREvIwK8LVZ72n'

// 各个平台的配置
const SOURCE_CONFIGS = {
    'kw': {  // 酷我
        name: '酷我音乐',
        url: 'https://api.yaohud.cn/api/music/kuwo',
        qualitys: ['128k', '320k', 'flac', 'hi-res'],
        buildParams: (keyword, quality, apiKey) => {
            // 音质映射
            const qMap = {
                '128k': 'standard',
                '320k': 'exhigh', 
                'flac': 'lossless',
                'hi-res': 'hires'
            }
            const q = qMap[quality] || 'exhigh'
            return `key=${apiKey}&msg=${encodeURIComponent(keyword)}&n=1&size=${q}`
        },
        getUrl: (data) => {
            if (data?.url) return data.url
            if (data?.vipmusic?.url) return data.vipmusic.url
            if (data?.music_url) return data.music_url
            return null
        }
    },
    'tx': {  // QQ音乐
        name: 'QQ音乐', 
        url: 'https://api.yaohud.cn/api/music/qq_plus',
        qualitys: ['128k', '320k', 'flac', 'hi-res'],
        buildParams: (keyword, quality, apiKey) => {
            const qMap = {
                '128k': 'mp3',
                '320k': 'hq',
                'flac': 'sq',
                'hi-res': 'hires'
            }
            const q = qMap[quality] || 'hq'
            return `key=${apiKey}&msg=${encodeURIComponent(keyword)}&n=1&size=${q}`
        },
        getUrl: (data, quality) => {
            // 优先返回直接可用的链接
            if (data?.url) return data.url
            if (data?.musicurl) return data.musicurl
            
            // 根据不同音质取对应链接
            if (data?.music_url) {
                if (quality === 'flac' && data.music_url.flac?.url) return data.music_url.flac.url
                if (quality === '320k' && data.music_url['320']?.url) return data.music_url['320'].url  
                if (quality === '128k' && data.music_url.mp3?.url) return data.music_url.mp3.url
            }
            return null
        }
    },
    'wy': {  // 网易云
        name: '网易云音乐',
        url: 'https://api.yaohud.cn/api/music/wyvip',
        qualitys: ['128k', '320k', 'flac', 'hi-res'],
        buildParams: (keyword, quality, apiKey) => {
            const qMap = {
                '128k': 'standard',
                '320k': 'exhigh',
                'flac': 'lossless', 
                'hi-res': 'hires'
            }
            const q = qMap[quality] || 'exhigh'
            return `key=${apiKey}&msg=${encodeURIComponent(keyword)}&n=1&level=${q}`
        },
        getUrl: (data) => {
            if (data?.url) return data.url
            if (data?.vipmusic?.url) return data.vipmusic.url
            if (data?.music_url) return data.music_url
            return null
        }
    },
    'mg': {  // 咪咕
        name: '咪咕音乐',
        url: 'https://api.yaohud.cn/api/music/migu',
        qualitys: ['128k', '320k', 'flac'],
        buildParams: (keyword, quality, apiKey) => {
            return `key=${apiKey}&msg=${encodeURIComponent(keyword)}&n=1`
        },
        getUrl: (data) => {
            if (data?.music_url) return data.music_url
            if (data?.url) return data.url
            return null
        }
    }
}

// 获取搜索关键词
function buildSearchKeyword(musicInfo) {
    let keyword = ''
    const songName = (musicInfo.name || '').trim()
    
    if (!songName) {
        throw new Error('没歌名搜不了')
    }
    
    // 第一选择：歌名 + 专辑名
    const albumName = (musicInfo.meta?.albumName || '').trim()
    if (albumName) {
        keyword = `${songName} ${albumName}`
    } 
    // 第二选择：歌名 + 歌手名
    else if (musicInfo.singer) {
        let singerName = ''
        if (Array.isArray(musicInfo.singer) && musicInfo.singer.length > 0) {
            singerName = String(musicInfo.singer[0]).trim()
        } else if (typeof musicInfo.singer === 'string') {
            singerName = musicInfo.singer.trim()
        }
        
        if (singerName) {
            keyword = `${songName} ${singerName}`
        } else {
            keyword = songName
        }
    }
    // 第三选择：只搜歌名
    else {
        keyword = songName
    }
    
    return keyword
}

// 获取音频链接
async function getMusicUrl(source, musicInfo, quality) {
    const config = SOURCE_CONFIGS[source]
    if (!config) {
        throw new Error(`不支持 ${source} 这个平台`)
    }
    
    // 构建搜索关键词
    const keyword = buildSearchKeyword(musicInfo)
    
    // 构建请求参数
    const params = config.buildParams(keyword, quality, API_KEY)
    const requestUrl = `${config.url}?${params}`
    
    // 发送请求
    const resp = await new Promise((resolve, reject) => {
        request(requestUrl, {
            method: 'GET',
            timeout: 8000
        }, (err, resp) => {
            if (err) {
                reject(new Error(`请求失败: ${err.message}`))
            } else {
                resolve(resp)
            }
        })
    })
    
    // 解析响应
    const data = resp.body
    if (!data) {
        throw new Error('服务器没返回数据')
    }
    
    if (data.code !== 200) {
        throw new Error(data.msg || `错误代码: ${data.code}`)
    }
    
    if (!data.data) {
        throw new Error('返回的数据格式不对')
    }
    
    // 获取音频链接
    const audioUrl = config.getUrl(data.data, quality)
    if (!audioUrl) {
        throw new Error('没拿到音频链接')
    }
    
    return String(audioUrl)
}

// 处理各种请求
on(EVENT_NAMES.request, ({ action, source, info }) => {
    // 只处理获取音频链接的请求
    if (action !== 'musicUrl') {
        return Promise.reject(new Error('这个操作不支持'))
    }
    
    // 检查平台是否支持
    if (!SOURCE_CONFIGS[source]) {
        return Promise.reject(new Error(`不支持 ${source} 这个平台`))
    }
    
    // 检查参数
    if (!info || !info.musicInfo) {
        return Promise.reject(new Error('参数不完整'))
    }
    
    // 获取音质，默认320k
    const quality = info.type || '320k'
    
    // 获取音频链接
    return getMusicUrl(source, info.musicInfo, quality)
})

// 设置界面
on(EVENT_NAMES.showConfigView, () => {
    const view = {
        title: '听音音源',
        width: 400,
        height: 180,
        config: [
            {
                key: 'tip',
                type: 'help',
                title: '使用说明',
                help: '先去 https://api.yaohud.cn/ 搞个key\n然后填到代码最上面的 API_KEY 那里\n现在用的key: ' + (API_KEY ? API_KEY.substring(0, 12) + '...' : '还没填'),
                helpType: 'text'
            }
        ]
    }
    
    // 设置保存回调
    view.onSave = () => {
        return {
            result: true,
            message: '配置需要手动修改代码'
        }
    }
    
    // 发送设置界面
    send(EVENT_NAMES.showConfigView, view)
})

// 注册支持的音源
const registeredSources = {
    'wy': {
        name: '网易云音乐',
        type: 'music',
        actions: ['musicUrl'],
        qualitys: ['128k', '320k', 'flac', 'hi-res']
    },
    'tx': {
        name: 'QQ音乐',
        type: 'music',
        actions: ['musicUrl'],
        qualitys: ['128k', '320k', 'flac', 'hi-res']
    },
    'kw': {
        name: '酷我音乐',
        type: 'music',
        actions: ['musicUrl'],
        qualitys: ['128k', '320k', 'flac', 'hi-res']
    },
    'mg': {
        name: '咪咕音乐',
        type: 'music',
        actions: ['musicUrl'],
        qualitys: ['128k', '320k', 'flac']
    }
}

// 告诉主程序我准备好了
send(EVENT_NAMES.inited, {
    sources: registeredSources
})