import * as SQLite from 'expo-sqlite';

const DB_NAME = 'bookapp.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await runMigrations(db);
  }
  return db;
}

async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS books (
      id          TEXT PRIMARY KEY NOT NULL,
      title       TEXT NOT NULL,
      author      TEXT NOT NULL DEFAULT '',
      format      TEXT NOT NULL CHECK(format IN ('epub', 'pdf', 'md')),
      file_path   TEXT NOT NULL,
      cover_path  TEXT,
      status      TEXT NOT NULL DEFAULT 'unorganized'
                      CHECK(status IN ('reading', 'to_read', 'finished', 'unorganized')),
      reading_position TEXT,
      added_at    INTEGER NOT NULL,
      last_opened_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS collections (
      id          TEXT PRIMARY KEY NOT NULL,
      name        TEXT NOT NULL,
      created_at  INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS collection_books (
      collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
      book_id       TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      PRIMARY KEY (collection_id, book_id)
    );

    CREATE TABLE IF NOT EXISTS annotations (
      id            TEXT PRIMARY KEY NOT NULL,
      book_id       TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      position      TEXT NOT NULL,
      selected_text TEXT NOT NULL,
      note          TEXT,
      color         TEXT NOT NULL DEFAULT 'yellow'
                        CHECK(color IN ('yellow', 'green', 'blue', 'pink', 'orange')),
      chapter       TEXT,
      created_at    INTEGER NOT NULL,
      updated_at    INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id          TEXT PRIMARY KEY NOT NULL,
      book_id     TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      position    TEXT NOT NULL,
      label       TEXT,
      chapter     TEXT,
      created_at  INTEGER NOT NULL
    );
  `);
}
