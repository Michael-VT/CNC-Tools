/**
 * Main Application Controller
 *
 * Wires up ExcellonParser, DrillOptimizer, Visualization, and GCodeGenerator.
 * Manages UI state, file loading, and user interactions.
 * Uses I18n module for multilingual support.
 */

const App = (() => {
  let drillData = null;
  let optimizationResult = null;
  let animator = null;
  let originalSegments = null;

  function init() {
    I18n.init();
    setupFileUpload();
    setupManualInput();
    setupControls();
    setupTabs();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  // ---- File Upload ----

  function setupFileUpload() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      if (e.dataTransfer.files.length > 0) loadFile(e.dataTransfer.files[0]);
    });
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) loadFile(fileInput.files[0]);
    });
  }

  function loadFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        drillData = ExcellonParser.parse(e.target.result);
        drillData.source = file.name;
        showFileInfo();
        showStatus(I18n.t('msgLoaded', { name: file.name, holes: drillData.holes.length, tools: drillData.tools.length }));
      } catch (err) {
        showStatus(I18n.t('msgParseError', { err: err.message }), true);
      }
    };
    reader.readAsText(file);
  }

  function showFileInfo() {
    if (!drillData) return;
    const info = document.getElementById('file-info');
    if (!info) return;

    info.innerHTML = `
      <div class="info-row"><strong>${I18n.t('lblFile')}</strong> ${drillData.source || 'manual'}</div>
      <div class="info-row"><strong>${I18n.t('lblUnits')}</strong> ${drillData.units}</div>
      <div class="info-row"><strong>${I18n.t('lblFormat')}</strong> ${drillData.formatTuple ? drillData.formatTuple.join('.') : 'auto'}</div>
      <div class="info-row"><strong>${I18n.t('lblZeroSup')}</strong> ${drillData.zeroSuppression}</div>
      <div class="info-row"><strong>${I18n.t('lblToolsCount')}</strong> ${drillData.tools.length}</div>
      <div class="info-row"><strong>${I18n.t('lblHolesCount')}</strong> ${drillData.holes.length}</div>
      ${drillData.warnings.length > 0 ? `<div class="warnings">${drillData.warnings.map(w => `<div class="warning">${w}</div>`).join('')}</div>` : ''}
    `;
    info.style.display = 'block';
  }

  // ---- Manual Input ----

  function setupManualInput() {
    const addToolBtn = document.getElementById('add-tool-btn');
    const addHoleBtn = document.getElementById('add-hole-btn');
    const loadManualBtn = document.getElementById('load-manual-btn');
    if (addToolBtn) addToolBtn.addEventListener('click', addManualTool);
    if (addHoleBtn) addHoleBtn.addEventListener('click', addManualHole);
    if (loadManualBtn) loadManualBtn.addEventListener('click', loadManualData);
  }

  function addManualTool() {
    const tbody = document.getElementById('manual-tools-body');
    if (!tbody) return;
    const row = tbody.insertRow();
    row.innerHTML = `
      <td><input type="number" class="tool-num" value="${tbody.rows.length + 1}" min="1" style="width:50px"></td>
      <td><input type="number" class="tool-dia" value="0.8" step="0.1" min="0.1" style="width:80px"></td>
      <td><button onclick="this.closest('tr').remove()" style="width:30px">x</button></td>
    `;
  }

  function addManualHole() {
    const tbody = document.getElementById('manual-holes-body');
    if (!tbody) return;
    const row = tbody.insertRow();
    row.innerHTML = `
      <td><input type="number" class="hole-x" value="0" step="0.1" style="width:70px"></td>
      <td><input type="number" class="hole-y" value="0" step="0.1" style="width:70px"></td>
      <td><input type="number" class="hole-tool" value="1" min="1" style="width:50px"></td>
      <td><button onclick="this.closest('tr').remove()" style="width:30px">x</button></td>
    `;
  }

  function loadManualData() {
    const tools = [];
    const holes = [];

    const toolRows = document.querySelectorAll('#manual-tools-body tr');
    for (const row of toolRows) {
      const num = parseInt(row.querySelector('.tool-num').value);
      const dia = parseFloat(row.querySelector('.tool-dia').value);
      if (num && dia > 0) tools.push({ number: num, diameter: dia, unit: 'metric' });
    }

    const holeRows = document.querySelectorAll('#manual-holes-body tr');
    for (const row of holeRows) {
      const x = parseFloat(row.querySelector('.hole-x').value);
      const y = parseFloat(row.querySelector('.hole-y').value);
      const t = parseInt(row.querySelector('.hole-tool').value);
      if (!isNaN(x) && !isNaN(y) && t) holes.push({ x, y, tool: t });
    }

    if (tools.length === 0 || holes.length === 0) {
      showStatus(I18n.t('msgAddData'), true);
      return;
    }

    drillData = {
      tools, holes, units: 'metric', formatTuple: [3, 3],
      zeroSuppression: 'leading', source: 'manual', warnings: []
    };
    for (const tool of drillData.tools) {
      tool.hitCount = drillData.holes.filter(h => h.tool === tool.number).length;
    }

    showFileInfo();
    showStatus(I18n.t('msgManualLoaded', { holes: holes.length, tools: tools.length }));
  }

  // ---- Controls ----

  function setupControls() {
    const optimizeBtn = document.getElementById('optimize-btn');
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-gcode-btn');
    const downloadBtn = document.getElementById('download-gcode-btn');

    if (optimizeBtn) optimizeBtn.addEventListener('click', runOptimization);
    if (generateBtn) generateBtn.addEventListener('click', generateGCode);
    if (copyBtn) copyBtn.addEventListener('click', copyGCode);
    if (downloadBtn) downloadBtn.addEventListener('click', downloadGCode);

    const playBtn = document.getElementById('anim-play-btn');
    const pauseBtn = document.getElementById('anim-pause-btn');
    const stepBtn = document.getElementById('anim-step-btn');
    const resetBtn = document.getElementById('anim-reset-btn');
    const speedSlider = document.getElementById('anim-speed');

    if (playBtn) playBtn.addEventListener('click', () => animator && animator.play());
    if (pauseBtn) pauseBtn.addEventListener('click', () => animator && animator.pause());
    if (stepBtn) stepBtn.addEventListener('click', () => animator && animator.stepForward());
    if (resetBtn) resetBtn.addEventListener('click', () => animator && animator.reset());
    if (speedSlider) speedSlider.addEventListener('input', () => {
      if (animator) animator.setSpeed(parseInt(speedSlider.value));
    });
  }

  function runOptimization() {
    if (!drillData || drillData.holes.length === 0) {
      showStatus(I18n.t('msgNoData'), true);
      return;
    }

    const maxIter = parseInt(document.getElementById('max-iterations')?.value || '200');
    const timeLimit = parseInt(document.getElementById('time-limit')?.value || '5000');

    showStatus(I18n.t('msgOptimizing'));

    setTimeout(() => {
      try {
        optimizationResult = DrillOptimizer.optimize(drillData, {
          maxIterations: maxIter,
          timeLimitMs: timeLimit
        });

        originalSegments = buildOriginalSegments(drillData.holes);
        showStatistics();
        showOptimizedPath();
        showStatus(I18n.t('msgOptimized', {
          dist: optimizationResult.totalDistance.toFixed(1),
          pct: optimizationResult.improvement.toFixed(1)
        }));
      } catch (err) {
        showStatus(I18n.t('msgParseError', { err: err.message }), true);
        console.error(err);
      }
    }, 50);
  }

  function buildOriginalSegments(holes) {
    const segments = [];
    let current = { x: 0, y: 0 };
    for (const hole of holes) {
      segments.push({ from: { ...current }, to: { x: hole.x, y: hole.y }, type: 'rapid', tool: hole.tool });
      segments.push({ from: { x: hole.x, y: hole.y }, to: { x: hole.x, y: hole.y }, type: 'drill', tool: hole.tool });
      current = { x: hole.x, y: hole.y };
    }
    return segments;
  }

  function generateGCode() {
    if (!optimizationResult) {
      showStatus(I18n.t('msgNoResult'), true);
      return;
    }

    const options = {
      feedRate: parseFloat(document.getElementById('feed-rate')?.value || '400'),
      plungeRate: parseFloat(document.getElementById('plunge-rate')?.value || '100'),
      drillDepth: parseFloat(document.getElementById('drill-depth')?.value || '-2.0'),
      safeHeight: parseFloat(document.getElementById('safe-height')?.value || '20'),
      spindleSpeed: parseInt(document.getElementById('spindle-speed')?.value || '10000'),
      useDwell: document.getElementById('use-dwell')?.checked || false
    };

    const gcode = GCodeGenerator.generate(optimizationResult, drillData.tools, options);

    const textarea = document.getElementById('gcode-output');
    if (textarea) {
      textarea.value = gcode;
      textarea.style.display = 'block';
    }

    const issues = GCodeGenerator.validate(gcode);
    const validationDiv = document.getElementById('gcode-validation');
    if (validationDiv) {
      if (issues.length === 0) {
        validationDiv.innerHTML = `<span style="color:green">${I18n.t('validatedOk')}</span>`;
      } else {
        validationDiv.innerHTML = issues.map(i => `<div style="color:orange">${i}</div>`).join('');
      }
    }

    showStatus(I18n.t('msgGcodeGenerated', { lines: gcode.split('\n').length }));
  }

  function copyGCode() {
    const textarea = document.getElementById('gcode-output');
    if (!textarea || !textarea.value) return;
    navigator.clipboard.writeText(textarea.value).then(() => {
      showStatus(I18n.t('msgGcodeCopied'));
    }).catch(() => {
      textarea.select();
      document.execCommand('copy');
      showStatus(I18n.t('msgGcodeCopied'));
    });
  }

  function downloadGCode() {
    const textarea = document.getElementById('gcode-output');
    if (!textarea || !textarea.value) return;
    const blob = new Blob([textarea.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (drillData?.source?.replace(/\.[^.]+$/, '') || 'drill') + '.nc';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---- Visualization ----

  function showOptimizedPath() {
    if (!optimizationResult) return;
    const canvas = document.getElementById('main-canvas');
    if (!canvas) return;
    resizeCanvas();
    DrillVisualization.drawPath(canvas, optimizationResult.orderedHoles, optimizationResult.pathSegments, drillData.tools, { showOrder: optimizationResult.orderedHoles.length <= 100 });
  }

  function showOriginalPath() {
    if (!drillData) return;
    const canvas = document.getElementById('main-canvas');
    if (!canvas) return;
    resizeCanvas();
    DrillVisualization.drawPath(canvas, drillData.holes, originalSegments, drillData.tools, { showOrder: drillData.holes.length <= 100 });
  }

  function showComparison() {
    if (!drillData || !optimizationResult) return;
    const canvas = document.getElementById('main-canvas');
    if (!canvas) return;
    resizeCanvas();
    DrillVisualization.drawComparison(canvas, drillData.holes, optimizationResult.orderedHoles, originalSegments, optimizationResult.pathSegments, drillData.tools);
  }

  function showAnimation() {
    if (!optimizationResult) return;
    const canvas = document.getElementById('main-canvas');
    if (!canvas) return;
    resizeCanvas();
    animator = DrillVisualization.createAnimator(canvas, optimizationResult.orderedHoles, optimizationResult.pathSegments, drillData.tools);
    updateAnimControls();
  }

  function updateAnimControls() {
    const controls = document.getElementById('anim-controls');
    if (controls && animator) controls.style.display = 'flex';
  }

  // ---- Tabs ----

  function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        if (target === 'original') showOriginalPath();
        else if (target === 'optimized') showOptimizedPath();
        else if (target === 'comparison') showComparison();
        else if (target === 'animation') showAnimation();
      });
    });
  }

  // ---- Statistics ----

  function showStatistics() {
    const statsDiv = document.getElementById('stats-panel');
    if (!statsDiv || !optimizationResult) return;
    const r = optimizationResult;
    const hu = I18n.t('statHolesUnit');
    statsDiv.innerHTML = `
      <div class="stat-row"><span>${I18n.t('statTotalHoles')}</span><strong>${r.orderedHoles.length}</strong></div>
      <div class="stat-row"><span>${I18n.t('statOrigDist')}</span><strong>${r.originalDistance.toFixed(1)} mm</strong></div>
      <div class="stat-row"><span>${I18n.t('statOptDist')}</span><strong style="color:#2e7d32">${r.totalDistance.toFixed(1)} mm</strong></div>
      <div class="stat-row"><span>${I18n.t('statImprovement')}</span><strong style="color:#2e7d32">${r.improvement.toFixed(1)}%</strong></div>
      <div class="stat-row"><span>${I18n.t('statToolChanges')}</span><strong>${r.toolChanges}</strong></div>
      ${r.toolStats.map(ts => `
        <div class="stat-row tool-stat">
          <span>T${String(ts.toolNumber).padStart(2, '0')} Ø${ts.diameter.toFixed(2)}mm:</span>
          <span>${ts.hitCount} ${hu}, ${ts.subPathDistance.toFixed(1)}mm</span>
        </div>
      `).join('')}
    `;
    statsDiv.style.display = 'block';
  }

  // ---- Utilities ----

  function resizeCanvas() {
    const canvas = document.getElementById('main-canvas');
    if (!canvas) return;
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
  }

  function showStatus(msg, isError) {
    const status = document.getElementById('status-bar');
    if (status) {
      status.textContent = msg;
      status.style.color = isError ? '#c62828' : '#333';
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init, loadFile, runOptimization, generateGCode };
})();
