/**
 * @name HYW×Koneko-API-Charity
 * @version 1.0.0
 * @author Miao-moe@MistAperio Studio×Macrohard Studio
 * @description Koneko API LX Music 音源脚本 - 支持kw、kg、tx、wy、mg
 * @homepage https://github.com/Miao-moe
 * @license MIT
 * @updateUrl http://hywmusicsource.xn--9tra.work/api/releases?script=HYW%C3%97Koneko-API-Charity&scriptType=free&version=1.0.0
 *
 * 支持平台: kw、kg、tx、wy、mg
 * 支持音质: 128k、320k、flac
 * 生成时间: 2026-07-16T13:18:39.629Z
 */

'use strict'

const { EVENT_NAMES, request, on, send } = globalThis.lx

const API_BASE = 'http://hywmusicsource.xn--9tra.work' || 'http://localhost:3000'
const SUPPORTED_SOURCES = ["kw","kg","tx","wy","mg"]
const ALLOWED_QUALITIES = ['128k', '320k', 'flac']
const CARD_KEY = 'charity'
const SCRIPT_VERSION = 'HYW×Koneko-API-Charity_v1.0.0'
const SCRIPT_NAME = 'HYW×Koneko-API-Charity'
const CURRENT_VERSION = '1.0.0'
const UPDATE_URL = API_BASE + '/api/releases?script=' + encodeURIComponent(SCRIPT_NAME) + '&scriptType=free&version=' + CURRENT_VERSION

// ========== 日志输出 ==========
const log = {
  info: (...args) => { try { console.log('[Koneko]', ...args) } catch(e) {} },
  error: (...args) => { try { console.error('[Koneko ERROR]', ...args) } catch(e) {} },
  warn: (...args) => { try { console.warn('[Koneko WARN]', ...args) } catch(e) {} },
}

// ========== HTTP 请求封装 ==========
const httpRequest = (url) => new Promise((resolve, reject) => {
  const headers = {
    'X-Script-Version': SCRIPT_VERSION,
  }
  if (CARD_KEY) headers['X-Card-Key'] = CARD_KEY

  log.info('请求:', url)
  request(url, { headers }, (err, resp) => {
    if (err) {
      log.error('网络请求失败:', err)
      return reject(new Error('网络请求失败: ' + (err.message || err)))
    }
    log.info('响应状态:', resp.statusCode, '长度:', resp.body ? resp.body.length : 0)
    resolve(resp.body)
  })
})

const apiRequest = async (endpoint, params = {}) => {
  // 将 CARD_KEY 也放入 query 参数，确保服务端能收到
  const allParams = { ...params }
  if (CARD_KEY) allParams.key = CARD_KEY

  const query = Object.entries(allParams)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => k + '=' + encodeURIComponent(v))
    .join('&')
  const url = API_BASE + endpoint + (query ? '?' + query : '')

  const body = await httpRequest(url)
  const data = typeof body === 'string' ? JSON.parse(body) : body

  if (data.code === 401 || data.code === 403) {
    log.error('权限不足:', data.message || data.code)
    throw new Error('无访问权限: ' + (data.message || ''))
  }
  if (data.code !== 200) {
    log.error('请求失败:', data.code, data.message || '')
    throw new Error('请求失败: ' + (data.message || 'code=' + data.code))
  }
  log.info('请求成功:', endpoint)
  return data
}

// 获取歌曲ID - 兼容各种字段名
const getSongId = (musicInfo) =>
  musicInfo.songmid || musicInfo.songId || musicInfo.id || musicInfo.hash || musicInfo.rid || musicInfo.musicId || musicInfo.copyrightId || musicInfo.songid

// ========== 核心功能 ==========

