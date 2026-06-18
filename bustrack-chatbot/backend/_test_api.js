const http = require('http');

function postChat(message) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ message });
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/chat',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
    };
    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  // Wait for server to be ready
  await new Promise(r => setTimeout(r, 3000));

  const tests = [
    'hi',
    'I am right here at benz circle I want to go to vijayawada bus stand',
    'benz circle to vijayawada bus stand',
    'hello',
  ];

  for (const t of tests) {
    try {
      const res = await postChat(t);
      console.log('\n--- Input:', JSON.stringify(t), '---');
      console.log('Points:', JSON.stringify(res.points, null, 2));
      console.log('Highlights:', JSON.stringify(res.highlights));
      console.log('Buses count:', res.buses?.length || 0);
      console.log('Show map:', res.showMap);
    } catch (e) {
      console.log('Error for', JSON.stringify(t), ':', e.message);
    }
  }
  process.exit(0);
}

main();
