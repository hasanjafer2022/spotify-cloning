console.log("Welcome to Javascript!");
let currentSong = new Audio();
let songs = [];  // Initialize songs to an empty array
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
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];  // Reuse the global songs variable
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;  // Use currFolder
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }
    const decodedTrack = decodeURIComponent(track); // Decode URI component
    document.querySelector(".songinfo").innerHTML = decodedTrack;
    document.querySelector(".songtime").innerHTML = "00:00/ 00:00";

    //show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];

    // Clear existing list
    songUL.innerHTML = "";

    for (const song of songs) {
        const decodedSong = decodeURIComponent(song); // Decode URI component for each song
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

    // attach an event listener to each song
    Array.from(songUL.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            console.log(decodedTrack); // Log the decoded track (song name) when clicked
            playMusic(track.trim());
        });
    });
    return songs;
}

async function dispayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    console.log(anchors);
    Array.from(anchors).forEach(e => {
        
        if (e.href.includes("/songs")) {
            console.log(e.href.split("/").slice(-2)[0])
        }
    })

}

async function main() {
    // get the list of all songs initially
    await getSongs("songs/ncs");

    playMusic(songs[0], true);

    // display all the albums on the page
    dispayAlbums()

    // attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    // listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}&nbsp;/&nbsp;${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // add event listener for hamburger close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // add event listener to previous 
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);  // Fixed index to play previous song
        }
    });

    // add event listener to next 
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    // add event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {
        console.log("Setting volume to", e.target.value, "/100");
        currentSong.volume = e.target.value / 100;
    });

    // load the playlist whenever a card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            await getSongs(`songs/${card.dataset.folder}`);
            playMusic(songs[0], true);
        });
    });
}

main();
