import Dexie, { type EntityTable } from "dexie";

interface Blog {
  id: number;
  title: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const db = new Dexie("DawinDB") as Dexie & {
  blogs: EntityTable<
    Blog,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  blogs: "++id, title, text, createdAt, updatedAt", // primary key "id" (for the runtime!)
});

export type { Blog };
export { db };
