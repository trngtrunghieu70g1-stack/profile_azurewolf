(() => {
  "use strict";
  const cfg = window.PROFILE_CONFIG || {};
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const music = $("#backgroundMusic");
  const player = $("#musicPlayer");
  const playIcon = $("#musicPlay i");

  // Music player: thu gọn / hiện lại và ghi nhớ lựa chọn
  if (player) {
    const toggle = document.createElement("button");
    toggle.id = "musicPlayerToggle";
    toggle.className = "music-player-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Ẩn trình phát nhạc");
    toggle.setAttribute("title", "Ẩn trình phát nhạc");
    toggle.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
    player.append(toggle);

    const restore = document.createElement("button");
    restore.id = "musicPlayerRestore";
    restore.className = "music-player-restore";
    restore.type = "button";
    restore.setAttribute("aria-label", "Hiện trình phát nhạc");
    restore.setAttribute("title", "Hiện trình phát nhạc");
    restore.innerHTML = '<i class="fa-solid fa-music"></i><span>Nhạc</span>';
    document.body.append(restore);

    const setPlayerHidden = (hidden) => {
      player.classList.toggle("is-hidden", hidden);
      restore.classList.toggle("show", hidden);
      toggle.setAttribute("aria-expanded", String(!hidden));
      localStorage.setItem("azurewolfMusicPlayerHidden", hidden ? "1" : "0");
    };

    setPlayerHidden(localStorage.getItem("azurewolfMusicPlayerHidden") === "1");
    toggle.addEventListener("click", () => setPlayerHidden(true));
    restore.addEventListener("click", () => setPlayerHidden(false));
  }

  let activityStartedAt = 0;
  let toastTimer;

  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function copy(text, message) {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => toast(message));
    else {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      toast(message);
    }
  }

  async function enter() {
    $("#enterScreen")?.classList.add("hidden");
    if (!music) return;
    music.volume = Number(localStorage.getItem("azurewolfMusicVolume") || .55);
    try { await music.play(); syncPlayer(); } catch (_) { syncPlayer(); }
  }
  $("#enterScreen")?.addEventListener("click", enter, { once: true });
  $("#enterScreen")?.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") enter(); }, { once: true });

  function updateClock() {
    const now = new Date();
    const clock = $("#liveClock");
    const date = $("#liveDate");
    if (clock) clock.textContent = now.toLocaleTimeString("vi-VN", {hour:"2-digit", minute:"2-digit", hour12:false});
    if (date) date.textContent = now.toLocaleDateString("vi-VN", {day:"2-digit", month:"2-digit", year:"numeric"});
  }
  updateClock();
  setInterval(updateClock, 1000);

  function showTab(tab, jump = "") {
    $$(".tab-panel").forEach(panel => panel.classList.toggle("active", panel.dataset.panel === tab));
    $$(".tab-link").forEach(button => {
      if (button.classList.contains("brand")) return;
      const shouldActivate = button.dataset.tab === tab && (!button.dataset.jump || button.dataset.jump === jump);
      button.classList.toggle("active", shouldActivate);
    });
    history.replaceState(null, "", `#${tab}`);
    const panel = $(`.tab-panel[data-panel="${tab}"]`);
    if (panel) panel.scrollTop = 0;
    if (jump) requestAnimationFrame(() => document.getElementById(jump)?.scrollIntoView({behavior:"smooth", block:"start"}));
  }
  $$(".tab-link").forEach(button => button.addEventListener("click", () => showTab(button.dataset.tab, button.dataset.jump || "")));
  const initialTab = location.hash.replace("#", "");
  if (["about", "furrymc", "support"].includes(initialTab)) showTab(initialTab);

  if (music) {
    music.addEventListener("loadedmetadata", () => {
      const saved = Number(localStorage.getItem("azurewolfMusicTime") || 0);
      if (saved > 0 && saved < music.duration) music.currentTime = saved;
    });
    music.addEventListener("volumechange", () => localStorage.setItem("azurewolfMusicVolume", String(music.volume)));
    window.addEventListener("beforeunload", () => localStorage.setItem("azurewolfMusicTime", String(music.currentTime || 0)));
  }

  const formatTime = seconds => {
    if (!Number.isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };
  function syncPlayer() {
    if (!music || !playIcon || !player) return;
    playIcon.className = music.paused ? "fa-solid fa-play" : "fa-solid fa-pause";
    player.classList.toggle("paused", music.paused);
  }
  music?.addEventListener("play", syncPlayer);
  music?.addEventListener("pause", syncPlayer);
  music?.addEventListener("timeupdate", () => {
    const percent = music.duration ? music.currentTime / music.duration * 100 : 0;
    if ($("#musicProgressBar")) $("#musicProgressBar").style.width = `${percent}%`;
    if ($("#musicTime")) $("#musicTime").textContent = `${formatTime(music.currentTime)} / ${formatTime(music.duration)}`;
  });
  $("#musicPlay")?.addEventListener("click", async () => { if (music.paused) { try { await music.play(); } catch (_) {} } else music.pause(); });
  ["#musicPrev", "#musicNext"].forEach(selector => $(selector)?.addEventListener("click", () => { music.currentTime = 0; music.play().catch(() => {}); }));
  $("#musicSeek")?.addEventListener("click", e => { const rect = e.currentTarget.getBoundingClientRect(); if (music.duration) music.currentTime = (e.clientX - rect.left) / rect.width * music.duration; });
  if ($("#musicVolume") && music) {
    $("#musicVolume").value = String(Number(localStorage.getItem("azurewolfMusicVolume") || .55));
    music.volume = Number($("#musicVolume").value);
    $("#musicVolume").addEventListener("input", e => { music.volume = Number(e.target.value); });
  }

  const ip = cfg.minecraftServerIp || "furrymc.fun";
  $$('[data-server-ip]').forEach(el => el.textContent = ip);
  $$('[data-copy-ip]').forEach(button => button.addEventListener("click", () => copy(ip, `Đã sao chép ${ip}`)));

  function renderServerStatus(html) {
    $$('[data-server-status]').forEach(el => el.innerHTML = html);
  }
  async function updateServerStatus() {
    const endpoints = [
      `https://api.mcsrvstat.us/3/${encodeURIComponent(ip)}`,
      `https://api.mcstatus.io/v2/status/java/${encodeURIComponent(ip)}`
    ];
    const results = await Promise.allSettled(endpoints.map(url => fetch(url, {cache:"no-store"}).then(r => {
      if (!r.ok) throw new Error("Status API error");
      return r.json();
    })));
    const responses = results.filter(r => r.status === "fulfilled").map(r => r.value);
    const online = responses.find(data => data.online === true);
    if (online) {
      const players = online.players?.online ?? 0;
      renderServerStatus(`<i></i> Đang hoạt động · ${players} người chơi`);
    } else renderServerStatus(`<i class="checking"></i> Chưa thể xác nhận trạng thái`);
  }
  updateServerStatus();
  setInterval(updateServerStatus, 60000);

  function discordAssetUrl(activity) {
    const asset = activity?.assets?.large_image;
    if (!asset) return "";
    if (asset.startsWith("mp:")) return `https://media.discordapp.net/${asset.slice(3)}`;
    if (asset.startsWith("https://")) return asset;
    return activity.application_id ? `https://cdn.discordapp.com/app-assets/${activity.application_id}/${asset}.png` : "";
  }
  function updateActivityTime() {
    const el = $("#discordActivityTime");
    if (!el) return;
    if (!activityStartedAt) { el.textContent = ""; return; }
    const seconds = Math.max(0, Math.floor((Date.now() - activityStartedAt) / 1000));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const secs = seconds % 60;
    el.textContent = `Đã hoạt động ${hours ? `${hours} giờ ` : ""}${minutes} phút ${String(secs).padStart(2, "0")} giây`;
  }
  function updateDiscord() {
    if (!cfg.discordUserId) {
      if ($("#discordActivityName")) $("#discordActivityName").textContent = "Chưa cấu hình Discord User ID";
      if ($("#discordActivityDetail")) $("#discordActivityDetail").textContent = "Điền discordUserId trong config.js";
      return;
    }
    fetch(`https://api.lanyard.rest/v1/users/${cfg.discordUserId}`).then(r => r.json()).then(({data}) => {
      const states = {online:"Đang hoạt động",idle:"Đang rảnh",dnd:"Không làm phiền",offline:"Đang ngoại tuyến"};
      const user = data?.discord_user || {};
      if (user.id && user.avatar) {
        const ext = user.avatar.startsWith("a_") ? "gif" : "png";
        const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=512`;
        $$('[data-discord-avatar]').forEach(img => { img.src = avatarUrl; });
      }
      if ($("#discordDisplayName")) $("#discordDisplayName").textContent = user.global_name || user.display_name || user.username || "AzureWolf VN";
      if ($("#discordUsername")) $("#discordUsername").textContent = user.username ? `@${user.username}` : "Discord profile";
      const decoration = $("#discordDecoration");
      const decorationAsset = user.avatar_decoration_data?.asset;
      if (decoration && decorationAsset) {
        decoration.src = `https://cdn.discordapp.com/avatar-decoration-presets/${decorationAsset}.png`;
        decoration.hidden = false;
      } else if (decoration) decoration.hidden = true;
      if ($("#discordStatusText")) $("#discordStatusText").textContent = states[data?.discord_status] || "Đang ngoại tuyến";
      if ($("#discordDot")) $("#discordDot").style.background = ({online:"#42e28a",idle:"#f6c85f",dnd:"#f36b7b",offline:"#788999"})[data?.discord_status] || "#788999";
      const spotify = data?.spotify;
      const activities = data?.activities || [];
      const activity = activities.find(a => a.type === 0 && a.name !== "Custom Status") || activities.find(a => (a.type === 2 || a.type === 3) && a.name !== "Custom Status");
      const image = $("#discordActivityImage");
      if (spotify) {
        $("#discordActivityType").textContent = "ĐANG NGHE SPOTIFY";
        $("#discordActivityName").textContent = spotify.song || "Spotify";
        $("#discordActivityDetail").textContent = `${spotify.artist || "Không rõ nghệ sĩ"}${spotify.album ? ` · ${spotify.album}` : ""}`;
        $("#discordActivityIcon").className = "fa-brands fa-spotify";
        activityStartedAt = Number(spotify.timestamps?.start || 0);
        if (image) { image.src = spotify.album_art_url || ""; image.hidden = !spotify.album_art_url; }
      } else if (activity) {
        $("#discordActivityType").textContent = activity.type === 0 ? "ĐANG CHƠI" : "HOẠT ĐỘNG DISCORD";
        $("#discordActivityName").textContent = activity.name || states[data?.discord_status];
        $("#discordActivityDetail").textContent = activity.details || activity.state || states[data?.discord_status];
        $("#discordActivityIcon").className = activity.name?.toLowerCase().includes("modrinth") ? "fa-solid fa-cube" : "fa-solid fa-gamepad";
        activityStartedAt = Number(activity.timestamps?.start || 0);
        const assetUrl = discordAssetUrl(activity);
        if (image) { image.src = assetUrl; image.hidden = !assetUrl; }
      } else {
        $("#discordActivityType").textContent = "TRẠNG THÁI DISCORD";
        $("#discordActivityName").textContent = states[data?.discord_status] || "Đang ngoại tuyến";
        $("#discordActivityDetail").textContent = "Hiện không có hoạt động công khai";
        $("#discordActivityIcon").className = "fa-brands fa-discord";
        activityStartedAt = 0;
        if (image) image.hidden = true;
      }
      updateActivityTime();
    }).catch(() => { if ($("#discordActivityName")) $("#discordActivityName").textContent = "Không thể tải hoạt động"; });
  }
  updateDiscord();
  setInterval(updateDiscord, 15000);
  setInterval(updateActivityTime, 1000);

  const dialog = $("#supportDialog");
  $$(".open-support").forEach(button => button.addEventListener("click", () => dialog?.showModal()));
  $("#closeSupport")?.addEventListener("click", () => dialog?.close());
  dialog?.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });

  const configured = Boolean(cfg.bankCode && cfg.bankAccount && cfg.bankAccountName);
  const note = cfg.donationNote || "NUOIAZUREWOLF";
  if ($("#donationNote")) $("#donationNote").textContent = note;
  if (configured) {
    if ($("#donationReady")) $("#donationReady").hidden = false;
    if ($("#donationPending")) $("#donationPending").hidden = true;
    if ($("#bankSummary")) $("#bankSummary").textContent = `${cfg.bankCode} · ${cfg.bankAccount} · ${cfg.bankAccountName}`;
  }
  function setQr(amount = "") {
    $$(".amount-grid button").forEach(b => b.classList.toggle("active", b.dataset.amount === String(amount)));
    if (!configured || !$("#donationQr")) return;
    const params = new URLSearchParams({addInfo: note, accountName: cfg.bankAccountName});
    if (amount) params.set("amount", amount);
    $("#donationQr").src = `https://img.vietqr.io/image/${encodeURIComponent(cfg.bankCode)}-${encodeURIComponent(cfg.bankAccount)}-compact2.png?${params}`;
  }
  $$(".amount-grid button").forEach(button => button.addEventListener("click", () => { setQr(button.dataset.amount); if (!configured) toast("Thông tin ủng hộ đang được cập nhật"); }));
  $("#copyDonationNote")?.addEventListener("click", () => copy(note, "Đã sao chép nội dung chuyển khoản"));
  setQr("20000");
})();
