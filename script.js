document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("backgroundMusic");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const playPauseIcon = document.getElementById("playPauseIcon");
    const progressBar = document.getElementById("progressBar");
    const progressContainer = document.getElementById("progressContainer");
    const musicTime = document.getElementById("musicTime");
    
    const floatingMusicBtn = document.getElementById("musicButton");
    const floatingIcon = floatingMusicBtn ? floatingMusicBtn.querySelector("i") : null;

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function togglePlay() {
        if (audio.paused) {
            audio.play().then(() => {
                playPauseIcon.className = "fa-solid fa-pause";
                if (floatingMusicBtn) floatingMusicBtn.classList.add("playing");
                if (floatingIcon) floatingIcon.className = "fa-solid fa-volume-high";
            }).catch(err => console.log("Lỗi phát nhạc:", err));
        } else {
            audio.pause();
            playPauseIcon.className = "fa-solid fa-play";
            if (floatingMusicBtn) floatingMusicBtn.classList.remove("playing");
            if (floatingIcon) floatingIcon.className = "fa-solid fa-volume-xmark";
        }
    }

    if (playPauseBtn) {
        playPauseBtn.addEventListener("click", togglePlay);
    }

    if (floatingMusicBtn) {
        floatingMusicBtn.addEventListener("click", togglePlay);
    }

    // Cập nhật thanh tiến trình và thời gian chạy theo từng giây nhạc
    audio.addEventListener("timeupdate", () => {
        if (audio.duration) {
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
            musicTime.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
        }
    });

    // Cho phép click vào thanh tiến trình để tua nhạc chính xác
    progressContainer.addEventListener("click", (e) => {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        if (duration) {
            audio.currentTime = (clickX / width) * duration;
        }
    });

    audio.addEventListener("loadedmetadata", () => {
        musicTime.textContent = `0:00 / ${formatTime(audio.duration)}`;
    });
});