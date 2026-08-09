/**
 * @name Hei Music聚合源
 * @description 聚合自网上公开接口及音源，请低调使用 加入Q群获取后续更新516649104 (v1.3.1 新增 云村点歌源)
 * @version v1.3.1
 * @author Compile by CatXiaolan
 */

const { EVENT_NAMES, request, on, send } = globalThis.lx

// ========== 统计上报配置 ==========
// 安装控制面板后，此URL会被自动替换为面板的 report.php 地址
// 为空字符串则不上报
// v1.2.4 起改为混淆存储（编码值在下方 _0xa3b1.panel_report），运行时解码使用
var PANEL_REPORT_URL = ''

// ========== 混淆层：字符串编码/解码 ==========
// 将敏感URL和密钥以编码形式存储，运行时解码使用
var _0x4e8f = function(arr, key) {
  var result = []
  for (var i = 0; i < arr.length; i++) {
    result.push(String.fromCharCode(arr[i] ^ key.charCodeAt(i % key.length)))
  }
  return result.join('')
}

// 编码后的API URL密钥表（XOR with key "HeiMusic"）
var _0xa3b1 = {
  // 面板上报地址（v1.2.4 起改为混淆存储，安装面板时由 install.php 覆盖此编码值）
  panel_report: [0x20,0x11,0x1d,0x3d,0x4f,0x5c,0x46,0x52,0x7a,0x52,0x47,0x7d,0x5b,0x43,0x47,0x52,0x72,0x5d,0x5e,0x7e,0x44,0x5c,0x19,0x2,0x26,0x0,0x5,0x62,0x7,0x16,0x19,0xc,0x3a,0x11,0x47,0x3d,0x1d,0x3],
  changqing_kw: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x25,0x10,0x1a,0x24,0x16,0x12,0x19,0xa,0x66,0xd,0x8,0x24,0x1,0x12,0x7,0x4,0x3f,0x4b,0x7,0x28,0x1,0x5c,0x4,0x16,0x3b,0xc,0xa,0x7c,0x5a,0x18,0x1e,0x4d,0x38,0xd,0x19],
  changqing_kg: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x25,0x10,0x1a,0x24,0x16,0x5d,0x1,0x2,0x21,0x11,0x8,0x23,0x12,0x4,0x47,0x0,0x2b,0x4a,0x2,0x2a,0x4,0x2,0x58,0x4c,0x23,0x2,0x47,0x3d,0x1d,0x3],
  nianxin_kw: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x25,0x6,0x19,0x63,0x1b,0x1a,0x8,0xd,0x30,0xc,0x7,0x35,0xf,0x5d,0xa,0xc,0x25,0x4a,0x1a,0x25,0x14,0x1,0xc,0x4c,0x2b,0x0,0x1a,0x25,0x1c,0x5c,0x2,0x14,0x66,0x15,0x1,0x3d],
  chksz: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x29,0x15,0x0,0x63,0x16,0x1b,0x2,0x10,0x32,0x4b,0x1d,0x22,0x5,0x5c,0x8,0x13,0x21],
  cenguigui: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x23,0x12,0x44,0x2c,0x5,0x1a,0x47,0x0,0x2d,0xb,0xe,0x38,0x1c,0x14,0x1c,0xa,0x66,0x6,0x7],
  qq_vkey: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x3d,0x11,0x47,0x34,0x5b,0x2,0x18,0x4d,0x2b,0xa,0x4,0x62,0x16,0x14,0x0,0x4e,0x2a,0xc,0x7,0x62,0x18,0x6,0x1a,0xa,0x2b,0x10,0x47,0x2b,0x16,0x14],
  qq_cdn: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x2c,0x9,0x47,0x3e,0x1,0x1,0xc,0x2,0x25,0x4b,0x18,0x3c,0x18,0x6,0x1a,0xa,0x2b,0x4b,0x18,0x3c,0x5b,0x10,0x6,0xe,0x67],
  ynx_tx: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x29,0x15,0x0,0x60,0x3,0x41,0x47,0x1a,0x3d,0x4,0xf,0x28,0x1b,0x14,0x47,0x0,0x26,0x4a,0x28,0x1d,0x3c,0x5c,0x18,0x12,0x25,0x10,0x1a,0x24,0x16,0x5d,0x19,0xb,0x38],
  ynx_tx2: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x3c,0x4,0x7,0x2a,0x5b,0x12,0x19,0xa,0x66,0x16,0x59,0x7c,0x6,0x5d,0xa,0xd,0x67,0x8,0x1c,0x3e,0x1c,0x10,0x36,0xc,0x38,0x0,0x7,0x12,0x14,0x3,0x0,0x4d,0x38,0xd,0x19],
  ynx_apikey: [0x7b,0x3,0xf,0x7f,0x46,0x46,0x5b,0x50,0x2d,0x51,0x5e,0x79,0x43,0x46,0x5b,0x51,0x7c,0x4,0x5a,0x2b,0x41,0x4b,0x5c,0x54,0x71,0x4,0xa,0x2b,0x41,0x42,0xf,0x51,0x7c,0x54,0x5c,0x79,0x45,0x10,0xc,0x53,0x7c,0x7,0x5f,0x2e,0x16,0x43,0xb,0x5a,0x7c,0x54,0x5f,0x79,0x13,0x40,0x5e,0x2,0x7d,0x7,0x5f,0x7f,0x4c,0x4a,0xd,0x56],
  // v1.1.9 新增源
  nianxin_kg: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x25,0x10,0x1a,0x24,0x16,0x5d,0x7,0x1b,0x21,0xb,0x11,0x37,0x5b,0x10,0x6,0xe,0x67,0xe,0xe,0x3c,0x4,0x5c,0x2,0x4,0x66,0x15,0x1,0x3d],
  suyin_qq: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x27,0xc,0x8,0x3d,0x1c,0x5d,0x7,0x6,0x3c,0x4a,0x8,0x3d,0x1c,0x5c,0x38,0x32,0x17,0x28,0x1c,0x3e,0x1c,0x10],
  // v1.2.0 新增源
  xinghai: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x31,0x1c,0x47,0x37,0x11,0x17,0x10,0x11,0x66,0x11,0x6,0x3d,0x5a,0x1f,0x11,0x4c,0x29,0x15,0x0,0x62],
  juhe: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x29,0x15,0x0,0x63,0x18,0x6,0x1a,0xa,0x2b,0x4b,0x5,0x28,0x7,0x17,0x47,0x7,0x38,0x1,0x7,0x3e,0x5b,0x1c,0x1b,0x4],
  // v1.2.4 新增源（补全接口管理）
  migudirect:   [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x25,0x10,0x1a,0x24,0x16,0x5d,0x4,0xa,0x2f,0x10,0x47,0x2e,0x1b,0x5c,0x1f,0x50,0x67,0x4,0x19,0x24,0x5a,0x1e,0x1c,0x10,0x21,0x6,0x46,0x2c,0x0,0x17,0x0,0xc,0x18,0x9,0x8,0x34,0x10,0x1,0x46,0x4,0x2d,0x11,0x39,0x21,0x14,0xa,0x20,0xd,0x2e,0xa],
  miguapi:      [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x29,0x15,0x19,0x63,0x16,0x5d,0x7,0x5,0x66,0x8,0x0,0x2a,0x0,0x5d,0xa,0xd,0x67,0x28,0x20,0xa,0x20,0x3e,0x5b,0x4d,0x78,0x4a,0x1a,0x39,0x7,0x12,0x1d,0x6,0x2f,0x1c,0x46,0x21,0x1c,0x0,0x1d,0x6,0x26,0x48,0x1c,0x3f,0x19,0x5c,0x1f,0x51,0x66,0x57],
  gdstudio_tx:  [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x29,0x15,0x0,0x63,0x12,0x17,0x1a,0x17,0x3d,0x1,0x0,0x22,0x5b,0x10,0x7,0x4c,0x25,0x10,0x1a,0x24,0x16,0x5c,0x1d,0x1b],
  gdstudio_wy:  [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x29,0x15,0x0,0x63,0x12,0x17,0x1a,0x17,0x3d,0x1,0x0,0x22,0x5b,0x10,0x7,0x4c,0x25,0x10,0x1a,0x24,0x16,0x5c,0x1e,0x1a],
  gdstudio_mg:  [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x29,0x15,0x0,0x63,0x12,0x17,0x1a,0x17,0x3d,0x1,0x0,0x22,0x5b,0x10,0x7,0x4c,0x25,0x10,0x1a,0x24,0x16,0x5c,0x4,0x4],
  xhbackend_tx: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x29,0x15,0x0,0x63,0xd,0x1a,0x7,0x4,0x20,0x4,0x0,0x60,0x17,0x12,0xa,0x8,0x2d,0xb,0xd,0x63,0x16,0x1d,0x46,0x12,0x39],
  xhbackend_mg: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x29,0x15,0x0,0x63,0xd,0x1a,0x7,0x4,0x20,0x4,0x0,0x60,0x17,0x12,0xa,0x8,0x2d,0xb,0xd,0x63,0x16,0x1d,0x46,0xe,0x21,0x2,0x1c],
  huibq:        [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x29,0x15,0x0,0x63,0x1d,0x6,0x0,0x1,0x39,0x4b,0xa,0x23,0x5a,0x1e,0x1c,0x10,0x21,0x6,0x46,0x3c,0x4],
  nianxin_tx:   [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x3c,0x1d,0x47,0x23,0x1c,0x12,0x7,0x1b,0x21,0xb,0x8,0x3d,0x1c,0x5d,0xa,0xd,0x67,0x4,0x19,0x24,0x5a,0x14,0xc,0x17,0x3d,0x17,0x5],
  nianxin_wy:   [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x3f,0x1c,0x47,0x23,0x1c,0x12,0x7,0x1b,0x21,0xb,0x8,0x3d,0x1c,0x5d,0xa,0xd,0x67,0x4,0x19,0x24,0x5a,0x14,0xc,0x17,0x3d,0x17,0x5],
  linglan_tx:   [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x29,0x15,0x0,0x63,0x19,0x1a,0x7,0x4,0x24,0x4,0x7,0x63,0x1c,0x10,0x1c,0x4c,0x25,0x10,0x1a,0x24,0x16,0x5c,0x18,0x12],
  linglan_wy:   [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x29,0x15,0x0,0x63,0x19,0x1a,0x7,0x4,0x24,0x4,0x7,0x63,0x1c,0x10,0x1c,0x4c,0x25,0x10,0x1a,0x24,0x16,0x5c,0x58,0x55,0x7b],
  // v1.3.0 新增源 — 2bi咪咕点歌（按歌名搜索，token 内置）
  twobi_mg:     [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x29,0x15,0x0,0x63,0x47,0x11,0x0,0x4d,0x2b,0xb,0x46,0x2c,0x5,0x1a,0x47,0x13,0x20,0x15,0x56,0x2c,0x5,0x1a,0x36,0xa,0x2c,0x58,0x5e],
  twobi_token:  [0x39,0x12,0x18,0x12,0x47,0x10,0xf,0x52,0x70,0x55,0x51,0x29,0x44,0x40,0xf,0x2,0x78,0x57,0x51,0x2f,0x42,0x16,0x58,0x6,0x2e,0x52,0x5e,0x2b,0x45,0x15,0x50,0x2,0x7b,0x56,0xd,0x2f,0x45,0x12,0x50,0x55,0x2a,0x0,0x50,0x29,0x46,0x43,0x58,0x57,0x2a,0x53,0x59,0x2f],
  // v1.3.1 新增源 — 云村点歌（网易，按歌名搜索，ckey 内置）
  yundiancun_url:  [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x29,0x15,0x0,0x63,0x46,0x42,0x5e,0x2,0x23,0x4b,0xa,0x22,0x18,0x5c,0x8,0x13,0x21,0x4a,0x10,0x21,0x1f,0x18,0x46,0x14,0x31,0x1c,0x1c,0x23,0x11,0x14,0x46,0x14,0x31,0x1c,0x1c,0x23,0x11,0x14],
  yundiancun_ckey: [0x70,0x36,0x3d,0x7,0x32,0x31,0x5f,0x3b,0x1a,0x34,0x3f,0xb,0x3d,0x21,0x24,0x2e,0x1a,0x33,0x33,0x75],
  // 咪咕源 — 星海后端旧版（cdyzr.dpdns.org，需 name+singer+songmid+quality 参数）
  xhbackend_legacy: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x2b,0x1,0x10,0x37,0x7,0x5d,0xd,0x13,0x2c,0xb,0x1a,0x63,0x1a,0x1,0xe,0x4c,0x24,0x1d,0x46,0x2c,0x5,0x1a,0x46,0x2,0x38,0xc,0x47,0x3d,0x1d,0x3],
}

