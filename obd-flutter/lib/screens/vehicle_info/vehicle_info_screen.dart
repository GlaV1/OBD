import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/vehicle_provider.dart';
import '../../utils/app_theme.dart';

class VehicleInfoScreen extends StatelessWidget {
  const VehicleInfoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final vehicle = context.watch<VehicleProvider>().selectedVehicle;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Araç Bilgisi'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/dashboard'),
        ),
      ),
      body: vehicle == null
          ? const Center(
              child: Text('Araç seçili değil.',
                  style: TextStyle(color: AppTheme.textSecondary)),
            )
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _InfoCard(items: [
                  _InfoRow('Marka', vehicle.brand),
                  _InfoRow('Model', vehicle.model),
                  _InfoRow('Yıl', vehicle.year.toString()),
                  if (vehicle.plate != null) _InfoRow('Plaka', vehicle.plate!),
                  if (vehicle.vin != null) _InfoRow('VIN', vehicle.vin!),
                ]),
              ],
            ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final List<_InfoRow> items;
  const _InfoCard({required this.items});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: items
            .asMap()
            .entries
            .map((e) => Column(
                  children: [
                    e.value,
                    if (e.key < items.length - 1)
                      Divider(
                          height: 1,
                          color: AppTheme.textSecondary.withValues(alpha: 0.1)),
                  ],
                ))
            .toList(),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  const _InfoRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(color: AppTheme.textSecondary)),
          Text(value,
              style: const TextStyle(
                  color: AppTheme.textPrimary, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
