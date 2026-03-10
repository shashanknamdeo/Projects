
import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";

import {
  handleSignIn,
  handleSignUp,
  handleConfirmOtp,
  handleResendOtp,
  handleForgotPassword,
} from "../Functions/AuthFunctions";

// ------------------------------------------------------------------------------------------------

export function AuthUI({ onSignIn }: { onSignIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [mode, setMode] = useState< "signIn" | "signUp" | "forgotPassword" | "confirmOtp" >("signIn");
  // 
  const [otpType, setOtpType] = useState<"signUp" | "resetPassword">("signUp");
  const [loading, setLoading] = useState(false);
  // 
  console.log('AuthUI')
  // 
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {mode === "signIn"
          ? "Sign In"
          : mode === "signUp"
          ? "Sign Up"
          : mode === "forgotPassword"
          ? "Forgot Password"
          : otpType === "signUp"
          ? "Confirm Sign Up"
          : "Reset Password"}
      </Text>

      {mode !== "confirmOtp" && (
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      )}

      {mode !== "forgotPassword" && mode !== "confirmOtp" && (
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
      )}

      {mode === "confirmOtp" && (
        <>
          <Text style={{ marginBottom: 10, textAlign: "center", fontWeight: "bold" }}>
            {email}
          </Text>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            style={styles.input}
          />
          {otpType === "resetPassword" && (
            <TextInput
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.input}
            />
          )}
          <TouchableOpacity onPress={() => handleConfirmOtp( email, otp, newPassword, otpType, setMode, setOtp, setNewPassword, setPassword)} style={styles.button}>
            <Text style={styles.buttonText}>
              {otpType === "signUp" ? "Confirm OTP" : "Reset Password"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleResendOtp(email)} style={styles.resendButton}>
            <Text style={styles.resendText}>Resend OTP</Text>
          </TouchableOpacity>
        </>
      )}

      {mode === "signIn" && (
        <TouchableOpacity onPress={() => handleSignIn(email, password, onSignIn, setMode)} style={styles.button}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      )}

      {mode === "signUp" && (
        <TouchableOpacity onPress={() => handleSignUp(email, password, setMode, setOtpType)} style={styles.button}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      )}

      {mode === "forgotPassword" && (
        <TouchableOpacity onPress={() => handleForgotPassword(email, setMode, setOtpType, setLoading )} style={styles.button}>
          <Text style={styles.buttonText}>Send Reset Code</Text>
        </TouchableOpacity>
      )}

      {mode !== "confirmOtp" && (
        <TouchableOpacity
          onPress={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
        >
          <Text style={styles.link}>
            {mode === "signIn"
              ? "Don't have an account? Sign Up"
              : "Already have an account? Sign In"}
          </Text>
        </TouchableOpacity>
      )}

      {mode === "signIn" && (
        <TouchableOpacity onPress={() => setMode("forgotPassword")}>
          <Text style={styles.link}>Forgot Password?</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
  link: { color: "#007AFF", textAlign: "center", marginTop: 15 },
  resendButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#007AFF",
    alignItems: "center",
  },
  resendText: { color: "#007AFF", fontWeight: "bold" },
});