// 运行时解码URL
var _dec = function(name) {
  return _0x4e8f(_0xa3b1[name], 'HeiMusic')
}

// 从混淆表解码面板上报地址（若编码值为空字符串则保持为空，不上报）
// 注：安装面板时 install.php 会直接覆盖 _0xa3b1.panel_report 的编码数组
if (_0xa3b1.panel_report && _0xa3b1.panel_report.length > 0) {
  PANEL_REPORT_URL = _dec('panel_report')
}

// 字符串混淆：将明文字符串通过函数间接引用
var _s = function(str) {
  return str
}
var _n = function(str) {
  return str
}

const qualitys = {
  kw: {
    '128k': '128',
    '320k': '320',
    flac: 'flac',
    flac24bit: 'flac24bit',
  },
  kg: {
    '128k': '128',
    '320k': '320',
    flac: 'flac',
    flac24bit: 'flac24bit',
  },
  tx: {
    '128k': '128',
    '320k': '320',
    flac: 'flac',
    flac24bit: 'flac24bit',
    dolby: 'dolby',
    atmos: 'atmos',
    atmos_plus: 'atmos_plus',
    master: 'master',
  },
  wy: {
    '128k': '128',
    '320k': '320',
    flac: 'flac',
    flac24bit: 'flac24bit',
    jyeffect: 'jyeffect',
    sky: 'sky',
    jymaster: 'jymaster',
    dolby: 'dolby',
    atmos: 'atmos',
    atmos_plus: 'atmos_plus',
    master: 'master',
  },
  mg: {
    '128k': '128',
    '320k': '320',
    flac: 'flac',
    flac24bit: 'flac24bit',
    atmos: 'atmos',
    atmos_plus: 'atmos_plus',
    master: 'master',
  },
}

const httpRequest = (url, options) => new Promise((resolve, reject) => {
  request(url, options, (err, resp) => {
    if (err) return reject(err)
    resolve(resp.body)
  })
})

// 带超时的请求封装，避免慢速API阻塞并发竞速
const fetchWithTimeout = function(promise, ms) {
  var timeout = new Promise(function(_, reject) {
    setTimeout(function() { reject(new Error('请求超时(' + ms + 'ms)')) }, ms)
  })
  return Promise.race([promise, timeout])
}

const isValidUrl = function(url) {
  if (!url || typeof url !== 'string') return false
  // 必须以 http(s) 开头
  if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) return false
  // 酷我试听片段域名返回的是30秒预览，过滤掉
  if (url.indexOf('panspace.kuwo.cn') !== -1) return false
  // 过滤空路径（如 https://dl.stream.qqmusic.qq.com/ 这种无 purl 的占位）
  // 取 protocol 之后的 host+path 部分，至少要含一个非斜杠字符
  var stripped = url.replace(/^https?:\/\//, '')
  if (stripped.indexOf('/') === -1) return false  // 只有 host，无路径
  var pathPart = stripped.substring(stripped.indexOf('/') + 1)
  if (pathPart.replace(/\/+/g, '').length === 0) return false  // 路径全为斜杠
  // 过滤明显非音频的响应（HTML 错误页、JSON 错误串被误当作 URL）
  var lower = url.toLowerCase()
  if (lower.indexOf('.html') !== -1 || lower.indexOf('.htm') !== -1) return false
  if (lower.indexOf('error') !== -1 || lower.indexOf('404') !== -1 || lower.indexOf('403') !== -1) return false
  // URL 过长可能是误把响应体当 URL（正常音频 URL 一般 < 500 字符）
  if (url.length > 500) return false
  return true
}

// 统计上报：异步发送调用数据到控制面板，不阻塞主流程
// 使用随机生成的用户ID区分用户，代替IP识别
var _cachedClientIp = ''
var _userId = ''

