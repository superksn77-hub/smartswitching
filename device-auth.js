/**
 * SmartSwitching — 기기 인증 시스템
 *
 * Working Memory의 device-auth.js를 기반으로 SmartSwitching용으로 포팅.
 * Firebase 'devices' 컬렉션을 공유하여 관리자 대시보드에서 통합 관리.
 *
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  🔒 동결 선언 (FROZEN) — 이 파일은 함부로 수정 금지                    ║
 * ║                                                                        ║
 * ║  - HW_VERSION (영구 동결: 'v11')                                       ║
 * ║  - collectHardwareSignals / buildHardwareSignals 신호 구성             ║
 * ║  - generateIdFromHardwareSalted / generateDeviceFingerprint 파생 로직   ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

(function () {
  'use strict';

  console.log('[DeviceAuth] 로드됨 — v9 (smartswitch, 우선순위 매칭)');

  // ══════════════════════════════════════════════════════════════════════
  // Firebase 설정 (hearingaid와 동일 프로젝트)
  // ══════════════════════════════════════════════════════════════════════
  const FIREBASE_CONFIG = {
    apiKey:            'AIzaSyB4WLEEmyqMIqHumu0t1N-8KQIXihwB9M',
    authDomain:        'hicog-hearing.firebaseapp.com',
    projectId:         'hicog-hearing',
    storageBucket:     'hicog-hearing.firebasestorage.app',
    messagingSenderId: '974786570936',
    appId:             '1:974786570936:web:e4886fb8588a83f86d624d',
  };

  const COLLECTION = 'devices';
  const APP_NAME    = 'smartswitch';

  const HW_VERSION  = 'v11';
  const CACHE_KEY   = 'sswt_hwfp_' + HW_VERSION;
  const COOKIE_KEY  = 'sswt_fp' + HW_VERSION.replace(/^v/, '');
  const LEGACY_CACHE_KEYS  = ['wmem_hwfp_v11','wmem_hwfp_v10','wmem_hwfp_v9','wmem_hwfp_v8','wmem_hwfp_v7','wmem_hwfp_v6','wmem_hwfp_v5','wmem_hwfp_v4','wmem_hwfp_v3','wmem_hwfp_v2','wmem_hwfp_v1','wmem_hwfp'];
  const LEGACY_COOKIE_KEYS = ['wmem_fp11','wmem_fp10','wmem_fp9','wmem_fp8','wmem_fp7','wmem_fp6','wmem_fp5','wmem_fp4','wmem_fp3','wmem_fp2','wmem_fp1','wmem_fp'];
  const LEGACY_HW_VERSIONS = ['v10','v9','v8','v7','v6','v5','v4','v3','v2','v1'];
  const SALT_KEY    = 'sswt_device_salt_v1';
  const SALT_COOKIE = 'sswt_ds1';
  const LS_KEY      = 'sswt_license_v1';
  const FP_REGEX    = /^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;

  // ══════════════════════════════════════════════════════════════════════
  // Firebase 초기화 (compat CDN 방식)
  // ══════════════════════════════════════════════════════════════════════
  let _db = null;
  let _fbReady = false;

  function initFirebase() {
    if (_fbReady) return _db;
    try {
      if (typeof firebase === 'undefined') {
        _fbReady = true;
        return null;
      }
      if (!firebase.apps || firebase.apps.length === 0) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      _db = firebase.firestore();
      _fbReady = true;
      return _db;
    } catch (e) {
      _fbReady = true;
      return null;
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // SHA-256 해시
  // ══════════════════════════════════════════════════════════════════════
  async function sha256(text) {
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        return Array.from(new Uint8Array(buf))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      }
    } catch (_) {}
    let h = 5381;
    for (let i = 0; i < text.length; i++) h = ((h << 5) + h) ^ text.charCodeAt(i);
    return (h >>> 0).toString(16).padStart(8, '0').repeat(8);
  }

  // ══════════════════════════════════════════════════════════════════════
  // 하드웨어 신호 수집
  // ══════════════════════════════════════════════════════════════════════
  function getGPURenderer() {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) return 'no-webgl';
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) return String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL));
      return String(gl.getParameter(gl.RENDERER));
    } catch (_) { return 'no-webgl'; }
  }

  function getOrCreateDeviceSalt() {
    try {
      const v = localStorage.getItem(SALT_KEY);
      if (v && v.length >= 32) return v;
    } catch (_) {}

    // wmemory 솔트 폴백 — 같은 기기에서 wmemory가 먼저 설치된 경우 동일 솔트 사용
    try {
      const wmSalt = localStorage.getItem('wmem_device_salt_v1');
      if (wmSalt && wmSalt.length >= 32) {
        try { localStorage.setItem(SALT_KEY, wmSalt); } catch (_) {}
        return wmSalt;
      }
    } catch (_) {}

    try {
      const m = document.cookie.match(new RegExp(SALT_COOKIE + '=([a-f0-9]{32,})'));
      if (m) {
        try { localStorage.setItem(SALT_KEY, m[1]); } catch (_) {}
        return m[1];
      }
    } catch (_) {}

    // wmemory 쿠키 폴백
    try {
      const m = document.cookie.match(/wmem_ds1=([a-f0-9]{32,})/);
      if (m) {
        try { localStorage.setItem(SALT_KEY, m[1]); } catch (_) {}
        return m[1];
      }
    } catch (_) {}

    let salt;
    try {
      if (crypto.randomUUID) {
        salt = crypto.randomUUID().replace(/-/g, '');
      } else {
        const arr = new Uint8Array(16);
        crypto.getRandomValues(arr);
        salt = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (_) {
      salt = (Date.now().toString(36) +
              Math.random().toString(36).slice(2) +
              Math.random().toString(36).slice(2) +
              Math.random().toString(36).slice(2)).slice(0, 32);
    }

    try { localStorage.setItem(SALT_KEY, salt); } catch (_) {}
    try {
      const exp = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = SALT_COOKIE + '=' + salt + '; expires=' + exp + '; path=/; SameSite=Lax';
    } catch (_) {}
    try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (_) {}
    return salt;
  }

  // ⚠️ hearingaid / wmemory 와 100% 동일해야 함
  function buildHardwareSignals(versionTag) {
    const cpu      = navigator.hardwareConcurrency || 0;
    const ram      = navigator.deviceMemory || 0;
    const platform = navigator.platform || '';
    const sw       = typeof screen !== 'undefined' ? screen.width  : 0;
    const sh       = typeof screen !== 'undefined' ? screen.height : 0;
    const sd       = typeof screen !== 'undefined' ? screen.colorDepth : 0;
    let   tz       = '';
    try { tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || ''); } catch (_) {}
    const touch    = navigator.maxTouchPoints || 0;

    return [
      versionTag,
      cpu, ram, platform, sw, sh, sd, tz, touch
    ].join('|');
  }

  function collectHardwareSignals() {
    return buildHardwareSignals(HW_VERSION);
  }

  async function getHardwareHash() {
    const raw = collectHardwareSignals();
    const hash = await sha256(raw);
    return hash.substring(0, 32);
  }

  async function getLegacyHardwareHashes() {
    const out = [];
    for (let i = 0; i < LEGACY_HW_VERSIONS.length; i++) {
      try {
        const raw = buildHardwareSignals(LEGACY_HW_VERSIONS[i]);
        const hash = await sha256(raw);
        out.push({ version: LEGACY_HW_VERSIONS[i], hash: hash.substring(0, 32) });
      } catch (_) {}
    }
    return out;
  }

  // 가로/세로 바뀐 해시 (모바일 기기 회전 대응)
  function buildHardwareSignalsSwapped(versionTag) {
    const cpu      = navigator.hardwareConcurrency || 0;
    const ram      = navigator.deviceMemory || 0;
    const platform = navigator.platform || '';
    const sw       = typeof screen !== 'undefined' ? screen.height : 0; // 스왑
    const sh       = typeof screen !== 'undefined' ? screen.width  : 0; // 스왑
    const sd       = typeof screen !== 'undefined' ? screen.colorDepth : 0;
    let   tz       = '';
    try { tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || ''); } catch (_) {}
    const touch    = navigator.maxTouchPoints || 0;
    return [versionTag, cpu, ram, platform, sw, sh, sd, tz, touch].join('|');
  }

  async function getAllCandidateHashes() {
    // 현재 + 레거시 + 스왑(가로/세로 반전) 모든 조합의 해시를 반환
    const hashes = [];
    const versions = [HW_VERSION].concat(LEGACY_HW_VERSIONS);
    for (let i = 0; i < versions.length; i++) {
      const v = versions[i];
      try {
        const h1 = await sha256(buildHardwareSignals(v));
        hashes.push(h1.substring(0, 32));
      } catch (_) {}
      try {
        const h2 = await sha256(buildHardwareSignalsSwapped(v));
        hashes.push(h2.substring(0, 32));
      } catch (_) {}
    }
    // 중복 제거
    return hashes.filter(function (h, i) { return hashes.indexOf(h) === i; });
  }

  async function generateIdFromHardwareSalted(salt) {
    const raw = collectHardwareSignals() + '|salt=' + String(salt || '');
    const hash = await sha256(raw);
    const h16 = hash.substring(0, 16).toUpperCase();
    return h16.substring(0,4) + '-' + h16.substring(4,8) + '-' +
           h16.substring(8,12) + '-' + h16.substring(12,16);
  }

  // ══════════════════════════════════════════════════════════════════════
  // 로컬 캐시
  // ══════════════════════════════════════════════════════════════════════
  function readLocalCache() {
    // 1) 현재 버전 localStorage
    try {
      const v = localStorage.getItem(CACHE_KEY);
      if (v && FP_REGEX.test(v)) return v;
    } catch (_) {}
    // 2) 과거 버전 localStorage 폴백 (wmemory 호환)
    for (let i = 0; i < LEGACY_CACHE_KEYS.length; i++) {
      try {
        const v = localStorage.getItem(LEGACY_CACHE_KEYS[i]);
        if (v && FP_REGEX.test(v)) return v;
      } catch (_) {}
    }
    // 3) 현재 버전 쿠키
    try {
      const m = document.cookie.match(new RegExp(COOKIE_KEY + '=([A-F0-9-]{19})'));
      if (m) return m[1];
    } catch (_) {}
    // 4) 과거 버전 쿠키 폴백
    for (let i = 0; i < LEGACY_COOKIE_KEYS.length; i++) {
      try {
        const m = document.cookie.match(new RegExp(LEGACY_COOKIE_KEYS[i] + '=([A-F0-9-]{19})'));
        if (m) return m[1];
      } catch (_) {}
    }
    return null;
  }

  function writeLocalCache(id) {
    try { localStorage.setItem(CACHE_KEY, id); } catch (_) {}
    try {
      const exp = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = COOKIE_KEY + '=' + id + '; expires=' + exp + '; path=/; SameSite=Lax';
    } catch (_) {}
    try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (_) {}
  }

  function cleanupOldCaches() { /* 의도적 no-op */ }

  // ══════════════════════════════════════════════════════════════════════
  // Firebase에서 가장 먼저 등록된 레코드 찾기 (크로스앱 ID 통합)
  // ══════════════════════════════════════════════════════════════════════
  // 우선순위 계산:
  //  1. wmemory/hearingaid 등 '다른 앱'이 등록한 레코드를 최우선 채택
  //     (이 앱들은 자기 ID를 바꾸지 않으므로 smartswitch가 맞춰야 통합됨)
  //  2. 동일 우선순위 내에서는 가장 먼저 등록된 것
  function docPriority(d) {
    var data = d.data() || {};
    var apps = Array.isArray(data.apps) ? data.apps : (data.appName ? [data.appName] : []);
    // 다른 앱(wmemory/hearingaid)이 등록되어 있으면 높은 우선순위
    var hasOther = apps.some(function (a) { return a && a !== APP_NAME; });
    return hasOther ? 0 : 1;
  }

  function docRegTime(d) {
    var data = d.data() || {};
    var regTime = Infinity;
    if (data.registeredAt && data.registeredAt.seconds) {
      regTime = data.registeredAt.seconds;
    } else if (data.registeredAt && typeof data.registeredAt === 'string') {
      regTime = new Date(data.registeredAt).getTime() / 1000;
    }
    if (data.appRegisteredAt) {
      Object.keys(data.appRegisteredAt).forEach(function (app) {
        var t = new Date(data.appRegisteredAt[app]).getTime() / 1000;
        if (t < regTime) regTime = t;
      });
    }
    return regTime;
  }

  function pickEarliestDoc(docs) {
    if (docs.length === 0) return null;
    if (docs.length === 1) return docs[0];
    // 1. 우선순위 낮은 숫자가 우선 (다른 앱 있는 레코드 먼저)
    // 2. 같은 우선순위면 먼저 등록된 것
    var sorted = docs.slice().sort(function (a, b) {
      var pa = docPriority(a), pb = docPriority(b);
      if (pa !== pb) return pa - pb;
      return docRegTime(a) - docRegTime(b);
    });
    return sorted[0];
  }

  // admin.js와 동일한 클러스터링 키 (같은 물리 기기 식별용)
  function computeLinkKey(info) {
    var parts = [
      info.cpuCores || '',
      info.ramGB    || '',
      info.screenRes|| '',
      info.timezone || '',
      info.os       || '',
      info.gpu      || '',
    ];
    var nonEmpty = parts.filter(function (p) { return p !== '' && p !== 0 && p != null; });
    if (nonEmpty.length < 4) return null;
    return parts.join('|');
  }

  // 화면 가로/세로 스왑 버전 linkKey (모바일 회전 대응)
  function computeLinkKeySwapped(info) {
    var screenRes = info.screenRes || '';
    var m = /^(\d+)×(\d+)(.*)$/.exec(screenRes);
    if (m) screenRes = m[2] + '×' + m[1] + m[3];
    var parts = [
      info.cpuCores || '',
      info.ramGB    || '',
      screenRes,
      info.timezone || '',
      info.os       || '',
      info.gpu      || '',
    ];
    var nonEmpty = parts.filter(function (p) { return p !== '' && p !== 0 && p != null; });
    if (nonEmpty.length < 4) return null;
    return parts.join('|');
  }

  async function findEarliestRecord(db) {
    var allDocs = [];
    var seenIds = {};

    console.log('[DeviceAuth] findEarliestRecord 시작');

    // 1단계: hardwareHash로 정확 조회
    try {
      var candidates = await getAllCandidateHashes();
      console.log('[DeviceAuth] 후보 해시 ' + candidates.length + '개');
      for (var i = 0; i < candidates.length; i++) {
        try {
          var snap = await db.collection(COLLECTION)
            .where('hardwareHash', '==', candidates[i])
            .get();
          if (snap.docs.length > 0) {
            console.log('[DeviceAuth] Step1 hash', candidates[i].substring(0,8), '→', snap.docs.length, '건');
          }
          snap.docs.forEach(function (d) {
            if (!seenIds[d.id]) {
              seenIds[d.id] = true;
              allDocs.push(d);
            }
          });
        } catch (e1) { console.warn('[DeviceAuth] Step1 쿼리 실패:', e1.message); }
      }
    } catch (e) { console.warn('[DeviceAuth] Step1 전체 실패:', e.message); }

    // 2단계: 하드웨어 필드 매칭
    try {
      var info = collectDeviceInfo();
      var myKey    = computeLinkKey(info);
      var myKeyAlt = computeLinkKeySwapped(info);
      console.log('[DeviceAuth] 내 linkKey:', myKey);
      if (myKey || myKeyAlt) {
        var snapAll = await db.collection(COLLECTION).get();
        console.log('[DeviceAuth] 전체 레코드:', snapAll.docs.length, '건');
        snapAll.docs.forEach(function (d) {
          if (seenIds[d.id]) return;
          var data = d.data() || {};
          var key = computeLinkKey(data);
          if (key && (key === myKey || key === myKeyAlt)) {
            console.log('[DeviceAuth] Step2 매칭:', d.id);
            seenIds[d.id] = true;
            allDocs.push(d);
          }
        });
      }
    } catch (e2) { console.warn('[DeviceAuth] Step2 실패:', e2.message); }

    if (allDocs.length === 0) {
      console.log('[DeviceAuth] 매칭 레코드 없음');
      return null;
    }

    console.log('[DeviceAuth] 후보 ' + allDocs.length + '개:', allDocs.map(function (d) { return d.id; }));

    var doc = pickEarliestDoc(allDocs);
    var data = doc.data() || {};
    console.log('[DeviceAuth] 가장 먼저 등록된 ID:', doc.id);
    return { id: doc.id, salt: data.salt || null };
  }

  // 매 페이지 로드마다 크로스앱 ID 통합 시도 (플래그 없음 — idempotent)
  async function crossAppSync(cachedId) {
    console.log('[DeviceAuth] crossAppSync 호출, cached=', cachedId);
    var db = initFirebase();
    if (!db) { console.warn('[DeviceAuth] Firebase 미초기화 — 동기화 스킵'); return cachedId; }

    try {
      var found = await findEarliestRecord(db);
      if (!found) return cachedId;            // Firebase에 매칭 레코드 없음 → 유지
      if (found.id === cachedId) return cachedId; // 이미 올바른 ID

      console.log('[DeviceAuth] 크로스앱 ID 통합:', cachedId, '→', found.id);

      // salt 저장
      if (found.salt) {
        try { localStorage.setItem(SALT_KEY, found.salt); } catch (_) {}
        try {
          var exp = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toUTCString();
          document.cookie = SALT_COOKIE + '=' + found.salt + '; expires=' + exp + '; path=/; SameSite=Lax';
        } catch (_) {}
      }

      // 중복 레코드 삭제 (실패해도 무시)
      try { await db.collection(COLLECTION).doc(cachedId).delete(); } catch (_) {}

      writeLocalCache(found.id);
      return found.id;
    } catch (e) {
      console.warn('[DeviceAuth] crossAppSync 오류:', e);
      return cachedId;
    }
  }

  async function generateDeviceFingerprint() {
    // 1. 로컬 캐시 확인 + 크로스앱 동기화
    var cached = readLocalCache();
    if (cached) {
      // 1회성 동기화: 캐시 ID가 Firebase에 없으면 올바른 ID로 교체
      var synced = await crossAppSync(cached);
      writeLocalCache(synced);
      return synced;
    }

    var db = initFirebase();
    if (db) {
      // 2. Firebase에서 같은 기기의 기존 레코드 찾기
      var found = await findEarliestRecord(db);
      if (found) {
        if (found.salt) {
          try { localStorage.setItem(SALT_KEY, found.salt); } catch (_) {}
          try {
            var exp2 = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toUTCString();
            document.cookie = SALT_COOKIE + '=' + found.salt + '; expires=' + exp2 + '; path=/; SameSite=Lax';
          } catch (_) {}
        }
        writeLocalCache(found.id);
        return found.id;
      }
    }

    // 3. 신규 기기 → 하드웨어 + 기기 고유 솔트로 ID 생성
    var salt = getOrCreateDeviceSalt();
    var id = await generateIdFromHardwareSalted(salt);
    writeLocalCache(id);
    return id;
  }

  // ══════════════════════════════════════════════════════════════════════
  // 기기 정보 수집
  // ══════════════════════════════════════════════════════════════════════
  function detectOS(ua) {
    if (/Windows NT 10\.0/.test(ua)) return 'Windows 10/11';
    if (/Windows/.test(ua))          return 'Windows';
    if (/iPhone OS/.test(ua)) {
      const m = ua.match(/iPhone OS ([\d_]+)/);
      return 'iOS ' + (m ? m[1].replace(/_/g,'.') : '');
    }
    if (/iPad/.test(ua))    return 'iPadOS';
    if (/Android/.test(ua)) {
      const m = ua.match(/Android ([\d.]+)/);
      return 'Android ' + (m ? m[1] : '');
    }
    if (/Mac OS X/.test(ua)) return 'macOS';
    if (/Linux/.test(ua))    return 'Linux';
    return 'Unknown OS';
  }

  function detectBrowser(ua) {
    if (/Edg\//.test(ua))     return 'Edge ' + ((ua.match(/Edg\/([\d]+)/) || [])[1] || '');
    if (/OPR\//.test(ua))     return 'Opera ' + ((ua.match(/OPR\/([\d]+)/) || [])[1] || '');
    if (/Chrome\//.test(ua))  return 'Chrome ' + ((ua.match(/Chrome\/([\d]+)/) || [])[1] || '');
    if (/Firefox\//.test(ua)) return 'Firefox ' + ((ua.match(/Firefox\/([\d]+)/) || [])[1] || '');
    if (/Safari\//.test(ua))  return 'Safari ' + ((ua.match(/Version\/([\d]+)/) || [])[1] || '');
    return 'Unknown Browser';
  }

  function detectDeviceType(ua) {
    if (/Windows NT/.test(ua))                       return 'PC / 데스크탑 (Windows)';
    if (/Macintosh/.test(ua) && !/iPhone/.test(ua))  return 'PC / 데스크탑 (Mac)';
    if (/iPad/.test(ua))                             return '태블릿 (iPad)';
    if (/iPhone/.test(ua))                           return '스마트폰 (iPhone)';
    if (/Android/.test(ua) && /Mobile/.test(ua))     return '스마트폰 (Android)';
    if (/Android/.test(ua))                          return '태블릿 (Android)';
    if (/Linux/.test(ua))                            return 'PC / 데스크탑 (Linux)';
    return 'PC / 데스크탑';
  }

  function collectDeviceInfo() {
    try {
      const ua = navigator.userAgent;
      const touch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
      return {
        deviceType:   detectDeviceType(ua),
        os:           detectOS(ua),
        browser:      detectBrowser(ua),
        screenRes:    screen.width + '×' + screen.height + ' (' + screen.colorDepth + 'bit)',
        cpuCores:     navigator.hardwareConcurrency || 0,
        ramGB:        navigator.deviceMemory || 0,
        gpu:          getGPURenderer().slice(0, 80),
        language:     navigator.language,
        timezone:     Intl.DateTimeFormat().resolvedOptions().timeZone,
        touchSupport: touch,
        userAgent:    ua.slice(0, 250),
        appName:      APP_NAME,
      };
    } catch (_) {
      return { appName: APP_NAME };
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // localStorage 폴백
  // ══════════════════════════════════════════════════════════════════════
  function localRead() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch (_) { return {}; }
  }
  function localWrite(data) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch (_) {}
  }

  // ══════════════════════════════════════════════════════════════════════
  // 기기 상태 조회 / 등록
  // ══════════════════════════════════════════════════════════════════════
  function extractAppStatus(data) {
    if (data && data.appStatus && data.appStatus[APP_NAME]) {
      return data.appStatus[APP_NAME];
    }
    const apps = Array.isArray(data && data.apps)
      ? data.apps
      : (data && data.appName ? [data.appName] : []);
    if (apps.indexOf(APP_NAME) >= 0 && data.status) return data.status;
    return null;
  }

  async function checkDeviceStatus(deviceId) {
    const db = initFirebase();
    if (db) {
      try {
        const snap = await db.collection(COLLECTION).doc(deviceId).get();
        if (!snap.exists) return null;
        return extractAppStatus(snap.data());
      } catch (e) {}
    }
    const local = localRead();
    return local[deviceId] ? extractAppStatus(local[deviceId]) : null;
  }

  async function registerDevice(deviceId, userName) {
    const info = collectDeviceInfo();
    const nowIso = new Date().toISOString();
    let hwHash = '';
    try { hwHash = await getHardwareHash(); } catch (_) {}
    const deviceSalt = getOrCreateDeviceSalt();

    const db = initFirebase();
    if (db) {
      try {
        const ref = db.collection(COLLECTION).doc(deviceId);
        const snap = await ref.get();
        const arrayUnion = firebase.firestore.FieldValue.arrayUnion(APP_NAME);

        if (!snap.exists) {
          const record = Object.assign({}, info, {
            deviceId: deviceId,
            hardwareHash: hwHash,
            salt: deviceSalt,
            userName: userName || '',
            registeredAt: firebase.firestore.FieldValue.serverTimestamp(),
            apps: arrayUnion,
            appStatus:       { [APP_NAME]: 'pending' },
            appRegisteredAt: { [APP_NAME]: nowIso },
            registeredBy:    APP_NAME,
          });
          await ref.set(record);
        } else {
          const data = snap.data();
          const hasAppStatus = data.appStatus && data.appStatus[APP_NAME];
          const update = Object.assign({}, info, { apps: arrayUnion, hardwareHash: hwHash });
          if (userName) update.userName = userName;
          if (!hasAppStatus) {
            update['appStatus.' + APP_NAME]       = 'pending';
            update['appRegisteredAt.' + APP_NAME] = nowIso;
          }
          await ref.update(update);
        }
        return;
      } catch (e) {}
    }

    // localStorage 폴백
    const local = localRead();
    if (!local[deviceId]) {
      local[deviceId] = Object.assign({}, info, {
        deviceId: deviceId,
        userName: userName || '',
        registeredAt: nowIso,
        apps: [APP_NAME],
        appStatus:       { [APP_NAME]: 'pending' },
        appRegisteredAt: { [APP_NAME]: nowIso },
        registeredBy:    APP_NAME,
      });
    } else {
      Object.assign(local[deviceId], info);
      if (userName) local[deviceId].userName = userName;
      const apps = Array.isArray(local[deviceId].apps) ? local[deviceId].apps : [];
      if (apps.indexOf(APP_NAME) < 0) apps.push(APP_NAME);
      local[deviceId].apps = apps;
      const appStatus = local[deviceId].appStatus || {};
      if (!appStatus[APP_NAME]) {
        appStatus[APP_NAME] = 'pending';
        const appReg = local[deviceId].appRegisteredAt || {};
        appReg[APP_NAME] = nowIso;
        local[deviceId].appRegisteredAt = appReg;
      }
      local[deviceId].appStatus = appStatus;
    }
    localWrite(local);
  }

  async function checkNameExists(userName, excludeDeviceId) {
    const name = (userName || '').trim().toLowerCase();
    if (!name) return false;
    const db = initFirebase();
    if (db) {
      try {
        const snap = await db.collection(COLLECTION).get();
        return snap.docs.some(function (d) {
          if (excludeDeviceId && d.id === excludeDeviceId) return false;
          return ((d.data().userName || '').trim().toLowerCase() === name);
        });
      } catch (e) {}
    }
    const local = localRead();
    return Object.keys(local).some(function (id) {
      if (excludeDeviceId && id === excludeDeviceId) return false;
      return ((local[id].userName || '').trim().toLowerCase() === name);
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // 게이트 UI 렌더링
  // ══════════════════════════════════════════════════════════════════════
  function buildGateDOM() {
    const overlay = document.createElement('div');
    overlay.id = 'wmem-device-gate';
    overlay.innerHTML = [
      '<div class="wmem-gate-card">',
      '  <div class="wmem-gate-icon">🔀</div>',
      '  <div class="wmem-gate-title">SWITCHING MASTER</div>',
      '  <div class="wmem-gate-subtitle">기기 인증이 필요합니다</div>',
      '  <div class="wmem-gate-body" id="wmem-gate-body">',
      '    <div class="wmem-gate-spinner"></div>',
      '    <div class="wmem-gate-msg">기기를 확인하는 중...</div>',
      '  </div>',
      '  <div class="wmem-gate-id" id="wmem-gate-id"></div>',
      '</div>',
    ].join('');
    document.body.appendChild(overlay);
    return overlay;
  }

  function setGateState(state, deviceId, extra) {
    const body = document.getElementById('wmem-gate-body');
    const idEl = document.getElementById('wmem-gate-id');
    if (idEl && deviceId) idEl.textContent = '기기 번호: ' + deviceId;
    if (!body) return;

    if (state === 'loading') {
      body.innerHTML =
        '<div class="wmem-gate-spinner"></div>' +
        '<div class="wmem-gate-msg">기기를 확인하는 중...</div>';
    } else if (state === 'register') {
      body.innerHTML =
        '<div class="wmem-gate-msg">처음 접속하셨네요!<br>사용자 이름을 입력하세요.</div>' +
        '<input type="text" id="wmem-gate-name" class="wmem-gate-input" placeholder="이름 (2~20자)" maxlength="20" />' +
        '<button id="wmem-gate-register-btn" class="wmem-gate-btn">등록 요청</button>' +
        '<div class="wmem-gate-err" id="wmem-gate-err"></div>' +
        '<div style="margin-top:14px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.1);">' +
        '  <div style="font-size:12px; color:rgba(255,255,255,0.5); margin-bottom:8px;">다른 앱(Working Memory 등)에서 이미 등록했다면:</div>' +
        '  <button id="wmem-gate-link-btn" class="wmem-gate-btn" style="background:rgba(255,255,255,0.1); box-shadow:none;">기존 기기 ID로 연결</button>' +
        '</div>';
      document.getElementById('wmem-gate-register-btn').onclick = function () {
        handleRegister(deviceId);
      };
      document.getElementById('wmem-gate-link-btn').onclick = function () {
        setGateState('link', deviceId);
      };
      var input = document.getElementById('wmem-gate-name');
      input.focus();
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') handleRegister(deviceId);
      });
    } else if (state === 'link') {
      body.innerHTML =
        '<div class="wmem-gate-msg">기존 기기 ID를 입력하세요.<br><span style="font-size:12px; color:rgba(255,255,255,0.55);">예: DB5A-CCFE-26F7-63CD</span></div>' +
        '<input type="text" id="wmem-gate-linkid" class="wmem-gate-input" placeholder="XXXX-XXXX-XXXX-XXXX" maxlength="19" style="text-transform:uppercase; font-family:monospace;" />' +
        '<button id="wmem-gate-link-go" class="wmem-gate-btn">연결하기</button>' +
        '<button id="wmem-gate-link-back" class="wmem-gate-btn" style="background:rgba(255,255,255,0.1); box-shadow:none;">← 뒤로</button>' +
        '<div class="wmem-gate-err" id="wmem-gate-err"></div>';
      document.getElementById('wmem-gate-link-go').onclick = function () {
        handleLink();
      };
      document.getElementById('wmem-gate-link-back').onclick = function () {
        setGateState('register', deviceId);
      };
      var linkInput = document.getElementById('wmem-gate-linkid');
      linkInput.focus();
      linkInput.addEventListener('input', function () {
        // 자동 포맷팅: 4글자마다 대시
        var v = this.value.toUpperCase().replace(/[^A-F0-9]/g, '');
        var parts = [];
        for (var i = 0; i < v.length && i < 16; i += 4) {
          parts.push(v.substring(i, i + 4));
        }
        this.value = parts.join('-');
      });
      linkInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') handleLink();
      });
    } else if (state === 'pending') {
      body.innerHTML =
        '<div class="wmem-gate-msg">⏳ 관리자 승인 대기중입니다.<br>승인 후 이용하실 수 있습니다.</div>' +
        (extra && extra.userName ? '<div class="wmem-gate-name-show">사용자: ' + String(extra.userName).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') + '</div>' : '') +
        '<button id="wmem-gate-check-btn" class="wmem-gate-btn">승인 확인</button>';
      document.getElementById('wmem-gate-check-btn').onclick = function () {
        runGate();
      };
    } else if (state === 'blocked') {
      body.innerHTML =
        '<div class="wmem-gate-msg wmem-gate-blocked">🚫 차단된 기기입니다.<br>관리자에게 문의하세요.</div>';
    } else if (state === 'error') {
      body.innerHTML =
        '<div class="wmem-gate-msg wmem-gate-blocked">⚠️ 연결 오류가 발생했습니다.</div>' +
        '<button id="wmem-gate-retry-btn" class="wmem-gate-btn">다시 시도</button>';
      document.getElementById('wmem-gate-retry-btn').onclick = function () { runGate(); };
    }
  }

  async function handleLink() {
    var input = document.getElementById('wmem-gate-linkid');
    var err = document.getElementById('wmem-gate-err');
    var btn = document.getElementById('wmem-gate-link-go');
    var targetId = (input.value || '').trim().toUpperCase();
    err.textContent = '';

    if (!FP_REGEX.test(targetId)) {
      err.textContent = '올바른 형식이 아닙니다 (XXXX-XXXX-XXXX-XXXX).';
      return;
    }

    btn.disabled = true;
    btn.textContent = '확인 중...';

    var db = initFirebase();
    if (!db) {
      err.textContent = '네트워크 연결을 확인해 주세요.';
      btn.disabled = false;
      btn.textContent = '연결하기';
      return;
    }

    try {
      var snap = await db.collection(COLLECTION).doc(targetId).get();
      if (!snap.exists) {
        err.textContent = '해당 기기 ID를 찾을 수 없습니다.';
        btn.disabled = false;
        btn.textContent = '연결하기';
        return;
      }

      var data = snap.data() || {};
      // salt를 로컬에 저장
      if (data.salt) {
        try { localStorage.setItem(SALT_KEY, data.salt); } catch (_) {}
        try {
          var exp = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toUTCString();
          document.cookie = SALT_COOKIE + '=' + data.salt + '; expires=' + exp + '; path=/; SameSite=Lax';
        } catch (_) {}
      }
      writeLocalCache(targetId);

      // smartswitch 앱으로 등록
      var userName = data.userName || '';
      await registerDevice(targetId, userName);

      // 상태 확인 후 적절한 화면으로
      var status = await checkDeviceStatus(targetId);
      if (status === 'approved') { hideGate(); return; }
      if (status === 'blocked') { setGateState('blocked', targetId); return; }
      setGateState('pending', targetId, { userName: userName });
    } catch (e) {
      err.textContent = '연결에 실패했습니다. 다시 시도해 주세요.';
      btn.disabled = false;
      btn.textContent = '연결하기';
    }
  }

  async function handleRegister(deviceId) {
    var input = document.getElementById('wmem-gate-name');
    var err = document.getElementById('wmem-gate-err');
    var btn = document.getElementById('wmem-gate-register-btn');
    var name = (input.value || '').trim();
    err.textContent = '';

    if (name.length < 2 || name.length > 20) {
      err.textContent = '이름은 2~20자로 입력해 주세요.';
      return;
    }
    if (/[<>"'&]/.test(name)) {
      err.textContent = '특수문자(<, >, ", \', &)는 사용할 수 없습니다.';
      return;
    }

    btn.disabled = true;
    btn.textContent = '확인 중...';
    try {
      var dup = await checkNameExists(name, deviceId);
      if (dup) {
        err.textContent = '이미 사용 중인 이름입니다.';
        btn.disabled = false;
        btn.textContent = '등록 요청';
        return;
      }
      await registerDevice(deviceId, name);
      setGateState('pending', deviceId, { userName: name });
    } catch (e) {
      err.textContent = '등록에 실패했습니다. 다시 시도해 주세요.';
      btn.disabled = false;
      btn.textContent = '등록 요청';
    }
  }

  function hideGate() {
    var el = document.getElementById('wmem-device-gate');
    if (el) {
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 300);
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // 메인 게이트 실행
  // ══════════════════════════════════════════════════════════════════════
  async function runGate() {
    setGateState('loading');
    try {
      var deviceId = await generateDeviceFingerprint();
      var status = await checkDeviceStatus(deviceId);
      if (status === 'approved') {
        hideGate();
        return;
      }
      if (status === 'pending')  { setGateState('pending', deviceId); return; }
      if (status === 'blocked')  { setGateState('blocked', deviceId); return; }
      setGateState('register', deviceId);
    } catch (e) {
      setGateState('error');
    }
  }

  function startAuth() {
    buildGateDOM();
    runGate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAuth);
  } else {
    startAuth();
  }

})();
