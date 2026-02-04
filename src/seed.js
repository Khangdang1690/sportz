import 'dotenv/config';
import { db } from './db/db.js';
import { matches, commentary } from './db/schema.js';

const sports = ['Football', 'Basketball', 'Tennis', 'Baseball', 'Hockey'];

const teams = {
  Football: ['Manchester United', 'Liverpool', 'Chelsea', 'Arsenal', 'Manchester City', 'Tottenham'],
  Basketball: ['Lakers', 'Warriors', 'Celtics', 'Heat', 'Bulls', 'Nets'],
  Tennis: ['Novak Djokovic', 'Rafael Nadal', 'Roger Federer', 'Carlos Alcaraz', 'Daniil Medvedev', 'Jannik Sinner'],
  Baseball: ['Yankees', 'Red Sox', 'Dodgers', 'Giants', 'Cubs', 'Astros'],
  Hockey: ['Maple Leafs', 'Canadiens', 'Rangers', 'Bruins', 'Blackhawks', 'Penguins']
};

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomScore(max = 5) {
  return Math.floor(Math.random() * max);
}

function getRandomDateTime(daysOffset, hoursRange = 3) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(date.getHours() + Math.floor(Math.random() * hoursRange));
  return date;
}

function generateMatches() {
  const matchData = [];

  // Generate 5 scheduled matches (future)
  for (let i = 0; i < 5; i++) {
    const sport = randomElement(sports);
    const sportTeams = teams[sport];
    const startTime = getRandomDateTime(i + 1, 24);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    matchData.push({
      sport,
      homeTeam: randomElement(sportTeams),
      awayTeam: randomElement(sportTeams),
      status: 'scheduled',
      startTime,
      endTime,
      homeScore: 0,
      awayScore: 0,
    });
  }

  // Generate 5 live matches (ongoing)
  for (let i = 0; i < 5; i++) {
    const sport = randomElement(sports);
    const sportTeams = teams[sport];
    const startTime = getRandomDateTime(0, -2); // Started 0-2 hours ago
    const endTime = getRandomDateTime(0, 2); // Ends in 0-2 hours

    matchData.push({
      sport,
      homeTeam: randomElement(sportTeams),
      awayTeam: randomElement(sportTeams),
      status: 'live',
      startTime,
      endTime,
      homeScore: randomScore(),
      awayScore: randomScore(),
    });
  }

  // Generate 10 finished matches (past)
  for (let i = 0; i < 10; i++) {
    const sport = randomElement(sports);
    const sportTeams = teams[sport];
    const endTime = getRandomDateTime(-i - 1, -3); // Ended 1-10 days ago
    const startTime = new Date(endTime.getTime() - 2 * 60 * 60 * 1000); // Started 2 hours before end

    matchData.push({
      sport,
      homeTeam: randomElement(sportTeams),
      awayTeam: randomElement(sportTeams),
      status: 'finished',
      startTime,
      endTime,
      homeScore: randomScore(6),
      awayScore: randomScore(6),
    });
  }

  return matchData;
}

function generateCommentary(matchId, sport, homeTeam, awayTeam, homeScore, awayScore) {
  const commentaries = [];
  const events = ['goal', 'foul', 'substitution', 'yellow_card', 'corner'];
  const actors = [homeTeam, awayTeam].flatMap(team =>
    [`${team} Player 1`, `${team} Player 2`, `${team} Player 3`]
  );

  const numEvents = Math.floor(Math.random() * 10) + 5; // 5-15 events

  for (let i = 0; i < numEvents; i++) {
    const minute = Math.floor(Math.random() * 90) + 1;
    const eventType = randomElement(events);
    const actor = randomElement(actors);
    const team = actor.includes(homeTeam) ? homeTeam : awayTeam;

    let message = '';
    switch (eventType) {
      case 'goal':
        message = `GOAL! ${actor} scores for ${team}!`;
        break;
      case 'foul':
        message = `Foul by ${actor}`;
        break;
      case 'substitution':
        message = `Substitution: ${actor} comes on for ${team}`;
        break;
      case 'yellow_card':
        message = `Yellow card shown to ${actor}`;
        break;
      case 'corner':
        message = `Corner kick for ${team}`;
        break;
    }

    commentaries.push({
      matchId,
      minute,
      sequence: i + 1,
      period: minute <= 45 ? 'First Half' : 'Second Half',
      eventType,
      actor,
      team,
      message,
      metadata: { scoreAtTime: { home: Math.floor(homeScore * i / numEvents), away: Math.floor(awayScore * i / numEvents) } },
      tags: eventType,
    });
  }

  return commentaries;
}

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Clear existing data
    console.log('Clearing existing data...');
    await db.delete(commentary);
    await db.delete(matches);

    // Generate and insert matches
    console.log('Generating matches...');
    const matchData = generateMatches();
    const insertedMatches = await db.insert(matches).values(matchData).returning();
    console.log(`✅ Created ${insertedMatches.length} matches`);

    // Generate commentary for live and finished matches
    console.log('Generating commentary...');
    let totalCommentary = 0;

    for (const match of insertedMatches) {
      if (match.status === 'live' || match.status === 'finished') {
        const commentaryData = generateCommentary(
          match.id,
          match.sport,
          match.homeTeam,
          match.awayTeam,
          match.homeScore,
          match.awayScore
        );
        await db.insert(commentary).values(commentaryData);
        totalCommentary += commentaryData.length;
      }
    }

    console.log(`✅ Created ${totalCommentary} commentary entries`);
    console.log('🎉 Database seeded successfully!');

    // Print summary
    console.log('\n📊 Summary:');
    console.log(`- Scheduled matches: ${insertedMatches.filter(m => m.status === 'scheduled').length}`);
    console.log(`- Live matches: ${insertedMatches.filter(m => m.status === 'live').length}`);
    console.log(`- Finished matches: ${insertedMatches.filter(m => m.status === 'finished').length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
