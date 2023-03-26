import test, {expect} from '@playwright/test'

const url = 'http://localhost:4173/e2e'

test.describe('umd package tests', () => {
  test('should perform a PTR resolution using umd package', async ({page}) => {
    await page.goto(url)

    const addresses = await page.evaluate(() =>
      window.dahDoh.promises
        .resolvePtr('8.8.8.8.in-addr.arpa')
    )

    expect(addresses).toEqual(['dns.google'])
  })

  test('should perform a NS resolution using umd package', async ({page}) => {
    await page.goto(url)

    const addresses = await page.evaluate(() =>
      window.dahDoh.promises
        .resolveNs('google.com')
    )

    expect(addresses.sort()).toEqual([
      'ns1.google.com',
      'ns2.google.com',
      'ns3.google.com',
      'ns4.google.com',
    ])
  })
})
