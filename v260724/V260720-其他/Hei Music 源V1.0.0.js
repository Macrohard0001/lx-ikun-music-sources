/*!
 * @name Hei Music源
 * @description 聚合自网上公开接口及音源，倡导保护知识产权，请低调使用
 * @version 1.0.0
 * @author Compile by CatXiaolan
 */
const DEV_ENABLE = false
const MUSIC_QUALITY = {
  kw: ['128k', '320k', 'flac', 'flac24bit'],
  kg: ['128k', '320k', 'flac', 'flac24bit'],
  tx: ['128k', '320k', 'flac', 'flac24bit'],
  wy: ['128k', '320k', 'flac', 'flac24bit'],
  mg: ['128k', '320k', 'flac', 'flac24bit'],
}
const MUSIC_SOURCE = Object.keys(MUSIC_QUALITY)
const { EVENT_NAMES, request, on, send, utils, env, version } = globalThis.lx
const httpFetch = (url, options = { method: 'GET' }) => {
  return new Promise((resolve, reject) => {
    request(url, options, (err, resp) => {
      if (err) return reject(err)
      resolve(resp)
    })
  })
}
const getUserAgent = () => {
  return `${env ? `lx-music-${env}/${version}` : `lx-usic-request/${version}`}`
}
const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false
  if (url.includes('panspace.kuwo.cn') && url.includes('resource/')) return false
  return true
}
const getSongId = (musicInfo) => {
  return musicInfo.hash || musicInfo.songmid || musicInfo.songId || musicInfo.id || musicInfo.rid || musicInfo.musicId || musicInfo.copyrightId || musicInfo.songid
}

// ========== API 源定义（按响应耗时从快到慢排序）==========

// 1. chksz.top API (~0.4s) - 网易云 flac/hires/jymaster
const fetchChksz = async (source, musicInfo, quality) => {
  const songId = getSongId(musicInfo)
  if (!songId) throw new Error('歌曲ID不存在')
  if (source !== 'wy') throw new Error('chksz 仅支持网易源')
  const levelMap = {
    '128k': 'standard',
    '320k': 'exhigh',
    'flac': 'lossless',
    'flac24bit': 'jymaster',
  }
  const qualityChain = ['flac24bit', 'flac', '320k', '128k']
  const startIndex = qualityChain.indexOf(quality)
  const tryChain = startIndex >= 0 ? qualityChain.slice(startIndex) : qualityChain
  for (const q of tryChain) {
    const level = levelMap[q]
    if (!level) continue
    try {
      const request = await httpFetch(`https://api.chksz.top/api/163_music?id=${songId}&level=${level}`, {
        method: 'GET',
        headers: {
          'Referer': 'https://cp.chksz.top/',
          'User-Agent': getUserAgent(),
        },
      })
      const { body } = request
      if (body && body.code === 200 && body.data && body.data.url) {
        return body.data.url
      }
    } catch (e) {
      // 继续尝试下一个音质
    }
  }
  throw new Error('chksz 获取失败')
}

// 2. lxmusicapi.onrender.com (HUIBQ) (~1.2s) - 全平台 320k
const fetchHuibq = async (source, musicInfo, quality) => {
  const songId = getSongId(musicInfo)
  if (!songId) throw new Error('歌曲ID不存在')
  const API_URL = 'https://lxmusicapi.onrender.com'
  const API_KEY = 'share-v3'
  const supportedQualities = ['320k', '192k', '128k']
  const qualityChain = ['flac24bit', 'flac', '320k', '192k', '128k']
  const startIndex = qualityChain.indexOf(quality)
  const tryChain = startIndex >= 0 ? qualityChain.slice(startIndex) : qualityChain
  const targetQuality = tryChain.find(q => supportedQualities.includes(q)) || '320k'
  const request = await httpFetch(`${API_URL}/url/${source}/${songId}/${targetQuality}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': getUserAgent(),
      'X-Request-Key': API_KEY,
    },
  })
  const { body } = request
  if (!body || isNaN(Number(body.code))) throw new Error('unknow error')
  switch (body.code) {
    case 0:
      if (isValidUrl(body.url)) return body.url
      throw new Error('invalid url')
    case 1:
      throw new Error('block ip')
    case 2:
      throw new Error('get music url failed')
    case 4:
      throw new Error('internal server error')
    case 5:
      throw new Error('too many requests')
    case 6:
      throw new Error('param error')
    default:
      throw new Error(body.msg ?? 'unknow error')
  }
}

// 3. music-api.gdstudio.xyz (~1.6s) - 全平台
const fetchGdstudio = async (source, musicInfo, quality) => {
  const songId = getSongId(musicInfo)
  if (!songId) throw new Error('歌曲ID不存在')
  const sourceMap = {
    'kg': 'kugou',
    'kw': 'kuwo',
    'tx': 'tencent',
    'wy': 'netease',
    'mg': 'migu',
  }
  const apiSource = sourceMap[source]
  if (!apiSource) throw new Error('gdstudio 不支持该源')
  const brMap = {
    '128k': '128',
    '320k': '320',
    'flac': '740',
    'flac24bit': '999',
  }
  const qualityChain = ['flac24bit', 'flac', '320k', '128k']
  const startIndex = qualityChain.indexOf(quality)
  const tryChain = startIndex >= 0 ? qualityChain.slice(startIndex) : qualityChain
  for (const q of tryChain) {
    const br = brMap[q]
    if (!br) continue
    try {
      const request = await httpFetch(`https://music-api.gdstudio.xyz/api.php?types=url&source=${apiSource}&id=${songId}&br=${br}`, {
        method: 'GET',
        headers: { 'User-Agent': getUserAgent() },
      })
      const { body } = request
      if (body && body.url && isValidUrl(body.url)) {
        return body.url
      }
    } catch (e) {
      // 继续尝试
    }
  }
  throw new Error('gdstudio 获取失败')
}

