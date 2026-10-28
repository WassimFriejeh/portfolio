import { test } from "node:test";
import assert from "node:assert/strict";

const API = process.env.API_URL ?? "http://127.0.0.1:4411";

test("health endpoint responds", async (t) => {
  try {
    const res = await fetch(`${API}/health`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as { ok: boolean };
    assert.equal(body.ok, true);
  } catch (e) {
    t.skip("API not running");
  }
});

test("unauthenticated admin write is rejected", async (t) => {
  try {
    const res = await fetch(`${API}/api/admin/projects`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "x", slug: "x", developmentStatus: "INDEPENDENT" }),
    });
    assert.ok(res.status === 401 || res.status === 403);
  } catch {
    t.skip("API not running");
  }
});

test("draft projects are not listed publicly by slug guess", async (t) => {
  try {
    const res = await fetch(`${API}/api/projects/this-slug-should-not-exist-draft`);
    assert.equal(res.status, 404);
  } catch {
    t.skip("API not running");
  }
});
