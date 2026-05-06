import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_bluetooth_serial/flutter_bluetooth_serial.dart';
import '../models/obd_data.dart';

enum BtState { disconnected, scanning, connecting, connected }

class BluetoothProvider extends ChangeNotifier {
  BtState _state = BtState.disconnected;
  BluetoothConnection? _connection;
  String? _connectedDevice;
  ObdLiveData _liveData = ObdLiveData.empty();
  final List<DtcCode> _dtcCodes = [];
  String _buffer = '';

  BtState get state => _state;
  bool get isConnected => _state == BtState.connected;
  String? get connectedDevice => _connectedDevice;
  ObdLiveData get liveData => _liveData;
  List<DtcCode> get dtcCodes => _dtcCodes;

  Future<List<BluetoothDevice>> getBondedDevices() async {
    return await FlutterBluetoothSerial.instance.getBondedDevices();
  }

  Future<void> connect(BluetoothDevice device) async {
    _state = BtState.connecting;
    notifyListeners();

    try {
      _connection = await BluetoothConnection.toAddress(device.address);
      _connectedDevice = device.name ?? device.address;
      _state = BtState.connected;
      notifyListeners();

      _connection!.input!.listen(_onData, onDone: disconnect);
      _send('CONNECT\n');
    } catch (e) {
      _state = BtState.disconnected;
      notifyListeners();
      rethrow;
    }
  }

  void _send(String data) {
    _connection?.output.add(Uint8List.fromList(utf8.encode(data)));
  }

  void _onData(Uint8List data) {
    _buffer += utf8.decode(data);
    while (_buffer.contains('\n')) {
      final idx = _buffer.indexOf('\n');
      final line = _buffer.substring(0, idx).trim();
      _buffer = _buffer.substring(idx + 1);
      _parseLine(line);
    }
  }

  void _parseLine(String line) {
    try {
      final json = jsonDecode(line) as Map<String, dynamic>;
      if (json.containsKey('rpm')) {
        _liveData = ObdLiveData.fromJson(json);
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> disconnect() async {
    _send('DISCONNECT\n');
    await _connection?.close();
    _connection = null;
    _connectedDevice = null;
    _state = BtState.disconnected;
    _liveData = ObdLiveData.empty();
    notifyListeners();
  }

  @override
  void dispose() {
    _connection?.close();
    super.dispose();
  }
}
