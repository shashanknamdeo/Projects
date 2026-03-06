// SyncUI.tsx
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TopBar from "./Components/TopBarUI";

import { useAutoSync } from "../Functions/AutoSyncFunctions";
import { sync, forceUpload, forceDownload } from "../Functions/SyncFunctions";
import { uiLog } from "../Functions/Logger";

// ------------------------------------------------------------------------------------------------

export const SyncUI = ({ path_dict, onLogout }: any) => {
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(false);
  const [status, setStatus] = useState<"idle" | "syncing" | "error">("idle");
  const [intervalMs, setIntervalMs] = useState<number>(24 * 60 * 60 * 1000);
  const [draftInterval, setDraftInterval] = useState<number>(24 * 60 * 60 * 1000);
  const [intervalPopupVisible, setIntervalPopupVisible] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const savedInterval = await AsyncStorage.getItem("snk_intervalMs");
        if (savedInterval !== null) {
          setIntervalMs(Number(savedInterval));
          setDraftInterval(Number(savedInterval));
        }
        const savedWifi = await AsyncStorage.getItem("snk_wifiOnly");
        if (savedWifi !== null) setWifiOnly(savedWifi === "true");
        const savedLast = await AsyncStorage.getItem("snk_lastSyncTime");
        if (savedLast) setLastSync(Number(savedLast));
      } catch (e) {
        console.error("Error loading settings:", e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem("snk_intervalMs", String(intervalMs));
      } catch (e) {
        console.error("Error saving interval:", e);
      }
    })();
  }, [intervalMs]);

  useAutoSync(path_dict, autoSyncEnabled, {
    intervalMs,
    wifiOnly,
    onStatus: async (s) => {
      setStatus(s);
      if (s === "idle") {
        const now = Date.now();
        await AsyncStorage.setItem("snk_lastSyncTime", String(now));
        setLastSync(now);
      }
    },
  });

  const updateLastSync = async () => {
    const now = Date.now();
    await AsyncStorage.setItem("snk_lastSyncTime", String(now));
    setLastSync(now);
  };

  const msToDHMS = (ms: number) => {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return { days, hours, minutes };
  };

  const { days, hours, minutes } = msToDHMS(intervalMs);
  const { days: dDays, hours: dHours, minutes: dMinutes } = msToDHMS(draftInterval);

  const formatDate = (ms: number) => new Date(ms).toLocaleString();
  const nextSync = lastSync ? lastSync + intervalMs : null;

  return (
    <SafeAreaView style={styles.container}>
      <TopBar onLogout={onLogout} />

      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Last Sync</Text>
        <Text style={styles.cardValue}>{lastSync ? formatDate(lastSync) : "Never"}</Text>
      </View>

      {/* Auto Sync Card */}
      <View style={styles.card}>
        <View style={styles.autoSyncRow}>
          <Text style={styles.cardLabel}>Auto Sync</Text>
          <Switch
            value={autoSyncEnabled}
            onValueChange={async (val) => {
              setAutoSyncEnabled(val);
              try {
                await AsyncStorage.setItem("snk_autoSyncEnabled", String(val));
              } catch (e) {
                console.error("Error saving autoSyncEnabled:", e);
              }
            }}
          />
        </View>

        {autoSyncEnabled && (
          <>
            <View style={styles.autoSyncRow}>
              <Text style={styles.cardLabel}>Wi-Fi Only</Text>
              <Switch
                value={wifiOnly}
                onValueChange={async (val) => {
                  setWifiOnly(val);
                  try {
                    await AsyncStorage.setItem("snk_wifiOnly", String(val));
                  } catch (e) {
                    console.error("Error saving wifiOnly:", e);
                  }
                }}
              />
            </View>

            <View style={styles.autoSyncRow}>
              <Text style={styles.cardLabel}>Status</Text>
              <View
                style={[
                  styles.statusIndicator,
                  status === "idle"
                    ? { backgroundColor: "#4caf50" }
                    : status === "syncing"
                    ? { backgroundColor: "#2196f3" }
                    : { backgroundColor: "#f44336" },
                ]}
              />
              <Text style={styles.cardValue}>{status}</Text>
            </View>

            {nextSync && (
              <View style={styles.autoSyncRow}>
                <Text style={styles.cardLabel}>Next Sync</Text>
                <Text style={styles.cardValue}>{formatDate(nextSync)}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.intervalRow}
              onPress={() => {
                setDraftInterval(intervalMs);
                setIntervalPopupVisible(true);
              }}
            >
              <Text style={styles.cardLabel}>Interval</Text>
              <Text>{`${days}d ${hours}h ${minutes}m`}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Interval Modal */}
      <Modal visible={intervalPopupVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Set Interval</Text>
            <Text>Minimum Interval Time : 1 Minute</Text>

            {["Days", "Hours", "Minutes"].map((label, index) => {
              const values = [dDays, dHours, dMinutes];
              return (
                <View key={index} style={styles.modalRow}>
                  <Text>{label}:</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="number-pad"
                    value={String(values[index])}
                    onChangeText={(val) => {
                      const num = Number(val) || 0;
                      let totalMs =
                        (index === 0 ? num * 24 * 60 * 60 * 1000 : dDays * 24 * 60 * 60 * 1000) +
                        (index === 1 ? num * 60 * 60 * 1000 : dHours * 60 * 60 * 1000) +
                        (index === 2 ? num * 60 * 1000 : dMinutes * 60 * 1000);
                      if (totalMs < 60 * 1000) totalMs = 60 * 1000;
                      setDraftInterval(totalMs);
                    }}
                  />
                </View>
              );
            })}

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setIntervalPopupVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setIntervalMs(Math.max(draftInterval, 60 * 1000));
                  setIntervalPopupVisible(false);
                }}
              >
                <Text>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Buttons Section */}
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#4babdd" }]}
          onPress={async () => {
            await sync(path_dict);
            await updateLastSync();
          }}
        >
          <View style={styles.actionContent}>
            <Image
              source={require("../Icons/CloudSyncIcon.png")}
              style={{ width: 24, height: 24, marginRight: 8 }}
            />
            <Text style={styles.buttonText}>Sync</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#4babdd" }]}
          onPress={async () => {
            await forceUpload(path_dict);
            await updateLastSync();
          }}
        >
          <View style={styles.actionContent}>
            <Image
              source={require("../Icons/CloudUploadIcon.png")}
              style={{ width: 24, height: 24, marginRight: 8 }}
            />
            <Text style={styles.buttonText}>Force Upload</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#4babdd" }]}
          onPress={async () => {
            await forceDownload(path_dict);
            await updateLastSync();
          }}
        >
          <View style={styles.actionContent}>
            <Image
              source={require("../Icons/CloudDownloadIcon.png")}
              style={{ width: 24, height: 24, marginRight: 8 }}
            />
            <Text style={styles.buttonText}>Force Download</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16 },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionContent: {
    flexDirection: "row", // Changed to 'row'
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLabel: { fontSize: 16, fontWeight: "700", color: "#333" },
  cardValue: { fontSize: 16, color: "#555" },
  autoSyncRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  intervalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    width: 60,
    textAlign: "center",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  modalButton: { padding: 10 },
});



