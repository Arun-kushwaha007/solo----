// apps/web/src/scripts/generate-mock-telemetry.js
/**
 * Script to generate mock telemetry data for the A/B test.
 * Run with: node generate-mock-telemetry.js
 */
import fs from 'fs';

const USER_COUNT = 500;
const EVENTS = [];

const generateUser = (id) => {
    const isHeroV2 = Math.random() > 0.5;
    const variant = isHeroV2 ? 'hero_v2' : 'control';

    // Base conversion rates
    // Control: 40% baseline start, 30% baseline complete, 15% first quest complete
    // Variant: 50% baseline start, 40% baseline complete, 25% first quest complete

    let baselineStartProb = isHeroV2 ? 0.6 : 0.45;
    let baselineCompleteProb = isHeroV2 ? 0.5 : 0.35;
    let questCompleteProb = isHeroV2 ? 0.3 : 0.2;

    const sessionStart = new Date().getTime() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000); // Within last week

    // Page View
    EVENTS.push({
        user_id: `user_${id}`,
        event_name: 'page_view',
        timestamp: new Date(sessionStart).toISOString(),
        properties: { page: '/dashboard', ab_variant: variant }
    });

    // AB Exposure
    EVENTS.push({
        user_id: `user_${id}`,
        event_name: 'ab_exposure',
        timestamp: new Date(sessionStart + 100).toISOString(),
        properties: { experiment_id: 'hero_v2', variant: variant }
    });

    // Baseline CTA Click / Start
    if (Math.random() < baselineStartProb) {
        const startDelay = Math.floor(Math.random() * 10000) + 2000;
        EVENTS.push({
            user_id: `user_${id}`,
            event_name: 'baseline_started',
            timestamp: new Date(sessionStart + startDelay).toISOString(),
            properties: { variant: variant }
        });

        // Baseline Complete
        if (Math.random() < (baselineCompleteProb / baselineStartProb)) { // Adjust prob
             const completionTime = Math.floor(Math.random() * 300000) + 60000; // 1-5 mins
             EVENTS.push({
                user_id: `user_${id}`,
                event_name: 'baseline_completed',
                timestamp: new Date(sessionStart + startDelay + completionTime).toISOString(),
                properties: { variant: variant, type: Math.random() > 0.7 ? 'full' : 'quick' }
            });

             // First Quest Unlock
             EVENTS.push({
                user_id: `user_${id}`,
                event_name: 'first_quest_unlocked',
                timestamp: new Date(sessionStart + startDelay + completionTime + 500).toISOString(),
                properties: { variant: variant }
             });

             // First Quest Complete
             if (Math.random() < (questCompleteProb / baselineCompleteProb)) {
                 const questTime = Math.floor(Math.random() * 600000) + 60000; // 1-10 mins
                 EVENTS.push({
                    user_id: `user_${id}`,
                    event_name: 'first_quest_completed',
                    timestamp: new Date(sessionStart + startDelay + completionTime + 500 + questTime).toISOString(),
                    properties: { variant: variant, quest_id: 'quest-starter' }
                });
             }
        }
    }
};

for (let i = 0; i < USER_COUNT; i++) {
    generateUser(i);
}

// Sort by timestamp
EVENTS.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

const csvHeader = 'user_id,event_name,timestamp,properties\n';
const csvRows = EVENTS.map(e => `${e.user_id},${e.event_name},${e.timestamp},"${JSON.stringify(e.properties).replace(/"/g, '""')}"`).join('\n');

fs.writeFileSync('mock_telemetry.csv', csvHeader + csvRows);

console.log(`Generated ${EVENTS.length} events for ${USER_COUNT} users in mock_telemetry.csv`);
