/*! 
 * @name 星海音乐源
 * @description GDAPI | 聚合 | ChKSz API | 
 * @version v3.2.8 #1，优化kw，tx；2，优化kg，提高响应速度，请求音质提升（也许有母带）
 * @author 万去了了
 * @homepage https://zrcdy.dpdns.org/
 https://zddyr.top
 * @lastUpdate 2026-07-13
 */

const { EVENT_NAMES, request, on, send, env } = globalThis.lx;

// 网易云独立 API
const MAIN_API_BASE = 'https://music-api.gdstudio.xyz/api.php?use_xbridge3=true&loader_name=forest&need_sec_link=1&sec_link_scene=im&theme=light';
const NETEASE_VIP_API = 'https://api.chksz.top/api/163_music';

// 更新检查（并行竞速）
const PRIMARY_VERSION_URL = 'https://yy.zddyr.top/lx/versionh2.php';
const FALLBACK_VERSION_URL = 'https://zrcdy.dpdns.org/lx/versionh2.php';
const FALLBACK_UPDATE_URL = 'https://zrcdy.dpdns.org/lx/vers.php';

const SCRIPT_VERSION = 'v3.2.8';

// 保底后端路由
const DEFAULT_BACKEND_ROUTES = {
    qq: 'https://yy.zddyr.top/lx/api/',
    kg: 'https://yy.zddyr.top/lx/api/',
    kw: 'https://yy.zddyr.top/lx/api/',
    migu: 'https://yy.zddyr.top/lx/api/',
};
const DEFAULT_IP_QUERY_URL = 'https://yy.zddyr.top/ip.php';

const SOURCE_MAP = { tx: 'qq', mg: 'migu', kw: 'kw', kg: 'kg' };
const PLATFORM_NAMES = {
    wy: '网易云音乐', tx: 'QQ音乐', kw: '酷我音乐', kg: '酷狗音乐', mg: '咪咕音乐'
};
const MUSIC_QUALITIES = {
    wy: ['128k','192k','320k','flac','flac24bit','hires','jyeffect','sky','jymaster'],
    tx: ['128k','192k','320k','flac'],
    kw: ['128k','192k','320k','flac','flac24bit'],
    kg: ['128k','320k','flac','hires','atmos','master'],
    mg: ['128k','320k','flac']
};
const NETEASE_VIP_LEVEL_MAP = { hires:'hires', jyeffect:'jyeffect', sky:'sky', jymaster:'jymaster', flac24bit:'hires' };
const NETEASE_VIP_QUALITY_SET = new Set(['hires','jyeffect','sky','jymaster','flac24bit']);

let userIp = null;
let availablePlatforms = [];
let backendRoutes = {};
let ipQueryUrl = null;
const extraCache = new Map();

// ======================== 工具函数 ========================
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

const httpFetch = (url, options = {}) => new Promise((resolve, reject) => {
    const start = Date.now();
    request(url, options, (err, resp) => {
        const elapsed = Date.now() - start;
        if (err) {
            console.error(`[星海] 网络请求失败 (${url}): ${err.message}`);
            return reject(err);
        }
        const body = safeParseBody(resp.body);
        resolve({ body, statusCode: resp.statusCode, headers: resp.headers || {}, elapsed });
    });
});

function mapQuality(target, avail) {
    const pm = {
        '臻品母带': 'jymaster', '臻品音质2.0': 'sky', '臻品音质AI': 'jyeffect', '臻品音质': 'jyeffect',
        'Hires 无损24-Bit': 'hires', 'Hi-Res': 'hires', 'FLAC': 'flac', '320k': '320k', '192k': '192k', '128k': '128k'
    };
    if (avail.includes(target)) return target;
    const m = pm[target]; if (m && avail.includes(m)) return m;
    const order = ['jymaster', 'sky', 'jyeffect', 'hires', 'flac24bit', 'flac', '320k', '192k', '128k'];
    for (const q of order) if (avail.includes(q)) return q;
    return avail[0] || '128k';
}

async function fetchIp() {
    if (!ipQueryUrl) return;
    try { const r = await httpFetch(ipQueryUrl, { timeout: 3000 }); if (r.body?.ip) userIp = r.body.ip; } catch (e) {}
}