// // this is my SyncUI do only required changes and give me full code
// import React, { useState, useEffect } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   Switch,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   Modal,
//   TextInput,
//   Alert,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import TopBar from "./Components/TopBarUI";

// import { useAutoSync } from "../Functions/AutoSyncFunctions";

// import { sync, forceUpload, forceDownload } from "../Functions/SyncFunctions";

// import { uiLog } from "../Functions/Logger";

// // ------------------------------------------------------------------------------------------------

// export const SyncUI = ({ path_dict, onLogout }: any) => {
//   const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
//   const [wifiOnly, setWifiOnly] = useState(false);
//   const [status, setStatus] = useState<"idle" | "syncing" | "error">("idle");
//   const [intervalMs, setIntervalMs] = useState<number>(24 * 60 * 60 * 1000); // default 24h
//   const [draftInterval, setDraftInterval] = useState<number>(24 * 60 * 60 * 1000);
//   const [intervalPopupVisible, setIntervalPopupVisible] = useState(false);
//   const [lastSync, setLastSync] = useState<number | null>(null);

//   // Load saved settings
//   useEffect(() => {
//     (async () => {
//       try {
//         const savedInterval = await AsyncStorage.getItem("snk_intervalMs");
//         if (savedInterval !== null) {
//           setIntervalMs(Number(savedInterval));
//           setDraftInterval(Number(savedInterval));
//         }
//         const savedWifi = await AsyncStorage.getItem("snk_wifiOnly");
//         if (savedWifi !== null) setWifiOnly(savedWifi === "true");
//         const savedLast = await AsyncStorage.getItem("snk_lastSyncTime");
//         if (savedLast) setLastSync(Number(savedLast));
//       } catch (e) {
//         console.error("Error loading settings:", e);
//       }
//     })();
//   }, []);

