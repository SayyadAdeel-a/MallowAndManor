// Verification suite for the shared modules (the logic both API stacks use).
// Run: node tests/shared.test.mjs

import assert from "node:assert/strict";

const results = [];
const t = async (name, fn) => {
  try {
    await fn();
    results.push({ ok: true, name });
  } catch (err) {
    results.push({ ok: false, name, err: err.message.split("\n")[0] });
  }
};

const { escapeRegex, literalRegex, str, shortStr, toObjectId, safeUrl, clientIp } =
  await import("../shared/http.js");
const v = await import("../shared/validators.js");
const { isCloudinaryConfigured } = await import("../shared/cloudinary-sign.js");
const User = (await import("../shared/models/User.js")).default;
const Product = (await import("../shared/models/Product.js")).default;
const origins = await import("../shared/origins.js");
const slug = await import("../shared/slug.js");
const auth = await import("../shared/auth.js");

// ---------------------------------------------------------------- search / regex
await t("ReDoS pattern '(a+)+$' is treated as a literal, not a regex", () => {
  const rx = literalRegex("(a+)+$");
  const re = new RegExp(rx.source);
  assert.equal(re.test("(a+)+$"), true, "should match the literal text");
  assert.equal(re.test("aaa"), false, "must NOT match via backtracking");
});

await t("'.*' is a literal, so it matches only the literal string", () => {
  const rx = literalRegex(".*");
  const re = new RegExp(rx.source);
  assert.equal(re.test("Gold Ring"), false, "must not act as a wildcard");
  assert.equal(re.test(".*"), true, "must match the literal");
});

await t("normal search stays case-insensitive and functional", () => {
  const re = new RegExp(literalRegex("gold").source, "i");
  assert.equal(re.test("Gold Bangles"), true);
  assert.equal(re.test("GOLD"), true);
});

await t("literalRegex caps input length and rejects empty", () => {
  assert.equal(literalRegex(null), null);
  assert.equal(literalRegex(""), null);
  assert.ok(literalRegex("x".repeat(500)).source.length <= 110);
});

await t("escapeRegex escapes regex metacharacters", () => {
  assert.equal(escapeRegex("a.b*c"), "a\\.b\\*c");
});

// ---------------------------------------------------------------- validators
await t("product picker strips _id / createdAt / unknown keys", () => {
  const out = v.pickProductFields({
    name: "  Gold Bangles  ", price: "2500", category: "bangles",
    _id: "hack", createdAt: "1999", evil: 1,
  });
  assert.deepEqual(Object.keys(out).sort(), ["category", "name", "price"]);
  assert.equal(out.name, "Gold Bangles");
  assert.equal(out.price, 2500);
});

await t("product picker rejects Infinity / negative / trailing-garbage prices", () => {
  assert.equal(v.pickProductFields({ price: "1e400" }).price, undefined);
  assert.equal(v.pickProductFields({ price: -50 }).price, undefined);
  assert.equal(v.pickProductFields({ price: "12abc" }).price, undefined);
  assert.equal(v.pickProductFields({ price: 99.5 }).price, 99.5);
});

await t("category picker allows only slug/name/icon", () => {
  const out = v.pickCategoryFields({ slug: "bangles", name: "Bangles", icon: "x", _id: "hack" });
  assert.deepEqual(Object.keys(out).sort(), ["icon", "name", "slug"]);
});

await t("post picker strips _id and clears scheduledAt when published", () => {
  const out = v.pickPostFields({
    title: "T", slug: "s", _id: "hack", createdAt: "1999",
    published: true, scheduledAt: "2030-01-01",
  });
  assert.equal(out._id, undefined);
  assert.equal(out.createdAt, undefined);
  assert.equal(out.scheduledAt, null);
});

await t("settings picker allows only known sections", () => {
  const out = v.pickSettingsSections({ hero: { a: 1 }, defaultsVersion: 999, role: "admin" });
  assert.deepEqual(Object.keys(out), ["hero"]);
});

await t("settings picker rejects __proto__ wholesale (no prototype pollution)", () => {
  const poisoned = JSON.parse('{"__proto__":{"x":1},"hero":{"a":1}}');
  assert.equal(Object.keys(v.pickSettingsSections(poisoned)).length, 0);
  assert.equal({}.x, undefined, "Object.prototype must be clean");
});

await t("analytics picker rejects unknown event types", () => {
  assert.equal(v.pickAnalyticsEvent({ eventType: "page_view" }).eventType, "page_view");
  assert.equal(v.pickAnalyticsEvent({ eventType: "drop_tables" }), null);
});

await t("analytics picker bounds eventData", () => {
  assert.equal(v.pickAnalyticsEvent({ eventType: "page_view", eventData: "x" }).eventData, undefined);
  assert.equal(v.pickAnalyticsEvent({ eventType: "page_view", eventData: [1] }).eventData, undefined);
  assert.equal(v.pickAnalyticsEvent({ eventType: "page_view", eventData: { b: "x".repeat(5000) } }).eventData, undefined);
});

