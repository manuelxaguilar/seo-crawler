const puppeteer = require('puppeteer')
const BotInspector = require('bot-inspector')
const SITE_URL = process.env.SITE_URL || 'https://google.com/'
let browser
let page
;(async () => {
  browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--single-process'
    ]
  })
  page = await browser.newPage()
})()

exports.isCrawler = options => {
  const inspector = new BotInspector(options)
  const isCrawler = inspector.isCrawler()

  if (
    (typeof isCrawler === typeof true && isCrawler) ||
    !!Object.keys(isCrawler).length
  ) {
    return true
  }

  return false
}

exports.crawl = async config => {
  console.time(`Crawling time for ${config.path}`)

  let response

  try {
    await page.goto(
      `${config.siteUrl ? config.siteUrl : SITE_URL}${config.path}`,
      {
        timeout: 300000
      }
    )

    response = await page.content()
  } catch (error) {
    response = await Promise.reject(new Error(error))
  }

  console.timeEnd(`Crawling time for ${config.path}`)
  return response
}
