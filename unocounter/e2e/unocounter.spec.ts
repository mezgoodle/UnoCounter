import { test, expect } from "@playwright/test";

test.describe("Uno Counter E2E Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to ensure a clean state
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("should complete a full game lifecycle", async ({ page }) => {
    // 1. Home Page & Empty State
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("UNO Score Tracker");
    await expect(page.locator("text=No games yet")).toBeVisible();

    // 2. Game Creation
    const startBtn = page.getByRole("button", { name: "Create Your First Game" });
    await startBtn.click();

    // Fill in player names
    await page.getByPlaceholder("Player 1").fill("Alice");
    await page.getByPlaceholder("Player 2").fill("Bob");

    // Add a third player
    await page.getByRole("button", { name: "+ Add Player" }).click();
    await page.getByPlaceholder("Player 3").fill("Charlie");

    // Submit form to create game
    await page.getByRole("button", { name: "Start Game" }).click();

    // Verify redirection to game details page
    await expect(page).toHaveURL(/\/games\/.+/);
    await expect(page.locator("h1")).toContainText("UNO Game #");

    // Verify player scores table shows Alice, Bob, Charlie
    await expect(page.locator("text=Alice")).toBeVisible();
    await expect(page.locator("text=Bob")).toBeVisible();
    await expect(page.locator("text=Charlie")).toBeVisible();

    // 3. Gameplay: Add Round 1 Scores
    await page.getByRole("button", { name: "Add Round Scores" }).click();

    // Input score manually for Alice
    const aliceInput = page.locator("div").filter({ hasText: /^Alice/ }).locator("input[type='number']");
    await aliceInput.fill("20");

    // Input score using calculator for Bob (10 + 15 = 25)
    await page.locator("div").filter({ hasText: /^Bob/ }).getByRole("button", { name: "🧮" }).click();
    await page.getByRole("button", { name: "1", exact: true }).click();
    await page.getByRole("button", { name: "0", exact: true }).click();
    await page.getByRole("button", { name: "+", exact: true }).click();
    await page.getByRole("button", { name: "1", exact: true }).click();
    await page.getByRole("button", { name: "5", exact: true }).click();
    await page.getByRole("button", { name: "Apply", exact: true }).click();

    // Charlie remains 0 (default)

    // Submit round
    await page.getByRole("button", { name: "Submit Round" }).click();

    // Verify cumulative scores: Alice 20, Bob 25, Charlie 0
    const aliceTotal = page.locator("div").filter({ hasText: /^Alice/ }).locator("span.text-xl");
    const bobTotal = page.locator("div").filter({ hasText: /^Bob/ }).locator("span.text-xl");
    const charlieTotal = page.locator("div").filter({ hasText: /^Charlie/ }).locator("span.text-xl");

    await expect(aliceTotal).toHaveText("20");
    await expect(bobTotal).toHaveText("25");
    await expect(charlieTotal).toHaveText("0");

    // Verify Charlie has the winner trophy 🏆 because they have the lowest score
    await expect(page.locator("div").filter({ hasText: /^Charlie/ }).locator("text=🏆")).toBeVisible();

    // 4. Mid-game modifications: Add Dave mid-game
    await page.getByRole("button", { name: "Add Player", exact: true }).click();
    await page.getByPlaceholder("Enter player name").fill("Dave");

    // Fill starting score with 10
    const startingScoreInput = page.locator("div").filter({ hasText: "Starting Score" }).locator("input[type='number']");
    await startingScoreInput.fill("10");

    await page.getByRole("button", { name: "Add Player", exact: true }).click();

    // Verify Dave is added with score 10
    const daveTotal = page.locator("div").filter({ hasText: /^Dave/ }).locator("span.text-xl");
    await expect(daveTotal).toHaveText("10");

    // 5. Undo last round
    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Undo the most recent round");
      await dialog.accept();
    });
    await page.getByRole("button", { name: "Undo Last Round" }).click();

    // After undoing, Bob's calculator score and Alice's score revert to 0. Dave remains at 10.
    await expect(aliceTotal).toHaveText("0");
    await expect(bobTotal).toHaveText("0");
    await expect(charlieTotal).toHaveText("0");
    await expect(daveTotal).toHaveText("10");

    // 6. End Game
    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Are you sure you want to end this game");
      await dialog.accept();
    });
    await page.getByRole("button", { name: "End Game" }).click();

    // Verify status changes to Finished
    await expect(page.locator("text=Finished")).toBeVisible();

    // 7. Return to Home and delete
    await page.getByRole("link", { name: "← Back to Games" }).click();
    await expect(page.locator("h2")).toContainText("Finished Games (1)");

    // Delete the game
    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Are you sure you want to delete this game");
      await dialog.accept();
    });
    await page.getByRole("button", { name: "Delete" }).click();

    // Verify empty state is restored
    await expect(page.locator("text=No games yet")).toBeVisible();
  });

  test("should end the game automatically when score limit is reached", async ({ page }) => {
    await page.goto("/");

    // Create new game
    await page.getByRole("button", { name: "Create Your First Game" }).click();
    await page.getByPlaceholder("Player 1").fill("Alice");
    await page.getByPlaceholder("Player 2").fill("Bob");

    // Check "Set maximum score limit"
    await page.locator("#set-limit").check();

    // Fill max score with 50
    await page.locator("#max-score").fill("50");

    await page.getByRole("button", { name: "Start Game" }).click();

    await expect(page).toHaveURL(/\/games\/.+/);
    await expect(page.locator("text=50 pts")).toBeVisible();

    // Submit a round where Alice gets 60 points
    await page.getByRole("button", { name: "Add Round Scores" }).click();
    const aliceInput = page.locator("div").filter({ hasText: /^Alice/ }).locator("input[type='number']");
    await aliceInput.fill("60");
    await page.getByRole("button", { name: "Submit Round" }).click();

    // Verify game status is automatically Finished because Alice reached the limit
    await expect(page.locator("text=Finished")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Round Scores" })).not.toBeVisible();
  });
});
