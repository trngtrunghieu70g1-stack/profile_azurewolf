document.addEventListener("DOMContentLoaded", () => {
  const config = window.PROFILE_CONFIG || {};
  const audio = document.querySelector("#backgroundMusic");
  const enterScreen = document.querySelector("#enterScreen");
  const playButton = document.querySelector("#playPauseBtn");
  const previousButton = document.querySelector("#prevBtn");
  const nextButton = document.querySelector("#nextBtn");
  const playIcon = document.querySelector("#playPauseIcon");
  const progressTrack = document.querySelector("#progressContainer");
  const progressBar = document.querySelector("#progressBar");
  const musicTime = document.querySelector("#musicTime");
  const volumeSlider = document.querySelector("#volumeSlider");
  const volumeValue = document.querySelector("#volumeValue");
  const volumeIcon = document.querySelector("#volumeIcon");

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return "0:00";
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  };

  const setPlayerState = (playing) => {
    playIcon.className = `fa-solid fa-${playing ? "pause" : "play"}`;
    playButton.setAttribute("aria-label", playing ? "Tạm dừng nhạc" : "Phát nhạc");
  };

  const setVolume = (value) => {
    const volume = Math.min(1, Math.max(0, Number(value)));
    audio.volume = volume;
    volumeSlider.value = volume;
    volumeValue.textContent = `${Math.round(volume * 100)}%`;
    volumeIcon.className = `fa-solid fa-volume-${volume === 0 ? "xmark" : volume < 0.5 ? "low" : "high"}`;
    localStorage.setItem("azurewolfMusicVolume", String(volume));
  };

  setVolume(localStorage.getItem("azurewolfMusicVolume") ?? "0.7");
  volumeSlider.addEventListener("input", () => setVolume(volumeSlider.value));

  const saveMusicPosition = () => {
    if (Number.isFinite(audio.currentTime)) localStorage.setItem("azurewolfMusicTime", String(audio.currentTime));
  };

  const enterProfile = async () => {
    if (enterScreen.classList.contains("is-hidden")) return;
    enterScreen.classList.add("is-hidden");
    try { await audio.play(); } catch (error) { console.warn("Không thể tự phát nhạc:", error); }
    window.setTimeout(() => enterScreen.remove(), 700);
  };

  enterScreen.addEventListener("click", enterProfile);
  enterScreen.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      enterProfile();
    }
  });

  playButton.addEventListener("click", async () => {
    if (audio.paused) {
      try { await audio.play(); } catch (error) { console.warn("Không thể phát nhạc:", error); }
    } else audio.pause();
  });

  const restartTrack = async () => {
    audio.currentTime = 0;
    try { await audio.play(); } catch (error) { console.warn("Không thể phát nhạc:", error); }
  };
  previousButton.addEventListener("click", restartTrack);
  nextButton.addEventListener("click", restartTrack);

  audio.addEventListener("play", () => setPlayerState(true));
  audio.addEventListener("pause", () => setPlayerState(false));
  audio.addEventListener("loadedmetadata", () => {
    const savedTime = Number(localStorage.getItem("azurewolfMusicTime"));
    if (Number.isFinite(savedTime) && savedTime > 0 && savedTime < audio.duration - 2) audio.currentTime = savedTime;
    musicTime.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  });
  audio.addEventListener("timeupdate", () => {
    const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progressBar.style.width = `${percent}%`;
    musicTime.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  });
  window.setInterval(saveMusicPosition, 2000);
  window.addEventListener("beforeunload", saveMusicPosition);

  progressTrack.addEventListener("click", (event) => {
    if (!audio.duration) return;
    const rect = progressTrack.getBoundingClientRect();
    audio.currentTime = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)) * audio.duration;
    saveMusicPosition();
  });

  const copyButton = document.querySelector("#copyIpBtn");
  const serverIp = config.minecraftServerIp || copyButton.dataset.ip;
  copyButton.dataset.ip = serverIp;
  copyButton.querySelector("code").textContent = serverIp;
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(serverIp);
      const label = copyButton.querySelector("span");
      const oldText = label.textContent;
      label.textContent = "Đã sao chép!";
      window.setTimeout(() => { label.textContent = oldText; }, 1600);
    } catch {
      window.prompt("Sao chép địa chỉ máy chủ:", serverIp);
    }
  });

  const loadServerStatus = async () => {
    const output = document.querySelector("#serverStatus");
    try {
      const response = await fetch(`https://api.mcstatus.io/v2/status/java/${encodeURIComponent(serverIp)}?query=false`);
      if (!response.ok) throw new Error("Server status API error");
      const data = await response.json();
      if (data.online) {
        output.innerHTML = `<span class="server-dot online"></span> Online · ${data.players?.online ?? 0}/${data.players?.max ?? "?"} người chơi`;
      } else output.innerHTML = '<span class="server-dot offline"></span> Máy chủ đang ngoại tuyến';
    } catch {
      output.innerHTML = '<span class="server-dot unknown"></span> Không thể kiểm tra trạng thái';
    }
  };
  loadServerStatus();
  window.setInterval(loadServerStatus, 60000);

  const loadDiscordStatus = async () => {
    const userId = String(config.discordUserId || "").trim();
    if (!/^\d{17,20}$/.test(userId)) return;
    const statusBox = document.querySelector("#discordStatus");
    const statusText = document.querySelector("#discordStatusText");
    const labels = { online: "Discord: Online", idle: "Discord: Đang rảnh", dnd: "Discord: Không làm phiền", offline: "Discord: Offline" };
    try {
      const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
      const payload = await response.json();
      if (!payload.success) throw new Error("Lanyard user unavailable");
      const status = payload.data.discord_status || "offline";
      statusBox.className = `status ${status}`;
      const activity = payload.data.activities?.find((item) => item.type === 0);
      statusText.textContent = activity?.name ? `Đang chơi ${activity.name}` : labels[status];
    } catch {
      statusBox.className = "status offline";
      statusText.textContent = "Discord: Không xác định";
    }
  };
  loadDiscordStatus();
  window.setInterval(loadDiscordStatus, 60000);

  const loadViewCount = async () => {
    const output = document.querySelector("#viewCount");
    if (config.counterApiUrl) {
      try {
        const response = await fetch(config.counterApiUrl, { method: "POST" });
        const data = await response.json();
        const count = data.value ?? data.count ?? data.data?.up_count;
        if (Number.isFinite(Number(count))) {
          output.textContent = Number(count).toLocaleString("vi-VN");
          return;
        }
      } catch (error) { console.warn("Không thể tải bộ đếm trực tuyến:", error); }
    }
    const key = "azurewolfLocalViews";
    if (!sessionStorage.getItem("azurewolfViewCounted")) {
      localStorage.setItem(key, String((Number(localStorage.getItem(key)) || 0) + 1));
      sessionStorage.setItem("azurewolfViewCounted", "1");
    }
    output.textContent = (Number(localStorage.getItem(key)) || 1).toLocaleString("vi-VN");
    output.title = "Số lượt truy cập được lưu trên trình duyệt này";
  };
  loadViewCount();

  document.querySelector("#currentYear").textContent = new Date().getFullYear();
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const particles = document.querySelector("#particles");
    for (let index = 0; index < 18; index += 1) {
      const dot = document.createElement("span");
      dot.className = "particle";
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.animationDuration = `${8 + Math.random() * 10}s`;
      dot.style.animationDelay = `${Math.random() * -14}s`;
      particles.append(dot);
    }
  }
});
