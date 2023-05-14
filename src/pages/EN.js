import { useEffect, useState, useRef, useCallback } from 'react'
import logo from './photos/logo2.png'
import spotify from './photos/spotify.png'
import './css/broadway.css'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { faPlay, faPause, faForward, faBackward, faShuffle, faRepeat, faCircleArrowDown, faMicrophone, faMicrophoneSlash, faLanguage, faVolumeHigh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NoSleep from 'nosleep.js';
import Popup from 'reactjs-popup';
// import englishcommands from './audio/englishcommands.mp3'
// import dutchcommands from './audio/dutchcommands.mp3'

const nosleep = new NoSleep();
nosleep.enable();

const LANGUAGE_MAP = {
  'Engels': 'en-US',
  'Dutch': 'nl-NL'
}

/*
  TO DO:
  - Command list
  - Conversations with app
  - Warning user about upcoming siren wielding vehicles
  - Traffic Information and similar shit?????????
  - 
*/

function EN() {

  let installPrompt; //Variable to store the install action in
  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault(); //Prevent the event (this prevents the default bar to show up)
      installPrompt = event; //Install event is stored for triggering it later

      document.getElementById("installbtn").hidden = false;
    });
  });

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
  let [lyrics, setLyrics] = useState();

  const [time, setTime] = useState();
  const [running, setRunning] = useState();
  const [duration, setDuration] = useState();

  const [progressWidth, setProgressWidth] = useState(0);

  const [shuffle, setShuffle] = useState();
  const [songrepeat, setRepeat] = useState();

  const [isListening, setListening] = useState(false);

  const [language, setLanguage] = useState("en-US");
  const [volume, setVolumeIndicator] = useState();

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);

    } else if (!running) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (time >= duration) {
      getCurrentSong(token);
    }
  })

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
      getCurrentSong(_token)
      document.body.style.transition = "linear 1s"
      // SpeechRecognition.startListening({
      //   continuous: true,
      //   language: 'en-US'
      // })
    }
  })

  useEffect(() => {
    const newProgressWidth = (time / duration) * 100;
    setProgressWidth(newProgressWidth);
  }, [time, duration]);

  const getCurrentSong = async (token) => {
    await fetch("https://api.spotify.com/v1/me/player", {
      method: 'GET',
      headers: {
        Authorization: "Bearer " + token,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then(data => {
        // console.log(data);
        setCurrSong({
          item: data.item,
        });
        setTime(data.progress_ms)
        GetLyrics(data)
        setDuration(data.item.duration_ms + 100)
        setRunning(data.is_playing)
        setShuffle(data.shuffle_state)
        setVolumeIndicator(data.device.volume_percent)
        if (data.replay_state === "off") {
          setRepeat(false)
        }
        else if (data.replay_state === "track") {
          setRepeat(true)
        }
        else {
          toggleRepeat(false);
        }

        document.body.style.backgroundImage = "url(" + data.item.album.images[0].url + ")";
        document.body.style.backgroundSize = "cover";
        document.body.style.animation = "none";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";
        document.getElementById('bgimagediv').classList.add("pagecontent");
      })
      .catch(error => console.error('Error fetching current song:', error))
  }

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
    getCurrentSong(token)
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
    getCurrentSong(token)
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
    setVolumeIndicator(number.replace("%", ""));
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
  const { transcript, isMicrophoneAvailable, resetTranscript } = useSpeechRecognition({ commands })

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
    if (value == "Off") {
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
  }

  function logOut() {
    window.location.reload();
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

  function installPWA() {
    //Recognize the install variable from before?
    installPrompt.prompt();
    document.getElementById("installbtn").hidden = true;
    installPrompt.userChoice.then((choiceResult) => {
      document.getElementById("installbtn").hidden = true;
      if (choiceResult.outcome !== "accepted") {
        document.getElementById("installbtn").hidden = false;
      }
      installPrompt = null;
    });
  }

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
    if (key == requiredKey && !token) {

      // move to the next key in the konami code sequence
      konamiCodePosition++;

      // if the last key is reached, activate cheats
      if (konamiCodePosition == konamiCode.length && !token) {
        activateCheats();
        konamiCodePosition = 0;
      }
    } else {
      konamiCodePosition = 0;
    }
  });

  function GetLyrics(song) {
    fetch("https://spotify-lyric-api.herokuapp.com/?url=" + song.item.external_urls.spotify, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then(data => {
        // console.log(data);
        let fullLyrics = "";
        for (let i = 0; i < data.lines.length; i++) {
          fullLyrics = fullLyrics + data.lines[i].words + "\n";
        }
        // console.log(fullLyrics)
        setLyrics(fullLyrics)
      })
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
            <p className='title' id="title">Broadway</p>
            <p className='desc' id="desc">Spotify Voice Controller</p>
            <a
              className="btn btn--loginApp-link"
              href={`${authEndpoint}client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token&show_dialog=true`}
            >
              <button className="SpotifyBtn">
                <img className="SpotifyImg" src={spotify} alt="Spotify Logo" width='40' />
                <p id="login">Log In</p>
              </button>
            </a>
            <br />
            <br />
            <p className='credits' id="og">Originally made by <br /> Steijn Ploegmakers & Viggo Seerden</p>
            <br />
            <p className='credits' id="viggo">Remade by Viggo Seerden</p>
            <br />
            <p className='credits' id="note">NOTE: Before logging in, you must already have a song playing on Spotify.</p>
          </div>
        )}
        {token && (<div className='container'>
          {currSong ?
            <div>
              <div className='album'>
                <img src={currSong.item.album.images[0].url} alt="Album Cover" className="albumcover" />
              </div>
              <div className='controls'>
                <div className='info'>
                  <p className='songtitle'>{currSong.item.name}</p>
                  <p>{currSong.item.artists[0].name}</p>
                  <p>{currSong.item.album.name}</p>
                </div>
                <br />
                <div className="audio-progress-bar-container">
                  <span>{("0" + Math.floor((time / 60000) % 60)).slice(-2)}:{("0" + Math.floor((time / 1000) % 60)).slice(-2)}</span>
                  <div className="audio-progress-bar">
                    <div className="progress-bar-background" />
                    <div className="progress-bar" style={{ width: `${progressWidth}%` }} />
                  </div>
                  <span>{("0" + Math.floor((duration / 60000) % 60)).slice(-2)}:{("0" + Math.floor((duration / 1000) % 60)).slice(-2)}</span>
                </div>
                <div>
                  {shuffle ?
                    <button id="shuffle" className="controlbtn" title="Disable Shuffle" onClick={() => toggleShuffle(false)}><FontAwesomeIcon icon={faShuffle} color="#1BD760" /></button>
                    :
                    <button id="shuffle" className="controlbtn" title="Enable Shuffle" onClick={() => toggleShuffle(true)}><FontAwesomeIcon icon={faShuffle} color="white" /></button>
                  }

                  <button className="controlbtn" title="Previous Song" onClick={previousSong}><FontAwesomeIcon icon={faBackward} color="white" /></button>
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
                    <select className='select' title="Change Language" onChange={(val) => setLanguage(val.target.value)}>
                      <option value="en-US">English</option>
                      <option value="nl-NL">Nederlands</option>
                    </select>
                  </span>
                  {window.screen.width < 300 &&
                    <br />
                  }
                  <span className='seperator'>
                    <FontAwesomeIcon className='miscoption' icon={faVolumeHigh} />
                    <select className='select' title="Set Volume Level" onChange={(val) => setVolume(val.target.value)}>
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
                  <span className='seperator'>
                    <FontAwesomeIcon className='miscoption' icon={faMicrophone} />
                    <select className='select' title="Toggle Microphone" onChange={(val) => setMicrophone(val.target.value)}>
                      <option value="Off">Off</option>
                      <option value="On">On</option>
                    </select>
                  </span>
                </div>
                {language === "en-US" ?
                  <>
                  <Popup trigger={<button className="popupbtn" title="View Lyrics" id="popupbtn">Lyrics</button>} modal nested>
                    {close => (
                      <div className="modal">
                        <button className="close" id="closebtn" onClick={close}>
                          &times;
                        </button>
                        <div className="header"> Lyrics </div>
                        <div className="lyricscontent">
                          <p style={{whiteSpace: "pre-wrap"}}>{lyrics}</p>
                        </div>
                      </div>
                    )}
                  </Popup>
                  <span className='smallseperator' />
                    <Popup trigger={<button className="popupbtn" id="popupbtn">Commands</button>} modal nested>
                      {close => (
                        <div className="modal">
                          <button className="close" id="closebtn" onClick={close}>
                            &times;
                          </button>
                          <div className="header"> Voice Commands </div>
                          <div className="commandcontent">
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
                          </div>
                        </div>
                      )}
                    </Popup>
                    <span className='smallseperator' />
                    <button className='popupbtn' onClick={logOut}>Log Out</button>
                  </>
                  :
                  <>
                  <Popup trigger={<button className="popupbtn" title="View Lyrics" id="popupbtn">Song Tekst</button>} modal nested>
                    {close => (
                      <div className="modal">
                        <button className="close" id="closebtn" onClick={close}>
                          &times;
                        </button>
                        <div className="header"> Song Tekst </div>
                        <div className="lyricscontent">
                          <p style={{whiteSpace: "pre-wrap"}}>{lyrics}</p>
                        </div>
                      </div>
                    )}
                  </Popup>
                  <span className='smallseperator' />
                    <Popup trigger={<button className="popupbtn" id="popupbtn"> Commando's </button>} modal nested>
                      {close => (
                        <div className="modal">
                          <button className="close" id="closebtn" onClick={close}>
                            &times;
                          </button>
                          <div className="header"> Stem Commando's </div>
                          <div className="commandcontent">
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
                          </div>
                        </div>
                      )}
                    </Popup>
                    <span className='smallseperator' />
                    <button className='popupbtn' onClick={logOut}>Uitloggen</button>
                  </>
                }

                <br />
                <p id="lastcommand"></p>
                {/* {running ?
              <p>is running</p>
              :
              <p>is not running</p>} */}
                {/* <p>{transcript}</p> */}

              </div>

            </div>
            :
            <>
              <h4>Oops, something went wrong.</h4>
              <p>Make sure that you have opened Spotify on this device and have a song already playing. Please refresh this page to try logging in again.</p>
            </>}
        </div>
        )}
        {/* <button hidden id="installbtn" className='installbtn' onClick={installPWA}><FontAwesomeIcon icon={faCircleArrowDown} /> INSTALL PWA</button> */}
      </header>
    </div>
  );
}

export default EN;