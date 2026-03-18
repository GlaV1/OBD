// ============================================================
// context/BluetoothContext.tsx
// ============================================================

import {
  createContext, useContext, useState,
  useEffect, useRef, useCallback, ReactNode
} from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DEV_MODE = true; // false → gerçek Bluetooth

const BT_DEVICE_KEY = 'obd_bt_device';

export type ConnectionStatus = 'disconnected' | 'scanning' | 'connecting' | 'connected' | 'error';

export interface VehicleData {
  rpm: number; speed: number; engineTemp: number;
  battery: number; throttle: number; fuelLevel: number;
  dtcs: { code: string; description: string }[];
}

export interface BTDevice { name: string; address: string; }

interface BluetoothContextType {
  status: ConnectionStatus; lastError: string | null;
  vehicleData: VehicleData; devices: BTDevice[];
  connectedDevice: BTDevice | null;
  scan: () => Promise<void>;
  connect: (device: BTDevice) => Promise<void>;
  disconnect: () => void;
  sendCommand: (cmd: string) => void;
}

const DEFAULT_DATA: VehicleData = {
  rpm: 0, speed: 0, engineTemp: 0,
  battery: 12.4, throttle: 0, fuelLevel: 75, dtcs: [],
};

const BluetoothContext = createContext<BluetoothContextType>({
  status: 'disconnected', lastError: null,
  vehicleData: DEFAULT_DATA, devices: [], connectedDevice: null,
  scan: async () => {}, connect: async () => {},
  disconnect: () => {}, sendCommand: () => {},
});

function useSimulatedData(active: boolean) {
  const [data, setData] = useState<VehicleData>(DEFAULT_DATA);
  useEffect(() => {
    if (!active) return;
    let rpm = 800;
    const interval = setInterval(() => {
      rpm += Math.floor(Math.random() * 300) - 100;
      if (rpm < 800) rpm = 800;
      if (rpm > 6000) rpm = 6000;
      setData(prev => ({
        rpm, speed: Math.max(0, Math.min(220, Math.round(rpm / 35))),
        engineTemp: Math.min(105, prev.engineTemp + 0.3),
        battery: parseFloat((14.0 + Math.random() * 0.4).toFixed(1)),
        throttle: Math.round(((rpm - 800) / (6000 - 800)) * 100),
        fuelLevel: 75, dtcs: [],
      }));
    }, 500);
    return () => clearInterval(interval);
  }, [active]);
  return data;
}

export function BluetoothProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>(DEV_MODE ? 'connected' : 'disconnected');
  const [lastError, setLastError] = useState<string | null>(null);
  const [devices, setDevices] = useState<BTDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BTDevice | null>(
    DEV_MODE ? { name: 'Simülasyon', address: '00:00:00:00:00:00' } : null
  );
  const [realData, setRealData] = useState<VehicleData>(DEFAULT_DATA);
  const btRef = useRef<any>(null);
  const bufferRef = useRef<string>('');
  const subscriptionRef = useRef<any>(null);

  const simData = useSimulatedData(DEV_MODE);
  const vehicleData = DEV_MODE ? simData : realData;

  const getBT = useCallback(async () => {
    if (btRef.current) return btRef.current;
    try {
      const RNBluetoothClassic = require('react-native-bluetooth-classic').default;
      btRef.current = RNBluetoothClassic;
      return RNBluetoothClassic;
    } catch {
      setLastError('Bluetooth modülü yüklenemedi.');
      return null;
    }
  }, []);

  const connect = useCallback(async (device: BTDevice) => {
    if (DEV_MODE) { setConnectedDevice(device); setStatus('connected'); return; }
    const bt = await getBT();
    if (!bt) return;
    setStatus('connecting');
    setLastError(null);
    try {
      const conn = await bt.connect(device.address, { delimiter: '\n' });
      setConnectedDevice(device);
      setStatus('connected');
      await AsyncStorage.setItem(BT_DEVICE_KEY, JSON.stringify(device));
      await conn.write('CONNECT\n');

      subscriptionRef.current = conn.onDataReceived((event: { data: string }) => {
        bufferRef.current += event.data;
        const lines = bufferRef.current.split('\n');
        bufferRef.current = lines.pop() ?? '';
        for (const line of lines) {
          try {
            const p = JSON.parse(line.trim());
            if (typeof p.rpm === 'number') {
              setRealData({ rpm: p.rpm, speed: p.speed ?? 0, engineTemp: p.engineTemp ?? 0,
                battery: p.battery ?? 12.4, throttle: p.throttle ?? 0,
                fuelLevel: p.fuelLevel ?? 75, dtcs: p.dtcs ?? [] });
              setLastError(null);
            }
          } catch {}
        }
      });

      conn.onDisconnected(() => {
        subscriptionRef.current?.remove();
        setStatus('error');
        setLastError('Bluetooth bağlantısı kesildi.');
      });
    } catch (e: any) {
      setLastError('Bağlantı kurulamadı: ' + (e?.message ?? ''));
      setStatus('error');
    }
  }, [getBT]);

  // Uygulama açılınca kayıtlı cihaza otomatik bağlan
  useEffect(() => {
    if (DEV_MODE) return;
    AsyncStorage.getItem(BT_DEVICE_KEY).then(saved => {
      if (saved) { try { connect(JSON.parse(saved)); } catch {} }
    });
  }, []);

  const scan = useCallback(async () => {
    if (DEV_MODE) {
      setDevices([{ name: 'HC-06 (Simüle)', address: '00:00:00:00:00:01' }]);
      return;
    }
    const bt = await getBT();
    if (!bt) return;
    setStatus('scanning');
    try {
      if (Platform.OS === 'android') await bt.requestBluetoothEnabled();
      setDevices(await bt.getBondedDevices());
      setStatus('disconnected');
    } catch (e: any) {
      setLastError('Tarama başarısız: ' + (e?.message ?? ''));
      setStatus('error');
    }
  }, [getBT]);

  const disconnect = useCallback(() => {
    subscriptionRef.current?.remove();
    try { btRef.current?.disconnect(); } catch {}
    setStatus('disconnected');
    setConnectedDevice(null);
    setLastError(null);
    bufferRef.current = '';
  }, []);

  const sendCommand = useCallback((cmd: string) => {
    if (DEV_MODE) { console.log('[DEV] BT:', cmd); return; }
    try { btRef.current?.write(cmd + '\n'); } catch {}
  }, []);

  useEffect(() => {
    if (DEV_MODE) return;
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active' && status === 'error' && connectedDevice) connect(connectedDevice);
    });
    return () => sub.remove();
  }, [status, connectedDevice]);

  return (
    <BluetoothContext.Provider value={{
      status, lastError, vehicleData, devices, connectedDevice,
      scan, connect, disconnect, sendCommand,
    }}>
      {children}
    </BluetoothContext.Provider>
  );
}

export function useBluetooth() { return useContext(BluetoothContext); }

export function getBTStatusColor(status: ConnectionStatus): string {
  switch (status) {
    case 'connected':    return '#4ade80';
    case 'connecting':
    case 'scanning':     return '#facc15';
    case 'error':        return '#f87171';
    case 'disconnected': return '#555555';
  }
}

export function getBTStatusText(status: ConnectionStatus): string {
  switch (status) {
    case 'connected':    return DEV_MODE ? '🛠 Geliştirme Modu' : 'HC-06 Bağlı';
    case 'connecting':   return 'Bağlanıyor...';
    case 'scanning':     return 'Cihazlar aranıyor...';
    case 'error':        return 'Bluetooth Hatası';
    case 'disconnected': return 'Bluetooth Bağlı Değil';
  }
}