// ======================== 网易云 ========================
async function getWyGDUrl(id, q) {
    const brMap = { '128k':'128','192k':'192','320k':'320','flac':'740','flac24bit':'999' };
    const url = `${MAIN_API_BASE}&types=url&source=netease&id=${id}&br=${brMap[q]||'320'}`;
    const resp = await httpFetch(url, { headers: { 'User-Agent': 'LX-Music-Mobile' }, timeout: 8000 });
    if (resp.statusCode !== 200) throw new Error(`GD HTTP ${resp.statusCode}`);
    if (!resp.body.url) throw new Error('GD未返回音频');
    return { url: resp.body.url, lyric: null, cover: null };
}

async function getWyVipUrl(id, q) {
    const level = NETEASE_VIP_LEVEL_MAP[q] || 'jymaster';
    const url = `${NETEASE_VIP_API}?id=${id}&level=${level}`;
    const resp = await httpFetch(url, { headers: { 'User-Agent': 'LX-Music-Mobile' }, timeout: 8000 });
    if (resp.statusCode !== 200) throw new Error(`VIP HTTP ${resp.statusCode}`);
    if (resp.body.code !== 200 || !resp.body.data?.url) throw new Error('VIP未返回音频');
    return { url: resp.body.data.url, lyric: null, cover: null };
}

// ======================== 后端请求（酷狗多参数适配） ========================
async function getUrlFromBackend(source, musicInfo, quality) {
    const backendSource = SOURCE_MAP[source] || source;
    const baseUrl = backendRoutes[backendSource];
    if (!baseUrl) throw new Error(`未找到平台 ${backendSource} 的后端路由`);

    const params = {};
    if (backendSource === 'kg') {
        // 酷狗新服务所需参数
        const types = musicInfo._types || {};
        const qualityHash = (types[quality] && types[quality].hash) || '';
        const mainHash = musicInfo.hash || '';
        const albumId = musicInfo.albumId || '';
        const songmid = musicInfo.songmid || musicInfo.id || '';

        params.source = 'kg';
        params.quality = quality || '';
        params.songmid = songmid;
        params.albumId = albumId;
        params.mainHash = mainHash;
        if (qualityHash) {
            params.hash = qualityHash;   // 具体音质的 hash
        }
    } else {
        // 其他平台
        params.source    = backendSource;
        params.name      = musicInfo.name || '';
        params.singer    = musicInfo.singer || '';
        params.songmid   = musicInfo.songmid || musicInfo.id || '';
        params.interval  = musicInfo.interval || '';
        params.albumName = musicInfo.albumName || musicInfo.album || '';
        params.quality   = quality || '';
    }

    if (userIp) params.ip = userIp;

    const query = Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&');
    const url = baseUrl + '?' + query;

    const resp = await httpFetch(url, { method: 'GET', timeout: 8000 });

    if (resp.statusCode !== 200) {
        console.error(`[星海] 后端响应异常 (${url}) HTTP状态码: ${resp.statusCode}`);
        throw new Error(`后端状态码 ${resp.statusCode}`);
    }

    const data = resp.body;
    if (data.code !== 200 || !data.url) {
        console.error(`[星海] 后端业务失败 (${url}) 返回: code=${data.code} msg=${data.msg || '无'}`);
        throw new Error(data.msg || '无可用链接');
    }

    return { url: data.url, lyric: data.lrc || null, cover: data.picture || null };
}

// ======================== 获取音乐 URL ========================
async function fetchMusicUrl(source, musicInfo, quality) {
    const start = Date.now();
    const id = musicInfo.hash ?? musicInfo.songmid ?? musicInfo.id;
    if (!id) throw new Error('缺少 songId');

    const availQualities = MUSIC_QUALITIES[source] || ['128k','192k','320k','flac'];
    const actualQuality = mapQuality(quality, availQualities);
    let result = { url: '', lyric: null, cover: null };

    if (source === 'wy') {
        let urlObj = null;
        if (NETEASE_VIP_QUALITY_SET.has(actualQuality)) {
            try { urlObj = await getWyVipUrl(id, actualQuality); } catch (e) { console.error(`[星海] 网易VIP失败: ${e.message}`); }
        }
        if (!urlObj?.url) urlObj = await getWyGDUrl(id, actualQuality);
        result = { url: urlObj.url, lyric: null, cover: null };
    } else {
        result = await getUrlFromBackend(source, musicInfo, actualQuality);
    }

    console.log(`[星海] 获取成功 (${source}) 耗时: ${Date.now()-start}ms`);
    extraCache.set(id, { lyric: result.lyric, cover: result.cover });
    return result.url;
}

