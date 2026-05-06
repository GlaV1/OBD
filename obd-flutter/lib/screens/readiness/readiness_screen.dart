import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../utils/app_theme.dart';

class ReadinessScreen extends StatelessWidget {
  const ReadinessScreen({super.key});

  static const _tests = [
    'Katalitik Konvertör',
    'Isıtmalı Katalitik Konvertör',
    'Buharlaşma Sistemi',
    'İkincil Hava Sistemi',
    'A/C Soğutucu',
    'Oksijen Sensörü',
    'Oksijen Sensörü Isıtıcısı',
    'EGR Sistemi',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Hazırlık Testleri'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/dashboard'),
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _tests.length,
        itemBuilder: (context, i) => Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.surface,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              const Icon(Icons.radio_button_unchecked,
                  color: AppTheme.textSecondary, size: 20),
              const SizedBox(width: 12),
              Text(_tests[i],
                  style: const TextStyle(color: AppTheme.textPrimary)),
              const Spacer(),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.textSecondary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text('Bekleniyor',
                    style: TextStyle(
                        color: AppTheme.textSecondary, fontSize: 12)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
