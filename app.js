import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Firebase configuration (reused from Todac)
const firebaseConfig = {
  apiKey: "AIzaSyBUqe-XAbE1XkUh0i511LJ82emllR1AAFQ",
  authDomain: "tellmescret.firebaseapp.com",
  projectId: "tellmescret",
  storageBucket: "tellmescret.firebasestorage.app",
  messagingSenderId: "373304860236",
  appId: "1:373304860236:web:f70646ad6e4c0f68361ee9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const sajuSearches = collection(db, "saju_searches");

// Saju Data Constants
const STEMS = ["癸", "甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬"];
const BRANCHES = ["亥", "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌"];

const ELEMENTS_KR = {
    "甲": "목", "乙": "목", "寅": "목", "卯": "목",
    "丙": "화", "丁": "화", "巳": "화", "午": "화",
    "戊": "토", "己": "토", "辰": "토", "戌": "토", "丑": "토", "未": "토",
    "庚": "금", "辛": "금", "申": "금", "酉": "금",
    "壬": "수", "癸": "수", "亥": "수", "子": "수"
};

const ELEMENT_LABELS = {
    "목": "나무(木)의 기운", 
    "화": "불(火)의 기운", 
    "토": "흙(土)의 기운", 
    "금": "쇠(金)의 기운", 
    "수": "물(水)의 기운"
};

const ELEMENT_COLORS = {
    "목": "#10b981", "화": "#ef4444", "토": "#d97706", "금": "#64748b", "수": "#3b82f6"
};

const TEN_GODS_MAP = ["비겁", "식상", "재성", "관성", "인성"];
const SINSAL_MAP = ["도화살", "홍염살", "화개살", "귀문관살", "백호대살"];

const JIJANGGAN_HAN = {
    "子": "壬,癸", "丑": "癸,辛,己", "寅": "戊,丙,甲", "卯": "甲,乙", "辰": "乙,癸,戊", "巳": "戊,庚,丙",
    "午": "丙,己,丁", "未": "丁,乙,己", "申": "戊,壬,庚", "酉": "庚,辛", "戌": "辛,丁,戊", "亥": "戊,甲,壬"
};

const YIN_YANG_STEMS = {
    "甲":"+", "乙":"-", "丙":"+", "丁":"-", "戊":"+", "己":"-", "庚":"+", "辛":"-", "壬":"+", "癸":"-"
};

const SINSAL_DATA = {
    "도화살": { label: "시선을 끄는 매력", desc: "눈빛이 강하고 이성에게 강한 끌림을 주는 색기와 인기를 가졌습니다." },
    "홍염살": { label: "치명적인 분위기", desc: "화려하고 섹시한 무대형 매력으로 사람들을 사로잡습니다." },
    "화개살": { label: "예술적이고 깊은 영혼", desc: "고독하지만 철학적이고 예술적인 사연 있는 신비로움을 풍깁니다." },
    "귀문관살": { label: "신비로운 직관력", desc: "예민하고 꿰뚫어 보는 듯한 눈빛과 독창적인 분위기가 매력적입니다." },
    "백호대살": { label: "압도적인 카리스마", desc: "선이 굵고 강렬하며 주변을 압도하는 거친 기백을 뿜어냅니다." }
};

const TENGODS_DATA = {
    "비겁": { label: "주관과 독립성", desc: "얼굴형의 선이 뚜렷하거나 평범함 속에서도 눈에 띄는 자기주장이 강한 인상입니다." },
    "식상": { label: "표현과 생기", desc: "표정이 매우 풍부하고 끼가 넘쳐 귀여움과 동안 매력을 지녔습니다." },
    "재성": { label: "현실 감각과 성취", desc: "이목구비의 균형이 좋고 단정하여 누구에게나 호감을 주는 깔끔한 인상입니다." },
    "관성": { label: "원칙과 명예", desc: "반듯하고 정돈된 얼굴선을 가져 신뢰감을 주는 정석 미남/미녀상입니다." },
    "인성": { label: "수용과 사려깊음", desc: "눈빛이 순하고 부드러워 사람들의 보호본능을 자극하는 맑고 청순한 느낌입니다." }
};

const ELEMENT_TRAITS = {
    "목": { body: "체형이 길고 곧게 뻗은 편입니다.", face: "이목구비가 길고 시원시원합니다.", vibe: "청순하고 맑은 첫사랑 느낌의 분위기" },
    "화": { body: "상체가 발달하거나 에너지가 넘치는 체형입니다.", face: "이목구비가 뚜렷하고 강렬합니다.", vibe: "화려하고 당당한 매력의 분위기" },
    "토": { body: "전체적인 비율과 균형이 안정적인 체형입니다.", face: "이목구비가 어느 한 곳 튀지 않고 조화롭습니다.", vibe: "편안하고 포용력 있는 신뢰의 분위기" },
    "금": { body: "뼈대가 발달하고 선명한 체형입니다.", face: "이목구비가 입체적이고 날카롭게 선명합니다.", vibe: "세련되고 차가운 도시적인 분위기" },
    "수": { body: "둥글고 부드러운 체형입니다.", face: "이목구비가 동글동글하고 눈빛이 촉촉합니다.", vibe: "귀엽고 감성적이며 친근한 분위기" }
};

const EL_INDEX = {"목":0, "화":1, "토":2, "금":3, "수":4};
function getTenGod(dmEl, otherEl) {
    if(!otherEl) return "";
    let diff = (EL_INDEX[otherEl] - EL_INDEX[dmEl] + 5) % 5;
    return TEN_GODS_MAP[diff];
}

function getExactTenGod(dayStem, targetStem) {
    if(!targetStem) return "";
    let tg = getTenGod(ELEMENTS_KR[dayStem], ELEMENTS_KR[targetStem]);
    if (!tg) return "비견"; 
    
    let isSameYinYang = YIN_YANG_STEMS[dayStem] === YIN_YANG_STEMS[targetStem];
    
    if (tg === "재성") return isSameYinYang ? "편재" : "정재";
    if (tg === "관성") return isSameYinYang ? "편관" : "정관";
    if (tg === "인성") return isSameYinYang ? "편인" : "정인";
    if (tg === "식상") return isSameYinYang ? "식신" : "상관";
    if (tg === "비겁") return isSameYinYang ? "비견" : "겁재";
    return tg;
}

function calculateSaju(year, month, day, hour) {
    // 1. 정확한 24절기 기반 만세력 라이브러리(lunar-javascript) 사용
    let solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
    let lunar = solar.getLunar();
    let baZi = lunar.getEightChar();
    
    let palja = {
        yS: baZi.getYearGan(), yB: baZi.getYearZhi(),
        mS: baZi.getMonthGan(), mB: baZi.getMonthZhi(),
        dS: baZi.getDayGan(), dB: baZi.getDayZhi(),
        hS: baZi.getTimeGan(), hB: baZi.getTimeZhi()
    };

    let counts = {"목":0, "화":0, "토":0, "금":0, "수":0};
    Object.values(palja).forEach(char => {
        counts[ELEMENTS_KR[char]]++;
    });

    let primaryElement = ELEMENTS_KR[palja.dS];

    // Singang / Sinyak
    let inSeongEl = Object.keys(EL_INDEX).find(key => getTenGod(primaryElement, key) === "인성");
    let mySideCount = counts[primaryElement] + counts[inSeongEl];
    let isSingang = mySideCount >= 4 ? "신강 (에너지 강함)" : "신약 (에너지 유연함)";

    // Johu Yongsin (조후 용신: 월지 기준 온도/습도 조절)
    let yongsin = "";
    if (["巳", "午", "未"].includes(palja.mB)) yongsin = "수 기운 (사주를 시원하게 식혀줌)";
    else if (["亥", "子", "丑"].includes(palja.mB)) yongsin = "화 기운 (사주를 따뜻하게 녹여줌)";
    else if (["寅", "卯", "辰"].includes(palja.mB)) yongsin = "화/수 기운 (봄의 조화와 온도 조절)";
    else if (["申", "酉", "戌"].includes(palja.mB)) yongsin = "화/수 기운 (가을의 결실과 온도 조절)";

    // Genuine Sinsal Analysis
    let branches = [palja.yB, palja.mB, palja.dB, palja.hB];
    let pillars = [
        palja.yS + palja.yB,
        palja.mS + palja.mB,
        palja.dS + palja.dB,
        palja.hS + palja.hB
    ];

    let dominantSinsal = "도화살"; // default fallback
    let foundSinsal = [];

    // 1. 백호대살
    const BAEKHO = ["甲辰", "乙未", "丙戌", "丁丑", "戊辰", "壬戌", "癸丑"];
    if (pillars.some(p => BAEKHO.includes(p))) foundSinsal.push("백호대살");

    // 2. 귀문관살
    const GWIMUN = [["子","酉"], ["丑","午"], ["寅","未"], ["卯","申"], ["辰","亥"], ["巳","戌"]];
    if (GWIMUN.some(pair => branches.includes(pair[0]) && branches.includes(pair[1]))) {
        foundSinsal.push("귀문관살");
    }

    // 3. 도화살 (Dohwa): 년지/일지 기준 엄격한 삼합 규칙 적용
    const DOHWA_MAP = {
        "申":"酉", "子":"酉", "辰":"酉",
        "寅":"卯", "午":"卯", "戌":"卯",
        "亥":"子", "卯":"子", "未":"子",
        "巳":"午", "酉":"午", "丑":"午"
    };
    if (branches.includes(DOHWA_MAP[palja.yB]) || branches.includes(DOHWA_MAP[palja.dB])) foundSinsal.push("도화살");

    // 4. 홍염살
    const HONG_MAP = {
        "甲":["午"], "乙":["午","申"], "丙":["寅"], "丁":["未"], "戊":["辰"],
        "己":["辰"], "庚":["戌"], "辛":["酉"], "壬":["子","申"], "癸":["申"]
    };
    if (HONG_MAP[palja.dS] && HONG_MAP[palja.dS].some(b => branches.includes(b))) foundSinsal.push("홍염살");

    // 5. 화개살
    const HWAGAE_MAP = {
        "申":"辰", "子":"辰", "辰":"辰", "寅":"戌", "午":"戌", "戌":"戌",
        "亥":"未", "卯":"未", "未":"未", "巳":"丑", "酉":"丑", "丑":"丑"
    };
    if (branches.includes(HWAGAE_MAP[palja.yB]) || branches.includes(HWAGAE_MAP[palja.dB])) foundSinsal.push("화개살");

    if (foundSinsal.length > 0) {
        // Priority: 희소성이 높고 개성이 강한 순서로 우선순위 배정
        const priority = ["귀문관살", "홍염살", "백호대살", "도화살", "화개살"];
        dominantSinsal = foundSinsal.sort((a, b) => priority.indexOf(a) - priority.indexOf(b))[0];
    } else {
        // 만약 주요 신살이 하나도 없다면, 생일(일간)을 기준으로 고유한 신살 부여 (결정론적 다양성)
        const randomFallback = ["도화살", "백호대살", "귀문관살", "홍염살", "화개살"];
        dominantSinsal = randomFallback[palja.dS.charCodeAt(0) % 5];
    }

    // Genuine Dominant Ten God (격국: 월지 기준)
    let mBranchElement = ELEMENTS_KR[palja.mB];
    let dominantTenGod = getTenGod(primaryElement, mBranchElement) || "비겁";

    return { 
        palja, counts, primaryElement, dominantSinsal, dominantTenGod, 
        dBranchIdx: BRANCHES.indexOf(palja.dB), isSingang, yongsin 
    };
}

const YUKHAP_MAP = {
    1: 2, 2: 1, // 子-丑
    3: 0, 0: 3, // 寅-亥
    4: 11, 11: 4, // 卯-戌
    5: 10, 10: 5, // 辰-酉
    6: 9, 9: 6, // 巳-申
    7: 8, 8: 7 // 午-未
};

function findIdealPartner(userSaju) {
    let partnerDBranchIdx = YUKHAP_MAP[userSaju.dBranchIdx];
    let score = 30; // base score
    let partnerTraits = [];
    
    score += 42; 
    partnerTraits.push(`일지 육합(${BRANCHES[userSaju.dBranchIdx]}·${BRANCHES[partnerDBranchIdx]} 합)`);

    let partnerPrimaryElement = "목";
    if (userSaju.counts["수"] > userSaju.counts["화"]) {
        partnerPrimaryElement = "화";
        score += 24;
        partnerTraits.push("차가운 조후 완벽 보완(화 기운)");
    } else if (userSaju.counts["화"] > userSaju.counts["수"]) {
        partnerPrimaryElement = "수";
        score += 24;
        partnerTraits.push("뜨거운 조후 완벽 보완(수 기운)");
    } else {
        partnerPrimaryElement = "토";
        score += 20;
        partnerTraits.push("안정적인 조후 밸런스 유지");
    }
    
    score += Math.floor(Math.random() * 4); // Random variance for realism (94~100)

    let pSinsal = SINSAL_MAP[Math.floor(Math.random() * SINSAL_MAP.length)];
    let pTenGod = TEN_GODS_MAP[Math.floor(Math.random() * TEN_GODS_MAP.length)];

    return {
        score,
        traitsText: partnerTraits.join(" + "),
        primaryElement: partnerPrimaryElement,
        dominantSinsal: pSinsal,
        dominantTenGod: pTenGod
    };
}

function generateAnalysis(element, sinsal, tengod, pronoun = "당신") {
    const elData = ELEMENT_TRAITS[element];
    const tenGodData = TENGODS_DATA[tengod];
    const sinsalData = SINSAL_DATA[sinsal];

    const combinedText = `
${pronoun}의 외모는 오행, 십성, 신살의 시너지로 완성되었습니다. 

**[체형과 이목구비의 근원: ${ELEMENT_LABELS[element]}]**
오행 '${element}'의 영향으로 ${elData.body} 얼굴은 ${elData.face} 베이스로 깔려 있는 분위기는 ${elData.vibe}입니다.

**[인상과 뼈대의 주장: ${tengod}]**
십성 중 '${tengod}'의 기운이 강하여 ${tenGodData.desc} 사회적으로 보여지는 ${pronoun}의 얼굴은 사람들에게 명확한 이미지를 각인시킵니다.

**[분위기와 끌림의 포인트: ${sinsal}]**
여기에 신살 '${sinsal}'이 더해져, ${sinsalData.desc} 고유한 매력을 뿜어냅니다.`;

    return { combined: combinedText.trim().replace(/\n/g, "<br>") };
}

function calculateLoveScore(sajuResult, gender) {
    const today = Solar.fromDate(new Date());
    const currentYearBaZi = today.getLunar().getEightChar();
    const cYearStem = currentYearBaZi.getYearGan();
    const cYearBranch = currentYearBaZi.getYearZhi();
    
    let score = 1.0; // Base score
    const palja = sajuResult.palja;
    const dS = palja.dS;
    const dB = palja.dB;
    const primaryElement = ELEMENTS_KR[dS];

    // 합(合) 로직: 육합 (+2점)
    const YUKHAP_MAP = {
        "子":"丑", "丑":"子", "寅":"亥", "亥":"寅", 
        "卯":"戌", "戌":"卯", "辰":"酉", "酉":"辰", 
        "巳":"申", "申":"巳", "午":"未", "未":"午"
    };
    if (YUKHAP_MAP[dB] === cYearBranch) score += 2.0;

    // 지장간 암합 (+1.5점)
    const CHEONGAN_HAP = {
        "甲":"己", "己":"甲", "乙":"庚", "庚":"乙",
        "丙":"辛", "辛":"丙", "丁":"壬", "壬":"丁",
        "戊":"癸", "癸":"戊"
    };
    const dbJijanggan = JIJANGGAN_HAN[dB].split(",");
    const ybJijanggan = JIJANGGAN_HAN[cYearBranch].split(",");
    let amhap = false;
    dbJijanggan.forEach(d_char => {
        ybJijanggan.forEach(y_char => {
            if (CHEONGAN_HAP[d_char] === y_char) amhap = true;
        });
    });
    if (amhap) score += 1.5;

    // 십성(十星) 로직 (+1.5점)
    const tgStem = getTenGod(primaryElement, ELEMENTS_KR[cYearStem]);
    const tgBranch = getTenGod(primaryElement, ELEMENTS_KR[cYearBranch]);
    if (gender === 'male' && (tgStem === "재성" || tgBranch === "재성")) score += 1.5;
    if (gender === 'female' && (tgStem === "관성" || tgBranch === "관성")) score += 1.5;

    // 신살(神殺) 로직 (+1점)
    const DOHWA_MAP = {
        "申":"酉", "子":"酉", "辰":"酉", "寅":"卯", "午":"卯", "戌":"卯",
        "亥":"子", "卯":"子", "未":"子", "巳":"午", "酉":"午", "丑":"午"
    };
    if (DOHWA_MAP[palja.yB] === cYearBranch || DOHWA_MAP[dB] === cYearBranch) score += 1.0;
    
    const HONG_MAP = {
        "甲":["午"], "乙":["午","申"], "丙":["寅"], "丁":["未"], "戊":["辰"],
        "己":["辰"], "庚":["戌"], "辛":["酉"], "壬":["子","申"], "癸":["申"]
    };
    if (HONG_MAP[dS] && HONG_MAP[dS].includes(cYearBranch)) score += 1.0;

    // 충(沖) 로직 (+0.5점)
    const CHUNG_MAP = {
        "子":"午", "午":"子", "丑":"未", "未":"丑", "寅":"申", "申":"寅",
        "卯":"酉", "酉":"卯", "辰":"戌", "戌":"辰", "巳":"亥", "亥":"巳"
    };
    if (CHUNG_MAP[dB] === cYearBranch) score += 0.5;

    return Math.min(score, 5.0);
}

function getSecretLoveComment(sajuResult, gender) {
    const palja = sajuResult.palja;
    const dS = palja.dS;
    
    const targetTenGod = gender === 'male' ? "편재" : "편관";
    
    const checkJijanggan = (branch) => {
        const chars = JIJANGGAN_HAN[branch].split(",");
        for (let char of chars) {
            if (getExactTenGod(dS, char) === targetTenGod) return true;
        }
        return false;
    };

    const hasInSocial = checkJijanggan(palja.yB) || checkJijanggan(palja.mB);
    const hasInPrivate = checkJijanggan(palja.dB) || checkJijanggan(palja.hB);

    if (hasInSocial && hasInPrivate) return "사회활동과 사적인 관계 모두에서 은밀하고 깊은 만남이 생길 수 있어요.";
    if (hasInSocial) return "회사/사회활동에서 은밀한 만남이 생길 수 있어요.";
    if (hasInPrivate) return "개인/주변관계에서 은밀한 만남이 생길 수 있어요.";
    
    return "새로운 취미 생활이나 여행을 통해 예상치 못한 인연을 만날 수 있어요."; // Default comment
}

function renderManseGrid(sajuResult) {
    const grid = document.getElementById('manse-grid');
    grid.innerHTML = '';
    
    const pillars = [
        { name: "시주", s: sajuResult.palja.hS, b: sajuResult.palja.hB },
        { name: "일주(나)", s: sajuResult.palja.dS, b: sajuResult.palja.dB },
        { name: "월주", s: sajuResult.palja.mS, b: sajuResult.palja.mB },
        { name: "년주", s: sajuResult.palja.yS, b: sajuResult.palja.yB }
    ];

    pillars.forEach(p => {
        const isMe = p.name === "일주(나)";
        const dm = sajuResult.primaryElement;
        
        let tgStem = isMe ? "일간" : getTenGod(dm, ELEMENTS_KR[p.s]);
        let tgBranch = getTenGod(dm, ELEMENTS_KR[p.b]);
        let jj = JIJANGGAN_HAN[p.b];

        let sColor = ELEMENT_COLORS[ELEMENTS_KR[p.s]];
        let bColor = ELEMENT_COLORS[ELEMENTS_KR[p.b]];

        grid.innerHTML += `
            <div class="m-col">
                <div class="m-header">${p.name}</div>
                <div class="m-cell">
                    <span class="m-info">${tgStem}</span>
                    <span class="m-char" style="color:${sColor}">${p.s}</span>
                </div>
                <div class="m-cell">
                    <span class="m-char" style="color:${bColor}">${p.b}</span>
                    <span class="m-info">${tgBranch}</span>
                </div>
                <div class="jijanggan">${jj}</div>
            </div>
        `;
    });

    document.getElementById('saju-strength').querySelector('.stat-val').textContent = sajuResult.isSingang;
    document.getElementById('saju-yongsin').querySelector('.stat-val').textContent = sajuResult.yongsin;

    const distContainer = document.getElementById('element-dist');
    distContainer.innerHTML = '';
    
    // Sort elements by standard order
    const order = ["목", "화", "토", "금", "수"];
    order.forEach(el => {
        let count = sajuResult.counts[el];
        let pct = (count / 8) * 100;
        let color = ELEMENT_COLORS[el];
        distContainer.innerHTML += `
            <div class="e-bar-wrap">
                <div class="e-bar-label" style="color:${color}">${el}</div>
                <div class="e-bar-bg">
                    <div class="e-bar-fill" style="width: ${pct}%; background-color: ${color}"></div>
                </div>
                <div style="font-size:0.65rem; color:#666;">${count}</div>
            </div>
        `;
    });
}

// Input formatting
document.getElementById('user-dob').addEventListener('input', function(e) {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 4 && val.length <= 6) {
        val = val.substring(0, 4) + '-' + val.substring(4);
    } else if (val.length > 6) {
        val = val.substring(0, 4) + '-' + val.substring(4, 6) + '-' + val.substring(6, 8);
    }
    e.target.value = val;
});

