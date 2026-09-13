import { defineConfig, devices } from '@playwright/test';

const chromiumLaunchOptions = process.env.TAVREX_CHROMIUM_EXECUTABLE
  ? { executablePath: process.env.TAVREX_CHROMIUM_EXECUTABLE }
  : undefined;

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: process.env.TAVREX_VERIFY_URL || 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: chromiumLaunchOptions,
      },
    },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        defaultBrowserType: 'chromium',
        launchOptions: chromiumLaunchOptions,
      },
    },
  ],
  webServer: process.env.TAVREX_VERIFY_URL
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://127.0.0.1:5173',
        reuseExistingServer: !process.env.CI,
      },
});