var _generateUserId = function() {
  // 生成随机用户ID（格式: U + 12位随机十六进制）
  var chars = '0123456789abcdef'
  var id = 'U'
  for (var i = 0; i < 12; i++) {
    id += chars[Math.floor(Math.random() * 16)]
  }
  _userId = id
}

// 注：设备标签（设备型号/操作系统/网络类型等）由服务端从 User-Agent 解析
// LX Music 移动端运行在 RN JS 沙箱，navigator API 不可用，故不在音源端采集

var _detectClientIp = function() {
  if (_cachedClientIp) return
  httpRequest('https://api.ipify.org?format=json', { method: 'GET', timeout: 3000 }).then(function(body) {
    if (body && body.ip) {
      _cachedClientIp = body.ip
    }
  }).catch(function() {})
}

var _generateRequestId = function() {
  var chars = '0123456789abcdef'
  var id = 'R'
  for (var i = 0; i < 16; i++) {
    id += chars[Math.floor(Math.random() * 16)]
  }
  return id
}

var _reportStat = function(platform, apiName, success, responseTime, requestId, quality) {
  if (!PANEL_REPORT_URL) return
  try {
    var body = 'platform=' + encodeURIComponent(platform)
      + '&api=' + encodeURIComponent(apiName)
      + '&success=' + (success ? 1 : 0)
      + '&time=' + encodeURIComponent(String(responseTime))
      + '&user_id=' + encodeURIComponent(_userId)
      + '&request_id=' + encodeURIComponent(requestId || '')
      + '&script_version=' + encodeURIComponent(SCRIPT_VERSION)
    if (quality) body += '&quality=' + encodeURIComponent(quality)
    if (_cachedClientIp) body += '&client_ip=' + encodeURIComponent(_cachedClientIp)
    request(PANEL_REPORT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    }, function() {})
  } catch(e) {}
}

// ========== 接口配置（从面板动态加载可用接口列表）==========
// null = 尚未加载，使用全部接口；对象 = 已加载，格式 {接口名: {平台: bool}}
// 例如 { "玉宁熙": {tx: true}, "长青SVIP": {kw: true, kg: false} }
// 缺失的接口或平台视为启用
var _enabledSources = null
// 音源总开关：true = 正常工作，false = 停用（拒绝所有请求）
var _sourceEnabled = true

var _loadSourcesConfig = function() {
  if (!PANEL_REPORT_URL) return
  // 请求时携带音源版本号，面板据此判断是否按版本号停用该音源
  var apiUrl = PANEL_REPORT_URL.replace(/\/report\.php.*$/, '/api.php?action=sources_config&ver=' + encodeURIComponent(SCRIPT_VERSION))
  if (apiUrl === PANEL_REPORT_URL) return
  httpRequest(apiUrl, { method: 'GET', timeout: 5000 }).then(function(body) {
    if (body) {
      if (typeof body.source_enabled === 'boolean') {
        _sourceEnabled = body.source_enabled
      }
      // enabled_sources 支持两种格式：
      // 1. 对象格式（新版）：{接口名: {平台: bool}}，按平台分别控制
      // 2. 数组格式（旧版兼容）：[接口名]，整个接口启用/停用
      if (body.enabled_sources) {
        if (typeof body.enabled_sources === 'object' && !Array.isArray(body.enabled_sources)) {
          _enabledSources = body.enabled_sources
        } else if (Array.isArray(body.enabled_sources)) {
          // 旧版数组格式转换为对象格式（全部平台启用）
          var obj = {}
          body.enabled_sources.forEach(function(name) { obj[name] = {} })
          _enabledSources = obj
        }
      }
    }
  }).catch(function(e) {
    // 加载失败不影响正常使用，使用全部接口
  })
}

// 判断某接口在某平台是否启用
var _isSourceEnabled = function(apiName, platform) {
  if (_enabledSources === null) return true  // 未加载配置，全部启用
  var entry = _enabledSources[apiName]
  if (entry === undefined) return true  // 接口未在配置中，视为启用
  if (typeof entry !== 'object' || entry === null) return true
  // 平台未在配置中或值为 true 视为启用
  var v = entry[platform]
  return v === undefined || v === true
}

const getSongId = function(musicInfo) {
  return musicInfo.hash || musicInfo.songmid || musicInfo.songId || musicInfo.id || musicInfo.rid || musicInfo.musicId || musicInfo.copyrightId || musicInfo.songid
}

const getPlatformSongId = function(platform, musicInfo) {
  if (platform === 'kg') return musicInfo.hash || musicInfo.songmid || musicInfo.id || musicInfo.rid || musicInfo.mid
  if (platform === 'tx') return musicInfo.songmid || musicInfo.strMediaMid || musicInfo.mediaId || musicInfo.id
  if (platform === 'mg') return musicInfo.copyrightId || musicInfo.songId || musicInfo.id || musicInfo.songmid
  return musicInfo.songmid || musicInfo.id || musicInfo.songId || musicInfo.rid || musicInfo.hash
}

const qualityToLevel = function(quality) {
  var q = String(quality || '128k').toLowerCase()
  if (q === 'jymaster' || q === 'jyeffect' || q === 'sky' || q === 'dolby' || q === 'atmos' || q === 'atmos_plus' || q === 'master') return 'lossless'
  if (q === 'flac' || q === 'flac24bit') return 'lossless'
  if (q === '320k' || q === '192k') return 'exhigh'
  return 'standard'
}

const buildSearchKeyword = function(musicInfo) {
  var name = musicInfo.name || musicInfo.songName || ''
  var singer = musicInfo.singer || musicInfo.artist || ''
  if (name && singer) return name + ' ' + singer
  return name
}

// ========== API 源获取函数 ==========

// 长青SVIP - kw/kg (从混淆代码提取的真实URL路径含1后缀)
var CHANGQING_URLS = {
  kw: _dec('changqing_kw') + '?type=mp3&id={id}&level={level}',
  kg: _dec('changqing_kg') + '?type=mp3&id={id}&level={level}',
}
const fetchChangqing = function(source, musicInfo, quality) {
  var songId = getPlatformSongId(source, musicInfo)
  if (!songId) return Promise.reject(new Error('长青SVIP: 歌曲ID不存在'))
  var template = CHANGQING_URLS[source]
  if (!template) return Promise.reject(new Error('长青SVIP: 不支持该平台'))
  var level = qualityToLevel(quality)
  var url = template.replace('{id}', encodeURIComponent(String(songId))).replace('{level}', encodeURIComponent(level))
  return Promise.resolve(url)
}

// 念心SVIP - kw (从混淆代码提取的真实URL)
var NIANXIN_URLS = {
  kw: _dec('nianxin_kw') + '?id={id}&level={level}&type=mp3',
}
const fetchNianxin = function(source, musicInfo, quality) {
  var songId = getPlatformSongId(source, musicInfo)
  if (!songId) return Promise.reject(new Error('念心SVIP: 歌曲ID不存在'))
  var template = NIANXIN_URLS[source]
  if (!template) return Promise.reject(new Error('念心SVIP: 不支持该平台'))
  var level = qualityToLevel(quality)
  var url = template.replace('{id}', encodeURIComponent(String(songId))).replace('{level}', encodeURIComponent(level))
  return Promise.resolve(url)
}

// 念心KG接口 - kg (music.nxinxz.com/kgqq/kg.php)
var NIANXIN_KG_URL = _dec('nianxin_kg')
var fetchNianxinKg = function(source, musicInfo, quality) {
  if (source !== 'kg') return Promise.reject(new Error('念心KG: 仅支持 kg'))
  var songId = getPlatformSongId('kg', musicInfo)
  if (!songId) return Promise.reject(new Error('念心KG: 歌曲ID不存在'))
  var level = qualityToLevel(quality)
  var url = NIANXIN_KG_URL + '?id=' + encodeURIComponent(String(songId)) + '&level=' + level + '&type=mp3'
  return httpRequest(url, { method: 'GET' }).then(function(body) {
    if (body && body.code === 200 && body.url && isValidUrl(body.url)) return body.url.trim()
    throw new Error('念心KG: ' + (body && body.msg ? body.msg : '未返回有效链接'))
  })
}

