import low from "lowdb";
import { mapValues, merge } from "lodash";
import fs from "fs";
import path from "path";
import FileSync from "lowdb/adapters/FileSync";
import { logs } from "../logs";

export function lowDbFactory(
  dbPath: string,
  options?: low.AdapterOptions<any>
): low.LowdbSync<any> {
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
  const adapter = new FileSync(dbPath, options);
  return low(adapter);
}

export function lowDbStaticFactory<State extends { [key: string]: any }>(
  dbPath: string,
  initialState: State
): {
  [K in keyof State]: {
    get: () => State[K];
    set: (newValue: State[K]) => void;
    merge: (newValue: State[K]) => void;
    del: () => void;
  };
} {
  const db = lowDbFactory(dbPath);

  function formatKey(key: string): string {
    key = key.replace(/\./g, "");
    if (!key) throw Error(`key to access the db must be defined`);
    return key;
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
    merge: (newValue: any): void =>
      set(key, merge(get(key) || initialValue, newValue)),
    del: (): void => del(key)
  }));
}
