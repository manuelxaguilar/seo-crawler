const jobs = require('./utils/jobs');
const cache = require('./utils/cache');
const crawler = require('./utils/crawler');

const seoCrawler = options => async (req, res) => {
  const { jobTitle, renderHTML, crawlerList } = options;
  const siteUrl =
    options.siteUrl ||
    process.env.SITE_URL || 
    req.headers && req.headers.host;
  const isCrawler = crawler.isCrawler({
    headers: req.headers,
    customCrawlers: crawlerList
  });

  if (!isCrawler) {
    const cachedContent = await cache.get(req, jobTitle);

    if (cachedContent.reply) {
      return res.send(cachedContent.reply);
    } else if (cachedContent.newKey) {
      cache.set(res, cachedContent.newKey);

      const newJob = jobs.create(req, options);
      jobs.process({
        jobTitle,
        siteUrl
      });
      jobs.handleResults(newJob, res, renderHTML);

      return;
    } else if (cachedContent.error) {
      console.error(cachedContent.error);
    }
  }

  return res.sendFile(renderHTML);
};

module.exports = seoCrawler;
