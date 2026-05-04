const fs = require('fs');

// Mock DOM
global.document = {
    getElementById: () => ({ addEventListener: () => {}, querySelector: () => ({ style: {} }), style: {}, classList: { add: () => {}, remove: () => {} } }),
    querySelector: () => ({ value: 'male' })
};

// Load app.js
let code = fs.readFileSync('c:\\Users\\mooga\\OneDrive\\바탕 화면\\Antigravity_Test\\ConversationAssistant\\SajuCharacterMaker\\app.js', 'utf8');

// We need to mock Solar and Lunar
global.Solar = {
    fromYmdHms: () => ({
        getLunar: () => ({
            getEightChar: () => ({
                getYearGan: () => '甲', getYearZhi: () => '子',
                getMonthGan: () => '丙', getMonthZhi: () => '寅',
                getDayGan: () => '戊', getDayZhi: () => '辰',
                getTimeGan: () => '庚', getTimeZhi: () => '申'
            })
        })
    })
};

eval(code);

try {
    let result = calculateSaju(1990, 5, 24, 14);
    console.log("Success:", result);
} catch (e) {
    console.error("Error:", e);
}
