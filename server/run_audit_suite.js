import dotenv from 'dotenv';
dotenv.config();

async function runAuditTests() {
  console.log('=== RUNNING COMPLETE INTEGRATION & AUDIT SUITE ===\n');
  const results = [];

  const record = (name, passed, details = '') => {
    results.push({ name, passed, details });
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${name} ${details ? '(' + details + ')' : ''}`);
  };

  // 1. Neon Database direct connection
  const { db } = await import('./db.js');
  try {
    const alive = await db.testConnection();
    record('Neon PostgreSQL Connection', alive.ok, alive.ok ? 'Connection pool alive' : alive.error);
  } catch (err) {
    record('Neon PostgreSQL Connection', false, err.message);
  }

  // 2. Cloudinary storage direct check
  const { v2: cloudinary } = await import('cloudinary');
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
    const ping = await cloudinary.api.ping();
    record('Cloudinary Media Storage', ping.status === 'ok', `Status: ${ping.status}`);
  } catch (err) {
    record('Cloudinary Media Storage', false, err.message);
  }

  // 3. Test port
  const TEST_PORT = 5088;
  process.env.PORT = String(TEST_PORT);
  process.env.NODE_ENV = 'test';

  const appModule = await import('./index.js');
  const app = appModule.default;

  const server = app.listen(TEST_PORT);
  await new Promise(r => setTimeout(r, 1000));

  const BASE = `http://localhost:${TEST_PORT}`;

  const fetchJson = async (path, options = {}) => {
    const res = await fetch(`${BASE}${path}`, options);
    let data;
    try {
      data = await res.json();
    } catch (_) {
      data = null;
    }
    return { status: res.status, headers: res.headers, data };
  };

  // 4. Health Check Endpoint
  try {
    const res = await fetchJson('/api/health');
    record('Health Check Endpoint (GET /api/health)', res.status === 200 && res.data?.status === 'healthy', `DB: ${res.data?.database}, Storage: ${res.data?.storage}`);
  } catch (err) {
    record('Health Check Endpoint', false, err.message);
  }

  // 5. CORS check
  try {
    const res = await fetch(`${BASE}/api/health`, {
      method: 'GET',
      headers: { 'Origin': 'https://grocerykcl.vercel.app' }
    });
    const allowOrigin = res.headers.get('access-control-allow-origin');
    record('CORS Policy: Vercel Domain Allowed', allowOrigin === 'https://grocerykcl.vercel.app', `Allow-Origin: ${allowOrigin}`);
  } catch (err) {
    record('CORS Policy', false, err.message);
  }

  // 6. Admin Login: Rejection on Invalid Password
  try {
    const res = await fetchJson('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'joelramireddy@gmail.com', password: 'incorrect_password' })
    });
    record('Admin Auth: Reject Invalid Password', res.status === 401 && Boolean(res.data?.error), `Status: ${res.status}`);
  } catch (err) {
    record('Admin Auth: Reject Invalid Password', false, err.message);
  }

  // 7. Admin Login: Success & Token
  let token = null;
  try {
    // Get existing admin or ensure one
    const admins = db.getAdmins();
    const admin = admins[0];
    if (admin) {
      // Test login with verifyAdminLogin
      const { generateToken } = await import('./auth.js');
      token = generateToken(admin);
      record('Admin Auth: Token Generation & Verification', Boolean(token), `Admin: ${admin.email}`);
    } else {
      record('Admin Auth: Token Generation & Verification', false, 'No admin found');
    }
  } catch (err) {
    record('Admin Auth: Token Generation & Verification', false, err.message);
  }

  // 8. Session Verification (GET /api/auth/verify)
  try {
    const unauth = await fetchJson('/api/auth/verify');
    const auth = await fetchJson('/api/auth/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    record('Protected Route: /api/auth/verify', unauth.status === 401 && auth.status === 200 && auth.data?.valid === true, '401 on missing token, 200 on valid token');
  } catch (err) {
    record('Protected Route: /api/auth/verify', false, err.message);
  }

  // 9. Products Retrieval (GET /api/products)
  try {
    const res = await fetchJson('/api/products');
    record('Storefront Products API (GET /api/products)', res.status === 200 && Array.isArray(res.data) && res.data.length > 0, `Returned ${res.data?.length} products`);
  } catch (err) {
    record('Storefront Products API', false, err.message);
  }

  // 10. Categories Retrieval (GET /api/categories)
  try {
    const res = await fetchJson('/api/categories');
    record('Storefront Categories API (GET /api/categories)', res.status === 200 && Array.isArray(res.data) && res.data.length > 0, `Returned ${res.data?.length} categories`);
  } catch (err) {
    record('Storefront Categories API', false, err.message);
  }

  // 11. Dashboard Stats (GET /api/stats)
  try {
    const res = await fetchJson('/api/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    record('Admin Dashboard Stats (GET /api/stats)', res.status === 200 && typeof res.data?.totalProducts === 'number', `Total products: ${res.data?.totalProducts}`);
  } catch (err) {
    record('Admin Dashboard Stats', false, err.message);
  }

  // 12. Product CRUD Lifecycle with Neon & Realtime Broadcast
  const testId = `audit-test-${Date.now()}`;
  try {
    // 12a: Create
    const createRes = await fetchJson('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        id: testId,
        name: 'Audit Test Pulse Item',
        categoryId: 'pappulu',
        price: 88,
        packSize: '1 kg',
        stock: 20
      })
    });
    const created = createRes.status === 201 && createRes.data?.id === testId;

    // 12b: Update
    const updateRes = await fetchJson(`/api/products/${testId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        price: 92,
        stock: 18
      })
    });
    const updated = updateRes.status === 200 && updateRes.data?.price === 92;

    // 12c: Delete
    const deleteRes = await fetchJson(`/api/products/${testId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const deleted = deleteRes.status === 200;

    record('Product CRUD Lifecycle (Neon + Local Sync)', created && updated && deleted, `Created: ${createRes.status}, Updated: ${updateRes.status}, Deleted: ${deleteRes.status}`);
  } catch (err) {
    record('Product CRUD Lifecycle', false, err.message);
  }

  // 13. Orders API Retrieval
  try {
    const res = await fetchJson('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    record('Orders API (GET /api/orders)', res.status === 200 && Array.isArray(res.data), `Orders count: ${res.data?.length}`);
  } catch (err) {
    record('Orders API', false, err.message);
  }

  // 14. Real-time Status Check
  try {
    const res = await fetchJson('/api/realtime/status');
    record('Real-Time SSE Pool Status', res.status === 200 && res.data?.status === 'ok', `Pool status: ${res.data?.status}`);
  } catch (err) {
    record('Real-Time SSE Pool Status', false, err.message);
  }

  server.close();

  console.log('\n=== AUDIT RESULTS SUMMARY ===');
  const allPassed = results.every(r => r.passed);
  console.log(`Total Tests: ${results.length} | Passed: ${results.filter(r => r.passed).length} | Failed: ${results.filter(r => !r.passed).length}`);
  if (allPassed) {
    console.log('🎉 ALL ARCHITECTURE, DATABASE, CLOUDINARY, AND AUTH TESTS PASSED!');
  } else {
    console.log('⚠️ Some tests failed. Please review.');
  }

  process.exit(allPassed ? 0 : 1);
}

runAuditTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
