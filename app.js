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

const ELEMENT_HAN = { "목": "木", "화": "火", "토": "土", "금": "金", "수": "水" };

const BODY_DICTIONARY = {
    "목": {
        bone: "수직으로 뻗은 길고 슬림한 프레임",
        flesh: "군살이 잘 붙지 않고 선이 얇은 체형",
        skin: "피부가 맑고 투명하며 얇은 편입니다",
        desc: "수직 성장의 기운으로 팔다리가 길고 슬림한 프레임"
    },
    "화": {
        bone: "위로 발산하는 뼈마디가 도드라진 프레임",
        flesh: "상체가 특히 발달하며 에너지가 밖으로 뻗어나가는 체형",
        skin: "혈색이 잘 돌고 생기 있는 붉은 기운이 감도는 피부입니다",
        desc: "위로 발산하는 기운으로 뼈마디가 도드라지고 상체가 발달한 체형"
    },
    "토": {
        bone: "중심이 단단하고 안정감 있는 뼈대",
        flesh: "근육질 또는 두툼한 살집이 잘 붙는 무게감 있는 체격",
        skin: "피부결이 매끄럽고 윤기가 흐르며 건강한 느낌을 줍니다",
        desc: "중첩과 응집의 기운으로 근육이나 살집이 잘 붙는 무게감 있는 체격"
    },
    "금": {
        bone: "어깨가 벌어지고 골격이 견고한 사각형 프레임",
        flesh: "살결이 단단하고 수축된 야무진 체형",
        skin: "피부가 희고 깨끗하며 탄력 있고 쫀쫀한 느낌을 줍니다",
        desc: "수축과 견고함의 기운으로 골격이 단단하고 다부진 프레임"
    },
    "수": {
        bone: "유연하고 곡선적인 부드러운 뼈대",
        flesh: "하체가 발달하거나 부종형으로 인해 부드러운 실루엣을 띠는 체형",
        skin: "물기를 머금은 듯 촉촉하고 부드러우며 투명한 살결을 지녔습니다",
        desc: "유연한 기운으로 부드러운 곡선의 실루엣과 하체가 발달한 체형"
    }
};

function calculateBodyType(palja, counts) {
    const scores = { "목": 0, "화": 0, "토": 0, "금": 0, "수": 0 };
    
    // 1. 월지 (Season) - 40%
    const monthElement = ELEMENTS_KR[palja.mB];
    scores[monthElement] += 40;
    
    // 2. 일간 (Day Master) - 30%
    const dayElement = ELEMENTS_KR[palja.dS];
    scores[dayElement] += 30;
    
    // 3. 다자 오행 (Dominant Element) - 30%
    let maxCount = -1;
    let dominantElements = [];
    for (let el in counts) {
        if (counts[el] > maxCount) {
            maxCount = counts[el];
            dominantElements = [el];
        } else if (counts[el] === maxCount) {
            dominantElements.push(el);
        }
    }
    
    const domScore = 30 / dominantElements.length;
    dominantElements.forEach(el => scores[el] += domScore);
    
    let sorted = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    let primary = sorted[0];
    let secondary = sorted[1];
    
    let zeroElements = Object.keys(counts).filter(el => counts[el] === 0);
    
    let bodyText = "";
    if (primary === secondary || scores[secondary] < 20) {
        bodyText = `사주 내 <strong>${primary}(${ELEMENT_HAN[primary]})</strong>의 기운이 가장 강력하게 작용하여, ${BODY_DICTIONARY[primary].desc}을 지니고 있습니다.`;
    } else {
        bodyText = `사주 내 <strong>${primary}(${ELEMENT_HAN[primary]})</strong>와 <strong>${secondary}(${ELEMENT_HAN[secondary]})</strong>의 기운이 교차하며 복합적인 체형을 이룹니다. 기본적으로 <strong>${BODY_DICTIONARY[dayElement].bone}</strong>을 바탕으로, <strong>${BODY_DICTIONARY[primary === dayElement ? secondary : primary].flesh}</strong>이 더해진 매력적인 밸런스를 가집니다.`;
    }
    
    let domElement = dominantElements[0];
    bodyText += `<br>또한 살결은 사주 내 지배적인 다자 오행인 <strong>${domElement}(${ELEMENT_HAN[domElement]})</strong>의 영향을 받아, <strong>${BODY_DICTIONARY[domElement].skin}</strong>`;
    
    if (zeroElements.length > 0) {
        bodyText += `<br><br><span style="font-size:0.85em; color:#888;">*참고: 사주 내 <strong>${zeroElements.join(', ')}</strong> 기운이 부족하여, 해당 오행이 관장하는 신체 부위가 상대적으로 왜소하거나 약할 수 있는 특징이 있습니다.</span>`;
    }
    
    return bodyText;
}