//   // Save interval when changed
//   useEffect(() => {
//     (async () => {
//       try {
//         await AsyncStorage.setItem("snk_intervalMs", String(intervalMs));
//       } catch (e) {
//         console.error("Error saving interval:", e);
//       }
//     })();
//   }, [intervalMs]);

//   // AutoSync Hook
//   useAutoSync(path_dict, autoSyncEnabled, {
//     intervalMs,
//     wifiOnly,
//     onStatus: async (s) => {
//       setStatus(s);
//       if (s === "idle") {
//         const now = Date.now();
//         await AsyncStorage.setItem("snk_lastSyncTime", String(now));
//         setLastSync(now);
//       }
//     },
//   });

//   // Helper for manual sync update
//   const updateLastSync = async () => {
//     const now = Date.now();
//     await AsyncStorage.setItem("snk_lastSyncTime", String(now));
//     setLastSync(now);
//   };

//   // Convert ms to d/h/m
//   const msToDHMS = (ms: number) => {
//     const days = Math.floor(ms / (24 * 60 * 60 * 1000));
//     const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
//     const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
//     return { days, hours, minutes };
//   };

//   const { days, hours, minutes } = msToDHMS(intervalMs);
//   const { days: dDays, hours: dHours, minutes: dMinutes } = msToDHMS(draftInterval);

//   const formatDate = (ms: number) => new Date(ms).toLocaleString();
//   const nextSync = lastSync ? lastSync + intervalMs : null;

//   return (
//     <SafeAreaView style={styles.container}>
//       <TopBar onLogout={onLogout} />

//       {/* Last Sync Card */}
//       <View style={styles.cardRow}>
//         <Text style={styles.cardLabel}>Last Sync</Text>
//         <Text style={styles.cardValue}>{lastSync ? formatDate(lastSync) : "Never"}</Text>
//       </View>

//       {/* Auto Sync Card */}
//       <View style={styles.card}>
//         <View style={styles.autoSyncRow}>
//           <Text style={styles.cardLabel}>Auto Sync</Text>
//           <Switch
//             value={autoSyncEnabled}
//             onValueChange={async (val) => {
//               setAutoSyncEnabled(val);
//               try {
//                 await AsyncStorage.setItem("snk_autoSyncEnabled", String(val));
//               } catch (e) {
//                 console.error("Error saving autoSyncEnabled:", e);
//               }
//             }}
//           />
//         </View>

//         {autoSyncEnabled && (
//           <>
//             <View style={styles.autoSyncRow}>
//               <Text style={styles.cardLabel}>Wi-Fi Only</Text>
//               <Switch
//                 value={wifiOnly}
//                 onValueChange={async (val) => {
//                   setWifiOnly(val);
//                   try {
//                     await AsyncStorage.setItem("snk_wifiOnly", String(val));
//                   } catch (e) {
//                     console.error("Error saving wifiOnly:", e);
//                   }
//                 }}
//               />
//             </View>

//             <View style={styles.autoSyncRow}>
//               <Text style={styles.cardLabel}>Status</Text>
//               <View
//                 style={[
//                   styles.statusIndicator,
//                   status === "idle"
//                     ? { backgroundColor: "#4caf50" }
//                     : status === "syncing"
//                     ? { backgroundColor: "#2196f3" }
//                     : { backgroundColor: "#f44336" },
//                 ]}
//               />
//               <Text style={styles.cardValue}>{status}</Text>
//             </View>

//             {nextSync && (
//               <View style={styles.autoSyncRow}>
//                 <Text style={styles.cardLabel}>Next Sync</Text>
//                 <Text style={styles.cardValue}>{formatDate(nextSync)}</Text>
//               </View>
//             )}

//             <TouchableOpacity
//               style={styles.intervalRow}
//               onPress={() => {
//                 setDraftInterval(intervalMs);
//                 setIntervalPopupVisible(true);
//               }}
//             >
//               <Text style={styles.cardLabel}>Interval</Text>
//               <Text>{`${days}d ${hours}h ${minutes}m`}</Text>
//             </TouchableOpacity>
//           </>
//         )}
//       </View>

//       {/* Interval Modal */}
//       <Modal visible={intervalPopupVisible} transparent animationType="fade">
//         <View style={styles.modalBackground}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>Set Interval</Text>
//             <Text>Minimum Interval Time : 1 Minute</Text>

