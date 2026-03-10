console.log('Access File TalkFunctions.tsx ---------------------------------------------------------------------')

import { recordAudio } from "./AudioRecorderFunctions";
import { transcribeAudioWithAWS } from "./SpeachToTextGenerationFunctions";
import { generateGeminiResponse } from "./TextToTextGenerationFunctions";
import { speakWithPolly } from "./TextToSpeachGenerationFunctions";

/**
 * Handles the entire voice conversation pipeline:
 * Speech → Text → Gemini → Speech
 */
export async function handleVoiceConversation(
  setIsProcessing: (val: boolean) => void,
  onTranscript: (text: string) => void,
  onResponse: (responseText: string) => void
) {
  try {
//     console.log("🎙️ Starting voice conversation...");
//     setIsProcessing(true);

//     // ------------------------------------------------------
//     // 1️⃣ RECORD AUDIO
//     // ------------------------------------------------------
//     const audioUri = await recordAudio();
//     console.log("✅ Audio recorded at:", audioUri);

//     // ------------------------------------------------------
//     // 2️⃣ SPEECH ➜ TEXT (AWS Transcribe)
//     // ------------------------------------------------------
//     const transcript = await transcribeAudioWithAWS(audioUri);
//     console.log("🗣️ Transcript:", transcript);

//     if (!transcript || transcript.trim().length === 0) {
//       throw new Error("Speech-to-text conversion failed or empty transcript.");
//     }

//     // Display recognized text
//     onTranscript(transcript);

//     // ------------------------------------------------------
//     // 3️⃣ TEXT ➜ GEMINI
//     // ------------------------------------------------------
//     const aiResponse = await generateGeminiResponse(transcript);
//     console.log("🤖 Gemini response:", aiResponse);

//     if (!aiResponse || aiResponse.trim().length === 0) {
//       throw new Error("Gemini did not return any response.");
//     }

//     // Display Gemini text response
//     onResponse(aiResponse);

//     // ------------------------------------------------------
//     // 4️⃣ TEXT ➜ SPEECH (Polly)
//     // ------------------------------------------------------
//     await speakWithPolly(aiResponse);
//     console.log("🔊 Polly spoke the response successfully!");
//   } catch (error: any) {
//     console.error("❌ handleVoiceConversation error:", error.message || error);
//   } finally {
//     setIsProcessing(false);
//     console.log("✅ Conversation flow ended.");
//   }
// }

// /**
//  * Optional helper for text-only interactions.
//  */
// export async function handleTypedConversation(
//   inputText: string,
//   setIsProcessing: (val: boolean) => void,
//   onResponse: (responseText: string) => void
// ) {
//   try {
//     setIsProcessing(true);

//     // TEXT ➜ TEXT ➜ SPEECH
    // const aiResponse = await generateGeminiResponse(inputText);
    const aiResponse = "Hello! As an AI, I don't experience days or feelings in the way humans do, but I'm ready and functioning perfectly.How can I help you today?";
    onResponse(aiResponse);
    await speakWithPolly(aiResponse);
  } catch (error: any) {
    console.error("❌ handleTypedConversation error:", error.message || error);
  } finally {
    setIsProcessing(false);
  }
}
