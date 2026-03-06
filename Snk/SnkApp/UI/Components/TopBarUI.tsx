// UI/components/TopBar.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

export default function TopBar({ onLogout }: { onLogout: () => void }) {
  return (
    <View style={styles.topBar}>
      {/* Left: Logo + Title */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={require("../../Icons/SnkLogoTransparent.jpg")}
          style={{ width: 30, height: 30, marginRight: 8 }}
        />
        <Text style={styles.title}>Snk</Text>
      </View>

      {/* Right: Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  logoutButton: {
    backgroundColor: "#DE183C",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  logoutText: { color: "#fff", fontWeight: "bold" },
  title: { fontSize: 20, fontWeight: "bold", color: "#333" },
});
