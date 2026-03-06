
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import {
//   signIn,
//   signUp,
//   resetPassword,
//   confirmSignUp,
//   resendSignUp,
//   confirmResetPassword,
// } from "aws-amplify/auth";

// export default function AuthScreen({ onSignIn }: { onSignIn: () => void }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [otp, setOtp] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [mode, setMode] = useState<
//     "signIn" | "signUp" | "forgotPassword" | "confirmOtp"
//   >("signIn");

//   // otpType distinguishes between signUp confirmation and password reset confirmation
//   const [otpType, setOtpType] = useState<"signUp" | "resetPassword">("signUp");
//   const [loading, setLoading] = useState(false);

//   const isValidEmail = (email: string) =>
//     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());

//   // ---- Sign In ----
//   const handleSignIn = async () => {
//     if (!email.trim() || !password.trim()) {
//       Alert.alert("Error", "Email and password are required");
//       return;
//     }
//     if (!isValidEmail(email)) {
//       Alert.alert("Error", "Please enter a valid email address");
//       return;
//     }

//     try {
//       const response: any = await signIn({ username: email, password });
//       console.log("Sign in response", response);

//       if (response.isSignedIn) {
//         // User fully signed in → go to Storage screen
//         onSignIn();
//       } else if (response.nextStep?.signInStep === "CONFIRM_SIGN_UP") {
//         // User needs OTP confirmation → show OTP input
//         Alert.alert("Info", "Please confirm your email using the OTP sent to your inbox.");
//         setMode("confirmOtp");
//       } else {
//         Alert.alert("Error", "Cannot sign in. Please try again.");
//       }
//     } catch (err: any) {
//       console.log("Sign in error", err);
//       Alert.alert("Error", err.message || "Failed to sign in");
//     }
//   };

//   // ---- Sign Up ----
//   const handleSignUp = async () => {
//     if (!email.trim() || !password.trim()) {
//       Alert.alert("Error", "Email and password are required for sign up");
//       return;
//     }
//     if (!isValidEmail(email)) {
//       Alert.alert("Error", "Please enter a valid email address");
//       return;
//     }

//     try {
//       await signUp({ username: email, password, attributes: { email } });
//       Alert.alert("Success", "Sign up successful! Please check your email for OTP.");
//       setMode("confirmOtp");
//       setOtpType("signUp");
//     } catch (err: any) {
//       console.log("Sign up error", err);
//       Alert.alert("Error", err.message || "Failed to sign up");
//     }
//   };

//   // ---- Confirm OTP (Sign Up or Reset Password) ----
//   const handleConfirmOtp = async () => {
//     if (!email.trim() || !otp.trim()) {
//       Alert.alert("Error", "OTP is required");
//       return;
//     }

//     try {
//       if (otpType === "signUp") {
//         await confirmSignUp({ username: email, confirmationCode: otp });
//         Alert.alert("Success", "Account confirmed! You can now sign in.");
//       } else if (otpType === "resetPassword") {
//         if (!newPassword.trim()) {
//           Alert.alert("Error", "Please enter a new password");
//           return;
//         }
//         await confirmResetPassword({
//           username: email,
//           confirmationCode: otp,
//           newPassword,
//         });
//         Alert.alert("Success", "Password reset successful! You can now sign in.");
//         setPassword("");
//       }

//       setMode("signIn");
//       setOtp("");
//       setNewPassword("");
//     } catch (err: any) {
//       console.log("OTP confirm error", err);
//       if (
//         otpType === "signUp" &&
//         err.code === "NotAuthorizedException" &&
//         err.message.includes("Current status is CONFIRMED")
//       ) {
//         Alert.alert("Info", "User is already confirmed. You can sign in.");
//         setMode("signIn");
//       } else {
//         Alert.alert("Error", err.message || "OTP confirmation failed");
//       }
//     }
//   };

//   // ---- Resend OTP ----
//   const handleResendOtp = async () => {
//     if (!email.trim()) {
//       Alert.alert("Error", "Email is missing. Cannot resend OTP.");
//       return;
//     }
//     try {
//       if (otpType === "signUp") {
//         await resendSignUp(email);
//         Alert.alert("Success", "A new OTP has been sent to your email.");
//       } else {
//         Alert.alert("Error", "Cannot resend OTP for password reset. Request reset again.");
//       }
//     } catch (err: any) {
//       console.log("Resend OTP error", err);
//       Alert.alert("Error", err.message || "Failed to resend OTP");
//     }
//   };

//   // ---- Forgot Password ----
//   const handleForgotPassword = async () => {
//     if (!email.trim()) {
//       Alert.alert("Missing email", "Please enter your email.");
//       return;
//     }

//     setLoading(true);
//     try {
//       await resetPassword({ username: email });
//       Alert.alert("Reset code sent", "Check your email for the reset code.");
//       setMode("confirmOtp");
//       setOtpType("resetPassword");
//     } catch (err: any) {
//       Alert.alert("Error sending reset code", err?.message ?? JSON.stringify(err));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>
//         {mode === "signIn"
//           ? "Sign In"
//           : mode === "signUp"
//           ? "Sign Up"
//           : mode === "forgotPassword"
//           ? "Forgot Password"
//           : otpType === "signUp"
//           ? "Confirm Sign Up"
//           : "Reset Password"}
//       </Text>

//       {mode !== "confirmOtp" && (
//         <TextInput
//           placeholder="Email"
//           value={email}
//           onChangeText={setEmail}
//           style={styles.input}
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />
//       )}

//       {mode !== "forgotPassword" && mode !== "confirmOtp" && (
//         <TextInput
//           placeholder="Password"
//           value={password}
//           onChangeText={setPassword}
//           secureTextEntry
//           style={styles.input}
//         />
//       )}

//       {mode === "confirmOtp" && (
//         <>
//           <Text style={{ marginBottom: 10, textAlign: "center" , fontWeight: "bold"}}>{email}</Text>
//           <TextInput
//             placeholder="Enter OTP"
//             value={otp}
//             onChangeText={setOtp}
//             keyboardType="number-pad"
//             style={styles.input}
//           />
//           {otpType === "resetPassword" && (
//             <TextInput
//               placeholder="New Password"
//               value={newPassword}
//               onChangeText={setNewPassword}
//               secureTextEntry
//               style={styles.input}
//             />
//           )}
//           <TouchableOpacity onPress={handleConfirmOtp} style={styles.button}>
//             <Text style={styles.buttonText}>
//               {otpType === "signUp" ? "Confirm OTP" : "Reset Password"}
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={handleResendOtp} style={styles.resendButton}>
//             <Text style={styles.resendText}>Resend OTP</Text>
//           </TouchableOpacity>
//         </>
//       )}

//       {mode === "signIn" && (
//         <TouchableOpacity onPress={handleSignIn} style={styles.button}>
//           <Text style={styles.buttonText}>Sign In</Text>
//         </TouchableOpacity>
//       )}

//       {mode === "signUp" && (
//         <TouchableOpacity onPress={handleSignUp} style={styles.button}>
//           <Text style={styles.buttonText}>Sign Up</Text>
//         </TouchableOpacity>
//       )}

//       {mode === "forgotPassword" && (
//         <TouchableOpacity onPress={handleForgotPassword} style={styles.button}>
//           <Text style={styles.buttonText}>Send Reset Code</Text>
//         </TouchableOpacity>
//       )}

//       {mode !== "confirmOtp" && (
//         <TouchableOpacity
//           onPress={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
//         >
//           <Text style={styles.link}>
//             {mode === "signIn"
//               ? "Don't have an account? Sign Up"
//               : "Already have an account? Sign In"}
//           </Text>
//         </TouchableOpacity>
//       )}

//       {mode === "signIn" && (
//         <TouchableOpacity onPress={() => setMode("forgotPassword")}>
//           <Text style={styles.link}>Forgot Password?</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", padding: 20 },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 10,
//     marginBottom: 10,
//     borderRadius: 5,
//   },
//   button: {
//     backgroundColor: "#007AFF",
//     padding: 15,
//     borderRadius: 5,
//     marginTop: 10,
//   },
//   buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
//   link: { color: "#007AFF", textAlign: "center", marginTop: 15 },
//   resendButton: {
//     marginTop: 10,
//     padding: 12,
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: "#007AFF",
//     alignItems: "center",
//   },
//   resendText: { color: "#007AFF", fontWeight: "bold" },
// });


// // Signup resend code not working