// chksz - wy
const fetchChksz = function(source, musicInfo, quality) {
  if (source !== 'wy') return Promise.reject(new Error('chksz 仅支持 wy'))
  var songId = getSongId(musicInfo)
  if (!songId) return Promise.reject(new Error('chksz: 歌曲ID不存在'))
  var levelMap = { '128k': 'standard', '320k': 'exhigh', 'flac': 'lossless', 'flac24bit': 'jymaster', 'jyeffect': 'jyeffect', 'sky': 'sky', 'jymaster': 'jymaster', 'dolby': 'dolby', 'atmos': 'dolby', 'atmos_plus': 'dolby', 'master': 'jymaster' }
  var level = levelMap[quality] || 'standard'
  return httpRequest(_dec('chksz') + '/163_music?id=' + songId + '&level=' + level, {
    method: 'GET',
    headers: { 'Referer': 'https://cp.chksz.top/' },
  }).then(function(body) {
    if (body && body.code === 200 && body.data && body.data.url) return body.data.url
    throw new Error('chksz 获取失败')
  })
}

// 溯音QQ接口 - tx (oiapi.net/api/QQ_Music)
var SUYIN_QQ_URL = _dec('suyin_qq')
var SUYIN_BR_MAP = { '128k': 7, '320k': 5, 'flac': 4, 'flac24bit': 3, 'dolby': 2, 'atmos': 2, 'atmos_plus': 2, 'master': 1 }

var fetchSuyinQq = function(source, musicInfo, quality) {
  if (source !== 'tx') return Promise.reject(new Error('溯音QQ: 仅支持 tx'))
  var songmid = getPlatformSongId('tx', musicInfo)
  if (!songmid) return Promise.reject(new Error('溯音QQ: 歌曲ID不存在'))
  var br = SUYIN_BR_MAP[quality] || 5
  return httpRequest(SUYIN_QQ_URL + '?mid=' + encodeURIComponent(String(songmid)) + '&br=' + br + '&type=json&n=1', {
    method: 'GET',
  }).then(function(body) {
    if (body) {
      if (body.music && isValidUrl(body.music)) return body.music
      if (body.url && isValidUrl(body.url)) return body.url
    }
    throw new Error('溯音QQ: 未返回有效链接')
  })
}

// cenguigui - kw
const fetchCenguigui = function(source, musicInfo, quality) {
  if (source !== 'kw') return Promise.reject(new Error('cenguigui 仅支持 kw'))
  var songId = getSongId(musicInfo)
  if (!songId) return Promise.reject(new Error('cenguigui: 歌曲ID不存在'))
  var levelMap = { '128k': '128k', '320k': '320k', 'flac': 'lossless', 'flac24bit': 'lossless', 'atmos': 'lossless', 'atmos_plus': 'lossless', 'master': 'lossless' }
  var level = levelMap[quality] || '320k'
  return httpRequest(_dec('cenguigui') + '?id=' + songId + '&type=song&format=json&level=' + level, {
    method: 'GET',
  }).then(function(body) {
    var realUrl
    if (body) {
      if (body.data && body.data.url) realUrl = body.data.url
      else if (body.url) realUrl = body.url
    }
    if (isValidUrl(realUrl)) return realUrl
    throw new Error('cenguigui 获取失败')
  })
}

// QQ音乐直连vkey - tx (直接调用QQ音乐官方vkey接口，响应最快~0.13s)
// 支持dolby全景声音质
var QQ_VKEY_URL = _dec('qq_vkey')
var QQ_CDN_URL = _dec('qq_cdn')
var QQ_VKEY_GUID = '10000'

var _qqVkeyRequest = function(filename, songmid) {
  var payload = {
    comm: { ct: 19, cv: 0, guid: QQ_VKEY_GUID, tmeAppID: 'qqmusic', qq: '0' },
    hot: {
      method: 'CgiGetHotVkey',
      module: 'music.vkey.GetEVkey',
      param: { filename: [filename], songmid: [String(songmid)] }
    }
  }
  return httpRequest(QQ_VKEY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(function(body) {
    if (body && body.code === 0 && body.hot && body.hot.code === 0 &&
        body.hot.data && body.hot.data.urls && body.hot.data.urls.length > 0) {
      var purl = body.hot.data.urls[0].purl
      if (purl) {
        var fullUrl = QQ_CDN_URL + purl
        if (isValidUrl(fullUrl)) return fullUrl
      }
    }
    return null
  })
}

var fetchQqVkey = function(source, musicInfo, quality) {
  if (source !== 'tx') return Promise.reject(new Error('QQ音乐直连 仅支持 tx'))
  var songmid = musicInfo.songmid || musicInfo.strMediaMid || musicInfo.id || ''
  var mediaMid = musicInfo.strMediaMid || songmid
  if (!songmid) return Promise.reject(new Error('QQ音乐直连: 歌曲ID不存在'))
  // 音质格式映射，按优先级尝试
  // QQ音乐CDN前缀: C400=128k, M800=320k, F000=FLAC, D000=HiRes, Q000=全景声, A000=臻品母带
  var formatMap = {
    '128k': [{ prefix: 'C400', ext: 'm4a' }],
    '320k': [{ prefix: 'M800', ext: 'mp3' }, { prefix: 'C400', ext: 'm4a' }],
    'flac': [{ prefix: 'F000', ext: 'flac' }, { prefix: 'M800', ext: 'mp3' }],
    'flac24bit': [{ prefix: 'D000', ext: 'flac' }, { prefix: 'F000', ext: 'flac' }, { prefix: 'M800', ext: 'mp3' }],
    'dolby': [{ prefix: 'Q000', ext: 'm4a' }, { prefix: 'F000', ext: 'flac' }, { prefix: 'M800', ext: 'mp3' }],
    'atmos': [{ prefix: 'Q000', ext: 'm4a' }, { prefix: 'F000', ext: 'flac' }, { prefix: 'M800', ext: 'mp3' }],
    'atmos_plus': [{ prefix: 'Q000', ext: 'm4a' }, { prefix: 'F000', ext: 'flac' }, { prefix: 'M800', ext: 'mp3' }],
    'master': [{ prefix: 'A000', ext: 'flac' }, { prefix: 'F000', ext: 'flac' }, { prefix: 'M800', ext: 'mp3' }]
  }
  var formats = formatMap[quality] || formatMap['320k']
  // 依次尝试不同格式，第一个成功即返回
  var tryFormat = function(index) {
    if (index >= formats.length) {
      return Promise.reject(new Error('QQ音乐直连: 未返回有效链接'))
    }
    var fmt = formats[index]
    var filename = fmt.prefix + mediaMid + '.' + fmt.ext
    return _qqVkeyRequest(filename, songmid).then(function(url) {
      if (url) return url
      return tryFormat(index + 1)
    })
  }
  return tryFormat(0)
}

// 玉宁熙tx主接口 - tx (api-v2.yuafeng.cn, 带APIKEY)
var YNX_TX_URL = _dec('ynx_tx')
var YNX_TX2_URL = _dec('ynx_tx2')
var YNX_APIKEY = _dec('ynx_apikey')

// 校验玉宁熙返回的URL是否匹配请求的音质，避免音质降级
var _checkYnxQuality = function(quality, url) {
  if (!url) return false
  var q = String(quality || '128k').toLowerCase()
  // 128k 不降级检查
  if (q === '128k') return true
  // 320k 不应返回 C400（128k m4a）
  if (q === '320k' || q === '192k') {
    return url.indexOf('C400') === -1
  }
  // 无损/全景声应包含 flac 或高品质标识，避免 C400
  if (q === 'flac' || q === 'flac24bit' || q === 'dolby') {
    return url.indexOf('C400') === -1
  }
  return true
}

var fetchYnxTx = function(source, musicInfo, quality) {
  if (source !== 'tx') return Promise.reject(new Error('玉宁熙 仅支持 tx'))
  var songmid = getPlatformSongId('tx', musicInfo)
  if (!songmid) return Promise.reject(new Error('玉宁熙: 歌曲ID不存在'))
  // 音质映射为中文type参数
  // 臻品母带=master, 臻品全景声=atmos/dolby, SQ无损=flac, HQ高品质=320k, 低品质=128k
  var typeMap = { '128k': '低品质', '320k': 'HQ高品质', 'flac': 'SQ无损', 'flac24bit': '臻品全景声', 'dolby': '臻品全景声', 'atmos': '臻品全景声', 'atmos_plus': '臻品全景声', 'master': '臻品母带' }
  var type = encodeURIComponent(typeMap[quality] || 'HQ高品质')
  // 主接口: api-v2.yuafeng.cn
  return httpRequest(YNX_TX_URL + '?type=' + type + '&mid=' + encodeURIComponent(String(songmid)) + '&apikey=' + YNX_APIKEY, {
    method: 'GET',
  }).then(function(body) {
    if (body && body.code === 0 && body.data && body.data.music) {
      var musicUrl = body.data.music
      if (isValidUrl(musicUrl)) {
        if (_checkYnxQuality(quality, musicUrl)) return musicUrl
        throw new Error('玉宁熙: 音质降级')
      }
    }
    // 主接口失败，尝试次接口
    return httpRequest(YNX_TX2_URL + '?mid=' + encodeURIComponent(String(songmid)), {
      method: 'GET',
    }).then(function(body2) {
      if (body2) {
        // 按音质依次尝试字段
        var fields = ['song_play_url_hq', 'song_play_url_standard', 'song_play_url']
        if (quality === 'flac' || quality === 'flac24bit') {
          fields = ['song_play_url_pq', 'song_play_url_sq', 'song_play_url_hq', 'song_play_url_standard', 'song_play_url']
        } else if (quality === '128k') {
          fields = ['song_play_url_standard', 'song_play_url', 'song_play_url_fq']
        }
        for (var i = 0; i < fields.length; i++) {
          var url = body2[fields[i]]
          if (url && isValidUrl(url)) {
            if (_checkYnxQuality(quality, url)) return url
          }
        }
      }
      throw new Error('玉宁熙: 未返回有效链接')
    })
  })
}

// ========== 星海音乐源后端 - 多平台支持 (tx/kg/kw/wy/mg) ==========
// 使用 yy.zddyr.top 后端，支持全平台高品质音源
var XINGHAI_SOURCE_MAP = { 'tx': 'qq', 'kg': 'kg', 'kw': 'kw', 'wy': 'netease', 'mg': 'migu' }
var XINGHAI_URL = _dec('xinghai')

var fetchXinghai = function(source, musicInfo, quality) {
  var xhSource = XINGHAI_SOURCE_MAP[source]
  if (!xhSource) return Promise.reject(new Error('星海音乐源: 不支持该平台'))
  var songId = source === 'kg' ? (musicInfo.hash || musicInfo.songmid || musicInfo.id || '') : getPlatformSongId(source, musicInfo)
  if (!songId) return Promise.reject(new Error('星海音乐源: 歌曲ID不存在'))
  var params = 'source=' + encodeURIComponent(xhSource) + '&songmid=' + encodeURIComponent(String(songId)) + '&quality=' + encodeURIComponent(quality || '320k')
  // 酷狗额外参数
  if (source === 'kg') {
    if (musicInfo.hash) params += '&hash=' + encodeURIComponent(String(musicInfo.hash))
    if (musicInfo.albumId) params += '&albumId=' + encodeURIComponent(String(musicInfo.albumId))
  }
  // 网易云额外参数
  if (source === 'wy') {
    if (musicInfo.name) params += '&name=' + encodeURIComponent(String(musicInfo.name))
    if (musicInfo.singer) params += '&singer=' + encodeURIComponent(String(musicInfo.singer))
  }
  return httpRequest(XINGHAI_URL + '?' + params, { method: 'GET', timeout: 8000 }).then(function(body) {
    if (body && body.code === 200 && body.url && isValidUrl(body.url)) return body.url
    throw new Error('星海音乐源: ' + (body && body.msg ? body.msg : '获取失败'))
  })
}

// ========== 聚合API - 多平台支持 (tx/kg/kw/wy/mg) ==========
// 使用 api.music.lerd.dpdns.org 后端，POST请求获取音乐链接
var JUHE_URL = _dec('juhe')

var fetchJuhe = function(source, musicInfo, quality) {
  if (!JUHE_URL) return Promise.reject(new Error('聚合API: 配置错误'))
  // 构建请求体
  var reqBody = { musicInfo: musicInfo, type: quality || '320k' }
  return httpRequest(JUHE_URL + '/' + source, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reqBody),
    timeout: 8000
  }).then(function(body) {
    if (body && body.code === 200 && body.data && body.data.url && isValidUrl(body.data.url)) return body.data.url
    throw new Error('聚合API: ' + (body && body.msg ? body.msg : '获取失败'))
  })
}

