const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Create screenshots dir
const screenshotsDir = path.join(__dirname, 'ea-test-screenshots');
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function takeScreenshot(page, name) {
  const filePath = path.join(screenshotsDir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`📸 Screenshot saved: ${name}.png`);
  return filePath;
}

async function main() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });

  // Use a persistent context to preserve auth session
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  // Capture console errors
  const consoleErrors = [];
  // Capture network requests
  const networkRequests = [];

  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('response', response => {
    const url = response.url();
    const method = response.request().method();
    networkRequests.push({ method, url, status: response.status() });
  });

  try {
    // STEP 1: Navigate to app
    console.log('\n=== STEP 1: Navigate to http://localhost:5173 ===');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });

    // STEP 2: Wait 6 seconds
    console.log('Waiting 6 seconds for React to hydrate...');
    await sleep(6000);

    // STEP 3: Screenshot
    await takeScreenshot(page, '01-initial-load');
    const pageTitle = await page.title();
    const pageUrl = page.url();
    console.log(`Page URL: ${pageUrl}`);
    console.log(`Page Title: ${pageTitle}`);

    // Check if login page
    const isLoginPage = pageUrl.includes('/login') || pageUrl.includes('/auth') ||
                        await page.$('input[type="password"]').then(el => !!el).catch(() => false);

    if (isLoginPage) {
      console.log('❌ LOGIN PAGE DETECTED — user is not logged in. Stopping.');
      await takeScreenshot(page, '01b-login-page');
      await browser.close();
      return;
    }

    console.log('✅ Dashboard detected — user is logged in');

    // STEP 4: Navigate to /accounts
    console.log('\n=== STEP 4: Navigate to /accounts ===');
    await page.goto('http://localhost:5173/accounts', { waitUntil: 'domcontentloaded' });

    // STEP 5: Wait 4 seconds, screenshot accounts list
    await sleep(4000);
    await takeScreenshot(page, '02-accounts-list');
    console.log('Accounts page URL:', page.url());

    // Get first account info
    const accountCards = await page.$$('[data-testid="account-card"], .account-card, [class*="AccountCard"]');
    console.log(`Found ${accountCards.length} account cards via data-testid`);

    // Try to find clickable account items
    let firstAccount = null;

    // Try various selectors for the account list
    const selectors = [
      'a[href*="/accounts/"]',
      'button[class*="account"]',
      '[class*="AccountCard"]',
      '[class*="account-card"]',
      '.cursor-pointer',
      'div[class*="card"][class*="cursor"]',
    ];

    for (const sel of selectors) {
      const els = await page.$$(sel);
      if (els.length > 0) {
        console.log(`Found ${els.length} elements with selector: ${sel}`);
        firstAccount = els[0];
        break;
      }
    }

    // Fallback: find any link containing /accounts/
    if (!firstAccount) {
      const links = await page.$$('a[href*="/accounts/"]');
      if (links.length > 0) {
        firstAccount = links[0];
        const href = await firstAccount.getAttribute('href');
        console.log(`Found account link: ${href}`);
      }
    }

    // STEP 6: Click first account
    console.log('\n=== STEP 6: Click on first account ===');
    if (firstAccount) {
      await firstAccount.click();
    } else {
      // Try clicking anything that looks like an account row
      console.log('Trying to find account by text or role...');
      // Look for table rows or list items
      const rows = await page.$$('tr, li, [role="row"]');
      console.log(`Found ${rows.length} rows/list items`);
      if (rows.length > 1) {
        await rows[1].click(); // skip header
      } else if (rows.length > 0) {
        await rows[0].click();
      } else {
        // Last resort: click the first visible clickable thing
        await page.click('main a, main button, main [class*="card"]');
      }
    }

    // STEP 7: Wait 3 seconds, screenshot
    await sleep(3000);
    await takeScreenshot(page, '03-account-detail');
    console.log('Account detail URL:', page.url());

    // STEP 8: Look for and click "EA Sync" tab
    console.log('\n=== STEP 8: Click EA Sync tab ===');

    // Try various selectors for EA Sync tab
    const eaTabSelectors = [
      'button:has-text("EA Sync")',
      '[role="tab"]:has-text("EA Sync")',
      'a:has-text("EA Sync")',
      'button:has-text("EA")',
      '[data-value="ea"]',
      '[data-value="ea-sync"]',
    ];

    let eaTabClicked = false;
    for (const sel of eaTabSelectors) {
      const tab = await page.$(sel);
      if (tab) {
        console.log(`Found EA tab with: ${sel}`);
        await tab.click();
        eaTabClicked = true;
        break;
      }
    }

    if (!eaTabClicked) {
      // Try text-based search
      const allTabs = await page.$$('[role="tab"], button');
      for (const tab of allTabs) {
        const text = await tab.textContent();
        if (text && (text.includes('EA') || text.includes('Sync'))) {
          console.log(`Found EA tab by text: "${text.trim()}"`);
          await tab.click();
          eaTabClicked = true;
          break;
        }
      }
    }

    if (!eaTabClicked) {
      console.log('❌ Could not find EA Sync tab. Taking screenshot of available tabs...');
      const tabs = await page.$$('[role="tab"], button');
      for (const tab of tabs) {
        const text = await tab.textContent();
        console.log(`  Tab: "${text?.trim()}"`);
      }
    }

    // STEP 9: Wait 3 seconds, screenshot EA tab
    await sleep(3000);
    await takeScreenshot(page, '04-ea-sync-tab');

    // STEP 10: Determine state
    console.log('\n=== STEP 10: Determine EA key state ===');

    const generateKeyBtn = await page.$('button:has-text("Generate API Key"), button:has-text("Generate Key")');
    const revokeKeyBtn = await page.$('button:has-text("Revoke Key"), button:has-text("Revoke")');
    const regenerateKeyBtn = await page.$('button:has-text("Regenerate Key"), button:has-text("Regenerate")');
    const copyKeyBtn = await page.$('button:has-text("Copy Key"), button:has-text("Copy")');

    // Check for account ID row
    const accountIdRow = await page.$('text=Account ID');
    console.log(`Account ID row visible: ${!!accountIdRow}`);

    let currentState = 0;

    if (revokeKeyBtn && regenerateKeyBtn) {
      currentState = 3;
      console.log('STATE 3 detected: Masked key with Revoke + Regenerate buttons');
    } else if (copyKeyBtn && !revokeKeyBtn) {
      currentState = 2;
      console.log('STATE 2 detected: Key just generated, Copy button visible');
    } else if (generateKeyBtn) {
      currentState = 1;
      console.log('STATE 1 detected: No key, Generate API Key button visible');
    } else {
      console.log('STATE UNKNOWN — taking screenshot of current content');
      // Log all visible buttons
      const allBtns = await page.$$('button');
      for (const btn of allBtns) {
        const text = await btn.textContent();
        console.log(`  Button: "${text?.trim()}"`);
      }
    }

    // ===== HANDLE STATE 1: Generate key first, then revoke =====
    if (currentState === 1) {
      console.log('\n=== STATE 1: Generating API key first ===');

      // 12a: Click Generate API Key
      await generateKeyBtn.click();

      // 12b: Wait 3 seconds
      await sleep(3000);

      // 12c: Screenshot — key should appear
      await takeScreenshot(page, '05-key-generated-state2');

      // Check for copy button
      const copyBtn = await page.$('button:has-text("Copy Key"), button:has-text("Copy")');
      if (copyBtn) {
        console.log('STATE 2 confirmed: Copy Key button visible');

        // 12d: Click Copy Key
        await copyBtn.click();
        console.log('Clicked Copy Key button');
        await sleep(500);

        // 12e: Check "I have copied" checkbox
        const checkbox = await page.$('input[type="checkbox"], [role="checkbox"]');
        if (checkbox) {
          await checkbox.click();
          console.log('Checked "I have copied" checkbox');
          await sleep(500);
        } else {
          console.log('No checkbox found, looking for alternatives...');
          const checkboxLabels = await page.$$('label');
          for (const label of checkboxLabels) {
            const text = await label.textContent();
            if (text && text.includes('copied')) {
              await label.click();
              console.log(`Clicked label: "${text.trim()}"`);
              break;
            }
          }
        }

        // 12f: Click "I've copied my key" button
        const ivecopiedBtn = await page.$('button:has-text("copied"), button:has-text("Done"), button:has-text("Confirm")');
        if (ivecopiedBtn) {
          const btnText = await ivecopiedBtn.textContent();
          console.log(`Clicking button: "${btnText?.trim()}"`);
          await ivecopiedBtn.click();
        } else {
          // Find button with "copied" text
          const allBtns = await page.$$('button');
          for (const btn of allBtns) {
            const text = await btn.textContent();
            if (text && (text.toLowerCase().includes('copied') || text.toLowerCase().includes('done') || text.toLowerCase().includes("i've"))) {
              console.log(`Found button: "${text.trim()}"`);
              await btn.click();
              break;
            }
          }
        }

        // 12g: Wait 2 seconds
        await sleep(2000);

        // 12h: Screenshot — should show STATE 3
        await takeScreenshot(page, '06-after-copy-confirmation-state3');

        // Verify STATE 3
        const revokeBtn3 = await page.$('button:has-text("Revoke Key"), button:has-text("Revoke")');
        const regenerateBtn3 = await page.$('button:has-text("Regenerate Key"), button:has-text("Regenerate")');
        if (revokeBtn3 && regenerateBtn3) {
          console.log('✅ STATE 3 confirmed: Revoke and Regenerate buttons visible');
          currentState = 3;
        } else {
          console.log('STATE after copy confirmation:');
          const btns = await page.$$('button');
          for (const btn of btns) {
            const t = await btn.textContent();
            console.log(`  Button: "${t?.trim()}"`);
          }
        }
      }
    }

    // ===== HANDLE STATE 3: Revoke =====
    if (currentState === 3) {
      console.log('\n=== STATE 3: Testing revoke flow ===');

      const revokeBtn = await page.$('button:has-text("Revoke Key"), button:has-text("Revoke")');

      // 11a: Screenshot before clicking
      await takeScreenshot(page, '07-before-revoke');

      if (revokeBtn) {
        // 11b: Click Revoke Key
        console.log('Clicking Revoke Key button...');
        await revokeBtn.click();

        // 11c: Wait 2 seconds for dialog
        await sleep(2000);

        // 11d: Screenshot of dialog
        await takeScreenshot(page, '08-revoke-dialog');

        // Check dialog appeared
        const dialog = await page.$('[role="dialog"], [data-radix-dialog-content], .dialog, [class*="Dialog"]');
        const dialogVisible = !!dialog;
        console.log(`Confirmation dialog appeared: ${dialogVisible}`);

        if (dialogVisible) {
          const dialogText = await dialog.textContent();
          console.log(`Dialog content: "${dialogText?.substring(0, 200)}"`);
        } else {
          // Look for alert/modal
          const allText = await page.textContent('body');
          if (allText.includes('revoke') || allText.includes('Revoke') || allText.includes('confirm')) {
            console.log('Revoke confirmation text found in page');
          }
        }

        // 11e: Click "Revoke Key" in dialog to confirm
        const confirmRevokeSelectors = [
          '[role="dialog"] button:has-text("Revoke")',
          '[role="dialog"] button:has-text("Confirm")',
          '[role="dialog"] button:has-text("Yes")',
          '[role="alertdialog"] button:has-text("Revoke")',
          'button:has-text("Revoke Key")',
        ];

        let confirmClicked = false;
        for (const sel of confirmRevokeSelectors) {
          const btn = await page.$(sel);
          if (btn) {
            const text = await btn.textContent();
            console.log(`Clicking confirm button: "${text?.trim()}"`);
            await btn.click();
            confirmClicked = true;
            break;
          }
        }

        if (!confirmClicked) {
          // Find all buttons and click the dangerous/destructive one
          const allBtns = await page.$$('[role="dialog"] button, button');
          for (const btn of allBtns) {
            const text = await btn.textContent();
            if (text && text.toLowerCase().includes('revoke')) {
              console.log(`Clicking: "${text.trim()}"`);
              await btn.click();
              confirmClicked = true;
              break;
            }
          }
        }

        // 11f: Wait 3 seconds
        await sleep(3000);

        // 11g: Screenshot result
        await takeScreenshot(page, '09-after-revoke');

        // Check if back to STATE 1
        const generateBtnAfter = await page.$('button:has-text("Generate API Key"), button:has-text("Generate Key")');
        const revokeBtnAfter = await page.$('button:has-text("Revoke Key"), button:has-text("Revoke")');

        if (generateBtnAfter) {
          console.log('✅ REVOKE SUCCESS: Back to STATE 1 (Generate API Key button visible)');
        } else if (revokeBtnAfter) {
          console.log('❌ REVOKE FAILED: Revoke button still visible');
        } else {
          console.log('State after revoke is UNKNOWN');
          const btns = await page.$$('button');
          for (const btn of btns) {
            const t = await btn.textContent();
            console.log(`  Button: "${t?.trim()}"`);
          }
        }

        // 11h: Check network requests for DELETE
        console.log('\n=== Network Requests (DELETE /ea/key) ===');
        const deleteRequests = networkRequests.filter(r =>
          r.method === 'DELETE' && r.url.includes('ea')
        );

        if (deleteRequests.length > 0) {
          for (const req of deleteRequests) {
            console.log(`DELETE ${req.url} → HTTP ${req.status}`);
          }
        } else {
          console.log('No DELETE /ea/key requests found in captured network traffic');
          // Show all recent requests
          console.log('All network requests captured:');
          const recent = networkRequests.slice(-20);
          for (const req of recent) {
            console.log(`  ${req.method} ${req.url} → ${req.status}`);
          }
        }

      } else {
        console.log('❌ Revoke Key button not found!');
      }
    }

    // ===== HANDLE STATE 2: This shouldn't persist but handle it =====
    if (currentState === 2) {
      console.log('\n=== STATE 2: Key shown, need to copy and confirm first ===');
      await takeScreenshot(page, '05-state2-key-visible');
    }

    // STEP 13: Console errors
    console.log('\n=== STEP 13: Console Errors ===');
    if (consoleErrors.length === 0) {
      console.log('No console errors detected');
    } else {
      console.log(`${consoleErrors.length} console error(s):`);
      consoleErrors.forEach((err, i) => console.log(`  ${i+1}. ${err}`));
    }

    // Final summary
    console.log('\n========================================');
    console.log('FINAL REPORT SUMMARY');
    console.log('========================================');
    console.log(`Initial STATE: ${currentState}`);
    console.log(`Account ID row visible: ${!!accountIdRow}`);
    console.log(`Console errors: ${consoleErrors.length}`);

    const deleteReqs = networkRequests.filter(r => r.method === 'DELETE' && r.url.includes('ea'));
    if (deleteReqs.length > 0) {
      console.log(`DELETE request status: ${deleteReqs[0].status}`);
    } else {
      console.log('DELETE request status: Not captured');
    }

  } catch (err) {
    console.error('Test error:', err.message);
    await takeScreenshot(page, 'error-state').catch(() => {});
  } finally {
    console.log('\nTest complete. Closing browser in 3 seconds...');
    await sleep(3000);
    await browser.close();
  }
}

main().catch(console.error);
