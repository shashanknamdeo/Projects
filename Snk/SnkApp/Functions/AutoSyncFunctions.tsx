// Functions/AutoSyncFunctions.tsx

import { 
  useEffect, 
  useRef
  } from "react";

import { 
  AppState, 
  AppStateStatus,
  Alert,
  } from "react-native";

import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { sync } from "./SyncFunctions";
import { functionLog } from "./Logger";

type AutoSyncOptions = {
  intervalMs?: number;   // default 5 min
  wifiOnly?: boolean;    // default false
  onStatus?: (status: "idle" | "syncing" | "error") => void;
};

const LAST_SYNC_KEY = "snk_lastSyncTime";

export function useAutoSync(
  path_dict: any,
  enabled: boolean,
  opts: AutoSyncOptions = {}
) {
  functionLog("Initialize Function : autoSync");
  // functionLog(`intervalMs : ${intervalMs}`)
  const { intervalMs = 1 * 60 * 1000, wifiOnly = true, onStatus } = opts;

  const isSyncingRef = useRef(false);
  const intervalRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);

  async function getLastSync(): Promise<number | null> {
    try {
      const v = await AsyncStorage.getItem(LAST_SYNC_KEY);
      return v ? parseInt(v, 10) : null;
    } catch {
      return null;
    }
  }

  async function setLastSyncNow() {
    try {
      await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
      functionLog("Saved lastSyncTime");
    } catch (err) {
      console.warn("setLastSyncNow error", err);
    }
  }

  async function doSync() {
    functionLog("####################################################################################################");
    functionLog("Initialize Function : doSync");
    if (!enabled) return;
    if (!path_dict?.local_root_folder_path || !path_dict?.s3_data_folder_path) return;
    // 
    if (isSyncingRef.current) {
    functionLog("Skipped: another sync already in progress");
    Alert.alert("Sync in Progress", "Auto Sync tried to start syncing while another sync was already running");
    return;
    }
    // 
    let state;
    try {
      state = await NetInfo.fetch();
      if (!state.isConnected) {
        functionLog("AutoSync skipped: offline");
        return;
      }
      if (wifiOnly && state.type !== "wifi") {
        functionLog("AutoSync skipped: not on wifi");
        Alert.alert("Auto Sync skipped", "Not conected to Wi-Fi");
        return;
      }
    } catch (e) {
      functionLog("AutoSync NetInfo error", e);
    }
    // 
    try {
      functionLog(`Start doSync - Internet Status : ${state} | Internet Type : ${state.type} | Wi-Fi Setting : ${wifiOnly} `)
      isSyncingRef.current = true;
      onStatus?.("syncing");
      functionLog("AutoSync: starting sync()");
      await sync(path_dict);
      // 
      // ✅ Save last sync timestamp
      await setLastSyncNow();
      // 
      onStatus?.("idle");
      functionLog("Terminate Function : doSync");
      // 
    } catch (err) {
      console.error("AutoSync error:", err);
      onStatus?.("error");
    } finally {
      isSyncingRef.current = false;
    }
  }

  useEffect(() => {
    // cleanup any old timers
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!enabled) return;

    (async () => {
      const lastSync = await getLastSync();
      const now = Date.now();

      if (!lastSync) {
        // First time → wait full interval before first sync
        functionLog(`No lastSync found — scheduling in ${intervalMs} ms`);
        timeoutRef.current = setTimeout(() => {
          doSync();
          intervalRef.current = setInterval(doSync, intervalMs);
        }, intervalMs);
      } else {
        const elapsed = now - lastSync;
        if (elapsed >= intervalMs) {
          // Overdue → run now
          functionLog("Last sync overdue — running immediately");
          // 
          await doSync(`now : ${now} | lastSync : ${lastSync} | elapsed : ${elapsed} | intervalMs : ${intervalMs}`);
          // 
          intervalRef.current = setInterval(doSync, intervalMs);
        } else {
          functionLog(`intervalMs : ${intervalMs} | elapsed : ${elapsed}`)
          const remaining = intervalMs - elapsed;
          functionLog(`Scheduling first autosync in ${remaining} ms`);
          timeoutRef.current = setTimeout(() => {
            doSync();
            intervalRef.current = setInterval(doSync, intervalMs);
          }, remaining);
        }
      }
    })();

    // ✅ Sync when app foregrounded
    const sub = AppState.addEventListener("change", async (state: AppStateStatus) => {
      if (state === "active") {
        const lastSync = await getLastSync();
        const now = Date.now();
        if (!lastSync || now - lastSync >= intervalMs) {
          functionLog("App foregrounded — overdue sync triggered");
          doSync();
        }
      }
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      try {
        sub.remove();
      } catch {}
    };
  }, [enabled, path_dict, intervalMs, wifiOnly]);

  functionLog("Terminate Function : autoSync");
}


// this is my AutoSyncFunctions do only required changes and give me full code


// ===================================================================================================