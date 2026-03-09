import * as SQLite from 'expo-sqlite';

export interface Appointment {
    id: number;
    name: string;       // Ad Soyad
    vehicle: string;    // Araç Marka/Model
    phone: string;      // Telefon
    date: string;       // Tarih (serbest metin)
    notes: string;      // Yapılacak işlem
    created_at: number; // Unix timestamp
}

export type NewAppointment = Omit<Appointment, 'id' | 'created_at'>;

const DB_NAME = 'obd_appointments.db';

let _db: SQLite.SQLiteDatabase | null = null;

function getDb(): SQLite.SQLiteDatabase {
    if (!_db) {
        _db = SQLite.openDatabaseSync(DB_NAME);
    }
    return _db;
}

export function initDB(): void {
    const db = getDb();
    db.execSync(`
        CREATE TABLE IF NOT EXISTS appointments (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL DEFAULT '',
            vehicle     TEXT    NOT NULL DEFAULT '',
            phone       TEXT             DEFAULT '',
            date        TEXT             DEFAULT '',
            notes       TEXT             DEFAULT '',
            created_at  INTEGER NOT NULL
        );
    `);
}

export function saveAppointment(data: NewAppointment): number {
    const db = getDb();
    const now = Date.now();
    const result = db.runSync(
        `INSERT INTO appointments (name, vehicle, phone, date, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [data.name, data.vehicle, data.phone, data.date, data.notes, now]
    );
    return result.lastInsertRowId;
}

export interface GetAppointmentsOptions {
    page?: number;
    pageSize?: number;
    search?: string;
}

export function getAppointments(opts: GetAppointmentsOptions = {}): Appointment[] {
    const { page = 0, pageSize = 10, search = '' } = opts;
    const db = getDb();
    const offset = page * pageSize;

    if (search.trim()) {
        const like = `%${search.trim()}%`;
        return db.getAllSync<Appointment>(
            `SELECT * FROM appointments
             WHERE name    LIKE ? OR
                   vehicle LIKE ? OR
                   phone   LIKE ? OR
                   date    LIKE ? OR
                   notes   LIKE ?
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [like, like, like, like, like, pageSize, offset]
        );
    }

    return db.getAllSync<Appointment>(
        `SELECT * FROM appointments ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [pageSize, offset]
    );
}

export function getAppointmentById(id: number): Appointment | null {
    const db = getDb();
    return db.getFirstSync<Appointment>(
        `SELECT * FROM appointments WHERE id = ?`, [id]
    ) ?? null;
}

export function updateAppointment(id: number, data: NewAppointment): void {
    const db = getDb();
    db.runSync(
        `UPDATE appointments
         SET name = ?, vehicle = ?, phone = ?, date = ?, notes = ?
         WHERE id = ?`,
        [data.name, data.vehicle, data.phone, data.date, data.notes, id]
    );
}

export function deleteAppointment(id: number): void {
    const db = getDb();
    db.runSync(`DELETE FROM appointments WHERE id = ?`, [id]);
}
