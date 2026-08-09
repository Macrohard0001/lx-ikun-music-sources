/*!
 * @name 西瓜糖音乐
 * @description 西瓜糖API制作的QQ音乐插件
 * @version v2
 * @author 玥然OvO
 */
const { EVENT_NAMES, request, on, send } = globalThis.lx

const API_KEY = '78ba562b6b7de94edb2f4465f1a2a1feaffe9878e3b98385c4d7e7b4cf98a524'
const API_URL = 'https://api.nki.pw/API/music_open_api.php'
const TIMEOUT = 10000
const USER_AGENT = 'Mozilla/5.0'

const QUALITY_MAP = {
  '128k': 'song_play_url_hq',
  '320k': 'song_play_url_accom',
  'flac': 'song_play_url_pq',
  'hires': 'song_play_url_sq'
}

const FALLBACK_FIELDS = ['song_play_url', 'music_url', 'url']

on(EVENT_NAMES.request, async ({ source, action, info }) => {
  if (source !== 'tx' || action !== 'musicUrl') return
  
  const mid = info.musicInfo.mid || info.musicInfo.songmid || info.musicInfo.id
  if (!mid) throw new Error('缺少音乐ID')
  
  const quality = info.type || '128k'
  const requestUrl = `${API_URL}?apikey=${API_KEY}&mid=${mid}`
  
  return new Promise((resolve, reject) => {
    request(requestUrl, {
      method: 'GET',
      timeout: TIMEOUT,
      headers: { 'User-Agent': USER_AGENT }
    }, (err, resp) => {
      if (err) return reject(new Error('网络请求失败'))
      if (!resp?.body) return reject(new Error('API返回空数据'))
      
      try {
        const data = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body
        const url = extractAudioUrl(data, quality)
        
        if (url) return resolve(url)
        
        const errorMsg = data.msg || `未找到${quality}音频链接`
        reject(new Error(errorMsg))
      } catch {
        if (resp.body?.includes('http')) {
          resolve(resp.body.trim())
        } else {
          reject(new Error('数据解析失败'))
        }
      }
    })
  })
})

function extractAudioUrl(data, quality) {
  const primaryField = QUALITY_MAP[quality]
  if (primaryField && data[primaryField]) {
    return data[primaryField]
  }
  
  for (const field of FALLBACK_FIELDS) {
    if (data[field]) return data[field]
  }
  
  if (data.data && typeof data.data === 'string' && data.data.startsWith('http')) {
    return data.data
  }
  
  return null
}

send(EVENT_NAMES.inited, {
  sources: {
    tx: {
      name: 'QQ音乐',
      type: 'music',
      actions: ['musicUrl'],
      qualitys: ['128k', '320k', 'flac', 'hires']
    }
  }
})