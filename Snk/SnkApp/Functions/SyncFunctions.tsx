// import path from "path"; Not in react native

import RNFS from 'react-native-fs';

import { 
  getProperties,
  list,
  getUrl,
} from 'aws-amplify/storage';

import {
  Alert,
} from 'react-native';

import CryptoJS from 'crypto-js';

import {functionLog} from './Logger'

import {
  listS3Files,
  removeListLocalFiles,
  removeListRemoteFiles,
  uploadLocalStorageFilesToS3,
  uploadListLocalStorageFilesToS3,
  downloadFileFromS3ToLocalStorage,
  downloadListFilesFromS3ToLocalStorage,
} from './StorageScreenFunctions'

import {
  confirmForceUpload,
  confirmForceDownload,
  } from '../UI/SyncUI'

functionLog("Initialize File -> SyncFunctions")

// ------------------------------------------------------------------------------------------------


type ManifestEntry = {
  path: string;         // Relative path of the file
  etag: string;         // MD5 hash
  lastModified: string; // ISO timestamp
  size: number;         // File size in bytes
};

type Manifest = {
  generatedAt: string;
  files: Record<string, ManifestEntry>;
};


export async function getLocalFileMD5(filePath: string): Promise<string> {
  functionLog("Initialize Function : getLocalFileMD5");
  try {
    const hash = await RNFS.hash(filePath, 'md5');
    return hash;
  } catch (err) {
    console.error('Error getting MD5 of local file', err);
    throw err;
  }
  functionLog("Terminate Function : getLocalFileMD5")
}


// ✅ Main Function: Create Manifest
export async function createLocalManifest(path_dict){
  functionLog("Initialize Function : createLocalManifest")
  try{
    const files = await listLocalFilesRecursively(path_dict.local_root_folder_path);
    const manifest: Manifest = {
      generatedAt: new Date().toISOString(),
      files: {}
    };
    // 
    for (const file of files) {
      try {
        const stat = await RNFS.stat(file);
        const md5 = await getLocalFileMD5(file);
        // Store relative path (without root)
        const relativePath = file.replace(`${path_dict.local_root_folder_path}/`, '');
  
        manifest.files[relativePath] = {
          path: relativePath,
          etag: md5,
          lastModified: new Date(stat.mtime ?? Date.now()).toISOString(),
          size: stat.size
        };
        functionLog(`file : ${file}  |  lastModified : : ${new Date(stat.mtime ?? Date.now()).toISOString()}  |  size : : ${stat.size}  | md5 : ${md5}`)
      } catch (err) {
        console.warn(`Error createLocalManifest : ⚠️ Could not process file: ${file}`, err);
      }
    }
    functionLog(['Local Manifest :', JSON.stringify(manifest.files, null, 2)])
    // Save manifest JSON file
    await RNFS.writeFile(path_dict.local_manifest_file_path, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`✅ Local manifest created at: ${path_dict.local_manifest_file_path}`);
    // 
  } catch (err) {
    console.error('Error createLocalManifest:', err);
    Alert.alert('Error', 'Failed to createLocalManifest files.');
  }
  functionLog("Terminate Function : createLocalManifest");
}


// ------------------------------------------------------------------------------------------------


export async function listLocalFilesRecursively(path: string): Promise<string[]> {
  functionLog("Initialize Function : listLocalFilesRecursively")
  // 
  let results: string[] = [];
  // 
  try {
    const items = await RNFS.readDir(path); // list files & folders in dir

    for (const item of items) {
      if (item.isFile()) {
        results.push(item.path);
      } else if (item.isDirectory()) {
        // recursively go deeper
        const nested = await listLocalFilesRecursively(item.path);
        results = results.concat(nested);
      }
    }
    return results;
  } catch (err) {
    console.error("Error listLocalFilesRecursively:", err);
  }
  functionLog("Terminate Function : listLocalFilesRecursively");
}


