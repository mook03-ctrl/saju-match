import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp, query, orderBy, limit, where, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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
const sajuPartners = collection(db, "saju_partners");

window.currentUserSession = null;

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
const SINSAL_MAP = ["도화살", "홍염살", "천을귀인", "역마살", "괴강살"];

const PROMPT_ELEMENTS = {
    "목": "slender and tall body, slightly long natural face shape, pure and innocent vibe",
    "화": "fit and healthy body, slim V-line face, bright eyes, glamorous yet casual vibe",
    "토": "well-balanced sturdy body, round and soft friendly face, reliable and comfortable vibe",
    "금": "slim body, clear and neat facial features, chic and clean vibe",
    "수": "soft and slightly curvy body, round face with big dewy eyes, cute and emotional vibe"
};

const PROMPT_TENGODS = {
    "비겁": "confident but friendly look, natural facial lines, soft smile",
    "식상": "youthful and cute face, highly expressive, bright natural smile",
    "재성": "neat and symmetrical face, highly likable and gentle impression, soft smile",
    "관성": "straight tidy facial lines, trustworthy and classic handsome/beautiful look, gentle smile",
    "인성": "soft innocent eyes, pure and gentle look, very friendly expression"
};

const PROMPT_VIBES = {
    "charm": { shot: "Medium full shot, thigh-up portrait, slightly zoomed in", desc: "sophisticated light spring fashion, elegant and stylish, not tacky, bright daylight, cozy stylish cafe background" },
    "noble": { shot: "Medium full shot, thigh-up portrait, slightly zoomed in", desc: "sophisticated trendy spring fashion, elegant and stylish, not tacky, bright daylight, beautiful natural street background" },
    "unique": { shot: "Medium full shot, thigh-up portrait, slightly zoomed in", desc: "sophisticated light spring fashion, creative and stylish, not tacky, bright daylight, cozy stylish cafe background" },
    "strong": { shot: "Medium full shot, thigh-up portrait, slightly zoomed in", desc: "sophisticated modern street fashion, elegant and stylish, not tacky, bright daylight, beautiful natural street background" }
};

const JIJANGGAN_HAN = {
    "子": "壬,癸", "丑": "癸,辛,己", "寅": "戊,丙,甲", "卯": "甲,乙", "辰": "乙,癸,戊", "巳": "戊,庚,丙",
    "午": "丙,己,丁", "未": "丁,乙,己", "申": "戊,壬,庚", "酉": "庚,辛", "戌": "辛,丁,戊", "亥": "戊,甲,壬"
};

const YIN_YANG_STEMS = {
    "甲":"+", "乙":"-", "丙":"+", "丁":"-", "戊":"+", "己":"-", "庚":"+", "辛":"-", "壬":"+", "癸":"-"
};

const SINSAL_DATA = {
    "도화살": { label: "시선을 끄는 매력", desc: "눈빛이 강하고 이성에게 큰 매력으로 작용하는 색기와 인기를 지녔습니다." },
    "홍염살": { label: "치명적인 분위기", desc: "화려하고 섹시한 느낌으로 얼굴이 눈에 띄며 무대형 매력을 발산합니다." },
    "천을귀인": { label: "고급스러운 귀티", desc: "고급스럽고 귀티가 흐르며 깨끗하고 단정한 인상을 줍니다." },
    "역마살": { label: "이국적인 개성", desc: "이국적이고 흔하지 않은 얼굴 구조로 톡톡 튀는 매력이 있습니다." },
    "괴강살": { label: "압도적인 카리스마", desc: "선이 굵고 카리스마가 강하며 남녀 불문 압도감을 주는 인상을 남깁니다." }
};

const TENGODS_DATA = {
    "비겁": { label: "자기 주장 있는 얼굴", desc: "존재감이 있고 선이 강하거나 눈에 띄는 자기 주장이 담긴 얼굴을 가졌습니다." },
    "식상": { label: "연예인 느낌의 포인트", desc: "표정이 풍부하고 입과 턱 쪽이 발달하여 귀여움과 끼가 넘치는 얼굴입니다." },
    "재성": { label: "호감형, 깔끔형", desc: "현실적이고 단정하며 이목구비의 균형이 아주 좋은 깔끔한 인상입니다." },
    "관성": { label: "공무원/아나운서상", desc: "선이 단정하고 반듯하게 정리되어 있어 신뢰감을 주는 정석 미남/미녀의 느낌입니다." },
    "인성": { label: "동안과 청순", desc: "부드럽고 어려 보이며 사람들의 보호본능을 자극하는 순한 눈빛을 지녔습니다." }
};

