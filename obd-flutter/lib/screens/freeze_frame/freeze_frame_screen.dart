import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../utils/app_theme.dart';

class FreezeFrameScreen extends StatelessWidget {
  const FreezeFrameScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Freeze Frame'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/dashboard'),
        ),
      ),
      body: const Center(
        child: Text('Freeze frame verisi mevcut değil.',
            style: TextStyle(color: AppTheme.textSecondary)),
      ),
    );
  }
}