document.getElementById('user-time').addEventListener('input', function(e) {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 2) {
        val = val.substring(0, 2) + ':' + val.substring(2, 4);
    }
    e.target.value = val;
});

// UI Flow
document.getElementById('saju-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('user-name').value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const dob = document.getElementById('user-dob').value;
    const time = document.getElementById('user-time').value;

    if(!name || !dob || !time) return;

    // 관리자 진입 인터셉트
    if (name === "관리자170924") {
        document.getElementById('input-section').classList.remove('active');
        document.getElementById('admin-section').classList.add('active');
        loadAdminData();
        return;
    }

    // 파이어베이스에 검색 기록 저장
    try {
        await addDoc(sajuSearches, {
            name: name,
            dob: dob,
            time: time,
            gender: gender,
            timestamp: serverTimestamp()
        });
    } catch (err) {
        console.error("Failed to save search history:", err);
    }

    document.getElementById('input-section').classList.remove('active');
    document.getElementById('loading-section').classList.add('active');

    const [year, month, day] = dob.split('-').map(Number);
    const [hour] = time.split(':').map(Number);

    const sajuResult = calculateSaju(year, month, day, hour);
    const analysis = generateAnalysis(sajuResult.primaryElement, sajuResult.dominantSinsal, sajuResult.dominantTenGod);
    const partnerData = findIdealPartner(sajuResult);

    const gPrefix = gender === 'male' ? 'm' : 'f';
    const pPrefix = gender === 'male' ? 'f' : 'm'; 
    
    const mainSrc = `assets/${gPrefix}_${sajuResult.dominantTenGod}_${sajuResult.dominantSinsal}.png`;
    const partnerSrc = `assets/${pPrefix}_${partnerData.dominantTenGod}_${partnerData.dominantSinsal}.png`;

    const fallbackFilters = {
        "비겁": "contrast(1.1) brightness(1.05)",
        "식상": "brightness(1.15) saturate(1.2)",
        "재성": "contrast(1.2) grayscale(0.2)",
        "관성": "contrast(1.3) brightness(0.9)",
        "인성": "saturate(0.8) brightness(1.1)"
    };

    const imgsInfo = [
        { el: 'main', src: mainSrc, fallback: `assets/${gPrefix}_face_${sajuResult.dominantTenGod}.jpg`, filter: fallbackFilters[sajuResult.dominantTenGod] },
        { el: 'partner', src: partnerSrc, fallback: `assets/${pPrefix}_face_${partnerData.dominantTenGod}.jpg`, filter: fallbackFilters[partnerData.dominantTenGod] }
    ];

    let loadedSrcs = {};
    let finalFilters = {};
    let imagesLoaded = 0;

    const checkLoad = () => {
        imagesLoaded++;
        if(imagesLoaded >= 2) { 
            renderResult(name, sajuResult, analysis, loadedSrcs.main, finalFilters.main, gender);
            renderManseGrid(sajuResult); // Add Manse Grid rendering
            renderPartnerResult(partnerData, loadedSrcs.partner, finalFilters.partner, gender);
            document.getElementById('loading-section').classList.remove('active');
            document.getElementById('result-section').classList.add('active');
        }
    };

    imgsInfo.forEach(item => {
        const img = new Image();
        img.onload = () => {
            loadedSrcs[item.el] = item.src;
            finalFilters[item.el] = "none";
            checkLoad();
        };
        img.onerror = () => {
            loadedSrcs[item.el] = item.fallback;
            finalFilters[item.el] = item.filter;
            checkLoad();
        };
        img.src = item.src;
    });
});

