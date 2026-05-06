import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/bluetooth_provider.dart';
import '../../providers/vehicle_provider.dart';
import '../../utils/app_theme.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  static const _modules = [
    _Module('Canlı Veri', Icons.speed, '/live-data', AppTheme.primary),
    _Module('Hata Kodları', Icons.warning_amber, '/fault-codes', Color(0xFFFF9800)),
    _Module('Araç Bilgisi', Icons.info_outline, '/vehicle-info', Color(0xFF2196F3)),
    _Module('Freeze Frame', Icons.pause_circle_outline, '/freeze-frame', Color(0xFF9C27B0)),
    _Module('Hazırlık Testi', Icons.check_circle_outline, '/readiness', Color(0xFF4CAF50)),
    _Module('Servis Sıfırla', Icons.build_outlined, '/service-reset', Color(0xFFFF5722)),
    _Module('Randevular', Icons.calendar_today, '/appointments', Color(0xFF00BCD4)),
    _Module('Ayarlar', Icons.settings_outlined, '/settings', Color(0xFF607D8B)),
  ];

  @override
  Widget build(BuildContext context) {
    final vehicle = context.watch<VehicleProvider>().selectedVehicle;
    final bt = context.watch<BluetoothProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(vehicle?.displayName ?? 'Dashboard',
            style: const TextStyle(fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.bluetooth_connected, color: AppTheme.primary),
          onPressed: () {},
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.directions_car),
            onPressed: () => context.go('/vehicle'),
          ),
        ],
      ),
      body: Column(
        children: [
          _StatusBar(bt: bt),
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.1,
              ),
              itemCount: _modules.length,
              itemBuilder: (context, i) => _ModuleCard(module: _modules[i]),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusBar extends StatelessWidget {
  final BluetoothProvider bt;
  const _StatusBar({required this.bt});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(
            bt.isConnected ? Icons.bluetooth_connected : Icons.bluetooth_disabled,
            color: bt.isConnected ? AppTheme.success : AppTheme.error,
            size: 18,
          ),
          const SizedBox(width: 8),
          Text(
            bt.isConnected
                ? '${bt.connectedDevice} bağlı'
                : 'Bağlantı yok',
            style: TextStyle(
              color: bt.isConnected ? AppTheme.success : AppTheme.error,
              fontSize: 13,
            ),
          ),
          const Spacer(),
          if (bt.isConnected) ...[
            const Icon(Icons.speed, color: AppTheme.textSecondary, size: 16),
            const SizedBox(width: 4),
            Text('${bt.liveData.rpm} RPM',
                style: const TextStyle(
                    color: AppTheme.textSecondary, fontSize: 13)),
          ],
        ],
      ),
    );
  }
}

class _Module {
  final String title;
  final IconData icon;
  final String route;
  final Color color;
  const _Module(this.title, this.icon, this.route, this.color);
}

class _ModuleCard extends StatelessWidget {
  final _Module module;
  const _ModuleCard({required this.module});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.go(module.route),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: module.color.withValues(alpha: 0.3),
            width: 1,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: module.color.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(module.icon, color: module.color, size: 28),
            ),
            const SizedBox(height: 12),
            Text(
              module.title,
              style: const TextStyle(
                color: AppTheme.textPrimary,
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
