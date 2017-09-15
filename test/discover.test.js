const assert = require('assert')
const hdhr = require('../index.js')

describe('discover', () => {

  it('discovers all devices', done =>
    hdhr.discover((err, results) => {
	if (err) return done(err)

      assert.ok(Array.isArray(results))
      assert.ok(results.length >= 1, 'found at least one device')
      done()
    })
  )

  it('discovers one particular device', done => {
    if (!process.env.MY_HDHR)
      return done(new Error('set env var MY_HDHR to valid (online) device_id'))

    return hdhr.discover(process.env.MY_HDHR, (err, results) => {
      if (err) return done(err)

      assert.equal(results.length, 1)
      assert.equal(results[0].device_id, process.env.MY_HDHR)
      done()
    });

  })

})
