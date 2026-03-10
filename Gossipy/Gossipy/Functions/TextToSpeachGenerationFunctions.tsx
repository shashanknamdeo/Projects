console.log('Initialize TextToSpeachGenerationFunctions ---------------------------------------------------------')

// Functions/TextToSpeachGenerationFunctions.tsx
import { generateClient } from "aws-amplify/api";
import Sound from "react-native-nitro-sound"; // ✅ Keep Nitro Sound
import { textToSpeech } from "../src/graphql/queries";

// Create Amplify GraphQL client
const client = generateClient();

/**
 * Convert text → speech using Amplify Predictions GraphQL (Polly)
 * Plays the audio in React Native via react-native-nitro-sound
 * @param text Text to synthesize
 * @param voiceID Polly voice ID (defaults to "Salli")
 */
// export async function speakWithPolly(text: string, voiceID: string = "Salli") {
export async function speakWithPolly(text: string, voiceID: string = "Ruth") {
  try {
    if (!text?.trim()) return;

    console.log("🎙️ Running Polly GraphQL request...");
    const response = await client.graphql({
      query: textToSpeech,
      variables: { input: { convertTextToSpeech: { text, voiceID } } },
    });

    const url = response?.data?.textToSpeech;
    if (!url) {
      console.warn("⚠️ No presigned URL returned from Polly.");
      return;
    }

    console.log("🎧 Playing Polly audio from URL:", url);

    // ✅ Correct Nitro Sound usage (no 'new', no constructor)
    await Sound.startPlayer(url);

    console.log("✅ Audio playback triggered successfully");
  } catch (err) {
    console.error("Amplify Polly Nitro Sound error:", err);
  }
}
