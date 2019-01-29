const jobs = require('./kue').jobs;
const crawler = require('./crawler');
const { CONCURRENCY } = require('./constants');

exports.create = (req, options) => {
  const job = jobs
    .create(options.jobTitle, { path: req.url })
    .priority('high')
    .attempts(2)
    .ttl(10000)
    .removeOnComplete(true)
    .save(error => {
      if (error) {
        console.error('Error saving job ---', error);
      }
    });

  return job;
};

exports.process = config => {
  jobs.process(config.jobTitle, CONCURRENCY, async ({ data }, done) => {
    const result = await crawler
      .crawl({
        path: data.path,
        siteUrl: config.siteUrl
      })
      .then(content => content)
      .catch(error => {
        console.error('Error on crawler (sending html): ---', error);
        return error;
      });

    if (result instanceof Error) {
      done(new Error());
    } else {
      done(null, result);
    }
  });
};

exports.handleResults = (job, res, renderHTML) => {
  job.on('complete', result => res.send(result));
  job.on('error', () => res.sendFile(renderHTML));
};
