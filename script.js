console.log("Welcome to Javascript!");
let currentSong = new Audio();
let songs = [];  
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    try {
        currFolder = folder;
        let a = await fetch(`/${folder}/`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let as = div.getElementsByTagName("a");
        songs = [];  
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                songs.push(decodeURIComponent(element.href.split(`/${folder}/`)[1]));
            }
        }
    } catch (error) {
        console.error("Failed to fetch songs:", error);
    }
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + encodeURIComponent(track);
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }
    const decodedTrack = decodeURIComponent(track); 
    document.querySelector(".songinfo").innerHTML = decodedTrack;
    document.querySelector(".songtime").innerHTML = "00:00/ 00:00";


    let songUL = document.querySelector(".songList ul");

    songUL.innerHTML = "";

    for (const song of songs) {
        const decodedSong = decodeURIComponent(song); 
        songUL.innerHTML += `<li> 
                            <img class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div> ${decodedSong.replaceAll("%20", " ")} </div>
                                <div>Hasan</div>
                            </div>
                            <div class="playnow">
                                <span class="playnow">Play Now</span>
                                <img class="invert" src="play.svg" alt="" height="30px">
                            </div> </li>`;
    }

    Array.from(songUL.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(track.trim());
        });
    });
    return songs;
}

async function dispayAlbums() {
    try {
        let a = await fetch(`http://127.0.0.1:5500/songs/`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;

        let anchors = div.getElementsByTagName("a");
        
        Array.from(anchors).forEach(e => {
            if (e.href.includes("/songs")) {
                console.log(e.href.split("/").slice(-1)[0]);
            }
        });
    } catch (error) {
        console.error("Failed to fetch albums:", error);
    }
}

async function main() {

    await getSongs("songs/ncs/");

    playMusic(songs[0], true);


    await dispayAlbums();


    const play = document.getElementById("play");
    const previous = document.getElementById("previous");
    const next = document.getElementById("next");

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });


    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}&nbsp;/&nbsp;${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });


    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });


    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]); 
        }
    });

 
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });


    document.querySelector(".range input").addEventListener("input", (e) => {
        console.log("Setting volume to", e.target.value, "/100");
        currentSong.volume = e.target.value / 100;
    });


    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            await getSongs(`songs/${card.dataset.folder}`);
            playMusic(songs[0], true);
        });
    });
}

main();