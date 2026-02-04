// Alternative script using Node's http module
// Run with: node test-create-match-http.js

import http from 'http';

function createMatch() {
  const now = new Date();
  const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
  const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours after start

  const matchData = {
    sport: 'Football',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    homeScore: 0,
    awayScore: 0,
  };

  console.log('📡 Creating new match...');
  console.log('Match data:', JSON.stringify(matchData, null, 2), '\n');

  const data = JSON.stringify(matchData);

  const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/matches',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  };

  const req = http.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 201) {
        const result = JSON.parse(responseData);
        console.log('✅ Match created successfully!');
        console.log('Match ID:', result.data.id);
        console.log('Status:', result.data.status);
        console.log('\n🔔 WebSocket clients should receive a "match_created" notification!\n');
        console.log('Full response:', JSON.stringify(result, null, 2));
      } else {
        console.error(`❌ Error: HTTP ${res.statusCode}`);
        console.error('Response:', responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
    console.error('\n💡 Make sure the server is running: npm run dev');
  });

  req.write(data);
  req.end();
}

createMatch();
