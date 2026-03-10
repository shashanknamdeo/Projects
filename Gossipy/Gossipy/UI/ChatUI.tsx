console.log('Access ChatUI.tsx ----------------------------------------------------------------------------------')

// UI/ChatUI.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { generateGeminiResponse } from "../Functions/TextToTextGenerationFunctions";

export function ChatUI({
  user,
  onSignOut, // ✅ keep logic available
  onSwitchToTalk,
}: {
  user: any;
  onSignOut: () => void;
  onSwitchToTalk: () => void;
}) {
  const [messages, setMessages] = useState([
    { id: "1", text: "Welcome to Gossipy 👋", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const botReply = await generateGeminiResponse(input);
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: botReply, sender: "bot" },
    ]);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.sender === "user" ? styles.userBubble : styles.botBubble,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.messagesContainer}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity
          style={[styles.sendButton, loading && { opacity: 0.5 }]}
          onPress={sendMessage}
          disabled={loading}
        >
          <Text style={styles.sendText}>{loading ? "..." : "Send"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#007AFF",
    padding: 15,
  },
  title: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  switchMode: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  messagesContainer: { padding: 10 },
  messageBubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    maxWidth: "80%",
  },
  userBubble: { backgroundColor: "#007AFF", alignSelf: "flex-end" },
  botBubble: { backgroundColor: "#e5e5ea", alignSelf: "flex-start" },
  messageText: { color: "#000" },
  inputContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    marginLeft: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontWeight: "bold" },
});
