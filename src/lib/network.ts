import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

let cachedState: NetInfoState | null = null;
NetInfo.addEventListener(state => {
  cachedState = state;
});

export const isOnline = async (): Promise<boolean> => {
  try {
    const state = cachedState ?? (await NetInfo.fetch());
    cachedState = state;
    if (state.isConnected === false) return false;
    if (state.isInternetReachable === false) return false;
    return true;
  } catch {
    return true;
  }
};

export const useOnline = (): boolean => {
  const [online, setOnline] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    isOnline().then(v => mounted && setOnline(v));
    const unsub = NetInfo.addEventListener(state => {
      if (!mounted) return;
      const reachable = state.isConnected !== false && state.isInternetReachable !== false;
      setOnline(reachable);
    });
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  return online;
};
