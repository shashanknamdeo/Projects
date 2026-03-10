console.log("Access File TalkUI ---------------------------------------------------------------------------------")

// this is my TalkUI.tsx do only required changes and give me full code

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { handleVoiceConversation } from "../Functions/TalkFunctions";

export function TalkUI({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<
    { id: string; text: string; sender: "user" | "bot" }[]
  >([]);

  const handleConversation = async () => {
    setMessages([]);

    await handleVoiceConversation(
      setLoading,
      (transcript: string) =>
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), text: transcript, sender: "user" },
        ]),
      (aiResponse: string) =>
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), text: aiResponse, sender: "bot" },
        ])
    );
  };

  return (
    <View style={styles.container}>
      {/* Chat bubbles */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.sender === "user" ? styles.userBubble : styles.botBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                item.sender === "user" && { color: "#fff" },
              ]}
            >
              {item.text}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.chatContainer}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleConversation}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Listening & Thinking..." : "🎤 Talk to Gossipy"}
        </Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={{ marginTop: 10 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // 🔹 Header styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  switchMode: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  chatContainer: { padding: 10, flexGrow: 1 },
  bubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: "80%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
  },
  messageText: { fontSize: 16, color: "#000" },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignSelf: "center",
    marginVertical: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