// ========== Migu直接源 - mg ==========
var fetchMigudirect = function(source, musicInfo, quality) {
  if (source !== 'mg') return Promise.reject(new Error('Migu直接源: 仅支持 mg'))
  var songId = getPlatformSongId('mg', musicInfo)
  if (!songId) return Promise.reject(new Error('Migu直接源: 歌曲ID不存在'))
  var level = qualityToLevel(quality)
  return httpRequest(_dec('migudirect') + '?copyrightId=' + encodeURIComponent(String(songId)) + '&level=' + level, {
    method: 'GET', timeout: 8000
  }).then(function(body) {
    var url
    if (body) {
      if (body.data && body.data.playUrl) url = body.data.playUrl
      else if (body.url) url = body.url
      else if (body.playUrl) url = body.playUrl
    }
    if (isValidUrl(url)) return url
    throw new Error('Migu直接源: 未返回有效链接')
  })
}

// ========== Migu API - mg ==========
var fetchMiguapi = function(source, musicInfo, quality) {
  if (source !== 'mg') return Promise.reject(new Error('Migu API: 仅支持 mg'))
  var songId = getPlatformSongId('mg', musicInfo)
  if (!songId) return Promise.reject(new Error('Migu API: 歌曲ID不存在'))
  var levelMap = { '128k': 'PQ', '320k': 'HQ', 'flac': 'SQ', 'flac24bit': 'ZQ', 'atmos': 'ZQ', 'atmos_plus': 'ZQ', 'master': 'ZQ' }
  var level = levelMap[quality] || 'HQ'
  return httpRequest(_dec('miguapi') + '?copyrightId=' + encodeURIComponent(String(songId)) + '&quality=' + level, {
    method: 'GET', timeout: 8000
  }).then(function(body) {
    var url
    if (body) {
      if (body.data && body.data.url) url = body.data.url
      else if (body.url) url = body.url
      else if (body.data && body.data.playUrl) url = body.data.playUrl
    }
    if (isValidUrl(url)) return url
    throw new Error('Migu API: 未返回有效链接')
  })
}

// ========== 2bi咪咕点歌 - mg ==========
// 按歌名搜索的咪咕源，token 已内置（混淆存储）
var fetchTwobi = function(source, musicInfo, quality) {
  if (source !== 'mg') return Promise.reject(new Error('2bi点歌: 仅支持 mg'))
  var keyword = buildSearchKeyword(musicInfo)
  if (!keyword) return Promise.reject(new Error('2bi点歌: 歌曲名称不存在'))
  var token = _dec('twobi_token')
  var url = _dec('twobi_mg') + '&token=' + encodeURIComponent(token) +
    '&gm=' + encodeURIComponent(keyword) + '&type=json&n=1'
  return httpRequest(url, { method: 'GET', timeout: 8000 }).then(function(body) {
    var url
    if (body) {
      if (body.code === 200) {
        if (body.music_url) url = body.music_url
        else if (body.data && body.data.music_url) url = body.data.music_url
        else if (body.url) url = body.url
      } else {
        var msg = body.msg || body.message || ('HTTP ' + body.code)
        throw new Error('2bi点歌: ' + msg)
      }
    }
    if (isValidUrl(url)) return url
    throw new Error('2bi点歌: 未返回有效链接')
  })
}

