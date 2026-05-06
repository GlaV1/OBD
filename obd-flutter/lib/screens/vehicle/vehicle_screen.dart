import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/vehicle_provider.dart';
import '../../models/vehicle.dart';
import '../../utils/app_theme.dart';

class VehicleScreen extends StatefulWidget {
  const VehicleScreen({super.key});

  @override
  State<VehicleScreen> createState() => _VehicleScreenState();
}

class _VehicleScreenState extends State<VehicleScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('OBD Diagnostik',
            style: TextStyle(fontWeight: FontWeight.bold)),
        bottom: TabBar(
          controller: _tabs,
          indicatorColor: AppTheme.primary,
          labelColor: AppTheme.primary,
          unselectedLabelColor: AppTheme.textSecondary,
          tabs: const [
            Tab(text: 'Araç Seç'),
            Tab(text: 'Kayıtlı Araçlar'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabs,
        children: const [
          _NewVehicleTab(),
          _SavedVehiclesTab(),
        ],
      ),
    );
  }
}

class _NewVehicleTab extends StatefulWidget {
  const _NewVehicleTab();

  @override
  State<_NewVehicleTab> createState() => _NewVehicleTabState();
}

class _NewVehicleTabState extends State<_NewVehicleTab> {
  final _formKey = GlobalKey<FormState>();
  final _brandCtrl = TextEditingController();
  final _modelCtrl = TextEditingController();
  final _yearCtrl = TextEditingController();
  final _plateCtrl = TextEditingController();
  final _vinCtrl = TextEditingController();

  @override
  void dispose() {
    _brandCtrl.dispose();
    _modelCtrl.dispose();
    _yearCtrl.dispose();
    _plateCtrl.dispose();
    _vinCtrl.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    final vehicle = Vehicle(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      brand: _brandCtrl.text.trim(),
      model: _modelCtrl.text.trim(),
      year: int.parse(_yearCtrl.text.trim()),
      plate: _plateCtrl.text.trim().isEmpty ? null : _plateCtrl.text.trim(),
      vin: _vinCtrl.text.trim().isEmpty ? null : _vinCtrl.text.trim(),
    );
    final provider = context.read<VehicleProvider>();
    provider.saveVehicle(vehicle);
    provider.selectVehicle(vehicle);
    context.go('/connect');
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 8),
            _Field(ctrl: _brandCtrl, label: 'Marka', hint: 'Toyota, BMW...', required: true),
            const SizedBox(height: 12),
            _Field(ctrl: _modelCtrl, label: 'Model', hint: 'Corolla, 3 Serisi...', required: true),
            const SizedBox(height: 12),
            _Field(
              ctrl: _yearCtrl,
              label: 'Yıl',
              hint: '2020',
              required: true,
              keyboard: TextInputType.number,
              validator: (v) {
                final y = int.tryParse(v ?? '');
                if (y == null || y < 1990 || y > 2030) return 'Geçerli bir yıl girin';
                return null;
              },
            ),
            const SizedBox(height: 12),
            _Field(ctrl: _plateCtrl, label: 'Plaka (opsiyonel)', hint: '34 ABC 123'),
            const SizedBox(height: 12),
            _Field(ctrl: _vinCtrl, label: 'VIN (opsiyonel)', hint: 'WBSBL91020PN12345'),
            const SizedBox(height: 28),
            ElevatedButton.icon(
              onPressed: _submit,
              icon: const Icon(Icons.bluetooth_searching),
              label: const Text('Bağlantıya Geç', style: TextStyle(fontSize: 16)),
            ),
          ],
        ),
      ),
    );
  }
}

class _Field extends StatelessWidget {
  final TextEditingController ctrl;
  final String label;
  final String hint;
  final bool required;
  final TextInputType keyboard;
  final String? Function(String?)? validator;

  const _Field({
    required this.ctrl,
    required this.label,
    required this.hint,
    this.required = false,
    this.keyboard = TextInputType.text,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: ctrl,
      keyboardType: keyboard,
      style: const TextStyle(color: AppTheme.textPrimary),
      decoration: InputDecoration(labelText: label, hintText: hint),
      validator: validator ??
          (required
              ? (v) => (v == null || v.trim().isEmpty) ? '$label gerekli' : null
              : null),
    );
  }
}

class _SavedVehiclesTab extends StatelessWidget {
  const _SavedVehiclesTab();

  @override
  Widget build(BuildContext context) {
    return Consumer<VehicleProvider>(
      builder: (context, provider, _) {
        if (provider.savedVehicles.isEmpty) {
          return const Center(
            child: Text('Henüz kayıtlı araç yok.',
                style: TextStyle(color: AppTheme.textSecondary)),
          );
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: provider.savedVehicles.length,
          itemBuilder: (context, i) {
            final v = provider.savedVehicles[i];
            final isSelected = provider.selectedVehicle?.id == v.id;
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppTheme.primary.withValues(alpha: 0.15)
                    : AppTheme.surface,
                borderRadius: BorderRadius.circular(12),
                border: isSelected
                    ? Border.all(color: AppTheme.primary, width: 1.5)
                    : null,
              ),
              child: ListTile(
                leading: const Icon(Icons.directions_car, color: AppTheme.primary),
                title: Text(v.displayName,
                    style: const TextStyle(color: AppTheme.textPrimary)),
                subtitle: v.plate != null
                    ? Text(v.plate!,
                        style: const TextStyle(color: AppTheme.textSecondary))
                    : null,
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.delete_outline,
                          color: AppTheme.error, size: 20),
                      onPressed: () => provider.deleteVehicle(v.id),
                    ),
                    const Icon(Icons.chevron_right, color: AppTheme.textSecondary),
                  ],
                ),
                onTap: () {
                  provider.selectVehicle(v);
                  context.go('/connect');
                },
              ),
            );
          },
        );
      },
    );
  }
}
