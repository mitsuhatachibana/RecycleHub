const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const outputDir = path.join(__dirname, '../public/screenshots');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const pages = [
  { name: 'landing.png', url: 'http://localhost:3000/' },
  { name: 'login.png', url: 'http://localhost:3000/login' },
  { name: 'register.png', url: 'http://localhost:3000/register' },
  { name: 'dashboard_user.png', url: 'http://localhost:3000/dev-login?role=USER&redirect=/dashboard/user' },
  { name: 'user_laporan.png', url: 'http://localhost:3000/dev-login?role=USER&redirect=/dashboard/user/laporan' },
  { name: 'user_laporan_baru.png', url: 'http://localhost:3000/dev-login?role=USER&redirect=/dashboard/user/laporan/baru' },
  { name: 'user_rewards.png', url: 'http://localhost:3000/dev-login?role=USER&redirect=/dashboard/user/rewards' },
  { name: 'user_redeem.png', url: 'http://localhost:3000/dev-login?role=USER&redirect=/dashboard/user/redeem' },
  { name: 'user_transaksi.png', url: 'http://localhost:3000/dev-login?role=USER&redirect=/dashboard/user/transaksi' },
  { name: 'user_profile.png', url: 'http://localhost:3000/dev-login?role=USER&redirect=/dashboard/user/profile' },
  { name: 'dashboard_admin.png', url: 'http://localhost:3000/dev-login?role=ADMIN&redirect=/dashboard/admin' },
  { name: 'admin_laporan.png', url: 'http://localhost:3000/dev-login?role=ADMIN&redirect=/dashboard/admin/laporan' },
  { name: 'admin_transaksi.png', url: 'http://localhost:3000/dev-login?role=ADMIN&redirect=/dashboard/admin/transaksi' },
  { name: 'admin_redeem.png', url: 'http://localhost:3000/dev-login?role=ADMIN&redirect=/dashboard/admin/redeem' },
  { name: 'admin_rewards.png', url: 'http://localhost:3000/dev-login?role=ADMIN&redirect=/dashboard/admin/rewards' },
  { name: 'admin_jenis_sampah.png', url: 'http://localhost:3000/dev-login?role=ADMIN&redirect=/dashboard/admin/jenis-sampah' },
  { name: 'admin_wilayah.png', url: 'http://localhost:3000/dev-login?role=ADMIN&redirect=/dashboard/admin/wilayah' },
  { name: 'admin_users.png', url: 'http://localhost:3000/dev-login?role=ADMIN&redirect=/dashboard/admin/users' },
];

console.log('📸 Starting website screenshot capture...');

for (const item of pages) {
  const outFile = path.join(outputDir, item.name);
  console.log(`Capturing ${item.name} from ${item.url}...`);
  try {
    const userDataDir = path.join(__dirname, 'edge_user_data_' + item.name.replace('.png', ''));
    const cmd = `"${edgePath}" --headless=new --user-data-dir="${userDataDir}" --window-size=1440,900 --virtual-time-budget=3500 --screenshot="${outFile}" "${item.url}"`;
    execSync(cmd, { stdio: 'ignore' });
    if (fs.existsSync(outFile)) {
      const stats = fs.statSync(outFile);
      console.log(`  ✅ Success! Saved ${item.name} (${Math.round(stats.size / 1024)} KB)`);
    } else {
      console.log(`  ⚠️ File not created: ${item.name}`);
    }
  } catch (err) {
    console.error(`  ❌ Error capturing ${item.name}:`, err.message);
  }
}

console.log('🎉 Screenshot capture process completed!');
