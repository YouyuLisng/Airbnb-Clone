import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        globals: true,
        exclude: ['node_modules', '.next', 'e2e'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'text-summary', 'json-summary', 'html'],
            // Only measure code that unit tests actually target (API
            // route handlers and libs) -- components, pages, and
            // generated Prisma output would otherwise dilute the number
            // with code this suite was never meant to exercise (that's
            // what the Playwright E2E suite is for).
            include: ['app/api/**/*.ts', 'app/libs/**/*.ts'],
            exclude: ['**/*.test.ts', '**/*.test.tsx', 'app/libs/prismadb.ts'],
        },
    },
});
