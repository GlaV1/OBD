import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/bluetooth_provider.dart';
import '../../models/obd_data.dart';
import '../../utils/app_theme.dart';

class LiveDataScreen extends StatelessWidget {
  const LiveDataScreen({super.key});

  List<_CardConfig> _buildCards(ObdLiveData d) => [
        _CardConfig(
          label: 'Motor Devri',
          value: '${d.rpm}',
          unit: 'RPM',
          icon: Icons.speed,
          color: AppTheme.primary,
          max: 8000,
          current: d.rpm.toDouble(),
        ),
        _CardConfig(
          label: 'Hız',
          value: '${d.speed}',
          unit: 'km/h',
          icon: Icons.directions_car,
          color: const Color(0xFF4CAF50),
          max: 260,
          current: d.speed.toDouble(),
        ),
        _CardConfig(
          label: 'Su Sıcaklığı',
          value: '${d.engineTemp}',
          unit: '°C',
          icon: Icons.thermostat,
          color: d.engineTemp > 105 ? AppTheme.error : const Color(0xFFFF9800),
          max: 130,
          current: d.engineTemp.toDouble(),
          warning: d.engineTemp > 105,
        ),
        _CardConfig(
          label: 'Yağ Sıcaklığı',
          value: '${d.oilTemp}',
          unit: '°C',
          icon: Icons.opacity,
          color: d.oilTemp > 130 ? AppTheme.error : const Color(0xFFFF6F00),
          max: 160,
          current: d.oilTemp.toDouble(),
          warning: d.oilTemp > 130,
          unsupported: d.oilTemp == 0,
        ),
        _CardConfig(
          label: 'Turbo Basıncı',
          value: '${d.manifoldPressure}',
          unit: 'kPa',
          icon: Icons.compress,
          color: const Color(0xFF7C4DFF),
          max: 250,
          current: d.manifoldPressure.toDouble(),
        ),
        _CardConfig(
          label: 'Emme Hava Sıc.',
          value: '${d.intakeTemp}',
          unit: '°C',
          icon: Icons.air,
          color: const Color(0xFF00BFA5),
          max: 80,
          current: d.intakeTemp.toDouble(),
        ),
        _CardConfig(
          label: 'MAF Hava Akışı',
          value: d.maf.toStringAsFixed(1),
          unit: 'g/s',
          icon: Icons.sensors,
          color: const Color(0xFF2196F3),
          max: 200,
          current: d.maf,
        ),
        _CardConfig(
          label: 'O2 Sensörü',
          value: d.o2Voltage.toStringAsFixed(2),
          unit: 'V',
          icon: Icons.bubble_chart,
          color: const Color(0xFF9C27B0),
          max: 1.2,
          current: d.o2Voltage,
        ),
        _CardConfig(
          label: 'EGR Oranı',
          value: '${d.egrPercent}',
          unit: '%',
          icon: Icons.loop,
          color: const Color(0xFF607D8B),
          max: 100,
          current: d.egrPercent.toDouble(),
        ),
        _CardConfig(
          label: 'Gaz Kelebeği',
          value: '${d.throttle}',
          unit: '%',
          icon: Icons.tune,
          color: const Color(0xFFFF5722),
          max: 100,
          current: d.throttle.toDouble(),
        ),
        _CardConfig(
          label: 'Yakıt Seviyesi',
          value: '${d.fuelLevel}',
          unit: '%',
          icon: Icons.local_gas_station,
          color: d.fuelLevel < 15 ? AppTheme.error : const Color(0xFFFFB300),
          max: 100,
          current: d.fuelLevel.toDouble(),
          warning: d.fuelLevel < 15,
        ),
        _CardConfig(
          label: 'Akü Voltajı',
          value: d.battery.toStringAsFixed(1),
          unit: 'V',
          icon: Icons.battery_charging_full,
          color: d.battery < 11.5 ? AppTheme.error : const Color(0xFF43A047),
          max: 15,
          current: d.battery,
          warning: d.battery < 11.5,
        ),
      ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Canlı Veri'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/dashboard'),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune),
            tooltip: 'Parametre Seç',
            onPressed: () => context.go('/live-data-selection'),
          ),
        ],
      ),
      body: Consumer<BluetoothProvider>(
        builder: (context, bt, _) {
          if (!bt.isConnected) {
            return const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.bluetooth_disabled,
                      size: 64, color: AppTheme.textSecondary),
                  SizedBox(height: 16),
                  Text('Araç bağlı değil.',
                      style: TextStyle(color: AppTheme.textSecondary)),
                ],
              ),
            );
          }
          final cards = _buildCards(bt.liveData);
          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.05,
            ),
            itemCount: cards.length,
            itemBuilder: (context, i) => _DataCard(config: cards[i]),
          );
        },
      ),
    );
  }
}

class _CardConfig {
  final String label;
  final String value;
  final String unit;
  final IconData icon;
  final Color color;
  final double max;
  final double current;
  final bool warning;
  final bool unsupported;

  const _CardConfig({
    required this.label,
    required this.value,
    required this.unit,
    required this.icon,
    required this.color,
    required this.max,
    required this.current,
    this.warning = false,
    this.unsupported = false,
  });
}

class _DataCard extends StatelessWidget {
  final _CardConfig config;
  const _DataCard({required this.config});

  @override
  Widget build(BuildContext context) {
    final pct = (config.current / config.max).clamp(0.0, 1.0);
    final c = config.color;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: config.warning
              ? AppTheme.error.withValues(alpha: 0.6)
              : c.withValues(alpha: 0.25),
          width: config.warning ? 1.5 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(config.icon, color: c, size: 16),
              const SizedBox(width: 5),
              Expanded(
                child: Text(config.label,
                    style: const TextStyle(
                        color: AppTheme.textSecondary, fontSize: 10.5),
                    overflow: TextOverflow.ellipsis),
              ),
              if (config.warning)
                const Icon(Icons.warning_amber,
                    color: AppTheme.error, size: 14),
              if (config.unsupported)
                const Icon(Icons.help_outline,
                    color: AppTheme.textSecondary, size: 14),
            ],
          ),
          const Spacer(),
          config.unsupported
              ? const Text('Desteklenmiyor',
                  style: TextStyle(
                      color: AppTheme.textSecondary, fontSize: 11))
              : RichText(
                  text: TextSpan(
                    text: config.value,
                    style: TextStyle(
                        color: c,
                        fontSize: 26,
                        fontWeight: FontWeight.bold),
                    children: [
                      TextSpan(
                        text: ' ${config.unit}',
                        style: const TextStyle(
                            color: AppTheme.textSecondary,
                            fontSize: 11,
                            fontWeight: FontWeight.normal),
                      ),
                    ],
                  ),
                ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: pct,
              backgroundColor: c.withValues(alpha: 0.12),
              valueColor: AlwaysStoppedAnimation(c),
              minHeight: 4,
            ),
          ),
        ],
      ),
    );
  }
}
