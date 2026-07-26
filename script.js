/* =================================
   PARTICLES
================================= */

const particlesContainer =
    document.getElementById("particles");

const particleCount = 45;


for (
    let i = 0;
    i < particleCount;
    i++
) {

    const particle =
        document.createElement("div");

    particle.classList.add(
        "particle"
    );

    const size =
        Math.random() * 3 + 1;

    const left =
        Math.random() * 100;

    const duration =
        Math.random() * 15 + 10;

    const delay =
        Math.random() * 15;


    particle.style.width =
        `${size}px`;

    particle.style.height =
        `${size}px`;

    particle.style.left =
        `${left}%`;

    particle.style.animationDuration =
        `${duration}s`;

    particle.style.animationDelay =
        `${delay}s`;


    particlesContainer.appendChild(
        particle
    );

}


/* =================================
   MUSIC
================================= */

const music =
    document.getElementById(
        "backgroundMusic"
    );

const musicButton =
    document.getElementById(
        "musicButton"
    );


let isPlaying = false;


/* Play / Pause */

musicButton.addEventListener(
    "click",
    () => {

        if (isPlaying) {

            music.pause();

            isPlaying = false;

            musicButton.classList.remove(
                "playing"
            );

            musicButton.innerHTML =
                '<i class="fa-solid fa-volume-xmark"></i>';

        }

        else {

            music.play()
                .then(() => {

                    isPlaying = true;

                    musicButton.classList.add(
                        "playing"
                    );

                    musicButton.innerHTML =
                        '<i class="fa-solid fa-volume-high"></i>';

                })
                .catch(
                    error => {

                        console.log(
                            "Music could not play:",
                            error
                        );

                    }
                );

        }

    }
);


/* =================================
   MOUSE PARALLAX
================================= */

document.addEventListener(
    "mousemove",
    (event) => {

        const x =
            (window.innerWidth / 2 -
            event.clientX) / 80;

        const y =
            (window.innerHeight / 2 -
            event.clientY) / 80;


        const background =
            document.querySelector(
                ".background"
            );


        if (background) {

            background.style.transform =
                `scale(1.05)
                 translate(${x}px, ${y}px)`;

        }

    }
);


/* =================================
   PAGE VISIBILITY
================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.hidden &&
            isPlaying
        ) {

            music.pause();

        }

        else if (
            !document.hidden &&
            isPlaying
        ) {

            music.play()
                .catch(() => {});

        }

    }
);


/* =================================
   IMAGE ERROR FALLBACK
================================= */

const avatar =
    document.querySelector(
        ".avatar"
    );


avatar.addEventListener(
    "error",
    () => {

        avatar.src =
            "https://api.dicebear.com/9.x/bottts/svg?seed=HieuTran";

    }
);


/* =================================
   CONSOLE MESSAGE
================================= */

console.log(
    "%c🐾 Welcome to Hiếu Trần's Profile!",
    "font-size: 18px; font-weight: bold;"
);

console.log(
    "%cFurryMC • Minecraft • Coding",
    "font-size: 13px;"
);