// ------------------------------------------------------------------------------------------------


export async function getS3ManifestFile(path_dict) {
  functionLog("Initialize Function : getS3ManifestFile");
  try {
    // Check if S3 Manifest Exists
    functionLog("Check S3 Manifest ----------------------------------------------------------------------------------");
    let s3ManifestExists = false;
    try {
      const files = await listS3Files(path_dict.s3_manifest_folder_path);
      functionLog(["S3_manifest_folder files :", files]);

      if (files.includes("s3_manifest.json")) {
        s3ManifestExists = true;
      }
    } catch (err) {
      functionLog("list() failed while checking S3 manifest");
    }

    if (s3ManifestExists) {
      // Download existing S3 manifest
      functionLog("s3_manifest.json found - Download S3 Manifest ------------------------------------------------------");
      await downloadFileFromS3ToLocalStorage( "s3_manifest.json", path_dict.s3_manifest_folder_path, path_dict.local_manifest_folder_path);
    } else {
      // Create empty manifest structure
      functionLog("s3_manifest.json not found - Create Fresh Empty S3 Manifest ----------------------------------------");
      const emptyManifest = {
        generatedAt: new Date().toISOString(),
        files: {},
      };
      await RNFS.writeFile(
        path_dict.local_s3_manifest_file_path,
        JSON.stringify(emptyManifest, null, 2),
        "utf8"
      );
    }

    functionLog("Terminate Function : getS3ManifestFile");
  } catch (err) {
    functionLog(`Error getS3ManifestFile : ${err}`);
  }
}


// ------------------------------------------------------------------------------------------------


interface ManifestFile {
  path: string;
  etag: string;
  lastModified: string;
  size: number;
}

interface ManifestComparison {
  onlyInLocal: string[];
  onlyInRemote: string[];
  modified: string[];
  same: string[];
}

export async function compareManifests( folderPath: string, localManifestFileName: string, remoteManifestFileName: string ): Promise<ManifestComparison | null> {
  functionLog("Initialize Function : compareManifests");
  // 
  try {
    // Read both manifest files
    const localPath = `${folderPath}/${localManifestFileName}`;
    const remotePath = `${folderPath}/${remoteManifestFileName}`;

    const localExists = await RNFS.exists(localPath);
    const remoteExists = await RNFS.exists(remotePath);

    if (!localExists || !remoteExists) {
      console.warn("⚠️ One or both manifest files are missing.");
      return null;
    }

    const localContent = await RNFS.readFile(localPath, 'utf8');
    const remoteContent = await RNFS.readFile(remotePath, 'utf8');

    const localManifest: Manifest = JSON.parse(localContent);
    const remoteManifest: Manifest = JSON.parse(remoteContent);

    const onlyInLocal: string[] = [];
    const onlyInRemote: string[] = [];
    const modified: string[] = [];
    const same: string[] = [];

    // Compare manifests
    const allKeys = new Set([
      ...Object.keys(localManifest.files),
      ...Object.keys(remoteManifest.files),
    ]);

    for (const key of allKeys) {
      const localFile = localManifest.files[key];
      const remoteFile = remoteManifest.files[key];

      if (localFile && !remoteFile) {
        onlyInLocal.push(key);
      } else if (!localFile && remoteFile) {
        onlyInRemote.push(key);
      } else if (localFile && remoteFile) {
        // Compare checksum and size
        if (
          localFile.etag !== remoteFile.etag ||
          localFile.size !== remoteFile.size
        ) {
          modified.push(key);
        } else {
          same.push(key);
        }
      }
    }
    // 
    const result: ManifestComparison = { onlyInLocal, onlyInRemote, modified, same,};
    // 
    return result;
  } catch (err) {
    console.error("⚠️ Error comparing manifests:", err);
  }
  functionLog("Terminate Function : compareManifests");
}


// ------------------------------------------------------------------------------------------------


