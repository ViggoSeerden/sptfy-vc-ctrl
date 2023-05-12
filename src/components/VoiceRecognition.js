import React, { Component } from 'react';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';

function VoiceRecognition({ children }) {
  const { transcript, resetTranscript } = useSpeechRecognition();

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <div>Sorry, your browser doesn't support speech recognition.</div>;
  }

  return (
    <div>
      {children({ transcript, resetTranscript })}
      <button onClick={SpeechRecognition.startListening}>Start Listening</button>
      <button onClick={SpeechRecognition.stopListening}>Stop Listening</button>
    </div>
  );
}

export default VoiceRecognition;