// ========== 云村点歌 - wy ==========
// 按歌名搜索的网易源，ckey 已内置（混淆存储）
// 音质映射：网易 quality → 接口 br 参数（1=标准,2=较高,3=极高,4=无损,5=Hi-Res,6=高清环绕,7=沉浸环绕,8=超清母带）
var fetchYundiancun = function(source, musicInfo, quality) {
  if (source !== 'wy') return Promise.reject(new Error('云村点歌: 仅支持 wy'))
  var keyword = buildSearchKeyword(musicInfo)
  if (!keyword) return Promise.reject(new Error('云村点歌: 歌曲名称不存在'))
  var brMap = { '128k': '1', '320k': '2', 'flac': '4', 'flac24bit': '5', 'jymaster': '8', 'jyeffect': '8', 'sky': '8', 'dolby': '6', 'atmos': '6', 'atmos_plus': '7', 'master': '8' }
  var br = brMap[quality] || '1'
  var ckey = _dec('yundiancun_ckey')
  var url = _dec('yundiancun_url') + '?ckey=' + encodeURIComponent(ckey) +
    '&msg=' + encodeURIComponent(keyword) + '&n=1&br=' + br + '&type=json'
  return httpRequest(url, { method: 'GET', timeout: 8000 }).then(function(body) {
    var url
    if (body) {
      if (body.status === 200 || body.code === 200) {
        if (body.url) url = body.url
        else if (body.data && body.data.url) url = body.data.url
      } else {
        var msg = body.msg || body.message || ('status ' + (body.status || body.code))
        throw new Error('云村点歌: ' + msg)
      }
    }
    if (isValidUrl(url)) return url
    throw new Error('云村点歌: 未返回有效链接')
  })
}

// ========== gdstudio - 多平台 (tx/wy/mg) ==========
var GDSTUDIO_SOURCE_MAP = { 'tx': 'qq', 'wy': '163', 'mg': 'migu' }
var fetchGdstudio = function(source, musicInfo, quality) {
  var urlKey = 'gdstudio_' + source
  var baseUrl = _dec(urlKey)
  if (!baseUrl) return Promise.reject(new Error('gdstudio: 不支持该平台'))
  var songId = getPlatformSongId(source, musicInfo)
  if (!songId) return Promise.reject(new Error('gdstudio: 歌曲ID不存在'))
  var level = qualityToLevel(quality)
  return httpRequest(baseUrl + '?id=' + encodeURIComponent(String(songId)) + '&level=' + level, {
    method: 'GET', timeout: 8000
  }).then(function(body) {
    var url
    if (body) {
      if (body.code === 200 && body.data && body.data.url) url = body.data.url
      else if (body.url) url = body.url
      else if (body.data && body.data.playUrl) url = body.data.playUrl
    }
    if (isValidUrl(url)) return url
    throw new Error('gdstudio: 未返回有效链接')
  })
}

// ========== 星海后端 - 多平台 (tx/mg) ==========
var fetchXhbackend = function(source, musicInfo, quality) {
  var urlKey = 'xhbackend_' + source
  var baseUrl = _dec(urlKey)
  if (!baseUrl) return Promise.reject(new Error('星海后端: 不支持该平台'))
  var songId = getPlatformSongId(source, musicInfo)
  if (!songId) return Promise.reject(new Error('星海后端: 歌曲ID不存在'))
  var level = qualityToLevel(quality)
  return httpRequest(baseUrl + '?id=' + encodeURIComponent(String(songId)) + '&quality=' + level, {
    method: 'GET', timeout: 8000
  }).then(function(body) {
    var url
    if (body) {
      if (body.code === 200 && body.url) url = body.url
      else if (body.data && body.data.url) url = body.data.url
    }
    if (isValidUrl(url)) return url
    throw new Error('星海后端: 未返回有效链接')
  })
}

// ========== 星海后端2 - mg (旧版 cdyzr.dpdns.org，需 name+singer+songmid+quality) ==========
var fetchXhbackendLegacy = function(source, musicInfo, quality) {
  if (source !== 'mg') return Promise.reject(new Error('星海后端2: 仅支持 mg'))
  var songId = getPlatformSongId('mg', musicInfo)
  var name = musicInfo.name || musicInfo.songName || ''
  var singer = musicInfo.singer || musicInfo.artist || ''
  // 该接口要求提供 name 和 songmid 参数，二者缺失则拒绝（避免 410）
  if (!name || !songId) return Promise.reject(new Error('星海后端2: 缺少歌名或歌曲ID'))
  var params = 'version=3.2.7&source=migu'
    + '&name=' + encodeURIComponent(name)
    + '&singer=' + encodeURIComponent(singer)
    + '&songmid=' + encodeURIComponent(String(songId))
    + '&quality=' + encodeURIComponent(quality || '320k')
  return httpRequest(_dec('xhbackend_legacy') + '?' + params, {
    method: 'GET', timeout: 8000
  }).then(function(body) {
    if (body && body.code === 200 && body.url && isValidUrl(body.url)) return body.url
    if (body && body.msg) throw new Error('星海后端2: ' + body.msg)
    throw new Error('星海后端2: 未返回有效链接')
  })
}

// ========== HUIBQ - tx ==========
var fetchHuibq = function(source, musicInfo, quality) {
  if (source !== 'tx') return Promise.reject(new Error('HUIBQ 仅支持 tx'))
  var songmid = getPlatformSongId('tx', musicInfo)
  if (!songmid) return Promise.reject(new Error('HUIBQ: 歌曲ID不存在'))
  var levelMap = { '128k': 'standard', '320k': 'exhigh', 'flac': 'lossless', 'flac24bit': 'hires', 'dolby': 'dolby', 'atmos': 'dolby', 'atmos_plus': 'dolby', 'master': 'master' }
  var level = levelMap[quality] || 'exhigh'
  return httpRequest(_dec('huibq') + '?mid=' + encodeURIComponent(String(songmid)) + '&level=' + level, {
    method: 'GET', timeout: 8000
  }).then(function(body) {
    var url
    if (body) {
      if (body.code === 200 && body.data && body.data.url) url = body.data.url
      else if (body.url) url = body.url
    }
    if (isValidUrl(url)) return url
    throw new Error('HUIBQ: 未返回有效链接')
  })
}

// ========== 念心TX - tx ==========
var fetchNianxinTx = function(source, musicInfo, quality) {
  if (source !== 'tx') return Promise.reject(new Error('念心TX: 仅支持 tx'))
  var songmid = getPlatformSongId('tx', musicInfo)
  if (!songmid) return Promise.reject(new Error('念心TX: 歌曲ID不存在'))
  var level = qualityToLevel(quality)
  return httpRequest(_dec('nianxin_tx') + '?id=' + encodeURIComponent(String(songmid)) + '&level=' + level + '&type=mp3', {
    method: 'GET', timeout: 8000
  }).then(function(body) {
    if (body && body.code === 200 && body.url && isValidUrl(body.url)) return body.url.trim()
    throw new Error('念心TX: ' + (body && body.msg ? body.msg : '未返回有效链接'))
  })
}

// ========== 念心wy - wy ==========
var fetchNianxinWy = function(source, musicInfo, quality) {
  if (source !== 'wy') return Promise.reject(new Error('念心wy: 仅支持 wy'))
  var songId = getSongId(musicInfo)
  if (!songId) return Promise.reject(new Error('念心wy: 歌曲ID不存在'))
  var levelMap = { '128k': 'standard', '320k': 'exhigh', 'flac': 'lossless', 'flac24bit': 'jymaster', 'jyeffect': 'jyeffect', 'sky': 'sky', 'jymaster': 'jymaster', 'dolby': 'dolby', 'atmos': 'dolby', 'atmos_plus': 'dolby', 'master': 'jymaster' }
  var level = levelMap[quality] || 'standard'
  return httpRequest(_dec('nianxin_wy') + '?id=' + encodeURIComponent(String(songId)) + '&level=' + level + '&type=mp3', {
    method: 'GET', timeout: 8000
  }).then(function(body) {
    if (body && body.code === 200 && body.url && isValidUrl(body.url)) return body.url.trim()
    throw new Error('念心wy: ' + (body && body.msg ? body.msg : '未返回有效链接'))
  })
}

