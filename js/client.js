// ==================== SmartSwitching — 클라이언트 관리 시스템 ====================
// workingmemory/client.js를 스위칭마스터에 맞게 포팅
const ClientManager = (() => {
  const CLIENTS_KEY = 'sswt_clients';
  const ACTIVE_KEY = 'sswt_active_client';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ==================== 데이터 함수 ====================
  function getClients() {
    try {
      const raw = JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]');
      if (!Array.isArray(raw)) return [];
      return raw.filter(c =>
        c && typeof c === 'object' &&
        typeof c.id === 'string' && c.id.length > 0 && c.id.length < 50 &&
        typeof c.name === 'string' && c.name.length > 0 && c.name.length <= 20
      );
    } catch (_) { return []; }
  }

  function saveClients(clients) {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  function createClient(name, gender, age) {
    const clients = getClients();
    const safeName = String(name).trim().replace(/[<>"'&]/g, '').slice(0, 20);
    const safeGender = ['남', '여'].includes(gender) ? gender : '남';
    const safeAge = Math.max(1, Math.min(120, parseInt(age) || 1));
    if (!safeName || safeName.length < 1) return null;
    const client = {
      id: generateId(),
      name: safeName,
      gender: safeGender,
      age: safeAge,
      createdAt: new Date().toISOString()
    };
    clients.push(client);
    saveClients(clients);
    return client;
  }

  function deleteClient(clientId) {
    let clients = getClients();
    clients = clients.filter(c => c.id !== clientId);
    saveClients(clients);

    if (localStorage.getItem(ACTIVE_KEY) === clientId) {
      clearActiveClient();
    }

    const prefix = `sswt_client_${clientId}_`;
    const keysToDelete = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) keysToDelete.push(key);
    }
    keysToDelete.forEach(k => localStorage.removeItem(k));
  }

  function getActiveClient() {
    const activeId = localStorage.getItem(ACTIVE_KEY);
    if (!activeId) return null;
    return getClients().find(c => c.id === activeId) || null;
  }

  function setActiveClient(clientId) {
    localStorage.setItem(ACTIVE_KEY, clientId);
    updateClientDisplay();
  }

  function clearActiveClient() {
    localStorage.removeItem(ACTIVE_KEY);
    updateClientDisplay();
  }

  function updateClientDisplay() {
    const indicator = document.getElementById('clientIndicator');
    if (indicator) {
      const client = getActiveClient();
      indicator.textContent = client ? client.name : '게스트';
      indicator.className = client ? 'client-indicator active' : 'client-indicator';
    }
    // 로그아웃 메뉴 항목 표시/숨김
    const logoutItem = document.getElementById('clientLogoutItem');
    if (logoutItem) logoutItem.style.display = getActiveClient() ? '' : 'none';
  }

  // ==================== 세션 저장 ====================
  // metrics: { mode, testType, level, targetScore, totalAttempts, correct,
  //           errors, errorRate, totalTime, avgTime, grade, gradeLabel }
  function saveSession(metrics) {
    const activeId = localStorage.getItem(ACTIVE_KEY);
    if (!activeId) return; // 클라이언트 없으면 저장 안 함

    const sessKey = `sswt_client_${activeId}_sessions`;
    const sessions = JSON.parse(localStorage.getItem(sessKey) || '[]');

    sessions.push({
      date: new Date().toISOString(),
      mode: metrics.mode || 'training',        // 'training' | 'test'
      testType: metrics.testType || null,      // 'preschool' | 'elementary' | 'middle' | 'adult' | null
      level: metrics.level || null,            // training level index
      targetScore: metrics.targetScore || 0,
      totalAttempts: metrics.totalAttempts || 0,
      correct: metrics.correct || 0,
      errors: metrics.errors || 0,
      errorRate: metrics.errorRate || 0,       // 0~100 (%)
      totalTime: metrics.totalTime || 0,       // ms
      avgTime: metrics.avgTime || 0,           // seconds
      grade: metrics.grade || null,            // 1~8 (test) or null (training)
      gradeLabel: metrics.gradeLabel || null,  // 'S', 'A+', ... 등급 라벨
      score: metrics.score || 0                // training point
    });

    if (sessions.length > 500) sessions.splice(0, sessions.length - 500);
    localStorage.setItem(sessKey, JSON.stringify(sessions));
  }

  function getClientSessions(clientId) {
    return JSON.parse(localStorage.getItem(`sswt_client_${clientId}_sessions`) || '[]');
  }

  // ==================== 백업 (다른 컴퓨터로 이전) ====================
  // 모든 클라이언트 + 세션을 JSON 파일로 내보냄
  function exportAll() {
    const clients = getClients();
    const data = {
      app: 'switching-master',
      version: 1,
      exportedAt: new Date().toISOString(),
      clients: clients.map(c => ({
        ...c,
        sessions: getClientSessions(c.id)
      }))
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `switching-master-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { clientCount: clients.length, sessionCount: data.clients.reduce((s, c) => s + (c.sessions?.length || 0), 0) };
  }

  // 단일 클라이언트만 내보내기
  function exportClient(clientId) {
    const c = getClients().find(c => c.id === clientId);
    if (!c) return null;
    const data = {
      app: 'switching-master',
      version: 1,
      exportedAt: new Date().toISOString(),
      clients: [{ ...c, sessions: getClientSessions(c.id) }]
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = c.name.replace(/[^\w가-힣\-]/g, '_');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `switching-master-${safeName}-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { name: c.name, sessions: data.clients[0].sessions.length };
  }

  /**
   * 백업 JSON 가져오기.
   * mode:
   *   'merge'    — 동일 ID는 세션을 합치고 중복 제거(date 기준)
   *   'replace'  — 동일 ID 클라이언트의 세션 전체 덮어쓰기
   *   'addNew'   — 동일 ID는 건너뛰고 새 ID로 추가
   * @returns {{added,merged,skipped,sessionsAdded,errors}}
   */
  function importAll(jsonText, mode = 'merge') {
    const result = { added: 0, merged: 0, skipped: 0, sessionsAdded: 0, errors: [] };
    let data;
    try { data = JSON.parse(jsonText); }
    catch (e) { result.errors.push('JSON 파싱 실패: ' + e.message); return result; }

    if (!data || data.app !== 'switching-master' || !Array.isArray(data.clients)) {
      result.errors.push('스위칭마스터 백업 파일이 아닙니다.');
      return result;
    }

    const existingClients = getClients();
    const existingMap = new Map(existingClients.map(c => [c.id, c]));

    data.clients.forEach((bc, idx) => {
      // 형식 검증
      if (!bc || typeof bc.id !== 'string' || typeof bc.name !== 'string' || !bc.name.trim()) {
        result.errors.push(`#${idx + 1} 항목: 형식 오류, 건너뜀`);
        return;
      }
      const sessions = Array.isArray(bc.sessions) ? bc.sessions : [];
      const cleanClient = {
        id: bc.id,
        name: String(bc.name).slice(0, 20),
        gender: ['남', '여'].includes(bc.gender) ? bc.gender : '남',
        age: Math.max(1, Math.min(120, parseInt(bc.age) || 1)),
        createdAt: bc.createdAt || new Date().toISOString()
      };

      const existing = existingMap.get(bc.id);
      if (existing) {
        // 충돌
        if (mode === 'addNew') {
          // 새 ID로 복사
          cleanClient.id = generateId();
          existingClients.push(cleanClient);
          if (sessions.length) {
            localStorage.setItem(`sswt_client_${cleanClient.id}_sessions`, JSON.stringify(sessions));
            result.sessionsAdded += sessions.length;
          }
          result.added++;
        } else if (mode === 'replace') {
          // 메타+세션 교체
          Object.assign(existing, cleanClient);
          localStorage.setItem(`sswt_client_${cleanClient.id}_sessions`, JSON.stringify(sessions));
          result.sessionsAdded += sessions.length;
          result.merged++;
        } else { // merge
          const cur = getClientSessions(cleanClient.id);
          const seen = new Set(cur.map(s => s.date));
          let newOnes = 0;
          sessions.forEach(s => {
            if (s && s.date && !seen.has(s.date)) {
              cur.push(s); seen.add(s.date); newOnes++;
            }
          });
          cur.sort((a, b) => String(a.date).localeCompare(String(b.date)));
          if (cur.length > 500) cur.splice(0, cur.length - 500);
          localStorage.setItem(`sswt_client_${cleanClient.id}_sessions`, JSON.stringify(cur));
          result.sessionsAdded += newOnes;
          result.merged++;
        }
      } else {
        existingClients.push(cleanClient);
        if (sessions.length) {
          localStorage.setItem(`sswt_client_${cleanClient.id}_sessions`, JSON.stringify(sessions));
          result.sessionsAdded += sessions.length;
        }
        result.added++;
      }
    });

    saveClients(existingClients);
    updateClientDisplay();
    return result;
  }

  // ==================== 모달 UI ====================
  function showNewClientModal() {
    removeModal();
    const overlay = document.createElement('div');
    overlay.id = 'clientModal';
    overlay.className = 'client-modal';
    overlay.innerHTML = `
      <div class="client-modal-box">
        <div class="client-modal-header">
          <h2>신규 클라이언트 등록</h2>
          <button class="client-modal-close" id="clientModalClose">&times;</button>
        </div>
        <div class="client-form">
          <div class="client-form-field">
            <label>이름</label>
            <input type="text" id="clientNewName" placeholder="클라이언트 이름" maxlength="20" autocomplete="off">
          </div>
          <div class="client-form-field">
            <label>성별</label>
            <div class="gender-group">
              <label class="gender-option">
                <input type="radio" name="clientGender" value="남" checked>
                <span class="gender-label">남</span>
              </label>
              <label class="gender-option">
                <input type="radio" name="clientGender" value="여">
                <span class="gender-label">여</span>
              </label>
            </div>
          </div>
          <div class="client-form-field">
            <label>나이</label>
            <input type="number" id="clientNewAge" placeholder="나이" min="1" max="120" autocomplete="off">
          </div>
          <button class="client-submit-btn" id="clientSubmitBtn">등록하기</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 30);

    document.getElementById('clientModalClose').addEventListener('click', removeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) removeModal(); });

    const submit = () => {
      const name = document.getElementById('clientNewName').value.trim();
      const gender = document.querySelector('input[name="clientGender"]:checked')?.value || '남';
      const age = document.getElementById('clientNewAge').value;

      if (!name) { shakeInput(document.getElementById('clientNewName')); return; }
      if (!age || age < 1) { shakeInput(document.getElementById('clientNewAge')); return; }

      const client = createClient(name, gender, age);
      if (!client) { shakeInput(document.getElementById('clientNewName')); return; }
      setActiveClient(client.id);
      removeModal();
    };

    document.getElementById('clientSubmitBtn').addEventListener('click', submit);
    document.getElementById('clientNewName').addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    document.getElementById('clientNewAge').addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    document.getElementById('clientNewName').focus();
  }

  function showLoadClientModal() {
    removeModal();
    const clients = getClients();
    const activeClient = getActiveClient();

    const overlay = document.createElement('div');
    overlay.id = 'clientModal';
    overlay.className = 'client-modal';

    const clientListHTML = clients.length === 0
      ? '<div class="client-list-empty">등록된 클라이언트가 없습니다</div>'
      : clients.map(c => {
          const sessions = getClientSessions(c.id);
          const isActive = activeClient && activeClient.id === c.id;
          const created = new Date(c.createdAt).toLocaleDateString('ko-KR');
          return `
            <div class="client-list-item ${isActive ? 'active' : ''}" data-id="${esc(c.id)}">
              <div class="client-list-info">
                <div class="client-list-name">${esc(c.name)}</div>
                <div class="client-list-meta">${esc(c.gender)} · ${esc(c.age)}세 · 등록: ${esc(created)} · 세션: ${sessions.length}회</div>
              </div>
              <div class="client-list-actions">
                ${isActive ? '<span class="client-active-badge">현재</span>' : ''}
                <button class="client-export-btn" data-id="${esc(c.id)}" title="이 클라이언트만 내보내기">⬇</button>
                <button class="client-delete-btn" data-id="${esc(c.id)}" title="삭제">🗑️</button>
              </div>
            </div>
          `;
        }).join('');

    overlay.innerHTML = `
      <div class="client-modal-box client-modal-wide">
        <div class="client-modal-header">
          <h2>클라이언트 불러오기</h2>
          <button class="client-modal-close" id="clientModalClose">&times;</button>
        </div>
        <div class="client-list" id="clientList">
          ${clientListHTML}
        </div>
        <div class="client-modal-footer">
          <button class="client-guest-btn" id="clientGuestBtn">게스트 모드</button>
          <button class="client-backup-btn" id="clientBackupBtn" title="다른 컴퓨터로 데이터 옮기기">📦 백업/복원</button>
          <button class="client-new-btn" id="clientNewBtn">+ 신규 등록</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 30);

    document.getElementById('clientModalClose').addEventListener('click', removeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) removeModal(); });

    document.querySelectorAll('.client-list-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.client-delete-btn')) return;
        setActiveClient(item.dataset.id);
        removeModal();
      });
    });

    document.querySelectorAll('.client-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showDeleteConfirm(btn.dataset.id);
      });
    });

    document.querySelectorAll('.client-export-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const r = exportClient(btn.dataset.id);
        if (r) {
          // Brief inline confirmation
          const orig = btn.textContent;
          btn.textContent = '✓';
          btn.classList.add('exported');
          setTimeout(() => { btn.textContent = orig; btn.classList.remove('exported'); }, 1200);
        }
      });
    });

    document.getElementById('clientGuestBtn').addEventListener('click', () => {
      clearActiveClient();
      removeModal();
    });
    document.getElementById('clientNewBtn').addEventListener('click', () => {
      showNewClientModal();
    });
    document.getElementById('clientBackupBtn').addEventListener('click', () => {
      showBackupModal();
    });
  }

  function showDeleteConfirm(clientId) {
    const client = getClients().find(c => c.id === clientId);
    if (!client) return;

    const confirm = document.createElement('div');
    confirm.className = 'client-delete-confirm';
    confirm.innerHTML = `
      <div class="client-delete-confirm-box">
        <div class="client-delete-icon">⚠️</div>
        <h3>"${esc(client.name)}"님의 데이터 삭제</h3>
        <p>모든 훈련/검사 데이터가 <strong>영구 삭제</strong>됩니다.<br>이 작업은 되돌릴 수 없습니다.</p>
        <div class="client-delete-actions">
          <button class="client-delete-cancel" id="deleteCancel">취소</button>
          <button class="client-delete-ok" id="deleteOk">삭제</button>
        </div>
      </div>
    `;

    const modal = document.getElementById('clientModal');
    if (modal) modal.appendChild(confirm);

    document.getElementById('deleteCancel').addEventListener('click', () => confirm.remove());
    document.getElementById('deleteOk').addEventListener('click', () => {
      deleteClient(clientId);
      confirm.remove();
      showLoadClientModal();
    });
  }

  // ==================== 백업/복원 모달 ====================
  function showBackupModal() {
    removeModal();
    const clients = getClients();
    const totalSessions = clients.reduce((s, c) => s + getClientSessions(c.id).length, 0);

    const overlay = document.createElement('div');
    overlay.id = 'clientModal';
    overlay.className = 'client-modal';
    overlay.innerHTML = `
      <div class="client-modal-box client-modal-wide">
        <div class="client-modal-header">
          <h2>📦 데이터 백업 / 복원</h2>
          <button class="client-modal-close" id="clientModalClose">&times;</button>
        </div>
        <div class="backup-body">
          <div class="backup-stats">
            <div class="backup-stat"><div class="backup-stat-num">${clients.length}</div><div class="backup-stat-lbl">클라이언트</div></div>
            <div class="backup-stat"><div class="backup-stat-num">${totalSessions}</div><div class="backup-stat-lbl">총 세션</div></div>
          </div>

          <div class="backup-section">
            <h3>📤 내보내기 (이 컴퓨터 → 파일)</h3>
            <p class="backup-desc">현재 컴퓨터의 모든 클라이언트 데이터를 JSON 파일로 저장합니다. USB·이메일·클라우드로 옮긴 뒤 다른 컴퓨터에서 복원할 수 있습니다.</p>
            <button class="backup-btn backup-btn-primary" id="backupExportAllBtn" ${clients.length === 0 ? 'disabled' : ''}>
              💾 전체 백업 다운로드
            </button>
          </div>

          <div class="backup-section">
            <h3>📥 복원하기 (파일 → 이 컴퓨터)</h3>
            <p class="backup-desc">다른 컴퓨터에서 내보낸 JSON 파일을 가져옵니다. 동일한 클라이언트가 있으면 어떻게 처리할지 선택할 수 있습니다.</p>
            <div class="backup-mode-row">
              <label class="backup-radio">
                <input type="radio" name="backupMode" value="merge" checked>
                <span><b>병합</b> — 같은 클라이언트의 새 세션만 추가 <small>(권장)</small></span>
              </label>
              <label class="backup-radio">
                <input type="radio" name="backupMode" value="replace">
                <span><b>덮어쓰기</b> — 동일 클라이언트의 데이터를 백업 파일로 교체</span>
              </label>
              <label class="backup-radio">
                <input type="radio" name="backupMode" value="addNew">
                <span><b>새 클라이언트로</b> — 같은 ID도 별개 신규로 추가</span>
              </label>
            </div>
            <input type="file" id="backupImportFile" accept=".json,application/json" style="display:none;">
            <button class="backup-btn backup-btn-secondary" id="backupImportBtn">
              📂 백업 파일 선택해서 복원
            </button>
          </div>

          <div class="backup-result" id="backupResult"></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 30);

    document.getElementById('clientModalClose').addEventListener('click', removeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) removeModal(); });

    document.getElementById('backupExportAllBtn').addEventListener('click', () => {
      const r = exportAll();
      showBackupResult(`✅ 백업 다운로드 완료 — 클라이언트 ${r.clientCount}명 · 세션 ${r.sessionCount}건`, 'ok');
    });

    const fileInput = document.getElementById('backupImportFile');
    document.getElementById('backupImportBtn').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const mode = document.querySelector('input[name="backupMode"]:checked')?.value || 'merge';
      const reader = new FileReader();
      reader.onload = () => {
        const r = importAll(String(reader.result || ''), mode);
        if (r.errors.length) {
          showBackupResult('⚠ ' + r.errors.join(' · '), 'fail');
        } else {
          const summary = `✅ 복원 완료 — 신규 ${r.added}명 · 병합/교체 ${r.merged}명 · 세션 ${r.sessionsAdded}건 추가`;
          showBackupResult(summary, 'ok');
          // Refresh stats
          setTimeout(() => showBackupModal(), 1800);
        }
        fileInput.value = ''; // reset for re-pick
      };
      reader.onerror = () => showBackupResult('⚠ 파일 읽기 실패', 'fail');
      reader.readAsText(file);
    });
  }

  function showBackupResult(text, kind) {
    const el = document.getElementById('backupResult');
    if (!el) return;
    el.textContent = text;
    el.className = 'backup-result show ' + (kind === 'ok' ? 'ok' : 'fail');
  }

  function removeModal() {
    const modal = document.getElementById('clientModal');
    if (modal) {
      modal.style.pointerEvents = 'none';
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 250);
    }
  }

  function shakeInput(el) {
    if (!el) return;
    el.classList.add('shake');
    el.focus();
    setTimeout(() => el.classList.remove('shake'), 500);
  }

  return {
    getClients,
    createClient,
    deleteClient,
    getActiveClient,
    setActiveClient,
    clearActiveClient,
    saveSession,
    getClientSessions,
    showNewClientModal,
    showLoadClientModal,
    updateClientDisplay,
    exportAll,
    exportClient,
    importAll,
    showBackupModal
  };
})();

// 글로벌 헬퍼
function saveClientSession(metrics) { ClientManager.saveSession(metrics); }
