import { useEffect, useState } from 'react'
import React from 'react'
import logo from './photos/logo2.png'
import spotify from './photos/spotify.png'
import './css/broadway.css'
// import { start, stop } from './timerworker';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { faPlay, faPause, faForward, faBackward, faShuffle, faRepeat, faMicrophone, faLanguage, faVolumeHigh, faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NoSleep from 'nosleep.js';
import Popup from 'reactjs-popup';
import { useSwipeable } from 'react-swipeable';
// import englishcommands from './audio/englishcommands.mp3'
// import dutchcommands from './audio/dutchcommands.mp3'

const nosleep = new NoSleep();
nosleep.enable();

const LANGUAGE_MAP = {
  'Engels': 'en-US',
  'Dutch': 'nl-NL'
}

function EN() {
  // let installPrompt; //Variable to store the install action in
  // useEffect(() => {
  //   window.addEventListener("beforeinstallprompt", (event) => {
  //     event.preventDefault(); //Prevent the event (this prevents the default bar to show up)
  //     installPrompt = event; //Install event is stored for triggering it later

  //     document.getElementById("installbtn").hidden = false;
  //   });
  // });

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      document.getElementById("album").classList.toggle("left")
      nextSong();
      document.getElementById("album").style.opacity = 0;
      document.getElementById("bgimg").style.opacity = 0;
      setTimeout(doSwipeLeftAnim, 1000);
    },
    onSwipedRight: () => {
      document.getElementById("album").classList.toggle("right")
      previousSong();
      document.getElementById("album").style.opacity = 0;
      document.getElementById("bgimg").style.opacity = 0;
      setTimeout(doSwipeRightAnim, 1000);
    },
    onSwipedUp: () => {
      document.getElementById("lyricbtn").click();
    },
    delta: 50,
    preventDefaultTouchmoveEvent: true
  });

  function doSwipeLeftAnim() {
    document.getElementById("album").classList.toggle("left")
    document.getElementById("album").classList.toggle("right")
    setTimeout(function () {
      document.getElementById("album").classList.toggle("right");
      document.getElementById("album").style.opacity = 100;
      document.getElementById("bgimg").style.opacity = 100;
    }, 500)
  }

  function doSwipeRightAnim() {
    document.getElementById("album").classList.toggle("right")
    document.getElementById("album").classList.toggle("left")
    setTimeout(function () {
      document.getElementById("album").classList.toggle("left");
      document.getElementById("album").style.opacity = 100;
      document.getElementById("bgimg").style.opacity = 100;
    }, 500)
  }

  // var dutchaudio = new Audio(dutchcommands);
  // var englishaudio = new Audio(englishcommands);

  const authEndpoint = "https://accounts.spotify.com/authorize/?"

  const clientId = "c12a19b4c59744a797e50a4c058b753e"
  //const redirectUri = "https://viggoseerden.github.io/sptfy-vc-ctrl"
  const redirectUri = "http://localhost:3000/sptfy-vc-ctrl"

  const scopes = [
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-modify-playback-state',
  ]

  let [token, setToken] = useState()
  let [currSong, setCurrSong] = useState();
  let [lyrics, setLyrics] = useState([]);
  let [synced, setSynced] = useState(false);
  let [lyricsfound, setFound] = useState(false);

  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [duration, setDuration] = useState();

  const [progressWidth, setProgressWidth] = useState(0);

  const [shuffle, setShuffle] = useState();
  const [songrepeat, setRepeat] = useState();

  const [isListening, setListening] = useState(false);

  const [language, setLanguage] = useState("en-US");
  const [microphone, setMicrophoneP] = useState("Off");
  const [volume, setVolumeP] = useState(100);
  const [bg, setBG] = useState("normal");

  const [mode, setMode] = useState("normal");
  let [score, setScore] = useState(0);
  let [highscore, setHighscore] = useState(0);

  let [titleinput, setTitle] = useState("");
  let [artistinput, setArtist] = useState("");
  let [albuminput, setAlbum] = useState("");

  function checkAnswer() {
    let tempscore = score
    if (document.getElementById("albuminp").disabled === true && document.getElementById("artistinp").disabled === true && document.getElementById("titleinp").disabled === true) {
      tempscore += 2;
      setScore(tempscore);
      if (tempscore > highscore) {
        setHighscore(tempscore)
        localStorage.setItem("highscore", score)
      }

      setTimeout(function () {
        nextSong()
        document.getElementById("albuminp").disabled = false
        document.getElementById("albuminp").value = ""
        document.getElementById("albuminp").classList.remove("correct")

        document.getElementById("artistinp").disabled = false
        document.getElementById("artistinp").value = ""
        document.getElementById("artistinp").classList.remove("correct")

        document.getElementById("titleinp").disabled = false
        document.getElementById("titleinp").value = ""
        document.getElementById("titleinp").classList.remove("correct")
      }, 1000);
    }
  }

  useEffect(() => {
    if (mode === "quiz") {
      let tempscore = score;
      if (document.getElementById("titleinp").value.toLowerCase().replace(/[^\w]|_/g, "") === currSong.item.name.toLowerCase().replace(/[^\w]|_/g, "") && document.getElementById("titleinp").disabled === false) {
        document.getElementById("titleinp").classList.add("correct");
        document.getElementById("titleinp").disabled = true;
        tempscore++;
        setScore(tempscore);
        if (tempscore > highscore) {
          setHighscore(tempscore)
          localStorage.setItem("highscore", score)
        }
      }
      checkAnswer()
    }
  }, [titleinput])



  useEffect(() => {
    if (mode === "quiz") {
      let tempscore = score;
      for (let i = 0; i < currSong.item.artists.length; i++) {
        if (document.getElementById("artistinp").value.toLowerCase().replace(/[^\w]|_/g, "") === currSong.item.artists[i].name.toLowerCase().replace(/[^\w]|_/g, "") && document.getElementById("artistinp").disabled === false) {
          document.getElementById("artistinp").classList.add("correct");
          document.getElementById("artistinp").disabled = true;
          tempscore++;
          setScore(tempscore);
          if (tempscore > highscore) {
            setHighscore(tempscore)
            localStorage.setItem("highscore", score)
          }
        }
        checkAnswer()
        break;
      }
    }
  }, [artistinput])



  useEffect(() => {
    if (mode === "quiz") {
      let tempscore = score;
      if (document.getElementById("albuminp").value.toLowerCase().replace(/[^\w]|_/g, "") === currSong.item.album.name.toLowerCase().replace(/[^\w]|_/g, "") && document.getElementById("albuminp").disabled === false) {
        document.getElementById("albuminp").classList.add("correct");
        document.getElementById("albuminp").disabled = true;
        tempscore++;
        setScore(tempscore);
        if (tempscore > highscore) {
          setHighscore(tempscore)
          localStorage.setItem("highscore", score)
        }
      }
      checkAnswer()
    }
  }, [albuminput])



  useEffect(() => {
    let intervalId;
    let startTime = performance.now() - time;

    if (running) {
      intervalId = setInterval(() => {
        const elapsedTime = performance.now() - startTime;
        setTime(Math.floor(elapsedTime));

        if (elapsedTime >= duration) {
          if (songrepeat === false) {
            clearInterval(intervalId);
            document.getElementById("album").style.opacity = 0;
            document.getElementById("bgimg").style.opacity = 0;
            setTimeout(function () {
              getCurrentSong(token)
            }, 300)
            setTimeout(function () {
              document.getElementById("album").style.opacity = 100;
              document.getElementById("bgimg").style.opacity = 100;
            }, 500)
          }
          else {
            clearInterval(intervalId);
            setTimeout(function () {
              getCurrentSong(token)
            }, 300)
          }

        }
      }, 10);
    } else {
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId);
  }, [running, duration]);

  useEffect(() => {
    const hash = window.location.hash
      .substring(1)
      .split("&")
      .reduce(function (initial, item) {
        if (item) {
          var parts = item.split("=");
          initial[parts[0]] = decodeURIComponent(parts[1]);
        }
        return initial;
      }, {});
    window.location.hash = "";

    let _token = hash.access_token
    if (_token) {
      setToken(_token)
      if (localStorage.getItem("lang")) {
        setLanguage(localStorage.getItem("lang"))
      }
      else {
        localStorage.setItem("lang", "en-US")
      }
      if (localStorage.getItem("vol")) {
        setVolumeP(localStorage.getItem("vol"))
      }
      else {
        localStorage.setItem("vol", 100)
      }
      if (localStorage.getItem("mic")) {
        setMicrophoneP(localStorage.getItem("mic"))
      }
      else {
        localStorage.setItem("mic", "Off")
      }
      if (localStorage.getItem("bg")) {
        setBG(localStorage.getItem("bg"))
      }
      else {
        localStorage.setItem("bg", "normal")
      }
      if (localStorage.getItem("highscore")) {
        setHighscore(localStorage.getItem("highscore"))
      }
      else {
        localStorage.setItem("highscore", 0)
      }
      getCurrentSong(_token)
      InitBG()
      document.body.style.transition = "linear 1s"
      // SpeechRecognition.startListening({
      //   continuous: true,
      //   language: 'en-US'
      // })
    }
  })

  function InitBG() {
    document.body.style.backgroundImage = "url(" + currSong?.item?.album?.images[0].url + ")";
    document.body.style.backgroundSize = "cover";
    document.body.style.animation = "none";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
  }

  useEffect(() => {
    const newProgressWidth = (time / duration) * 100;
    setProgressWidth(newProgressWidth);
  }, [time, duration]);


  useEffect(() => {
    if (token) {
      if (mode === "normal") {
        if (bg === 'normal') {
          document.body.style.backgroundImage = `url(${currSong?.item?.album?.images[0]?.url})`;
        } else if (bg === 'vinyl') {
          document.body.style.backgroundImage = 'radial-gradient(rgb(49, 49, 49), black)';
        }
      }
      else {
        document.body.style.backgroundImage = 'radial-gradient(#09421d, black)';
      }
    }
  }, [bg, token, currSong]);


  const getCurrentSong = async (token) => {
    const currentBG = bg;
    await fetch("https://api.spotify.com/v1/me/player", {
      method: 'GET',
      headers: {
        Authorization: "Bearer " + token,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then(data => {
        //console.log(data);
        setCurrSong({
          item: data.item,
        });
        setTime(data.progress_ms)
        setDuration(data.item.duration_ms + 500)
        setRunning(data.is_playing)
        setShuffle(data.shuffle_state)
        if (data.replay_state === "off") {
          setRepeat(false)
        }
        else if (data.replay_state === "track") {
          setRepeat(true)
        }
        else {
          toggleRepeat(false);
        }

        getLyrics(data)
        if (mode === "normal") {
          if (currentBG === "normal") {
            document.body.style.backgroundImage = "url(" + data.item.album.images[0].url + ")";
          } else if (currentBG === "vinyl") {
            document.body.style.backgroundImage = "radial-gradient(rgb(49, 49, 49), black)";
          }
        }

        if (document.getElementById("album").classList.contains("fadein")) {
          document.getElementById("album").classList.remove("fadein")
        }
      })
      .catch(error => console.error('Error fetching current song:', error))
  }

  useEffect(() => {
    if (lyrics.length > 0) {
      const updatedLyrics = lyrics.map((line) => {
        if (line.startTimeMs <= time && line.startTimeMs != 0) {
          return { ...line, highlighted: true };
        }
        return { ...line, highlighted: false };
      });
      setLyrics(updatedLyrics);
    }
  }, [time]);

  const playSong = () => {
    fetch("https://api.spotify.com/v1/me/player/play", {
      method: 'PUT',
      headers: {
        Authorization: "Bearer " + token
      }
    })
    setRunning(true)
  }

  const pauseSong = () => {
    fetch("https://api.spotify.com/v1/me/player/pause", {
      method: 'PUT',
      headers: {
        Authorization: "Bearer " + token
      }
    })
    setRunning(false)
  }

  const nextSong = async () => {
    await fetch("https://api.spotify.com/v1/me/player/next", {
      method: 'POST',
      headers: {
        Authorization: "Bearer " + token,
        'Content-Type': 'application/json'
      }
    })
      .then((res) => {
        // console.log(res);
      })
      .catch(error => console.error('Error changing song:', error));

    await sleep(500)
    if (songrepeat === false && mode === "normal") {
      document.getElementById("album").style.opacity = 0;
      document.getElementById("bgimg").style.opacity = 0;
      setTimeout(function () {
        getCurrentSong(token)
      }, 300)
      setTimeout(function () {
        document.getElementById("album").style.opacity = 100;
        document.getElementById("bgimg").style.opacity = 100;
      }, 500)
    } else {
      setTimeout(function () {
        getCurrentSong(token)
      }, 300)
    }

    if (mode === "quiz") {
      document.getElementById("albuminp").disabled = false
      document.getElementById("albuminp").value = ""
      document.getElementById("albuminp").classList.remove("correct")
      setAlbum("")

      document.getElementById("artistinp").disabled = false
      document.getElementById("artistinp").value = ""
      document.getElementById("artistinp").classList.remove("correct")
      setArtist("")

      document.getElementById("titleinp").disabled = false
      document.getElementById("titleinp").value = ""
      document.getElementById("titleinp").classList.remove("correct")
      setTitle("")
    }
  }

  const previousSong = async () => {
    await fetch("https://api.spotify.com/v1/me/player/previous", {
      method: 'POST',
      headers: {
        Authorization: "Bearer " + token,
        'Content-Type': 'application/json'
      }
    })
      .then((res) => {
        // console.log(res);
      })
      .catch(error => console.error('Error changing song:', error));

    await sleep(500)

    if (songrepeat === false) {
      document.getElementById("album").style.opacity = 0;
      document.getElementById("bgimg").style.opacity = 0;

      setTimeout(function () {
        document.getElementById("album").style.opacity = 100;
        document.getElementById("bgimg").style.opacity = 100;
      }, 500)
    } else {
      setTimeout(function () {
        getCurrentSong(token)
      }, 300)
    }
  }

  const toggleShuffle = async (mode) => {
    setShuffle(mode);
    await fetch("https://api.spotify.com/v1/me/player/shuffle?state=" + mode, {
      method: 'PUT',
      headers: {
        Authorization: "Bearer " + token,
        'Content-Type': 'application/json'
      },
    })
      .then((res) => {
        // console.log(res);
      })
      .catch(error => console.error('Error changing song:', error));
  }

  const toggleRepeat = async (command) => {
    setRepeat(command);
    var mode;
    if (command === false) {
      mode = "off"
    }
    else if (command === true) {
      mode = "track"
    }
    // console.log(mode)
    await fetch("https://api.spotify.com/v1/me/player/repeat?state=" + mode, {
      method: 'PUT',
      headers: {
        Authorization: "Bearer " + token,
        'Content-Type': 'application/json'
      }
    })
      .then((res) => {
        // console.log(res);
      })
      .catch(error => console.error('Error changing song:', error));
  }

  const setVolume = (number) => {
    fetch("https://api.spotify.com/v1/me/player/volume?volume_percent=" + number.replace("%", ""), {
      method: 'PUT',
      headers: {
        Authorization: "Bearer " + token
      }
    })
    localStorage.setItem("vol", number)
  }

  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const commands = Object.keys(LANGUAGE_MAP).flatMap(language => {
    let playCommand;
    let pauseCommand;
    let nextCommand;
    let previousCommand;
    let shuffleOnCommand;
    let shuffleOffCommand;
    let repeatOnCommand;
    let repeatOffCommand;
    let volumeCommand;
    let logoutCommand;
    let listCommandBtn;
    //let listCommand;
    //let languageCommand;

    if (language === "Engels") {
      playCommand = {
        command: ['play', 'continue', 'start'],
        callback: () => {
          playSong(); resetTranscript(); setLastCommand("Starting Track...");
          //if (englishaudio.is_playing || dutchaudio.is_playing) { englishaudio.pause(); dutchaudio.pause(); englishaudio.currentTime = 0; dutchaudio.currentTime = 0; }
        },
        matchInterim: true
      };
      pauseCommand = {
        command: ['stop', 'pause'],
        callback: () => {
          pauseSong(); resetTranscript(); setLastCommand("Pausing Track...");
          //if (englishaudio.is_playing || dutchaudio.is_playing) { englishaudio.pause(); dutchaudio.pause(); englishaudio.currentTime = 0; dutchaudio.currentTime = 0; }
        },
        matchInterim: true
      };
      nextCommand = {
        command: ['next (song) (track)', 'skip'],
        callback: () => {
          nextSong(); resetTranscript(); setLastCommand("Playing Next Track...");
          // if (englishaudio.is_playing || dutchaudio.is_playing) { englishaudio.pause(); dutchaudio.pause(); englishaudio.currentTime = 0; dutchaudio.currentTime = 0; }
        },
        matchInterim: true
      };
      previousCommand = {
        command: ['previous (song) (track)', 'go back'],
        callback: () => {
          previousSong(); resetTranscript(); setLastCommand("Playing Previous Track...");
          // if (englishaudio.is_playing || dutchaudio.is_playing) { englishaudio.pause(); dutchaudio.pause(); englishaudio.currentTime = 0; dutchaudio.currentTime = 0; }
        },
        matchInterim: true
      };
      shuffleOnCommand = {
        command: ['turn on shuffle', 'enable shuffle', 'shuffle on'],
        callback: () => { toggleShuffle(true); resetTranscript(); setLastCommand("Enabling Shuffle..."); },
        matchInterim: true
      };
      shuffleOffCommand = {
        command: ['turn off shuffle', 'disable shuffle', 'shuffle off'],
        callback: () => { toggleShuffle(false); resetTranscript(); setLastCommand("Disabling Shuffle..."); },
        matchInterim: true
      };
      repeatOnCommand = {
        command: ['turn on repeat', 'enable repeat', 'repeat on', 'repeat (this) song', 'repeat (this) track'],
        callback: () => { toggleRepeat(true); resetTranscript(); setLastCommand("Enabling Repeat..."); },
        matchInterim: true
      };
      repeatOffCommand = {
        command: ['turn off repeat', 'disable repeat', 'repeat off'],
        callback: () => { toggleRepeat(false); resetTranscript(); setLastCommand("Disabling Repeat..."); },
        matchInterim: true
      };
      volumeCommand = {
        command: ['(set) volume :number (percent)'],
        callback: (number) => { setVolume(number); resetTranscript(); setLastCommand("Setting Volume..."); },
      };
      logoutCommand = {
        command: ['logout', 'log out'],
        callback: () => { resetTranscript(); pauseSong(); window.location.reload(); },
      };
      listCommandBtn = {
        command: ['commands'],
        callback: () => { resetTranscript(); showHideCommands(); },
      };
      // listCommand = {
      //   command: ['commands', '*commands*'],
      //   callback: () => { pauseSong(); resetTranscript(); setLastCommand("Listing Commands..."); englishaudio.play(); },
      // };
    }
    else {
      playCommand = {
        command: ['*speel*', '(ga) verder', 'start', 'speel'],
        callback: () => {
          playSong(); resetTranscript(); setLastCommand("Nummer afspelen...");
          //if (englishaudio.is_playing || dutchaudio.is_playing) { englishaudio.pause(); dutchaudio.pause(); englishaudio.currentTime = 0; dutchaudio.currentTime = 0; }
        },
        matchInterim: true
      };
      pauseCommand = {
        command: ['stop', 'pauze', 'pauzeer'],
        callback: () => {
          pauseSong(); resetTranscript(); setLastCommand("Nummer pauzeren...");
          //if (englishaudio.is_playing || dutchaudio.is_playing) { englishaudio.pause(); dutchaudio.pause(); englishaudio.currentTime = 0; dutchaudio.currentTime = 0; }
        },
        matchInterim: true
      };
      nextCommand = {
        command: ['volgend (lied) (nummer)', 'volgende'],
        callback: () => {
          nextSong(); resetTranscript(); setLastCommand("Volgend nummer spelen...");
          //if (englishaudio.is_playing || dutchaudio.is_playing) { englishaudio.pause(); dutchaudio.pause(); englishaudio.currentTime = 0; dutchaudio.currentTime = 0; }
        },
        matchInterim: true
      };
      previousCommand = {
        command: ['vorig (lied) (nummer)', 'vorige', '(ga) terug'],
        callback: () => {
          previousSong(); resetTranscript(); setLastCommand("Vorig nummer spelen...");
          //if (englishaudio.is_playing || dutchaudio.is_playing) { englishaudio.pause(); dutchaudio.pause(); englishaudio.currentTime = 0; dutchaudio.currentTime = 0; }
        },
        matchInterim: true
      };
      shuffleOnCommand = {
        command: ['(zet) shuffle aan'],
        callback: () => { toggleShuffle(true); resetTranscript(); setLastCommand("Shuffle aanzetten..."); },
        matchInterim: true
      };
      shuffleOffCommand = {
        command: ['(zet) shuffle uit'],
        callback: () => { toggleShuffle(false); resetTranscript(); setLastCommand("Shuffle uitzetten..."); },
        matchInterim: true
      };
      repeatOnCommand = {
        command: ['herhaal aan', 'herhalen aan'],
        callback: () => { toggleRepeat(true); resetTranscript(); setLastCommand("Nummer herhalen aan"); },
        matchInterim: true
      };
      repeatOffCommand = {
        command: ['herhaal uit', 'herhalen uit'],
        callback: () => { toggleRepeat(false); resetTranscript(); setLastCommand("Disabling Repeat..."); },
        matchInterim: true
      };
      volumeCommand = {
        command: ['(zet) volume :number (procent)'],
        callback: (number) => { setVolume(number); resetTranscript(); setLastCommand("Volume Aanpassen..."); },
      };
      logoutCommand = {
        command: ['log uit'],
        callback: () => { resetTranscript(); pauseSong(); window.location.reload(); },
      };
      listCommandBtn = {
        command: ["commando's"],
        callback: () => { resetTranscript(); showHideCommands(); },
      };
      // listCommand = {
      //   command: ["commando's", "*commando's*"],
      //   callback: () => { pauseSong(); resetTranscript(); setLastCommand("Listing Commands..."); dutchaudio.play(); },
      // };
    }
    const languageCommand = {
      command: ['(switch to) (wissel naar) ' + language, '*' + language + '*'],
      callback: () => {
        setLanguage(LANGUAGE_MAP[language])
        localStorage.setItem("lang", LANGUAGE_MAP[language])
        if (isListening) {
          SpeechRecognition.startListening({
            continuous: true,
            language: LANGUAGE_MAP[language]
          })
        }
      },
      matchInterim: true
    };
    return [playCommand, pauseCommand, nextCommand, previousCommand, shuffleOnCommand, shuffleOffCommand,
      repeatOnCommand, repeatOffCommand, volumeCommand, logoutCommand, /*listCommand,*/ listCommandBtn, languageCommand];
  });
  const { isMicrophoneAvailable, resetTranscript } = useSpeechRecognition({ commands })

  // if (transcript.length > 0) {
  //   console.log(transcript)
  // }

  async function showHideCommands() {
    document.getElementById("popupbtn").click();
    await sleep(5000);
    document.getElementById("closebtn").click();
  }

  async function setLastCommand(command) {
    document.getElementById("lastcommand").innerHTML = command;
    await sleep(3000);
    document.getElementById("lastcommand").innerHTML = "";
  }

  function setMicrophone(value) {
    if (value === "Off") {
      SpeechRecognition.abortListening();
      setListening(false);
    }
    else {
      SpeechRecognition.startListening({
        continuous: true,
        language: LANGUAGE_MAP[language]
      });
      setListening(true);
    }
    localStorage.setItem("mic", value)
  }

  function refresh() {
    getCurrentSong(token);
  }

  if (!SpeechRecognition.browserSupportsSpeechRecognition) {
    return (<div>
      <label>Your browser is not supported!</label>
    </div>)
  }
  else if (!isMicrophoneAvailable) {
    return (<div>
      <label>Your microphone is disabled!</label>
    </div>)
  }

  // function installPWA() {
  //   //Recognize the install variable from before?
  //   installPrompt.prompt();
  //   document.getElementById("installbtn").hidden = true;
  //   installPrompt.userChoice.then((choiceResult) => {
  //     document.getElementById("installbtn").hidden = true;
  //     if (choiceResult.outcome !== "accepted") {
  //       document.getElementById("installbtn").hidden = false;
  //     }
  //     installPrompt = null;
  //   });
  // }

  // a key map of allowed keys
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    65: 'a',
    66: 'b'
  };

  // the 'official' Konami Code sequence
  var konamiCode = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'];

  // a variable to remember the 'position' the user has reached so far.
  var konamiCodePosition = 0;

  // add keydown event listener
  document.addEventListener('keydown', function (e) {
    // get the value of the key code from the key map
    var key = allowedKeys[e.keyCode];
    // get the value of the required key from the konami code
    var requiredKey = konamiCode[konamiCodePosition];

    // compare the key with the required key
    if (key === requiredKey && !token) {

      // move to the next key in the konami code sequence
      konamiCodePosition++;

      // if the last key is reached, activate cheats
      if (konamiCodePosition === konamiCode.length && !token) {
        activateCheats();
        konamiCodePosition = 0;
      }
    } else {
      konamiCodePosition = 0;
    }
  });

  function getLyrics(song) {
    fetch(
      'https://spotify-lyric-api.herokuapp.com/?url=' +
      song.item.external_urls.spotify,
      {
        method: 'GET',
      }
    )
      .then((response) => response.json())
      .then((data) => {
        //console.log(data)
        if (mode === "normal") {
          if (data.error === false) {
            setFound(true)
            if (data.syncType === "LINE_SYNCED") {
              setSynced(true)
            }
            else {
              setSynced(false)
            }
            const syncedLyrics = data.lines.map((line) => ({
              ...line,
              highlighted: data.syncType === 'LINE_SYNCED' ? false : true,
            }));
            setLyrics(syncedLyrics);
          } else {
            setLyrics([]);
            setFound(false)
            setSynced(false)
          }
        }
        else {
          setLyrics([]);
          setFound(false)
          setSynced(false)
        }
      });
  }

  function disable() {
    document.getElementsByClassName("refreshbtn")[0].disabled = true;
    let og = document.getElementsByClassName("refreshbtn")[0].innerHTML
    document.getElementsByClassName("refreshbtn")[0].innerHTML = "...";
    setTimeout(function () {
      document.getElementsByClassName("refreshbtn")[0].disabled = false
      document.getElementsByClassName("refreshbtn")[0].innerHTML = og
    }, 5000)
  }

  function disablereload() {
    document.getElementById("reloadbtn").disabled = true;
    let og = document.getElementById("reloadbtn").innerHTML
    document.getElementById("reloadbtn").innerHTML = "...";
    setTimeout(function () {
      document.getElementById("reloadbtn").disabled = false
      document.getElementById("reloadbtn").innerHTML = og
    }, 5000)
  }

  function activateCheats() {
    document.getElementById("logo").hidden = false;
    document.getElementById("title").hidden = true;
    document.getElementById("desc").hidden = true;
    document.getElementById("note").hidden = true;
    document.getElementById("viggo").hidden = true;
    document.getElementById("login").innerHTML = "LOG IN WITH SPOTIFY";
    document.getElementById("og").innerHTML = "Made By: <br/> Steijn Ploegmakers & <br/> Viggo Seerden";
    document.body.style.backgroundImage = "linear-gradient(-45deg, #000, #000, #000, #000, #000, #000, #98843d, #000, #000, #000, #000, #000, #000, #000)";
    document.body.style.backgroundSize = "400% 400%";
    document.body.style.animation = "gradient 15s infinite";
  }

  function changeLanguage(lang) {
    setLanguage(lang);
    localStorage.setItem("lang", lang)
  }

  // const formatTime = (ms) => {
  //   const minutes = Math.floor((ms / 60000) % 60);
  //   const seconds = Math.floor((ms / 1000) % 60);
  //   return `${("0" + minutes).slice(-2)}:${("0" + seconds).slice(-2)}`;
  // };

  function toggleBG() {
    setBG((prevBG) => {
      if (prevBG === "normal") {
        localStorage.setItem("bg", "vinyl")
        return "vinyl";
      } else if (prevBG === "vinyl") {
        localStorage.setItem("bg", "normal")
        return "normal";
      }
    });
  }

  function toggleQuiz() {
    setMode((prevMode) => {
      if (prevMode === "normal") {
        if (bg === "vinyl") {
          toggleBG();
        }
        setMicrophone("Off")
        document.body.style.backgroundImage = "radial-gradient(#09421d, black);";
        document.getElementById("lyricbtn").disabled = true
        document.getElementById("repeat").hidden = true
        document.getElementById("shuffle").hidden = true
        document.getElementById("prev").hidden = true
        document.getElementById("mic").disabled = true
        document.getElementById("reloadbtn").disabled = true
        toggleShuffle(true);
        toggleRepeat(true);
        nextSong();
        return "quiz";
      } else if (prevMode === "quiz") {
        document.body.style.backgroundImage = "url(" + currSong.item.album.images[0].url + ")";
        document.getElementById("lyricbtn").disabled = false
        document.getElementById("repeat").hidden = false
        document.getElementById("shuffle").hidden = false
        document.getElementById("prev").hidden = false
        document.getElementById("mic").disabled = false
        document.getElementById("reloadbtn").disabled = false
        toggleRepeat(false);
        return "normal";
      }
    });
  }

  return (
    <div id="bgimagediv">
      <header className="App-header">

        {!token && (
          // <div className='nologincontent'>
          //   <img src={logo} alt="Logo" className='logo' /><br />
          //   <a
          //     className="btn btn--loginApp-link"
          //     href={`${authEndpoint}client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token&show_dialog=true`}
          //   >
          //     <button className="SpotifyBtn">
          //       <img className="SpotifyImg" src={spotify} alt="Spotify Logo" width='40' />
          //       <p>LOG IN WITH SPOTIFY</p>
          //     </button>
          //   </a>
          //   <br />
          //   <br />
          //   <p className='credits'>Originally made by <br /> Steijn Ploegmakers & Viggo Seerden</p>
          //   <br/>
          //   <p className='credits'>Remade by Viggo Seerden</p>
          // </div>
          <div className='nologincontent'>
            <img src={logo} alt="Logo" id="logo" className='logo' hidden /><br />
            <p className='title fadein' id="title">Broadway</p>
            <p className='desc fadein' id="desc">Spotify Voice Controller (V3.0)</p>
            <a
              className="btn btn--loginApp-link fadein"
              href={`${authEndpoint}client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token&show_dialog=true`}
            >
              <button className="SpotifyBtn fadein">
                <img className="SpotifyImg" src={spotify} alt="Spotify Logo" title="Log in with your Spotify account" width='40' />
                <p id="login">Log In</p>
              </button>
            </a>
            <br />
            <br />
            <p className='credits fadein' id="og">Originally made by <br /> Steijn Ploegmakers & Viggo Seerden</p>
            <br />
            <p className='credits fadein' id="viggo">Remade by Viggo Seerden</p>
            <br />
            <p className='credits fadein' id="note">NOTE: Before logging in, you must already have a song playing on Spotify, and have a Premium subscription.</p>
          </div>
        )}
        {token && (
          <div className='content'>
            <div className='container'>
              {currSong ?
                <div>
                  {mode === "normal" ?
                    bg === "normal" ?
                      <div id='bgimg' className='bgimg' hidden>
                        <img hidden src={currSong.item.album.images[0].url} alt="oops" className='bgalbum'></img>
                      </div>
                      :
                      running ?
                        <div id='bgimg' className='bgimg'>
                          <img src={currSong.item.album.images[0].url} alt="oops" className='bgalbum'></img>
                        </div>
                        :
                        <div id='bgimg' className='bgimg' style={{ animationPlayState: 'paused' }}>
                          <img src={currSong.item.album.images[0].url} alt="oops" className='bgalbum'></img>
                        </div>
                    :
                    <div id='bgimg' className='bgimg' hidden>
                    </div>
                  }
                  {mode === "normal" ?
                    <div className='album fadein' title="Switch Background" id="album" {...handlers} onClick={toggleBG}>
                      <img src={currSong.item.album.images[0].url} alt="Album Cover" id="albumcover" className="albumcover" />
                    </div>
                    :
                    <div className='album fadein' title="Switch Background" id="album">
                      <h1>Quiz <br /> Mode</h1>
                    </div>
                  }
                  <div className='controls fadein'>
                    {mode === "normal" ?
                      <div className='info'>
                        <a className='songtitle' title="View Song on Spotify" href={currSong.item.external_urls.spotify} rel="noreferrer" target="_blank">{currSong.item.name}</a>
                        {currSong.item.artists.map((artist, index) => (
                          <span key={index} style={{ display: 'inline-block' }}>
                            <a className='artist' title="View Artist on Spotify" href={artist.external_urls.spotify} rel="noreferrer" target="_blank">{artist.name}{index !== currSong.item.artists.length - 1 && <span>, &nbsp;</span>}</a>
                          </span>
                        ))}
                        <a className='album' title="View Album on Spotify" href={currSong.item.album.external_urls.spotify} rel="noreferrer" target="_blank">{currSong.item.album.name}</a>
                      </div>
                      :
                      <div className='info'>
                        <br />
                        <input type="text" autoComplete="off" placeholder='Song Title' id="titleinp" onChange={(val) => setTitle(val.target.value)} /> <br />
                        <input type="text" autoComplete='off' placeholder='Artist' id="artistinp" onChange={(val) => setArtist(val.target.value)} /> <br />
                        <input type="text" autoComplete='off' placeholder='Album' id="albuminp" onChange={(val) => setAlbum(val.target.value)} />
                      </div>
                    }
                    <br />
                    {mode === "normal" &&
                      <div className="audio-progress-bar-container">
                        <span>{("0" + Math.floor((time / 60000) % 60)).slice(-2)}:{("0" + Math.floor((time / 1000) % 60)).slice(-2)}</span>
                        <div className="audio-progress-bar">
                          <div className="progress-bar-background" />
                          <div className="progress-bar" style={{ width: `${progressWidth}%` }} />
                        </div>
                        <span>{("0" + Math.floor((duration / 60000) % 60)).slice(-2)}:{("0" + Math.floor(((duration - 500) / 1000) % 60)).slice(-2)}</span>
                      </div>
                    }
                    <div>
                      {shuffle ?
                        <button id="shuffle" className="controlbtn" title="Disable Shuffle" onClick={() => toggleShuffle(false)}><FontAwesomeIcon icon={faShuffle} color="#1BD760" /></button>
                        :
                        <button id="shuffle" className="controlbtn" title="Enable Shuffle" onClick={() => toggleShuffle(true)}><FontAwesomeIcon icon={faShuffle} color="white" /></button>
                      }

                      <button className="controlbtn" title="Previous Song" id="prev" onClick={previousSong}><FontAwesomeIcon icon={faBackward} color="white" /></button>
                      {running ?
                        <button className="controlbtn" title="Pause" onClick={pauseSong}><FontAwesomeIcon icon={faPause} color="white" /></button>
                        :
                        <button className="controlbtn" title="Play" onClick={playSong}><FontAwesomeIcon icon={faPlay} color="white" /></button>
                      }
                      <button className="controlbtn" title="Next Song" onClick={nextSong}><FontAwesomeIcon icon={faForward} color="white" /></button>

                      {songrepeat ?
                        <button id="repeat" className="controlbtn" title="Disable Repeat" onClick={() => toggleRepeat(false)}><FontAwesomeIcon icon={faRepeat} color="#1BD760" /></button>
                        :
                        <button id="repeat" className="controlbtn" title="Enable Repeat" onClick={() => toggleRepeat(true)}><FontAwesomeIcon icon={faRepeat} color="white" /></button>
                      }
                    </div>
                    <br />
                    <div className='miscsettings'>
                      <span className='seperator'>
                        <FontAwesomeIcon className='miscoption' icon={faLanguage} />
                        <select className='select' defaultValue={language} title="Change Language" onChange={(val) => { changeLanguage(val.target.value) }}>
                          <option value="en-US">EN</option>
                          <option value="nl-NL">NL</option>
                        </select>
                      </span>
                      {window.screen.width < 300 &&
                        <br />
                      }
                      <span className='smallseperator'>
                        <FontAwesomeIcon className='miscoption' icon={faVolumeHigh} />
                        <select className='select' defaultValue={volume} title="Set Volume Level" onChange={(val) => setVolume(val.target.value)}>
                          <option value="100">100</option>
                          <option value="90">90</option>
                          <option value="80">80</option>
                          <option value="70">70</option>
                          <option value="60">60</option>
                          <option value="50">50</option>
                          <option value="40">40</option>
                          <option value="30">30</option>
                          <option value="20">20</option>
                          <option value="10">10</option>
                          <option value="0">0</option>
                        </select>
                      </span>
                      <span className='smallseperator'>
                        <FontAwesomeIcon className='miscoption' icon={faMicrophone} />
                        <select className='select' defaultValue={microphone} title="Toggle Microphone" id="mic" onChange={(val) => setMicrophone(val.target.value)}>
                          <option value="Off">Off</option>
                          <option value="On">On</option>
                        </select>
                      </span>
                      <span className='smallseperator'>
                        <FontAwesomeIcon className='miscoption' icon={faQuestion} />
                        <select className='select' defaultValue="Off" title="Toggle Quiz Mode" onChange={toggleQuiz}>
                          <option value="Off">Off</option>
                          <option value="On">On</option>
                        </select>
                      </span>
                    </div>
                    {language === "en-US" ?
                      <>
                        <Popup trigger={<button className="popupbtn" title="View Lyrics" id="lyricbtn">Lyrics</button>} modal nested>
                          {close => (
                            <div className="modal">
                              <button className="close" id="closebtn" onClick={close}>
                                &times;
                              </button>
                              {lyricsfound ?
                                synced ?
                                  <div className="header">Lyrics (Synced)<br />
                                    <button title="Refresh Lyrics (sometimes they don't update lol)"
                                      className="refreshbtn" onClick={() => { getLyrics(currSong); disable() }}>Refresh</button>
                                  </div>
                                  :
                                  <div className="header">Lyrics (Not Synced)<br />
                                    <span><button title="Refresh Lyrics (sometimes they don't update lol)"
                                      className="refreshbtn" onClick={() => { getLyrics(currSong); disable() }}>Refresh</button></span>
                                  </div>

                                :
                                <div className="header">No lyrics were found for this song.<br />
                                  <span><button title="Refresh Lyrics (sometimes they don't update lol)"
                                    className="refreshbtn" onClick={() => { getLyrics(currSong); disable() }}>Refresh</button></span>
                                </div>
                              }
                              <div className="lyricscontent">
                                <p>
                                  {lyrics.map((line, index) => (
                                    <React.Fragment key={index}>
                                      <span
                                        style={{ color: line.highlighted ? '#1ed760' : 'inherit' }}
                                      >
                                        {line.words}
                                      </span>
                                      <br /> {/* Add line break after each line */}
                                    </React.Fragment>
                                  ))}
                                </p>
                              </div>
                            </div>
                          )}
                        </Popup>
                        <span className='smallseperator' />
                        <Popup trigger={<button title="Learn how to use this site" className="popupbtn" id="popupbtn">Help & Info</button>} modal nested>
                          {close => (
                            <div className="modal">
                              <button className="close" id="closebtn" onClick={close}>
                                &times;
                              </button>
                              <div className="header"> Help & Information </div>
                              <div className="commandcontent">
                                <h2>General Use</h2>

                                The white buttons in the middle allow you to control your Spotify session in the same way you would in the official Spotify app.
                                The four options shown below those buttons allow you to do the following: <br />
                                - Language: Switch between the English (Engels) and Dutch (Nederlands) languages <br />
                                - Volume: Change Spotify's playback volume (Only works when using with a desktop Spotify session) <br />
                                - Microphone: Use your devices' microphone for use with voice commands. This requires permission. <br />
                                - Quiz Mode: Play or quit playing Quiz Mode. More on Quiz Mode can be found below. <br /> <br />
                                Lyrics are available by pressing the corresponding button. Songs with synced lyrics on Spotify will also be synced here. <br />
                                Furthermore, tapping or clicking on the album cover toggles between two different backgrounds. <br />
                                And Finally, logging out happens automatically, but the app will still be linked to your Spotify account. More on this below.

                                <h2>Voice Commands</h2>

                                Saying these commands into the microphone will have the following effects: <br />
                                - Play/Start/Continue: Start or resume playback <br />
                                - Pause/Stop: Pause playback <br />
                                - Next/Skip: Play next song in queue <br />
                                - Previous/Back: Play previous song in queue <br />
                                - Shuffle On/Enable Shuffle: Turn on shuffle <br />
                                - Shuffle Off/Disable Shuffle: Turn off shuffle <br />
                                - Repeat On/Enable Repeat: Turn on repeat <br />
                                - Repeat Off/Disable Repeat: Turn off repeat <br />
                                - Volume + a number from 1-100: Set audio volume <br />
                                - Dutch: Switch text and command language to Dutch <br />
                                - Logout: Disconnect Spotify/Return to homepage <br />

                                <h2>Quiz Mode</h2>

                                Quiz Mode removes most playback controls and all information about the song from the interface, and presents you with a challenge to enter
                                the current songs name, album name, and (one of) the artists name(s). You get a point for each one you get correct. If you get all three correct,
                                you get an extra fourth point and the next song will be played. Shuffle and Repeat are automatically turned on. If you can't get all three answers,
                                the song repeats itself until you get all three answers, skip to the next song, or exit Quiz Mode. Your score and high score are displayed under the song controls.
                                Have fun!

                                <h2>Data Usage</h2>

                                The language, volume, and microphone settings, as well as the chosen background and Quiz Mode high score, are saved in local storage. <br /> <br />
                                If you no longer want this app to be able to access your Spotify account, you can remove access to it on Spotify's app or website when logged in.

                                <h2>Known Bugs</h2>

                                - New song information is sometimes not automatically updated when a song ends. Press the refresh button to reload the information. <br/>
                                - Lyrics sometimes don't automatically get updated when the song switches. There's a refresh button in the lyrics tab to retry this. <br/>
                                - If you had the Vinyl background selected prior to entering Quiz Mode, it will be reverted back to the normal background upon exit. You can manually
                                fix this by tapping on the album cover.

                              </div>
                            </div>
                          )}
                        </Popup>
                        <span className='smallseperator' />
                        <button className='popupbtn' id="reloadbtn" title="Log Out With Spotify" onClick={() => { refresh(); disablereload() }}>Refresh</button>
                      </>
                      :
                      <>
                        <Popup trigger={<button className="popupbtn" title="Song Teksten Bekijken" id="lyricbtn">Song Tekst</button>} modal nested>
                          {close => (
                            <div className="modal">
                              <button className="close" id="closebtn" onClick={close}>
                                &times;
                              </button>
                              {lyricsfound ?
                                synced ?
                                  <div className="header">Song Tekst (Gesynchroniseerd)<br />
                                    <button title="Song Teksten Verversen (soms worden ze niet geupdate lol)" className="refreshbtn"
                                      onClick={() => { getLyrics(currSong); disable() }}>Verversen</button>
                                  </div>
                                  :
                                  <div className="header">Song Tekst (Niet Gesynchroniseerd)<br />
                                    <span><button title="Song Teksten Verversen (soms worden ze niet geupdate lol)" className="refreshbtn"
                                      onClick={() => { getLyrics(currSong); disable() }}>Verversen</button></span>
                                  </div>

                                :
                                <div className="header">Geen teksten gevonden voor dit lied.<br />
                                  <span><button title="Song Teksten Verversen (soms worden ze niet geupdate lol)" className="refreshbtn"
                                    onClick={() => { getLyrics(currSong); disable() }}>Verversen</button></span>
                                </div>
                              }
                              <div className="lyricscontent">
                                <p>
                                  {lyrics.map((line, index) => (
                                    <React.Fragment key={index}>
                                      <span
                                        style={{ color: line.highlighted ? '#1ed760' : 'inherit' }}
                                      >
                                        {line.words}
                                      </span>
                                      <br /> {/* Add line break after each line */}
                                    </React.Fragment>
                                  ))}
                                </p>
                              </div>
                            </div>
                          )}
                        </Popup>
                        <span className='smallseperator' />
                        <Popup trigger={<button title="Leren hoe je de site gebruikt" className="popupbtn" id="popupbtn"> Hulp & Info </button>} modal nested>
                          {close => (
                            <div className="modal">
                              <button className="close" id="closebtn" onClick={close}>
                                &times;
                              </button>
                              <div className="header"> Hulp & Informatie </div>
                              <div className="commandcontent">
                                <h2>Algemeen Gebruik</h2>

                                De witte knoppen bieden je dezelfde playback control mogelijkheden die Spotify je zou geven.
                                The vier opties daar beneden bieden je de volgende opties: <br />
                                - Taal: Wissel tussen de Engelse (English) en Nederlandse (Dutch) talen. <br />
                                - Volume: Verander het volume van Spotify (Werkt alleen voor een desktop Spotify sessie) <br />
                                - Microfoon: Gebruik de microfoon van je apparaat om Spotify te besturen. Geef hiervoor toestemming. <br />
                                - Quiz Modus: Speel de Quiz Modus. Meer hierover verder onderaan. <br /> <br />
                                Song teksten zijn beschikbaar door op de knop van dezelfde naam te drukken. Gesynchoniseerde teksten zijn ook beschikbaar als dit op Spotify ook zo is. <br />
                                Verder kan je nog de achtergrond veranderen door op de cover van het album te drukken. <br />
                                En als laatste, mocht je willen uitloggen, gebeurt dit automatisch bij afsluiten. De app heeft wel nog toegang tot je Spotify account. Meer hierover onderaan.

                                <h2>Stem Commando's</h2>

                                Spreek de volgende commando's in de microfoon van je apparaat voor de volgende effecten: <br />
                                - Speel/Start: Begin of ga verder met spelen <br />
                                - Pauzeer/Stop: Pauzeer audio <br />
                                - Volgende: Speel volgend nummer <br />
                                - Vorige/Terug: Speel vorig nummer <br />
                                - Shuffle Aan: Zet shuffle aan <br />
                                - Shuffle Uit: Zet shuffle uit <br />
                                - Herhalen aan: Zet herhalen aan <br />
                                - Herhalen uit: Zet herhalen uit <br />
                                - Volume + nummer van 1-100: Audio volume instellen <br />
                                - Engels: Wissel tekst en commando taal naar Engels <br />
                                - Log uit: Uitloggen van Spotify/Terug naar de homepagina <br />

                                <h2>Quiz Modus</h2>

                                Quiz Modus verstopt de meeste playback control opties en alle informatie over het huidige lied, waarbij je wordt uitgedaagd om de naam, album naam, en
                                een naam van een van de artiesten in te vullen. Je krijgt een punt voor elke die je goed hebt. Mocht je ze alle drie goed hebben, krijg je een
                                extra vierde punt en wordt het volgende nummer afgespeeld. Shuffle en Repeat worden hiervoor automatisch aangezet. Als je niet alle drie de antwoorden goed
                                kan krijgen, blijft het lied spelen totdat je ze wel goed hebt, je het huidige lied overslaat, of stopt met de Quiz Modus.Je huidige- en beste score worden
                                onderaan het scherm weergeven. Veel plezier!

                                <h2>Data Gebruik</h2>

                                De gekozen taal, volume en microfoon opties worden opgeslagen voor de volgende keer. Ook worden je gekozen achtergrond en beste Quiz Modus score opgeslagen. <br /> <br />
                                Als je niet meer wilt dat deze site toegang heeft tot je Spotify account, kan je deze toegang verwijderen in je Spotify account instellingen in de Spotify app of
                                op de Spotify website.

                                <h2>Bekende Bugs</h2>

                                - Informatie over het huidige lied wordt niet altijd automatisch opgehaald wanneer het vorige lied afloopt. Druk op de ververs knop om dit opnieuw te proberen. <br />
                                - Song teksten worden soms niet geupdatet wanneer het lied wisselt. Hiervoor is ook een ververs knop. Deze is te vinden in het Song Teksten menu. <br/>
                                - Als je de Vinyl achtergrond geselecteerd had voordat je de Quiz Modus gaat spelen, wordt deze bij het stoppen van Quiz Modus terug gezet naar de normale achtergrond.
                                Dit kan je zelf weer terug naar de Vinyl achtergrond zetten door op de album cover te drukken.

                              </div>
                            </div>
                          )}
                        </Popup>
                        <span className='smallseperator' />
                        <button className='popupbtn' id="reloadbtn" title="Uitloggen Met Spotify" onClick={() => { refresh(); disablereload() }}>Verversen</button>
                      </>
                    }

                    <br />
                    <div className='spotifycredit'>
                      {mode === "normal" ?
                        language === "en-US" ?

                          <p>(All song information provided by <a href="https://open.spotify.com" title="Open Spotify" rel="noreferrer" target="_blank">Spotify</a>)</p>

                          :

                          <p>(Alle muziek informatie komt van <a href="https://open.spotify.com" rel="noreferrer" title="Spotify Openen" target="_blank">Spotify</a>)</p>

                        :

                        language === "en-US" ?
                          <span>
                            <label>Current Score: {score}</label>
                            <span className='seperator'></span>
                            <span className='seperator'></span>
                            <span className='seperator'></span>
                            <label>High Score: {highscore}</label>
                          </span>

                          :

                          <span>
                            <label>Huidige Score: {score}</label>
                            <span className='seperator'></span>
                            <span className='seperator'></span>
                            <span className='seperator'></span>
                            <label>Beste Score: {highscore}</label>
                          </span>
                      }
                    </div>
                    <br />
                    <p id="lastcommand" hidden></p>


                  </div>

                </div>
                :
                <div className='errorcontent'>
                  <h2>Oops, something went wrong.</h2>
                  <p>Make sure that you have opened Spotify on this device and have a song already playing. 
                    Also make sure you have a Spotify Premium subscription. <br /> <br />
                    Please refresh this page to try logging in again. <br /> <br />
                    If this problem persists, please try again later.
                  </p>
                </div>}
            </div>
          </div>
        )}
        {/* <button hidden id="installbtn" className='installbtn' onClick={installPWA}><FontAwesomeIcon icon={faCircleArrowDown} /> INSTALL PWA</button> */}
      </header>
    </div>
  );
}

export default EN;