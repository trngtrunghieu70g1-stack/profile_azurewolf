document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("backgroundMusic");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const playPauseIcon = document.getElementById("playPauseIcon");
    const progressBar = document.getElementById("progressBar");
    const progressContainer = document.getElementById("progressContainer");
    const musicTime = document.getElementById("musicTime");
    
    let isPlaying = false;

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function togglePlay() {
        if (audio.paused) {
            audio.play().then(() => {
                isPlaying = true;
                playPauseIcon.className = "fa-solid fa-pause";
            }).catch(err => {
                console.log("Trình duyệt chặn phát tự động:", err);
            });
        } else {
            audio.pause();
            isPlaying = false;
            playPauseIcon.className = "fa-solid fa-play";
        }
    }

    // Bấm vào nút Play trên khung nhạc
    if (playPauseBtn) {
        playPauseBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            togglePlay();
        });
    }

    // Tự động phát nhạc khi người dùng tương tác click đầu tiên trên trang
    document.body.addEventListener("click", () => {
        if (audio.paused && !isPlaying) {
            audio.play().then(() => {
                isPlaying = true;
                playPauseIcon.className = "fa-solid fa-pause";
            }).catch(() => {});
        }
    }, { once: true });

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