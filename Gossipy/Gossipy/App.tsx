import { appLog } from "./Functions/Logger";
appLog("Initialize App -------------------------------------------------------------------------------------");

// ✅ AWS SDK Polyfills for React Native ---------------------------------------
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { Buffer } from "buffer";
import process from "process";
import { Stream } from "stream-browserify";
import util from "util";

if (typeof global.Buffer === "undefined") global.Buffer = Buffer;
if (typeof global.process === "undefined") global.process = process;
if (typeof global.Stream === "undefined") global.Stream = Stream;
if (typeof global.util === "undefined") global.util = util;

// ✅ Inline ReadableStream polyfill (no external import)
if (typeof global.ReadableStream === "undefined") {
  class RNReadableStream {
    constructor() {
      throw new Error("ReadableStream is not implemented in React Native, but polyfilled.");
    }
  }
  global.ReadableStream = RNReadableStream;
}


// ✅ Main Imports --------------------------------------------------------------
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Amplify } from "aws-amplify";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import awsExports from "./aws-exports";

// 🧩 Local UI imports
import { AuthUI } from "./UI/AuthUI";
import { LoadingUI } from "./UI/LoadingUI";
import { ChatUI } from "./UI/ChatUI";
import { TalkUI } from "./UI/TalkUI";

// ✅ Configure Amplify
Amplify.configure(awsExports);

console.log("All Packages Imported ------------------------------------------------------------------------------");

// export default function App() {
//   const [loading, setLoading] = useState(true);
//   const [signedIn, setSignedIn] = useState(false);
//   const [user, setUser] = useState<any>(null);
//   const [mode, setMode] = useState<"chat" | "talk">("chat");

//   // ✅ Check login status once after mount
//   useEffect(() => {
//     const checkUser = async () => {
//       try {
//         const currentUser = await getCurrentUser();
//         if (currentUser) {
//           setSignedIn(true);
//           setUser(currentUser);
//           console.log("✅ User session active");
//         }
//       } catch {
//         setSignedIn(false);
//         console.log("❌ No user session found");
//       } finally {
//         setLoading(false);
//       }
//     };
//     checkUser();
//   }, []);

//   // ✅ Logout handler
//   async function handleSignOut() {
//     try {
//       await signOut();
//       setSignedIn(false);
//       setUser(null);
//       console.log("👋 User signed out");
//     } catch (err: any) {
//       console.error("Sign out error:", err);
//     }
//   }

//   // ✅ Login success handler
//   function handleSignInSuccess() {
//     setSignedIn(true);
//     console.log("🔐 User signed in successfully");
//   }

//   // ✅ Loading state
//   if (loading) return <LoadingUI />;

//   // ✅ Authentication screen
//   if (!signedIn) {
//     return (
//       <SafeAreaProvider>
//         <AuthUI onSignIn={handleSignInSuccess} />
//       </SafeAreaProvider>
//     );
//   }

//   // ✅ Main app view (Chat ↔ Talk toggle)
//   return (
//     <SafeAreaProvider>
//       <View style={styles.container}>
//         {/* Chat or Talk UI */}
//         <View style={styles.contentContainer}>
//           {mode === "chat" ? (
//             <ChatUI user={user} onSignOut={handleSignOut} />
//           ) : (
//             <TalkUI onBack={() => setMode("chat")} />
//           )}
//         </View>

//         {/* 🔁 Switch Mode Button (now inside normal flow) */}
//         <View style={styles.switchContainer}>
//           <TouchableOpacity
//             style={styles.switchButton}
//             onPress={() => {
//               const nextMode = mode === "chat" ? "talk" : "chat";
//               setMode(nextMode);
//               console.log(`🔄 Switched to ${nextMode.toUpperCase()} mode`);
//             }}
//           >
//             <Text style={styles.switchText}>
//               {mode === "chat" ? "🎙️ Switch to Talk" : "💬 Switch to Chat"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </SafeAreaProvider>
//   );
// }

// // ------------------ Styles ------------------
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     justifyContent: "flex-start", // ⬅️ ensures content appears from top
//   },
//   contentContainer: {
//     flexGrow: 0, // ⬅️ prevents stretching full height
//     minHeight: "75%", // adjusts vertical size
//   },
//   switchContainer: {
//     alignSelf: "center",
//     marginVertical: 15, // adds spacing between UI and button
//   },
//   switchButton: {
//     backgroundColor: "#007AFF",
//     paddingVertical: 12,
//     paddingHorizontal: 30,
//     borderRadius: 25,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 4,
//   },
//   switchText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
// });

export default function App() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<"chat" | "talk">("chat");
  const [fadeAnim] = useState(new Animated.Value(0));

  // ✅ Check login status once after mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setSignedIn(true);
          setUser(currentUser);
          console.log("✅ User session active");
        }
      } catch {
        setSignedIn(false);
        console.log("❌ No user session found");
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  // ✅ Fade animation for smooth mode switch
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [mode]);

  // ✅ Logout handler
  async function handleSignOut() {
    try {
      await signOut();
      setSignedIn(false);
      setUser(null);
      console.log("👋 User signed out");
    } catch (err: any) {
      console.error("Sign out error:", err);
    }
  }

  // ✅ Login success handler
  function handleSignInSuccess() {
    setSignedIn(true);
    console.log("🔐 User signed in successfully");
  }

  // ✅ Loading state
  if (loading) return <LoadingUI />;

  // ✅ Authentication screen
  if (!signedIn) {
    return (
      <SafeAreaProvider>
        <AuthUI onSignIn={handleSignInSuccess} />
      </SafeAreaProvider>
    );
  }

  // ✅ Main app view
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {/* 🔹 Top bar (common header) */}
        <View style={styles.topBar}>
          <Text style={styles.appTitle}>🧠 Gossipy</Text>
          <TouchableOpacity onPress={handleSignOut}>
            <Text style={styles.signOut}>Sign Out</Text>
          </TouchableOpacity>
        </View>

         {/*🔹 Toggle just below top bar */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleWrapper}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                mode === "chat" && styles.activeOption,
              ]}
              onPress={() => setMode("chat")}
            >
              <Text
                style={[
                  styles.toggleText,
                  mode === "chat" && styles.activeText,
                ]}
              >
                💬 Chat
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleOption,
                mode === "talk" && styles.activeOption,
              ]}
              onPress={() => setMode("talk")}
            >
              <Text
                style={[
                  styles.toggleText,
                  mode === "talk" && styles.activeText,
                ]}
              >
                🎙️ Talk
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 🔹 Main content below toggle */}
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          {mode === "chat" ? (
            <ChatUI
              user={user}
              onSignOut={handleSignOut}
              onSwitchToTalk={() => setMode("talk")}
            />
          ) : (
            <TalkUI onBack={() => setMode("chat")} />
          )}
        </Animated.View>
      </View>
    </SafeAreaProvider>
  );
}

// ------------------ Styles ------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // 🔹 Unified top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  signOut: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },

  // 🔹 Toggle styles
  toggleContainer: {
    paddingVertical: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    borderBottomWidth: 0,
    borderColor: "#ddd",
  },
  toggleWrapper: {
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "#E5E5EA",
    borderRadius: 30,
    padding: 4,
    width: "50%",
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  activeOption: {
    backgroundColor: "#007AFF",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
  },
  activeText: {
    color: "#fff",
  },

  contentContainer: {
    flex: 1,
  },
});
