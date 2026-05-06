class Vehicle {
  final String id;
  final String brand;
  final String model;
  final int year;
  final String? plate;
  final String? vin;

  const Vehicle({
    required this.id,
    required this.brand,
    required this.model,
    required this.year,
    this.plate,
    this.vin,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'brand': brand,
        'model': model,
        'year': year,
        'plate': plate,
        'vin': vin,
      };

  factory Vehicle.fromJson(Map<String, dynamic> json) => Vehicle(
        id: json['id'],
        brand: json['brand'],
        model: json['model'],
        year: json['year'],
        plate: json['plate'],
        vin: json['vin'],
      );

  String get displayName => '$year $brand $model';
}
