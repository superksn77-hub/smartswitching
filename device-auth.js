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

  async function generateDeviceFingerprint() {
    const cached = readLocalCache();
    if (cached) {
      writeLocalCache(cached);
      return cached;
    }

    const db = initFirebase();
    if (db) {
      try {
        const currentHash = await getHardwareHash();
        const snap = await db.collection(COLLECTION)
          .where('hardwareHash', '==', currentHash)
          .get();
        const legacyDocs = snap.docs.filter(function (d) {
          const data = d.data() || {};
          return !data.salt;
        });
        if (legacyDocs.length === 1) {
          const existingId = legacyDocs[0].id;
          writeLocalCache(existingId);
          return existingId;
        }
      } catch (e) {}

      try {
        const currentHash = await getHardwareHash();
        const legacyHashes = await getLegacyHardwareHashes();
        for (let i = 0; i < legacyHashes.length; i++) {
          const lh = legacyHashes[i];
          try {
            const snap2 = await db.collection(COLLECTION)
              .where('hardwareHash', '==', lh.hash)
              .get();
            const legacyDocs2 = snap2.docs.filter(function (d) {
              const data = d.data() || {};
              return !data.salt;
            });
            if (legacyDocs2.length === 1) {
              const existingId = legacyDocs2[0].id;
              writeLocalCache(existingId);
              try {
                await db.collection(COLLECTION).doc(existingId)
                  .update({ hardwareHash: currentHash });
              } catch (_) {}
              return existingId;
            }
          } catch (_) {}
        }
      } catch (_) {}
    }

    const salt = getOrCreateDeviceSalt();
    const id = await generateIdFromHardwareSalted(salt);
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
        '<div class="wmem-gate-err" id="wmem-gate-err"></div>';
      document.getElementById('wmem-gate-register-btn').onclick = function () {
        handleRegister(deviceId);
      };
      var input = document.getElementById('wmem-gate-name');
      input.focus();
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') handleRegister(deviceId);
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
