import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../utils/app_theme.dart';

class ServiceResetScreen extends StatelessWidget {
  const ServiceResetScreen({super.key});

  static const _services = [
    _Service('Yağ Değişimi Sıfırlama', Icons.oil_barrel),
    _Service('Hava Filtresi Sıfırlama', Icons.air),
    _Service('Fren Bakımı Sıfırlama', Icons.directions_car),
    _Service('Gaz Kelebeği Kalibrasyonu', Icons.tune),
    _Service('DPF Regenerasyon', Icons.local_fire_department),
    _Service('Adaptasyon Sıfırlama', Icons.settings_backup_restore),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Servis Sıfırlama'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/dashboard'),
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _services.length,
        itemBuilder: (context, i) {
          final s = _services[i];
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: BorderRadius.circular(12),
            ),
            child: ListTile(
              leading: Icon(s.icon, color: AppTheme.primary),
              title: Text(s.title,
                  style: const TextStyle(color: AppTheme.textPrimary)),
              trailing: TextButton(
                onPressed: () => _confirm(context, s.title),
                child: const Text('Sıfırla',
                    style: TextStyle(color: AppTheme.warning)),
              ),
            ),
          );
        },
      ),
    );
  }

  void _confirm(BuildContext context, String title) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppTheme.surface,
        title: const Text('Onay',
            style: TextStyle(color: AppTheme.textPrimary)),
        content: Text('$title işlemi yapılsın mı?',
            style: const TextStyle(color: AppTheme.textSecondary)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('İptal'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Onayla'),
          ),
        ],
      ),
    );
  }
}

class _Service {
  final String title;
  final IconData icon;
  const _Service(this.title, this.icon);
}