function calculateVibe(palja, dominantSinsal, sajuResult) {
    let vibeText = "";
    
    const tenGodCounts = {"비겁":0, "식상":0, "재성":0, "관성":0, "인성":0};
    const dm = ELEMENTS_KR[palja.dS];
    
    const stems = [palja.yS, palja.mS, palja.hS];
    const branches = [palja.yB, palja.mB, palja.dB, palja.hB];
    
    stems.forEach(char => { tenGodCounts[getTenGod(dm, ELEMENTS_KR[char])]++; });
    branches.forEach(char => { tenGodCounts[getTenGod(dm, ELEMENTS_KR[char])]++; });
    
    let hasSiksang = tenGodCounts["식상"] >= 3;
    let hasInseong = tenGodCounts["인성"] >= 3;
    
    if (hasSiksang && hasInseong) {
        vibeText += "화려하면서도 내면의 깊이가 느껴지는 독특하고 세련된 아우라를 풍깁니다. ";
    } else if (hasSiksang) {
        vibeText += "표현력이 뛰어나고 시선을 사로잡는 세련되고 화려한 분위기를 자아냅니다. ";
    } else if (hasInseong) {
        vibeText += "차분하고 지적인 느낌을 주며, 단아하고 정적인 클래식한 무드가 돋보입니다. ";
    } else if (tenGodCounts["관성"] >= 3) {
        vibeText += "반듯하고 신뢰감을 주는 절제된 매력과 고급스러운 아우라를 지녔습니다. ";
    } else if (tenGodCounts["재성"] >= 3) {
        vibeText += "현실감각이 뛰어나며 사람을 편안하게 이끄는 부드럽고 여유로운 분위기를 풍깁니다. ";
    } else if (tenGodCounts["비겁"] >= 3) {
        vibeText += "주관이 뚜렷하고 당당하며, 사람을 끌어당기는 독립적이고 강렬한 에너지를 발산합니다. ";
    } else {
        vibeText += "다양한 기운이 조화롭게 섞여 튀지 않으면서도 안정감 있고 부드러운 매력을 줍니다. ";
    }
    
    if (dominantSinsal.includes("도화살") && dominantSinsal.includes("홍염살")) {
        vibeText += "<br><br>특히 <strong>도화살</strong>과 <strong>홍염살</strong>을 모두 갖추어, 스치기만 해도 사람의 시선을 끄는 강력한 매력 포인트(예: 깊은 눈매, 매혹적인 미소)가 외모에 묻어납니다.";
    } else if (dominantSinsal.includes("도화살")) {
        vibeText += "<br><br>또한 <strong>도화살</strong>의 영향으로, 가만히 있어도 타인의 이목을 집중시키는 특유의 매력과 스타성이 외모에 묻어납니다.";
    } else if (dominantSinsal.includes("홍염살")) {
        vibeText += "<br><br>또한 <strong>홍염살</strong>의 영향으로, 웃을 때 유독 매력적이거나 특정 표정에서 짙은 호소력을 지닌 사랑스러운 분위기가 돋보입니다.";
    } else if (dominantSinsal.includes("화개살")) {
        vibeText += "<br><br>또한 <strong>화개살</strong>의 영향으로, 화려함을 좇기보다 내면의 고독함이 묻어나는 깊고 신비로운 분위기가 외모에 배어 있습니다.";
    }
    
    return vibeText;
}

function generateAnalysis(sajuResult, pronoun = "당신") {
    const bodyText = calculateBodyType(sajuResult.palja, sajuResult.counts);
    const vibeText = calculateVibe(sajuResult.palja, sajuResult.dominantSinsal, sajuResult);
    
    const elData = ELEMENT_TRAITS[sajuResult.primaryElement];
    const tenGodData = TENGODS_DATA[sajuResult.dominantTenGod];
    const faceText = `얼굴은 ${elData.face} 또한 십성 '${sajuResult.dominantTenGod}'의 영향으로 ${tenGodData.desc}`;
    
    return {
        body: bodyText,
        face: faceText,
        vibe: vibeText
    };
}

