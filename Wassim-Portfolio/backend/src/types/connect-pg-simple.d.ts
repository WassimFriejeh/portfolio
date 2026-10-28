declare module "connect-pg-simple" {
  import session from "express-session";
  import type { Store } from "express-session";

  interface PgStoreOptions {
    conString?: string;
    createTableIfMissing?: boolean;
    tableName?: string;
  }

  export default function connectPgSimple(
    session: typeof import("express-session"),
  ): new (options?: PgStoreOptions) => Store;
}
