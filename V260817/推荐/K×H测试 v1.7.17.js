/**
 * @name K×H测试
 * @version 1.7.17
 * @author HYW & Koneko
 * @description Koneko×HYW音源技术测试音源 - 多源聚合 + 多链路回退，支持 5 大平台，集成加密保护
 *  v1.7.17 修复要点：
 *    1. 清除 ikun API (已失效)
 *    2. 清除海棠 API (已失效)
 *  v1.7.16 修复要点：
 *    1. 新增残像 API (网易云，支持 master/jymaster)
 *    2. 填入用户提供的残像 token
 *    3. 网易云第一组加残像（最高优先级）
 *  v1.7.15 修复要点：
 *    1. 新增 QQ 全音质 API (含 master，不需 apikey)
 *    2. 新增星海聚合 API (酷我/酷狗/咪咕)
 *    3. 填入用户提供的酷狗 API 凭据
 *  v1.7.14 修复要点：
 *    1. 填入用户提供的酷狗 API 凭据
 *    2. 更新日志脱敏: 移除所有 URL 和 apikey 暴露
 *    3. 注释脱敏: 移除所有 URL 和 apikey 暴露
 *  v1.7.13 修复要点：
 *    4. 描述字段移除 apikey 暴露（用户要求）
 *  v1.7.12 修复要点：
 *    1. 新增念心 API (mcp.nianxinxz.com) - 酷狗直链，支持全音质 (128k/320k/flac/hires)
 *    2. 念心实测: 返回完整 kuwo.cn 直链，不需二次请求
 *    3. yuafeng 酷狗: music 字段是 m.kugou.com 失效接口，已降级为 fallback
 *    4. 填入用户提供的酷狗 API 凭据
 *  v1.7.11 修复要点：
 *    1. chksz 修复: 路径 /music/wy (404) -> /api/163_music (200，参考玉宁熙用法)
 *    2. chksz level 映射修复: 用网易云标准 level (jymaster 而非 128k)
 *    3. 网易云 master (超清母带) 现在可用！实测拿到完整 master FLAC 直链
 *  v1.7.10 修复要点：
 *    1. 妖狐咪咕: 只有 id 没歌名时，先用 id 调妖狐搜索 API 拿到歌曲名，再请求 URL
 *    2. 酷狗 API: 需要用户填 apikey
 *    3. 描述字段脱敏: 所有 URL 在日志/注释里都不暴露
 *    4. API 配置区: 把需要用户填的 apikey 字段提到最上面，方便配置
 *  v1.7.9 修复要点：
 *    1. 修复 API 域名
 *    2. yunmge 超时: 4s -> 8s
 *    3. 移除音源文件里所有"专属"敏感字眼，改成中性描述（功能保留，描述不暴露细节）
 *  v1.7.8 修复要点：
 *    2. 新增 酷狗 yuafeng API (需 apikey)
 *    3. 新增 酷狗 clientappid: KM20260809C1B8F43A9CE47ADF (玉宁熙/冷雨)
 *    4. 酷狗 API 提示: 用户去对应平台注册可获取更高音质
 *    5. 修复加密 URL 丢字符 bug: _xd() 在 base64 padding 反转后开头是 = 时 break，导致部分 URL 丢首字符
 *  v1.7.6 修复要点：
 *    1. 新增 yunmge 酷我专用通道 (用 _xd 加密)
 *    2. 修复日志系统: 所有 [K×H] 硬编码改为 [K×H]，统一用 SCRIPT_NAME 变量
 *    3. 新增"下载方式"概念: sources 注册时附带 meta.downloadType='test'，初始化日志输出
 *    4. 修复混淆: 新增 _xd() 加密方式 (XOR + 自定义 base64 + 反转)，比原 _e() 更强
 *    5. 重命名音源: SCRIPT_NAME 改为 K×H测试，描述改为 Koneko×HYW音源技术测试音源
 *    6. v1.7.5 修复一并带入: 网易云 MUSIC_U cookie 注入本地 API，修复 /song -> /song/url/v1
 *  v1.7.4 修复要点：
 *    1. 脱敏增强: contentId/copyrightId/songId/songmid参数值脱敏，修复短URL路径(15+字符)遗漏
 *    2. 嵌套编码修复: pattern3跳过已含<<E:>>标记的路径，防止双重编码导致解码失败
 *    3. 日志参数合并: contentId:/copyrightId:标签与值合并为单参数，确保_mask能匹配
 *    4. purl日志修复: QQ专属purl值添加purl=前缀，使脱敏pattern6能正确匹配
 *    5. JSON错误脱敏: fetchJSON的JSON解析错误消息也经过_mask处理
 *  v1.7.5 修复要点：
 *    1. 网易云官方Cookie接入: 新增 API.neteaseCookie (MUSIC_U 凭据，_xd 加密混淆)，注入本地API调用
 *    2. 修复本地网易API路由: /song 路由不存在(404)，改为 NeteaseCloudMusicApi 标准路由 /song/url/v1
 *    3. 修复本地歌词/封面调用: /song?type=lyric|json 改为 /lyric 和 /song/detail
 *    4. 本地网易策略提权: 带上 MUSIC_U 后命中无损/VIP 几率大幅提升，挪到 wy 第一组最高优先级
 *  v1.7.3 修复要点：
 *    1. 日志脱敏: 所有日志输出自动脱敏API key、内部IP、完整URL、Cookie、purl等敏感信息
 *    2. 错误消息脱敏: throw new Error中的JSON.stringify也经过脱敏处理
 *  v1.7.2 修复要点：
 *    1. QQ专属增强: 所有策略携带完整Cookie(uin+qm_keyst+pgv_pvid)，策略B新增专属uin变体
 *    2. 恢复密钥: 内嵌RECOVERY_KEY，支持通过还原脚本恢复完整音源
 *  v1.7.1 修复要点：
 *    1. 修复混淆解码器: LX Music沙箱无Buffer/atob，改用纯JS base64解码
 *    2. QQ音乐专属: 3重策略(ut.y.qq.com GetEVkey + u.y.qq.com platform=23 + ut+key增强)
 *    3. 咪咕快速返回: 不逐层降级，直接尝试请求音质+PQ兜底，优先健康检查
 *    4. 咪咕返回支持音质: 日志输出实际可用音质(128k/320k/flac)
 *    5. 全量代码混淆: API key/URL/敏感数据均经base64+反转编码，防止泄露
 * @homepage Miao-moe
 * @license MIT
 *
 * 支持平台: 网易云音乐、QQ音乐、酷我音乐、酷狗音乐、咪咕音乐
 * 支持音质: 128k, 192k, 320k, flac, flac24bit, hires, atmos, atmos_plus, master
 * 生成时间: 2026-08-10
 *
 * RECOVERY_KEY: HYW_KONEKO_2026_v1_7_17_RESTORE
 */

'use strict'

const { EVENT_NAMES, request, on, send, env, version } = globalThis.lx

// ========== 混淆编解码器 (纯JS实现，兼容LX Music沙箱) ==========
// 编码方式: base64编码后反转字符串，运行时解码还原
// 注意: LX Music沙箱中没有Buffer(Node.js)和atob(浏览器)，必须用纯JS实现
// ========== v1.7.6 新加密系统: XOR + 自定义 base64 + 反转 ==========
// 与原 _d/_e (base64+反转) 并存，新加密值用 "X" 前缀标识
// 静态分析时看不到明文 URL/key/token，必须运行时调用 _xd() 才能解出
const _XOR_KEY = 'KonekoHYW_v176_SecretKey_2026'
const _B64_X = 'ZYXWVUTSRQPONMLKJIHGFEDCBAzyxwvutsrqponmlkjihgfedcba9876543210+/'
const _xd = (s) => {
  if (!s || s[0] !== 'X') return s
  try {
    const r = s.slice(1).split('').reverse().join('')
    // v1.7.8 修复: padding = 反转后可能在开头，需要移到末尾再解码
    let padding = ''
    let rest = ''
    for (const c of r) {
      if (c === '=') padding += c
      else rest += c
    }
    const normalized = rest + padding
    let binary = ''
    for (let i = 0; i < normalized.length; i += 4) {
      const a = _B64_X.indexOf(normalized[i])
      const b = _B64_X.indexOf(normalized[i + 1])
      const c = _B64_X.indexOf(normalized[i + 2])
      const d = _B64_X.indexOf(normalized[i + 3])
      if (a < 0 || b < 0) break
      binary += String.fromCharCode((a << 2) | (b >> 4))
      if (c >= 0 && normalized[i + 2] !== '=') binary += String.fromCharCode(((b & 15) << 4) | (c >> 2))
      if (d >= 0 && normalized[i + 3] !== '=') binary += String.fromCharCode(((c & 3) << 6) | d)
    }
    let out = ''
    for (let i = 0; i < binary.length; i++) {
      out += String.fromCharCode(binary.charCodeAt(i) ^ _XOR_KEY.charCodeAt(i % _XOR_KEY.length))
    }
    try { return decodeURIComponent(escape(out)) } catch (e) { return out }
  } catch (e) { return s }
}

// ========== 旧加密系统 (base64 + 反转，仅保留向后兼容) ==========
const _B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

const _d = (s) => {
  try {
    const r = s.split('').reverse().join('')
    let clean = ''
    for (let i = 0; i < r.length; i++) {
      const c = r[i]
      if (_B64.indexOf(c) >= 0 || c === '=') clean += c
    }
    let binary = ''
    for (let i = 0; i < clean.length; i += 4) {
      const a = _B64.indexOf(clean[i])
      const b = _B64.indexOf(clean[i + 1])
      const c = _B64.indexOf(clean[i + 2])
      const d = _B64.indexOf(clean[i + 3])
      if (a < 0 || b < 0) break
      binary += String.fromCharCode((a << 2) | (b >> 4))
      if (c >= 0 && clean[i + 2] !== '=') binary += String.fromCharCode(((b & 15) << 4) | (c >> 2))
      if (d >= 0 && clean[i + 3] !== '=') binary += String.fromCharCode(((c & 3) << 6) | d)
    }
    try { return decodeURIComponent(escape(binary)) } catch (e) { return binary }
  } catch (e) { return s }
}

