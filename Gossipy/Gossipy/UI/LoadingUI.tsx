
// UI/LoadingUI.tsx
import React from "react";
import { SafeAreaView, ActivityIndicator, Text, StyleSheet, Image } from "react-native";

export const LoadingUI = () => (
  <SafeAreaView style={styles.center}>
    {/* App Logo */}
    <Image
      source={require("../Icons/GossipyCloseUp.jpg")}  // 👈 place your logo in /assets folder
      style={styles.logo}
      resizeMode="contain"
    />

    {/* Spinner */}
    <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />

    {/* Text */}
    <Text style={styles.text}>Loading...</Text>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // optional
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});
