#!/usr/bin/env node

const https = require('https');
const { exec } = require('child_process');
const fs = require('fs');

console.log('🔍 Starting Security Audit for eurolabreviews.eu\n');

// Check SSL Certificate
function checkSSL() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'eurolabreviews.eu',
      port: 443,
      method: 'GET',
      servername: 'eurolabreviews.eu'
    };

    const req = https.request(options, (res) => {
      const cert = res.socket.getPeerCertificate();
      const now = new Date();
      const expiry = new Date(cert.valid_to);
      
      console.log('✅ SSL Certificate Check:');
      console.log(`   Subject: ${cert.subject.CN}`);
      console.log(`   Issuer: ${cert.issuer.CN}`);
      console.log(`   Valid until: ${expiry.toDateString()}`);
      console.log(`   Days until expiry: ${Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))}`);
      
      if (expiry < now) {
        console.log('   ❌ CERTIFICATE EXPIRED!');
      } else if ((expiry - now) < (30 * 24 * 60 * 60 * 1000)) {
        console.log('   ⚠️  Certificate expires within 30 days');
      } else {
        console.log('   ✅ Certificate is valid');
      }
      resolve();
    });

    req.on('error', (err) => {
      console.log('❌ SSL Check Failed:', err.message);
      resolve();
    });

    req.end();
  });
}

// Check Security Headers
function checkSecurityHeaders() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'eurolabreviews.eu',
      port: 443,
      method: 'HEAD',
      servername: 'eurolabreviews.eu'
    };

    const req = https.request(options, (res) => {
      console.log('\n✅ Security Headers Check:');
      
      const headers = res.headers;
      const requiredHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'referrer-policy',
        'x-xss-protection',
        'strict-transport-security',
        'content-security-policy'
      ];

      requiredHeaders.forEach(header => {
        if (headers[header]) {
          console.log(`   ✅ ${header}: ${headers[header]}`);
        } else {
          console.log(`   ❌ ${header}: Missing`);
        }
      });
      resolve();
    });

    req.on('error', (err) => {
      console.log('❌ Security Headers Check Failed:', err.message);
      resolve();
    });

    req.end();
  });
}

// Check Dependencies
function checkDependencies() {
  return new Promise((resolve) => {
    exec('npm audit --json', (error, stdout) => {
      console.log('\n✅ Dependencies Security Check:');
      
      try {
        const audit = JSON.parse(stdout);
        if (audit.metadata.vulnerabilities.total === 0) {
          console.log('   ✅ No vulnerabilities found');
        } else {
          console.log(`   ⚠️  Found ${audit.metadata.vulnerabilities.total} vulnerabilities`);
          console.log(`   High: ${audit.metadata.vulnerabilities.high}`);
          console.log(`   Medium: ${audit.metadata.vulnerabilities.medium}`);
          console.log(`   Low: ${audit.metadata.vulnerabilities.low}`);
        }
      } catch (e) {
        console.log('   ❌ Could not parse npm audit output');
      }
      resolve();
    });
  });
}

// Check for Environment Variables
function checkEnvironmentVariables() {
  console.log('\n✅ Environment Variables Check:');
  
  const envFile = '.env.local';
  if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, 'utf8');
    const lines = envContent.split('\n');
    
    console.log('   Environment variables found:');
    lines.forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key] = line.split('=');
        if (key && !key.includes('SECRET') && !key.includes('KEY')) {
          console.log(`   ✅ ${key}`);
        } else if (key) {
          console.log(`   🔒 ${key} (sensitive)`);
        }
      }
    });
  } else {
    console.log('   ℹ️  No .env.local file found');
  }
}

// Check Build Status
function checkBuildStatus() {
  return new Promise((resolve) => {
    exec('npm run build', (error, stdout, stderr) => {
      console.log('\n✅ Build Status Check:');
      
      if (error) {
        console.log('   ❌ Build failed');
        console.log('   Error:', error.message);
      } else {
        console.log('   ✅ Build successful');
      }
      resolve();
    });
  });
}

// Generate Report
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    domain: 'eurolabreviews.eu',
    checks: {
      ssl: 'completed',
      headers: 'completed',
      dependencies: 'completed',
      env: 'completed',
      build: 'completed'
    }
  };

  const reportFile = `security-audit-${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved to: ${reportFile}`);
}

// Run all checks
async function runSecurityAudit() {
  try {
    await checkSSL();
    await checkSecurityHeaders();
    await checkDependencies();
    checkEnvironmentVariables();
    await checkBuildStatus();
    generateReport();
    
    console.log('\n🎉 Security audit completed!');
    console.log('📋 Review the checklist in SECURITY_AUDIT.md for manual checks');
  } catch (error) {
    console.error('❌ Security audit failed:', error);
  }
}

runSecurityAudit(); 