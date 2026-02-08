// Script to create a new match and trigger WebSocket broadcast
// Run with: node test-create-match.js

const API_BASE_URL = 'http://localhost:8000';

async function createMatch() {
  try {
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

    const response = await fetch(`${API_BASE_URL}/matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(matchData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(error)}`);
    }

    const result = await response.json();

    console.log('✅ Match created successfully!');
    console.log('Match ID:', result.data.id);
    console.log('Status:', result.data.status);
    console.log('\n🔔 WebSocket clients should receive a "match_created" notification!\n');
    console.log('Full response:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);

    // If it's a network error, show additional help
    if (error.cause) {
      console.error('Cause:', error.cause);
    }

    console.error('\n💡 Make sure the server is running: npm run dev');
    process.exit(1);
  }
}

createMatch();
