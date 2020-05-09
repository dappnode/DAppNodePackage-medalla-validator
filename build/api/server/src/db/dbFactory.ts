import low from "lowdb";
import { mapValues } from "lodash";
import fs from "fs";
import path from "path";
import FileSync from "lowdb/adapters/FileSync";
import { logs } from "../logs";

export function dbFactory<State extends { [key: string]: any }>(
  dbPath: string,
  initialState: State
): {
  [K in keyof State]: {
    get: () => State[K] | undefined;
    set: (newValue: State[K]) => void;
  };
} {
  // Define dbPath and make sure it exists (mkdir -p)
  if (fs.existsSync(dbPath)) {
    logs.info(`Connecting to existing lowdb ${dbPath}`);
  } else {
    const dir = path.parse(dbPath).dir;
    logs.info(`Creating new lowdb ${dbPath}`);
    if (dir) fs.mkdirSync(dir, { recursive: true });
    logs.info(`Created new lowdb ${dbPath}`);
  }

  // Initialize db
  const adapter = new FileSync(dbPath);
  const db = low(adapter);

  function formatKey(key: string): string {
    if (!key) throw Error(`key to access the db must be defined`);
    return key.replace(new RegExp(".", "g"), "");
  }

  const get = <T>(key: string): T | null => db.get(formatKey(key)).value();
  const set = <T>(key: string, value: T): void =>
    db.set(formatKey(key), value).write();
  const del = (key: string): void => {
    db.unset(formatKey(key)).write();
  };

  return mapValues(initialState, (initialValue, key) => ({
    get: (): any => get(key) || initialValue,
    set: (newValue: any): void => set(key, newValue),
    del: (): void => del(key)
  }));
}
