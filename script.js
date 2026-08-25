document.addEventListener("DOMContentLoaded", () => {
  const audio = document.querySelector("#backgroundMusic");
  const playButton = document.querySelector("#playPauseBtn");
  const previousButton = document.querySelector("#prevBtn");
  const nextButton = document.querySelector("#nextBtn");
  const playIcon = document.querySelector("#playPauseIcon");
  const progressTrack = document.querySelector("#progressContainer");
  const progressBar = document.querySelector("#progressBar");
  const musicTime = document.querySelector("#musicTime");
  const enterScreen = document.querySelector("#enterScreen");

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return "0:00";
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  };
  const setPlayerState = (playing) => {
    playIcon.className = `fa-solid fa-${playing ? "pause" : "play"}`;
    playButton.setAttribute("aria-label", playing ? "Tạm dừng nhạc" : "Phát nhạc");
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
  audio.addEventListener("loadedmetadata", () => { musicTime.textContent = `0:00 / ${formatTime(audio.duration)}`; });
  audio.addEventListener("timeupdate", () => {
    const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progressBar.style.width = `${percent}%`;
    musicTime.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  });
  progressTrack.addEventListener("click", (event) => {
    if (!audio.duration) return;
    const rect = progressTrack.getBoundingClientRect();
    audio.currentTime = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)) * audio.duration;
  });

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
