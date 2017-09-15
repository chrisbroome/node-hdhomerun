const assert = require('assert')
const proto = require('../protocol')

describe('protocol', () => {

  it('parse a control request pkt', done => {
    const pkt = proto.encode_msg({
      type: proto.types.getset_req,
      getset_name: '/sys/version',
    })
    const msg = {}
    assert.ok(proto.decode_pkt(pkt, msg), 'decode returns true');
    assert.equal(msg.type, proto.types.getset_req);
    assert.equal(msg.getset_name, '/sys/version');
    done();
  })

  it('parse a control reply pkt', done => {
    const pkt = proto.encode_msg({
      type: proto.types.getset_rpy, getset_name:
        '/sys/model', getset_value: 'hdhomerun3_atsc',
    })
    const msg = {}
    assert.ok(proto.decode_pkt(pkt, msg, 'decode returns true'));
    assert.equal(msg.type, proto.types.getset_rpy);
    assert.equal(msg.getset_name, '/sys/model');
    assert.equal(msg.getset_value, 'hdhomerun3_atsc');
    done();
  })

  it('parse a discover request pkt', done => {
    const pkt = proto.encode_msg({
      type: proto.types.disc_req,
      device_type: proto.dev_values.device_type_tuner,
      device_id: proto.dev_values.device_id_any,
    })
    const msg = {}
    assert.ok(proto.decode_pkt(pkt, msg, 'decode returns true'));
    assert.equal(msg.type, proto.types.disc_req);
    assert.equal(msg.device_type, 'tuner');
    assert.equal(msg.device_id, proto.dev_values.device_id_any.toString(16).toUpperCase());
    done();
  })

  it('parse a discover reply pkt', done => {
    const pkt = proto.encode_msg({
      type: proto.types.disc_rpy,
      device_type: proto.dev_values.device_type_tuner,
      device_id: 0x1038A145,
      tuner_count: 2,
    })
    const msg = {}
    assert.ok(proto.decode_pkt(pkt, msg, 'decode returns true'));
    assert.equal(msg.type, proto.types.disc_rpy);
    assert.equal(msg.device_type, 'tuner');
    assert.equal(msg.device_id, '1038A145');
    assert.equal(msg.tuner_count, 2);
    done();
  })

  it('stream a request', done => {
    const encoder = new proto.RequestEncoder()

    encoder.on('readable', function onReadable() {
      const buf = encoder.read()
      assert.ok(buf);
      const msg = {}
      assert.ok(proto.decode_pkt(buf, msg));
      assert.equal(msg.type, proto.types.getset_req);
      assert.equal(msg.getset_name, '/sys/version');
      done();
    });

    const msg1 = {
      type: proto.types.getset_req,
      getset_name: '/sys/version',
    }

    encoder.send(msg1);
  })

  it('stream a reply', done => {
    const encoder = new proto.RequestEncoder()
    const decoder = new proto.ReplyDecoder()

    const msg1 = {
      type: proto.types.getset_req,
      getset_name: '/sys/model',
    }

    decoder.on('reply', function(msg2) {
      assert.ok(msg2);
      assert.equal(msg2.type, proto.types.getset_req);
      assert.equal(msg2.getset_name, '/sys/model');
      done();
    });

    encoder.pipe(decoder);
    encoder.send(msg1);
  })

  it('receive reply from chunks', done => {
    const decoder = new proto.ReplyDecoder()

    decoder.on('reply', function(msg2) {
      assert.ok(msg2);
      assert.equal(msg2.type, proto.types.getset_req);
      assert.equal(msg2.getset_name, '/sys/model');
      done();
    });

    const msg1 = {
      type: proto.types.getset_req,
      getset_name: '/sys/model',
      getset_value: 'hdhomerun3_atsc',
    }

    const pkt = proto.encode_msg(msg1)

    for (let i = 0; i < pkt.length; i++)
      decoder.write(pkt.slice(i, i + 1));
  })

})
