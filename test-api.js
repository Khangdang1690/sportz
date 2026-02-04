// Simple script to test the GET /matches endpoint
// Run with: node test-api.js

const API_BASE_URL = 'http://localhost:8000';

async function getMatches(limit = 10) {
  try {
    const url = `${API_BASE_URL}/matches?limit=${limit}`;
    console.log(`📡 Fetching: ${url}\n`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    console.log(`✅ Success! Found ${result.data.length} matches:\n`);

    result.data.forEach((match, index) => {
      console.log(`${index + 1}. [${match.status.toUpperCase()}] ${match.sport}`);
      console.log(`   ${match.homeTeam} vs ${match.awayTeam}`);
      console.log(`   Score: ${match.homeScore} - ${match.awayScore}`);
      console.log(`   Start: ${new Date(match.startTime).toLocaleString()}`);
      console.log(`   ID: ${match.id}\n`);
    });

    return result.data;
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the test
getMatches(20);
