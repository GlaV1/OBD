import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/vehicle.dart';

class VehicleProvider extends ChangeNotifier {
  Vehicle? _selectedVehicle;
  List<Vehicle> _savedVehicles = [];

  Vehicle? get selectedVehicle => _selectedVehicle;
  List<Vehicle> get savedVehicles => _savedVehicles;

  VehicleProvider() {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getStringList('saved_vehicles') ?? [];
    _savedVehicles = raw.map((e) => Vehicle.fromJson(jsonDecode(e))).toList();

    final selectedRaw = prefs.getString('selected_vehicle');
    if (selectedRaw != null) {
      _selectedVehicle = Vehicle.fromJson(jsonDecode(selectedRaw));
    }
    notifyListeners();
  }

  Future<void> selectVehicle(Vehicle vehicle) async {
    _selectedVehicle = vehicle;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('selected_vehicle', jsonEncode(vehicle.toJson()));
    notifyListeners();
  }

  Future<void> saveVehicle(Vehicle vehicle) async {
    _savedVehicles.removeWhere((v) => v.id == vehicle.id);
    _savedVehicles.insert(0, vehicle);
    if (_savedVehicles.length > 10) _savedVehicles = _savedVehicles.take(10).toList();

    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(
      'saved_vehicles',
      _savedVehicles.map((v) => jsonEncode(v.toJson())).toList(),
    );
    notifyListeners();
  }

  Future<void> deleteVehicle(String id) async {
    _savedVehicles.removeWhere((v) => v.id == id);
    if (_selectedVehicle?.id == id) _selectedVehicle = null;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(
      'saved_vehicles',
      _savedVehicles.map((v) => jsonEncode(v.toJson())).toList(),
    );
    if (_selectedVehicle == null) await prefs.remove('selected_vehicle');
    notifyListeners();
  }
}
