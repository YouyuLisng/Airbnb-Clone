// Seeds sample gear listings for local development/demo purposes.
// Run with: npx prisma db seed  (configured via package.json's "prisma.seed")
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OWNER_EMAIL = 'a0979534311@gmail.com';

const SAMPLE_GEAR = [
    {
        title: 'MSR Hubba Hubba NX2 雙人帳篷',
        description: '輕量三季帳，含地布與營柱，適合兩人登山縱走或一般露營，收納後僅 1.7 公斤，非常適合背包客。',
        imageSrc: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
        category: '帳篷',
        condition: '良好',
        locationValue: 'TPE',
        depositAmount: 2000,
        pricePerDay: 350,
    },
    {
        title: 'Marmot 羽絨睡袋（-5°C）',
        description: '700 羽絨蓬鬆度，適合秋冬高山露營，經過清洗消毒，附收納壓縮袋。',
        imageSrc: 'https://images.unsplash.com/photo-1571687949921-1306bfb24b72?w=800',
        category: '睡袋',
        condition: '良好',
        locationValue: 'NTP',
        depositAmount: 1000,
        pricePerDay: 200,
    },
    {
        title: 'Osprey Atmos AG 65L 登山包',
        description: '65 公升大容量背負系統，適合多天縱走使用，背板可依身高微調，附防雨罩。',
        imageSrc: 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=800',
        category: '登山包',
        condition: '良好',
        locationValue: 'TXG',
        depositAmount: 1500,
        pricePerDay: 150,
    },
    {
        title: 'MSR PocketRocket 2 爐頭套組',
        description: '超輕量高山瓦斯爐，含鈦金屬鍋具一組，3 分鐘可煮沸 1 公升水，露營野炊必備。',
        imageSrc: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800',
        category: '爐具炊具',
        condition: '全新',
        locationValue: 'TAO',
        depositAmount: 800,
        pricePerDay: 100,
    },
    {
        title: 'Sony A7III 全片幅相機',
        description: '含 28-70mm 鏡頭、雙電池與 64G 記憶卡，適合旅遊縱走空拍剪影紀錄，出租前會校正對焦。',
        imageSrc: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',
        category: '攝影器材',
        condition: '良好',
        locationValue: 'TPE',
        depositAmount: 15000,
        pricePerDay: 800,
    },
    {
        title: '充氣式 SUP 立式划槳板',
        description: '10.6 呎全能型 SUP，含打氣筒、槳、腳繩與背包，適合初學者於平靜水域使用。',
        imageSrc: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800',
        category: '水上用具',
        condition: '良好',
        locationValue: 'KHH',
        depositAmount: 3000,
        pricePerDay: 500,
    },
    {
        title: 'Black Diamond 碳纖登山杖（一對）',
        description: '三節式可調整長度，快扣設計方便收納，適合長程健行減輕膝蓋負擔。',
        imageSrc: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=800',
        category: '登山健行',
        condition: '普通',
        locationValue: 'HUA',
        depositAmount: 500,
        pricePerDay: 80,
    },
    {
        title: 'Goal Zero 太陽能營燈',
        description: '可折疊太陽能充電營燈，亮度可調，內建行動電源功能，露營夜間照明首選。',
        imageSrc: 'https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=800',
        category: '露營燈具',
        condition: '全新',
        locationValue: 'NTP',
        depositAmount: 600,
        pricePerDay: 120,
    },
    {
        title: 'YETI 45QT 行動冰箱',
        description: '頂級保冷桶，可維持冷度長達 5 天，露營野餐、海邊烤肉都適用，含提把。',
        imageSrc: 'https://images.unsplash.com/photo-1526491109672-74740652b963?w=800',
        category: '保冷用品',
        condition: '良好',
        locationValue: 'TNN',
        depositAmount: 2000,
        pricePerDay: 250,
    },
    {
        title: '海釣竿組（附捲線器）',
        description: '兩件式海釣竿，含紡車式捲線器與基本擬餌組，適合防波堤與沙灘岸釣。',
        imageSrc: 'https://images.unsplash.com/photo-1445307806294-bff7f67ff225?w=800',
        category: '釣具',
        condition: '良好',
        locationValue: 'PIF',
        depositAmount: 1500,
        pricePerDay: 200,
    },
    {
        title: 'Burton 滑雪板全套裝備',
        description: '滑雪板、雪靴（US 9）與固定器一組，含攜行袋，適合中階滑雪者。',
        imageSrc: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
        category: '滑雪用具',
        condition: '普通',
        locationValue: 'TXG',
        depositAmount: 4000,
        pricePerDay: 600,
    },
    {
        title: 'Nikon 賞鳥雙筒望遠鏡',
        description: '10x42 規格，防水防霧鍍膜，適合賞鳥、觀星與戶外活動使用，附頸帶與收納袋。',
        imageSrc: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=800',
        category: '望遠鏡',
        condition: '全新',
        locationValue: 'ILA',
        depositAmount: 1200,
        pricePerDay: 150,
    },
];

async function main() {
    const owner = await prisma.user.findUnique({ where: { email: OWNER_EMAIL } });

    if (!owner) {
        throw new Error(
            `No user found with email ${OWNER_EMAIL}. Log into the app at least once first so this account exists, then re-run the seed.`
        );
    }

    for (const gear of SAMPLE_GEAR) {
        await prisma.gear.create({
            data: {
                ...gear,
                userId: owner.id,
            },
        });
    }

    console.log(`Seeded ${SAMPLE_GEAR.length} gear listings for ${owner.email}.`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
