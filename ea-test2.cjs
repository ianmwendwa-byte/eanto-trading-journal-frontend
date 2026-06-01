const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const os = require("os");

const screenshotsDir = path.join(__dirname, "ea-test-screenshots");
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function shot(page, name) {
  const fp = path.join(screenshotsDir, name + ".png");
  await page.screenshot({ path: fp, fullPage: true });
  console.log("Screenshot:", name);
}

async function findBtn(page, texts) {
  for (const text of texts) {
    const btn = await page.$('button:has-text("' + text + '")');
    if (btn) return btn;
  }
  return null;
}

async function main() {
  let context;
  try {
    context = await chromium.launchPersistentContext(
      path.join(os.tmpdir(), "pw-ea-" + Date.now()),
      { channel: "msedge", headless: false, viewport: { width: 1440, height: 900 } }
    );
    console.log("Using Edge browser");
  } catch(e) {
    console.log("Edge not found:", e.message.substring(0,60));
    context = await chromium.launchPersistentContext(
      path.join(os.tmpdir(), "pw-ea-" + Date.now()),
      { headless: false, viewport: { width: 1440, height: 900 } }
    );
    console.log("Using Chromium browser");
  }

  const consoleErrors = [];
  const networkRequests = [];
  const page = await context.newPage();

  page.on("console", msg => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("response", r => {
    networkRequests.push({ method: r.request().method(), url: r.url(), status: r.status() });
  });

  try {
    console.log("\n=== STEP 1: Navigate to localhost:5173 ===");
    await page.goto("http://localhost:5173", { waitUntil: "domcontentloaded", timeout: 30000 });
    await sleep(6000);
    await shot(page, "01-initial");
    const url = page.url();
    console.log("URL:", url);

    if (url.includes("/login") || url.includes("/auth")) {
      console.log("LOGIN PAGE - session not active in this browser profile. Stopping.");
      await shot(page, "01b-login");
      await context.close();
      return;
    }

    console.log("User is logged in!");

    console.log("\n=== STEP 4: /accounts ===");
    await page.goto("http://localhost:5173/accounts", { waitUntil: "domcontentloaded" });
    await sleep(4000);
    await shot(page, "02-accounts");

    const bodyTxt = await page.textContent("body");
    console.log("Accounts page text (first 500):", bodyTxt.substring(0, 500));

    const accountLinks = await page.$$('a[href*="/accounts/"]');
    console.log("Account links:", accountLinks.length);
    for (const link of accountLinks.slice(0,3)) {
      const href = await link.getAttribute("href");
      const txt = await link.textContent();
      console.log(" link:", href, "|", txt.trim().substring(0,40));
    }

    console.log("\n=== STEP 6: Click first account ===");
    if (accountLinks.length > 0) {
      await accountLinks[0].click();
    } else {
      const cards = await page.$$('[class*="card"], [class*="Card"]');
      console.log("Card elements:", cards.length);
      if (cards.length > 0) await cards[0].click();
    }

    await sleep(3000);
    await shot(page, "03-account-detail");
    console.log("Detail URL:", page.url());

    console.log("\n=== STEP 8: EA Sync tab ===");
    const tabs = await page.$$('[role="tab"]');
    console.log("Tabs found:", tabs.length);
    for (const t of tabs) {
      const txt = await t.textContent();
      console.log(" tab:", txt.trim());
    }

    let eaClicked = false;
    for (const t of tabs) {
      const txt = await t.textContent();
      if (txt && txt.includes("EA")) {
        await t.click();
        eaClicked = true;
        console.log("Clicked EA tab:", txt.trim());
        break;
      }
    }

    if (!eaClicked) {
      const btns = await page.$$("button");
      for (const b of btns) {
        const txt = await b.textContent();
        if (txt && (txt.includes("EA") || txt.toLowerCase().includes("ea sync"))) {
          await b.click();
          eaClicked = true;
          console.log("Clicked EA button:", txt.trim());
          break;
        }
      }
    }

    await sleep(3000);
    await shot(page, "04-ea-tab");

    const eaBody = await page.textContent("body");
    console.log("EA tab content (first 800):", eaBody.substring(0, 800));

    const allBtnsEA = await page.$$("button");
    console.log("All buttons in EA tab:");
    for (const b of allBtnsEA) {
      const txt = await b.textContent();
      if (txt.trim()) console.log(" button:", txt.trim().substring(0, 60));
    }

    console.log("\n=== STEP 10: State detection ===");
    const genBtn = await findBtn(page, ["Generate API Key", "Generate Key"]);
    const revBtn = await findBtn(page, ["Revoke Key", "Revoke"]);
    const regenBtn = await findBtn(page, ["Regenerate Key", "Regenerate"]);
    const acctIdVisible = eaBody.includes("Account ID");

    console.log("Generate API Key button:", !!genBtn);
    console.log("Revoke Key button:", !!revBtn);
    console.log("Regenerate Key button:", !!regenBtn);
    console.log("Account ID visible:", acctIdVisible);

    let state = 0;
    if (revBtn && regenBtn) {
      state = 3;
      console.log("INITIAL STATE: 3 (active key - Revoke + Regenerate visible)");
    } else if (genBtn) {
      state = 1;
      console.log("INITIAL STATE: 1 (no key - Generate button visible)");
    } else {
      state = 2;
      console.log("INITIAL STATE: 2 (key just generated)");
    }

    if (state === 1) {
      console.log("\n=== STEP 12: Generate key first ===");
      await genBtn.click();
      await sleep(3000);
      await shot(page, "05-key-generated");

      const bodyAfterGen = await page.textContent("body");
      console.log("After generate (600):", bodyAfterGen.substring(0, 600));

      const copyBtn = await findBtn(page, ["Copy Key", "Copy"]);
      if (copyBtn) {
        const cbTxt = await copyBtn.textContent();
        console.log("Copy button found:", cbTxt.trim());
        await copyBtn.click();
        await sleep(400);

        const checkbox = await page.$('input[type="checkbox"]') || await page.$('[role="checkbox"]');
        if (checkbox) {
          await checkbox.click();
          console.log("Checked checkbox");
          await sleep(200);
        }

        const allBtns2 = await page.$$("button");
        for (const b of allBtns2) {
          const t = (await b.textContent()).toLowerCase();
          if (t.includes("copied") || t.includes("done") || t.includes("confirm") || t.includes("ive")) {
            const fullTxt = await b.textContent();
            await b.click();
            console.log("Clicked confirm button:", fullTxt.trim());
            break;
          }
        }

        await sleep(2000);
        await shot(page, "06-after-key-confirmed");

        const rev3 = await findBtn(page, ["Revoke Key", "Revoke"]);
        if (rev3) {
          state = 3;
          console.log("Transitioned to STATE 3");
        } else {
          console.log("Did not reach STATE 3 after key generation");
          const btnsNow = await page.$$("button");
          for (const b of btnsNow) {
            const t = await b.textContent();
            if (t.trim()) console.log(" button:", t.trim());
          }
        }
      }
    }

    if (state === 3) {
      console.log("\n=== STEP 11: Revoke test ===");
      const revBtnNow = await findBtn(page, ["Revoke Key", "Revoke"]);
      await shot(page, "07-before-revoke");

      if (revBtnNow) {
        const revTxt = await revBtnNow.textContent();
        console.log("Clicking Revoke button:", revTxt.trim());
        await revBtnNow.click();
        await sleep(2000);
        await shot(page, "08-revoke-dialog");

        const dialog = await page.$('[role="dialog"]') || await page.$('[role="alertdialog"]');
        console.log("Confirmation dialog appeared:", !!dialog);

        if (dialog) {
          const dlgTxt = await dialog.textContent();
          console.log("Dialog content:", dlgTxt.substring(0, 300));

          const dlgBtns = await dialog.$$("button");
          console.log("Dialog buttons:", dlgBtns.length);
          for (const b of dlgBtns) {
            const t = await b.textContent();
            console.log(" dialog button:", t.trim());
          }

          let confirmed = false;
          for (const b of dlgBtns) {
            const t = await b.textContent();
            if (t.toLowerCase().includes("revoke")) {
              await b.click();
              console.log("Confirmed revoke:", t.trim());
              confirmed = true;
              break;
            }
          }
          if (!confirmed) {
            for (const b of dlgBtns) {
              const t = await b.textContent();
              if (t.toLowerCase().includes("confirm") || t.toLowerCase().includes("yes") || t.toLowerCase().includes("delete")) {
                await b.click();
                console.log("Fallback confirm:", t.trim());
                confirmed = true;
                break;
              }
            }
          }
          if (!confirmed) console.log("Could not find confirm button in dialog");
        } else {
          const bodyDlg = await page.textContent("body");
          console.log("Page after click (no dialog):", bodyDlg.substring(0, 400));
        }

        await sleep(3000);
        await shot(page, "09-after-revoke");

        const genAfter = await findBtn(page, ["Generate API Key", "Generate Key"]);
        const revAfter = await findBtn(page, ["Revoke Key", "Revoke"]);
        console.log("After revoke - Generate button visible:", !!genAfter);
        console.log("After revoke - Revoke button still visible:", !!revAfter);

        if (genAfter) console.log("RESULT: Back to STATE 1 - revoke SUCCEEDED");
        else if (revAfter) console.log("RESULT: Revoke button still visible - revoke FAILED");
        else console.log("RESULT: State unknown after revoke");

        console.log("\n=== Network requests ===");
        const delReqs = networkRequests.filter(r => r.method === "DELETE");
        console.log("All DELETE requests:", delReqs.length);
        delReqs.forEach(r => console.log(" DELETE", r.url.substring(0,120), "->", r.status));

        const eaDelReqs = networkRequests.filter(r => r.method === "DELETE" && (r.url.includes("ea") || r.url.includes("key")));
        if (eaDelReqs.length > 0) {
          console.log("EA key DELETE requests:");
          eaDelReqs.forEach(r => console.log(" ", r.url, "->", r.status));
        }
      } else {
        console.log("Revoke button not found on page!");
      }
    }

    console.log("\n=== Console errors ===");
    console.log("Total errors:", consoleErrors.length);
    consoleErrors.forEach((e, i) => console.log((i+1) + ".", e));

    console.log("\n=== FINAL SUMMARY ===");
    console.log("Initial STATE:", state);
    console.log("Account ID visible:", acctIdVisible);
    console.log("Console errors:", consoleErrors.length);

  } catch(err) {
    console.error("Test failed:", err.message);
    await shot(page, "error").catch(() => {});
  } finally {
    await sleep(3000);
    await context.close();
  }
}

main().catch(console.error);