// ========== 聆澜 - 多平台 (tx/wy) ==========
var LINGLAN_PLATFORM_KEY = { 'tx': 'linglan_tx', 'wy': 'linglan_wy' }
var LINGLAN_PLATFORM_MAP = { 'tx': 'qq', 'wy': '163' }
var fetchLinglan = function(source, musicInfo, quality) {
  var urlKey = LINGLAN_PLATFORM_KEY[source]
  if (!urlKey) return Promise.reject(new Error('聆澜: 不支持该平台'))
  var baseUrl = _dec(urlKey)
  var songId = getPlatformSongId(source, musicInfo)
  if (!songId) return Promise.reject(new Error('聆澜: 歌曲ID不存在'))
  var level = qualityToLevel(quality)
  return httpRequest(baseUrl + '?id=' + encodeURIComponent(String(songId)) + '&quality=' + level, {
    method: 'GET', timeout: 8000
  }).then(function(body) {
    var url
    if (body) {
      if (body.code === 200 && body.data && body.data.url) url = body.data.url
      else if (body.url) url = body.url
    }
    if (isValidUrl(url)) return url
    throw new Error('聆澜: 未返回有效链接')
  })
}

// ========== API 源列表 ==========
// txTier: TX平台专用分层竞速优先级，1=优先层（真实音质、响应快），2=备用层
const API_SOURCES = [
  // 公网源
  { name: '玉宁熙',       fetch: fetchYnxTx,       sources: ['tx'], txTier: 2 },
  { name: '长青SVIP',     fetch: fetchChangqing,   sources: ['kw', 'kg'] },
  { name: '念心SVIP',     fetch: fetchNianxin,     sources: ['kw'] },
  { name: '念心KG',       fetch: fetchNianxinKg,   sources: ['kg'] },
  { name: 'cenguigui',    fetch: fetchCenguigui,   sources: ['kw'] },
  { name: 'chksz',        fetch: fetchChksz,       sources: ['wy'] },
  // v1.1.7 新增源
  { name: 'QQ音乐直连',   fetch: fetchQqVkey,      sources: ['tx'], txTier: 1 },
  { name: '溯音QQ',       fetch: fetchSuyinQq,     sources: ['tx'], txTier: 2 },
  // v1.2.0 新增源 - 星海后端 & 聚合API
  { name: '星海音乐源',   fetch: fetchXinghai,     sources: ['tx', 'kg', 'kw', 'wy', 'mg'], txTier: 2 },
  { name: '聚合API',      fetch: fetchJuhe,        sources: ['tx', 'kg', 'kw', 'wy', 'mg'], txTier: 2 },
  // v1.2.4 新增源（补全接口管理，与统计数据对齐）
  { name: 'Migu直接源',   fetch: fetchMigudirect,  sources: ['mg'] },
  { name: 'Migu API',     fetch: fetchMiguapi,     sources: ['mg'] },
  { name: 'gdstudio',     fetch: fetchGdstudio,    sources: ['tx', 'wy', 'mg'], txTier: 2 },
  { name: '星海后端',     fetch: fetchXhbackend,   sources: ['tx', 'mg'], txTier: 2 },
  { name: 'HUIBQ',        fetch: fetchHuibq,       sources: ['tx'], txTier: 2 },
  { name: '念心TX',       fetch: fetchNianxinTx,   sources: ['tx'], txTier: 2 },
  { name: '念心wy',       fetch: fetchNianxinWy,   sources: ['wy'] },
  { name: '聆澜',         fetch: fetchLinglan,     sources: ['tx', 'wy'], txTier: 2 },
  // v1.3.0 新增源 — 2bi咪咕点歌（按歌名搜索，需 token）
  { name: '2bi点歌',      fetch: fetchTwobi,       sources: ['mg'] },
  { name: '星海后端2',    fetch: fetchXhbackendLegacy, sources: ['mg'] },
  // v1.3.1 新增源 — 云村点歌（网易，按歌名搜索，ckey 内置）
  { name: '云村点歌',     fetch: fetchYundiancun,  sources: ['wy'] },
]

// ========== 核心逻辑：并发竞速策略 ==========
// 对同一平台的所有可用源同时发起请求，取最快返回的有效URL
// 每个源设置4秒超时，避免慢速API阻塞；任一成功即返回
var RACE_TIMEOUT = 4000

// 启动单个候选源的请求（带超时、统计上报、错误收集）
// 返回值不直接使用，通过 onResult/onError 回调通知调用方
var _launchCandidate = function(apiSource, source, musicInfo, quality, requestId, onResult, onError) {
  var t0 = Date.now()
  return fetchWithTimeout(apiSource.fetch(source, musicInfo, quality), RACE_TIMEOUT).then(function(url) {
    var elapsed = Date.now() - t0
    if (url && isValidUrl(url)) {
      _reportStat(source, apiSource.name, true, elapsed, requestId, quality)
      onResult(url)
    } else {
      _reportStat(source, apiSource.name, false, elapsed, requestId, quality)
      onError(apiSource.name + ': 无效URL')
    }
  }).catch(function(e) {
    var elapsed = Date.now() - t0
    _reportStat(source, apiSource.name, false, elapsed, requestId, quality)
    onError(apiSource.name + ': ' + (e && e.message ? e.message : String(e)))
  })
}

// 并发竞速：所有候选源同时请求，任一成功即返回
var raceSources = function(candidates, source, musicInfo, quality, requestId) {
  if (candidates.length === 0) {
    return Promise.reject(new Error('无可用源'))
  }
  // 单源直接返回（带超时）
  if (candidates.length === 1) {
    return new Promise(function(resolve, reject) {
      _launchCandidate(candidates[0], source, musicInfo, quality, requestId,
        function(url) { resolve(url) },
        function(err) { reject(new Error(err)) }
      )
    })
  }
  // 多源并发竞速
  var errors = []
  var resolved = false
  return new Promise(function(resolve, reject) {
    var pending = candidates.length
    var onSettled = function() {
      pending--
      if (pending === 0 && !resolved) {
        // 只取前3条错误，避免错误信息过长
        var topErrors = errors.slice(0, 3)
        var msg = topErrors.length < errors.length
          ? '所有API源均失败:\n' + topErrors.join('\n') + '\n(共' + errors.length + '个源失败)'
          : '所有API源均失败:\n' + topErrors.join('\n')
        reject(new Error(msg))
      }
    }
    for (var i = 0; i < candidates.length; i++) {
      _launchCandidate(candidates[i], source, musicInfo, quality, requestId,
        function(url) {
          if (resolved) return
          resolved = true
          resolve(url)
        },
        function(err) {
          if (resolved) return
          errors.push(err)
          onSettled()
        }
      )
    }
  })
}

// TX 平台延迟并发：优先层立即启动，备用层延迟300ms加入竞速
// 优化：若优先层在300ms内全部失败，立即启动备用层，避免无谓等待
// 最坏情况（优先层慢但未超时）仅需 RACE_TIMEOUT + 少量延迟
var raceTxDelayed = function(tier1, tier2, source, musicInfo, quality, requestId) {
  if (tier1.length === 0 && tier2.length === 0) {
    return Promise.reject(new Error('无可用源'))
  }
  if (tier2.length === 0) return raceSources(tier1, source, musicInfo, quality, requestId)
  if (tier1.length === 0) return raceSources(tier2, source, musicInfo, quality, requestId)

  var errors = []
  var resolved = false
  var tier1Failed = 0
  var tier2Launched = false
  var pending = 0

  return new Promise(function(resolve, reject) {
    var onSettled = function() {
      pending--
      if (pending === 0 && !resolved) {
        var topErrors = errors.slice(0, 3)
        var msg = topErrors.length < errors.length
          ? '所有API源均失败:\n' + topErrors.join('\n') + '\n(共' + errors.length + '个源失败)'
          : '所有API源均失败:\n' + topErrors.join('\n')
        reject(new Error(msg))
      }
    }
    var launch = function(apiSource) {
      pending++
      _launchCandidate(apiSource, source, musicInfo, quality, requestId,
        function(url) {
          if (resolved) return
          resolved = true
          resolve(url)
        },
        function(err) {
          if (resolved) return
          errors.push(err)
          onSettled()
        }
      )
    }
    var launchTier2 = function() {
      if (tier2Launched || resolved) return
      tier2Launched = true
      for (var j = 0; j < tier2.length; j++) launch(tier2[j])
    }

    // 优先层立即启动
    for (var i = 0; i < tier1.length; i++) {
      (function(apiSource) {
        pending++
        var t0 = Date.now()
        fetchWithTimeout(apiSource.fetch(source, musicInfo, quality), RACE_TIMEOUT).then(function(url) {
          var elapsed = Date.now() - t0
          if (resolved) return
          if (url && isValidUrl(url)) {
            _reportStat(source, apiSource.name, true, elapsed, requestId, quality)
            resolved = true
            resolve(url)
          } else {
            _reportStat(source, apiSource.name, false, elapsed, requestId, quality)
            errors.push(apiSource.name + ': 无效URL')
            tier1Failed++
            // 优先层全部失败时立即启动备用层，不必等满300ms
            if (tier1Failed === tier1.length) launchTier2()
            onSettled()
          }
        }).catch(function(e) {
          var elapsed = Date.now() - t0
          if (resolved) return
          _reportStat(source, apiSource.name, false, elapsed, requestId, quality)
          errors.push(apiSource.name + ': ' + (e && e.message ? e.message : String(e)))
          tier1Failed++
          if (tier1Failed === tier1.length) launchTier2()
          onSettled()
        })
      })(tier1[i])
    }
    // 兜底：优先层未全部失败但延迟超过300ms时，也启动备用层加入竞速
    setTimeout(launchTier2, 300)
  })
}

