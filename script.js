(() => {
  "use strict";
  const cfg = window.PROFILE_CONFIG || {};
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const music = $("#backgroundMusic");
  const player = $("#musicPlayer");
  const playIcon = $("#musicPlay i");
  let toastTimer;

  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function copy(text, message) {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => toast(message));
    else { const area = document.createElement("textarea"); area.value = text; document.body.append(area); area.select(); document.execCommand("copy"); area.remove(); toast(message); }
  }

  async function enter() {
    $("#enterScreen").classList.add("hidden");
    music.volume = Number(localStorage.getItem("azurewolfMusicVolume") || .55);
    try { await music.play(); syncPlayer(); } catch (_) { syncPlayer(); }
  }
  $("#enterScreen").addEventListener("click", enter, { once: true });
  $("#enterScreen").addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") enter(); }, { once: true });
  $("#soundToggle").addEventListener("click", () => player.classList.remove("minimized"));
  music.addEventListener("loadedmetadata", () => { const saved = Number(localStorage.getItem("azurewolfMusicTime") || 0); if (saved > 0 && saved < music.duration) music.currentTime = saved; });
  music.addEventListener("volumechange", () => localStorage.setItem("azurewolfMusicVolume", String(music.volume)));
  window.addEventListener("beforeunload", () => localStorage.setItem("azurewolfMusicTime", String(music.currentTime || 0)));

  function showTab(tab) {
    $$(".tab-panel").forEach(panel => panel.classList.toggle("active", panel.dataset.panel === tab));
    $(".topbar nav")?.querySelectorAll(".tab-link").forEach(button => button.classList.toggle("active", button.dataset.tab === tab));
    history.replaceState(null, "", `#${tab}`);
    window.scrollTo({top: 0, behavior: "instant"});
  }
  $$(".tab-link").forEach(button => button.addEventListener("click", () => showTab(button.dataset.tab)));
  const initialTab = location.hash.replace("#", "");
  if (["about", "furrymc", "support"].includes(initialTab)) showTab(initialTab);

  const formatTime = seconds => { if (!Number.isFinite(seconds)) return "0:00"; const m = Math.floor(seconds / 60); const s = Math.floor(seconds % 60); return `${m}:${String(s).padStart(2, "0")}`; };
  function syncPlayer() {
    playIcon.className = music.paused ? "fa-solid fa-play" : "fa-solid fa-pause";
    player.classList.toggle("paused", music.paused);
  }
  music.addEventListener("play", syncPlayer);
  music.addEventListener("pause", syncPlayer);
  music.addEventListener("timeupdate", () => { const percent = music.duration ? music.currentTime / music.duration * 100 : 0; $("#musicProgressBar").style.width = `${percent}%`; $("#musicTime").textContent = `${formatTime(music.currentTime)} / ${formatTime(music.duration)}`; });
  $("#musicPlay").addEventListener("click", async () => { if (music.paused) { try { await music.play(); } catch (_) {} } else music.pause(); });
  ["#musicPrev", "#musicNext"].forEach(selector => $(selector).addEventListener("click", () => { music.currentTime = 0; music.play().catch(() => {}); }));
  $("#musicSeek").addEventListener("click", e => { const rect = e.currentTarget.getBoundingClientRect(); if (music.duration) music.currentTime = (e.clientX - rect.left) / rect.width * music.duration; });
  $("#musicVolume").value = String(Number(localStorage.getItem("azurewolfMusicVolume") || .55));
  music.volume = Number($("#musicVolume").value);
  $("#musicVolume").addEventListener("input", e => { music.volume = Number(e.target.value); });
  $("#musicMinimize").addEventListener("click", e => { e.stopPropagation(); player.classList.add("minimized"); });
  player.addEventListener("click", () => { if (player.classList.contains("minimized")) player.classList.remove("minimized"); });

  const ip = cfg.minecraftServerIp || "furrymc.fun";
  $("#copyIpBtn").dataset.ip = ip;
  $("#copyIpBtn strong").textContent = ip;
  $("#copyIpBtn").addEventListener("click", () => copy(ip, `Đã sao chép ${ip}`));

  fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(ip)}`).then(r => r.json()).then(data => {
    const el = $("#serverStatus");
    if (data.online) el.innerHTML = `<i></i> Đang hoạt động · ${data.players?.online ?? 0} người chơi`;
    else el.innerHTML = `<i class="offline"></i> Máy chủ đang ngoại tuyến`;
  }).catch(() => { $("#serverStatus").innerHTML = `<i class="checking"></i> Chưa thể kiểm tra trạng thái`; });

  function updateDiscord() { if (!cfg.discordUserId) { $("#discordActivityName").textContent = "Chưa cấu hình Discord User ID"; $("#discordActivityDetail").textContent = "Điền discordUserId trong config.js"; return; } fetch(`https://api.lanyard.rest/v1/users/${cfg.discordUserId}`).then(r => r.json()).then(({data}) => {
    const states = {online:"Đang hoạt động",idle:"Đang rảnh",dnd:"Không làm phiền",offline:"Đang ngoại tuyến"};
    $("#discordStatusText").textContent = states[data?.discord_status] || "Đang ngoại tuyến";
    $("#discordDot").style.background = ({online:"#42e28a",idle:"#f6c85f",dnd:"#f36b7b",offline:"#788999"})[data?.discord_status] || "#788999";
    const spotify = data?.spotify;
    const activity = data?.activities?.find(a => a.type === 0 || a.type === 2 || a.type === 3 || a.type === 4);
    const image = $("#discordActivityImage");
    if (spotify) {
      $("#discordActivityType").textContent = "ĐANG NGHE SPOTIFY";
      $("#discordActivityName").textContent = spotify.song || "Spotify";
      $("#discordActivityDetail").textContent = `${spotify.artist || "Không rõ nghệ sĩ"}${spotify.album ? ` · ${spotify.album}` : ""}`;
      image.src = spotify.album_art_url || ""; image.hidden = !spotify.album_art_url;
    } else if (activity) {
      $("#discordActivityType").textContent = activity.type === 0 ? "ĐANG CHƠI" : "HOẠT ĐỘNG DISCORD";
      $("#discordActivityName").textContent = activity.name || states[data?.discord_status];
      $("#discordActivityDetail").textContent = activity.details || activity.state || states[data?.discord_status];
      image.hidden = true;
    } else {
      $("#discordActivityType").textContent = "TRẠNG THÁI DISCORD";
      $("#discordActivityName").textContent = states[data?.discord_status] || "Đang ngoại tuyến";
      $("#discordActivityDetail").textContent = "Hiện không có hoạt động công khai";
      image.hidden = true;
    }
  }).catch(() => { $("#discordActivityName").textContent = "Không thể tải hoạt động"; }); }
  updateDiscord();
  setInterval(updateDiscord, 15000);

  const localViews = Number(localStorage.getItem("azurewolf-views") || 0) + 1;
  localStorage.setItem("azurewolf-views", String(localViews));
  $("#viewCount").textContent = localViews.toLocaleString("vi-VN");
  if (cfg.counterApiUrl) fetch(cfg.counterApiUrl, {method:"POST"}).then(r => r.json()).then(d => { const n = d.views ?? d.count; if (Number.isFinite(n)) $("#viewCount").textContent = n.toLocaleString("vi-VN"); }).catch(() => {});
  $("#currentYear").textContent = new Date().getFullYear();

  const dialog = $("#supportDialog");
  $$(".open-support").forEach(button => button.addEventListener("click", () => dialog.showModal()));
  $("#closeSupport").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });

  const configured = Boolean(cfg.bankCode && cfg.bankAccount && cfg.bankAccountName);
  const note = cfg.donationNote || "NUOIAZUREWOLF";
  $("#donationNote").textContent = note;
  if (configured) {
    $("#donationReady").hidden = false;
    $("#donationPending").hidden = true;
    $("#bankSummary").textContent = `${cfg.bankCode} · ${cfg.bankAccount} · ${cfg.bankAccountName}`;
  }
  function setQr(amount = "") {
    $$(".amount-grid button").forEach(b => b.classList.toggle("active", b.dataset.amount === String(amount)));
    if (!configured) return;
    const params = new URLSearchParams({addInfo: note, accountName: cfg.bankAccountName});
    if (amount) params.set("amount", amount);
    $("#donationQr").src = `https://img.vietqr.io/image/${encodeURIComponent(cfg.bankCode)}-${encodeURIComponent(cfg.bankAccount)}-compact2.png?${params}`;
  }
  $$(".amount-grid button").forEach(button => button.addEventListener("click", () => { setQr(button.dataset.amount); if (!configured) toast("Thông tin ủng hộ đang được cập nhật"); }));
  $("#copyDonationNote").addEventListener("click", () => copy(note, "Đã sao chép nội dung chuyển khoản"));
  setQr("20000");
})();
