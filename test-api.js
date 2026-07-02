#!/usr/bin/env node

/**
 * API Testing Script
 * Tests critical API endpoints to ensure system is working
 */

const http = require('http');

const TEST_CONFIG = {
    host: 'localhost',
    baseApi: 'http://localhost:3001',
    frontendUrl: 'http://localhost:3000'
};

const tests = {
    passed: [],
    failed: [],
    warnings: []
};

function makeRequest(method, path, options = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path.startsWith('http') ? path : `${TEST_CONFIG.baseApi}${path}`);
        
        const requestOptions = {
            hostname: url.hostname,
            port: url.port || 80,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'API-Test-Client/1.0',
                ...options.headers
            },
            timeout: 5000
        };

        if (options.credentials) {
            requestOptions.headers['Cookie'] = options.credentials;
        }

        const req = http.request(requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: data ? JSON.parse(data) : null
                });
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('\n🧪 API Testing Suite');
    console.log('='.repeat(50));

    // Test 1: Health Check
    try {
        console.log('\n[1/8] Testing Health Endpoint...');
        const res = await makeRequest('GET', '/health');
        if (res.status === 200) {
            tests.passed.push('✅ Health check endpoint');
        } else {
            tests.failed.push('❌ Health check returned status ' + res.status);
        }
    } catch (err) {
        tests.failed.push('❌ Health check failed: ' + err.message);
    }

    // Test 2: Session Check
    try {
        console.log('[2/8] Testing Session Endpoint...');
        const res = await makeRequest('GET', '/api/auth/me');
        if (res.status === 200 && res.body.success) {
            tests.passed.push('✅ Session endpoint works');
        } else {
            tests.failed.push('❌ Session endpoint failed');
        }
    } catch (err) {
        tests.failed.push('❌ Session endpoint error: ' + err.message);
    }

    // Test 3: Categories
    try {
        console.log('[3/8] Testing Categories Endpoint...');
        const res = await makeRequest('GET', '/api/categories');
        if (res.status === 200 && res.body.success) {
            const count = res.body.categories ? res.body.categories.length : 0;
            tests.passed.push(`✅ Categories endpoint (${count} categories)`);
        } else {
            tests.failed.push('❌ Categories endpoint failed');
        }
    } catch (err) {
        tests.failed.push('❌ Categories endpoint error: ' + err.message);
    }

    // Test 4: Home Page Data
    try {
        console.log('[4/8] Testing Home Endpoint...');
        const res = await makeRequest('GET', '/api/home');
        if (res.status === 200 && res.body.success) {
            const cats = res.body.categories ? res.body.categories.length : 0;
            const prods = res.body.popularProducts ? res.body.popularProducts.length : 0;
            tests.passed.push(`✅ Home endpoint (${cats} cats, ${prods} products)`);
        } else {
            tests.failed.push('❌ Home endpoint failed');
        }
    } catch (err) {
        tests.failed.push('❌ Home endpoint error: ' + err.message);
    }

    // Test 5: Products
    try {
        console.log('[5/8] Testing Products Endpoint...');
        const res = await makeRequest('GET', '/api/products');
        if (res.status === 200 && res.body.success) {
            const count = res.body.products ? res.body.products.length : 0;
            tests.passed.push(`✅ Products endpoint (${count} products)`);
        } else {
            tests.failed.push('❌ Products endpoint failed');
        }
    } catch (err) {
        tests.failed.push('❌ Products endpoint error: ' + err.message);
    }

    // Test 6: Product Search
    try {
        console.log('[6/8] Testing Product Search...');
        const res = await makeRequest('GET', '/api/products?search=test');
        if (res.status === 200 && res.body.success) {
            tests.passed.push('✅ Product search works');
        } else {
            tests.failed.push('❌ Product search failed');
        }
    } catch (err) {
        tests.failed.push('❌ Product search error: ' + err.message);
    }

    // Test 7: Banners
    try {
        console.log('[7/8] Testing Banners Endpoint...');
        const res = await makeRequest('GET', '/api/banners');
        if (res.status === 200 && res.body.success) {
            tests.passed.push('✅ Banners endpoint works');
        } else {
            tests.failed.push('❌ Banners endpoint failed');
        }
    } catch (err) {
        tests.failed.push('❌ Banners endpoint error: ' + err.message);
    }

    // Test 8: Cart Operations
    try {
        console.log('[8/8] Testing Cart Endpoint...');
        const res = await makeRequest('GET', '/api/cart');
        if (res.status === 200) {
            tests.passed.push('✅ Cart endpoint works');
        } else {
            tests.failed.push('❌ Cart endpoint failed');
        }
    } catch (err) {
        tests.failed.push('❌ Cart endpoint error: ' + err.message);
    }

    // Results Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST RESULTS');
    console.log('='.repeat(50));

    if (tests.passed.length > 0) {
        console.log('\n✅ PASSED (' + tests.passed.length + '):');
        tests.passed.forEach(t => console.log('  ' + t));
    }

    if (tests.warnings.length > 0) {
        console.log('\n⚠️  WARNINGS (' + tests.warnings.length + '):');
        tests.warnings.forEach(t => console.log('  ' + t));
    }

    if (tests.failed.length > 0) {
        console.log('\n❌ FAILED (' + tests.failed.length + '):');
        tests.failed.forEach(t => console.log('  ' + t));
    }

    console.log('\n' + '='.repeat(50));

    if (tests.failed.length === 0) {
        console.log('\n✨ All tests passed! System is ready.');
        process.exit(0);
    } else {
        console.log('\n⛔ Some tests failed. Check the errors above.');
        process.exit(1);
    }
}

console.log('Starting API tests...\n');
console.log('Make sure both backend and frontend are running:');
console.log('  Backend: http://localhost:3001');
console.log('  Frontend: http://localhost:3000\n');

// Give user time to start servers
setTimeout(runTests, 2000);
