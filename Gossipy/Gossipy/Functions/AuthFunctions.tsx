// Functions/AuthFunctions.ts
import {
  signIn,
  signUp,
  confirmSignUp,
  resendSignUp,
  resetPassword,
  confirmResetPassword,
} from "aws-amplify/auth";

import { Alert } from "react-native";

import {functionLog} from './Logger'

// ------------------------------------------------------------------------------------------------

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());
}


  // Sign In --------------------------------------------------------------------------------------

export async function handleSignIn( email, password, onSignIn, setMode){
  functionLog('Initialize Function : handleSignIn')
  if (!email.trim() || !password.trim()) {
    Alert.alert("Error", "Email and password are required");
    return;
  }
  if (!isValidEmail(email)) {
    Alert.alert("Error", "Please enter a valid email address");
    return;
  }
  // 
  try {
    const response: any = await authSignIn(email, password);
    functionLog(`Sign in response : ${response}`)
    // 
    if (response.isSignedIn) {
      onSignIn();
    } else if (response.nextStep?.signInStep === "CONFIRM_SIGN_UP") {
      Alert.alert("Info", "Please confirm your email using the OTP sent to your inbox.");
      setMode("confirmOtp");
    } else {
      Alert.alert("Error", "Cannot sign in. Please try again.");
    }
  } catch (err: any) {
    functionLog(`Sign in error : ${err}`);
    Alert.alert("Error", err.message || "Failed to sign in");
  }
};


export async function authSignIn(email: string, password: string) {
  functionLog('Initialize Function : authSignIn')
  try {
    return await signIn({ username: email, password });
  } catch (err: any) {
    console.error("authSignIn error:", err);
    throw err;
  }
}


// Sign Up ----------------------------------------------------------------------------------------

export async function handleSignUp( email, password, setMode, setOtpType) {
  functionLog('Initialize Function : handleSignUp')
  if (!email.trim() || !password.trim()) {
    Alert.alert("Error", "Email and password are required for sign up");
    return;
  }
  if (!isValidEmail(email)) {
    Alert.alert("Error", "Please enter a valid email address");
    return;
  }
  try {
    const response = await authSignUp(email, password);
    if (response === 'UserAlreadyExist'){
      return false
    } else {
      Alert.alert("Success", "Sign up successful! Please check your email for OTP.");
      setMode("confirmOtp");
      setOtpType("signUp");
    }
  } catch (err: any) {
    functionLog(`handleSignUp error: ${err}`);
    Alert.alert("Error", err.message || "Failed to sign up");
  }
};

export async function authSignUp(email: string, password: string) {
  functionLog("Initialize Function : authSignUp");
  try {
    const response = await signUp({
      username: email,
      password,
      attributes: { email },
    });
    return response;
  } catch (err: any) {
    console.log("🔥 Full error object:", err);
    // 
    const errorCode = err.code || err.name || err.__type || (err.message ?? "");
    // 
    if (errorCode.includes("UsernameExistsException")) {
      functionLog("Error : user already exists");
      Alert.alert("Error", "An account with this email already exists.");
      return "UserAlreadyExist";
    } else {
      functionLog(`Sign up error: ${errorCode}`);
      Alert.alert("Error", err.message || "Failed to sign up");
    }
  }
}


// Confirm OTP ------------------------------------------------------------------------------------

export async function handleConfirmOtp( email, otp, newPassword, otpType, setMode, setOtp, setNewPassword, setPassword ) {
  functionLog('Initialize Function : handleConfirmOtp')
  if (!email.trim() || !otp.trim()) {
    Alert.alert("Error", "OTP is required");
    return;
  }
  // 
  try {
    if (otpType === "signUp") {
      await authConfirmSignUp(email, otp);
      Alert.alert("Success", "Account confirmed! You can now sign in.");
    } else {
      if (!newPassword.trim()) {
        Alert.alert("Error", "Please enter a new password");
        return;
      }
      await authConfirmResetPassword(email, otp, newPassword);
      Alert.alert("Success", "Password reset successful! You can now sign in.");
      setPassword("");
    }
    // 
    setMode("signIn");
    setOtp("");
    setNewPassword("");
  } catch (err: any) {
    functionLog(`OTP confirm error : ${err}`);
    if (
      otpType === "signUp" &&
      err.code === "NotAuthorizedException" &&
      err.message.includes("Current status is CONFIRMED")
    ) {
      Alert.alert("Info", "User is already confirmed. You can sign in.");
      setMode("signIn");
    } else {
      Alert.alert("Error", err.message || "OTP confirmation failed");
    }
  }
};

export async function authConfirmSignUp(email: string, otp: string) {
  functionLog('Initialize Function : authConfirmSignUp')
  try {
    return await confirmSignUp({
      username: email,
      confirmationCode: otp,
    });
  } catch (err: any) {
    console.error("authConfirmSignUp error:", err);
    throw err;
  }
}


// Resend OTP -------------------------------------------------------------------------------------

export async function handleResendOtp(email) {
  functionLog('Initialize Function : handleResendOtp')
  if (!email.trim()) {
    Alert.alert("Error", "Email is missing. Cannot resend OTP.");
    return;
  }
  try {
    await authResendSignUp(email);
    Alert.alert("Success", "A new OTP has been sent to your email.");
  } catch (err: any) {
    functionLog(`Resend OTP error : ${err}`);
    Alert.alert("Error", err.message || "Failed to resend OTP");
  }
};

export async function authResendSignUp(email: string) {
  functionLog('Initialize Function : authResendSignUp')
  try {
    return await resendSignUp(email);
  } catch (err: any) {
    console.error("authResendSignUp error:", err);
    throw err;
  }
}


// Forgot Password --------------------------------------------------------------------------------

export async function handleForgotPassword( email, setMode, setOtpType, setLoading ) {
  functionLog('Initialize Function : handleForgotPassword')
  if (!email.trim()) {
    Alert.alert("Missing email", "Please enter your email.");
    return;
  }

  setLoading(true);
  try {
    await authResetPassword(email);
    Alert.alert("Reset code sent", "Check your email for the reset code.");
    setMode("confirmOtp");
    setOtpType("resetPassword");
  } catch (err: any) {
    Alert.alert("Error sending reset code", err?.message ?? JSON.stringify(err));
  } finally {
    setLoading(false);
  }
};

export async function authResetPassword(email: string) {
  functionLog('Initialize Function : authResetPassword')
  try {
    return await resetPassword({ username: email });
  } catch (err: any) {
    console.error("authResetPassword error:", err);
    throw err;
  }
}

/**
 * 🔄 Confirm Reset Password (with OTP)
 */
export async function authConfirmResetPassword(email: string, otp: string, newPassword: string) {
  functionLog('Initialize Function : authConfirmResetPassword')
  try {
    return await confirmResetPassword({
      username: email,
      confirmationCode: otp,
      newPassword,
    });
  } catch (err: any) {
    console.error("authConfirmResetPassword error:", err);
    throw err;
  }
}
