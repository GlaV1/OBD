import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_bluetooth_serial/flutter_bluetooth_serial.dart';
import '../../providers/bluetooth_provider.dart';
import '../../providers/vehicle_provider.dart';
import '../../utils/app_theme.dart';

class ConnectScreen extends StatefulWidget {
  const ConnectScreen({super.key});

  @override
  State<ConnectScreen> createState() => _ConnectScreenState();
}

class _ConnectScreenState extends State<ConnectScreen> {
  List<BluetoothDevice> _devices = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadDevices();
  }

  Future<void> _loadDevices() async {
    setState(() => _loading = true);
    try {
      final bt = context.read<BluetoothProvider>();
      _devices = await bt.getBondedDevices();
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _connect(BluetoothDevice device) async {
    final bt = context.read<BluetoothProvider>();
    try {
      await bt.connect(device);
      if (mounted) context.go('/dashboard');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Bağlantı hatası: $e'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final vehicle = context.watch<VehicleProvider>().selectedVehicle;
    final bt = context.watch<BluetoothProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Bluetooth Bağlantısı'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/vehicle'),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadDevices,
          ),
        ],
      ),
      body: Column(
        children: [
          if (vehicle != null)
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.surface,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.directions_car, color: AppTheme.primary),
                  const SizedBox(width: 12),
                  Text(vehicle.displayName,
                      style: const TextStyle(
                          color: AppTheme.textPrimary,
                          fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          if (bt.state == BtState.connecting)
            const Expanded(
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(color: AppTheme.primary),
                    SizedBox(height: 16),
                    Text('Bağlanıyor...',
                        style: TextStyle(color: AppTheme.textSecondary)),
                  ],
                ),
              ),
            )
          else if (_loading)
            const Expanded(
              child: Center(
                child: CircularProgressIndicator(color: AppTheme.primary),
              ),
            )
          else if (_devices.isEmpty)
            Expanded(
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.bluetooth_disabled,
                        size: 64, color: AppTheme.textSecondary),
                    const SizedBox(height: 16),
                    const Text('Eşleştirilmiş cihaz bulunamadı.',
                        style: TextStyle(color: AppTheme.textSecondary)),
                    const SizedBox(height: 8),
                    const Text(
                        'Telefon Bluetooth ayarlarından HC-06\'yı eşleştirin.',
                        style: TextStyle(
                            color: AppTheme.textSecondary, fontSize: 12),
                        textAlign: TextAlign.center),
                    const SizedBox(height: 24),
                    ElevatedButton(
                        onPressed: _loadDevices,
                        child: const Text('Tekrar Dene')),
                  ],
                ),
              ),
            )
          else
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _devices.length,
                itemBuilder: (context, i) {
                  final device = _devices[i];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    decoration: BoxDecoration(
                      color: AppTheme.surface,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: ListTile(
                      leading: const Icon(Icons.bluetooth,
                          color: AppTheme.primary),
                      title: Text(device.name ?? 'Bilinmeyen Cihaz',
                          style:
                              const TextStyle(color: AppTheme.textPrimary)),
                      subtitle: Text(device.address,
                          style:
                              const TextStyle(color: AppTheme.textSecondary)),
                      trailing: ElevatedButton(
                        onPressed: () => _connect(device),
                        child: const Text('Bağlan'),
                      ),
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}
