/*!
 * @name 星海音乐源
 * @description GDAPI | 聚合 | ChKSz API | 全平台支持24FLAC，网易、酷狗、QQ最高支持母带
 * @version v3.2.11
 * @Update  小优化：修复GD接口URL拼接错误；适配后端；优化初始化速度
 * @author 万去了了
 * @homepage https://zrcdy.dpdns.org/
 * @lastUpdate 2026-08-06
 * @md5 
 */

const { EVENT_NAMES, request, on, send, env } = globalThis.lx;
const URL_CONFIG = {
    domains: {
        primary: 'yy.zddyr.top',
        fallback: 'zrcdy.dpdns.org',
        gdStudio: 'music-api.gdstudio.xyz',
        vip: 'api.chksz.top'
    },
    paths: {
        backend: '/lx/api/',
        version: '/lx/versionh2.php',
        update: '/lx/vers.php',
        ip: '/ip.php',
        gdApi: '/api.php',
        vipApi: '/api/163_music'
    },
    gdParams: 'use_xbridge3=true&loader_name=forest&need_sec_link=1&sec_link_scene=im&theme=light'
};

const buildUrl = (domainKey, pathKey, extraQuery = '') => {
    const domain = URL_CONFIG.domains[domainKey];
    const path = URL_CONFIG.paths[pathKey];
    if (!domain || !path) throw new Error(`URL配置错误: ${domainKey} / ${pathKey}`);
    let url = `https://${domain}${path}`;
    if (extraQuery) {
        if (extraQuery.startsWith('&') && !path.includes('?')) {
            url += '?' + extraQuery.substring(1);
        } else {
            url += extraQuery;
        }
    }
    return url;
};

const SCRIPT_VERSION = 'v3.2.11';
const SCRIPT_NAME = 'XingHaiMusicSource';
const SOURCE_MAP = { tx: 'qq', mg: 'migu', kw: 'kw', kg: 'kg' };
const PLATFORM_NAMES = { wy: '网易云音乐', tx: 'QQ音乐', kw: '酷我音乐', kg: '酷狗音乐', mg: '咪咕音乐' };
const MUSIC_QUALITIES = {
    wy: ['128k','192k','320k','flac','flac24bit','hires','jyeffect','sky','jymaster'],
    tx: ['128k','192k','320k','flac','hires','atmos','atmos_plus','master'],
    kw: ['128k','192k','320k','flac','flac24bit'],
    kg: ['128k','320k','flac','hires','atmos','master'],
    mg: ['128k','320k','flac']
};
const NETEASE_VIP_LEVEL_MAP = { flac: 'lossless', flac24bit: 'hires', hires: 'hires', jyeffect: 'jyeffect', sky: 'sky', jymaster: 'jymaster' };
const NETEASE_VIP_QUALITY_SET = new Set(Object.keys(NETEASE_VIP_LEVEL_MAP));

let userIp = null;
let userToken = '';
let clientHeader = '';
let deviceId = '';
let availablePlatforms = [];
const extraCache = new Map();

// -------------------- 工具函数 --------------------
function isBuffer(obj) {
    return obj && typeof obj === 'object' &&
        ((typeof Buffer !== 'undefined' && Buffer.isBuffer(obj)) ||
        (typeof obj.constructor === 'function' && obj.constructor.name === 'Buffer'));
}

