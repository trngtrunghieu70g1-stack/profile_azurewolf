document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("backgroundMusic");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const playPauseIcon = document.getElementById("playPauseIcon");
    const musicDisc = document.querySelector(".music-disc");
    const musicStatus = document.getElementById("musicStatus");
    const progressBar = document.getElementById("progressBar");
    const progressContainer = document.getElementById("progressContainer");
    const musicTime = document.getElementById("musicTime");
    
    // Nút tròn nổi góc màn hình cũ (nếu có)
    const floatingMusicBtn = document.getElementById("musicButton");
    const floatingIcon = floatingMusicBtn ? floatingMusicBtn.querySelector("i") : null;

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function togglePlay() {
        if (audio.paused) {
            audio.play().then(() => {
                playPauseIcon.className = "fa-solid fa-pause";
                musicDisc.classList.add("rotating");
                musicStatus.textContent = "Đang phát...";
                if (floatingMusicBtn) floatingMusicBtn.classList.add("playing");
                if (floatingIcon) floatingIcon.className = "fa-solid fa-volume-high";
            }).catch(err => console.log("Lỗi phát nhạc:", err));
        } else {
            audio.pause();
            playPauseIcon.className = "fa-solid fa-play";
            musicDisc.classList.remove("rotating");
            musicStatus.textContent = "Đã tạm dừng";
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

    // Cập nhật thanh tiến trình
    audio.addEventListener("timeupdate", () => {
        if (audio.duration) {
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
            musicTime.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
        }
    });

    // Tua nhạc khi click vào thanh progress
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