export async function compareModifiedFiles(list_modified_files, path_dict) {
  functionLog("Initialize Function : compareModifiedFiles")
  try{
    // Load manifests from local storage
    const localManifestRaw = await RNFS.readFile(path_dict.local_manifest_file_path, "utf8");
    const s3ManifestRaw = await RNFS.readFile(path_dict.local_s3_manifest_file_path, "utf8");
    // 
    const localManifest: Manifest = JSON.parse(localManifestRaw);
    const s3Manifest: Manifest = JSON.parse(s3ManifestRaw);
    // 
    const latestLocal: string[] = [];
    const latestRemote: string[] = [];
    // 
    for (const file of list_modified_files) {
      const localEntry = localManifest.files[file];
      const s3Entry = s3Manifest.files[file];
      // 
      // Compare timestamps
      const localTime = new Date(localEntry.lastModified).getTime();
      const remoteTime = new Date(s3Entry.lastModified).getTime();
      // 
      // Seprate local_latest and remote_latest
      if (localTime > remoteTime) {
        latestLocal.push(file);
      } else if (remoteTime > localTime) {
        latestRemote.push(file);
      }
    }
    return {local_latest : latestLocal, remote_latest : latestRemote}
    } catch (err) {
    console.error('compareModifiedFiles error:', err);
    Alert.alert('Error', 'Failed to compareModifiedFiles.');
  }
  functionLog("Terminate Function : compareModifiedFiles")
}


// ------------------------------------------------------------------------------------------------


export async function generateManifestComparison(path_dict) {
  functionLog("Initialize Function : generateManifestComparison")
  try{
    // Create New Manifest
    functionLog('Create New Manifest -------------------------------------------------------------------------------')
    await createLocalManifest(path_dict)
    // 
    // Download S3 Manifest
    functionLog('Get S3 Manifest ------------------------------------------------------------------------------')
    functionLog(`s3_manifest_folder_path : ${path_dict.s3_manifest_folder_path}`)
    await getS3ManifestFile(path_dict)
    // 
    // Compare Manifest Response
    functionLog('Compare Manifest Response -------------------------------------------------------------------------')
    const compare_manifest_response =  await compareManifests( path_dict.local_manifest_folder_path, 'manifest.json', 's3_manifest.json')
    await compare_manifest_response.promise
    // 
    functionLog(compare_manifest_response)
    return compare_manifest_response
  } catch (err) {
    console.error('generateManifestComparison error:', err);
    Alert.alert('Error', 'Failed to generateManifestComparison.');
  }
  functionLog("Terminate Function : generateManifestComparison")
}


// ------------------------------------------------------------------------------------------------


export async function sync(path_dict){
  functionLog("Initialize Function : sync")
  try{
    // Compare Local and S3 files
    const compare_manifest_response = await generateManifestComparison(path_dict)
    compare_manifest_response.promise
    // 
    // Download Only-In-Remote Files
    functionLog('Download Only-In-Remote Files ---------------------------------------------------------------------')
    await downloadListFilesFromS3ToLocalStorage(compare_manifest_response.onlyInRemote, path_dict.s3_data_folder_path, path_dict.local_root_folder_path)
    // 
    // Upload Only-In-Local Files
    functionLog('Upload Only-In-Local Files ------------------------------------------------------------------------')
    await uploadListLocalStorageFilesToS3(compare_manifest_response.onlyInLocal, path_dict.local_root_folder_path, path_dict.s3_data_folder_path)
    // 
    // Resolve Modified Files
    functionLog('Resolve Modified Files ----------------------------------------------------------------------------')
    const modified_files_response = await compareModifiedFiles(compare_manifest_response.modified, path_dict)
    await downloadListFilesFromS3ToLocalStorage(modified_files_response.remote_latest, path_dict.s3_data_folder_path, path_dict.local_root_folder_path)
    await uploadListLocalStorageFilesToS3(modified_files_response.local_latest, path_dict.local_root_folder_path, path_dict.s3_data_folder_path)
    // 
    // upload new manifest to s3
    functionLog('Upload New Manifest To S3 -------------------------------------------------------------------------')
    await createLocalManifest(path_dict)
    uploadLocalStorageFilesToS3(null, path_dict.local_manifest_file_path, path_dict.s3_manifest_file_path)
    // 
    Alert.alert('Sync', 'Sync successful.');
  } catch (err) {
    console.error('sync error:', err);
    Alert.alert('Error', 'Failed to sync.');
  }
  functionLog("Terminate Function : sync")
}