//             {["Days", "Hours", "Minutes"].map((label, index) => {
//               const values = [dDays, dHours, dMinutes];
//               return (
//                 <View key={index} style={styles.modalRow}>
//                   <Text>{label}:</Text>
//                   <TextInput
//                     style={styles.modalInput}
//                     keyboardType="number-pad"
//                     value={String(values[index])}
//                     onChangeText={(val) => {
//                       const num = Number(val) || 0;
//                       let totalMs =
//                         (index === 0 ? num * 24 * 60 * 60 * 1000 : dDays * 24 * 60 * 60 * 1000) +
//                         (index === 1 ? num * 60 * 60 * 1000 : dHours * 60 * 60 * 1000) +
//                         (index === 2 ? num * 60 * 1000 : dMinutes * 60 * 1000);
//                       if (totalMs < 60 * 1000) totalMs = 60 * 1000;
//                       setDraftInterval(totalMs);
//                     }}
//                   />
//                 </View>
//               );
//             })}

//             <View style={styles.modalButtonRow}>
//               <TouchableOpacity
//                 style={styles.modalButton}
//                 onPress={() => setIntervalPopupVisible(false)}
//               >
//                 <Text>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalButton}
//                 onPress={() => {
//                   setIntervalMs(Math.max(draftInterval, 60 * 1000));
//                   setIntervalPopupVisible(false);
//                 }}
//               >
//                 <Text>Save</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Buttons Section */}
//       <ScrollView contentContainerStyle={styles.scroll}>
//         <TouchableOpacity
//           style={[styles.actionButton, { backgroundColor: "#4babdd" }]}
//           onPress={async () => {
//             await sync(path_dict);
//             await updateLastSync();
//           }}
//         >
//           <Image
//             source={require("../Icons/CloudSyncIcon.png")}
//             style={{ width: 24, height: 24, marginRight: 8 }}
//           />
//           <Text style={styles.buttonText}>Sync</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.actionButton, { backgroundColor: "#4babdd" }]}
//           onPress={async () => {
//             await forceUpload(path_dict);
//             await updateLastSync();
//           }}
//         >
//           <Image
//             source={require("../Icons/CloudUploadIcon.png")}
//             style={{ width: 24, height: 24, marginRight: 8 }}
//           />
//           <Text style={styles.buttonText}>Force Upload</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.actionButton, { backgroundColor: "#4babdd" }]}
//           onPress={async () => {
//             await forceDownload(path_dict);
//             await updateLastSync();
//           }}
//         >
//           <Image
//             source={require("../Icons/CloudDownloadIcon.png")}
//             style={{ width: 24, height: 24, marginRight: 8 }}
//           />
//           <Text style={styles.buttonText}>Force Download</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// // Styles remain unchanged
// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   scroll: { padding: 16 },
//   actionButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 12,
//   },
//   buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
//   card: {
//     backgroundColor: "#fff",
//     padding: 16,
//     marginHorizontal: 16,
//     marginVertical: 8,
//     borderRadius: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   cardRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     padding: 16,
//     marginHorizontal: 16,
//     marginVertical: 8,
//     borderRadius: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   cardLabel: { fontSize: 16, fontWeight: "700", color: "#333" },
//   cardValue: { fontSize: 16, color: "#555" },
//   autoSyncRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginVertical: 4,
//   },
//   statusIndicator: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     marginRight: 6,
//   },
//   intervalRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 8,
//   },
//   modalBackground: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContainer: {
//     width: "80%",
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 12,
//   },
//   modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
//   modalRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   modalInput: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     width: 60,
//     textAlign: "center",
//   },
//   modalButtonRow: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginTop: 20,
//   },
//   modalButton: { padding: 10 },
// });


// ------------------------------------------------------------------------------------------------

export function confirmForceUpload(): Promise<boolean> {
  uiLog("Initialize Function : confirmForceUpload")
  return new Promise((resolve) => {
    Alert.alert(
      "⚠️ Force Upload",
      "This will remove files from S3 that don’t exist locally.\nDo you want to continue?",
      [
        { text: "Cancel", onPress: () => resolve(false), style: "cancel" },
        { text: "Confirm", onPress: () => resolve(true), style: "destructive" },
      ],
      { cancelable: false }
    );
  });
  uiLog("Terminate Function : confirmForceUpload")
}


export function confirmForceDownload(): Promise<boolean> {
  uiLog("Initialize Function : confirmForceDownload")
  return new Promise((resolve) => {
    Alert.alert(
      "⚠️ Force Download",
      "This will delete files from your local storage that don’t exist in S3.\nDo you want to continue?",
      [
        { text: "Cancel", onPress: () => resolve(false), style: "cancel" },
        { text: "Confirm", onPress: () => resolve(true), style: "destructive" },
      ],
      { cancelable: false }
    );
  });
  uiLog("Terminate Function : confirmForceDownload")
}
