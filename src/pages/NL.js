import { useEffect, useState } from 'react'
import logo from './photos/logo2.png'
import spotify from './photos/spotify.png'
import './css/broadway.css'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { faPlay, faPause, faForward, faBackward, faShuffle, faRepeat } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NoSleep from 'nosleep.js';

const nosleep = new NoSleep();
nosleep.enable();



function Test() {

  const authEndpoint = "https://accounts.spotify.com/authorize/?"

  const clientId = "c12a19b4c59744a797e50a4c058b753e"
  //const redirectUri = "https://i491216.hera.fhict.nl"
  const redirectUri = "https://localhost:3000"
  const scopes = [
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-modify-playback-state',
  ]

  let [token, setToken] = useState()
  let [currSong, setCurrSong] = useState();

  const [time, setTime] = useState();
  const [running, setRunning] = useState();
  const [duration, setDuration] = useState();

  const [shuffle, setShuffle] = useState();
  const [repeat, setRepeat] = useState();



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
      }
  }, [])


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
        console.log(data);
        setCurrSong({
          item: data.item,
        });
        console.log(data.item.duration_ms)
        setTime(data.progress_ms)
        setDuration(data.item.duration_ms)
        console.log(data.is_playing)
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

        document.body.style.backgroundImage = "url(" + data.item.album.images[0].url + ")";
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
        console.log(res);
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
        console.log(res);
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
        console.log(res);
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
    console.log(mode)
    await fetch("https://api.spotify.com/v1/me/player/repeat?state=" + mode, {
      method: 'PUT',
      headers: {
        Authorization: "Bearer " + token,
        'Content-Type': 'application/json'
      }
    })
      .then((res) => {
        console.log(res);
      })
      .catch(error => console.error('Error changing song:', error));
  }



  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  SpeechRecognition.startListening({ continuous: true, language: "nl-NL" });
  const commands = [
    {
      command: ['wissel naar engels'],
      callback: () => { resetTranscript(); setLastCommand("Switching language to Dutch..."); SwitchToEnglish(); },
      matchInterim: true
    },
    {
      command: ['speel', '(ga) verder', 'start'],
      callback: () => { playSong(); resetTranscript(); setLastCommand("Nummer afspelen...") },
      matchInterim: true
    },
    {
      command: ['stop', 'pauze', 'pauzeer'],
      callback: () => { pauseSong(); resetTranscript(); setLastCommand("Nummer pauzeren...") },
      matchInterim: true
    },
    {
      command: ['volgend (lied) (nummer)', 'volgende'],
      callback: () => { nextSong(); resetTranscript(); setLastCommand("Volgend nummer spelen...") },
      matchInterim: true
    },
    {
      command: ['vorig (lied) (nummer)', 'vorige', '(ga) terug'],
      callback: () => { previousSong(); resetTranscript(); setLastCommand("Vorig nummer spelen...") },
      matchInterim: true
    },
    {
      command: ['(zet) shuffle aan'],
      callback: () => { toggleShuffle(true); resetTranscript(); setLastCommand("Shuffle aanzetten..."); },
      matchInterim: true
    },
    {
      command: ['(zet) shuffle uit'],
      callback: () => { toggleShuffle(false); resetTranscript(); setLastCommand("Shuffle uitzetten..."); },
      matchInterim: true
    },
    {
      command: ['herhaal aan', 'herhalen aan'],
      callback: () => { toggleRepeat(true); resetTranscript(); setLastCommand("Nummer herhalen aan"); },
      matchInterim: true
    },
    {
      command: ['herhaal uit', 'herhalen uit'],
      callback: () => { toggleRepeat(false); resetTranscript(); setLastCommand("Disabling Repeat..."); },
      matchInterim: true
    },
    // {
    //     command: ['volume up', 'volume higher', '*volume up*', '*volume higher*'],
    //     callback: () =>  { setDisplay("Volume Up"); resetTranscript() },
    //     matchInterim: true
    // },
    // {
    //     command: ['volume down', 'volume lower', '*volume down*', '*volume lower*'],
    //     callback: () =>  { setDisplay("Volume Down"); resetTranscript() },
    //     matchInterim: true
    // }
  ]
  const { transcript, isMicrophoneAvailable, resetTranscript } = useSpeechRecognition({ commands })
  if (transcript.length > 0) {
    console.log(transcript)
  }

  async function setLastCommand(command) {
    document.getElementById("lastcommand").innerHTML = command;
    await sleep(3000);
    document.getElementById("lastcommand").innerHTML = "";
  }

  if (!SpeechRecognition.browserSupportsSpeechRecognition) {
    return (<div>
      <label>Je browser ondersteunt geen spraak herkenning!</label>
    </div>)
  }
  else if (!isMicrophoneAvailable) {
    return (<div>
      <label>Je microfoon staat uit!</label>
    </div>)
  }

  function SwitchToEnglish() {
    SpeechRecognition.startListening({
      continuous: true,
      language: 'en-US'
    })
  }

  return (
    <div className="pagecontent" id="bgimagediv">
      <header className="App-header">
        <img src={logo} alt="Logo" className='logo' /><br />
        {!token && (
          <div className='nologincontent'>
            <a
              className="btn btn--loginApp-link"
              href={`${authEndpoint}client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token&show_dialog=true`}
            >
              <button className="SpotifyBtn">
                <img className="SpotifyImg" src={spotify} alt="Spotify Logo" width='40' />
                <p>CONNECT WITH SPOTIFY</p>
              </button>
            </a>
          </div>
        )}
        {token && (<div className='container'>
          {currSong ? <>
            <img src={currSong.item.album.images[0].url} alt="Album Cover" width="25%" height="25%" className="albumcover" />
            <h3>{currSong.item.name}</h3>
            <p>{currSong.item.artists[0].name}</p>
            <br />
            <div>
              <button className="controlbtn" onClick={previousSong}><FontAwesomeIcon className="fa-2x" icon={faBackward} color="white" /></button>
              {running ?
                <button className="controlbtn" onClick={pauseSong}><FontAwesomeIcon className="fa-2x" icon={faPause} color="white" /></button>
                :
                <button className="controlbtn" onClick={playSong}><FontAwesomeIcon className="fa-2x" icon={faPlay} color="white" /></button>
              }
              <button className="controlbtn" onClick={nextSong}><FontAwesomeIcon className="fa-2x" icon={faForward} color="white" /></button>
            </div>
            <br />
            <div>
              {repeat ?
                <button id="repeat" className="controlbtn" onClick={() => toggleRepeat(false)}><FontAwesomeIcon className="fa-2x" icon={faRepeat} color="green" /></button>
                :
                <button id="repeat" className="controlbtn" onClick={() => toggleRepeat(true)}><FontAwesomeIcon className="fa-2x" icon={faRepeat} color="white" /></button>
              }

              {shuffle ?
                <button id="shuffle" className="controlbtn" onClick={() => toggleShuffle(false)}><FontAwesomeIcon className="fa-2x" icon={faShuffle} color="green" /></button>
                :
                <button id="shuffle" className="controlbtn" onClick={() => toggleShuffle(true)}><FontAwesomeIcon className="fa-2x" icon={faShuffle} color="white" /></button>
              }

            </div>
            <br />
            <span>{("0" + Math.floor((time / 60000) % 60)).slice(-2)}:</span>
            <span>{("0" + Math.floor((time / 1000) % 60)).slice(-2)}</span>
            <br />
            <br />
            <p id="lastcommand"></p>
            {/* {running ?
              <p>is running</p>
              :
              <p>is not running</p>} */}
            {/* <p>{transcript}</p> */}
          </>
            :
            <>
              <h4>Oops, something went wrong.</h4>
              <p>Make sure that you have opened Spotify on your device and have started a playlist! Refresh this page to try logging in again.</p>
            </>}
        </div>
        )}
      </header>
    </div>
  );
}

export default Test;