const ELEMENT_TRAITS = {
    "목": { body: "키가 크거나 커 보이며, 팔다리가 길고 가늘어 전체적으로 '길게 뻗은' 느낌입니다.", face: "얼굴형이 길거나 타원형이고 눈이 길고 시원하게 트여 있습니다.", vibe: "청순, 자연스러움, 소년/소녀 같은 깔끔한 지적인 인상" },
    "화": { body: "어깨나 가슴 쪽 상체가 발달했으며 움직임이 빠르고 활발해 보입니다.", face: "턱이 뾰족한 V라인에 윤곽이 살아있고 눈빛이 또렷합니다.", vibe: "첫인상이 강렬하고 화려하며 섹시한 존재감을 뿜어냅니다." },
    "토": { body: "살집이 적당히 있고 다부지며 안정된 균형 잡힌 체형입니다.", face: "얼굴이 넓거나 둥글며 코가 중심을 잘 잡아주어 조화롭습니다.", vibe: "오래 볼수록 호감형인 편안하고 신뢰감 가는 인상입니다." },
    "금": { body: "뼈대가 뚜렷하고 마른 편이며, 직선적이고 단단한 골격이 잘 드러납니다.", face: "이목구비가 입체적이고 선명하며 얼굴형에 각이 살아있습니다.", vibe: "차분하고 거리감 있는 세련된 도시적인 모델 느낌입니다." },
    "수": { body: "부드럽고 유연한 몸선을 가졌으며 전체적으로 둥글둥글한 체질입니다.", face: "얼굴이 둥글고 볼살이 있으며 큰 눈과 도톰한 입술을 가졌습니다.", vibe: "귀엽고 감성적이며 다가가기 쉬운 친근한 동안 느낌입니다." }
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

    let foundSinsal = [];

    // 1. 괴강살
    const GOEGANG = ["戊戌", "庚戌", "庚辰", "壬辰"];
    if (pillars.some(p => GOEGANG.includes(p))) foundSinsal.push("괴강살");

    // 2. 역마살
    const YEOKMA_MAP = {
        "申":"寅", "子":"寅", "辰":"寅",
        "寅":"申", "午":"申", "戌":"申",
        "亥":"巳", "卯":"巳", "未":"巳",
        "巳":"亥", "酉":"亥", "丑":"亥"
    };
    if (branches.includes(YEOKMA_MAP[palja.yB]) || branches.includes(YEOKMA_MAP[palja.dB])) {
        foundSinsal.push("역마살");
    }

    // 3. 천을귀인
    const CHEONEUL_MAP = {
        "甲":["丑","未"], "戊":["丑","未"], "庚":["丑","未"],
        "乙":["子","申"], "己":["子","申"],
        "丙":["亥","酉"], "丁":["亥","酉"],
        "辛":["寅","午"],
        "壬":["卯","巳"], "癸":["卯","巳"]
    };
    let cg = CHEONEUL_MAP[palja.dS];
    if (cg && (branches.includes(cg[0]) || branches.includes(cg[1]))) {
        foundSinsal.push("천을귀인");
    }

    // 4. 도화살
    const DOHWA_MAP = {
        "申":"酉", "子":"酉", "辰":"酉",
        "寅":"卯", "午":"卯", "戌":"卯",
        "亥":"子", "卯":"子", "未":"子",
        "巳":"午", "酉":"午", "丑":"午"
    };
    if (branches.includes(DOHWA_MAP[palja.yB]) || branches.includes(DOHWA_MAP[palja.dB])) foundSinsal.push("도화살");

    // 5. 홍염살
    const HONG_MAP = {
        "甲":["午"], "乙":["午","申"], "丙":["寅"], "丁":["未"], "戊":["辰"],
        "己":["辰"], "庚":["戌"], "辛":["酉"], "壬":["子","申"], "癸":["申"]
    };
    if (HONG_MAP[palja.dS] && HONG_MAP[palja.dS].some(b => branches.includes(b))) foundSinsal.push("홍염살");

    let dominantSinsal = foundSinsal.length > 0 ? foundSinsal[0] : SINSAL_MAP[Math.floor(Math.random() * SINSAL_MAP.length)];

    // Genuine Dominant Ten God (격국: 월지 기준)
    let mBranchElement = ELEMENTS_KR[palja.mB];
    let dominantTenGod = getTenGod(primaryElement, mBranchElement) || "비겁";

    let vibeGroup = getVibeGroup(dominantSinsal);

    return { 
        palja, counts, primaryElement, dominantSinsal, dominantTenGod, vibeGroup,
        dBranchIdx: BRANCHES.indexOf(palja.dB), isSingang, yongsin 
    };
}