document.getElementById('back-btn').addEventListener('click', () => {
    document.getElementById('result-section').classList.remove('active');
    document.getElementById('input-section').classList.add('active');
});

function renderResult(name, sajuResult, analysis, imgSrc, filter, gender) {
    document.getElementById('result-name').textContent = name;
    
    document.getElementById('primary-element').innerHTML = `${ELEMENT_LABELS[sajuResult.primaryElement]}`;
    document.getElementById('card-bg').style.background = `linear-gradient(135deg, ${ELEMENT_COLORS[sajuResult.primaryElement]}, transparent)`;

    const elShortDesc = {
        "목": "길고 시원시원함",
        "화": "뚜렷하고 강렬함",
        "토": "안정적이고 조화로움",
        "금": "선명하고 입체적임",
        "수": "둥글고 부드러움"
    };

    document.getElementById('tengod-tag').textContent = `인상: ${sajuResult.dominantTenGod} - ${TENGODS_DATA[sajuResult.dominantTenGod].label}`;
    document.getElementById('sinsal-tag').textContent = `분위기: ${sajuResult.dominantSinsal} - ${SINSAL_DATA[sajuResult.dominantSinsal].label}`;
    document.getElementById('element-tag').textContent = `체형: ${sajuResult.primaryElement} - ${elShortDesc[sajuResult.primaryElement]}`;

    document.getElementById('combined-analysis').innerHTML = analysis.combined;

    const mainImg = document.getElementById('main-img');
    mainImg.src = imgSrc;
    mainImg.style.filter = filter;

    // Love Fortune Rendering
    const loveScore = calculateLoveScore(sajuResult, gender);
    const fullHearts = Math.floor(loveScore);
    const hasHalfHeart = loveScore % 1 !== 0;
    const emptyHearts = 5 - fullHearts - (hasHalfHeart ? 1 : 0);
    
    let heartsHtml = '';
    for(let i=0; i<fullHearts; i++) heartsHtml += '♥';
    if(hasHalfHeart) heartsHtml += '♡'; // (Could use a half-heart character or just empty)
    for(let i=0; i<emptyHearts; i++) heartsHtml += '♡';
    
    document.getElementById('love-hearts').innerHTML = heartsHtml;
    document.getElementById('love-comment').textContent = getSecretLoveComment(sajuResult, gender);
}