function safeParseBody(body) {
    if (typeof body === 'string') {
        const trimmed = body.trim();
        if (/^[{["]/.test(trimmed)) { try { return JSON.parse(trimmed); } catch (e) {} }
        return body;
    }
    if (typeof body === 'object' && body !== null) {
        try { if (typeof body.toString === 'function' && body.toString() !== '[object Object]') body = body.toString('utf-8'); } catch (e) {}
        if (typeof body === 'object' && !isBuffer(body)) return body;
    }
    try {
        if (isBuffer(body)) {
            if (globalThis.lx?.utils?.buffer?.bufToString) body = globalThis.lx.utils.buffer.bufToString(body, 'utf-8');
            else if (typeof Buffer !== 'undefined') body = Buffer.from(body).toString('utf-8');
            else body = String(body);
        }
    } catch (e) {}
    if (typeof body === 'string') {
        const trimmed = body.trim();
        if (/^[{["]/.test(trimmed)) { try { return JSON.parse(trimmed); } catch (e) {} }
    }
    return body;
}

function safeBase64Encode(str) {
    try {
        if (globalThis.lx?.utils?.buffer?.from) {
            const buf = globalThis.lx.utils.buffer.from(str, 'utf-8');
            return globalThis.lx.utils.buffer.bufToString(buf, 'base64');
        }
        if (typeof Buffer !== 'undefined') {
            return Buffer.from(str, 'utf-8').toString('base64');
        }
        return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
        return str;
    }
}

function generateDeviceId() {
    const prefix = 'lx-online-';
    const randomChars = Math.random().toString(36).substring(2, 8);
    const timestampPart = Date.now().toString(36).slice(-4);
    return prefix + randomChars + timestampPart;
}

function buildClientHeader() {
    let deviceType = 'unknown';
    try {
        const p = (env?.platform || '').toLowerCase();
        if (p.includes('android')) deviceType = 'Android';
        else if (p.includes('ios')) deviceType = 'iOS';
        else if (p.includes('win')) deviceType = 'Windows';
        else if (p.includes('mac')) deviceType = 'macOS';
        else if (p.includes('linux')) deviceType = 'Linux';
    } catch (e) {}
    return `${SCRIPT_NAME}/${SCRIPT_VERSION} (${deviceType})`;
}

function generateToken(ip) {
    if (!deviceId) deviceId = generateDeviceId();
    const payload = {
        device_id: deviceId,
        ip: ip || '0.0.0.0',
        timestamp: Math.floor(Date.now() / 1000),
        random: Math.random().toString(36).substring(2, 12)
    };
    return safeBase64Encode(JSON.stringify(payload));
}

const httpFetch = (url, options = {}) => new Promise((resolve, reject) => {
    const headers = { ...(options.headers || {}) };
    if (!options.noAuth) {
        if (userToken) headers['X-Token'] = userToken;
        if (clientHeader) headers['X-Client'] = clientHeader;
    }
    if (!headers['User-Agent']) {
        headers['User-Agent'] = 'lx-music';
    }
    const finalOptions = { ...options, headers };
    request(url, finalOptions, (err, resp) => {
        if (err) return reject(err);
        const body = safeParseBody(resp.body);
        resolve({ body, statusCode: resp.statusCode, headers: resp.headers || {} });
    });
});

// -------------------- 音质映射 --------------------
function mapQuality(target, avail) {
    const pm = { '臻品母带': 'jymaster', '臻品音质2.0': 'sky', '臻品音质AI': 'jyeffect', '臻品音质': 'jyeffect', 'Hires 无损24-Bit': 'hires', 'Hi-Res': 'hires', 'FLAC': 'flac', '320k': '320k', '192k': '192k', '128k': '128k' };
    if (avail.includes(target)) return target;
    const m = pm[target]; if (m && avail.includes(m)) return m;
    const order = ['jymaster', 'sky', 'jyeffect', 'hires', 'flac24bit', 'flac', '320k', '192k', '128k'];
    for (const q of order) if (avail.includes(q)) return q;
    return avail[0] || '128k';
}

// -------------------- 网络接口 --------------------
async function fetchIp() {
    try {
        const r = await httpFetch(buildUrl('primary', 'ip'), { timeout: 3000 });
        if (r.body?.ip) {
            userIp = r.body.ip;
            userToken = generateToken(userIp);
        }
    } catch (e) {}
}

async function getWyGDUrl(id, q) {
    const brMap = { '128k':'128','192k':'192','320k':'320','flac':'740','flac24bit':'999' };
    const url = buildUrl('gdStudio', 'gdApi', `&${URL_CONFIG.gdParams}&types=url&source=netease&id=${id}&br=${brMap[q]||'320'}`);
    const resp = await httpFetch(url, { 
        headers: { 'User-Agent': 'LX-Music-Mobile' }, 
        timeout: 8000,
        noAuth: true
    });
    if (resp.statusCode !== 200 || !resp.body.url) {
        const status = resp.statusCode;
        throw new Error(`GD接口状态${status}，未返回音频`);
    }
    return { url: resp.body.url, lyric: null, cover: null };
}

async function getWyVipUrl(id, q) {
    const level = NETEASE_VIP_LEVEL_MAP[q];
    if (!level) throw new Error('不支持该品质');
    const url = buildUrl('vip', 'vipApi', `?id=${id}&level=${level}`);
    const resp = await httpFetch(url, { 
        headers: { 'User-Agent': 'LX-Music-Mobile' }, 
        timeout: 8000,
        noAuth: true
    });
    if (resp.statusCode !== 200 || resp.body.code !== 200 || !resp.body.data?.url) {
        const status = resp.statusCode;
        throw new Error(`VIP接口状态${status}，未返回音频`);
    }
    return { url: resp.body.data.url, lyric: null, cover: null };
}

async function getUrlFromBackend(source, musicInfo, quality) {
    const backendSource = SOURCE_MAP[source] || source;
    const baseUrl = buildUrl('primary', 'backend');
    const params = {};
    if (backendSource === 'kg') {
        const types = musicInfo._types || {};
        params.source = 'kg';
        params.quality = quality || '';
        params.songmid = musicInfo.songmid || musicInfo.id || '';
        params.albumId = musicInfo.albumId || '';
        params.mainHash = musicInfo.hash || '';
        if (types[quality]?.hash) params.hash = types[quality].hash;
    } else {
        params.source = backendSource;
        params.name = musicInfo.name || '';
        params.singer = musicInfo.singer || '';
        params.songmid = musicInfo.songmid || musicInfo.id || '';
        params.interval = musicInfo.interval || '';
        params.albumName = musicInfo.albumName || musicInfo.album || '';
        params.quality = quality || '';
    }
    const query = Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
    const url = `${baseUrl}?${query}`;
    const resp = await httpFetch(url, { method: 'GET', timeout: 8000 });
    if (resp.statusCode !== 200) throw new Error(`后端接口状态${resp.statusCode}`);
    const data = resp.body;
    if (data.code !== 200 || !data.url) throw new Error(data.msg || '后端无可用链接');
    return { url: data.url, lyric: data.lrc || null, cover: data.picture || null };
}

async function fetchMusicUrl(source, musicInfo, quality) {
    const id = musicInfo.hash ?? musicInfo.songmid ?? musicInfo.id;
    if (!id) throw new Error('缺少 songId');
    const actualQuality = mapQuality(quality, MUSIC_QUALITIES[source] || ['128k','320k','flac']);
    let result = { url: '', lyric: null, cover: null };
    if (source === 'wy') {
        if (NETEASE_VIP_QUALITY_SET.has(actualQuality)) {
            try { result = await getWyVipUrl(id, actualQuality); } catch (e) {}
        }
        if (!result.url) result = await getWyGDUrl(id, actualQuality);
    } else {
        result = await getUrlFromBackend(source, musicInfo, actualQuality);
    }
    extraCache.set(id, { lyric: result.lyric, cover: result.cover });
    return result.url;
}

// -------------------- 初始化逻辑 --------------------
async function checkUpdate() {
    const versionUrls = [
        buildUrl('primary', 'version') + '?ver=' + encodeURIComponent(SCRIPT_VERSION),
        buildUrl('fallback', 'version') + '?ver=' + encodeURIComponent(SCRIPT_VERSION)
    ];
    try {
        const resp = await Promise.any(versionUrls.map(u => httpFetch(u, { timeout: 5000 })));
        if (resp.statusCode === 200 && resp.body && resp.body.update_url) {
            send(EVENT_NAMES.updateAlert, {
                log: resp.body.message || `发现新版本 ${resp.body.version || ''}`,
                updateUrl: resp.body.update_url
            });
        }
    } catch (e) {}
}

// -------------------- 事件处理 --------------------
on(EVENT_NAMES.request, async ({ action, source, info }) => {
    if (!source || !MUSIC_QUALITIES[source]) throw new Error(`不支持的音乐源: ${source}`);
    if (action === 'musicUrl') {
        if (!info?.musicInfo || !info.type) throw new Error('参数不完整');
        return fetchMusicUrl(source, info.musicInfo, info.type);
    }
    const id = info?.musicInfo?.hash ?? info?.musicInfo?.songmid ?? info?.musicInfo?.id;
    const cached = extraCache.get(id);
    if (action === 'lyric') return cached?.lyric ? { lyric: cached.lyric, tlyric: '' } : null;
    if (action === 'pic') return cached?.cover || null;
    throw new Error(`不支持的操作: ${action}`);
});

// -------------------- 启动 --------------------
(async () => {
    deviceId = generateDeviceId();
    clientHeader = buildClientHeader();
    userToken = generateToken(null);
    
    availablePlatforms = ['wy', 'tx', 'kg', 'kw', 'mg'];
    const sources = {};
    availablePlatforms.forEach(p => { sources[p] = { name: PLATFORM_NAMES[p], type: 'music', actions: ['musicUrl', 'lyric', 'pic'], qualitys: MUSIC_QUALITIES[p] }; });
    send(EVENT_NAMES.inited, { status: true, sources });

    fetchIp();
    checkUpdate();
})();