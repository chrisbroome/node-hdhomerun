const assert = require('assert');
const hdhr = require('../index.js');


describe('hdhr', () => {

	it('checks for $MY_HDHR',() =>
		assert.ok(process.env.MY_HDHR, 'env var MY_HDHR should be set to device_id of local online device')
	)

  it('create device object', done => {
    hdhr.discover(process.env.MY_HDHR, (err, found) => {
	if (err) return done(err)
			const head = found[0]

      if (!head) {
        return done(new Error('no device found'))
      }

      const device = hdhr.create(head);
      device.get('/sys/model', function(err, res) {
	if (err) return done(err)
        assert.ifError(err);
        assert.equal(res.value, 'hdhomerun_atsc');
        done();
        device.control_sock.destroy();
      });
		});

  });

});
