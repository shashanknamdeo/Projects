console.log('Access File SpeachToTextGenerationFunctions.tsx ----------------------------------------------------')

import { uploadData, getUrl } from "aws-amplify/storage";
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from "aws-amplify/auth";
import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
} from "@aws-sdk/client-transcribe";
import RNFS from "react-native-fs";
import awsExports from "../aws-exports";

Amplify.configure(awsExports);

/**
 * Uploads a recorded WAV file to S3 and gets transcription using AWS Transcribe.
 */
export async function transcribeAudioWithAWS(audioUri: string): Promise<string> {
  console.log("audioUri:", audioUri);
  try {
    // 1️⃣ Read audio file
    const base64Audio = await RNFS.readFile(audioUri, "base64");
    const audioBuffer = Buffer.from(base64Audio, "base64");

    const fileName = "gossipy_record.wav";
    console.log("📤 Uploading audio to S3:", fileName);

    // 2️⃣ Upload to S3 (overwrite same name each time)
    await uploadData({
      path: fileName,
      data: audioBuffer,
      options: {
        contentType: "audio/wav",
      },
    }).result;

    // ✅ Use S3 URI in the correct format
    const s3Bucket = awsExports.aws_user_files_s3_bucket;
    const s3Uri = `s3://${s3Bucket}/${fileName}`;
    console.log("✅ S3 URI for Transcribe:", s3Uri);

    // 3️⃣ Get credentials from Amplify Auth
    const { credentials } = await fetchAuthSession();
    if (!credentials) throw new Error("Credential is missing from Amplify session");
    console.log("✅ Credentials fetched");

    // 4️⃣ Initialize Transcribe client with credentials
    const client = new TranscribeClient({
      region: awsExports.aws_project_region,
      credentials: {
        accessKeyId: credentials.accessKeyId!,
        secretAccessKey: credentials.secretAccessKey!,
        sessionToken: credentials.sessionToken!,
      },
    });

    const jobName = `gossipy-transcribe-${Date.now()}`;

    // 5️⃣ Start transcription
    const startCommand = new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      LanguageCode: "en-US",
      MediaFormat: "wav",
      Media: { MediaFileUri: s3Uri },
      OutputBucketName: s3Bucket,
    });

    await client.send(startCommand);
    console.log("🌀 Transcription started:", jobName);

    // 6️⃣ Wait until the job finishes
    let jobStatus = "IN_PROGRESS";
    let outputKey = "";

    while (jobStatus === "IN_PROGRESS") {
      await new Promise((r) => setTimeout(r, 5000));
      const jobResult = await client.send(
        new GetTranscriptionJobCommand({ TranscriptionJobName: jobName })
      );
      jobStatus = jobResult.TranscriptionJob?.TranscriptionJobStatus || "FAILED";

      if (jobStatus === "COMPLETED") {
        const transcriptUri =
          jobResult.TranscriptionJob?.Transcript?.TranscriptFileUri || "";
        console.log("✅ Transcription file URI:", transcriptUri);

        // Extract object key from transcriptUri
        const match = transcriptUri.match(/\/([^\/]+\.json)$/);
        outputKey = match ? match[1] : "";
        break;
      }
    }

    if (!outputKey) throw new Error("No transcript file key found in result.");

    // 7️⃣ ✅ Securely fetch transcript using Amplify Storage (signed URL)
    console.log("🔐 Fetching transcript securely with Amplify...");
    const { url: signedUrl } = await getUrl({
      path: outputKey,
      options: { validateObjectExistence: true, expiresIn: 60 },
    });

    const response = await fetch(signedUrl.toString());
    if (!response.ok) throw new Error("Failed to fetch transcript from S3.");

    const transcriptJson = await response.json();
    const text = transcriptJson.results.transcripts[0].transcript;

    console.log("✅ Transcription complete:", text);
    return text;
  } catch (err) {
    console.error("❌ AWS Transcribe error:", err);
    return "⚠️ Transcription failed.";
  }
}
