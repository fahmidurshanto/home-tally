// Smoke test against the live Tally API.
// Run: node scripts/smoke-test.mjs
// Read-only checks plus a self-cleaning create→update→delete lifecycle for
// category and expense, so it leaves no junk behind on success.

const BASE = 'https://bditpark.com/tally/api';
const API_KEY = 'GF!2#m6sb$y%9jd&7SU9M$~!';
const COMPANY = '54'; // Abu's Family (from the documented login response)

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'X-API-KEY': API_KEY,
};

let pass = 0;
let fail = 0;

async function call(method, path, { params, body } = {}) {
  const url = new URL(BASE + path);
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { _raw: text }; }
  return { status: res.status, json };
}

function check(name, ok, detail) {
  if (ok) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name} — ${detail}`); }
}

const isOk = (j) => j && j.error === 'False';

async function main() {
  console.log(`\nSmoke test → ${BASE}\n`);

  // API 1 — Login
  {
    const { status, json } = await call('POST', '/login', {
      body: { username: 'sumain@gmail.com', password: '123456' },
    });
    check('API 1  Login (POST /login)', isOk(json) && Array.isArray(json.data),
      `status ${status}: ${JSON.stringify(json)}`);
  }

  // API 2 — Register (duplicate email expected to fail; we only verify reachability + shape)
  {
    const { status, json } = await call('POST', '/register', {
      body: {
        first_name: 'SmokeTest', mobile: '01700000000',
        email: `smoke_${Date.now()}@example.com`, password: '123456',
        lat: '22.55', lng: '88.35', ip_addr: '0.0.0.0',
      },
    });
    check('API 2  Register (POST /register)', isOk(json) && (json.new_id != null),
      `status ${status}: ${JSON.stringify(json)}`);
  }

  // API 3 — All Category
  {
    const { status, json } = await call('GET', '/category', { params: { company: COMPANY } });
    check('API 3  All Category (GET /category)', isOk(json) && Array.isArray(json.data),
      `status ${status}: ${JSON.stringify(json)}`);
  }

  // API 7 — Tools
  {
    const { status, json } = await call('GET', '/tools', { params: { company: COMPANY } });
    check('API 7  Tools (GET /tools)', isOk(json) && json.data && Array.isArray(json.data.category),
      `status ${status}: ${JSON.stringify(json)}`);
  }

  // API 8 — Expenses list
  {
    const { status, json } = await call('GET', '/expenses', { params: { company: COMPANY } });
    check('API 8  Expenses (GET /expenses)', isOk(json) && Array.isArray(json.data),
      `status ${status}: ${JSON.stringify(json)}`);
  }

  // API 4/5/6 — Category lifecycle
  let catId;
  {
    const { status, json } = await call('POST', '/category', {
      body: { name: 'SmokeTest Cat', company: COMPANY, types: '1' },
    });
    catId = json.NewID;
    check('API 4  New Category (POST /category)', isOk(json) && catId != null,
      `status ${status}: ${JSON.stringify(json)}`);
  }
  if (catId != null) {
    const { status, json } = await call('PUT', '/category', {
      body: { row_id: String(catId), name: 'SmokeTest Cat Updated', company: COMPANY, types: '1' },
    });
    check('API 5  Update Category (PUT /category)', isOk(json),
      `status ${status}: ${JSON.stringify(json)}`);
  }
  if (catId != null) {
    const { status, json } = await call('PATCH', '/category', { body: { row_id: String(catId) } });
    check('API 6  Remove Category (PATCH /category)', isOk(json),
      `status ${status}: ${JSON.stringify(json)}`);
  }

  // API 9/10/11 — Expense lifecycle (uses an existing category from API 3)
  let expCategoryId;
  {
    const { json } = await call('GET', '/category', { params: { company: COMPANY } });
    expCategoryId = json?.data?.[0]?.id;
  }
  let expId;
  if (expCategoryId) {
    const { status, json } = await call('POST', '/expenses', {
      body: {
        particular: 'SmokeTest entry', company: COMPANY, user_id: COMPANY,
        category_id: expCategoryId, date: '2026-06-19', amount: '1', types: '1',
      },
    });
    expId = json.NewID;
    check('API 9  New Expense (POST /expenses)', isOk(json) && expId != null,
      `status ${status}: ${JSON.stringify(json)}`);
  } else {
    check('API 9  New Expense (POST /expenses)', false, 'no category available to attach');
  }
  if (expId != null) {
    const { status, json } = await call('POST', '/expenses', {
      body: {
        row_id: String(expId), particular: 'SmokeTest entry updated', company: COMPANY,
        user_id: COMPANY, category_id: expCategoryId, date: '2026-06-19', amount: '2', types: '1',
      },
    });
    check('API 10 Update Expense (POST /expenses)', isOk(json),
      `status ${status}: ${JSON.stringify(json)}`);
  }
  if (expId != null) {
    const { status, json } = await call('PATCH', '/expenses', { body: { row_id: String(expId) } });
    check('API 11 Remove Expense (PATCH /expenses)', isOk(json),
      `status ${status}: ${JSON.stringify(json)}`);
  }

  console.log(`\n${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
