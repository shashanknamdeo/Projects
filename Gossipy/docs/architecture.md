

Optional Optimizations

only send audio to google (all other will work on google server)
    google will generate text from speach
    genarte gemini response on it
    generate speach of gemini response
    give bach text from speach, gemini response and audio response

Streaming STT: send audio chunks while recording → partial transcript → Gemini can start processing early.

Parallel processing: send text to Gemini while Google TTS is preparing speech → pipelined audio output.

Cache frequent responses: if the user repeats common phrases, reuse audio to reduce TTS calls.


Goosipy
    AuthUI
        AuthFunctions
    ChatUI
        TextToTextGenerationFunctions
    TalkUI
        TalkFunctions
            AudioRecorderFunctions
            SpeachToTextGenerationFunctions
            TextToTextGenerationFunctions
            TextToSpeachGenerationFunctions

chatFunction me add karna hai TextToTextGenerationFunctions