function getVibeGroup(sinsal) {
    if (["도화살", "홍염살", "역마살"].includes(sinsal)) return "charm";
    return "noble"; // Default and others map to noble
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
    let pVibeGroup = getVibeGroup(pSinsal);

    return {
        score,
        traitsText: partnerTraits.join(" + "),
        primaryElement: partnerPrimaryElement,
        dominantSinsal: pSinsal,
        dominantTenGod: pTenGod,
        vibeGroup: pVibeGroup
    };
}

function getArchetype(element, tengod, sinsal) {
    const archetypes = [
        { name: "🌿 청순 동안형", e: ["목", "수"], t: ["인성", "식상"], s: ["도화살"], desc: "순수하고 맑은 첫사랑 느낌" },
        { name: "🔥 화려 섹시형", e: ["화", "금"], t: ["식상", "재성"], s: ["도화살", "홍염살"], desc: "강한 끌림을 주는 화려한 매력" },
        { name: "🟫 안정 호감형", e: ["토"], t: ["재성", "관성"], s: ["천을귀인"], desc: "조화롭고 편안한 신뢰감" },
        { name: "⚪ 도시 세련형", e: ["금"], t: ["관성", "재성"], s: ["괴강살", "천을귀인"], desc: "차가운 매력의 세련된 모델 느낌" },
        { name: "💧 귀여운 감성형", e: ["수"], t: ["식상", "인성"], s: ["도화살", "홍염살"], desc: "친근하고 애교 넘치는 매력" },
        { name: "⚔️ 카리스마 강한형", e: ["화", "금"], t: ["관성", "비겁"], s: ["괴강살", "역마살"], desc: "선이 굵고 강렬한 압도적 존재감" },
        { name: "🌍 이국적 개성형", e: ["수", "금", "목"], t: ["식상", "재성"], s: ["역마살"], desc: "흔하지 않은 구조의 독창적인 매력" }
    ];

    let bestMatch = archetypes[0];
    let maxScore = -1;

    archetypes.forEach(arc => {
        let score = 0;
        if(arc.e.includes(element)) score += 2;
        if(arc.t.includes(tengod)) score += 2;
        if(arc.s.includes(sinsal)) score += 1.5;
        
        // Random variance for tie-breaking
        score += Math.random() * 0.1;
        
        if(score > maxScore) {
            maxScore = score;
            bestMatch = arc;
        }
    });

    return bestMatch;
}

function generateAnalysis(element, sinsal, tengod, pronoun = "당신") {
    const elData = ELEMENT_TRAITS[element];
    const tenGodData = TENGODS_DATA[tengod];
    const sinsalData = SINSAL_DATA[sinsal];
    const arc = getArchetype(element, tengod, sinsal);

    const combinedText = `
${pronoun}의 외모는 오행, 십성, 신살의 시너지로 완성된 **[${arc.name}]**입니다. 
${arc.desc}을 풍기는 특별한 매력을 지니고 있습니다.

**[체형과 이목구비의 근원: ${ELEMENT_LABELS[element]}]**
오행 '${element}'의 영향으로 ${elData.body} 얼굴은 ${elData.face} 베이스로 깔려 있는 분위기는 ${elData.vibe}입니다.

**[인상과 뼈대의 주장: ${tengod}]**
십성 중 '${tengod}'의 기운이 강하여 ${tenGodData.desc} 사회적으로 보여지는 ${pronoun}의 얼굴은 사람들에게 명확한 이미지를 각인시킵니다.

**[분위기와 끌림의 포인트: ${sinsal}]**
여기에 신살 '${sinsal}'이 더해져, ${sinsalData.desc}`;

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

    return Math.max(0.0, Math.min(score, 5.0));
}