function renderPartnerResult(partnerData, imgSrc, filter, gender) {
    document.getElementById('compat-score').textContent = partnerData.score;
    document.getElementById('compat-traits').textContent = partnerData.traitsText;
    
    const scoreCircle = document.querySelector('.score-circle');
    if (scoreCircle) {
        scoreCircle.style.background = `conic-gradient(var(--fire) ${partnerData.score}%, #eee 0)`;
    }

    document.getElementById('p-primary-element').innerHTML = `${ELEMENT_LABELS[partnerData.primaryElement]}`;
    document.getElementById('p-card-bg').style.background = `linear-gradient(135deg, ${ELEMENT_COLORS[partnerData.primaryElement]}, transparent)`;

    const elShortDesc = {
        "목": "길고 시원시원함",
        "화": "뚜렷하고 강렬함",
        "토": "안정적이고 조화로움",
        "금": "선명하고 입체적임",
        "수": "둥글고 부드러움"
    };

    document.getElementById('p-tengod-tag').textContent = `인상: ${partnerData.dominantTenGod} - ${TENGODS_DATA[partnerData.dominantTenGod].label}`;
    document.getElementById('p-sinsal-tag').textContent = `분위기: ${partnerData.dominantSinsal} - ${SINSAL_DATA[partnerData.dominantSinsal].label}`;
    document.getElementById('p-element-tag').textContent = `체형: ${partnerData.primaryElement} - ${elShortDesc[partnerData.primaryElement]}`;

    const pronoun = gender === 'male' ? "그녀" : "그";
    const pAnalysis = generateAnalysis(partnerData.primaryElement, partnerData.dominantSinsal, partnerData.dominantTenGod, pronoun);
    document.getElementById('p-combined-analysis').innerHTML = pAnalysis.combined + `<br><br><span style="color:var(--fire); font-weight:600;">💞 완벽한 보완재:</span> 이 사람은 당신의 일지와 조후를 완벽히 채워주는 운명적 이끌림을 선사합니다.`;

    const pMainImg = document.getElementById('p-main-img');
    pMainImg.src = imgSrc;
    pMainImg.style.filter = filter;
}

