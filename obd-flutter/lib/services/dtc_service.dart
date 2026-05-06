import 'dart:convert';
import 'package:flutter/services.dart';

class DtcService {
  static final DtcService _instance = DtcService._();
  factory DtcService() => _instance;
  DtcService._();

  Map<String, String>? _masterDb;

  Future<void> init() async {
    if (_masterDb != null) return;
    final raw = await rootBundle.loadString('assets/data/dtc_master.json');
    final decoded = jsonDecode(raw) as Map<String, dynamic>;
    _masterDb = decoded.map((k, v) => MapEntry(k, v.toString()));
  }

  String lookup(String code) {
    final upper = code.toUpperCase();
    return _masterDb?[upper] ?? 'Bilinmeyen hata kodu';
  }

  Future<Map<String, String>> loadBrandDb(String brand) async {
    try {
      final raw = await rootBundle.loadString('assets/data/${brand.toLowerCase()}.json');
      final decoded = jsonDecode(raw) as Map<String, dynamic>;
      return decoded.map((k, v) => MapEntry(k, v.toString()));
    } catch (_) {
      return {};
    }
  }
}
