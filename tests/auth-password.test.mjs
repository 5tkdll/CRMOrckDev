import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../src/server/auth/password.mjs";
test("hash com salt, senha correta e senha errada", async () => {
  const password = "exemplo-de-teste-12345";
  const a = await hashPassword(password);
  const b = await hashPassword(password);
  assert.notEqual(a, b);
  assert.equal(await verifyPassword(password, a), true);
  assert.equal(await verifyPassword("outra-senha-12345", a), false);
});
test("hash malformado e limites", async () => {
  assert.equal(await verifyPassword("abc", "invalido"), false);
  await assert.rejects(hashPassword("curta"));
  await assert.rejects(hashPassword("a".repeat(129)));
});