export async function forceDownload (path_dict) {
  functionLog("Initialize Function : forceDownload")
  try{
    const response = await confirmForceDownload()
    if (response === true) {
      functionLog('forceDownload - Confirmed')
      // 
      // Compare Local and S3 files
      const compare_manifest_response = await generateManifestComparison(path_dict)
      await compare_manifest_response.promise
      // 
      // Download Only-In-Remote Files
      functionLog('Download Only-In-Remote Files ---------------------------------------------------------------------')
      await downloadListFilesFromS3ToLocalStorage(compare_manifest_response.onlyInRemote, path_dict.s3_data_folder_path, path_dict.local_root_folder_path)
      // 
      // Download Remote Version Of Modified Files 
      functionLog('Download Remote Version Of Modified Files ---------------------------------------------------------')
      await downloadListFilesFromS3ToLocalStorage(compare_manifest_response.modified, path_dict.s3_data_folder_path, path_dict.local_root_folder_path)
      // 
      // Remove Only-In-Local Files
      functionLog('Remove Only-In-Local Files ------------------------------------------------------------------------')
      await removeListLocalFiles(path_dict.local_root_folder_path, compare_manifest_response.onlyInLocal)
      // 
      Alert.alert('Force Download', 'Force Download successful.');
    } 
    else if (response === false){
      functionLog('forceDownload - Cancel')
    }
  } catch (err) {
    console.error('forceDownload error:', err);
    Alert.alert('Error', 'Failed to Force Download files.');
  }
  functionLog("Terminate Function : forceDownload")
};


export async function forceUpload (path_dict) {
  functionLog("Initialize Function : forceUpload")
  try{
    const response = await confirmForceUpload()
    if (response === true) {
      functionLog('forceUpload - Confirmed')
      // 
      // Compare Local and S3 files
      const compare_manifest_response = await generateManifestComparison(path_dict)
      await compare_manifest_response.promise
      // 
      // Upload Only-In-Local Files
      functionLog('Upload Only-In-Local Files ------------------------------------------------------------------------')
      await uploadListLocalStorageFilesToS3(compare_manifest_response.onlyInLocal, path_dict.local_root_folder_path, path_dict.s3_data_folder_path)
      // 
      // Upload Local Version Of Modified Files
      functionLog('Upload Local Version Of Modified Files ------------------------------------------------------------')
      const modified_files_response = await compareModifiedFiles(compare_manifest_response.modified, path_dict)
      await uploadListLocalStorageFilesToS3(modified_files_response.local_latest, path_dict.local_root_folder_path, path_dict.s3_data_folder_path)
      // 
      // Remove Only-In-Remote Files
      functionLog('Remove Only-In-Remote Files -----------------------------------------------------------------------')
      await removeListRemoteFiles(path_dict.s3_data_folder_path, compare_manifest_response.onlyInRemote)
      // 
      // upload local manifest to s3
      await uploadLocalStorageFilesToS3(null, path_dict.local_manifest_file_path, path_dict.s3_manifest_file_path)
      // 
      Alert.alert('Force Upload', 'Force Upload successful.');
    } 
    else if (response === false){
      functionLog('forceUpload - Cancel')
    }
  } catch (err) {
    console.error('forceUpload error:', err);
    Alert.alert('Error', 'Failed to Force Upload files.');
  }
  functionLog("Terminate Function : forceUpload")
};


