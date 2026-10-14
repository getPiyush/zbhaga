import { setDefaultTimeout } from '@cucumber/cucumber';
import { Browser, Page } from '@playwright/test';

// Set timeout to 120 seconds for all steps (Playwright steps can take longer, group creation can be slow)
setDefaultTimeout(120000);

export interface TestContext {
  browser?: Browser;
  pages: Map<string, Page>;
  apiUrl: string;
  appUrl: string;
  users: Map<string, any>;
  groupId?: string;
  groupInviteCode?: string;
}
