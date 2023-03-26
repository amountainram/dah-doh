import test, {expect} from '@playwright/test'

const url = 'http://localhost:4173/e2e'
const umd6 = `${url}/umd`
const umd5 = `${url}/es5`

test.describe('umd package tests', () => {
  test('[umd es6+]: should perform a PTR resolution using umd package', async ({page}) => {
    await page.goto(umd6)

    const addresses = await page.evaluate(() =>
      window.dahDoh.promises
        .resolvePtr('8.8.8.8.in-addr.arpa')
    )

    expect(addresses).toEqual(['dns.google'])
  })

  test('[umd es6+]: should perform a NS resolution using umd package', async ({page}) => {
    await page.goto(umd6)

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

  test('[umd es5]: should perform a PTR resolution using umd package', async ({page}) => {
    await page.goto(umd5)

    const addresses = await page.evaluate(() =>
      window.dahDoh.promises
        .resolvePtr('8.8.8.8.in-addr.arpa')
    )

    expect(addresses).toEqual(['dns.google'])
  })

  test('[umd es5]: should perform a NS resolution using umd package', async ({page}) => {
    await page.goto(umd5)

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