// ======================== 初始化 ========================
async function tryFetchConfig(url, timeout = 5000) {
    try {
        const resp = await httpFetch(url, { timeout });
        if (resp.statusCode === 200 && resp.body?.version) {
            console.log(`[星海] 配置获取成功 (${url})`);
            return resp.body;
        } else {
            console.warn(`[星海] 配置接口返回无效 (${url}) HTTP ${resp.statusCode}`);
        }
    } catch (e) {
        console.warn(`[星海] 配置接口请求失败 (${url}): ${e.message}`);
    }
    return null;
}

async function initPlatforms() {
    const initStart = Date.now();

    const [primaryCfg, fallbackCfg] = await Promise.allSettled([
        tryFetchConfig(PRIMARY_VERSION_URL),
        tryFetchConfig(FALLBACK_VERSION_URL)
    ]);

    let configData = null;
    let usedMain = false;

    if (primaryCfg.status === 'fulfilled' && primaryCfg.value) {
        configData = primaryCfg.value;
        usedMain = true;
        console.log('[星海] 主服务器可用，使用主配置');
    } else if (fallbackCfg.status === 'fulfilled' && fallbackCfg.value) {
        configData = fallbackCfg.value;
        console.log('[星海] 主服务器不可用，切换到备用服务器配置');
    }

    if (configData) {
        if (compareVersions(configData.version, SCRIPT_VERSION) > 0) {
            send(EVENT_NAMES.updateAlert, {
                log: configData.changelog || `发现新版本 ${configData.version}`,
                updateUrl: configData.update_url || FALLBACK_UPDATE_URL
            });
        }
        backendRoutes = configData.backend_routes || {};
        ipQueryUrl = configData.ip_query_url || null;
    } else {
        console.warn('[星海] 所有更新接口失败，使用保底配置（主服务器路由）');
        backendRoutes = DEFAULT_BACKEND_ROUTES;
        ipQueryUrl = DEFAULT_IP_QUERY_URL;
        send(EVENT_NAMES.updateAlert, {
            log: '无法获取最新配置，请手动更新。',
            updateUrl: FALLBACK_UPDATE_URL
        });
    }

    const status = {
        wy: true,
        tx: !!backendRoutes.qq, kg: !!backendRoutes.kg,
        kw: !!backendRoutes.kw, mg: !!backendRoutes.migu
    };
    availablePlatforms = Object.keys(status).filter(k => status[k]);

    console.log(`[星海] 初始化完成 (${Date.now()-initStart}ms) | 服务器: ${usedMain?'主':'备用/保底'} | 源: ${availablePlatforms.map(p=>PLATFORM_NAMES[p]).join('、')}`);
}

function compareVersions(a, b) {
    const v1 = a.replace(/^v/, '').split('.').map(Number);
    const v2 = b.replace(/^v/, '').split('.').map(Number);
    for (let i=0; i<Math.max(v1.length, v2.length); i++) {
        const n1=v1[i]||0, n2=v2[i]||0;
        if (n1>n2) return 1; if (n1<n2) return -1;
    }
    return 0;
}

// ======================== 事件处理 ========================
on(EVENT_NAMES.request, async ({ action, source, info }) => {
    if (!source || !MUSIC_QUALITIES[source]) throw new Error(`不支持的音乐源: ${source}`);
    if (action === 'musicUrl') {
        if (!info?.musicInfo || !info.type) throw new Error('参数不完整');
        return fetchMusicUrl(source, info.musicInfo, info.type);
    }
    if (action === 'lyric') {
        const id = info?.musicInfo?.hash ?? info?.musicInfo?.songmid ?? info?.musicInfo?.id;
        const cached = extraCache.get(id);
        return cached?.lyric ? { lyric: cached.lyric, tlyric: '' } : null;
    }
    if (action === 'pic') {
        const id = info?.musicInfo?.hash ?? info?.musicInfo?.songmid ?? info?.musicInfo?.id;
        const cached = extraCache.get(id);
        return cached?.cover || null;
    }
    throw new Error(`不支持的操作: ${action}`);
});

// ======================== 启动 ========================
(async () => {
    console.log(`[星海] ${SCRIPT_VERSION} 启动，环境: ${env}`);
    await initPlatforms();
    fetchIp();
    const sources = {};
    availablePlatforms.forEach(p => {
        sources[p] = { name: PLATFORM_NAMES[p], type: 'music', actions: ['musicUrl','lyric','pic'], qualitys: MUSIC_QUALITIES[p] };
    });
    send(EVENT_NAMES.inited, { status: true, sources });
})();