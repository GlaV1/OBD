import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../utils/app_theme.dart';

class LiveDataSelectionScreen extends StatefulWidget {
  const LiveDataSelectionScreen({super.key});

  @override
  State<LiveDataSelectionScreen> createState() =>
      _LiveDataSelectionScreenState();
}

class _LiveDataSelectionScreenState extends State<LiveDataSelectionScreen> {
  static const _allParams = [
    _Param('rpm', 'Motor Devri', 'RPM', Icons.speed),
    _Param('speed', 'Hız', 'km/h', Icons.directions_car),
    _Param('engineTemp', 'Motor Sıcaklığı', '°C', Icons.thermostat),
    _Param('battery', 'Akü Voltajı', 'V', Icons.battery_charging_full),
    _Param('throttle', 'Gaz Kelebeği', '%', Icons.tune),
    _Param('fuelLevel', 'Yakıt Seviyesi', '%', Icons.local_gas_station),
    _Param('intakeTemp', 'Emme Havası Sıcaklığı', '°C', Icons.air),
    _Param('maf', 'MAF Sensörü', 'g/s', Icons.sensors),
    _Param('o2Sensor', 'O2 Sensörü', 'V', Icons.bubble_chart),
    _Param('fuelPressure', 'Yakıt Basıncı', 'kPa', Icons.compress),
    _Param('manifoldPressure', 'Manifold Basıncı', 'kPa', Icons.gas_meter),
    _Param('timingAdvance', 'Ateşleme Avansı', '°', Icons.flash_on),
  ];

  final Set<String> _selected = {
    'rpm', 'speed', 'engineTemp', 'battery', 'throttle', 'fuelLevel'
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Veri Seçimi'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/live-data'),
        ),
        actions: [
          TextButton(
            onPressed: () => context.go('/live-data'),
            child: const Text('Uygula',
                style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline, color: AppTheme.primary, size: 18),
                const SizedBox(width: 8),
                Text('${_selected.length} / ${_allParams.length} parametre seçili',
                    style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _allParams.length,
              itemBuilder: (context, i) {
                final p = _allParams[i];
                final isSelected = _selected.contains(p.key);
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppTheme.primary.withValues(alpha: 0.1)
                        : AppTheme.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: isSelected
                        ? Border.all(color: AppTheme.primary.withValues(alpha: 0.4))
                        : null,
                  ),
                  child: CheckboxListTile(
                    value: isSelected,
                    onChanged: (_) => setState(() {
                      if (isSelected) {
                        _selected.remove(p.key);
                      } else {
                        _selected.add(p.key);
                      }
                    }),
                    activeColor: AppTheme.primary,
                    secondary: Icon(p.icon,
                        color: isSelected
                            ? AppTheme.primary
                            : AppTheme.textSecondary),
                    title: Text(p.label,
                        style: const TextStyle(color: AppTheme.textPrimary)),
                    subtitle: Text(p.unit,
                        style: const TextStyle(
                            color: AppTheme.textSecondary, fontSize: 12)),
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

class _Param {
  final String key;
  final String label;
  final String unit;
  final IconData icon;
  const _Param(this.key, this.label, this.unit, this.icon);
}