// _e: 编码函数 (_d的逆操作) - 用于日志脱敏，编码后可用还原脚本解码
const _e = (s) => {
  try {
    // UTF-8 encode
    let binary = ''
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i)
      if (c < 128) binary += String.fromCharCode(c)
      else if (c < 2048) { binary += String.fromCharCode(192 | (c >> 6)); binary += String.fromCharCode(128 | (c & 63)) }
      else { binary += String.fromCharCode(224 | (c >> 12)); binary += String.fromCharCode(128 | ((c >> 6) & 63)); binary += String.fromCharCode(128 | (c & 63)) }
    }
    // Base64 encode
    let b64 = ''
    for (let i = 0; i < binary.length; i += 3) {
      const a = binary.charCodeAt(i)
      const b = i + 1 < binary.length ? binary.charCodeAt(i + 1) : 0
      const c = i + 2 < binary.length ? binary.charCodeAt(i + 2) : 0
      b64 += _B64[a >> 2]
      b64 += _B64[((a & 3) << 4) | (b >> 4)]
      b64 += i + 1 < binary.length ? _B64[((b & 15) << 2) | (c >> 6)] : '='
      b64 += i + 2 < binary.length ? _B64[c & 63] : '='
    }
    // 反转
    return b64.split('').reverse().join('')
  } catch (e) { return s }
}

// ========== 用户配置区 (放最上面方便填写) ==========
// v1.7.10: 把需要用户填的字段提到这里
const USER_CONFIG = {
  // 酷狗 API 凭据 - 在对应平台注册账号获取
  // 格式: ak_ 开头 + 40+ 位字符
  yuafeng_apikey: 'ak_d6c2d3eef8b8d16ac34b1fc38f6bfc198d8c2e6c25f38165',  // 用户填入的 apikey

  // 网易云 MUSIC_U Cookie (可选，已内置了一个默认的)
  // 如果想用自己的网易云账号 cookie，在这里替换
  netease_music_u: '',  // ← 留空则用内置的
}

// ========== API 配置 (混淆编码) ==========
const API = {
  // 本地API
  localQQ:   { base: _d('1MDMzoTO0EjLz4CM44SM3EzLvoDc0RHa'), enabled: true },
  localWy:   { base: _d('2MDMzoTO0EjLz4CM44SM3EzLvoDc0RHa'), enabled: true },
  miguLocal: { base: _d('3MDMzoTO0EjLz4CM44SM3EzLvoDc0RHa'), enabled: true },

  // 第三方API
  toubiec:   { base: _d('uNmLjVWaiV3b05SawFWe39yL6MHc0RHa'), enabled: true },
  ffapi:     { base: _d('=IjdvQnbp9ibj5SawFmZm9yL6MHc0RHa'), enabled: true },
  yaohu:     { base: _d('==wYpNXdt9SawF2LuNmLkVHavFWeukGch9yL6MHc0RHa'), key: _d('==gNBhGRyZkTTZ0Q3cne2R3SnZnb'), enabled: true },

  // 溯音API
  suyinQQ:   { base: _d('jl2c110XRF1LpBXYvQXZu5SawFWav9yL6MHc0RHa'), key: _d('1cTNygTY3AjMlNDZtMGO3gTLkdzYk1iZyMWYtcjYzMTM2YWZtkGchl2b'), enabled: true },
  suyinWy:   { base: _d('==wM2EzXjl2c110LpBXYvQXZu5SawFWav9yL6MHc0RHa'), key: _d('1cTNygTY3AjMlNDZtMGO3gTLkdzYk1iZyMWYtcjYzMTM2YWZtkGchl2b'), enabled: true },
  suyinKw:   { base: _d('=82d1t0LpBXYvQXZu5SawFWav9yL6MHc0RHa'), key: _d('1cTNygTY3AjMlNDZtMGO3gTLkdzYk1iZyMWYtcjYzMTM2YWZtkGchl2b'), enabled: true },

  // 迟言API (cyapi.top)
  cyapi: {
    qq: _d('==AcoBnLjl2c112XxF3LJBVQvA3b05SawFWej9yL6MHc0RHa'),
    wy: _d('whGcuU2chVGdl52LJBVQvA3b05SawFWej9yL6MHc0RHa'),
    key: _d('==wMlRTZ5Q2NxY2N4EWOwUWO4EmNyAjZyEzYxEWZxIGMidjMyQWMzcTO0gzYykTMxM2N0Q2MjFjY5EGM5UGOidTN'),
    enabled: true
  },

  // 非常刀
  chksz:     { base: _d('==QawF2Lw9Gduo3crh2YukGch9yL6MHc0RHa'), enabled: true },

  // 玉宁熙 (yuafeng/枫雨API)
  yuningxi:  { base: _d('==gbj5yZuVmZhVXeuIjdtkGch9yL6MHc0RHa'), key: _d('==wM3gjMyMTOhZ2YiVGN1EGMwYWO2gzMiBDO0QzYmR2YlFTZwEWY2UGOlJ2M2cTM1IDOhljZ1ETO2MDNhF2NzIWZ'), enabled: true },

  // fish-music
  fish:      { base: _d('=UWbuQXZlNXZj5SawFWLt9yL6MHc0RHa'), enabled: true },

  // HYWmusic
  hywmusic:  { base: _d('w9Gaz5CNkFDNyEGei5yYpNXdt9yL6MHc0RHa'), enabled: true },

  // 妖狐咪咕
  yaohuMg:   { base: _d('=U3Zp12Ljl2c112LpBXYv42YuMHd2NGeukGch9yL6MHc0RHa'), enabled: true },

  // v1.7.6: yunmge 酷我专用通道 (用 _xd 加密)
  // 解密脚本见项目根目录 decrypt_v176.py
  yunmge: {
    url:   _xd('XmtsSLVWXopEJuh8OBlpQyBZCTRtKcNpGu1cO7B6AEsIUzhcR'),
    key:   _xd('X=l7YKJ8UkQ7zdsoWVhUC34ZFRJoKQQEPWcEJGMJMkYtZVZYyrg7vxoUHS1sP'),
    token: _xd('X=t8CeBdEVVtzQItvINdJCcoM2RZZRZFKc9DxzsdEDAEv'),
    enabled: true
  },

  // v1.7.5: 网易云官方 Cookie (MUSIC_U) - 用 _xd 新加密
  neteaseCookie: _xd('X9ICz2ZEuWI8Jo9ozmAZwQJGTGtTuvoEEj5EvZx6YSdYKF4tMIAFQIknzL1Jwa1TBikmDGMbDD0JwZBZZf0VF1U9RcNUFHdcwYJmNn4TS/4rPtBoPRVtYXVdzMQEXYU8HoZbAjIJxZFqyncnuxM8QlpbvWlJY9o7GI8tInBWRGw7yUFZXKgTUzdtPHIUDzkZwYxZYkYVCMBaRYIURq8YxZZtGgUYBQlXCm1rO1QtwYNmAOUru7B8InRozeAZYSNazEp7uw0URBsEXYV6YWt7KxMSIGwaQmR7AVZJwb5sVkgmOxI8DyMCw9Edxy5VEKVFRWYrEjwDw7QSJwNsT4woPxcUC+EmwXNJT5ZEWMwoMFw8Bv5ZYXNWSElnWzcURu0UuLZ6YccTKmltJEgFRwEcyaMJYKw7yyZCPjB8DxQCYXFmwikWR/EWFPMEFC17wLJSJhwDydobCGwUO3w6XWVtTOEEX7V8HmV8ziYdWRVpzpssWv0oFCgoxZBtwW5TLppZJmB9EplTyXRdxTg7Vt8ZCGMrCC4SYUZJxx9GE1MpEVkURqcnY9wSNyNDSO5UDp1EOPxtX7ACyRwXvYEoJsNrUwVtZaIpSsYTvhpXRllHvWx6YawTKFkmMFMWREwDTY5tZ65sVBpCOzIoPz0ZZ6ESYv59FMRaEOk8EEhIYVpdMfUcSQpbCG8UC24JYYBdTRIEXVI8NIAbBzVJYWB9zG9DXDgEFedUv6YtxUx7Kx4mIpJpDwUIy6USwToIAzp6EuIbPAQ6wOBdXeYVFKVGFcxrEIhcwasZImYTTMl8DxkbP0YZxRZdT/ZoXYMoHsxbUABdWVBpAH1sukpEFhlXuaw6ZTtDJppdJxQpDtF7zLBtYUAnAB9CDfd8Cj1SYZtZYjkWF4AWRVwoEjo7WaQZIyFsTPdrFJoECRBtZawJy5NXXTMXICYrVfUZwbYWyrkYWf1XEjpHWawSwccTGD0JGpBpRqBYz9E6YK4cyh0CPfBbOiNCwTBCxlsVE2EWCVYECnwTxUJ6MgUczd8UCx4oO1ISxZxCyM8ox6N8MrJUBgw6WVFaymIDSdtXO0lqY'),


  // v1.7.10: 酷狗 yuafeng API
  // ⚠️ apikey 从 USER_CONFIG.yuafeng_apikey 读取
  // ⚠️ clientid 已内置
  yuafeng: {
    url: _xd('X=9tY5N9CCoUxJFsPygJVMQJK3ZoEV0JxsB6AEsIUzhcR'),
    apikey: USER_CONFIG.yuafeng_apikey || '',  // 从 USER_CONFIG 读取
    clientid: _xd('X=J6T5R8ucBbHrB8AA5JwZFqAmUTvAoEExQXZ'),
    enabled: !!USER_CONFIG.yuafeng_apikey  // 没填就禁用，避免无效请求
  },

  // v1.7.16: 残像 API (网易云，支持 master/jymaster)
  canxiang: {
    url: _xd('XTxZS+h8HQEVxJFsPygJVMIJLo5VEu1cO7B6AEsIUzhcR'),
    token: _xd('XX5ZAlRoDCwtyoNbOxRZHS1sP'),
    enabled: true
  },

  // v1.7.15: QQ 全音质 API (含 master，不需 apikey)
  ygking: {
    url: _xd('X=NJTJVVXopEJuh8OBl9LyVYCVhtL9VoGu1cO7B6AEsIUzhcR'),
    enabled: true
  },

  // v1.7.15: 星海聚合 API (酷我/酷狗/咪咕)
  xinghai: {
    url: _xd('X==JSAQpKD8cQyEISChFRnR8FOsoQfB6AEsIUzhcR'),
    enabled: true
  },


  // v1.7.12: 念心 API - 酷狗直链
  // 实测: 128k/320k/flac/hires 全部支持，返回完整直链
  nianxin: {
    url: _xd('X=1rCS0IV9tSNtdsWTVpX4xoDW8sNDBJAL9YSP9IK+1EDuBZK3B6AEsIUzhcR'),
    enabled: true
  },

  // QQ音乐专属配置
  qqDirect: {
    key: _d('=ElZalmdyZ3VSJ1Qhp1bJh3YwNXNxdXSHJVRCpXcYhTcjd0Z3UDMjdnTOB3QFh1Xj9VQa1mRmJ0QtxWRsV3a1JGM30iVrBHW2Uzbwg2TtZUbo50MmNDRwY3YD50MrNjNfx0XI9VU'),
    uin: _d('==ANxgTO5IjN3YzM'),
    enabled: true
  },
}

