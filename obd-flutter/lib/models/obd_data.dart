class ObdLiveData {
  final int rpm;
  final int speed;
  final int engineTemp;
  final double battery;
  final int throttle;
  final int fuelLevel;
  // Yeni sensörler
  final int intakeTemp;       // Emme havası sıcaklığı °C (PID 0x0F)
  final int manifoldPressure; // MAP / Turbo basıncı kPa (PID 0x0B)
  final int oilTemp;          // Yağ sıcaklığı °C (PID 0x5C)
  final double maf;           // MAF hava akışı g/s (PID 0x10)
  final double o2Voltage;     // O2 sensörü V (PID 0x14)
  final int egrPercent;       // EGR oranı % (PID 0x2C)
  final DateTime timestamp;

  const ObdLiveData({
    required this.rpm,
    required this.speed,
    required this.engineTemp,
    required this.battery,
    required this.throttle,
    required this.fuelLevel,
    required this.intakeTemp,
    required this.manifoldPressure,
    required this.oilTemp,
    required this.maf,
    required this.o2Voltage,
    required this.egrPercent,
    required this.timestamp,
  });

  factory ObdLiveData.fromJson(Map<String, dynamic> json) => ObdLiveData(
        rpm: json['rpm'] ?? 0,
        speed: json['speed'] ?? 0,
        engineTemp: json['engineTemp'] ?? 0,
        battery: (json['battery'] ?? 0.0).toDouble(),
        throttle: json['throttle'] ?? 0,
        fuelLevel: json['fuelLevel'] ?? 0,
        intakeTemp: json['intakeTemp'] ?? 0,
        manifoldPressure: json['manifoldPressure'] ?? 0,
        oilTemp: json['oilTemp'] ?? 0,
        maf: (json['maf'] ?? 0.0).toDouble(),
        o2Voltage: (json['o2Voltage'] ?? 0.0).toDouble(),
        egrPercent: json['egrPercent'] ?? 0,
        timestamp: DateTime.now(),
      );

  static ObdLiveData empty() => ObdLiveData(
        rpm: 0,
        speed: 0,
        engineTemp: 0,
        battery: 0.0,
        throttle: 0,
        fuelLevel: 0,
        intakeTemp: 0,
        manifoldPressure: 0,
        oilTemp: 0,
        maf: 0.0,
        o2Voltage: 0.0,
        egrPercent: 0,
        timestamp: DateTime.now(),
      );
}

class DtcCode {
  final String code;
  final String description;
  final bool isActive;

  const DtcCode({
    required this.code,
    required this.description,
    this.isActive = true,
  });
}
