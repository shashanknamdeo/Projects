console.log('Access File  TestAudioRecorder.tsx -----------------------------------------------------------------')

// this file is use to check AudioRecorder.tsx file

import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AudioRecorder } from "../Functions/AudioRecorder";

export function TestAudioRecorder() {
  console.log('Initialize Function : TestAudioRecorder')
  const [recordedUri, setRecordedUri] = useState<string>("");

  const handleRecordingComplete = (uri: string) => {
    console.log("Recorded audio URI:", uri);
    setRecordedUri(uri);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎤 Audio Recorder Test</Text>

      <AudioRecorder onStopRecording={handleRecordingComplete} />

      {recordedUri ? (
        <Text style={styles.uriText}>Recorded URI: {recordedUri}</Text>
      ) : null}
    </View>
  );
  console.log('Terminate Function : TestAudioRecorder')
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  uriText: {
    marginTop: 20,
    fontSize: 14,
    color: "#333",
  },
});