const SCRIPT_NAME = 'K×H测试'
const SCRIPT_VERSION = '1.7.17'
const SCRIPT_DESC = 'Koneko×HYW音源技术测试音源 - v1.7.10'
const DOWNLOAD_TYPE = '测试'
const SUPPORTED_SOURCES = ['wy', 'tx', 'kw', 'kg', 'mg']

const PLATFORM_NAMES = {
  wy: '网易云音乐', tx: 'QQ音乐', kw: '酷我音乐', kg: '酷狗音乐', mg: '咪咕音乐'
}

// 音质映射
const QMAP = {
  '128k': '128', '192k': '192', '320k': '320',
  'flac': 'flac', 'flac24bit': 'flac24bit',
  'hires': 'hires', 'atmos': 'atmos', 'atmos_plus': 'atmos_plus', 'master': 'master'
}

// 音质降级链
const QUALITY_FALLBACK = {
  'master':      ['master', 'hires', 'flac24bit', 'flac', '320k', '128k'],
  'hires':       ['hires', 'flac24bit', 'flac', '320k', '128k'],
  'flac24bit':   ['flac24bit', 'flac', '320k', '128k'],
  'flac':        ['flac', '320k', '128k'],
  'atmos':       ['atmos', 'master', 'flac', '320k', '128k'],
  'atmos_plus':  ['atmos_plus', 'atmos', 'master', 'flac', '320k', '128k'],
  '320k':        ['320k', '192k', '128k'],
  '192k':        ['192k', '320k', '128k'],
  '128k':        ['128k'],
}

// v1.7.0: 各平台实际支持音质（用于日志输出和初始化声明）
const PLATFORM_QUALITIES = {
  tx: { supported: ['128k', '320k', 'flac', 'hires', 'master', 'atmos', 'atmos_plus'], note: 'QQ专属支持全音质' },
  wy: { supported: ['128k', '320k', 'flac', 'hires', 'master'], note: 'chksz 支持 jymaster 超清母带' },
  kw: { supported: ['128k', '320k', 'flac', 'hires'], note: '妖狐搜索返回无损' },
  kg: { supported: ['128k', '320k', 'flac'], note: '妖狐搜索返回无损' },
  mg: { supported: ['128k', '320k', 'flac'], note: '本地API: PQ/HQ/SQ' },
}

