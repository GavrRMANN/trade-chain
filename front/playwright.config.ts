import { defineConfig, devices } from '@playwright/test';

/**
 * Тесты идут против уже поднятого стека (см. docker-compose.test.yml и
 * scripts/run-e2e-tests.sh), поэтому здесь нет webServer — конфиг не
 * поднимает фронт/бэк сам, только знает, куда стучаться.
 */
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3002';

export default defineConfig({
    testDir: './e2e/tests',
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 1 : 0,
    reporter: [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['list'],
    ],
    outputDir: 'test-results',
    timeout: 30_000,
    expect: {
        timeout: 7_000,
    },
    use: {
        baseURL,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 10_000,
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
