// Oura API Test Script
// Usage: node test-oura.js <YOUR_OURA_TOKEN> [date]
// Example: node test-oura.js abc123 2026-02-21

const TOKEN = process.argv[2];
const DATE = process.argv[3] || new Date().toISOString().split('T')[0];

if (!TOKEN) {
  console.error('Usage: node test-oura.js <OURA_TOKEN> [date]');
  process.exit(1);
}

const prevDate = new Date(DATE + 'T12:00:00');
prevDate.setDate(prevDate.getDate() - 1);
const PREV = prevDate.toISOString().split('T')[0];

const BASE = 'https://api.ouraring.com/v2/usercollection';

async function fetchEndpoint(endpoint, startDate, endDate) {
  const url = `${BASE}/${endpoint}?start_date=${startDate}&end_date=${endDate}`;
  console.log(`\n--- GET ${endpoint} (${startDate} → ${endDate}) ---`);
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  if (!res.ok) {
    console.error(`  ERROR: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.error(`  ${text.substring(0, 200)}`);
    return [];
  }

  const json = await res.json();
  const data = json.data ?? [];
  console.log(`  Returned ${data.length} record(s)`);
  return data;
}

async function main() {
  console.log(`=== Oura API Test for date: ${DATE} ===`);
  console.log(`Previous day: ${PREV}`);

  // 1. Daily Sleep (single date)
  const dailySleep = await fetchEndpoint('daily_sleep', DATE, DATE);
  dailySleep.forEach(d => {
    console.log(`  day=${d.day} score=${d.score}`);
  });

  // 2. Daily Readiness (single date)
  const readiness = await fetchEndpoint('daily_readiness', DATE, DATE);
  readiness.forEach(d => {
    console.log(`  day=${d.day} score=${d.score}`);
  });

  // 3. Sleep periods - single date
  const sleepSingle = await fetchEndpoint('sleep', DATE, DATE);
  sleepSingle.forEach(d => {
    console.log(`  day=${d.day} type=${d.type} bedtime_start=${d.bedtime_start} bedtime_end=${d.bedtime_end}`);
    console.log(`    total=${d.total_sleep_duration}s deep=${d.deep_sleep_duration}s rem=${d.rem_sleep_duration}s`);
    console.log(`    efficiency=${d.efficiency} latency=${d.latency}s awake=${d.awake_time}s`);
  });

  // 4. Sleep periods - 2 day window
  const sleep2day = await fetchEndpoint('sleep', PREV, DATE);
  sleep2day.forEach(d => {
    console.log(`  day=${d.day} type=${d.type} bedtime_start=${d.bedtime_start} bedtime_end=${d.bedtime_end}`);
    console.log(`    total=${d.total_sleep_duration}s deep=${d.deep_sleep_duration}s rem=${d.rem_sleep_duration}s`);
    console.log(`    efficiency=${d.efficiency} latency=${d.latency}s awake=${d.awake_time}s`);
  });

  // 5. Daily sleep for previous day too (to compare)
  const dailySleepPrev = await fetchEndpoint('daily_sleep', PREV, PREV);
  dailySleepPrev.forEach(d => {
    console.log(`  day=${d.day} score=${d.score}`);
  });

  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`daily_sleep for ${DATE}: score=${dailySleep[0]?.score ?? 'NONE'} (day=${dailySleep[0]?.day ?? 'N/A'})`);
  console.log(`daily_sleep for ${PREV}: score=${dailySleepPrev[0]?.score ?? 'NONE'} (day=${dailySleepPrev[0]?.day ?? 'N/A'})`);
  
  console.log(`\nSleep periods (${DATE} only): ${sleepSingle.length} period(s)`);
  sleepSingle.forEach(d => console.log(`  day=${d.day} type=${d.type}`));
  
  console.log(`\nSleep periods (${PREV}→${DATE}): ${sleep2day.length} period(s)`);
  sleep2day.forEach(d => console.log(`  day=${d.day} type=${d.type}`));

  console.log('\n=== KEY QUESTION ===');
  if (sleepSingle.length > 0 && sleepSingle[0].day === DATE) {
    console.log(`✅ Sleep period day matches daily_sleep day (${DATE})`);
  } else if (sleep2day.length > 0) {
    const match = sleep2day.find(p => p.day === DATE);
    const prevMatch = sleep2day.find(p => p.day === PREV);
    if (match) {
      console.log(`✅ Found matching period in 2-day window with day=${DATE}`);
    } else if (prevMatch) {
      console.log(`⚠️  No period with day=${DATE}. Closest is day=${PREV}`);
      console.log(`   This means daily_sleep score for ${DATE} corresponds to sleep period with day=${PREV}`);
      console.log(`   → FIX: When showing score for ${DATE}, use sleep period where day=${PREV}`);
    }
  } else {
    console.log('❌ No sleep periods found at all');
  }
}

main().catch(console.error);