function generatePartnerAnalysis(element, sinsal, tengod, pronoun = "당신") {
    const elData = BODY_DICTIONARY[element];
    const elFaceData = ELEMENT_TRAITS[element];
    const tenGodData = TENGODS_DATA[tengod];
    const sinsalData = SINSAL_DATA[sinsal];

    const bodyText = `${pronoun}의 체형은 기본적으로 ${elData.desc}을 지니고 있습니다. <br>또한 지배적인 기운인 <strong>${element}(${ELEMENT_HAN[element]})</strong>의 영향으로 <strong>${elData.skin}</strong>`;
    const faceText = `얼굴은 ${elFaceData.face} 그리고 십성 '${tengod}'의 영향으로 ${tenGodData.desc}`;
    const vibeText = `신살 '${sinsal}'이 더해져, ${sinsalData.desc}`;

    return {
        body: bodyText,
        face: faceText,
        vibe: vibeText
    };
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
    const analysis = generateAnalysis(sajuResult);
    const partnerData = findIdealPartner(sajuResult);

    const gPrefix = gender === 'male' ? 'm' : 'f';
    const pPrefix = gender === 'male' ? 'f' : 'm'; 
    const gKr = gender === 'male' ? '남성' : '여성';
    const pKr = gender === 'male' ? '여성' : '남성';

    let mainVibe = sajuResult.vibeGroup || "noble";
    if (sajuResult.dominantTenGod === "식상" || sajuResult.dominantTenGod === "재성") {
        mainVibe = "charm";
    }
    
    let partnerVibe = partnerData.vibeGroup || "noble";
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
            `${mainFolder}/face1.png`,
            `${mainFolder}/face1.jpg`,
            `${mainFolder}/face.png`,
            `${mainFolder}/face.jpg`,
            `assets/${gPrefix}_face_${sajuResult.dominantTenGod}.jpg`
          ], 
          filter: fallbackFilters[sajuResult.dominantTenGod] 
        },
        { el: 'partner', 
          urls: [
            `${partnerFolder}/face1.png`,
            `${partnerFolder}/face1.jpg`,
            `${partnerFolder}/face.png`,
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

    document.getElementById('combined-analysis').innerHTML = `
        <div style="margin-bottom: 1.2rem; line-height: 1.6;">
            <strong style="color:var(--primary); font-size:1.1rem; display:block; margin-bottom: 0.5rem;">[체형 특징]</strong>
            ${analysis.body}
        </div>
        <div style="margin-bottom: 1.2rem; line-height: 1.6;">
            <strong style="color:var(--primary); font-size:1.1rem; display:block; margin-bottom: 0.5rem;">[외모 및 이목구비]</strong>
            ${analysis.face}
        </div>
        <div style="line-height: 1.6;">
            <strong style="color:var(--primary); font-size:1.1rem; display:block; margin-bottom: 0.5rem;">[아우라 & 분위기]</strong>
            ${analysis.vibe}
        </div>
    `;

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
    const pAnalysis = generatePartnerAnalysis(partnerData.primaryElement, partnerData.dominantSinsal, partnerData.dominantTenGod, pronoun);
    document.getElementById('p-combined-analysis').innerHTML = `
        <div style="margin-bottom: 1.2rem; line-height: 1.6;">
            <strong style="color:var(--primary); font-size:1.1rem; display:block; margin-bottom: 0.5rem;">[체형 특징]</strong>
            ${pAnalysis.body}
        </div>
        <div style="margin-bottom: 1.2rem; line-height: 1.6;">
            <strong style="color:var(--primary); font-size:1.1rem; display:block; margin-bottom: 0.5rem;">[외모 및 이목구비]</strong>
            ${pAnalysis.face}
        </div>
        <div style="line-height: 1.6; margin-bottom: 1.2rem;">
            <strong style="color:var(--primary); font-size:1.1rem; display:block; margin-bottom: 0.5rem;">[아우라 & 분위기]</strong>
            ${pAnalysis.vibe}
        </div>
        <div style="padding: 1rem; background: rgba(255,107,107,0.1); border-radius: 8px;">
            <span style="color:var(--fire); font-weight:600;">💞 완벽한 보완재:</span> 이 사람은 당신의 일지와 조후를 완벽히 채워주는 운명적 이끌림을 선사합니다.
        </div>
    `;

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
    const otherContact = document.getElementById('reg-other-contact').value;
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
            otherContact: otherContact,
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
        document.getElementById('modal-other-contact').textContent = "아직 등록되지 않았습니다";
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
    
    document.getElementById('modal-instagram').textContent = match.instagram || '없음';
    document.getElementById('modal-other-contact').textContent = match.otherContact || '없음';
    document.getElementById('modal-email').textContent = match.email || '없음';
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
                infoHTML += `<div style="font-size: 0.8rem; color: #888;">${d.instagram || '인스타없음'} | ${d.otherContact || '기타연락처없음'} | ${d.email || ''}</div>`;
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
        document.getElementById('edit-other-contact').value = data.otherContact || '';
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
        updateData.otherContact = document.getElementById('edit-other-contact').value;
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
