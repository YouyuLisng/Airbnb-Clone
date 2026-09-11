// Pure data, no side effects -- safe for any spec file to import.
// The actual seeding logic lives in seed.ts, which is only ever run
// directly (`node e2e/seed.ts`), never imported.
export const E2E_TEST_USER = {
    email: 'e2e-test-user@example.com',
    password: 'e2e-test-password1',
    name: 'E2E Test User',
};

export const E2E_GEAR = [
    {
        title: 'E2E 測試帳篷',
        description: '用於 E2E 測試的帳篷資料。',
        imageSrc: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
        category: '帳篷',
        condition: '良好',
        locationValue: 'TPE',
        depositAmount: 1000,
        pricePerDay: 200,
    },
    {
        title: 'E2E 測試睡袋',
        description: '用於 E2E 測試的睡袋資料。',
        imageSrc: 'https://images.unsplash.com/photo-1571687949921-1306bfb24b72?w=800',
        category: '睡袋',
        condition: '良好',
        locationValue: 'NTP',
        depositAmount: 500,
        pricePerDay: 100,
    },
];
