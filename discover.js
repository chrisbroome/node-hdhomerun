const dgram = require('dgram');
const proto = require('./protocol/protocol')
const funcs = require('./protocol/functions')

module.exports = function(search_id, cb) {
  if (arguments.length === 1 && typeof search_id === 'function') {
    var cb = search_id;
    search_id = null;
  } else if (arguments.length !== 2 || typeof search_id !== 'string' || typeof cb !== 'function') {
    throw new Error('invalid discover() args');
  }

  const limit = 64
  const err = null
  const found = []
  let timer

  const sock = dgram.createSocket('udp4', function(pkt, remote) {
    const disc_obj = {}
    if (!funcs.decode_pkt(pkt, disc_obj)) {
      console.log('bogus reply message');
    }
    delete disc_obj.type;

    disc_obj.device_ip = remote.address;

    if (search_id) {
      if (search_id === disc_obj.device_id)
        found.push(disc_obj);
    } else {
      found.push(disc_obj);
    }

    if ((found.length >= limit) ||
      (disc_obj.device_id === search_id)) {
      clearTimeout(timer);
      sock.close();
      cb(err, found);
    }
  })

  timer = setTimeout(function() {
    sock.close();
    cb(err, found);
  }, 500);

  let disc_msg = {
    type: proto.types.disc_req,
    device_type: proto.dev_values.device_type_tuner,
    device_id: search_id ? parseInt(search_id, 16) : proto.dev_values.device_id_any,
  }

  let disc_pkt = funcs.encode_msg(disc_msg)

  sock.on('listening', function() {
    sock.setBroadcast(true);
    sock.send(disc_pkt, 0, disc_pkt.length, 65001, '255.255.255.255',
      function(err, bytes) {
        if (err) throw new Error('problem sending discover req');
      });
  });
  sock.bind();
}
