// ==================== SmartSwitching — 클라이언트 대시보드 ====================
const Dashboard = (() => {
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function svg(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  }

  function modeLabel(s) {
    if (s.mode === 'test') {
      const t = { preschool: '검사-유아', elementary: '검사-초등', middle: '검사-중등', adult: '검사-성인' };
      return t[s.testType] || '검사';
    }
    return s.level != null ? `훈련 L${s.level + 1}` : '훈련';
  }

  // ==================== 대시보드 표시 ====================
  function showDashboard() {
    const client = ClientManager.getActiveClient();
    if (!client) {
      alert('클라이언트를 먼저 선택해주세요.');
      return;
    }

    const sessions = ClientManager.getClientSessions(client.id);
    removeDashboard();

    const overlay = document.createElement('div');
    overlay.id = 'dashboardOverlay';
    overlay.className = 'dashboard-overlay';

    const created = new Date(client.createdAt).toLocaleDateString('ko-KR');
    const genderIcon = client.gender === '여' ? '👩' : '👨';

    overlay.innerHTML = `
      <div class="dashboard-container">
        <div class="dashboard-header">
          <div class="dashboard-client-info">
            <span class="dashboard-avatar">${genderIcon}</span>
            <div>
              <h2>${escapeHTML(client.name)}</h2>
              <span class="dashboard-meta">${client.gender} · ${client.age}세 · 등록: ${created} · 총 ${sessions.length}회 세션</span>
            </div>
          </div>
          <div class="dashboard-header-actions">
            <button class="dashboard-pdf-btn" onclick="Dashboard.exportPDF()">PDF 저장</button>
            <button class="dashboard-close-btn" onclick="Dashboard.hide()">&times;</button>
          </div>
        </div>

        ${sessions.length === 0 ? `
          <div class="dashboard-empty">
            <div class="dashboard-empty-icon">📊</div>
            <p>아직 기록이 없습니다.<br>훈련 또는 검사를 완료하면 데이터가 자동 저장됩니다.</p>
          </div>
        ` : `
          <div class="dashboard-summary-cards">
            ${renderSummaryCards(sessions)}
          </div>

          <div class="dashboard-chart-box dashboard-full-width">
            <h3>📈 반응시간 추이 (사전 → 사후)</h3>
            <div id="dashTimeTrend"></div>
          </div>

          <div class="dashboard-charts-grid">
            <div class="dashboard-chart-box">
              <h3>🧠 인지 스위칭 프로필</h3>
              <div id="dashRadar"></div>
            </div>
            <div class="dashboard-chart-box">
              <h3>📊 사전/사후 비교</h3>
              <div id="dashPrePost"></div>
            </div>
          </div>

          <div class="dashboard-chart-box dashboard-full-width">
            <h3>📋 세션 기록</h3>
            <div class="dashboard-table-wrap">
              <table class="dashboard-table">
                <thead>
                  <tr><th>날짜</th><th>모드</th><th>정답</th><th>오류</th><th>오류율</th><th>평균 반응시간</th><th>총 시간</th></tr>
                </thead>
                <tbody id="dashTableBody">${renderSessionRows(sessions)}</tbody>
              </table>
            </div>
          </div>

          <div class="dashboard-chart-box dashboard-full-width" id="aiAnalysisSection">
            <h3>📊 AI 분석 리포트</h3>
            <div id="aiAnalysisContent" class="ai-analysis-content"></div>
          </div>
        `}
      </div>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 30);

    if (sessions.length > 0) {
      renderTimeTrendDashed(document.getElementById('dashTimeTrend'), sessions);
      renderCognitiveRadar(document.getElementById('dashRadar'), sessions);
      renderPrePostChart(document.getElementById('dashPrePost'), sessions);
      if (sessions.length >= 2) analyzeWithAI();
    }
  }

  function hide() { removeDashboard(); }

  function removeDashboard() {
    const el = document.getElementById('dashboardOverlay');
    if (el) { el.classList.remove('show'); setTimeout(() => el.remove(), 200); }
  }

  function escapeHTML(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ==================== 요약 카드 ====================
  function renderSummaryCards(sessions) {
    const total = sessions.length;
    const avgErr = (sessions.reduce((s, r) => s + (r.errorRate || 0), 0) / total).toFixed(1);
    const avgTime = (sessions.reduce((s, r) => s + (r.avgTime || 0), 0) / total).toFixed(2);
    const bestTime = Math.min(...sessions.map(s => s.avgTime || Infinity)).toFixed(2);
    const perfect = sessions.filter(s => s.errorRate === 0).length;
    // 사전/사후 반응시간 개선
    const n = Math.min(Math.floor(total / 2), 10);
    const preT = n > 0 ? sessions.slice(0, n).reduce((s, r) => s + (r.avgTime || 0), 0) / n : 0;
    const postT = n > 0 ? sessions.slice(-n).reduce((s, r) => s + (r.avgTime || 0), 0) / n : 0;
    const improve = preT > 0 ? Math.round((preT - postT) / preT * 100) : 0; // 시간 감소가 개선
    const impColor = improve > 0 ? '#2ecc71' : improve < 0 ? '#e74c3c' : '#5a6080';

    return `
      <div class="summary-card"><div class="summary-icon">📊</div><div class="summary-value">${total}</div><div class="summary-label">총 세션</div></div>
      <div class="summary-card"><div class="summary-icon">⚡</div><div class="summary-value">${avgTime}초</div><div class="summary-label">평균 반응시간</div></div>
      <div class="summary-card"><div class="summary-icon">💎</div><div class="summary-value">${bestTime === 'Infinity' ? '-' : bestTime + '초'}</div><div class="summary-label">최단 반응시간</div></div>
      <div class="summary-card"><div class="summary-icon">🎯</div><div class="summary-value">${avgErr}%</div><div class="summary-label">평균 오류율</div></div>
      <div class="summary-card"><div class="summary-icon">📈</div><div class="summary-value" style="color:${impColor}">${improve > 0 ? '+' : ''}${improve}%</div><div class="summary-label">속도 개선</div></div>
    `;
  }

  // ==================== 세션 테이블 ====================
  function renderSessionRows(sessions) {
    return [...sessions].reverse().slice(0, 50).map(s => {
      const date = new Date(s.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
      const time = new Date(s.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      const totalSec = Math.round((s.totalTime || 0) / 1000);
      const errClass = (s.errorRate || 0) <= 10 ? 'metric-good' : (s.errorRate || 0) <= 20 ? 'metric-mid' : 'metric-bad';
      const timeClass = (s.avgTime || 0) <= 2 ? 'metric-good' : (s.avgTime || 0) <= 3 ? 'metric-mid' : 'metric-bad';
      return `<tr><td>${date} ${time}</td><td>${modeLabel(s)}</td><td>${s.correct || 0}</td><td>${s.errors || 0}</td><td class="${errClass}">${(s.errorRate || 0).toFixed(1)}%</td><td class="${timeClass}">${(s.avgTime || 0).toFixed(2)}초</td><td>${totalSec}초</td></tr>`;
    }).join('');
  }

  // ==================== 반응시간 추이 (사전→사후, 점선→실선) ====================
  function renderTimeTrendDashed(container, sessions) {
    if (!container || sessions.length === 0) return;

    const w = 700, h = 280;
    const pad = { top: 30, right: 30, bottom: 45, left: 55 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    const s = svg('svg', { width: '100%', height: h, viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: 'xMidYMid meet' });
    const data = sessions.slice(-40);
    const maxT = Math.max(...data.map(d => d.avgTime || 0), 3);
    const minT = 0;
    const range = maxT - minT || 1;

    const splitIdx = Math.floor(data.length / 2);
    if (data.length >= 4) {
      const preEndX = pad.left + (chartW * (splitIdx - 1) / Math.max(data.length - 1, 1));
      s.appendChild(svg('rect', { x: pad.left, y: pad.top, width: preEndX - pad.left, height: chartH, fill: 'rgba(139,92,246,0.04)', rx: 4 }));
      s.appendChild(svg('rect', { x: preEndX, y: pad.top, width: pad.left + chartW - preEndX, height: chartH, fill: 'rgba(46,204,113,0.04)', rx: 4 }));
      const preLabel = svg('text', { x: pad.left + 8, y: pad.top + 16, fill: '#8b5cf6', 'font-size': '11', 'font-weight': '600' });
      preLabel.textContent = '사전'; s.appendChild(preLabel);
      const postLabel = svg('text', { x: preEndX + 8, y: pad.top + 16, fill: '#2ecc71', 'font-size': '11', 'font-weight': '600' });
      postLabel.textContent = '사후'; s.appendChild(postLabel);
    }

    // 2.0초 임상 기준선
    if (maxT >= 2) {
      const benchY = pad.top + chartH - ((2 - minT) / range * chartH);
      s.appendChild(svg('line', { x1: pad.left, y1: benchY, x2: w - pad.right, y2: benchY, stroke: '#e07020', 'stroke-width': 1.2, 'stroke-dasharray': '5,3', opacity: '0.7' }));
      const bl = svg('text', { x: w - pad.right - 2, y: benchY - 4, 'text-anchor': 'end', fill: '#e07020', 'font-size': '9' });
      bl.textContent = '2.0초 기준'; s.appendChild(bl);
    }

    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (chartH * i / 4);
      const val = (maxT - (range * i / 4)).toFixed(1);
      s.appendChild(svg('line', { x1: pad.left, y1: y, x2: w - pad.right, y2: y, stroke: 'rgba(255,255,255,0.06)', 'stroke-width': 1 }));
      const label = svg('text', { x: pad.left - 8, y: y + 4, 'text-anchor': 'end', fill: '#5a6080', 'font-size': '10' });
      label.textContent = val + '초'; s.appendChild(label);
    }

    const points = data.map((d, i) => ({
      x: pad.left + (chartW * i / Math.max(data.length - 1, 1)),
      y: pad.top + chartH - (((d.avgTime || 0) - minT) / range * chartH),
      t: d.avgTime || 0, isPre: i < splitIdx
    }));

    if (points.length > 1) {
      const prePoints = points.filter(p => p.isPre);
      if (prePoints.length > 1) {
        s.appendChild(svg('polyline', {
          points: prePoints.map(p => `${p.x},${p.y}`).join(' '),
          fill: 'none', stroke: '#8b5cf6', 'stroke-width': 2.5,
          'stroke-dasharray': '8,4', 'stroke-linecap': 'round'
        }));
      }
      const postPoints = points.filter(p => !p.isPre);
      if (postPoints.length > 1) {
        s.appendChild(svg('polyline', {
          points: postPoints.map(p => `${p.x},${p.y}`).join(' '),
          fill: 'none', stroke: '#2ecc71', 'stroke-width': 2.5,
          'stroke-linecap': 'round'
        }));
      }

      if (prePoints.length > 0) {
        const preAvg = prePoints.reduce((s, p) => s + p.t, 0) / prePoints.length;
        const preAvgY = pad.top + chartH - ((preAvg - minT) / range * chartH);
        s.appendChild(svg('line', {
          x1: prePoints[0].x, y1: preAvgY, x2: prePoints[prePoints.length - 1].x, y2: preAvgY,
          stroke: '#8b5cf6', 'stroke-width': 1, 'stroke-dasharray': '4,4', opacity: '0.5'
        }));
        const avgLabel = svg('text', { x: prePoints[0].x + 2, y: preAvgY - 6, fill: '#8b5cf6', 'font-size': '9' });
        avgLabel.textContent = `평균 ${preAvg.toFixed(2)}초`; s.appendChild(avgLabel);
      }
      if (postPoints.length > 0) {
        const postAvg = postPoints.reduce((s, p) => s + p.t, 0) / postPoints.length;
        const postAvgY = pad.top + chartH - ((postAvg - minT) / range * chartH);
        s.appendChild(svg('line', {
          x1: postPoints[0].x, y1: postAvgY, x2: postPoints[postPoints.length - 1].x, y2: postAvgY,
          stroke: '#2ecc71', 'stroke-width': 1, 'stroke-dasharray': '4,4', opacity: '0.5'
        }));
        const avgLabel = svg('text', { x: postPoints[postPoints.length - 1].x - 2, y: postAvgY - 6, 'text-anchor': 'end', fill: '#2ecc71', 'font-size': '9' });
        avgLabel.textContent = `평균 ${postAvg.toFixed(2)}초`; s.appendChild(avgLabel);
      }
    }

    points.forEach(p => {
      const color = p.isPre ? '#8b5cf6' : '#2ecc71';
      s.appendChild(svg('circle', { cx: p.x, cy: p.y, r: 4, fill: color, stroke: '#141627', 'stroke-width': 1.5 }));
    });

    const xLabel = svg('text', { x: w / 2, y: h - 5, 'text-anchor': 'middle', fill: '#5a6080', 'font-size': '10' });
    xLabel.textContent = `세션 회차 (총 ${data.length}회)`; s.appendChild(xLabel);

    const legY = h - 18;
    s.appendChild(svg('line', { x1: pad.left, y1: legY, x2: pad.left + 20, y2: legY, stroke: '#8b5cf6', 'stroke-width': 2, 'stroke-dasharray': '6,3' }));
    const l1 = svg('text', { x: pad.left + 24, y: legY + 4, fill: '#8090b0', 'font-size': '9' });
    l1.textContent = '사전'; s.appendChild(l1);
    s.appendChild(svg('line', { x1: pad.left + 55, y1: legY, x2: pad.left + 75, y2: legY, stroke: '#2ecc71', 'stroke-width': 2 }));
    const l2 = svg('text', { x: pad.left + 79, y: legY + 4, fill: '#8090b0', 'font-size': '9' });
    l2.textContent = '사후'; s.appendChild(l2);

    container.appendChild(s);
  }

  // ==================== 인지 스위칭 레이더 (5축) ====================
  function renderCognitiveRadar(container, sessions) {
    if (!container || sessions.length === 0) return;

    // 정확도 %: 100 - 평균 오류율
    const accuracyPct = Math.min(100, 100 - (sessions.reduce((s, r) => s + (r.errorRate || 0), 0) / sessions.length));
    // 속도 %: 임상 기준 2.0초 대비 (빠를수록 100에 가까움)
    const avgTime = sessions.reduce((s, r) => s + (r.avgTime || 0), 0) / sessions.length;
    const speedPct = Math.min(100, Math.max(0, (2.0 / Math.max(avgTime, 0.1)) * 50));
    // 일관성: avgTime 표준편차가 작을수록 좋음
    const times = sessions.map(s => s.avgTime || 0);
    const mean = times.reduce((a, b) => a + b, 0) / times.length;
    const stddev = Math.sqrt(times.reduce((s, v) => s + (v - mean) ** 2, 0) / times.length);
    const consistencyPct = Math.max(0, 100 - stddev / Math.max(mean, 0.1) * 100);
    // 집중력: 최근 절반 정확도 / 전체 정확도
    const half = Math.floor(sessions.length / 2);
    const recentErr = half > 0 ? sessions.slice(half).reduce((s, r) => s + (r.errorRate || 0), 0) / (sessions.length - half) : sessions.reduce((s, r) => s + (r.errorRate || 0), 0) / sessions.length;
    const recentAcc = 100 - recentErr;
    const overallAcc = 100 - (sessions.reduce((s, r) => s + (r.errorRate || 0), 0) / sessions.length);
    const concentrationPct = Math.min(100, (recentAcc / Math.max(overallAcc, 1)) * 100);
    // 지구력: 총 세션 수 기반 (10회 = 100%)
    const enduranceePct = Math.min(100, sessions.length * 10);

    const size = 280, cx = size / 2, cy = size / 2 + 10, r = 85;
    const s = svg('svg', { width: '100%', height: size, viewBox: `0 0 ${size} ${size}` });

    const axes = [
      { label: '정확도', value: accuracyPct, angle: -90 },
      { label: '속도', value: speedPct, angle: -90 + 72 },
      { label: '일관성', value: consistencyPct, angle: -90 + 144 },
      { label: '집중력', value: concentrationPct, angle: -90 + 216 },
      { label: '지구력', value: enduranceePct, angle: -90 + 288 }
    ];

    const toRad = d => d * Math.PI / 180;
    const getPoint = (angle, dist) => ({ x: cx + dist * Math.cos(toRad(angle)), y: cy + dist * Math.sin(toRad(angle)) });

    [20, 40, 60, 80, 100].forEach(pct => {
      const rd = r * pct / 100;
      const pts = axes.map(a => getPoint(a.angle, rd)).map(p => `${p.x},${p.y}`).join(' ');
      s.appendChild(svg('polygon', { points: pts, fill: 'none', stroke: 'rgba(255,255,255,0.06)', 'stroke-width': 1 }));
    });
    axes.forEach(a => {
      const p = getPoint(a.angle, r);
      s.appendChild(svg('line', { x1: cx, y1: cy, x2: p.x, y2: p.y, stroke: 'rgba(255,255,255,0.08)', 'stroke-width': 1 }));
    });

    const dataPoints = axes.map(a => getPoint(a.angle, r * a.value / 100));
    s.appendChild(svg('polygon', { points: dataPoints.map(p => `${p.x},${p.y}`).join(' '), fill: 'rgba(91,141,239,0.2)', stroke: '#5b8def', 'stroke-width': 2 }));
    dataPoints.forEach(p => s.appendChild(svg('circle', { cx: p.x, cy: p.y, r: 4, fill: '#5b8def' })));

    axes.forEach(a => {
      const p = getPoint(a.angle, r + 22);
      const t = svg('text', { x: p.x, y: p.y + 4, 'text-anchor': 'middle', fill: '#8090b0', 'font-size': '11', 'font-weight': '600' });
      t.textContent = `${a.label} ${Math.round(a.value)}`;
      s.appendChild(t);
    });

    container.appendChild(s);
  }

  // ==================== 사전/사후 비교 차트 ====================
  function renderPrePostChart(container, sessions) {
    if (!container || sessions.length < 4) {
      if (container) container.innerHTML = '<div style="text-align:center;color:#5a6080;padding:30px;">최소 4회 이상 세션 필요</div>';
      return;
    }

    const n = Math.min(Math.floor(sessions.length / 2), 10);
    const pre = sessions.slice(0, n);
    const post = sessions.slice(-n);

    const preAvg = {
      errRate: pre.reduce((s, r) => s + (r.errorRate || 0), 0) / n,
      avgTime: pre.reduce((s, r) => s + (r.avgTime || 0), 0) / n,
      totalSec: pre.reduce((s, r) => s + (r.totalTime || 0), 0) / n / 1000
    };
    const postAvg = {
      errRate: post.reduce((s, r) => s + (r.errorRate || 0), 0) / n,
      avgTime: post.reduce((s, r) => s + (r.avgTime || 0), 0) / n,
      totalSec: post.reduce((s, r) => s + (r.totalTime || 0), 0) / n / 1000
    };

    // hb=false → 낮을수록 좋음 (오류율, 시간)
    const metrics = [
      { label: '오류율', pre: preAvg.errRate.toFixed(1), post: postAvg.errRate.toFixed(1), unit: '%', hb: false, rawPre: preAvg.errRate, rawPost: postAvg.errRate },
      { label: '평균 반응시간', pre: preAvg.avgTime.toFixed(2), post: postAvg.avgTime.toFixed(2), unit: '초', hb: false, rawPre: preAvg.avgTime, rawPost: postAvg.avgTime },
      { label: '총 소요시간', pre: preAvg.totalSec.toFixed(0), post: postAvg.totalSec.toFixed(0), unit: '초', hb: false, rawPre: preAvg.totalSec, rawPost: postAvg.totalSec }
    ];

    const w = 400, h = 200;
    const pad = { top: 20, right: 20, bottom: 40, left: 95 };
    const chartW = w - pad.left - pad.right;
    const barH = 20, gap = 18;

    const s = svg('svg', { width: '100%', height: h, viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: 'xMidYMid meet' });

    metrics.forEach((m, i) => {
      const y = pad.top + i * (barH * 2 + gap);
      const maxVal = Math.max(m.rawPre, m.rawPost, 0.01);

      const label = svg('text', { x: pad.left - 8, y: y + barH, 'text-anchor': 'end', fill: '#8090b0', 'font-size': '11', 'font-weight': '500' });
      label.textContent = m.label; s.appendChild(label);

      const preW = Math.max(2, (m.rawPre / maxVal) * chartW * 0.75);
      s.appendChild(svg('rect', { x: pad.left, y: y, width: preW, height: barH, rx: 4, fill: 'rgba(139,92,246,0.4)' }));
      const pl = svg('text', { x: pad.left + preW + 4, y: y + barH - 5, fill: '#8b5cf6', 'font-size': '10', 'font-weight': '600' });
      pl.textContent = `${m.pre}${m.unit}`; s.appendChild(pl);

      const postW = Math.max(2, (m.rawPost / maxVal) * chartW * 0.75);
      s.appendChild(svg('rect', { x: pad.left, y: y + barH + 2, width: postW, height: barH, rx: 4, fill: 'rgba(46,204,113,0.5)' }));
      const pol = svg('text', { x: pad.left + postW + 4, y: y + barH * 2 - 3, fill: '#2ecc71', 'font-size': '10', 'font-weight': '600' });
      pol.textContent = `${m.post}${m.unit}`; s.appendChild(pol);

      // 낮을수록 좋은 지표 → 감소가 긍정
      const change = m.hb ? m.rawPost - m.rawPre : m.rawPre - m.rawPost;
      const pct = m.rawPre > 0 ? Math.round((change / m.rawPre) * 100) : 0;
      const cc = change > 0 ? '#2ecc71' : change < 0 ? '#e74c3c' : '#5a6080';
      const ct = svg('text', { x: w - 5, y: y + barH + 2, 'text-anchor': 'end', fill: cc, 'font-size': '12', 'font-weight': '700' });
      ct.textContent = `${change > 0 ? '▼' : change < 0 ? '▲' : ''} ${Math.abs(pct)}%`; s.appendChild(ct);
    });

    const ly = h - 12;
    s.appendChild(svg('rect', { x: pad.left, y: ly, width: 10, height: 10, rx: 2, fill: 'rgba(139,92,246,0.4)' }));
    const l1 = svg('text', { x: pad.left + 14, y: ly + 9, fill: '#8090b0', 'font-size': '9' });
    l1.textContent = `사전 (첫${n}회)`; s.appendChild(l1);
    s.appendChild(svg('rect', { x: pad.left + 85, y: ly, width: 10, height: 10, rx: 2, fill: 'rgba(46,204,113,0.5)' }));
    const l2 = svg('text', { x: pad.left + 99, y: ly + 9, fill: '#8090b0', 'font-size': '9' });
    l2.textContent = `사후 (최근${n}회)`; s.appendChild(l2);

    container.appendChild(s);
  }

  // ==================== AI 분석 (데이터 기반) ====================
  async function analyzeWithAI() {
    const client = ClientManager.getActiveClient();
    if (!client) return;

    const sessions = ClientManager.getClientSessions(client.id);
    if (sessions.length < 2) return;

    const section = document.getElementById('aiAnalysisSection');
    const content = document.getElementById('aiAnalysisContent');
    if (!section || !content) return;

    content.innerHTML = '<div class="ai-loading"><div class="ai-spinner"></div><span>데이터를 분석하고 있습니다...</span></div>';

    const total = sessions.length;
    const n = Math.min(Math.floor(total / 2), 10);
    const pre = sessions.slice(0, n);
    const post = sessions.slice(-n);
    const preErr = pre.reduce((s, r) => s + (r.errorRate || 0), 0) / n;
    const postErr = post.reduce((s, r) => s + (r.errorRate || 0), 0) / n;
    const preT = pre.reduce((s, r) => s + (r.avgTime || 0), 0) / n;
    const postT = post.reduce((s, r) => s + (r.avgTime || 0), 0) / n;
    const errImprove = preErr - postErr;
    const timeImprove = preT - postT;
    const overallErr = sessions.reduce((s, r) => s + (r.errorRate || 0), 0) / total;
    const overallTime = sessions.reduce((s, r) => s + (r.avgTime || 0), 0) / total;
    const testCount = sessions.filter(s => s.mode === 'test').length;
    const trainCount = sessions.filter(s => s.mode === 'training').length;

    await new Promise(r => setTimeout(r, 600));

    let report = '';
    report += '<h4>1. 전반적인 수행 평가</h4>';
    report += `<p>${client.name} 클라이언트(${client.age}세)는 총 ${total}회 세션을 수행하였습니다. `;
    report += `(검사 ${testCount}회, 훈련 ${trainCount}회). `;
    report += `평균 오류율은 <strong>${overallErr.toFixed(1)}%</strong>, 평균 반응시간은 <strong>${overallTime.toFixed(2)}초</strong>입니다. `;
    const benchErr = overallErr <= 10;
    const benchTime = overallTime <= 2.0;
    if (benchErr && benchTime) {
      report += `두 지표 모두 임상 기준(오류율 10%, 반응시간 2.0초) 이내로 양호한 수행 수준입니다.`;
    } else if (benchErr) {
      report += `오류율은 기준 이내이나 반응시간이 다소 느립니다.`;
    } else if (benchTime) {
      report += `반응속도는 양호하나 오류율이 임상 기준을 상회합니다.`;
    } else {
      report += `두 지표 모두 임상 기준을 상회하여 반복 훈련이 필요합니다.`;
    }
    report += '</p>';

    report += '<h4>2. 주요 강점</h4><ul>';
    if (errImprove > 2) report += `<li>오류율이 ${preErr.toFixed(1)}%에서 ${postErr.toFixed(1)}%로 <strong>${errImprove.toFixed(1)}%p</strong> 감소하여 정확도가 향상되었습니다.</li>`;
    if (timeImprove > 0.1) report += `<li>평균 반응시간이 ${preT.toFixed(2)}초에서 ${postT.toFixed(2)}초로 <strong>${timeImprove.toFixed(2)}초</strong> 단축되었습니다.</li>`;
    if (postErr < 5) report += `<li>최근 오류율 ${postErr.toFixed(1)}%로 매우 안정적인 수행을 보이고 있습니다.</li>`;
    if (total >= 10) report += `<li>총 ${total}회의 꾸준한 훈련으로 인지 스위칭 능력 발달이 기대됩니다.</li>`;
    report += '</ul>';

    report += '<h4>3. 개선이 필요한 영역</h4><ul>';
    if (postErr > 15) report += `<li>최근 오류율 ${postErr.toFixed(1)}%가 높은 수준이며, 주의집중 훈련 강화가 권장됩니다.</li>`;
    if (postT > 2.5) report += `<li>최근 반응시간 ${postT.toFixed(2)}초로 처리 속도 개선이 필요합니다.</li>`;
    if (errImprove < -1) report += `<li>오류율이 초기 대비 증가했습니다(${Math.abs(errImprove).toFixed(1)}%p). 난이도 하향 조정을 고려하세요.</li>`;
    if (timeImprove < -0.2) report += `<li>반응시간이 ${Math.abs(timeImprove).toFixed(2)}초 증가했습니다. 피로도/집중도 점검이 필요합니다.</li>`;
    if (total < 5) report += `<li>데이터가 아직 부족합니다. 더 많은 세션 누적 후 재분석이 권장됩니다.</li>`;
    report += '</ul>';

    report += '<h4>4. 훈련 권장사항</h4><ul>';
    report += `<li>주 3~5회, 회당 20회차 이상의 훈련 스케줄을 유지하세요.</li>`;
    if (postErr > 10) report += `<li>낮은 레벨(L1~L3)부터 시작해 오류율 10% 이하를 안정적으로 달성한 후 단계 상승하세요.</li>`;
    else report += `<li>현재 수준에서 더 높은 난이도(레벨 상승)로 도전하여 작업기억 확장을 유도하세요.</li>`;
    if (trainCount > 0 && testCount === 0) report += `<li>정기적으로 검사 모드를 병행하여 객관적 평가 지표를 확보하세요.</li>`;
    report += '</ul>';

    report += '<h4>5. 종합 소견</h4>';
    report += `<p>${client.name} 클라이언트는 `;
    if (errImprove > 2 && timeImprove > 0.1) {
      report += `정확도와 속도 모두 긍정적 추세를 보이고 있습니다. 현재 훈련 계획을 유지하며 점진적 난이도 상향을 권장합니다.</p>`;
    } else if (errImprove > 0 || timeImprove > 0) {
      report += `부분적 향상이 관찰됩니다. 약점 지표를 중점적으로 훈련하며 균형 잡힌 프로그램 구성을 권장합니다.</p>`;
    } else {
      report += `성과 정체 또는 감소 추세입니다. 훈련 환경, 피로도, 난이도 조정을 검토하시기 바랍니다.</p>`;
    }

    content.innerHTML = `
      <div class="ai-result">
        <div class="ai-result-header">
          <span class="ai-badge">📊 데이터 기반 분석</span>
          <span class="ai-date">${new Date().toLocaleString('ko-KR')}</span>
        </div>
        <div class="ai-result-body">${report}</div>
      </div>
    `;
  }

  // ==================== PDF 저장 ====================
  function exportPDF() {
    const overlay = document.getElementById('dashboardOverlay');
    if (!overlay) return;
    overlay.scrollTop = 0;
    document.body.classList.add('printing-dashboard');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-dashboard');
    }, 500);
  }

  return { show: showDashboard, hide, exportPDF, analyzeWithAI };
})();

window.Dashboard = Dashboard;
function showDashboard() { Dashboard.show(); }
