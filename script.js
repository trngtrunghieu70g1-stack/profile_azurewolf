(() => {
  "use strict";
  const cfg = window.PROFILE_CONFIG || {};
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const music = $("#backgroundMusic");
  const soundIcon = $("#soundToggle i");
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
    try { await music.play(); soundIcon.className = "fa-solid fa-volume-high"; } catch (_) { soundIcon.className = "fa-solid fa-volume-xmark"; }
  }
  $("#enterScreen").addEventListener("click", enter, { once: true });
  $("#enterScreen").addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") enter(); }, { once: true });
  $("#soundToggle").addEventListener("click", async () => { if (music.paused) { try { await music.play(); } catch (_) {} } else music.pause(); soundIcon.className = music.paused ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high"; });
  music.addEventListener("loadedmetadata", () => { const saved = Number(localStorage.getItem("azurewolfMusicTime") || 0); if (saved > 0 && saved < music.duration) music.currentTime = saved; });
  music.addEventListener("volumechange", () => localStorage.setItem("azurewolfMusicVolume", String(music.volume)));
  window.addEventListener("beforeunload", () => localStorage.setItem("azurewolfMusicTime", String(music.currentTime || 0)));

  const ip = cfg.minecraftServerIp || "furrymc.fun";
  $("#copyIpBtn").dataset.ip = ip;
  $("#copyIpBtn strong").textContent = ip;
  $("#copyIpBtn").addEventListener("click", () => copy(ip, `Đã sao chép ${ip}`));

  fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(ip)}`).then(r => r.json()).then(data => {
    const el = $("#serverStatus");
    if (data.online) el.innerHTML = `<i></i> Đang hoạt động · ${data.players?.online ?? 0} người chơi`;
    else el.innerHTML = `<i class="offline"></i> Máy chủ đang ngoại tuyến`;
  }).catch(() => { $("#serverStatus").innerHTML = `<i class="checking"></i> Chưa thể kiểm tra trạng thái`; });

  if (cfg.discordUserId) fetch(`https://api.lanyard.rest/v1/users/${cfg.discordUserId}`).then(r => r.json()).then(({data}) => {
    const states = {online:"Đang hoạt động",idle:"Đang rảnh",dnd:"Không làm phiền",offline:"Đang ngoại tuyến"};
    $("#discordStatusText").textContent = states[data?.discord_status] || "Đang ngoại tuyến";
    $("#discordDot").style.background = ({online:"#42e28a",idle:"#f6c85f",dnd:"#f36b7b",offline:"#788999"})[data?.discord_status] || "#788999";
  }).catch(() => {});

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
