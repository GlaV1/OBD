import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class Appointment {
  final int? id;
  final String vehicleId;
  final String vehicleName;
  final String title;
  final String date;
  final String? notes;

  const Appointment({
    this.id,
    required this.vehicleId,
    required this.vehicleName,
    required this.title,
    required this.date,
    this.notes,
  });

  Map<String, dynamic> toMap() => {
        'id': id,
        'vehicleId': vehicleId,
        'vehicleName': vehicleName,
        'title': title,
        'date': date,
        'notes': notes,
      };

  factory Appointment.fromMap(Map<String, dynamic> m) => Appointment(
        id: m['id'],
        vehicleId: m['vehicleId'],
        vehicleName: m['vehicleName'],
        title: m['title'],
        date: m['date'],
        notes: m['notes'],
      );
}

class AppointmentService {
  static final AppointmentService _instance = AppointmentService._();
  factory AppointmentService() => _instance;
  AppointmentService._();

  Database? _db;

  Future<Database> get db async {
    _db ??= await _open();
    return _db!;
  }

  Future<Database> _open() async {
    final path = join(await getDatabasesPath(), 'appointments.db');
    return openDatabase(path, version: 1, onCreate: (db, _) {
      db.execute('''CREATE TABLE appointments(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicleId TEXT,
        vehicleName TEXT,
        title TEXT,
        date TEXT,
        notes TEXT
      )''');
    });
  }

  Future<List<Appointment>> getAll() async {
    final rows = await (await db).query('appointments', orderBy: 'date DESC');
    return rows.map(Appointment.fromMap).toList();
  }

  Future<void> insert(Appointment a) async {
    await (await db).insert('appointments', a.toMap());
  }

  Future<void> delete(int id) async {
    await (await db).delete('appointments', where: 'id = ?', whereArgs: [id]);
  }
}