function calculateMonthLoveScore(sajuResult, gender) {
    const today = Solar.fromDate(new Date());
    const currentBaZi = today.getLunar().getEightChar();
    const cMonthStem = currentBaZi.getMonthGan();
    const cMonthBranch = currentBaZi.getMonthZhi();
    
    let score = 1.0;
    const palja = sajuResult.palja;
    const dS = palja.dS;
    const dB = palja.dB;
    const primaryElement = ELEMENTS_KR[dS];

    const YUKHAP_MAP = {
        "子":"丑", "丑":"子", "寅":"亥", "亥":"寅", 
        "卯":"戌", "戌":"卯", "辰":"酉", "酉":"辰", 
        "巳":"申", "申":"巳", "午":"未", "未":"午"
    };
    if (YUKHAP_MAP[dB] === cMonthBranch) score += 2.0;

    const CHEONGAN_HAP = {
        "甲":"己", "己":"甲", "乙":"庚", "庚":"乙",
        "丙":"辛", "辛":"丙", "丁":"壬", "壬":"丁",
        "戊":"癸", "癸":"戊"
    };
    const dbJijanggan = JIJANGGAN_HAN[dB].split(",");
    const mbJijanggan = JIJANGGAN_HAN[cMonthBranch].split(",");
    let amhap = false;
    dbJijanggan.forEach(d_char => {
        mbJijanggan.forEach(m_char => {
            if (CHEONGAN_HAP[d_char] === m_char) amhap = true;
        });
    });
    if (amhap) score += 1.5;

    const tgStem = getTenGod(primaryElement, ELEMENTS_KR[cMonthStem]);
    const tgBranch = getTenGod(primaryElement, ELEMENTS_KR[cMonthBranch]);
    if (gender === 'male' && (tgStem === "재성" || tgBranch === "재성")) score += 1.5;
    if (gender === 'female' && (tgStem === "관성" || tgBranch === "관성")) score += 1.5;

    const DOHWA_MAP = {
        "申":"酉", "子":"酉", "辰":"酉", "寅":"卯", "午":"卯", "戌":"卯",
        "亥":"子", "卯":"子", "未":"子", "巳":"午", "酉":"午", "丑":"午"
    };
    if (DOHWA_MAP[palja.yB] === cMonthBranch || DOHWA_MAP[dB] === cMonthBranch) score += 1.0;
    
    const HONG_MAP = {
        "甲":["午"], "乙":["午","申"], "丙":["寅"], "丁":["未"], "戊":["辰"],
        "己":["辰"], "庚":["戌"], "辛":["酉"], "壬":["子","申"], "癸":["申"]
    };
    if (HONG_MAP[dS] && HONG_MAP[dS].includes(cMonthBranch)) score += 1.0;

    const CHUNG_MAP = {
        "子":"午", "午":"子", "丑":"未", "未":"丑", "寅":"申", "申":"寅",
        "卯":"酉", "酉":"卯", "辰":"戌", "戌":"辰", "巳":"亥", "亥":"巳"
    };
    if (CHUNG_MAP[dB] === cMonthBranch) score += 0.5;

    return Math.max(0.0, Math.min(score, 5.0));
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
    
    return ""; // 조건(남자 편재, 여자 편관)에 해당하지 않으면 코멘트 없음
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

// 관리자 로그인 시 required 해제
document.getElementById('user-name').addEventListener('input', (e) => {
    const isAdmin = e.target.value === '관리자170924';
    document.getElementById('user-dob').required = !isAdmin;
    document.getElementById('user-time').required = !isAdmin;
});

// UI Flow
document.getElementById('saju-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('user-name').value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const dob = document.getElementById('user-dob').value;
    const time = document.getElementById('user-time').value;

    if (name === "관리자170924") {
        document.getElementById('input-section').classList.remove('active');
        document.getElementById('admin-section').classList.remove('hidden');
        document.getElementById('admin-section').classList.add('active');
        loadAdminData();
        return;
    }

    if(!name || !dob || !time) return;

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
    window.currentUserSession = {
        name: name,
        gender: gender,
        dob: dob,
        time: time,
        sajuResult: sajuResult
    };
    const analysis = generateAnalysis(sajuResult.primaryElement, sajuResult.dominantSinsal, sajuResult.dominantTenGod);
    const partnerData = findIdealPartner(sajuResult);

    const gPrefix = gender === 'male' ? 'm' : 'f';
    const pPrefix = gender === 'male' ? 'f' : 'm'; 
    const gKr = gender === 'male' ? '남성' : '여성';
    const pKr = gender === 'male' ? '여성' : '남성';

    let mainVibe = "noble";
    if (sajuResult.sinsalList.includes("도화살") || sajuResult.sinsalList.includes("홍염살") || sajuResult.dominantTenGod === "식상" || sajuResult.dominantTenGod === "재성") {
        mainVibe = "charm";
    }
    
    let partnerVibe = "noble";
    if (partnerData.dominantTenGod === "식상" || partnerData.dominantTenGod === "재성") {
        partnerVibe = "charm";
    }

    const mainFolder = `assets/appearance_types/${gKr}/${sajuResult.primaryElement}_${sajuResult.dominantTenGod}_${mainVibe}`;
    const partnerFolder = `assets/appearance_types/${pKr}/${partnerData.primaryElement}_${partnerData.dominantTenGod}_${partnerVibe}`;

    const fallbackFilters = {
        "비겁": "contrast(1.1) brightness(1.05)",
        "식상": "brightness(1.15) saturate(1.2)",
        "재성": "contrast(1.2) grayscale(0.2)",
        "관성": "contrast(1.3) brightness(0.9)",
        "인성": "saturate(0.8) brightness(1.1)"
    };

    const imgsInfo = [
        { el: 'main', 
          urls: [
            `${mainFolder}/face1.jpg`,
            `${mainFolder}/face.jpg`,
            `assets/${gPrefix}_face_${sajuResult.dominantTenGod}.jpg`
          ], 
          filter: fallbackFilters[sajuResult.dominantTenGod] 
        },
        { el: 'partner', 
          urls: [
            `${partnerFolder}/face1.jpg`,
            `${partnerFolder}/face.jpg`,
            `assets/${pPrefix}_face_${partnerData.dominantTenGod}.jpg`
          ], 
          filter: fallbackFilters[partnerData.dominantTenGod] 
        }
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
        let urlIndex = 0;
        const img = new Image();
        
        img.onload = () => {
            loadedSrcs[item.el] = item.urls[urlIndex];
            // Apply filter only if it fell back to the root TenGod image (last url)
            finalFilters[item.el] = (urlIndex === item.urls.length - 1) ? item.filter : "none"; 
            checkLoad();
        };
        img.onerror = () => {
            urlIndex++;
            if (urlIndex < item.urls.length) {
                img.src = item.urls[urlIndex];
            } else {
                loadedSrcs[item.el] = item.urls[item.urls.length - 1];
                finalFilters[item.el] = item.filter;
                checkLoad();
            }
        };
        img.src = item.urls[urlIndex];
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
    function getHeartsHtml(score) {
        const full = Math.floor(score);
        const half = score % 1 !== 0;
        const empty = 5 - full - (half ? 1 : 0);
        let html = '';
        for(let i=0; i<full; i++) html += '♥';
        if(half) html += '♡';
        for(let i=0; i<empty; i++) html += '♡';
        return html;
    }
    
    document.getElementById('year-love-hearts').innerHTML = getHeartsHtml(calculateLoveScore(sajuResult, gender));
    document.getElementById('month-love-hearts').innerHTML = getHeartsHtml(calculateMonthLoveScore(sajuResult, gender));
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


// --- Partner DB Matching Logic ---
let currentMatches = [];
let currentMatchIndex = 0;

document.getElementById('btn-open-partner-registration').addEventListener('click', () => {
    if (!window.currentUserSession) return;
    const sess = window.currentUserSession;
    document.getElementById('result-section').classList.remove('active');
    document.getElementById('partner-registration-section').classList.add('active');
    document.getElementById('partner-registration-section').classList.remove('hidden');
    
    document.getElementById('reg-name').value = sess.name;
    document.getElementById('reg-birth').value = `${sess.dob} ${sess.time}`;
});

document.getElementById('btn-cancel-partner').addEventListener('click', () => {
    document.getElementById('partner-registration-section').classList.remove('active');
    document.getElementById('partner-registration-section').classList.add('hidden');
    document.getElementById('result-section').classList.add('active');
});

document.getElementById('partner-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!window.currentUserSession) return;
    
    const sess = window.currentUserSession;
    const instagram = document.getElementById('reg-instagram').value;
    const email = document.getElementById('reg-email').value;
    
    const btnSubmit = document.getElementById('btn-submit-partner');
    const originalText = btnSubmit.textContent;
    btnSubmit.textContent = "저장 중...";
    btnSubmit.disabled = true;

    try {
        const customName = document.getElementById('reg-name').value;
        await addDoc(sajuPartners, {
            name: customName,
            gender: sess.gender,
            dob: sess.dob,
            time: sess.time,
            primaryElement: sess.sajuResult.primaryElement,
            dS: sess.sajuResult.palja.dS,
            dB: sess.sajuResult.palja.dB,
            dominantTenGod: sess.sajuResult.dominantTenGod,
            instagram: instagram,
            email: email,
            timestamp: serverTimestamp()
        });
        
        const targetGender = sess.gender === 'male' ? 'female' : 'male';
        const q = query(sajuPartners, where("gender", "==", targetGender));
        const snapshot = await getDocs(q);
        
        currentMatches = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const compat = calculateFourCompatibilities(sess, data);
            currentMatches.push({ ...data, compat });
        });
        
        currentMatches.sort((a, b) => b.compat.overall - a.compat.overall);
        currentMatchIndex = 0;
        showPartnerResult();
        
    } catch (err) {
        console.error("Partner save/match failed:", err);
        alert("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
        btnSubmit.textContent = originalText;
        btnSubmit.disabled = false;
    }
});

function calculateFourCompatibilities(mySess, partnerData) {
    const mySaju = mySess.sajuResult;
    
    // 1. 성격 궁합
    const E_SYNERGY = {
        "목": {"수": 90, "화": 85, "목": 70, "토": 50, "금": 40},
        "화": {"목": 90, "토": 85, "화": 70, "금": 50, "수": 40},
        "토": {"화": 90, "금": 85, "토": 70, "수": 50, "목": 40},
        "금": {"토": 90, "수": 85, "금": 70, "목": 50, "화": 40},
        "수": {"금": 90, "목": 85, "수": 70, "화": 50, "토": 40}
    };
    let personality = E_SYNERGY[mySaju.primaryElement][partnerData.primaryElement] || 50;

    // 2. 재물 시너지
    const p1 = mySaju.palja.dS.charCodeAt(0);
    const p2 = partnerData.dS.charCodeAt(0);
    let wealth = 60 + ((p1 * p2) % 36); 

    // 3. 속궁합
    let sexual = 50;
    const myDb = mySaju.palja.dB;
    const pDb = partnerData.dB;
    const YUKHAP = { "子":"丑", "丑":"子", "寅":"亥", "亥":"寅", "卯":"戌", "戌":"卯", "辰":"酉", "酉":"辰", "巳":"申", "申":"巳", "午":"未", "未":"午" };
    const CHUNG = { "子":"午", "午":"子", "丑":"未", "未":"丑", "寅":"申", "申":"寅", "卯":"酉", "酉":"卯", "辰":"戌", "戌":"辰", "巳":"亥", "亥":"巳" };
    const SAMHAP = [["亥","卯","未"], ["寅","午","戌"], ["巳","酉","丑"], ["申","子","辰"]];
    
    if (YUKHAP[myDb] === pDb) sexual = 98;
    else if (CHUNG[myDb] === pDb) sexual = 40;
    else {
        let isSamhap = false;
        SAMHAP.forEach(group => {
            if (group.includes(myDb) && group.includes(pDb)) isSamhap = true;
        });
        if (isSamhap) sexual = 85;
        else sexual = 65 + ((myDb.charCodeAt(0) + pDb.charCodeAt(0)) % 25);
    }

    let overall = Math.round((personality + wealth + sexual) / 3);
    return { overall, personality, wealth, sexual };
}

function showPartnerResult() {
    document.getElementById('partner-registration-section').classList.remove('active');
    document.getElementById('partner-registration-section').classList.add('hidden');
    document.getElementById('partner-matching-results-section').classList.add('active');
    document.getElementById('partner-matching-results-section').classList.remove('hidden');
    
    if (currentMatches.length === 0) {
        document.getElementById('no-partner-msg').classList.remove('hidden');
        document.getElementById('partner-match-card-container').classList.remove('hidden');
        
        document.getElementById('match-name').textContent = "??? (매칭 대기중)"; 
        
        document.getElementById('match-overall').textContent = '0%';
        document.getElementById('match-personality').textContent = '0%';
        document.getElementById('match-wealth').textContent = '0%';
        document.getElementById('match-sexual').textContent = '0%';
        
        document.getElementById('modal-instagram').textContent = "아직 등록되지 않았습니다";
        document.getElementById('modal-email').textContent = "아직 등록되지 않았습니다";
        return;
    }
    
    document.getElementById('no-partner-msg').classList.add('hidden');
    document.getElementById('partner-match-card-container').classList.remove('hidden');
    
    const match = currentMatches[currentMatchIndex];
    document.getElementById('match-name').textContent = match.name.substring(0, 1) + 'ㅇㅇ'; 
    
    document.getElementById('match-overall').textContent = match.compat.overall + '%';
    document.getElementById('match-personality').textContent = match.compat.personality + '%';
    document.getElementById('match-wealth').textContent = match.compat.wealth + '%';
    document.getElementById('match-sexual').textContent = match.compat.sexual + '%';
    
    document.getElementById('modal-instagram').textContent = match.instagram;
    document.getElementById('modal-email').textContent = match.email;
}

document.getElementById('btn-find-next-partner').addEventListener('click', () => {
    if (currentMatches.length <= 1) {
        alert("현재 매칭 가능한 다른 상대가 없습니다.");
        return;
    }
    currentMatchIndex++;
    if (currentMatchIndex >= currentMatches.length) currentMatchIndex = 0;
    showPartnerResult();
});

document.getElementById('btn-open-saju-pot').addEventListener('click', () => {
    document.getElementById('saju-pot-modal').classList.remove('hidden');
});

document.getElementById('btn-close-modal').addEventListener('click', () => {
    document.getElementById('saju-pot-modal').classList.add('hidden');
});

document.getElementById('btn-back-to-main').addEventListener('click', () => {
    document.getElementById('partner-matching-results-section').classList.remove('active');
    document.getElementById('partner-matching-results-section').classList.add('hidden');
    document.getElementById('result-section').classList.add('active');
});

// --- Admin Section Logic ---
let currentAdminTab = 'partners'; // 'searches' or 'partners'

window.loadAdminData = async function() {
    const searchesContainer = document.getElementById('admin-list-searches');
    const partnersContainer = document.getElementById('admin-list-partners');
    const countSpan = document.getElementById('admin-count');
    
    document.getElementById('tab-btn-searches').style.color = currentAdminTab === 'searches' ? 'var(--primary-color, #333)' : '#aaa';
    document.getElementById('tab-btn-searches').style.borderBottomColor = currentAdminTab === 'searches' ? 'var(--primary-color, #333)' : 'transparent';
    document.getElementById('tab-btn-partners').style.color = currentAdminTab === 'partners' ? 'var(--primary-color, #333)' : '#aaa';
    document.getElementById('tab-btn-partners').style.borderBottomColor = currentAdminTab === 'partners' ? 'var(--primary-color, #333)' : 'transparent';
    
    searchesContainer.style.display = currentAdminTab === 'searches' ? 'flex' : 'none';
    partnersContainer.style.display = currentAdminTab === 'partners' ? 'flex' : 'none';

    const container = currentAdminTab === 'searches' ? searchesContainer : partnersContainer;
    container.innerHTML = '<p style="text-align:center;">데이터를 불러오는 중입니다...</p>';
    
    try {
        const targetCollection = currentAdminTab === 'searches' ? sajuSearches : sajuPartners;
        const querySnapshot = await getDocs(targetCollection);
        const docs = [];
        querySnapshot.forEach((doc) => {
            docs.push({ id: doc.id, ...doc.data() });
        });
        
        docs.reverse();
        countSpan.textContent = `총 ${docs.length}명`;
        
        if (docs.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:#888;">등록된 데이터가 없습니다. (DB에 문서가 0개입니다.)</p>`;
            return;
        }
        
        container.innerHTML = '';
        docs.forEach(d => {
            const div = document.createElement('div');
            div.style.cssText = 'background: #f9f9f9; padding: 1rem; border-radius: 8px; border: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;';
            
            const info = document.createElement('div');
            let infoHTML = `
                <div style="font-weight: bold; color: #333; margin-bottom: 0.3rem;">${d.name} <span style="font-size: 0.8rem; color: #666; font-weight: normal;">(${d.gender === 'male' ? '남' : '여'})</span></div>
                <div style="font-size: 0.8rem; color: #666; margin-bottom: 0.2rem;">${d.dob} ${d.time} ${d.primaryElement ? '/ ' + d.primaryElement + ' ' + d.dominantTenGod : ''}</div>
            `;
            if (currentAdminTab === 'partners') {
                infoHTML += `<div style="font-size: 0.8rem; color: #888;">${d.instagram || ''} | ${d.email || ''}</div>`;
            }
            info.innerHTML = infoHTML;
            
            const btnContainer = document.createElement('div');
            btnContainer.style.display = 'flex';
            btnContainer.style.gap = '0.5rem';

            const editBtn = document.createElement('button');
            editBtn.textContent = '수정';
            editBtn.style.cssText = 'background: #4facfe; color: white; border: none; padding: 0.5rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem;';
            editBtn.onclick = () => openEditModal(d.id, d, currentAdminTab);

            const delBtn = document.createElement('button');
            delBtn.textContent = '삭제';
            delBtn.style.cssText = 'background: #ff4d4d; color: white; border: none; padding: 0.5rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem;';
            delBtn.onclick = () => deleteAdminData(d.id, div, currentAdminTab);
            
            btnContainer.appendChild(editBtn);
            btnContainer.appendChild(delBtn);

            div.appendChild(info);
            div.appendChild(btnContainer);
            container.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="text-align:center; color:red;">데이터를 불러오는 데 실패했습니다.<br><small>${err.message}</small></p>`;
    }
};

window.deleteAdminData = async function(id, el, tab) {
    if(!confirm('정말 삭제하시겠습니까?')) return;
    try {
        const collectionName = tab === 'searches' ? "saju_searches" : "saju_partners";
        await deleteDoc(doc(db, collectionName, id));
        el.remove();
        alert('삭제되었습니다.');
        loadAdminData();
    } catch(err) {
        console.error(err);
        alert('삭제에 실패했습니다.');
    }
};

window.openEditModal = function(id, data, tab) {
    document.getElementById('admin-edit-modal').classList.remove('hidden');
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-collection').value = tab;
    
    document.getElementById('edit-name').value = data.name || '';
    document.getElementById('edit-dob').value = data.dob || '';
    document.getElementById('edit-time').value = data.time || '';
    
    if (tab === 'partners') {
        document.getElementById('edit-partner-fields').classList.remove('hidden');
        document.getElementById('edit-instagram').value = data.instagram || '';
        document.getElementById('edit-email').value = data.email || '';
    } else {
        document.getElementById('edit-partner-fields').classList.add('hidden');
    }
};

document.getElementById('btn-edit-cancel').addEventListener('click', () => {
    document.getElementById('admin-edit-modal').classList.add('hidden');
});

document.getElementById('btn-edit-save').addEventListener('click', async () => {
    const id = document.getElementById('edit-id').value;
    const tab = document.getElementById('edit-collection').value;
    const collectionName = tab === 'searches' ? "saju_searches" : "saju_partners";
    
    const updateData = {
        name: document.getElementById('edit-name').value,
        dob: document.getElementById('edit-dob').value,
        time: document.getElementById('edit-time').value
    };
    
    if (tab === 'partners') {
        updateData.instagram = document.getElementById('edit-instagram').value;
        updateData.email = document.getElementById('edit-email').value;
    }
    
    document.getElementById('btn-edit-save').textContent = '저장 중...';
    try {
        await updateDoc(doc(db, collectionName, id), updateData);
        alert('성공적으로 수정되었습니다.');
        document.getElementById('admin-edit-modal').classList.add('hidden');
        loadAdminData();
    } catch (err) {
        console.error(err);
        alert('수정에 실패했습니다.');
    } finally {
        document.getElementById('btn-edit-save').textContent = '저장';
    }
});

document.getElementById('tab-btn-searches').addEventListener('click', () => {
    currentAdminTab = 'searches';
    loadAdminData();
});

document.getElementById('tab-btn-partners').addEventListener('click', () => {
    currentAdminTab = 'partners';
    loadAdminData();
});

document.getElementById('btn-admin-refresh').addEventListener('click', () => {
    loadAdminData();
});

document.getElementById('btn-admin-logout').addEventListener('click', () => {
    document.getElementById('admin-section').classList.remove('active');
    document.getElementById('admin-section').classList.add('hidden');
    document.getElementById('input-section').classList.add('active');
    
    document.getElementById('user-name').value = '';
    document.getElementById('user-dob').value = '';
    document.getElementById('user-time').value = '';
});
