import React, { useState, useEffect } from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const LANGUAGE_MAP = {
    'Engels': 'en-US',
    'Dutch': 'nl-NL'
}
const Dictaphone = () => {
    const [language, setLanguage] = useState('en-US')
    const commands = Object.keys(LANGUAGE_MAP).map(language => ({
        command: [language, '*'+language+'*' ],
        callback: () => {
            setLanguage(LANGUAGE_MAP[language])
            SpeechRecognition.startListening({
                continuous: true,
                language: LANGUAGE_MAP[language]
            })
        },
        matchInterim: true
    }))
    const { transcript } = useSpeechRecognition({ commands })

    useEffect(() => {
        SpeechRecognition.startListening({
            continuous: true,
            language: 'en-US'
        })
    }, [])

    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
        return null
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>language: {language}</span>
            <span>{transcript}</span>
        </div>
    )
}

export default Dictaphone