import { test, expect } from "../playwright-fixture";
import { installFakeBackend, makeCourse, makeTask } from "./support/fakeBackend";

// What someone sees the first time they sign in, before they've added anything.

test.describe("a brand-new account on Today", () => {
  test("gets the getting-started steps, not 'You're all caught up'", async ({ context, page }) => {
    await installFakeBackend(context, {});
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Welcome to Carrel" })).toBeVisible();
    await expect(page.getByText("You're all caught up")).toHaveCount(0);
    // Stats about zero tasks say nothing useful yet.
    await expect(page.getByText("Term Total")).toHaveCount(0);
  });

  test("'Add a course' opens the course form right there", async ({ context, page }) => {
    await installFakeBackend(context, {});
    await page.goto("/");
    await page.getByRole("button", { name: "Add a course" }).click();
    await expect(page.getByRole("dialog")).toContainText("Course Name");
    await expect(page).toHaveURL(/\/$/);
  });

  test("with a course added, step 1 is done and step 2 links to the courses", async ({ context, page }) => {
    await installFakeBackend(context, { courses: [makeCourse()] });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Add a course" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Open a course" })).toHaveAttribute("href", "/courses");
  });

  test("'Add an assignment' opens the assignment form", async ({ context, page }) => {
    await installFakeBackend(context, {});
    await page.goto("/");
    await page.getByRole("button", { name: "Add an assignment" }).click();
    await expect(page.getByRole("dialog")).toContainText("Add Assignment");
  });

  test("is shown first on a phone", async ({ context, page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await installFakeBackend(context, {});
    await page.goto("/");
    const welcome = page.getByRole("heading", { name: "Welcome to Carrel" });
    const exams = page.getByText("Exams & Quizzes", { exact: false }).first();
    await expect(welcome).toBeVisible();
    const [w, e] = await Promise.all([welcome.boundingBox(), exams.boundingBox()]);
    expect(w!.y).toBeLessThan(e!.y);
  });
});

test("once there are assignments, a day with nothing due says so", async ({ context, page }) => {
  const nextWeek = new Date(Date.now() + 7 * 864e5).toISOString();
  await installFakeBackend(context, { courses: [makeCourse()], tasks: [makeTask({ due_at: nextWeek })] });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Nothing due today" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Welcome to Carrel" })).toHaveCount(0);
  await expect(page.getByText("nothing due", { exact: true })).toBeVisible();
});

test("a day whose work is all done is 'all caught up'", async ({ context, page }) => {
  await installFakeBackend(context, {
    courses: [makeCourse()],
    tasks: [makeTask({ status: "done", completed_at: new Date().toISOString() })],
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "You're all caught up" })).toBeVisible();
});

for (const path of ["/", "/planner"]) {
  test(`the week strip fits a phone without scrolling sideways (${path})`, async ({ context, page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await installFakeBackend(context, { courses: [makeCourse()], tasks: [makeTask()] });
    await page.goto(path);
    await expect(page.getByRole("button", { name: "Next week" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
    const next = await page.getByRole("button", { name: "Next week" }).boundingBox();
    expect(next!.x + next!.width).toBeLessThanOrEqual(375);
  });
}

test.describe("Profile", () => {
  test("shows the username you sign in with, not an internal email address", async ({ context, page }) => {
    await installFakeBackend(context, {});
    await page.goto("/profile");
    await expect(page.getByText("Username", { exact: true })).toBeVisible();
    await expect(page.locator('input[value="me"]')).toBeVisible();
    await expect(page.locator('input[value="me@accounts.local"]')).toHaveCount(0);
  });

  test("a timezone outside the short list is still shown", async ({ context, page }) => {
    await installFakeBackend(context, { timezone: "America/Indiana/Indianapolis" });
    await page.goto("/profile");
    await expect(page.getByRole("combobox").filter({ hasText: "Indianapolis" })).toBeVisible();
  });
});
