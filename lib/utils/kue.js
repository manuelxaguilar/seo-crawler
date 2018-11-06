const kue = require('kue')
const { promisify } = require('util')

let jobs

// Initialize Kue
if (process.env.REDIS_URL) {
  jobs = kue.createQueue({
    redis: process.env.REDIS_URL
  })
} else {
  jobs = kue.createQueue()
}

// Make redis "get" method (via Kue) return a promise
// instead of using a cb
exports.getAsync = promisify(jobs.client.get).bind(jobs.client)

// Export the Kue instance
exports.jobs = jobs

// Export the Redis' client
exports.client = jobs.client
