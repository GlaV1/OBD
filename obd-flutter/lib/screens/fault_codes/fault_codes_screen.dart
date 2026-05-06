import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/bluetooth_provider.dart';
import '../../services/dtc_service.dart';
import '../../utils/app_theme.dart';

class FaultCodesScreen extends StatelessWidget {
  const FaultCodesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Hata Kodları'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/dashboard'),
        ),
      ),
      body: Consumer<BluetoothProvider>(
        builder: (context, bt, _) {
          if (!bt.isConnected) {
            return const Center(
              child: Text('Araç bağlı değil.',
                  style: TextStyle(color: AppTheme.textSecondary)),
            );
          }
          if (bt.dtcCodes.isEmpty) {
            return const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.check_circle_outline,
                      size: 64, color: AppTheme.success),
                  SizedBox(height: 16),
                  Text('Hata kodu bulunamadı.',
                      style: TextStyle(
                          color: AppTheme.textPrimary,
                          fontSize: 16,
                          fontWeight: FontWeight.bold)),
                  SizedBox(height: 8),
                  Text('Araç sistemi normal görünüyor.',
                      style: TextStyle(color: AppTheme.textSecondary)),
                ],
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: bt.dtcCodes.length,
            itemBuilder: (context, i) {
              final dtc = bt.dtcCodes[i];
              final desc = DtcService().lookup(dtc.code);
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: AppTheme.error.withValues(alpha: 0.4),
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppTheme.error.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(dtc.code,
                          style: const TextStyle(
                              color: AppTheme.error,
                              fontWeight: FontWeight.bold,
                              fontSize: 13)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(desc,
                          style: const TextStyle(
                              color: AppTheme.textPrimary, fontSize: 13)),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}