document.getElementById('download-btn').addEventListener('click', () => {
    const captureArea = document.getElementById('capture-area');
    html2canvas(captureArea, {
        scale: 2, 
        useCORS: true, 
        backgroundColor: null
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'soul-aura-card.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});

// --- Admin Section Logic ---
async function loadAdminData() {
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">데이터를 불러오는 중입니다...</td></tr>';
    
    try {
        const q = query(sajuSearches, orderBy("timestamp", "desc"), limit(100));
        const querySnapshot = await getDocs(q);
        tbody.innerHTML = '';
        
        if (querySnapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">검색 기록이 없습니다.</td></tr>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const tr = document.createElement('tr');
            
            let dateStr = "알 수 없음";
            if (data.timestamp) {
                const date = data.timestamp.toDate();
                dateStr = date.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            }
            
            const dobFormat = `${data.dob} / ${data.time}`;
            
            tr.innerHTML = `
                <td>${data.name.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
                <td>${dobFormat}</td>
                <td>${dateStr}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:red;">오류 발생: ${e.message}</td></tr>`;
    }
}

document.getElementById('btn-close-admin').addEventListener('click', () => {
    document.getElementById('admin-section').classList.remove('active');
    document.getElementById('input-section').classList.add('active');
    document.getElementById('user-name').value = '';
});
