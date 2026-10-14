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

  const panel = $('skins'), stage = $('skinStage'), status = $('skinStatus');
  let viewer, libraryPromise, currentImage, currentURL, currentName = 'skin.png', loadSequence = 0;
  const message = (text, error = false) => { status.textContent = text; status.classList.toggle('error', error); };
  function library() {
    if (!libraryPromise) libraryPromise = new Promise((resolve,reject) => {
      const script = document.createElement('script'); script.src = 'vendor/skinview3d-3.4.1.bundle.js'; script.onload = resolve; script.onerror = () => {libraryPromise = null; script.remove(); reject(Error('Không tải được bộ xem 3D. Hãy tải lại trang.'));}; document.head.append(script);
    });
    return libraryPromise;
  }
  function resize() { if (viewer && stage.clientWidth) viewer.setSize(stage.clientWidth, stage.clientHeight); }
  function visibility() { if (viewer) { resize(); viewer.renderPaused = document.hidden || !panel.classList.contains('active'); } }
  async function ensureViewer() {
    await library();
    if (!viewer) {
      try { viewer = new skinview3d.SkinViewer({canvas:$('skinCanvas'),width:stage.clientWidth || 500,height:stage.clientHeight || 520,zoom:.9}); }
      catch { throw Error('Thiết bị chưa bật WebGL. Hãy bật tăng tốc đồ họa hoặc thử trình duyệt khác.'); }
      viewer.controls.enablePan = false; viewer.controls.enableZoom = true; viewer.autoRotateSpeed = .5;
      viewer.controls.minDistance = 20; viewer.controls.maxDistance = 100;
      viewer.controls.addEventListener('start', () => { viewer.autoRotate = false; $('skinAuto').checked = false; });
      visibility();
    }
    return viewer;
  }
  async function load(source, name) {
    const seq = ++loadSequence;
    message('Đang đọc skin…');
    try {
      const img = new Image(); img.src = source; await img.decode();
      if (img.naturalWidth !== 64 || ![32,64].includes(img.naturalHeight)) throw Error('Skin cần là PNG 64×64 hoặc 64×32 pixel.');
      const v = await ensureViewer(); if (seq !== loadSequence) return;
      await v.loadSkin(img, {model:$('skinModel').value === 'auto' ? 'auto-detect' : $('skinModel').value});
      currentImage = img; currentURL = source; currentName = name;
      $('skinEmpty').hidden = true; $('skinControls').disabled = false;
      message(`${name} · ${img.naturalWidth}×${img.naturalHeight} · Sẵn sàng xoay 360°`);
    } catch (e) { if (seq === loadSequence) message(e.message || 'Không đọc được ảnh skin.', true); }
  }
  $('skinFile').addEventListener('change', async e => {
    const file = e.target.files[0]; if (!file) return;
    // Invalidate an earlier read/load before validating this selection.
    const seq = ++loadSequence;
    if (file.size > 2 * 1024 * 1024) { message('File quá lớn. Vui lòng chọn PNG tối đa 2 MB.', true); e.target.value=''; return; }
    try {
      const bytes = new Uint8Array(await file.slice(0,8).arrayBuffer());
      if (seq !== loadSequence) return;
      if (![137,80,78,71,13,10,26,10].every((n,i) => bytes[i] === n)) throw Error('Vui lòng chọn file PNG hợp lệ.');
      const url = await new Promise((resolve,reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(Error('Không đọc được file.')); reader.readAsDataURL(file); });
      if (seq === loadSequence) await load(url, file.name);
    } catch(e) { if(seq === loadSequence) message(e.message, true); }
    e.target.value='';
  });
  $('skinModel').value = ['auto','default','slim'].includes(window.PROFILE_CONFIG?.minecraftSkinModel) ? window.PROFILE_CONFIG.minecraftSkinModel : 'auto';
  $('skinModel').addEventListener('change', async () => { if(currentImage) { try { await viewer.loadSkin(currentImage, {model:$('skinModel').value === 'auto' ? 'auto-detect' : $('skinModel').value}); } catch { message('Không đổi được kiểu tay.', true); } } });
  $('skinAuto').addEventListener('change', e => { if(viewer) viewer.autoRotate = e.target.checked; });
  $('skinMotion').addEventListener('change', e => { if(viewer) viewer.animation = e.target.value === 'walk' ? new skinview3d.WalkingAnimation() : e.target.value === 'run' ? new skinview3d.RunningAnimation() : null; });
  $('skinZoom').addEventListener('input', e => { if(viewer) viewer.zoom = Number(e.target.value); });
  function rotate(angle) { if(viewer) { viewer.autoRotate = false; $('skinAuto').checked = false; viewer.playerObject.rotation.y += angle; } }
  $('skinLeft').addEventListener('click', () => rotate(-Math.PI/4)); $('skinRight').addEventListener('click', () => rotate(Math.PI/4));
  $('skinReset').addEventListener('click', () => { if(!viewer)return; viewer.controls.reset(); viewer.playerObject.rotation.set(0,0,0); viewer.zoom=.9; viewer.autoRotate=false; viewer.animation=null; $('skinZoom').value='.9'; $('skinAuto').checked=false; $('skinMotion').value='none'; });
  $('skinDownload').addEventListener('click', () => { if(!currentURL)return; const a=document.createElement('a'); a.href=currentURL; a.download=currentName; a.click(); });
  new ResizeObserver(resize).observe(stage);
  new MutationObserver(visibility).observe(panel,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange', visibility);
  reduced.addEventListener('change', () => { if(reduced.matches && viewer) { viewer.autoRotate=false; viewer.animation=null; $('skinAuto').checked=false; $('skinMotion').value='none'; } });
  const configured = window.PROFILE_CONFIG?.minecraftSkinUrl;
  if (configured) load(configured, 'AzureWolf-skin.png');
})();
