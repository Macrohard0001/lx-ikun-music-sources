/*!
 * @name 闻音音源
 * @description 基于公开API的酷我音源
 * @version v1
 * @author 竹佀
 * @notes 
 */

const { EVENT_NAMES, on, send } = globalThis.lx

// 音质映射表
const QUALITY_MAP = {
  '128k': 'standard',      // API标准音质参数
  '320k': 'exhigh',        // API高音质参数
  'flac': 'lossless',      // API无损音质参数
  'flac24bit': 'hires'     // API HiRes音质参数
}

// API基础URL
const BASE_URL = 'https://kw-api.cenguigui.cn'

// 获取歌曲ID
function getSongId(musicInfo) {
  // 优先使用hash字段，然后是其他可能的ID字段
  return musicInfo.hash || musicInfo.songmid || musicInfo.id || musicInfo.rid || musicInfo.mid
}

// 事件处理
on(EVENT_NAMES.request, ({ source, action, info }) => {
  // 仅处理酷我音乐的音频链接请求
  if (source !== 'kw' || action !== 'musicUrl') return Promise.reject(new Error('不支持的操作'))
  if (!info || !info.musicInfo) return Promise.reject(new Error('缺少音乐信息'))
  
  const musicInfo = info.musicInfo
  const quality = info.type || '320k'  // 默认使用320k音质
  const apiQuality = QUALITY_MAP[quality] || 'exhigh'  // 映射API音质参数
  
  // 获取歌曲ID
  const songId = getSongId(musicInfo)
  if (!songId) return Promise.reject(new Error('无法获取歌曲ID'))
  
  // 构建小黄API音频流链接
  const audioUrl = `${BASE_URL}?id=${songId}&type=song&level=${apiQuality}&format=mp3`
  
  return Promise.resolve(audioUrl)
})

// 初始化音源
send(EVENT_NAMES.inited, {
  openDevTools: false,
  sources: {
    kw: {
      name: '酷我音乐 - 小黄API',
      type: 'music',
      actions: ['musicUrl'],
      qualitys: ['128k', '320k', 'flac', 'flac24bit']
    }
  }
})