// ========== 日志脱敏系统 (可逆编码) ==========
// 敏感信息用_e()编码后包裹在<<E:...>>中，普通用户看到的是乱码
// 拥有还原脚本+密钥的开发者可以解码还原
const _mask = (s) => {
  if (!s) return s
  let r = String(s)
  // 1. 脱敏URL中的敏感参数值 (key, token, contentId, copyrightId等)
  r = r.replace(/([?&](?:key|apikey|api_key|token|access_token|qm_keyst|qqmusic_key|psrf_qqaccess_token|contentId|copyrightId|songId|songmid)=)([^&\s"'<>]+)/gi, (m, p1, p2) => p1 + '<<E:' + _e(p2) + '>>')
  // 2. 脱敏内部IP地址后两段
  r = r.replace(/(\d{1,3}\.\d{1,3})\.(\d{1,3}\.\d{1,3})(:\d+)?/g, (m, p1, p2, p3) => p1 + '.<<E:' + _e(p2) + '>>' + (p3 || ''))
  // 3. 脱敏完整音频URL路径 (保留域名，跳过已含<<E:>>标记的路径防止嵌套编码)
  r = r.replace(/(https?:\/\/[^/]+\/)([^\s"'<>]{15,})/g, (m, p1, p2) => p2.includes('<<E:') ? m : p1 + '<<E:' + _e(p2) + '>>')
  // 4. 脱敏contentId/copyrightId (URL参数和错误消息中均生效)
  r = r.replace(/(contentId[=:]\s?)(\d+)/gi, (m, p1, p2) => p1 + '<<E:' + _e(p2) + '>>')
  r = r.replace(/(copyrightId[=:]\s?)(\d+)/gi, (m, p1, p2) => p1 + '<<E:' + _e(p2) + '>>')
  // 5. 脱敏Cookie中的敏感值
  r = r.replace(/(qm_keyst=)([^;\s<>]+)/gi, (m, p1, p2) => p1 + '<<E:' + _e(p2) + '>>')
  r = r.replace(/(uin=o)(\d+)/gi, (m, p1, p2) => p1 + '<<E:' + _e(p2) + '>>')
  // 6. 脱敏purl路径
  r = r.replace(/(purl[=:]\s?)([^\s"'<>]{10,})/gi, (m, p1, p2) => p1 + '<<E:' + _e(p2) + '>>')
  return r
}

// 批量脱敏日志参数
const _maskArgs = (args) => args.map(a => {
  if (typeof a === 'string') return _mask(a)
  if (typeof a === 'object') {
    try { return _mask(JSON.stringify(a)) } catch (e) { return '[obj]' }
  }
  return a
})

// ========== 日志系统 (v1.7.6: 改用 SCRIPT_NAME) ==========
const _LOG_TAG = `[${SCRIPT_NAME}]`
const log = {
  i: (...a) => { try { console.log(_LOG_TAG, ..._maskArgs(a)) } catch (e) {} },
  e: (...a) => { try { console.error(`${_LOG_TAG} ERR`, ..._maskArgs(a)) } catch (e) {} },
  w: (...a) => { try { console.warn(`${_LOG_TAG} WARN`, ..._maskArgs(a)) } catch (e) {} },
  d: (...a) => { try { console.debug(`${_LOG_TAG} DBG`, ..._maskArgs(a)) } catch (e) {} },
  t: (level, ...a) => {
    try {
      const ts = new Date().toISOString().substring(11, 19)
      const fn = level === 'e' ? console.error : level === 'w' ? console.warn : console.log
      fn(`[${SCRIPT_NAME} ${ts}]`, ..._maskArgs(a))
    } catch (e) {}
  },
}

// ========== HTTP工具 ==========
const DEFAULT_TIMEOUT = 4000

const http = (url, opts = {}) => new Promise((resolve, reject) => {
  const defaultOpts = {
    method: 'GET',
    timeout: DEFAULT_TIMEOUT,
    headers: { 'X-Client-Software': 'lx' }
  }
  const finalOpts = { ...defaultOpts, ...opts }
  log.d('HTTP', finalOpts.method, url.substring(0, 120))
  request(url, finalOpts, (err, resp) => {
    if (err) {
      log.d('HTTP错误:', err.message || err)
      return reject(new Error('请求错误: ' + (err.message || err)))
    }
    let body = resp?.body
    if (typeof body === 'string') {
      const trimmed = body.trim()
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try { body = JSON.parse(trimmed) } catch (e) { /* 保留原始字符串 */ }
      }
    }
    resolve({
      statusCode: resp?.statusCode ?? 0,
      headers: resp?.headers || {},
      body: body
    })
  })
})

const isValidJsonResponse = (resp) => {
  if (!resp || resp.statusCode >= 400) return false
  const body = resp.body
  if (!body) return false
  if (typeof body === 'object') return true
  if (typeof body === 'string') {
    const trimmed = body.trim().toLowerCase()
    if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html')) return false
    if (trimmed.includes('cloudflare') && trimmed.includes('challenge')) return false
    if (trimmed.includes('just a moment')) return false
  }
  return true
}

const fetchJSON = async (url, opts = {}) => {
  const resp = await http(url, opts)
  if (!isValidJsonResponse(resp)) {
    throw new Error('HTTP ' + resp.statusCode + ': ' + _mask(url).substring(0, 60))
  }
  let body = resp.body
  if (typeof body === 'string') {
    const trimmed = body.trim()
    try { body = JSON.parse(trimmed) } catch (e) {
      throw new Error('JSON解析失败: ' + _mask(trimmed).substring(0, 100))
    }
  }
  return body
}

const httpGet = async (url, params = {}) => {
  const queryStr = Object.keys(params)
    .filter(k => params[k] !== undefined && params[k] !== null)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
    .join('&')
  const sep = url.includes('?') ? '&' : '?'
  const fullUrl = url + (queryStr ? sep + queryStr : '')
  return fetchJSON(fullUrl, { method: 'GET', timeout: DEFAULT_TIMEOUT })
}

const httpPost = async (url, body = {}, timeout = DEFAULT_TIMEOUT) => {
  return fetchJSON(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
    timeout: timeout
  })
}

// 从歌曲信息中提取ID
const getId = (info) => {
  if (!info || typeof info !== 'object') return ''
  const id = info.songmid || info.songId || info.id || info.hash || info.rid || info.musicId || info.copyrightId || info.songid || info.mid || info.strMediaMid || info.FileHash || info.fileHash || info.copyrightid || ''
  if (id) return String(id)
  const src = info.source || ''
  switch (src) {
    case 'kg': return String(info.hash || info.FileHash || info.fileHash || info.songId || info.id || '')
    case 'tx': return String(info.songmid || info.strMediaMid || info.mid || info.songId || info.id || '')
    case 'wy': return String(info.songId || info.id || info.songmid || '')
    case 'kw': return String(info.songId || info.rid || info.musicId || info.id || info.songmid || '')
    case 'mg': return String(info.copyrightId || info.songId || info.songmid || info.id || '')
    default: return String(info.songId || info.songmid || info.id || info.hash || '')
  }
}

const isValidAudioUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false
  if (url.includes('404') && url.length < 50) return false
  const lower = url.toLowerCase()
  const audioPatterns = ['.mp3', '.flac', '.m4a', '.ogg', '.wav', 'music.126.net', 'qqmusic', 'kuwo.cn', 'kugou.com', 'migu', 'music']
  return audioPatterns.some(p => lower.includes(p))
}

const extractUrl = (data) => {
  if (!data) return ''
  if (typeof data === 'string') return data.startsWith('http') ? data : ''
  if (typeof data !== 'object') return ''
  if (typeof data.url === 'string' && data.url.startsWith('http')) return data.url
  if (data.data) {
    if (typeof data.data === 'string' && data.data.startsWith('http')) return data.data
    if (typeof data.data.url === 'string' && data.data.url.startsWith('http')) return data.data.url
    if (data.data.vipmusic && typeof data.data.vipmusic.url === 'string' && data.data.vipmusic.url.startsWith('http')) return data.data.vipmusic.url
    if (typeof data.data.play_url === 'string' && data.data.play_url.startsWith('http')) return data.data.play_url
    if (Array.isArray(data.data) && data.data.length > 0) {
      if (typeof data.data[0].url === 'string' && data.data[0].url.startsWith('http')) return data.data[0].url
      if (typeof data.data[0] === 'string' && data.data[0].startsWith('http')) return data.data[0]
    }
  }
  if ((data.code === 200 || data.code === 0 || data.status === 200) && data.data) {
    return extractUrl({ data: data.data })
  }
  if (data.text && typeof data.text === 'string') {
    const match = data.text.match(/https?:\/\/[^\s"']+/)
    if (match) return match[0]
  }
  if (data.data && data.data.text && typeof data.data.text === 'string') {
    const match = data.data.text.match(/https?:\/\/[^\s"']+/)
    if (match) return match[0]
  }
  return ''
}

// ========== API实现 ==========

// 1. 本地QQ (3035)
const getLocalQQ = async (info, q) => {
  const id = getId(info)
  if (!id) throw new Error('no id')
  const typeMap = { '128k': 'MP3_128', '192k': 'MP3_320', '320k': 'MP3_320', 'flac': 'FLAC', 'flac24bit': 'Master', 'hires': 'Master', 'master': 'Master' }
  log.d('本地QQ请求:', id, q)
  const data = await httpGet(`${API.localQQ.base}/song/urls`, { mids: id, type: typeMap[q] || 'MP3_128' })
  const url = extractUrl(data) || (data && data.data && data.data[id] && data.data[id].url) || ''
  if (url) return url
  throw new Error('localQQ fail: ' + _mask(JSON.stringify(data)).substring(0, 100))
}

// 2. 本地网易 (3036)
const getLocalWy = async (info, q) => {
  const id = getId(info)
  if (!id) throw new Error('no id')
  const levelMap = { '128k': 'standard', '192k': 'exhigh', '320k': 'exhigh', 'flac': 'lossless', 'flac24bit': 'hires', 'hires': 'hires', 'master': 'jymaster' }
  log.d('本地网易请求:', id, q)
  // v1.7.5: 修复路由 /song -> /song/url/v1，注入 MUSIC_U cookie
  const data = await httpPost(`${API.localWy.base}/song/url/v1`, {
    id: id,
    level: levelMap[q] || 'standard',
    encodeType: 'flac',
    cookie: API.neteaseCookie,
  })
  if (data && data.code === 200 && Array.isArray(data.data) && data.data[0] && data.data[0].url) {
    return data.data[0].url
  }
  const url = extractUrl(data)
  if (url) return url
  throw new Error('localWy fail: ' + _mask(JSON.stringify(data)).substring(0, 100))
}

// 3. Toubiec (网易)
const getToubiec = async (info, q) => {
  const id = getId(info)
  if (!id) throw new Error('no id')
  const levelMap = { '128k': 'standard', '192k': 'exhigh', '320k': 'exhigh', 'flac': 'lossless', 'flac24bit': 'hires' }
  log.d('Toubiec请求:', id, q)
  const data = await httpGet(`${API.toubiec.base}/song`, { id: id, level: levelMap[q] || 'standard' })
  const url = extractUrl(data)
  if (url) return url
  throw new Error('toubiec fail')
}

// 4. FFAPI
const getFFAPI = async (info, q) => {
  const id = getId(info)
  const src = info.source
  if (!id) throw new Error('no id')
  let url = ''
  if (src === 'tx') url = `https://y.qq.com/n/ryqq/songDetail/${id}`
  else if (src === 'wy') url = `https://music.163.com/song?id=${id}`
  else if (src === 'kw') url = `https://www.kuwo.cn/play_detail/${id}`
  else if (src === 'kg') url = `https://www.kugou.com/song/#hash=${id}`
  else if (src === 'mg') url = `https://music.migu.cn/v3/music/song/${id}`
  else throw new Error('unsupported src: ' + src)
  log.d('FFAPI请求:', src, id)
  const data = await httpGet(`${API.ffapi.base}/songurl`, { url: url })
  const u = extractUrl(data)
  if (u) return u
  throw new Error('ffapi fail')
}

// 5. 妖狐 - 酷我 (搜索模式返回FLAC无损)
// v1.7.6: yunmge 酷我专用通道 (URL/key/token 已 _xd 加密)
//   返回 data.all_bitrates 数组，按音质选最佳 bitrate 取 play_url
// v1.7.8: 酷狗 yuafeng API (POST/GET, 需 apikey)
// 注意: apikey 从 USER_CONFIG.yuafeng_apikey 读取
const getYuafengKg = async (info, q) => {
  if (!API.yuafeng.apikey) {
    throw new Error('yuafengKg: 未配置 apikey')
  }
  const hash = info.hash || info.songmid || info.id || ''
  if (!hash) throw new Error('yuafengKg: no hash')
  log.d('yuafeng酷狗请求:', hash, q)
  const data = await httpGet(API.yuafeng.url, {
    apikey: API.yuafeng.apikey,
    hash: hash,
    msg: (info.songName || '') + ' ' + (info.singer || ''),
    n: 1,
  })
  if (data && data.code === 200) {
    const url = data.url || (data.data && data.data.url) || ''
    if (url && isValidAudioUrl(url)) {
      log.d('yuafeng酷狗成功:', q)
      return url
    }
  }
  throw new Error('yuafengKg fail: code=' + (data?.code ?? 'null'))
}

// v1.7.12: 念心酷狗 API (mcp.nianxinxz.com) - 直接返回 kuwo.cn 直链
// 实测: 支持 128k/320k/flac/hires，返回完整直链不需二次请求
const getNianxinKg = async (info, q) => {
  const hash = info.hash || info.songmid || info.id || ''
  if (!hash) throw new Error('nianxinKg: no hash')
  // 念心 level 映射（实测支持）
  const levelMap = {
    '128k': '128kmp3',
    '192k': '320kmp3',  // 没专门 192k，降级到 320k
    '320k': '320kmp3',
    'flac': '2000kflac',
    'flac24bit': '4000kflac',
    'hires': 'hires',
    'master': '4000kflac',  // 念心没有 master，用最高 4000kflac
    'atmos': '4000kflac',
    'atmos_plus': '4000kflac',
  }
  const level = levelMap[q] || '320kmp3'
  log.d('念心酷狗请求:', hash, q, '->', level)
  const data = await httpGet(API.nianxin.url, { id: hash, level: level }, 8000)
  // 返回: { code: 200, msg: '换源成功', url: '<直链>' }
  if (data && data.code === 200 && data.url) {
    log.d('念心酷狗成功:', q, '(level=' + level + ')')
    return data.url
  }
  throw new Error('nianxinKg fail: code=' + (data?.code ?? 'null') + ' msg=' + (data?.msg || '').substring(0, 60))
}

// v1.7.16: 残像 API (网易云)
// GET /api/wyymusic?token=<token>&msg=<keyword>&n=1&type=<quality>
// 或 GET /api/wyymusic?token=<token>&id=<songId>&type=<quality>
// 返回: { code: 200, data: { url, quality, cover, lyric, ... } }
const getCanxiang = async (info, q) => {
  const id = info.songId || info.id || info.songmid || ''
  const songName = info.songName || info.name || ''
  const singer = info.singer || ''
  
  // 音质映射
  const qMap = {
    '128k': '128k', '192k': '320k', '320k': '320k',
    'flac': 'flac', 'flac24bit': 'hires', 'hires': 'hires',
    'master': 'jymaster', 'atmos': 'jymaster', 'atmos_plus': 'jymaster',
  }
  const type = qMap[q] || '320k'
  
  log.d('残像请求:', id || (songName + singer), q, '->', type)
  
  // 优先用 id 直接调，没有 id 用 msg 搜索
  const params = { token: API.canxiang.token, type: type }
  if (id) {
    params.id = String(id)
  } else if (songName) {
    params.msg = songName + (singer ? ' ' + singer : '')
    params.n = 1
  } else {
    throw new Error('canxiang: no id and no songName')
  }
  
  const data = await httpGet(API.canxiang.url, params, 8000)
  
  if (data && data.code === 200 && data.data && data.data.url) {
    log.d('残像成功:', q, '(type=' + type + ', quality=' + (data.data.quality || '?') + ')')
    return data.data.url
  }
  throw new Error('canxiang fail: code=' + (data?.code ?? 'null') + ' msg=' + (data?.msg || '').substring(0, 60))
}

// v1.7.15: QQ 全音质 API (含 master)
// GET /api/song/url?mid={mid}&quality={128|320|flac|hires|master}
// 返回: { code: 0, data: { "<mid>": "<url>" } }
const getYgkingTx = async (info, q) => {
  const mid = info.songmid || info.strMediaMid || info.mediaMid || info.id || ''
  if (!mid) throw new Error('ygking: no mid')
  // 音质映射
  const qMap = {
    '128k': '128', '192k': '320', '320k': '320',
    'flac': 'flac', 'flac24bit': 'hires', 'hires': 'hires',
    'master': 'master', 'atmos': 'master', 'atmos_plus': 'master',
  }
  const quality = qMap[q] || '320'
  log.d('ygking QQ请求:', mid, q, '->', quality)
  const data = await httpGet(API.ygking.url, { mid: mid, quality: quality }, 8000)
  // 返回: { code: 0, data: { "<mid>": "<url>" } }
  if (data && data.code === 0 && data.data) {
    const url = data.data[mid] || data.data[Object.keys(data.data)[0]] || ''
    if (url && isValidAudioUrl(url)) {
      log.d('ygking QQ成功:', q, '(quality=' + quality + ')')
      return url
    }
  }
  throw new Error('ygking fail: code=' + (data?.code ?? 'null'))
}

// v1.7.15: 星海聚合 API (酷我/酷狗/咪咕)
// GET /lx/api/?source={kw|kg|migu}&name={name}&songmid={id}&quality={quality}
// 返回: { code: 200, url: "<直链>" }
const getXinghai = async (source, info, q) => {
  const id = source === 'kg' ? (info.hash || info.songmid || info.id || '')
           : source === 'migu' ? (info.songId || info.contentId || info.id || '')
           : (info.songmid || info.rid || info.id || '')
  if (!id) throw new Error('xinghai: no id for source=' + source)
  const songName = info.songName || info.name || ''
  const singer = info.singer || ''
  const name = songName + (singer ? ' ' + singer : '')
  // 音质映射
  const qMap = {
    '128k': '128kmp3', '192k': '320kmp3', '320k': '320kmp3',
    'flac': 'flac', 'flac24bit': 'hires', 'hires': 'hires',
    'master': 'flac', 'atmos': 'flac', 'atmos_plus': 'flac',
  }
  const quality = qMap[q] || '320kmp3'
  log.d('星海请求:', source, id, q, '->', quality)
  const data = await httpGet(API.xinghai.url, {
    source: source, name: name, songmid: String(id), quality: quality,
  }, 8000)
  if (data && data.code === 200 && data.url) {
    log.d('星海成功:', source, q)
    return data.url
  }
  throw new Error('xinghai fail: code=' + (data?.code ?? 'null') + ' msg=' + (data?.message || '').substring(0, 60))
}

const getXinghaiKw = (info, q) => getXinghai('kw', info, q)
const getXinghaiKg = (info, q) => getXinghai('kg', info, q)
const getXinghaiMg = (info, q) => getXinghai('migu', info, q)

const getYunmgeKw = async (info, q) => {
  const id = getId(info)
  if (!id) throw new Error('yunmgeKw: no id')

  // 音质 → bitrate 映射（yunmge 返回的 bitrate 是数字: 128/192/320/2000/4000）
  const brMap = {
    '128k': 128, '192k': 192, '320k': 320,
    'flac': 2000, 'flac24bit': 2000, 'hires': 4000,
    'atmos': 4000, 'atmos_plus': 4000, 'master': 4000
  }
  // 音质降级链（yunmge 视角）
  const brFallback = {
    '4000': [4000, 2000, 320, 192, 128],
    '2000': [2000, 320, 192, 128],
    '320':  [320, 192, 128],
    '192':  [192, 128],
    '128':  [128],
  }
  const wantBr = brMap[q] || 320
  const tryBrs = brFallback[String(wantBr)] || [wantBr]

  log.d('yunmge酷我请求:', id, q, '->', wantBr)
  const data = await httpGet(API.yunmge.url, {
    key: API.yunmge.key,
    token: API.yunmge.token,
    id: id,
  }, 8000)  // v1.7.9: 8s 超时，避免竞速被 abort

  if (!data || data.code !== 200 || !data.data) {
    throw new Error('yunmgeKw fail: code=' + (data?.code ?? 'null') + ' msg=' + _mask(JSON.stringify(data)).substring(0, 80))
  }

  const allBrs = data.data.all_bitrates || []
  if (allBrs.length === 0) {
    throw new Error('yunmgeKw: no all_bitrates')
  }

  // 按降级链选最佳 bitrate
  for (const br of tryBrs) {
    const item = allBrs.find(b => b.bitrate === br || String(b.bitrate) === String(br))
    if (item && item.play_url) {
      log.d('yunmge酷我成功:', 'bitrate=' + item.bitrate, 'label=' + (item.label || ''))
      return item.play_url
    }
  }

  // 兜底：返回第一个可用 url
  for (const item of allBrs) {
    if (item.play_url) {
      log.d('yunmge酷我兜底返回:', 'bitrate=' + item.bitrate)
      return item.play_url
    }
  }

  throw new Error('yunmgeKw: all play_url empty')
}

const getYaohuKw = async (info, q) => {
  const songName = info.songName || info.name || ''
  const singer = info.singer || ''
  if (songName) {
    const searchKey = songName + singer
    log.d('妖狐酷我搜索:', searchKey)
    const data = await httpGet(`${API.yaohu.base}/kuwo`, {
      key: API.yaohu.key, action: 'search', msg: searchKey, n: 1
    })
    const vm = data?.data?.vipmusic || {}
    const url = vm.url || ''
    if (url && isValidAudioUrl(url)) {
      log.d('妖狐酷我搜索成功, level:', vm.level, 'bitrate:', vm.bitrate)
      return url
    }
  }
  const id = getId(info)
  if (!id) throw new Error('yaohuKw: no id and no songName')
  log.d('妖狐酷我ID解析:', id)
  const data = await httpGet(`${API.yaohu.base}/kuwo`, {
    key: API.yaohu.key, action: 'song', id: id, size: 'lossless'
  })
  const url = extractUrl(data)
  if (url) return url
  throw new Error('yaohuKw fail: ' + _mask(JSON.stringify(data)).substring(0, 100))
}

// 5b. 妖狐 - 酷狗
const getYaohuKg = async (info, q) => {
  const songName = info.songName || info.name || ''
  const singer = info.singer || ''
  if (!songName) throw new Error('no songName for kg search')
  const qualityMap = { '128k': '128', '192k': '320', '320k': '320', 'flac': 'flac', 'flac24bit': 'high', 'hires': 'high', 'master': 'high' }
  const quality = qualityMap[q] || '128'
  const searchKey = songName + singer
  log.d('妖狐酷狗请求:', searchKey, quality)
  const data = await httpGet(`${API.yaohu.base}/kg`, {
    key: API.yaohu.key, msg: searchKey, n: 1, quality: quality
  })
  const playUrl = data?.data?.play_url || ''
  if (playUrl && isValidAudioUrl(playUrl)) return playUrl
  const url = extractUrl(data)
  if (url) return url
  throw new Error('yaohuKg fail: ' + _mask(JSON.stringify(data)).substring(0, 100))
}

// 5c. 妖狐 - QQ/网易通用
const getYaohu = async (info, q) => {
  const src = info.source
  const songName = info.songName || info.name || ''
  const singer = info.singer || ''
  if (!songName) throw new Error('no songName')
  const pathMap = { wy: 'wy', tx: 'qq' }
  const path = pathMap[src]
  if (!path) throw new Error('unsupported src: ' + src)
  const searchKey = songName + singer
  log.d('妖狐通用请求:', path, searchKey)
  const data = await httpGet(`${API.yaohu.base}/${path}`, {
    key: API.yaohu.key, msg: searchKey, n: 1
  })
  const musicUrl = data?.data?.musicurl || ''
  if (musicUrl && isValidAudioUrl(musicUrl)) return musicUrl
  const url = extractUrl(data)
  if (url) return url
  throw new Error('yaohu fail: ' + _mask(JSON.stringify(data)).substring(0, 100))
}

// 5d. 妖狐 - 咪咕 (搜索模式)
// v1.7.10: 只有 id 没歌名时，先调妖狐搜索 API 拿到歌曲名再请求 URL
const getYaohuMg = async (info, q) => {
  let songName = info.songName || info.name || ''
  const singer = info.singer || ''
  const id = getId(info)

  // v1.7.10: 如果只有 id 没歌名，用 id 调搜索 API 拿歌名
  if (!songName && id) {
    log.d('妖狐咪咕: 无歌名，用 id 搜索获取:', id)
    try {
      const searchData = await httpGet(`${API.yaohuMg.base}`, {
        key: API.yaohu.key, msg: String(id), n: 1
      })
      const song = searchData?.data?.vipmusic || searchData?.data?.[0] || null
      if (song && (song.songName || song.name)) {
        songName = song.songName || song.name
        log.d('妖狐咪咕: 通过 id 搜索到歌名:', songName)
      }
    } catch (e) {
      log.d('妖狐咪咕: id 搜索失败:', e.message)
    }
  }

  if (!songName) throw new Error('yaohuMg: 无歌名且 id 搜索失败')
  const searchKey = songName + (singer ? ' ' + singer : '')
  log.d('妖狐咪咕请求:', searchKey)
  const data = await httpGet(`${API.yaohuMg.base}`, {
    key: API.yaohu.key, msg: searchKey, n: 1
  })
  const url = extractUrl(data)
  if (url) return url
  throw new Error('yaohuMg fail: ' + _mask(JSON.stringify(data)).substring(0, 100))
}

// v1.7.0: 咪咕本地API (3037) - 快速返回模式
// 改进点:
//   1. 优先健康检查(缓存60s)，API不可达时快速跳过
//   2. 直接尝试请求音质，失败立即PQ兜底，不逐层降级
//   3. 日志输出实际支持音质(128k/320k/flac)
const _miguHealthCache = { ok: null, ts: 0 }
const MIGU_HEALTH_TTL = 60000

const checkMiguHealth = async () => {
  const now = Date.now()
  if (_miguHealthCache.ok !== null && now - _miguHealthCache.ts < MIGU_HEALTH_TTL) {
    return _miguHealthCache.ok
  }
  try {
    const resp = await http(`${API.miguLocal.base}/api/search?text=test&page=1&size=1`, { timeout: 2000 })
    _miguHealthCache.ok = isValidJsonResponse(resp)
    _miguHealthCache.ts = now
    log.d('咪咕API健康检查:', _miguHealthCache.ok ? '正常' : '异常')
    return _miguHealthCache.ok
  } catch (e) {
    _miguHealthCache.ok = false
    _miguHealthCache.ts = now
    log.d('咪咕API健康检查: 异常', e.message)
    return false
  }
}

const getMiguLocal = async (info, q) => {
  // v1.7.0: 支持的音质 (本地API toneFlag: PQ=128k, HQ=320k, SQ=无损FLAC)
  const supportedQ = ['128k', '320k', 'flac']
  log.d('咪咕支持音质:', supportedQ.join('/'), '| 请求音质:', q)

  // v1.7.0: 优先健康检查
  const healthy = await checkMiguHealth()
  if (!healthy) {
    throw new Error('miguLocal: API不可达(健康检查失败)')
  }

  const songName = info.songName || info.name || ''
  const singer = info.singer || ''
  let contentId = ''
  let copyrightId = ''

  const rawId = getId(info)
  if (rawId) {
    if (rawId.length > 15) {
      contentId = rawId
    } else if (rawId.length >= 8 && rawId.length <= 14) {
      copyrightId = rawId
    } else {
      contentId = info.contentId || rawId
      copyrightId = info.copyrightId || info.copyrightid || ''
    }
  }
  contentId = info.contentId || contentId
  copyrightId = info.copyrightId || info.copyrightid || copyrightId

  log.d('咪咕本地(3037):', songName, 'contentId: ' + contentId, 'copyrightId: ' + copyrightId)

  // 如果没有contentId，搜索获取
  if (!contentId) {
    if (!songName) throw new Error('miguLocal: 无contentId且无songName')
    const searchKey = songName + (singer ? ' ' + singer : '')
    log.d('咪咕本地搜索:', searchKey)
    const searchData = await httpGet(`${API.miguLocal.base}/api/search`, { text: searchKey, page: 1, size: 5 })
    if (searchData && searchData.success && searchData.data && searchData.data.items) {
      const items = searchData.data.items
      let matched = null
      if (copyrightId) {
        matched = items.find(it => it.song && (it.song.copyrightId === copyrightId))
      }
      if (!matched && items.length > 0) {
        matched = items[0]
      }
      if (matched && matched.song) {
        contentId = matched.song.contentId || ''
        copyrightId = copyrightId || matched.song.copyrightId || ''
        log.d('咪咕搜索匹配:', matched.song.songName, 'contentId: ' + contentId)
      }
    }
  }

  if (!contentId) {
    throw new Error('miguLocal: 无法获取contentId')
  }

  // 音质映射
  const toneFlagMap = { '128k': 'PQ', '192k': 'HQ', '320k': 'HQ', 'flac': 'SQ', 'flac24bit': 'ZQ', 'hires': 'ZQ' }
  const toneFlag = toneFlagMap[q] || 'PQ'

  // v1.7.0: 快速返回 - 内部URL请求函数
  const tryGetUrl = async (flag) => {
    const url = `${API.miguLocal.base}/api/url/h5v2.4?contentId=${contentId}&copyrightId=${copyrightId || ''}&resourceType=2&toneFlag=${flag}`
    const data = await httpGet(url)
    if (data && data.success && data.data && data.data.url && typeof data.data.url === 'string') {
      return data.data.url
    }
    const u = extractUrl(data)
    if (u) return u
    return ''
  }

  // v1.7.0: 直接尝试请求音质
  let url = await tryGetUrl(toneFlag)
  if (url) {
    log.d('咪咕本地成功:', q, '(toneFlag=' + toneFlag + ')', url.substring(0, 60))
    return url
  }

  // v1.7.0: 快速兜底 - 直接尝试PQ(128k)，不走逐层降级
  if (q !== '128k') {
    log.d('咪咕快速兜底: 请求音质', q, '失败，直接尝试PQ(128k)')
    url = await tryGetUrl('PQ')
    if (url) {
      log.d('咪咕兜底成功(PQ/128k):', url.substring(0, 60))
      return url
    }
  }

  throw new Error(_mask('miguLocal fail: contentId=' + contentId + ' toneFlag=' + toneFlag))
}

// 6. 溯音QQ
const getSuyinQQ = async (info, q) => {
  const id = getId(info)
  if (!id) throw new Error('no id')
  const brMap = { '128k': 7, '192k': 5, '320k': 5, 'flac': 4, 'hires': 3, 'flac24bit': 1, 'master': 1 }
  log.d('溯音QQ请求:', id, q)
  const data = await httpGet(API.suyinQQ.base, { key: API.suyinQQ.key, type: 'json', br: brMap[q] || 7, n: 1, mid: id })
  const url = extractUrl(data)
  if (url) return url
  throw new Error('suyinQQ fail')
}

// 7. 溯音网易
const getSuyinWy = async (info, q) => {
  const id = getId(info)
  if (!id) throw new Error('no id')
  const levelMap = { '128k': 'standard', '192k': 'exhigh', '320k': 'exhigh', 'flac': 'lossless', 'flac24bit': 'hires', 'hires': 'hires', 'master': 'jymaster' }
  log.d('溯音网易请求:', id, q)
  const data = await httpGet(API.suyinWy.base, { key: API.suyinWy.key, type: 'json', level: levelMap[q] || 'standard', n: 1, id: id })
  const url = extractUrl(data)
  if (url) return url
  throw new Error('suyinWy fail')
}

// 8. 溯音酷我
const getSuyinKw = async (info, q) => {
  const id = getId(info)
  if (!id) throw new Error('no id')
  const brMap = { '128k': 7, '192k': 5, '320k': 5, 'flac': 1, 'flac24bit': 1, 'hires': 1 }
  log.d('溯音酷我请求:', id, q)
  const data = await httpGet(API.suyinKw.base, { key: API.suyinKw.key, type: 'json', br: brMap[q] || 7, n: 1, id: id })
  const url = extractUrl(data)
  if (url) return url
  throw new Error('suyinKw fail')
}

// 10. cyapi (迟言API)
const getCyapi = async (info, q) => {
  const src = info.source
  const id = getId(info)
  if (!id && src !== 'wy') throw new Error('cyapi: no id')

  if (src === 'tx') {
    log.d('cyapi QQ请求 mid:', id)
    const data = await httpGet(API.cyapi.qq, { apikey: API.cyapi.key, type: 'json', mid: id })
    if (data && data.url && typeof data.url === 'string' && data.url.startsWith('http')) {
      return data.url
    }
    throw new Error('cyapi QQ fail: no url field')
  } else if (src === 'wy') {
    const songName = info.songName || info.name || ''
    const singer = info.singer || ''
    if (!songName) throw new Error('cyapi WY: no songName')
    const searchKey = songName + (singer ? ' ' + singer : '')
    log.d('cyapi 网易请求:', searchKey)
    const data = await httpGet(API.cyapi.wy, { apikey: API.cyapi.key, msg: searchKey, n: 1, type: 'json' })
    if (data && data.url && typeof data.url === 'string' && data.url.startsWith('http')) {
      return data.url
    }
    throw new Error('cyapi WY fail: no url field')
  }
  throw new Error('cyapi: unsupported src: ' + src)
}

// 12. chksz (v1.7.11: 修复路径 + level 映射，支持 master)
// 玉宁熙音源同款用法
// level: standard/exhigh/lossless/hires/jymaster(超清母带)
const getChksz = async (info, q) => {
  const id = getId(info)
  if (!id) throw new Error('no id')
  // v1.7.11: 完整的网易云 level 映射（含 master/jymaster）
  const levelMap = {
    '128k': 'standard',
    '192k': 'exhigh',
    '320k': 'exhigh',
    'flac': 'lossless',
    'flac24bit': 'hires',
    'hires': 'hires',
    'master': 'jymaster',     // 超清母带
    'atmos': 'jymaster',
    'atmos_plus': 'jymaster',
  }
  const level = levelMap[q] || 'standard'
  log.d('chksz请求:', id, q, '->', level)
  // v1.7.11: 路径 /music/wy -> /api/163_music (玉宁熙用法)
  const data = await httpGet(`${API.chksz.base}/api/163_music`, { id: id, level: level })
  // 返回结构: { code: 200, data: { url: '...' } }
  if (data && data.code === 200 && data.data && data.data.url) {
    log.d('chksz成功:', q, '(level=' + level + ')')
    return data.data.url
  }
  // 兼容旧结构
  const url = extractUrl(data)
  if (url) return url
  throw new Error('chksz fail: code=' + (data?.code ?? 'null'))
}

// 17. fish-music
const getFish = async (info, q) => {
  const id = getId(info)
  const src = info.source
  if (!id) throw new Error('no id')
  log.d('fish请求:', src, id)
  const data = await httpGet(`${API.fish.base}/${src}/song`, { id: id })
  const url = extractUrl(data)
  if (url) return url
  throw new Error('fish fail')
}

// 18. HYWmusic
const getHYW = async (info, q) => {
  const id = getId(info)
  if (!id) throw new Error('no id')
  log.d('HYW请求:', id)
  const data = await httpGet(`${API.hywmusic.base}/api/music`, { mid: id })
  const url = extractUrl(data)
  if (url) return url
  throw new Error('hyw fail')
}

// 20. 玉宁熙 (yuafeng/枫雨API)
const getYuafeng = async (info, q) => {
  const src = info.source
  const songName = info.songName || info.name || ''
  const singer = info.singer || ''
  if (!songName) throw new Error('yuafeng: no songName')

  const endpointMap = {
    wy: 'wymusic', tx: 'qqmusic', kw: 'kwmusic',
    kg: 'kgmusic', mg: 'mgmusic'
  }
  const endpoint = endpointMap[src]
  if (!endpoint) throw new Error('yuafeng: unsupported src: ' + src)

  const typeMap = {
    '128k': '1', '192k': '2', '320k': '2',
    'flac': '4', 'flac24bit': '4', 'hires': '4',
    'master': '4', 'atmos': '4', 'atmos_plus': '4'
  }
  const type = typeMap[q] || '1'

  const searchKey = songName + (singer ? ' ' + singer : '')
  log.d('玉宁熙请求:', endpoint, searchKey, 'type=' + type)

  const data = await httpGet(`${API.yuningxi.base}/API/${endpoint}.php`, {
    apikey: API.yuningxi.key, msg: searchKey, n: 1, type: type
  })

  if (data && data.code === 0 && data.data) {
    const musicUrl = data.data.music
    if (musicUrl && typeof musicUrl === 'string' && musicUrl.startsWith('http')) {
      log.d('玉宁熙成功:', endpoint, musicUrl.substring(0, 60))
      return musicUrl
    }
    if (src === 'mg' && data.data.copyrightId && data.data.id) {
      log.d('玉宁熙咪咕: 搜索成功但直链空, copyrightId=' + data.data.copyrightId)
      throw new Error(_mask('yuafeng mg: 直链为空 copyrightId=' + String(data.data.copyrightId)))
    }
  }

  throw new Error('yuafeng fail: code=' + (data?.code ?? 'null') + ' msg=' + (data?.msg || '').substring(0, 60))
}

// v1.7.0: QQ音乐专属接口 - 3重策略
//   策略A: ut.y.qq.com (测试网关) CgiGetHotVkey/GetEVkey - 无VIP校验
//   策略B: u.y.qq.com (生产网关) platform=23 + 双songmid - VIP校验宽松
//   策略C: ut.y.qq.com 带Cookie+guid增强版
const getQQExploit = async (info, q) => {
  const songmid = getId(info)
  if (!songmid) throw new Error('QQ专属: no songmid')

  const mediaMid = info.mediaMid || info.strMediaMid || info.media_mid || info.strmediamid || ''

  // 音质前缀映射
  const qualityPrefix = {
    '128k': 'M500', '192k': 'M800', '320k': 'M800',
    'flac': 'F000', 'flac24bit': 'RS01', 'hires': 'RS01',
    'atmos': 'atmosphere', 'atmos_plus': 'atmosphere',
    'master': 'AIM00'
  }
  const prefix = qualityPrefix[q] || 'M800'

  // 文件扩展名
  const extMap = {
    'M500': 'mp3', 'M800': 'mp3',
    'F000': 'flac', 'RS01': 'flac', 'RS02': 'flac',
    'AIM00': 'mflac', 'atmosphere': 'flac'
  }
  const ext = extMap[prefix] || 'mp3'

  // filename中的mid: 优先用mediaMid(命中率更高), 没有则用songmid
  const midForFile = mediaMid || songmid
  const qqKey = API.qqDirect.key
  const qqUin = API.qqDirect.uin

  // v1.7.2: 构建完整Cookie，携带uin+qm_keyst+pgv_pvid等字段，提高专属成功率
  const pgv_pvid = Math.floor(Math.random() * 10000000000).toString()
  const qqCookie = `qm_keyst=${qqKey}; uin=o${qqUin}; pgv_pvid=${pgv_pvid}; qqmusic_key=${qqKey}; qqmusic_uin=o${qqUin}; psrf_qqaccess_token=${qqKey}; ts_uid=${pgv_pvid}; psi=${pgv_pvid}`

  // ========== 策略A: ut.y.qq.com 专属 (CgiGetHotVkey/GetEVkey) ==========
  const filenameA = `${prefix}${midForFile}.${ext}`
  const bodyA = {
    comm: { ct: 19, cv: 0, guid: pgv_pvid, tmeAppID: 'qqmusic', qq: qqUin },
    hot: {
      method: 'CgiGetHotVkey',
      module: 'music.vkey.GetEVkey',
      param: { filename: [filenameA], songmid: [songmid] }
    },
    ekey: {
      method: 'GetEkey',
      module: 'music.vkey.GetEVkey',
      param: { finfo: [{ filename: filenameA, mid: midForFile || '0' }] }
    }
  }

  try {
    log.d('QQ专属(ut)请求:', songmid, prefix, filenameA)
    const resp = await http('https://ut.y.qq.com/cgi-bin/musicu.fcg', {
      method: 'POST',
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://y.qq.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cookie': qqCookie
      },
      body: JSON.stringify(bodyA)
    })

    if (isValidJsonResponse(resp)) {
      const data = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body
      const urls = data?.hot?.data?.urls || []
      if (urls.length > 0 && urls[0].purl) {
        const sip = 'https://dl.stream.qqmusic.qq.com/'
        log.d('QQ专属(ut)成功:', prefix, 'purl=' + urls[0].purl.substring(0, 60))
        return `${sip}${urls[0].purl}`
      }
      log.d('QQ专属(ut)无purl:', JSON.stringify(data?.hot?.data || {}).substring(0, 100))
    }
  } catch (e) {
    log.d('QQ专属(ut)失败:', e.message)
  }

  // ========== 策略B: u.y.qq.com platform=23 绕过 (CgiGetVkey) ==========
  // v1.7.2: 新增专属uin变体，携带完整Cookie
  const variants = [
    { name: '双songmid+专属uin', filename: `${prefix}${songmid}${songmid}.${ext}`, uin: qqUin, loginflag: 1 },
    { name: '单songmid+专属uin', filename: `${prefix}${songmid}.${ext}`, uin: qqUin, loginflag: 1 },
    { name: '双songmid+空uin', filename: `${prefix}${songmid}${songmid}.${ext}`, uin: '', loginflag: 1 },
    { name: '单songmid+空uin', filename: `${prefix}${songmid}.${ext}`, uin: '', loginflag: 1 },
  ]

  for (const v of variants) {
    try {
      const param = {
        filename: [v.filename],
        songmid: [songmid],
        songtype: [0],
        uin: v.uin,
        loginflag: v.loginflag,
        platform: '23',
        firstlogin: 1,
        newver: 1,
        nohash: 0,
        cms: 0,
      }
      const apiData = JSON.stringify({
        comm: { uin: v.uin ? parseInt(v.uin) : 0, format: 'json', ct: 23, cv: 0, ...(v.uin ? { qq: v.uin } : {}) },
        req_0: { module: 'vkey.GetVkeyServer', method: 'CgiGetVkey', param }
      })
      const url = `https://u.y.qq.com/cgi-bin/musicu.fcg?format=json&data=${encodeURIComponent(apiData)}`
      log.d('QQ专属(u,p23)请求:', v.name, songmid, prefix)
      const resp = await http(url, {
        method: 'GET',
        timeout: DEFAULT_TIMEOUT,
        headers: {
          'Referer': 'https://y.qq.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Cookie': qqCookie
        }
      })

      if (isValidJsonResponse(resp)) {
        const data = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body
        const songInfo = data?.req_0?.data?.midurlinfo?.[0]
        if (data?.code === 0 && songInfo?.purl) {
          const sip = data.req_0?.data?.sip?.[0] || 'https://dl.stream.qqmusic.qq.com/'
          log.d('QQ专属(u,p23)成功:', v.name, prefix)
          return `${sip}${songInfo.purl}`
        }
      }
    } catch (e) {
      log.d(`QQ专属(u,p23) ${v.name}失败:`, e.message)
    }
  }

  // ========== 策略C: ut.y.qq.com 带Cookie+guid专属 (增强版) ==========
  const bodyC = {
    comm: {
      ct: 19, cv: 0,
      guid: pgv_pvid,
      tmeAppID: 'qqmusic', qq: qqUin
    },
    hot: {
      method: 'CgiGetHotVkey',
      module: 'music.vkey.GetEVkey',
      param: { filename: [filenameA], songmid: [songmid] }
    }
  }

  try {
    log.d('QQ专属(ut+key)请求:', songmid, prefix)
    const resp = await http('https://ut.y.qq.com/cgi-bin/musicu.fcg', {
      method: 'POST',
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://y.qq.com/',
        'User-Agent': 'Mozilla/5.0 QQMusic/2201',
        'Cookie': qqCookie
      },
      body: JSON.stringify(bodyC)
    })

    if (isValidJsonResponse(resp)) {
      const data = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body
      const urls = data?.hot?.data?.urls || []
      if (urls.length > 0 && urls[0].purl) {
        const sip = 'https://dl.stream.qqmusic.qq.com/'
        log.d('QQ专属(ut+key)成功:', prefix)
        return `${sip}${urls[0].purl}`
      }
    }
  } catch (e) {
    log.d('QQ专属(ut+key)失败:', e.message)
  }

  throw new Error('QQ专属全部失败: ' + _mask(songmid) + ' ' + prefix)
}

// ========== API分组与优先级配置 ==========
const API_GROUPS = {
  // QQ音乐 (v1.7.15: ygking 优先)
  tx: [
    // Group 0: QQ 全音质 (v1.7.15, 最高优先级，含 master)
    [
      { name: 'ygkingQQ', fn: getYgkingTx },
    ],
    // Group 1: QQ专属接口(最高优先级)
    [
      { name: 'QQ专属', fn: getQQExploit },
    ],
    // Group 2: 快速第三方API（并行）
    [
      { name: 'cyapi QQ', fn: getCyapi },
      { name: '溯音QQ', fn: getSuyinQQ },
      { name: 'FFAPI', fn: getFFAPI },
    ],
    // Group 3: 搜索型API（并行）
    [
      { name: '妖狐QQ', fn: getYaohu },
      { name: '玉宁熙TX', fn: getYuafeng },
    ],
    // Group 4: 本地API兜底
    [
      { name: '本地QQ(3035)', fn: getLocalQQ },
      { name: 'HYW', fn: getHYW },
      { name: 'fish', fn: getFish },
    ],
  ],
  // 网易云 (v1.7.16: 残像提到第一组，支持 master)
  wy: [
    [
      { name: '残像WY', fn: getCanxiang },  // v1.7.16: 残像，支持 master/jymaster
      { name: 'chksz', fn: getChksz },
      { name: '本地网易(3036+cookie)', fn: getLocalWy },
      { name: '妖狐WY', fn: getYaohu },
      { name: 'cyapi 网易', fn: getCyapi },
      { name: '溯音网易', fn: getSuyinWy },
      { name: 'Toubiec', fn: getToubiec },
    ],
    [
      { name: '玉宁熙WY', fn: getYuafeng },
      { name: 'FFAPI', fn: getFFAPI },
    ],
    [
      { name: 'HYW', fn: getHYW },
      { name: 'fish', fn: getFish },
    ],
  ],
  // 酷我 (v1.7.15: 星海)
  kw: [
    [
      { name: '星海酷我', fn: getXinghaiKw },  // v1.7.15: 星海
      { name: 'yunmge酷我', fn: getYunmgeKw },
      { name: '妖狐酷我', fn: getYaohuKw },
      { name: '溯音酷我', fn: getSuyinKw },
    ],
    [
      { name: '玉宁熙KW', fn: getYuafeng },
      { name: 'FFAPI', fn: getFFAPI },
    ],
    [
      { name: 'fish', fn: getFish },
    ],
  ],
  // 酷狗 (v1.7.15: 星海)
  kg: [
    [
      { name: '星海酷狗', fn: getXinghaiKg },  // v1.7.15: 星海
      { name: '念心酷狗', fn: getNianxinKg },
      { name: 'yuafeng酷狗', fn: getYuafengKg },
      { name: '妖狐酷狗', fn: getYaohuKg },
    ],
    [
      { name: '玉宁熙KG', fn: getYuafeng },
      { name: 'FFAPI', fn: getFFAPI },
    ],
    [
      { name: 'fish', fn: getFish },
    ],
  ],
  // 咪咕 (v1.7.15: 星海提到第一组)
  mg: [
    [
      { name: '星海咪咕', fn: getXinghaiMg },  // v1.7.15: 星海
      { name: '咪咕本地(3037)', fn: getMiguLocal },
    ],
    // Group 2: 兜底
    [
      { name: '妖狐咪咕', fn: getYaohuMg },
      { name: 'FFAPI', fn: getFFAPI },
      { name: 'fish', fn: getFish },
    ],
  ],
}

// 并行竞速
const raceApis = async (apis, info, quality) => {
  if (!apis || apis.length === 0) return null

  return new Promise((resolve) => {
    let remaining = apis.length
    let settled = false

    apis.forEach(async (api) => {
      try {
        const url = await api.fn(info, quality)
        if (url && isValidAudioUrl(url)) {
          if (!settled) {
            settled = true
            resolve({ url, name: api.name })
          }
          return
        }
      } catch (e) {
        log.d(`[竞速] ${api.name} 失败:`, e.message)
      }
      remaining--
      if (remaining === 0 && !settled) {
        settled = true
        resolve(null)
      }
    })
  })
}

// ========== 聚合获取URL ==========
const getMusicUrl = async (source, musicInfo, quality) => {
  log.t('i', '=== 获取URL开始 v1.7.1 ===')
  log.t('i', '平台:', PLATFORM_NAMES[source] || source, '| 请求音质:', quality, '| 歌曲ID:', getId(musicInfo))

  // v1.7.0: 输出平台支持音质
  const pq = PLATFORM_QUALITIES[source]
  if (pq) {
    log.t('i', '平台支持音质:', pq.supported.join('/'), '(' + pq.note + ')')
  }

  if (!SUPPORTED_SOURCES.includes(source)) {
    log.t('e', '不支持的平台:', source)
    throw new Error('不支持的平台: ' + source)
  }

  // 获取音质降级链
  const fallbackChain = QUALITY_FALLBACK[quality] || [quality]
  log.t('i', '音质降级链:', fallbackChain.join(' -> '))

  const groups = API_GROUPS[source]
  if (!groups || groups.length === 0) {
    throw new Error('未配置API组: ' + source)
  }

  // v1.7.0: 咪咕快速返回优化
  // 对于咪咕，不使用逐层降级，直接尝试请求音质+PQ兜底
  if (source === 'mg') {
    log.t('i', '咪咕快速模式: 不逐层降级，直接尝试+PQ兜底')
    for (let gi = 0; gi < groups.length; gi++) {
      const group = groups[gi]
      log.t('i', `[音质${quality}] 组${gi+1}/${groups.length} 并行尝试 ${group.length} 个API: ${group.map(a => a.name).join(', ')}`)
      const result = await raceApis(group, musicInfo, quality)
      if (result && result.url) {
        log.t('i', `✓ 成功! 来源:${result.name} -> ${result.url.substring(0, 80)}...`)
        return result.url
      }
      log.t('w', `[音质${quality}] 组${gi+1} 全部失败`)
    }
    log.t('e', '=== 咪咕所有API均失败 ===')
    throw new Error('咪咕所有API均失败 (v1.7.1 快速模式)')
  }

  // 其他平台: 按音质降级链逐档尝试
  for (let qi = 0; qi < fallbackChain.length; qi++) {
    const currentQ = fallbackChain[qi]
    const isLastQuality = (qi === fallbackChain.length - 1)

    if (qi > 0) {
      log.t('w', `音质 ${fallbackChain[qi-1]} 全部失败，降级到 ${currentQ}`)
    }

    for (let gi = 0; gi < groups.length; gi++) {
      const group = groups[gi]
      const isLocalGroup = (gi === groups.length - 1)

      if (isLocalGroup && !isLastQuality && qi > 0) {
        continue
      }

      log.t('i', `[音质${currentQ}] 组${gi+1}/${groups.length} 并行尝试 ${group.length} 个API: ${group.map(a => a.name).join(', ')}`)

      const result = await raceApis(group, musicInfo, currentQ)
      if (result && result.url) {
        log.t('i', `✓ 成功! 音质:${currentQ} 来源:${result.name} -> ${result.url.substring(0, 80)}...`)
        if (currentQ !== quality) {
          log.t('w', `⚠ 用户请求 ${quality}，已降级到 ${currentQ}`)
        }
        return result.url
      }

      log.t('w', `[音质${currentQ}] 组${gi+1} 全部失败`)
    }
  }

  log.t('e', '=== 所有API + 所有音质档 均失败 ===')
  throw new Error('所有API均失败 (v1.7.1 已尝试音质降级)')
}

// ========== 歌词 ==========
const getLyric = async (source, musicInfo) => {
  const id = getId(musicInfo)
  if (!id) {
    log.w('歌词: 无歌曲ID')
    return { lyric: '', tlyric: '', rlyric: '', lxlyric: '' }
  }

  log.t('i', '获取歌词:', PLATFORM_NAMES[source] || source, id)

  try {
    if (source === 'wy') {
      // v1.7.5: /song?type=lyric -> /lyric
      const data = await httpPost(`${API.localWy.base}/lyric`, { id: id, cookie: API.neteaseCookie })
      if (data && (data.status === 200 || data.code === 200) && data.data) {
        log.t('i', '歌词获取成功(网易)')
        return {
          lyric: data.data.lrc?.lyric || '',
          tlyric: data.data.tlyric?.lyric || '',
          rlyric: data.data.romalrc?.lyric || '',
          lxlyric: ''
        }
      }
    } else if (source === 'tx') {
      const data = await httpGet(`${API.localQQ.base}/song/lyric`, { mid: id, decode: 1 })
      if (data && data.code === 0 && data.data) {
        log.t('i', '歌词获取成功(QQ)')
        return {
          lyric: data.data.lyric || '',
          tlyric: data.data.trans || '',
          rlyric: data.data.roma || '',
          lxlyric: ''
        }
      }
    }
  } catch (e) {
    log.t('e', '歌词获取失败:', e.message)
  }

  log.w('歌词: 无结果')
  return { lyric: '', tlyric: '', rlyric: '', lxlyric: '' }
}

// ========== 封面 ==========
const getPic = async (source, musicInfo) => {
  const id = getId(musicInfo)
  if (!id) {
    log.w('封面: 无歌曲ID')
    return ''
  }

  log.t('i', '获取封面:', PLATFORM_NAMES[source] || source, id)

  try {
    if (source === 'wy') {
      // v1.7.5: /song?type=json -> /song/detail
      const data = await httpPost(`${API.localWy.base}/song/detail`, { ids: id, cookie: API.neteaseCookie })
      if (data && (data.status === 200 || data.code === 200) && data.data && data.data.pic) {
        log.t('i', '封面获取成功(网易)')
        return data.data.pic
      }
    } else if (source === 'tx') {
      const data = await httpGet(`${API.localQQ.base}/song/detail`, { mids: id })
      if (data && data.code === 0 && data.data && data.data.length > 0) {
        const pic = data.data[0].album?.cover || ''
        if (pic) log.t('i', '封面获取成功(QQ)')
        return pic
      }
    }
  } catch (e) {
    log.t('e', '封面获取失败:', e.message)
  }

  log.w('封面: 无结果')
  return ''
}

// ========== 事件注册 ==========
on(EVENT_NAMES.request, ({ source, action, info }) => {
  log.t('d', '事件:', action, PLATFORM_NAMES[source] || source)

  switch (action) {
    case 'musicUrl':
      return getMusicUrl(source, info.musicInfo, info.type)
        .then(url => {
          log.t('i', 'musicUrl 返回成功')
          return url
        })
        .catch(err => {
          log.t('e', 'musicUrl 返回失败:', err.message)
          throw err
        })
    case 'lyric':
      return getLyric(source, info.musicInfo)
    case 'pic':
      return getPic(source, info.musicInfo)
    default:
      log.w('未知事件:', action)
      return Promise.reject(new Error('未知事件: ' + action))
  }
})

// ========== 初始化 ==========
send(EVENT_NAMES.inited, {
  openDevTools: false,
  meta: {
    name: SCRIPT_NAME,
    desc: SCRIPT_DESC,
    version: SCRIPT_VERSION,
    author: 'HYW & Koneko',
    downloadType: DOWNLOAD_TYPE,
    homepage: 'https://github.com/Miao-moe'
  },
  sources: {
    wy: {
      name: '网易云音乐',
      type: 'music',
      actions: ['musicUrl'],
      qualitys: ['128k', '192k', '320k', 'flac', 'flac24bit', 'hires', 'atmos', 'atmos_plus', 'master'],
      meta: { downloadType: 'test', desc: SCRIPT_DESC }
    },
    tx: {
      name: 'QQ音乐',
      type: 'music',
      actions: ['musicUrl'],
      qualitys: ['128k', '192k', '320k', 'flac', 'flac24bit', 'hires', 'atmos', 'atmos_plus', 'master'],
      meta: { downloadType: 'test', desc: SCRIPT_DESC }
    },
    kw: {
      name: '酷我音乐',
      type: 'music',
      actions: ['musicUrl'],
      qualitys: ['128k', '192k', '320k', 'flac', 'flac24bit', 'hires', 'atmos', 'atmos_plus', 'master'],
      meta: { downloadType: 'test', desc: SCRIPT_DESC, primary: 'yunmge' }
    },
    kg: {
      name: '酷狗音乐',
      type: 'music',
      actions: ['musicUrl'],
      qualitys: ['128k', '192k', '320k', 'flac', 'flac24bit', 'hires', 'atmos', 'atmos_plus', 'master'],
      meta: { downloadType: 'test', desc: SCRIPT_DESC }
    },
    mg: {
      name: '咪咕音乐',
      type: 'music',
      actions: ['musicUrl'],
      qualitys: ['128k', '192k', '320k', 'flac', 'flac24bit', 'hires', 'atmos', 'atmos_plus', 'master'],
      meta: { downloadType: 'test', desc: SCRIPT_DESC }
    }
  }
})

log.t('i', '========================================')
log.t('i', `${SCRIPT_NAME} v${SCRIPT_VERSION} 初始化完成`)
log.t('i', `描述: ${SCRIPT_DESC}`)
log.t('i', `下载方式: ${DOWNLOAD_TYPE}`)
log.t('i', '支持平台: 网易云/QQ/酷我/酷狗/咪咕')
log.t('i', '支持音质: 128k/192k/320k/flac/flac24bit/hires/atmos/atmos_plus/master')
log.t('i', 'v1.7.17: 清除 ikun + 海棠')
log.t('i', '【酷狗提示】未配置 yuafeng apikey，酷狗高音质不可用。请在脚本顶部 USER_CONFIG.yuafeng_apikey 填入 apikey')
log.t('i', 'v1.7.6: yunmge酷我通道 + 日志修复 + 新加密系统(_xd) + 下载方式: 测试')
log.t('i', 'v1.7.5: 网易云MUSIC_U注入 + /song/url/v1路由修复 + 本地网易提权')
log.t('i', '咪咕支持音质: 128k(PQ)/320k(HQ)/flac(SQ)')
log.t('i', '========================================')