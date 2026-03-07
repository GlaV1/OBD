import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVER_URL_KEY = 'obd_server_url';
const DEFAULT_URL = 'http://192.168.1.1:3000'; // Varsayılan, ayarlardan değiştirilecek

// --- TİPLER ---
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface ConnectionContextType {
  status: ConnectionStatus;           // Anlık bağlantı durumu
  serverUrl: string;                  // Bağlantı adresi
  setServerUrl: (url: string) => void;
  connect: () => void;               // Manuel bağlan
  disconnect: () => void;            // Manuel kopar
  lastError: string | null;          // Son hata mesajı
}

// --- CONTEXT ---
const ConnectionContext = createContext<ConnectionContextType>({
  status: 'disconnected',
  serverUrl: DEFAULT_URL,
  setServerUrl: () => {},
  connect: () => {},
  disconnect: () => {},
  lastError: null,
});

// --- PROVIDER ---
export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [serverUrl, setServerUrlState] = useState(DEFAULT_URL);
  const [lastError, setLastError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Kaydedilmiş URL'yi yükle
  useEffect(() => {
    AsyncStorage.getItem(SERVER_URL_KEY).then(url => {
      if (url) setServerUrlState(url);
    });
  }, []);

  const setServerUrl = async (url: string) => {
    setServerUrlState(url);
    await AsyncStorage.setItem(SERVER_URL_KEY, url);
  };

  const connect = () => {
    if (socketRef.current?.connected) return;

    setStatus('connecting');
    setLastError(null);

    const socket = io(serverUrl, {
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      setStatus('connected');
      setLastError(null);
    });

    socket.on('disconnect', (reason) => {
      setStatus('disconnected');
      if (reason === 'io server disconnect') {
        setLastError('Sunucu bağlantıyı kesti.');
      }
    });

    socket.on('connect_error', (err) => {
      setStatus('error');
      setLastError('OBD cihazına ulaşılamıyor. IP adresini kontrol edin.');
    });

    socketRef.current = socket;
  };

  const disconnect = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setStatus('disconnected');
  };

  // Component unmount olunca bağlantıyı kapat
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <ConnectionContext.Provider value={{
      status,
      serverUrl,
      setServerUrl,
      connect,
      disconnect,
      lastError,
    }}>
      {children}
    </ConnectionContext.Provider>
  );
}

// --- HOOK ---
export function useConnection() {
  return useContext(ConnectionContext);
}

// --- YARDIMCI ---
export function getStatusColor(status: ConnectionStatus): string {
  switch (status) {
    case 'connected':    return '#4ade80';
    case 'connecting':   return '#facc15';
    case 'error':        return '#f87171';
    case 'disconnected': return '#555';
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
