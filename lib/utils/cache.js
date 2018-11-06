const kue = require('./kue')

// Modify the response "send" method to
// set the new key with the appropriate content
// before responding
exports.set = (res, key) => {
  res._sendResponse = res.send
  res.send = content => {
    kue.client.set(key, content, 'EX', 86400)
    res._sendResponse(content)
  }
}

// Get the content for the url if it exists
// or return the new key to be saved eventually
exports.get = (req, jobTitle) => {
  let key = `__${jobTitle}__${req.originalUrl || req.url}`

  return kue.getAsync(key)
    .then(reply => {
      if (reply) {
        return { reply }
      }

      return { newKey: key }
    })
    .catch(error => ({ error: `Error on cache getter --- ${error}` }))
}
