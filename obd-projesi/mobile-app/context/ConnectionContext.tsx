import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVER_URL_KEY = 'obd_server_url';
const DEFAULT_URL = 'http://192.168.1.1:3000';
const MAX_RECONNECT_ATTEMPTS = 5;

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface ConnectionContextType {
  status: ConnectionStatus;
  serverUrl: string;
  setServerUrl: (url: string) => Promise<void>;
  connect: () => void;
  disconnect: () => void;
  lastError: string | null;
  reconnectAttempt: number;
}

const ConnectionContext = createContext<ConnectionContextType>({
  status: 'disconnected',
  serverUrl: DEFAULT_URL,
  setServerUrl: async () => {},
  connect: () => {},
  disconnect: () => {},
  lastError: null,
  reconnectAttempt: 0,
});

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [serverUrl, setServerUrlState] = useState(DEFAULT_URL);
  const [lastError, setLastError] = useState<string | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const intentionalDisconnect = useRef(false);

  // AsyncStorage'dan URL'yi güvenli yükle
  useEffect(() => {
    const loadUrl = async () => {
      try {
        const saved = await AsyncStorage.getItem(SERVER_URL_KEY);
        if (saved && saved.startsWith('http')) {
          setServerUrlState(saved);
        }
      } catch {
        // Okunamazsa varsayılanı kullan
      }
    };
    loadUrl();
  }, []);

  // Uygulama arka plandan öne gelince yeniden bağlan
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active' && status === 'error' && !intentionalDisconnect.current) {
        connect();
      }
    });
    return () => subscription.remove();
  }, [status]);

  const setServerUrl = async (url: string) => {
    try {
      const trimmed = url.trim();
      setServerUrlState(trimmed);
      await AsyncStorage.setItem(SERVER_URL_KEY, trimmed);
    } catch {
      setServerUrlState(url.trim());
    }
  };

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;
    if (status === 'connecting') return; // çift tıklama koruması

    intentionalDisconnect.current = false;
    setStatus('connecting');
    setLastError(null);
    setReconnectAttempt(0);

    const socket = io(serverUrl, {
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });

    socket.on('connect', () => {
      setStatus('connected');
      setLastError(null);
      setReconnectAttempt(0);
    });

    socket.on('disconnect', (reason) => {
      if (intentionalDisconnect.current) {
        setStatus('disconnected');
        setLastError(null);
        return;
      }
      setStatus('error');
      if (reason === 'io server disconnect') {
        setLastError('OBD cihazı bağlantıyı kesti.');
      } else if (reason === 'transport close') {
        setLastError('Bağlantı kesildi. Yeniden bağlanılıyor...');
      } else {
        setLastError('Bağlantı kesildi.');
      }
    });

    socket.on('reconnect_attempt', (attempt: number) => {
      setReconnectAttempt(attempt);
      setLastError(`Yeniden bağlanılıyor... (${attempt}/${MAX_RECONNECT_ATTEMPTS})`);
    });

    socket.on('reconnect', () => {
      setStatus('connected');
      setLastError(null);
      setReconnectAttempt(0);
    });

    socket.on('reconnect_failed', () => {
      setStatus('error');
      setLastError('OBD cihazına ulaşılamıyor. IP adresini kontrol edin.');
    });

    socket.on('connect_error', () => {
      setStatus('error');
      setLastError('OBD cihazına ulaşılamıyor. IP adresini kontrol edin.');
    });

    socketRef.current = socket;
  }, [serverUrl, status]);

  const disconnect = () => {
    intentionalDisconnect.current = true;
    socketRef.current?.disconnect();
    socketRef.current = null;
    setStatus('disconnected');
    setLastError(null);
    setReconnectAttempt(0);
  };

  useEffect(() => {
    return () => {
      intentionalDisconnect.current = true;
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <ConnectionContext.Provider value={{
      status, serverUrl, setServerUrl,
      connect, disconnect, lastError, reconnectAttempt,
    }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  return useContext(ConnectionContext);
}

export function getStatusColor(status: ConnectionStatus): string {
  switch (status) {
    case 'connected':    return '#4ade80';
    case 'connecting':   return '#facc15';
    case 'error':        return '#f87171';
    case 'disconnected': return '#555555';
  }
}

export function getStatusText(status: ConnectionStatus): string {
  switch (status) {
    case 'connected':    return 'OBD Bağlı';
    case 'connecting':   return 'Bağlanıyor...';
    case 'error':        return 'Bağlantı Hatası';
    case 'disconnected': return 'Bağlı Değil';
  }
}

// Tüm ekranlarda kullanılacak güvenli AsyncStorage fonksiyonları
export async function safeStorageGet<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    try { await AsyncStorage.removeItem(key); } catch {}
    return fallback;
  }
}

export async function safeStorageSet(key: string, value: unknown): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
