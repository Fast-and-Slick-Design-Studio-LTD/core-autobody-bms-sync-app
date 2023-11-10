import _sqlite3 from 'sqlite3';

const sqlite3 = _sqlite3.verbose();

export interface FileLog {
    file_path: string,
    created_at: number,
    isUpdated: string,
    file_hash: string,
    size: number
}

export default class SqliteDB {
    static db: any;
    constructor() {
    }

    static async initDB(dbPath: string) {
        this.db = new sqlite3.Database(dbPath);
        this.db.run(`
            CREATE TABLE IF NOT EXISTS bms_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                file_path TEXT, 
                isUpdated TEXT, 
                file_hash TEXT, 
                size Integer,
                created_at Integer
            )
        `);
    }

    static addFileLog(fileLog: FileLog) {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO bms_logs (file_path, isUpdated, file_hash, created_at, size) VALUES (?, ?, ?, ?, ?)', [fileLog.file_path, fileLog.isUpdated, fileLog.file_hash, fileLog.created_at, fileLog.size], (err: any) => {
                resolve(err);
            })
        })
    }

    static getFileLogs(): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.db.all('select * from bms_logs order by created_at desc', [], (err: any, rows: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            })
        })
    }

    static findFile(fileLog: FileLog): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM bms_logs WHERE file_path=? and file_hash=?', [fileLog.file_path, fileLog.file_hash], (err: any, rows: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            })
        })
    }
}