// 4. api.music.lerd.dpdns.org (聚合API) (~1.75s) - 全平台
const fetchLerd = async (source, musicInfo, quality) => {
  const songId = getSongId(musicInfo)
  if (!songId) throw new Error('歌曲ID不存在')
  const API_URL = 'https://api.music.lerd.dpdns.org'
  const qualityMap = {
    '128k': '128k',
    '320k': '320k',
    'flac': 'flac',
    'flac24bit': 'master',
  }
  const targetQuality = qualityMap[quality] || 'flac'
  const request = await httpFetch(`${API_URL}/${source}`, {
    method: 'POST',
    body: JSON.stringify({ musicInfo: musicInfo, type: targetQuality }),
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': getUserAgent(),
    },
  })
  const { body } = request
  if (body && body.code === 200 && body.data && body.data.url) {
    if (isValidUrl(body.data.url)) return body.data.url
  } else if (body && body.code === 303 && body.data) {
    const parsed = typeof body.data === 'string' ? JSON.parse(body.data) : body.data
    if (parsed.request && parsed.request.url) {
      const subResp = await httpFetch(encodeURI(parsed.request.url), parsed.request.options || { method: 'GET' })
      if (parsed.response && parsed.response.url && parsed.response.check) {
        const checkOk = parsed.response.check.key.reduce((acc, k) => acc && acc[k], subResp)
        if (checkOk == parsed.response.check.value) {
          const realUrl = parsed.response.url.reduce((acc, k) => acc && acc[k], subResp)
          if (isValidUrl(realUrl)) return realUrl
        }
      }
    }
  }
  throw new Error(`lerd code=${body && body.code}: ${body && body.msg}`)
}

// 5. kw-api.cenguigui.cn (收集の聚合) (~3.1s) - 仅 kw
const fetchCenguigui = async (source, musicInfo, quality) => {
  const songId = getSongId(musicInfo)
  if (!songId) throw new Error('歌曲ID不存在')
  if (source !== 'kw') throw new Error('cenguigui 仅支持 kw')
  const levelMap = {
    '128k': '128k',
    '320k': '320k',
    'flac': 'lossless',
    'flac24bit': 'lossless',
  }
  const apiUrl = `https://kw-api.cenguigui.cn?id=${songId}&type=song&format=json`
  const qualityChain = ['flac24bit', 'flac', '320k', '128k']
  const startIndex = qualityChain.indexOf(quality)
  const tryChain = startIndex >= 0 ? qualityChain.slice(startIndex) : qualityChain
  for (const q of tryChain) {
    const level = levelMap[q]
    if (!level) continue
    try {
      const request = await httpFetch(`${apiUrl}&level=${level}`, {
        method: 'GET',
        headers: { 'User-Agent': getUserAgent() },
      })
      const { body } = request
      let realUrl
      if (body) {
        if (body.data && body.data.url) realUrl = body.data.url
        else if (body.url) realUrl = body.url
      }
      if (isValidUrl(realUrl)) return realUrl
    } catch (e) {
      // 继续尝试
    }
  }
  throw new Error('cenguigui 获取失败')
}

// ========== API 源列表（按响应耗时从快到慢排序）==========
const API_SOURCES = [
  { name: 'chksz',     fetch: fetchChksz,     sources: ['wy'] },
  { name: 'HUIBQ',     fetch: fetchHuibq,     sources: ['kw', 'kg', 'tx', 'wy', 'mg'] },
  { name: 'gdstudio',  fetch: fetchGdstudio,  sources: ['kg', 'kw', 'tx', 'wy', 'mg'] },
  { name: 'lerd',      fetch: fetchLerd,      sources: ['kg', 'kw', 'mg', 'tx', 'wy'] },
  { name: 'cenguigui', fetch: fetchCenguigui, sources: ['kw'] },
]

// ========== 核心逻辑：依次尝试各API源 ==========
const handleGetMusicUrl = async (source, musicInfo, quality) => {
  const errors = []
  for (const apiSource of API_SOURCES) {
    if (!apiSource.sources.includes(source)) continue
    try {
      const url = await apiSource.fetch(source, musicInfo, quality)
      if (url && isValidUrl(url)) return url
    } catch (e) {
      errors.push(`${apiSource.name}: ${e.message}`)
    }
  }
  throw new Error(`所有API源均失败:\n${errors.join('\n')}`)
}

const musicSources = {}
MUSIC_SOURCE.forEach(item => {
  musicSources[item] = {
    name: item,
    type: 'music',
    actions: ['musicUrl'],
    qualitys: MUSIC_QUALITY[item],
  }
})
on(EVENT_NAMES.request, ({ action, source, info }) => {
  switch (action) {
    case 'musicUrl':
      if (env != 'mobile') {
        console.group(`Handle Action(musicUrl)`)
        console.log('source', source)
        console.log('quality', info.type)
        console.log('musicInfo', info.musicInfo)
        console.groupEnd()
      } else {
        console.log(`Handle Action(musicUrl)`)
        console.log('source', source)
        console.log('quality', info.type)
        console.log('musicInfo', info.musicInfo)
      }
      return handleGetMusicUrl(source, info.musicInfo, info.type)
        .then(data => Promise.resolve(data))
        .catch(err => Promise.reject(err))
    default:
      console.error(`action(${action}) not support`)
      return Promise.reject('action not support')
  }
})
send(EVENT_NAMES.inited, { status: true, openDevTools: DEV_ENABLE, sources: musicSources })
