(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer: fine)');
  let effects = true;
  try { effects = localStorage.getItem('azurewolfCursor') !== 'off'; } catch {}
  const toggle = $('cursorToggle'), glow = $('cursorGlow');
  const syncEffects = () => { toggle.setAttribute('aria-pressed', String(effects)); toggle.textContent = `✦ Hiệu ứng chuột: ${effects ? 'Bật' : 'Tắt'}`; if (!effects || reduced.matches) glow.style.opacity = '0'; };
  syncEffects();
  toggle.addEventListener('click', () => { effects = !effects; syncEffects(); try { localStorage.setItem('azurewolfCursor', effects ? 'on' : 'off'); } catch {} });
  let lastSpark = 0;
  document.addEventListener('pointermove', e => {
    if (!effects || reduced.matches || !fine.matches || e.pointerType === 'touch') return;
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; glow.style.opacity = '1';
    if (performance.now() - lastSpark < 55) return;
    lastSpark = performance.now();
    const spark = document.createElement('span'); spark.className = 'cursor-spark'; spark.setAttribute('aria-hidden','true'); spark.style.left = `${e.clientX}px`; spark.style.top = `${e.clientY}px`; document.body.append(spark); setTimeout(() => spark.remove(), 700);
  }, {passive:true});
  document.addEventListener('pointerleave', () => glow.style.opacity = '0');
  reduced.addEventListener('change', syncEffects);


  const panel = $('skins'), stage = $('skinStage');
  let viewer, starting = false, rotating = !reduced.matches;
  const auto = $('skinAuto');
  function sync() {
    auto.textContent = rotating ? 'Tạm dừng xoay' : 'Tự xoay';
    auto.setAttribute('aria-pressed', String(rotating));
    if (viewer) viewer.autoRotate = rotating;
  }
  function resize() {
    if (viewer && stage.clientWidth) viewer.setSize(stage.clientWidth, stage.clientHeight);
  }
  async function start() {
    if (starting) return;
    starting = true;
    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'vendor/skinview3d-3.4.1.bundle.js';
        script.onload = resolve; script.onerror = reject; document.head.append(script);
      });
      viewer = new skinview3d.SkinViewer({canvas:$('skinCanvas'),width:stage.clientWidth || 500,height:stage.clientHeight || 500,zoom:.9});
      viewer.controls.enablePan = false;
      viewer.controls.minDistance = 20; viewer.controls.maxDistance = 100;
      viewer.autoRotateSpeed = .35;
      await viewer.loadSkin(window.PROFILE_CONFIG?.minecraftSkinUrl || 'assets/skin.png', {model:'auto-detect'});
      $('skinEmpty').hidden = true;
      const cape = window.PROFILE_CONFIG?.minecraftCapeUrl;
      if (cape) { try { await viewer.loadCape(cape); } catch { console.warn('Không tải được cape đã cấu hình.'); } }
      viewer.controls.addEventListener('start', () => { rotating = false; sync(); });
      sync(); visibility();
    } catch {
      $('skinStatus').textContent = 'Không tải được mô hình 3D. Hãy tải lại trang hoặc bật tăng tốc đồ họa trong trình duyệt.';
      $('skinEmpty').hidden = false;
    }
  }
  function visibility() {
    const visible = panel.classList.contains('active') && !document.hidden;
    if (visible && !starting) start();
    if (viewer) { resize(); viewer.renderPaused = !visible; }
  }
  auto.addEventListener('click', () => { rotating = !rotating; sync(); });
  $('skinReset').addEventListener('click', () => {
    if (!viewer) return;
    viewer.controls.reset(); viewer.playerObject.rotation.set(0,0,0); viewer.zoom=.9;
  });
  $('skinCanvas').addEventListener('keydown', e => {
    if (!viewer || !['ArrowLeft','ArrowRight'].includes(e.key)) return;
    e.preventDefault(); rotating=false; sync(); viewer.playerObject.rotation.y += e.key === 'ArrowLeft' ? -.25 : .25;
  });
  new ResizeObserver(resize).observe(stage);
  new MutationObserver(visibility).observe(panel,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',visibility);
  reduced.addEventListener('change', () => { if(reduced.matches) {rotating=false; sync();} });
  sync(); visibility();
})();