const handleGetMusicUrl = function(source, musicInfo, quality) {
  // 检查音源是否被面板停用
  if (!_sourceEnabled) {
    return Promise.reject(new Error('音源已被管理员停用'))
  }
  // 筛选支持该平台的源，并根据面板配置过滤已禁用的接口（按平台分别控制）
  var candidates = []
  for (var i = 0; i < API_SOURCES.length; i++) {
    if (API_SOURCES[i].sources.indexOf(source) !== -1) {
      // 按平台维度判断该接口是否启用
      if (_isSourceEnabled(API_SOURCES[i].name, source)) {
        candidates.push(API_SOURCES[i])
      }
    }
  }
  if (candidates.length === 0) {
    return Promise.reject(new Error('无可用源支持平台: ' + source))
  }
  // 生成请求ID，用于聚合计算平台成功率
  var requestId = _generateRequestId()
  // TX 平台使用延迟并发：优先层立即启动，备用层延迟300ms加入
  // 优先层为真实音质源（HUIBQ、QQ音乐直连），备用层为玉宁熙
  if (source === 'tx') {
    var tier1 = []
    var tier2 = []
    for (var j = 0; j < candidates.length; j++) {
      if (candidates[j].txTier === 1) tier1.push(candidates[j])
      else tier2.push(candidates[j])
    }
    return raceTxDelayed(tier1, tier2, source, musicInfo, quality, requestId)
  }
  return raceSources(candidates, source, musicInfo, quality, requestId)
}

// ========== apis 对象（对齐官方示例结构）==========
const apis = {
  kw: {
    musicUrl(info) {
      return handleGetMusicUrl('kw', info.musicInfo, qualitys['kw'][info.type])
    },
  },
  kg: {
    musicUrl(info) {
      return handleGetMusicUrl('kg', info.musicInfo, qualitys['kg'][info.type])
    },
  },
  tx: {
    musicUrl(info) {
      return handleGetMusicUrl('tx', info.musicInfo, qualitys['tx'][info.type])
    },
  },
  wy: {
    musicUrl(info) {
      return handleGetMusicUrl('wy', info.musicInfo, qualitys['wy'][info.type])
    },
  },
  mg: {
    musicUrl(info) {
      return handleGetMusicUrl('mg', info.musicInfo, qualitys['mg'][info.type])
    },
  },
}

// 注册应用 API 请求事件
on(EVENT_NAMES.request, ({ source, action, info }) => {
  return apis[source][action](info)
})

// ========== 更新检查 ==========
// 脚本初始化时异步检查面板是否有新版本，若有则发送 updateAlert 事件
// 参考文档: https://lxmusic.toside.cn/mobile/custom-source
var SCRIPT_VERSION = 'v1.3.1'

var _compareVersion = function(v1, v2) {
  var a = String(v1).replace(/^v/i, '').split('.')
  var b = String(v2).replace(/^v/i, '').split('.')
  var len = Math.max(a.length, b.length)
  for (var i = 0; i < len; i++) {
    var na = parseInt(a[i] || '0', 10)
    var nb = parseInt(b[i] || '0', 10)
    if (na > nb) return 1
    if (na < nb) return -1
  }
  return 0
}

var _checkUpdate = function() {
  if (!PANEL_REPORT_URL) return
  // 从 report.php 地址推导出 api.php 地址
  // 携带 user_id 参数，面板会回显该用户在统计中的标识符，便于在更新弹窗中告知用户
  var apiUrl = PANEL_REPORT_URL.replace(/\/report\.php.*$/, '/api.php?action=check_update&user_id=' + encodeURIComponent(_userId))
  if (apiUrl === PANEL_REPORT_URL) return
  httpRequest(apiUrl, { method: 'GET', timeout: 5000 }).then(function(body) {
    if (!body) return
    var hasUpdate = body.version && _compareVersion(body.version, SCRIPT_VERSION) > 0
    var hasNotify = body.notify && body.notify.message
    // 管理员通过面板"发送用户ID"下发的一次性通知，单独弹窗或合并到更新弹窗
    if (hasNotify) {
      var notifyMsg = body.notify.message
      if (body.notify.user_id) notifyMsg += '\n\n你的用户ID: ' + body.notify.user_id
      if (hasUpdate) {
        var combined = (body.log || ('发现新版本 ' + body.version)) + '\n\n--- 管理员通知 ---\n' + notifyMsg
        if (body.user_id) combined += '\n\n你的用户ID: ' + body.user_id
        if (combined.length > 1024) combined = combined.substring(0, 1024)
        send(EVENT_NAMES.updateAlert, { log: combined, updateUrl: body.updateUrl || '' })
      } else {
        send(EVENT_NAMES.updateAlert, { log: notifyMsg, updateUrl: '' })
      }
      return
    }
    if (!hasUpdate) return
    var log = body.log || ('发现新版本 ' + body.version)
    // 若面板回显了 user_id，附加到更新日志末尾，便于用户在面板"用户使用情况"中定位自己
    if (body.user_id) {
      log += '\n\n你的用户ID: ' + body.user_id
    }
    // 洛雪 updateAlert 事件: log 最大1024字符，updateUrl 可选
    if (log.length > 1024) log = log.substring(0, 1024)
    // 使用面板中设置的更新链接，与用户填写的一致
    // 若未设置则只显示更新日志，不提供下载链接
    send(EVENT_NAMES.updateAlert, {
      log: log,
      updateUrl: body.updateUrl || ''
    })
  }).catch(function(e) {
    // 更新检查失败不影响正常使用
  })
}

// 脚本初始化完成后发送 inited 事件告知应用
// 同时异步检查更新和检测客户端IP
// 文档规范：inited 事件传入 { sources }，每个源需包含 name/type/actions/qualitys
// 注意：qualitys 数组需与 const qualitys 映射表的 key 保持一致
//       除文档中4个标准值外，dolby/atmos/master 等由 LX Music fork 的软件支持
// 注意：初始化事件被发送前，执行脚本的过程中出现任何错误将视为脚本初始化失败
_generateUserId()
_detectClientIp()
_checkUpdate()
_loadSourcesConfig()
send(EVENT_NAMES.inited, {
  sources: {
    kw: {
      name: '酷我音乐',
      type: 'music',
      actions: ['musicUrl'],
      qualitys: ['128k', '320k', 'flac', 'flac24bit'],
    },
    kg: {
      name: '酷狗音乐',
      type: 'music',
      actions: ['musicUrl'],
      qualitys: ['128k', '320k', 'flac', 'flac24bit'],
    },
    tx: {
      name: 'QQ音乐',
      type: 'music',
      actions: ['musicUrl'],
      qualitys: ['128k', '320k', 'flac', 'flac24bit', 'dolby', 'atmos', 'atmos_plus', 'master'],
    },
    wy: {
      name: '网易云音乐',
      type: 'music',
      actions: ['musicUrl'],
      qualitys: ['128k', '320k', 'flac', 'flac24bit', 'jyeffect', 'sky', 'jymaster', 'dolby', 'atmos', 'atmos_plus', 'master'],
    },
    mg: {
      name: '咪咕音乐',
      type: 'music',
      actions: ['musicUrl'],
      qualitys: ['128k', '320k', 'flac', 'flac24bit', 'atmos', 'atmos_plus', 'master'],
    },
  },
})