const getMusicUrl = async (source, musicInfo, quality) => {
  log.info('获取URL:', source, quality, JSON.stringify(musicInfo).substring(0, 200))
  if (!SUPPORTED_SOURCES.includes(source)) {
    log.error('不支持的平台:', source, '支持:', SUPPORTED_SOURCES)
    return Promise.reject(new Error('不支持的平台: ' + source))
  }
  const songId = getSongId(musicInfo)
  if (!songId) {
    log.error('歌曲ID不存在:', JSON.stringify(musicInfo))
    return Promise.reject(new Error('歌曲ID不存在'))
  }

  log.info('调用API: source=' + source + ' songId=' + songId + ' quality=' + quality)
  const data = await apiRequest('/api/music/url', { source, songId, quality })
  if (data.url) {
    log.info('获取URL成功:', data.url.substring(0, 100))
    return data.url
  }
  log.error('返回数据无url字段:', JSON.stringify(data).substring(0, 200))
  throw new Error('获取音乐链接失败')
}

const getLyric = async (source, musicInfo) => {
  const songId = getSongId(musicInfo)
  if (!songId) return { lyric: '', tlyric: '', rlyric: '', lxlyric: '' }
  try {
    const data = await apiRequest('/api/music/info', { action: 'lyric', source, songId })
    return data.data || { lyric: '', tlyric: '', rlyric: '', lxlyric: '' }
  } catch (e) { return { lyric: '', tlyric: '', rlyric: '', lxlyric: '' } }
}

const getPic = async (source, musicInfo) => {
  const songId = getSongId(musicInfo)
  if (!songId) return ''
  try {
    const data = await apiRequest('/api/music/info', { action: 'pic', source, songId })
    return data.data?.pic || ''
  } catch (e) { return '' }
}

// ========== 检查更新功能 ==========
// LX Music 官方规范：脚本需要处理 checkUpdate 事件来响应更新检查
// 服务端返回格式：{ code: 200, msg, data: { url, version, ... } } 表示有更新
//                { code: 0, msg } 表示无更新
on(EVENT_NAMES.checkUpdate, async () => {
  try {
    // 从服务端获取最新版本信息
    const response = await httpRequest(UPDATE_URL)
    const data = typeof response === 'string' ? JSON.parse(response) : response
    
    // code: 200 表示有新版本
    if (data.code === 200 && data.data) {
      const latestVersion = data.data.version
      const updateLog = data.data.updateLog || data.msg || ''
      const downloadUrl = data.data.url || (API_BASE + '/api/music/card-key/download?format=lx&script=' + encodeURIComponent(SCRIPT_NAME))
      
      // 版本比较：客户端再确认服务端版本确实更新（防止服务端误判）
      const isNewer = compareVersions(latestVersion, CURRENT_VERSION) > 0
      
      if (isNewer) {
        // 返回更新信息，LX Music 会自动弹出更新提示弹窗
        return {
          haveUpdate: true,
          version: latestVersion,
          log: updateLog,
          downloadUrl: downloadUrl,
        }
      }
    }
    
    // 没有更新（code: 0 或版本不比当前新）
    return {
      haveUpdate: false,
      version: CURRENT_VERSION,
      log: '',
    }
  } catch (e) {
    // 检查更新失败，返回当前版本信息
    return {
      haveUpdate: false,
      version: CURRENT_VERSION,
      log: '',
    }
  }
})

// 版本号比较函数
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0
    const p2 = parts2[i] || 0
    if (p1 > p2) return 1
    if (p1 < p2) return -1
  }
  return 0
}

// ========== 事件注册 ==========
on(EVENT_NAMES.request, ({ source, action, info }) => {
  switch (action) {
    case 'musicUrl': return getMusicUrl(source, info.musicInfo, info.type)
    case 'lyric': return getLyric(source, info.musicInfo)
    case 'pic': return getPic(source, info.musicInfo)
  }
})

send(EVENT_NAMES.inited, {
  sources: {"kw":{"name":"酷我音乐","type":"music","actions":["musicUrl"],"qualitys":["128k","320k","flac"]},"kg":{"name":"酷狗音乐","type":"music","actions":["musicUrl"],"qualitys":["128k","320k","flac"]},"tx":{"name":"QQ音乐","type":"music","actions":["musicUrl"],"qualitys":["128k","320k","flac"]},"wy":{"name":"网易云音乐","type":"music","actions":["musicUrl"],"qualitys":["128k","320k","flac"]},"mg":{"name":"咪咕音乐","type":"music","actions":["musicUrl"],"qualitys":["128k","320k","flac"]}}
})
