import { expect, test } from './test-config';

/**
 * Better Dagupan republishes government information but is not a government
 * site. The disclaimer is the thing that keeps that honest, so it is checked
 * on the pages a visitor is most likely to land on.
 */
const routes = ['/', '/services', '/government/departments', '/transparency'];

test.describe('Independent-project disclaimer', () => {
  for (const path of routes) {
    test(`the footer disclaims official status on ${path}`, async ({
      page,
    }) => {
      await page.goto(path);

      const footer = page.locator('footer');
      await expect(footer).toContainText(
        /Better Dagupan is an independent, community-led project/i
      );
      await expect(footer).toContainText(
        /not the official website of the City Government of Dagupan/i
      );
    });
  }

  test('the homepage carries a visible notice above the footer', async ({
    page,
  }) => {
    await page.goto('/');

    const notice = page.getByRole('complementary', {
      name: /independent community project/i,
    });

    await expect(notice).toBeVisible();
    await expect(notice).toContainText(/not affiliated with or endorsed/i);
    await expect(
      notice.getByRole('link', { name: /official/i })
    ).toHaveAttribute('href', 'https://www.dagupan.gov.ph');
  });

  test('the disclaimer is translated, not left in English', async ({
    page,
  }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('i18nextLng', 'fil'));
    await page.reload();

    await expect(page.locator('footer')).toContainText(
      /malaya at pinamumunuan ng komunidad/i
    );
    await expect(page.locator('footer')).toContainText(
      /Hindi ito ang opisyal na website/i
    );
  });
});
