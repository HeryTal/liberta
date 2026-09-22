import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = ts.transpileModule(
  readFileSync(new URL("../lib/db.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;

function loadDatabase(connect, env = { MONGO_URI: "mongodb://localhost/test" }) {
  const clients = [];
  class MongoClient {
    constructor() {
      clients.push(this);
    }
    connect() {
      return connect(this);
    }
  }
  const context = vm.createContext({
    exports: {},
    process: { env },
    require: () => ({ MongoClient }),
  });
  vm.runInContext(source, context);
  return { ...context.exports, clients };
}

test("concurrent callers wait for readiness and reuse one client", async () => {
  let ready;
  const connection = new Promise((resolve) => { ready = resolve; });
  const db = loadDatabase(async (client) => {
    await connection;
    return client;
  });
  let resolved = false;
  const first = db.getMongoClient().then((client) => {
    resolved = true;
    return client;
  });
  const second = db.getMongoClient();
  await Promise.resolve();
  assert.equal(resolved, false);
  assert.equal(db.clients.length, 1);
  ready();
  assert.equal(await first, await second);
});

test("a failed connection is retried on the next request", async () => {
  const failure = new Error("Initial connection failed");
  let attempts = 0;
  const db = loadDatabase(async (client) => {
    if (++attempts === 1) throw failure;
    return client;
  });
  await assert.rejects(db.getMongoClient(), (error) => error === failure);
  assert.equal(await db.getMongoClient(), db.clients[0]);
  assert.equal(attempts, 2);
});

test("a cached client is reconnected before being returned", async () => {
  let closed = false;
  const db = loadDatabase(async (client) => {
    closed = false;
    return client;
  });
  const client = await db.getMongoClient();
  closed = true;
  assert.equal(await db.getMongoClient(), client);
  assert.equal(closed, false);
});

test("missing configuration fails before creating a client", async () => {
  const db = loadDatabase(() => assert.fail("Unexpected connection"), {});
  await assert.rejects(db.getMongoClient(), /MONGO_URI must be configured/);
  assert.equal(db.clients.length, 0);
});