// ---------------------------------------------------------------- NoSQL injection
await t("str() rejects a qs object (blocks operator injection)", () => {
  assert.equal(str({ $ne: null }), "");
  assert.equal(str(["a"]), "");
  assert.equal(str("ok"), "ok");
});

await t("toObjectId rejects objects and garbage, accepts valid ids", () => {
  assert.equal(toObjectId({ $ne: null }), null);
  assert.equal(toObjectId("not-an-id"), null);
  assert.equal(toObjectId(undefined), null);
  assert.equal(toObjectId("6ab0b2ad6fd11b3bf44e0c9b").toString(), "6ab0b2ad6fd11b3bf44e0c9b");
});

await t("safeUrl blocks javascript: and protocol-relative URLs", () => {
  assert.equal(safeUrl("javascript:alert(1)"), "");
  assert.equal(safeUrl("//evil.com"), "");
  assert.equal(safeUrl("https://x.com/a.jpg"), "https://x.com/a.jpg");
  assert.equal(safeUrl("/hero.webp"), "/hero.webp");
});

// ---------------------------------------------------------------- client IP
await t("clientIp takes the LAST X-Forwarded-For entry (spoofing-resistant)", () => {
  assert.equal(clientIp({ headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" }, socket: {} }), "5.6.7.8");
});

await t("clientIp prefers the platform-verified header", () => {
  const req = { headers: { "x-forwarded-for": "9.9.9.9", "x-vercel-forwarded-for": "5.6.7.8" }, socket: {} };
  assert.equal(clientIp(req), "5.6.7.8");
});

await t("clientIp falls back to the socket address", () => {
  assert.equal(clientIp({ headers: {}, socket: { remoteAddress: "::1" } }), "::1");
});

// ---------------------------------------------------------------- models
await t("User.role defaults to staff, not admin", () => {
  assert.equal(new User({ email: "a@b.c", password: "x" }).role, "staff");
});

await t("User rejects an unknown role", () => {
  assert.ok(new User({ email: "a@b.c", password: "x", role: "superuser" }).validateSync());
});

await t("User.tokenVersion defaults to 0", () => {
  assert.equal(new User({ email: "a@b.c", password: "x" }).tokenVersion, 0);
});

await t("Product rejects a negative price", () => {
  assert.ok(new Product({ name: "n", price: -1, category: "c" }).validateSync());
});

await t("Product accepts a valid price", () => {
  assert.equal(new Product({ name: "n", price: 10, category: "c" }).validateSync(), undefined);
});

// ---------------------------------------------------------------- CORS
await t("CORS allowlist includes the live custom domain", () => {
  assert.equal(origins.isOriginAllowed("https://honeybeelane.com"), true);
  assert.equal(origins.isOriginAllowed("https://www.honeybeelane.com"), true);
  assert.equal(origins.isOriginAllowed("https://honeybeelane.vercel.app"), true);
  assert.equal(origins.isOriginAllowed("http://localhost:5173"), true);
});

await t("CORS rejects an unknown origin", () => {
  assert.equal(origins.isOriginAllowed("https://evil.com"), false);
});

// ---------------------------------------------------------------- slug
await t("slugify normalises text", () => {
  assert.equal(slug.slugifyName("Gold Pearl Bangles!"), "gold-pearl-bangles");
  assert.equal(slug.slugifyName("A -- B"), "a-b");
  assert.equal(slug.slugifyName(""), "");
  assert.ok(slug.slugifyName("x".repeat(300)).length <= 80);
});

// ---------------------------------------------------------------- auth
await t("isAdmin only accepts exactly 'admin'", () => {
  assert.equal(auth.isAdmin({ role: "admin" }), true);
  assert.equal(auth.isAdmin({ role: "staff" }), false);
  assert.equal(auth.isAdmin({ role: "Admin" }), false);
  assert.equal(auth.isAdmin(undefined), false);
});

await t("bearerToken requires the Bearer prefix", () => {
  assert.equal(auth.bearerToken({ headers: { authorization: "abc" } }), "");
  assert.equal(auth.bearerToken({ headers: { authorization: "Bearer xyz" } }), "xyz");
});

await t("verifyToken fails closed when JWT_SECRET is unset", () => {
  const saved = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;
  try {
    assert.equal(auth.verifyToken({ headers: { authorization: "Bearer abc.def.ghi" } }), null);
  } finally {
    if (saved !== undefined) process.env.JWT_SECRET = saved;
  }
});

// ---------------------------------------------------------------- summary
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed\n`);
if (failed.length) {
  for (const f of failed) console.log(`  FAIL  ${f.name}\n        ${f.err}`);
  process.exit(1);
}
console.log("All shared-module checks passed.");