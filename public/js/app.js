/* ===================================================================
   LDCE Campus Solid Waste Management System - Frontend App Engine
   Department of Information Technology, L. D. College of Engineering
=================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  let state = {
    projectInfo: null,
    teamMembers: [],
    smartObjectives: [],
    auditLogs: [],
    analytics: {},
    streams: [],
    wbsPackages: [],
    ganttTasks: [],
    raciMatrix: [],
    budget: null,
    risks: [],
    composter: null,
    classifierItems: [],
    activeTab: 'overview',
    quizCurrentIndex: 0,
    quizScore: 0,
    alerts: [],
    adminFilter: 'all',
    adminSearchQuery: ''
  };

  // DOM Elements
  const tabButtons = document.querySelectorAll('.nav-link-btn, .tab-btn, .nav-btn[data-tab]');
  const viewSections = document.querySelectorAll('.view-section');
  const alertModal = document.getElementById('alertModal');
  const openAlertModalBtn = document.getElementById('openAlertModalBtn');
  const closeAlertModalBtn = document.getElementById('closeAlertModalBtn');
  const alertForm = document.getElementById('alertForm');
  const auditForm = document.getElementById('auditForm');
  const classifierSearch = document.getElementById('classifierSearch');

  // Composter Simulator Sliders
  const greenSlider = document.getElementById('greenSlider');
  const brownSlider = document.getElementById('brownSlider');
  const greenValLabel = document.getElementById('greenValLabel');
  const brownValLabel = document.getElementById('brownValLabel');

  // Init App
  init();

  async function init() {
    setupNavigation();
    setupModals();
    setupCustomSelect();
    setupAdminLogin();
    setupAdminConsole();
    setupComposterSimulator();
    await loadInitialData();
    setupAuditForm();
    setupClassifierSearch();
    setupSortingQuiz();
  }

  // Navigation Logic
  function setupNavigation() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-tab]');
      if (!target) return;
      const targetTab = target.getAttribute('data-tab');
      if (!targetTab) return;
      e.preventDefault();
      switchTab(targetTab);
    });
  }

  function switchTab(tabId) {
    state.activeTab = tabId;

    // Update nav buttons
    document.querySelectorAll('.nav-link-btn').forEach(b => {
      if (b.getAttribute('data-tab') === tabId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    // Update views with clean transition
    document.querySelectorAll('.view-section').forEach(v => {
      if (v.id === `view-${tabId}`) {
        v.classList.add('active');
      } else {
        v.classList.remove('active');
      }
    });

    // Redraw charts or dynamic components when switching
    if (tabId === 'audit') {
      renderCharts();
    } else if (tabId === 'operations') {
      renderGantt();
      renderWBS();
      renderBudget();
      renderRisks();
    } else if (tabId === 'streams') {
      renderStreams();
      renderClassifier(state.classifierItems);
    } else if (tabId === 'admin') {
      renderAdminAlerts();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  // Modals
  function setupModals() {
    if (openAlertModalBtn && alertModal) {
      openAlertModalBtn.addEventListener('click', () => alertModal.classList.add('active'));
    }
    if (closeAlertModalBtn && alertModal) {
      closeAlertModalBtn.addEventListener('click', () => alertModal.classList.remove('active'));
    }
    if (alertModal) {
      alertModal.addEventListener('click', (e) => {
        if (e.target === alertModal) alertModal.classList.remove('active');
      });
    }

    if (alertForm) {
      alertForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const binInput = document.getElementById('alertBin');
        const bin = binInput ? binInput.value : 'Blue (Dry Recyclables)';
        const location = document.getElementById('alertLocation').value;
        const reportedBy = document.getElementById('alertName').value;
        const note = document.getElementById('alertNote').value;

        try {
          const res = await fetch('/api/alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bin, location, reportedBy, note })
          });
          const result = await res.json();
          if (result.success) {
            alert('Incident report submitted to LDCE Housekeeping Supervisor!');
            alertForm.reset();
            // Reset custom dropdown trigger to default
            const defLabel = document.getElementById('selectedStreamLabel');
            const defDot = document.getElementById('selectedStreamDot');
            const defHidden = document.getElementById('alertBin');
            if (defLabel) defLabel.innerText = 'Blue Stream (Dry Recyclables)';
            if (defDot) defDot.className = 'stream-dot blue';
            if (defHidden) defHidden.value = 'Blue (Dry Recyclables)';
            document.querySelectorAll('.custom-select-item').forEach((it, idx) => {
              if (idx === 0) it.classList.add('active');
              else it.classList.remove('active');
            });
            alertModal.classList.remove('active');

            // Refresh alerts list
            const updatedAlerts = await fetch('/api/alerts').then(r => r.json());
            state.alerts = updatedAlerts;
            renderAdminAlerts();
          }
        } catch (err) {
          console.error(err);
          alert('Failed to submit report. Please try again.');
        }
      });
    }
  }

  // Fetch initial project data from server
  async function loadInitialData() {
    try {
      const [projRes, auditRes, analyticsRes, wbsRes, ganttRes, raciRes, budgetRes, riskRes, compRes, classRes, alertsRes] = await Promise.all([
        fetch('/api/project-info').then(r => r.json()),
        fetch('/api/audit-logs').then(r => r.json()),
        fetch('/api/analytics').then(r => r.json()),
        fetch('/api/wbs').then(r => r.json()),
        fetch('/api/gantt').then(r => r.json()),
        fetch('/api/raci').then(r => r.json()),
        fetch('/api/budget').then(r => r.json()),
        fetch('/api/risks').then(r => r.json()),
        fetch('/api/compost').then(r => r.json()),
        fetch('/api/classifier').then(r => r.json()),
        fetch('/api/alerts').then(r => r.json())
      ]);

      state.projectInfo = projRes.projectInfo;
      state.teamMembers = projRes.teamMembers;
      state.smartObjectives = projRes.smartObjectives;
      state.streams = projRes.streams;
      state.auditLogs = auditRes;
      state.analytics = analyticsRes;
      state.wbsPackages = wbsRes;
      state.ganttTasks = ganttRes;
      state.raciMatrix = raciRes;
      state.budget = budgetRes;
      state.risks = riskRes;
      state.composter = compRes;
      state.classifierItems = classRes;
      state.alerts = alertsRes || [];

      renderHeroStats();
      renderAboutTeam();
      renderStreams();
      renderAuditTable();
      renderWBS();
      renderGantt();
      renderRACI();
      renderBudget();
      renderRisks();
      renderClassifier(state.classifierItems);
      renderCompostInfo();
      renderCharts();
      renderAdminAlerts();

    } catch (err) {
      console.error('Initialization error:', err);
    }
  }

  // Render Hero Stats
  function renderHeroStats() {
    const a = state.analytics;
    const divEl = document.getElementById('statDiversion');
    const accEl = document.getElementById('statAccuracy');
    const co2El = document.getElementById('statCo2e');

    if (divEl) divEl.innerHTML = `${a.diversionRatePct || 88.5}<span>%</span>`;
    if (accEl) accEl.innerHTML = `${a.avgAccuracyPct || 92.0}<span>%</span>`;
    if (co2El) co2El.innerHTML = `${Math.round(a.co2eSavedKg || 69.8)}<span>kg</span>`;
  }

  // Render About Page Team Members
  function renderAboutTeam() {
    const grid = document.getElementById('aboutTeamGrid');
    if (!grid || !state.teamMembers) return;
    grid.innerHTML = state.teamMembers.map(m => `
      <div class="member-card">
        <div>
          <div class="member-card-top">
            <div class="member-big-avatar" style="background: ${m.avatarColor};">${m.name.charAt(0)}</div>
            <div class="member-title-info">
              <h3>${m.name}</h3>
              <div class="member-enrol">Engineering Specialist</div>
            </div>
          </div>
          <div class="member-role-badge">${m.role}</div>
          <p class="member-contribution">
            ${m.responsibility}
          </p>
        </div>
      </div>
    `).join('');
  }

  // Render 4-Streams
  function renderStreams() {
    const container = document.getElementById('streamsContainer');
    if (!container) return;

    const themeMap = { green: 'green-accent', blue: 'blue-accent', black: 'black-accent', red: 'red-accent' };

    container.innerHTML = state.streams.map(s => `
      <div class="stream-card ${themeMap[s.id] || ''}">
        <div>
          <span class="stream-badge">${s.badge}</span>
          <h4 class="stream-title">${s.name}</h4>
          <p class="stream-dest">➔ ${s.targetDestination}</p>
          <ul class="stream-items">
            ${s.accepted.slice(0, 4).map(item => `<li><span>✓</span> ${item}</li>`).join('')}
          </ul>
        </div>
        <div style="font-size:0.75rem; color:var(--text-tertiary); border-top:1px solid rgba(255,255,255,0.06); padding-top:0.6rem;">
          ${s.handlingProtocol}
        </div>
      </div>
    `).join('');
  }

  // Render Audit Table
  function renderAuditTable() {
    const tbody = document.getElementById('auditTableBody');
    if (!tbody) return;

    tbody.innerHTML = state.auditLogs.map(log => {
      const total = log.wetKg + log.dryRecyclableKg + log.nonRecyclableKg;
      const diversionRate = total > 0 ? (((log.wetKg + log.dryRecyclableKg) / total) * 100).toFixed(1) : 0;
      const accuracy = total > 0 ? ((1 - (log.contaminationKg / total)) * 100).toFixed(1) : 100;

      return `
        <tr>
          <td><strong>${log.date}</strong></td>
          <td><span style="color:var(--stream-green); font-weight:600;">${log.wetKg.toFixed(1)} kg</span></td>
          <td><span style="color:var(--stream-blue); font-weight:600;">${log.dryRecyclableKg.toFixed(1)} kg</span></td>
          <td><span style="color:#94a3b8;">${log.nonRecyclableKg.toFixed(1)} kg</span></td>
          <td><span style="color:#ef4444;">${log.contaminationKg.toFixed(2)} kg</span></td>
          <td><span class="wbs-badge completed">${diversionRate}%</span></td>
          <td><span class="wbs-badge completed" style="background:rgba(59,130,246,0.2); color:#60a5fa;">${accuracy}%</span></td>
          <td style="font-size:0.75rem; color:var(--text-dim);">${log.notes}</td>
        </tr>
      `;
    }).join('');
  }

  // Audit Form Live Calculations & Submission
  function setupAuditForm() {
    if (!auditForm) return;

    const wetInput = document.getElementById('inputWet');
    const dryInput = document.getElementById('inputDry');
    const inertInput = document.getElementById('inputInert');
    const contamInput = document.getElementById('inputContam');

    function updatePreview() {
      const wet = parseFloat(wetInput.value) || 0;
      const dry = parseFloat(dryInput.value) || 0;
      const inert = parseFloat(inertInput.value) || 0;
      const contam = parseFloat(contamInput.value) || 0;

      const total = wet + dry + inert;
      const divRate = total > 0 ? (((wet + dry) / total) * 100).toFixed(1) : 0;
      const acc = total > 0 ? ((1 - (contam / total)) * 100).toFixed(1) : 100;
      const co2e = (wet * 1.2).toFixed(1);

      const totalEl = document.getElementById('previewTotal');
      const divEl = document.getElementById('previewDiversion');
      const accEl = document.getElementById('previewAccuracy');
      const co2El = document.getElementById('previewCo2');

      if (totalEl) totalEl.innerText = `${total.toFixed(1)} kg`;
      if (divEl) divEl.innerText = `${divRate}%`;
      if (accEl) accEl.innerText = `${acc}%`;
      if (co2El) co2El.innerText = `${co2e} kg`;
    }

    [wetInput, dryInput, inertInput, contamInput].forEach(inp => {
      if (inp) inp.addEventListener('input', updatePreview);
    });

    auditForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        wetKg: parseFloat(wetInput.value) || 0,
        dryRecyclableKg: parseFloat(dryInput.value) || 0,
        nonRecyclableKg: parseFloat(inertInput.value) || 0,
        contaminationKg: parseFloat(contamInput.value) || 0,
        notes: document.getElementById('inputNotes').value || 'Logged via Web Dashboard'
      };

      try {
        const res = await fetch('/api/audit-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          state.auditLogs.push(result.entry);
          state.analytics = result.analytics;
          renderHeroStats();
          renderAuditTable();
          renderCharts();
          auditForm.reset();
          updatePreview();
          alert(`✅ Day ${result.entry.day} audit successfully recorded! Landfill Diversion Rate updated to ${result.analytics.diversionRatePct}%`);
        }
      } catch (err) {
        console.error(err);
        alert('Error saving audit log.');
      }
    });
  }

  // Charts Generator using Clean SVG
  function renderCharts() {
    renderStreamDonut();
    renderDailyInflowBar();
    renderAccuracyTrendLine();
  }

  function renderStreamDonut() {
    const el = document.getElementById('streamDonutChart');
    if (!el) return;
    const a = state.analytics;
    const total = a.totalCollectedKg || 100;
    const wetPct = Math.round(((a.totalWetKg || 52) / total) * 100);
    const dryPct = Math.round(((a.totalDryKg || 36) / total) * 100);
    const inertPct = Math.max(0, 100 - wetPct - dryPct);

    el.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:center; gap:2rem; flex-wrap:wrap; padding:1rem 0;">
        <svg width="180" height="180" viewBox="0 0 42 42" style="transform: rotate(-90deg);">
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#1e293b" stroke-width="6"></circle>
          <!-- Wet Stream -->
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#10b981" stroke-width="6"
                  stroke-dasharray="${wetPct} ${100 - wetPct}" stroke-dashoffset="0"></circle>
          <!-- Dry Stream -->
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#3b82f6" stroke-width="6"
                  stroke-dasharray="${dryPct} ${100 - dryPct}" stroke-dashoffset="-${wetPct}"></circle>
          <!-- Inert Stream -->
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#64748b" stroke-width="6"
                  stroke-dasharray="${inertPct} ${100 - inertPct}" stroke-dashoffset="-${wetPct + dryPct}"></circle>
          <g style="transform: rotate(90deg); transform-origin: 21px 21px;">
            <text x="21" y="20" font-size="5" font-weight="bold" fill="#ffffff" text-anchor="middle">${Math.round(total)} kg</text>
            <text x="21" y="25" font-size="2.6" fill="#94a3b8" text-anchor="middle">Total Audited</text>
          </g>
        </svg>
        <div style="display:flex; flex-direction:column; gap:0.6rem; font-size:0.85rem;">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <span style="width:12px; height:12px; background:#10b981; border-radius:3px; display:inline-block;"></span>
            <span>Wet Organic: <strong>${a.totalWetKg} kg (${wetPct}%)</strong></span>
          </div>
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <span style="width:12px; height:12px; background:#3b82f6; border-radius:3px; display:inline-block;"></span>
            <span>Dry Recyclable: <strong>${a.totalDryKg} kg (${dryPct}%)</strong></span>
          </div>
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <span style="width:12px; height:12px; background:#64748b; border-radius:3px; display:inline-block;"></span>
            <span>Landfill Inerts: <strong>${a.totalInertKg} kg (${inertPct}%)</strong></span>
          </div>
        </div>
      </div>
    `;
  }

  function renderDailyInflowBar() {
    const el = document.getElementById('dailyInflowBarChart');
    if (!el) return;
    const logs = state.auditLogs.slice(-10); // last 10 entries
    const maxVal = Math.max(...logs.map(l => l.wetKg + l.dryRecyclableKg + l.nonRecyclableKg), 9);

    const bars = logs.map((log, idx) => {
      const total = log.wetKg + log.dryRecyclableKg + log.nonRecyclableKg;
      const heightPct = Math.round((total / maxVal) * 100);
      return `
        <div style="display:flex; flex-direction:column; align-items:center; gap:0.4rem; flex:1;">
          <div style="font-size:0.7rem; color:var(--text-muted);">${total.toFixed(1)}</div>
          <div style="width:28px; height:120px; background:rgba(15,23,42,0.6); border-radius:4px; display:flex; align-items:flex-end; overflow:hidden;">
            <div style="width:100%; height:${heightPct}%; background:linear-gradient(to top, #059669, #3b82f6); border-radius:4px 4px 0 0;" title="${log.date}: ${total.toFixed(1)} kg"></div>
          </div>
          <div style="font-size:0.68rem; color:var(--text-dim); white-space:nowrap;">D${log.day}</div>
        </div>
      `;
    }).join('');

    el.innerHTML = `
      <div style="display:flex; align-items:flex-end; justify-content:space-between; gap:0.5rem; height:160px; padding:0.5rem 0;">
        ${bars}
      </div>
    `;
  }

  function renderAccuracyTrendLine() {
    const el = document.getElementById('accuracyTrendLine');
    if (!el) return;
    const logs = state.auditLogs;
    if (logs.length < 2) return;

    const points = logs.map((log, i) => {
      const total = log.wetKg + log.dryRecyclableKg + log.nonRecyclableKg;
      const acc = total > 0 ? (1 - (log.contaminationKg / total)) * 100 : 100;
      const x = (i / (logs.length - 1)) * 360 + 20;
      const y = 140 - ((acc - 40) / 60) * 120; // scale 40% to 100%
      return { x, y, acc: acc.toFixed(1), day: log.day };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    el.innerHTML = `
      <svg width="100%" height="160" viewBox="0 0 400 160">
        <!-- Grid lines -->
        <line x1="20" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3"></line>
        <line x1="20" y1="80" x2="380" y2="80" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3"></line>
        <line x1="20" y1="140" x2="380" y2="140" stroke="rgba(255,255,255,0.08)"></line>
        
        <text x="5" y="24" fill="#94a3b8" font-size="8">100%</text>
        <text x="5" y="84" fill="#94a3b8" font-size="8">70%</text>
        <text x="5" y="144" fill="#94a3b8" font-size="8">40%</text>

        <!-- Area Glow -->
        <path d="${pathData} L ${points[points.length-1].x} 140 L ${points[0].x} 140 Z" fill="rgba(16, 185, 129, 0.15)"></path>

        <!-- Main Trend Line -->
        <path d="${pathData}" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round"></path>

        <!-- Nodes -->
        ${points.map(p => `
          <circle cx="${p.x}" cy="${p.y}" r="4" fill="#10b981" stroke="#ffffff" stroke-width="1.5">
            <title>Day ${p.day}: ${p.acc}% accuracy</title>
          </circle>
        `).join('')}
      </svg>
      <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-dim); margin-top:0.3rem;">
        <span>Day 1 (Baseline: 54%)</span>
        <span style="color:var(--stream-green); font-weight:700;">Day 14 (Achieved: 92%)</span>
      </div>
    `;
  }

  // Classifier Search & Filter
  function setupClassifierSearch() {
    if (!classifierSearch) return;
    classifierSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        renderClassifier(state.classifierItems);
        return;
      }
      const filtered = state.classifierItems.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.gujarati.includes(q) ||
        item.streamName.toLowerCase().includes(q)
      );
      renderClassifier(filtered);
    });
  }

  function renderClassifier(items) {
    const grid = document.getElementById('classifierGrid');
    if (!grid) return;

    const streamStyles = {
      blue: 'background:rgba(59,130,246,0.25); color:#60a5fa;',
      green: 'background:rgba(16,185,129,0.25); color:#34d399;',
      black: 'background:rgba(100,116,139,0.25); color:#cbd5e1;',
      red: 'background:rgba(239,68,68,0.25); color:#f87171;'
    };

    grid.innerHTML = items.map(item => `
      <div class="classifier-item">
        <div class="item-desc">
          <h4>${item.name}</h4>
          <p>${item.gujarati}</p>
          <div style="font-size:0.7rem; color:var(--text-muted); margin-top:0.25rem;">💡 ${item.tip}</div>
        </div>
        <span class="item-stream-pill" style="${streamStyles[item.stream] || ''}">${item.streamName}</span>
      </div>
    `).join('');
  }

  // Interactive Sorting Quiz Challenge
  function setupSortingQuiz() {
    const promptEl = document.getElementById('quizPrompt');
    const gujEl = document.getElementById('quizGujarati');
    const feedbackEl = document.getElementById('quizFeedback');
    const scoreEl = document.getElementById('quizScoreText');
    const binBtns = document.querySelectorAll('.quiz-bin-btn');

    if (!promptEl || !binBtns.length) return;

    function loadQuestion() {
      if (feedbackEl) feedbackEl.style.display = 'none';
      const item = state.classifierItems[state.quizCurrentIndex % state.classifierItems.length];
      promptEl.innerText = item.name;
      gujEl.innerText = item.gujarati;
    }

    binBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedStream = btn.getAttribute('data-stream');
        const item = state.classifierItems[state.quizCurrentIndex % state.classifierItems.length];

        feedbackEl.style.display = 'block';
        if (selectedStream === item.stream) {
          state.quizScore++;
          feedbackEl.style.background = 'rgba(16, 185, 129, 0.2)';
          feedbackEl.style.color = '#34d399';
          feedbackEl.style.border = '1px solid rgba(16, 185, 129, 0.4)';
          feedbackEl.innerHTML = `🎉 Correct! <strong>${item.name}</strong> belongs to the <strong>${item.streamName}</strong> stream. (${item.tip})`;
        } else {
          feedbackEl.style.background = 'rgba(239, 68, 68, 0.2)';
          feedbackEl.style.color = '#f87171';
          feedbackEl.style.border = '1px solid rgba(239, 68, 68, 0.4)';
          feedbackEl.innerHTML = `❌ Incorrect. <strong>${item.name}</strong> belongs to the <strong>${item.streamName}</strong> stream! (${item.tip})`;
        }

        if (scoreEl) {
          scoreEl.innerText = `Score: ${state.quizScore} pts`;
        }

        setTimeout(() => {
          state.quizCurrentIndex++;
          loadQuestion();
        }, 2200);
      });
    });

    loadQuestion();
  }

  // WBS Rendering & Status Toggle
  function renderWBS() {
    const container = document.getElementById('wbsContainer');
    if (!container) return;

    container.innerHTML = state.wbsPackages.map(pkg => `
      <div class="wbs-card">
        <div style="display:flex; align-items:center; gap:0.8rem;">
          <span class="wbs-code">${pkg.code}</span>
          <div>
            <div style="font-size:0.9rem; font-weight:700; color:#ffffff;">${pkg.name}</div>
            <div style="font-size:0.75rem; color:var(--text-tertiary);">${pkg.deliverable}</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:0.8rem;">
          <span style="font-size:0.75rem; color:var(--text-secondary); font-family:var(--font-mono);">${pkg.duration}</span>
          <button class="quiz-btn" style="padding:0.25rem 0.6rem; font-size:0.72rem; ${pkg.status === 'Completed' ? 'background:rgba(16,185,129,0.2); color:#34d399;' : 'background:rgba(245,158,11,0.2); color:#fbbf24;'}"
                  onclick="toggleWbsStatus('${pkg.code}')">
            ${pkg.status === 'Completed' ? '✓ Done' : '⚡ In Progress'}
          </button>
        </div>
      </div>
    `).join('');
  }

  window.toggleWbsStatus = async function(code) {
    try {
      const res = await fetch(`/api/wbs/${code}/status`, { method: 'PUT' });
      const result = await res.json();
      if (result.success) {
        const idx = state.wbsPackages.findIndex(p => p.code === code);
        if (idx !== -1) {
          state.wbsPackages[idx] = result.package;
          renderWBS();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Gantt Chart Rendering
  function renderGantt() {
    const container = document.getElementById('ganttRows');
    if (!container) return;

    // Timeline Header
    let html = `
      <div class="gantt-timeline-header">
        <div>Task &amp; Lead</div>
        <div class="gantt-header-weeks">
          <span>W1</span><span>W2</span><span>W3</span><span>W4</span>
          <span>W5</span><span>W6</span><span>W7</span><span>W8</span>
        </div>
      </div>
    `;

    // Tasks (56 days scale)
    html += state.ganttTasks.map(t => {
      const leftPct = ((t.startDay - 1) / 56) * 100;
      const widthPct = (t.duration / 56) * 100;

      return `
        <div class="gantt-row">
          <div class="gantt-task-meta" title="${t.name} (${t.duration}d - ${t.lead})">
            <span class="gantt-task-id ${t.critical ? 'critical' : ''}">${t.id}</span>
            <span class="gantt-task-name">${t.name}</span>
          </div>
          <div class="gantt-track">
            <!-- 8 week markers -->
            <div class="gantt-grid-marker" style="left:12.5%"></div>
            <div class="gantt-grid-marker" style="left:25%"></div>
            <div class="gantt-grid-marker" style="left:37.5%"></div>
            <div class="gantt-grid-marker" style="left:50%"></div>
            <div class="gantt-grid-marker" style="left:62.5%"></div>
            <div class="gantt-grid-marker" style="left:75%"></div>
            <div class="gantt-grid-marker" style="left:87.5%"></div>

            <div class="gantt-bar ${t.critical ? 'bar-critical' : 'bar-normal'}"
                 style="left:${leftPct}%; width:${Math.max(widthPct, 3.5)}%;"
                 title="${t.name}: Day ${t.startDay} - Day ${t.endDay} (${t.duration} days)">
              <span>${t.duration}d</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }

  // RACI Matrix Rendering
  function renderRACI() {
    const tbody = document.getElementById('raciTableBody');
    if (!tbody) return;

    function getPill(val) {
      if (val === 'A / R') return `<span class="raci-pill ar">A/R</span>`;
      if (val === 'R') return `<span class="raci-pill r">R</span>`;
      if (val === 'A') return `<span class="raci-pill a">A</span>`;
      if (val === 'C') return `<span class="raci-pill c">C</span>`;
      if (val === 'I') return `<span class="raci-pill i">I</span>`;
      return val;
    }

    tbody.innerHTML = state.raciMatrix.map(row => `
      <tr>
        <td style="font-weight:600; color:#f1f5f9;">${row.deliverable}</td>
        <td>${getPill(row.harshil)}</td>
        <td>${getPill(row.vyom)}</td>
        <td>${getPill(row.mehul)}</td>
        <td>${getPill(row.heer)}</td>
        <td>${getPill(row.saumya)}</td>
      </tr>
    `).join('');
  }

  // Budget & Value Engineering Rendering
  function renderBudget() {
    const tbody = document.getElementById('budgetTableBody');
    if (!tbody || !state.budget) return;

    const b = state.budget;
    tbody.innerHTML = b.items.map(it => `
      <tr>
        <td style="font-family:var(--font-mono);">${it.sr}</td>
        <td style="font-weight:600; color:#f1f5f9;">${it.item}</td>
        <td><span class="wbs-badge" style="${it.rate === 0 ? 'background:rgba(16,185,129,0.15); color:#34d399;' : 'background:rgba(59,130,246,0.15); color:#60a5fa;'}">${it.category}</span></td>
        <td style="font-size:0.75rem; color:var(--text-dim);">${it.source}</td>
        <td style="font-family:var(--font-mono); font-weight:700;">${it.rate === 0 ? '₹0.00 (Free)' : `₹${it.total}.00`}</td>
      </tr>
    `).join('');

    // Summary Card
    const summaryCard = document.getElementById('budgetSummaryCard');
    if (summaryCard) {
      summaryCard.innerHTML = `
        <div class="savings-showcase">
          <div style="font-size:0.85rem; text-transform:uppercase; font-weight:700; color:var(--text-muted); margin-bottom:0.5rem;">Value Engineering Savings</div>
          <div class="savings-percent">91.0%</div>
          <div style="font-size:1.1rem; font-weight:700; color:#ffffff; margin:0.6rem 0;">₹16,828 Net Savings</div>
          <p style="font-size:0.8rem; color:#cbd5e1; line-height:1.4;">
            Delivered a full 3-stream pilot station for <strong>₹1,672 INR</strong> vs commercial fiberglass bin baseline of <strong>₹18,500 INR</strong>.
          </p>
        </div>
        <div style="margin-top:1.2rem; background:rgba(15,23,42,0.6); padding:1rem; border-radius:var(--radius-md); font-size:0.82rem; border:1px solid var(--border-color);">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
            <span>Direct Purchases:</span> <strong>₹${b.summary.subtotalPurchased}.00</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
            <span>10% Contingency Reserve:</span> <strong>₹${b.summary.contingencyReserveAmount}.00</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-weight:700; color:var(--stream-green); border-top:1px solid rgba(255,255,255,0.1); padding-top:0.4rem;">
            <span>Total Authorized Budget:</span> <strong>₹${b.summary.totalProjectBudget}.00</strong>
          </div>
        </div>
      `;
    }
  }

  // Risk Register Rendering
  function renderRisks() {
    const list = document.getElementById('riskCardsList');
    if (!list) return;

    list.innerHTML = state.risks.map(r => {
      const levelColor = r.level === 'High' ? '#ef4444' : r.level === 'Medium' ? '#f59e0b' : '#10b981';
      return `
        <div class="glass-panel" style="padding:1.2rem; margin-bottom:0.8rem; border-left:4px solid ${levelColor};">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.4rem;">
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <span class="task-tag" style="background:${levelColor}22; color:${levelColor}; border:1px solid ${levelColor}44;">${r.id}</span>
              <h4 style="font-size:0.95rem; color:#ffffff;">${r.description}</h4>
            </div>
            <span class="wbs-badge" style="background:${levelColor}22; color:${levelColor};">${r.level} (Score: ${r.severity})</span>
          </div>
          <div style="font-size:0.82rem; color:#cbd5e1; margin-top:0.5rem;">
            <strong>Mitigation:</strong> ${r.mitigation}
          </div>
          <div style="font-size:0.78rem; color:var(--text-dim); margin-top:0.25rem;">
            <strong>Contingency Trigger:</strong> ${r.contingency}
          </div>
        </div>
      `;
    }).join('');
  }

  // Composter Simulator
  function setupComposterSimulator() {
    if (!greenSlider || !brownSlider) return;

    async function triggerSim() {
      const g = parseFloat(greenSlider.value);
      const b = parseFloat(brownSlider.value);
      greenValLabel.innerText = `${g} kg`;
      brownValLabel.innerText = `${b} kg`;

      try {
        const res = await fetch('/api/compost/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ greenWeightKg: g, brownWeightKg: b })
        });
        const out = await res.json();
        renderSimOutput(out);
      } catch (err) {
        console.error(err);
      }
    }

    greenSlider.addEventListener('input', triggerSim);
    brownSlider.addEventListener('input', triggerSim);

    triggerSim();
  }

  function renderSimOutput(out) {
    const container = document.getElementById('simResultBox');
    if (!container) return;

    container.innerHTML = `
      <div class="sim-output-card">
        <div>
          <div class="sim-kpi-badge">Projected Carbon:Nitrogen Ratio</div>
          <div class="sim-ratio-big">${out.estimatedCNRatio}</div>
          <div class="sim-status-wrap">
            <span class="wbs-badge ${out.badgeColor === 'green' ? 'completed' : 'in-progress'}">${out.status}</span>
          </div>
        </div>
        <div>
          <div class="sim-stat-row">
            <span>Estimated Moisture:</span>
            <strong>${out.estimatedMoisturePercentage}%</strong>
          </div>
          <div class="sim-stat-row">
            <span>Greenhouse Gas Prevented:</span>
            <strong style="color:var(--accent-emerald);">${out.projectedCO2eAvoidedKg} kg CO₂e</strong>
          </div>
        </div>
        <div class="sim-advice-box">
          💡 <strong>Engineering Advice:</strong> ${out.recommendation}
        </div>
      </div>
    `;
  }

  function renderCompostInfo() {
    const el = document.getElementById('compostStaticSpecs');
    if (!el || !state.composter) return;
    const c = state.composter;
    el.innerHTML = `
      <div class="card" style="padding:1.6rem; font-size:0.85rem;">
        <h4 style="font-size:1.05rem; margin-bottom:0.8rem; color:#ffffff;">🌿 LDCE IT Courtyard Composter Pilot Parameters</h4>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem;">
          <div><strong>Core Temperature:</strong> <span style="color:var(--accent-amber); font-weight:700;">${c.currentTemperatureC}°C (Mesophilic)</span></div>
          <div><strong>Current Moisture:</strong> <span style="color:var(--accent-blue); font-weight:700;">${c.moisturePercentage}%</span></div>
          <div><strong>Aeration Cycle:</strong> ${c.aerationFrequency}</div>
          <div><strong>Total Organic Humus:</strong> <span style="color:var(--accent-emerald); font-weight:700;">${c.totalHumusProducedKg} kg</span></div>
        </div>
        <div style="margin-top:1rem; font-size:0.82rem; color:var(--text-tertiary); border-top:1px solid var(--border-subtle); padding-top:0.8rem;">
          <strong>Starter Inoculum:</strong> Diluted sour buttermilk (chaas) &amp; local fertile topsoil for rapid bacterial colonization without foul odors.
        </div>
      </div>
    `;
  }

  function setupCustomSelect() {
    const wrapper = document.getElementById('binSelectWrapper');
    const trigger = document.getElementById('binSelectTrigger');
    const hiddenInput = document.getElementById('alertBin');
    const label = document.getElementById('selectedStreamLabel');
    const dot = document.getElementById('selectedStreamDot');
    const items = document.querySelectorAll('.custom-select-item');

    if (!wrapper || !trigger) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      wrapper.classList.toggle('open');
    });

    items.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const val = item.getAttribute('data-val');
        const color = item.getAttribute('data-color');
        const name = item.getAttribute('data-name');

        if (hiddenInput) hiddenInput.value = val;
        if (label) label.innerText = name;
        if (dot) {
          dot.className = `stream-dot ${color}`;
        }

        wrapper.classList.remove('open');
      });
    });

    document.addEventListener('click', () => {
      wrapper.classList.remove('open');
    });
  }

  // Admin Authentication Helpers
  function getAdminAuth() {
    try {
      const stored = sessionStorage.getItem('ecoldce_admin_auth');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  function setAdminAuth(authData) {
    if (authData) {
      sessionStorage.setItem('ecoldce_admin_auth', JSON.stringify(authData));
    } else {
      sessionStorage.removeItem('ecoldce_admin_auth');
    }
  }

  function setupAdminLogin() {
    const loginForm = document.getElementById('adminLoginForm');
    const usernameInput = document.getElementById('adminUsername');
    const passwordInput = document.getElementById('adminPassword');
    const errorBanner = document.getElementById('adminAuthError');
    const errorMsg = document.getElementById('adminAuthErrorMsg');
    const togglePwBtn = document.getElementById('toggleAdminPasswordBtn');
    const demoQuickBtn = document.getElementById('btnQuickDemoLogin');
    const logoutBtn = document.getElementById('adminLogoutBtn');

    // Toggle password visibility
    if (togglePwBtn && passwordInput) {
      togglePwBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        togglePwBtn.innerText = isPassword ? '🙈' : '👁️';
      });
    }

    // Auto-fill demo credentials
    if (demoQuickBtn && usernameInput && passwordInput) {
      demoQuickBtn.addEventListener('click', (e) => {
        e.preventDefault();
        usernameInput.value = 'admin';
        passwordInput.value = 'admin123';
        if (errorBanner) errorBanner.style.display = 'none';
        if (loginForm) {
          loginForm.dispatchEvent(new Event('submit', { cancelable: true }));
        }
      });
    }

    // Submit handler
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = usernameInput ? usernameInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!username || !password) {
          showAuthError('Please enter both username and password.');
          return;
        }

        const submitBtn = document.getElementById('adminSubmitBtn');
        const origBtnText = submitBtn ? submitBtn.innerText : 'Sign In';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerText = 'Verifying credentials...';
        }

        try {
          const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          const data = await res.json();

          if (res.ok && data.success) {
            setAdminAuth(data);
            if (errorBanner) errorBanner.style.display = 'none';
            if (passwordInput) passwordInput.value = '';
            renderAdminAlerts();
          } else {
            showAuthError(data.error || 'Invalid credentials. Access denied.');
          }
        } catch (err) {
          console.error('Login error:', err);
          showAuthError('Connection error to auth server. Please retry.');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = origBtnText;
          }
        }
      });
    }

    function showAuthError(msg) {
      if (errorBanner && errorMsg) {
        errorMsg.innerText = msg;
        errorBanner.style.display = 'flex';
        errorBanner.classList.remove('auth-error-banner');
        void errorBanner.offsetWidth; // Trigger reflow to restart CSS shake animation
        errorBanner.classList.add('auth-error-banner');
      }
    }

    // Logout handler
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        setAdminAuth(null);
        renderAdminAlerts();
      });
    }
  }

  function setupAdminConsole() {
    // Filter tabs
    const filterBtns = document.querySelectorAll('.admin-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.adminFilter = btn.getAttribute('data-filter') || 'all';
        renderAdminAlerts();
      });
    });

    // Search input
    const searchInput = document.getElementById('adminSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.adminSearchQuery = e.target.value.toLowerCase().trim();
        renderAdminAlerts();
      });
    }

    // New incident button in admin console
    const newIncBtn = document.getElementById('adminNewIncidentBtn');
    if (newIncBtn && alertModal) {
      newIncBtn.addEventListener('click', () => alertModal.classList.add('active'));
    }
  }

  function renderAdminAlerts() {
    const loginGate = document.getElementById('adminLoginGate');
    const consoleArea = document.getElementById('adminConsoleArea');
    const auth = getAdminAuth();

    // Check if user is authenticated
    if (!auth || !auth.token) {
      if (loginGate) loginGate.style.display = 'flex';
      if (consoleArea) consoleArea.style.display = 'none';
      return;
    }

    // User is authenticated -> show console area, hide login gate
    if (loginGate) loginGate.style.display = 'none';
    if (consoleArea) consoleArea.style.display = 'block';

    const loggedNameEl = document.getElementById('adminLoggedName');
    const loggedRoleEl = document.getElementById('adminLoggedRole');
    const loggedDeptEl = document.getElementById('adminLoggedDept');

    if (auth.user) {
      if (loggedNameEl) loggedNameEl.innerText = auth.user.name || 'Estate Supervisor';
      if (loggedRoleEl) loggedRoleEl.innerText = auth.user.role || 'Admin';
      if (loggedDeptEl) loggedDeptEl.innerText = auth.user.department || 'Information Technology, LDCE';
    }

    const list = document.getElementById('adminAlertsList');
    const totalEl = document.getElementById('metricTotalAlerts');
    const pendingEl = document.getElementById('metricPendingAlerts');
    const dispatchedEl = document.getElementById('metricDispatchedAlerts');
    const resolvedEl = document.getElementById('metricResolvedAlerts');
    const badgeEl = document.getElementById('adminBadgeCount');

    const alerts = state.alerts || [];

    // Calculate metrics
    const totalCount = alerts.length;
    const pendingCount = alerts.filter(a => (a.status || '').toLowerCase().includes('pending')).length;
    const dispatchedCount = alerts.filter(a => (a.status || '').toLowerCase().includes('dispatched')).length;
    const resolvedCount = alerts.filter(a => (a.status || '').toLowerCase().includes('resolved') || (a.status || '').toLowerCase().includes('completed')).length;

    if (totalEl) totalEl.innerText = totalCount;
    if (pendingEl) pendingEl.innerText = pendingCount;
    if (dispatchedEl) dispatchedEl.innerText = dispatchedCount;
    if (resolvedEl) resolvedEl.innerText = resolvedCount;

    if (badgeEl) {
      if (pendingCount > 0) {
        badgeEl.style.display = 'inline-block';
        badgeEl.innerText = pendingCount;
      } else {
        badgeEl.style.display = 'none';
      }
    }

    if (!list) return;

    // Filter alerts
    let filtered = alerts;
    if (state.adminFilter === 'pending') {
      filtered = filtered.filter(a => (a.status || '').toLowerCase().includes('pending'));
    } else if (state.adminFilter === 'dispatched') {
      filtered = filtered.filter(a => (a.status || '').toLowerCase().includes('dispatched'));
    } else if (state.adminFilter === 'resolved') {
      filtered = filtered.filter(a => (a.status || '').toLowerCase().includes('resolved') || (a.status || '').toLowerCase().includes('completed'));
    }

    if (state.adminSearchQuery) {
      filtered = filtered.filter(a =>
        (a.location || '').toLowerCase().includes(state.adminSearchQuery) ||
        (a.reportedBy || '').toLowerCase().includes(state.adminSearchQuery) ||
        (a.bin || '').toLowerCase().includes(state.adminSearchQuery) ||
        (a.note || '').toLowerCase().includes(state.adminSearchQuery)
      );
    }

    if (filtered.length === 0) {
      list.innerHTML = `
        <div class="card" style="text-align:center; padding:3rem 1.5rem; color:var(--text-tertiary);">
          <div style="font-size:2.2rem; margin-bottom:0.6rem;">✨</div>
          <h4 style="font-size:1.1rem; color:#ffffff; margin-bottom:0.4rem;">No Incident Reports Found</h4>
          <p style="font-size:0.85rem;">All campus corridor stations and composter bins are operating at standard capacity.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = filtered.map(a => {
      const isPending = (a.status || '').toLowerCase().includes('pending');
      const isDispatched = (a.status || '').toLowerCase().includes('dispatched');
      const isResolved = (a.status || '').toLowerCase().includes('resolved') || (a.status || '').toLowerCase().includes('completed');

      const statusClass = isPending ? 'pending' : isDispatched ? 'dispatched' : 'resolved';
      const statusPill = isPending
        ? `<span class="wbs-badge in-progress" style="background:rgba(245,158,11,0.2); color:#fbbf24;">⏳ Pending Action</span>`
        : isDispatched
        ? `<span class="wbs-badge in-progress" style="background:rgba(59,130,246,0.2); color:#60a5fa;">⚡ Dispatched</span>`
        : `<span class="wbs-badge completed" style="background:rgba(16,185,129,0.2); color:#34d399;">✓ Resolved</span>`;

      // Bin indicator color
      const binColor = (a.bin || '').includes('Blue') ? 'blue' : (a.bin || '').includes('Green') ? 'green' : (a.bin || '').includes('Composter') ? 'amber' : 'black';

      return `
        <div class="incident-card ${statusClass}">
          <div class="incident-header">
            <div class="incident-meta">
              <span class="incident-id">#INC-00${a.id}</span>
              <span class="stream-dot ${binColor}"></span>
              <strong style="font-size:0.92rem; color:#ffffff;">${a.bin}</strong>
              ${statusPill}
            </div>
            <div style="font-size:0.75rem; color:var(--text-tertiary); font-family:var(--font-mono);">
              ${a.timestamp}
            </div>
          </div>

          <div class="incident-body">
            "${a.note}"
          </div>

          <div class="incident-footer">
            <div class="incident-details">
              <span>📍 <strong>${a.location}</strong></span>
              <span>👤 Reported by: <strong>${a.reportedBy}</strong></span>
              ${a.resolvedAt ? `<span style="color:var(--accent-emerald);">✓ Handled at: ${a.resolvedAt}</span>` : ''}
            </div>

            <div class="incident-actions">
              ${isPending ? `
                <button class="btn-action-sm btn-action-dispatch" onclick="updateAlertStatus(${a.id}, 'Housekeeping Dispatched')">
                  ⚡ Dispatch
                </button>
                <button class="btn-action-sm btn-action-resolve" onclick="updateAlertStatus(${a.id}, 'Resolved')">
                  ✓ Resolve
                </button>
              ` : isDispatched ? `
                <button class="btn-action-sm btn-action-resolve" onclick="updateAlertStatus(${a.id}, 'Resolved')">
                  ✓ Mark Cleared
                </button>
              ` : `
                <button class="btn-action-sm" style="background:rgba(255,255,255,0.06); color:var(--text-secondary);" onclick="updateAlertStatus(${a.id}, 'Pending Verification')">
                  ↺ Re-open
                </button>
              `}
              <button class="btn-action-sm btn-action-delete" title="Dismiss incident" onclick="deleteAlert(${a.id})">
                🗑️ Dismiss
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  window.updateAlertStatus = async function(id, newStatus) {
    try {
      const res = await fetch(`/api/alerts/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        const idx = state.alerts.findIndex(a => a.id === id);
        if (idx !== -1) {
          state.alerts[idx] = data.alert;
          renderAdminAlerts();
        }
      }
    } catch (err) {
      console.error('Failed to update alert:', err);
    }
  };

  window.deleteAlert = async function(id) {
    if (!confirm('Are you sure you want to dismiss this incident report?')) return;
    try {
      const res = await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        state.alerts = state.alerts.filter(a => a.id !== id);
        renderAdminAlerts();
      }
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  };

});