// ------------------------------------------------------------------------------------------------


// export async function getLocalFileTimestamp(filePath: string): Promise<Date | null> {
//   try {
//     const stat = await RNFS.stat(filePath);
//     // stat.mtime is a Date object (last modified time)
//     return stat.mtime ?? null;
//   } catch (err) {
//     console.error("Error fetching local file timestamp:", err);
//     return null;
//   }
// }



// export async function getS3FileTimestamp(s3Path: string): Promise<Date | null> {
// // Get the last modified timestamp of a file in S3
// // s3Path = Path of the file in S3 (e.g., "public/Folder1/file.jpg")
// // returns Date | null
//   try {
//     const result = await getProperties({ path: s3Path });

//     if (result?.lastModified) {
//       return result.lastModified; // already a Date object
//     }

//     return null;
//   } catch (err) {
//     console.error("Error fetching S3 file timestamp:", err);
//     return null;
//   }
// }


// ------------------------------------------------------------------------------------------------


// export async function getS3ETag(s3Path: string): Promise<string> {
//   try {
//     const result = await getProperties({ path: s3Path });
//     // result.eTag comes with quotes sometimes -> remove them
//     return result.eTag.replace(/"/g, '');
//   } catch (err) {
//     console.error('Error getting S3 ETag', err);
//     throw err;
//   }
// }


// export async function compareLocalWithS3(localPath: string, s3Path: string): Promise<boolean> {
//   try {
//     const [localMD5, s3ETag] = await Promise.all([
//       getLocalFileMD5(localPath),
//       getS3ETag(s3Path),
//     ]);

//     console.log('Local MD5:', localMD5);
//     console.log('S3 ETag:', s3ETag);

//     if (localMD5 === s3ETag){
//       return true
//     }
//     else {
//       return false
//     };
//   } catch (err) {
//     console.error('Error comparing file and S3', err);
//   }
// }


// export async function listS3FilesRecursively(prefix: string): Promise<string[]> {
//   let results: string[] = [];
//   let nextToken: string | undefined = undefined;

//   try {
//     do {
//       const response = await list({
//         path: prefix,
//         options: { nextToken },
//       });

//       // Collect file paths (only actual objects, not "folders")
//       response.items.forEach(item => {
//         if (item.path) {
//           results.push(item.path);
//         }
//       });

//       // Check if there are more files (pagination) BECAUSE 'List' API GIVE LIST OF OBJECT IN PAGES
//       nextToken = response.nextToken;
//     } while (nextToken);
//   } catch (err) {
//     console.error("Error listing S3 files:", err);
//   }

//   return results;
// }


// export function compareLocalAndS3( localFiles: string[], s3Files: string[], localRoot: string, s3Root: string){
// // 
// // Compare local and S3 file lists
// //    localFiles - Array of local file paths (absolute)
// //    s3Files - Array of S3 file paths (with s3Root prefix)
// //    localRoot - The root folder of local files (to normalize relative paths)
// //    s3Root - The root prefix of S3 files (e.g., "public/", "protected/123/")
// // 
//   // Convert absolute local paths → relative paths
//   const localRelative = localFiles.map(file =>
//     path.relative(localRoot, file).replace(/\\/g, "/") // normalize Windows paths
//   );

//   // Convert S3 paths → relative paths (remove s3Root)
//   const s3Relative = s3Files.map(file => file.replace(new RegExp(`^${s3Root}`), ""));

//   const localSet = new Set(localRelative);
//   const s3Set = new Set(s3Relative);

//   // Find differences
//   const onlyLocal = [...localSet].filter(f => !s3Set.has(f)); // files only in local
//   const onlyS3 = [...s3Set].filter(f => !localSet.has(f));     // files only in S3
//   const common = [...localSet].filter(f => s3Set.has(f));      // files in both

//   return { onlyLocal, onlyS3, common };
// }

