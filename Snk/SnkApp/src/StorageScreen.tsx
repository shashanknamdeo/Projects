// import React, { useState, useEffect } from "react";
// import { View, Button, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
// import * as DocumentPicker from "expo-document-picker";
// import { Storage } from "aws-amplify";

// export default function StorageScreen() {
//   const [fileUrl, setFileUrl] = useState<string | null>(null);
//   const [files, setFiles] = useState<string[]>([]);

//   // Fetch all files in S3 on mount
//   useEffect(() => {
//     listFiles();
//   }, []);

//   const listFiles = async () => {
//     try {
//       const result = await Storage.list(''); // List all files
//       const fileNames = result.map((item: any) => item.key);
//       setFiles(fileNames);
//     } catch (err) {
//       console.log("Error listing files:", err);
//       Alert.alert("Error listing files", err.message ?? JSON.stringify(err));
//     }
//   };

//   const uploadFile = async () => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({});
//       if (result.type === "success") {
//         const response = await fetch(result.uri);
//         const blob = await response.blob();
//         await Storage.put(result.name, blob);
//         Alert.alert("Uploaded:", result.name);
//         listFiles(); // Refresh file list
//       }
//     } catch (err) {
//       console.log("Error uploading file:", err);
//       Alert.alert("Error uploading file", err.message ?? JSON.stringify(err));
//     }
//   };

//   const downloadFile = async (fileName: string) => {
//     try {
//       const url = await Storage.get(fileName);
//       setFileUrl(url);
//     } catch (err) {
//       console.log("Error downloading file:", err);
//       Alert.alert("Error downloading file", err.message ?? JSON.stringify(err));
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Button title="Upload File" onPress={uploadFile} />

//       <Text style={styles.heading}>Files in S3:</Text>
//       {files.length === 0 && <Text>No files uploaded yet.</Text>}

//       {files.map((fileName) => (
//         <View key={fileName} style={styles.fileRow}>
//           <Text style={styles.fileName}>{fileName}</Text>
//           <TouchableOpacity style={styles.downloadButton} onPress={() => downloadFile(fileName)}>
//             <Text style={styles.downloadText}>Download</Text>
//           </TouchableOpacity>
//         </View>
//       ))}

//       {fileUrl && (
//         <View style={{ marginTop: 20 }}>
//           <Text style={{ fontWeight: "bold" }}>Download URL:</Text>
//           <Text selectable>{fileUrl}</Text>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//   },
//   heading: {
//     marginTop: 20,
//     marginBottom: 10,
//     fontWeight: "bold",
//     fontSize: 18,
//   },
//   fileRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#ccc",
//     paddingVertical: 5,
//   },
//   fileName: {
//     flex: 1,
//     fontSize: 16,
//   },
//   downloadButton: {
//     backgroundColor: "#007bff",
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//   },
//   downloadText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
// });
