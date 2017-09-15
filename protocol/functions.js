const crc = require('buffer-crc32');
const packet = require('./packet');
const {UnknownTag, InvalidChecksum} = require('./errors');
const {identify} = require('./devices')
const proto = require('./protocol.js');
const assert = require('assert');

module.exports = {
	encode_msg: encode_msg,
	decode_pkt: decode_pkt,
};

function encode_msg(msg) {

	let pkt = new Buffer(proto.MAX_BUFSIZE);
	let pos = 0;

	pkt.writeUInt16BE(msg.type, 0);
	pos += 2;
	// leave room for the length
	pos += 2;

	Object.keys(msg).forEach(function (field) {
		if (field === 'type') {
			return;
		}
		pos = encode_tlv({ tag: field, value: msg[field] }, pkt, pos);
	});

	// trim buffer to size; leave room for checksum
	pkt = pkt.slice(0, pos + 4);

	// write packet size to header
	pkt.writeUInt16BE(pkt.length - 8, 2);

	const cksum = crc.unsigned(pkt.slice(0, pkt.length - 4));
	pkt.writeUInt32LE(cksum, pkt.length - 4);

	return (pkt);
}

function decode_pkt(pkt, msg) {
	if (pkt.length < proto.HEADER_LEN)
		return (false);

	var pos = msg._offset || 0;
	msg.unkown_tags = new Array();

	if (pos == 0) {
		msg.type = pkt.readUInt16BE(pos); pos += 2;
		msg.len = pkt.readUInt16BE(pos); pos += 2;
	}

	var remain = pos + msg.len + 4;
	if (pkt.length < remain) {
		msg._offset = pos;
		return (false);
	}

	var tags = proto.tags;
	var tag, tag_len, tag_val;
	while (pos < (msg.len + 4)) {
		tag = pkt.readUInt8(pos); pos += 1;
		tag_len = decode_varlen(pkt.slice(pos, pos + 2));
		(tag_len < 128) ? pos += 1 : pos += 2;

		switch (tag) {
			case (tags.device_type.value):
				var devtype = pkt.readUInt32BE(pos); pos += tag_len;
				msg.device_type = devtype == packet.HDHOMERUN_DEVICE_TYPE_TUNER ?
					'tuner' :
					'unknown';
				break;
			case (tags.device_id.value):
				var devid = pkt.readUInt32BE(pos); pos += tag_len;
				var info = identify(devid)
				Object.assign(msg, info)
				break;
			case (tags.tuner_count.value):
				var count = pkt.readUInt8(pos); pos += tag_len;
				msg.tuner_count = count;
				break;
			case (tags.getset_name.value):
				var gs_name = pkt.toString('ascii', pos, pos +
					tag_len - 1);
				pos += tag_len;
				msg.getset_name = gs_name;
				break;
			case (tags.getset_value.value):
				var gs_val = pkt.toString('ascii', pos, pos +
					tag_len - 1);
				pos += tag_len;
				msg.getset_value = gs_val;
				break;
			case (tags.getset_lockkey.value):
				var lockkey = pkt.readUInt32BE(pos); pos += tag_len;
				msg.lockkey = lockkey.toString(10).toUpperCase();
				break;
			case (tags.error_message.value):
				var err_msg = pkt.toString('ascii', pos, pos +
					tag_len - 1);
				pos += tag_len;
				msg.error_message = err_msg;
				break;
			case (tags.lineup_url.value): {
				var lineup_url = pkt.toString('ascii', pos, pos + tag_len);
				pos += tag_len;
				msg.lineup_url = lineup_url;
				break;
			}
			case (tags.auth_bin.value):
				var gs_name = pkt.toString('ascii', pos, pos +
					tag_len - 1);
				pos += tag_len;
				msg.getset_name = gs_name;
				break;
			case (tags.auth_str.value):
				var gs_name = pkt.toString('ascii', pos, pos +
					tag_len - 1);
				pos += tag_len;
				msg.getset_name = gs_name;
				break;
			case (tags.base_url.value):
				var gs_name = pkt.toString('ascii', pos, pos +
					tag_len - 1);
				pos += tag_len;
				msg.getset_name = gs_name;
				break;
			default:
				console.log(tag)
				msg.unkown_tags[tag] = pkt.toString('ascii', pos, pos +
					tag_len - 1);
				pos += tag_len;
				console.log('unknown tag type: ' + tag)
			//throw new Error('unknown tag type: ' + tag);
		}
	}

	// pos should equal message payload length plus header length
	assert.equal(pos, msg.len + 4, 'only checksum left')
	msg.checksum = pkt.readUInt32LE(pos); pos += 4;
	msg._offset = pos;

	if (msg.checksum !== crc.unsigned(pkt.slice(0, pkt.length - 4)))
		throw new InvalidChecksum(msg.checksum);

	return (true);
}

function encode_varlen(length) {
	if (length <= 127) {
		const varlen = new Buffer(1);
		varlen.writeUInt8(length, 0);
		return varlen;
	}

	const varlen = new Buffer(2);
	const tmpbuf = new Buffer(2);
	tmpbuf.writeUInt16BE(length, 0);

	varlen[0] = 0x80 | tmpbuf[1];
	varlen[1] = (tmpbuf[0] << 1) | (tmpbuf[1] >> 7);

	return (varlen);
}

function decode_varlen(varlen) {
	const fb = varlen.readUInt8(0);
	if (fb <= 127) return (fb);

	const tmpbuf = new Buffer(2);
	tmpbuf[1] = (varlen[0] & 0x7f) | (varlen[1] << 7);
	tmpbuf[0] = varlen[1] >> 1;

	const length = tmpbuf.readUInt16BE(0);
	return length;
}


function encode_tlv(tlv_obj, buf, offset) {
	const tags = proto.tags;

	// write the tag
	buf.writeUInt8(tags[tlv_obj.tag].value, offset);
	offset += 1;

	if (tags[tlv_obj.tag].size) {
		buf.writeUInt8(tags[tlv_obj.tag].size, offset);
		offset += 1;
	}

	switch (tags[tlv_obj.tag].value) {
		case (tags.device_type.value):
		case (tags.device_id.value):
		case (tags.getset_lockkey.value):
			buf.writeUInt32BE(tlv_obj.value, offset);
			offset += 4;
			return (offset);
			break;
		case (tags.tuner_count.value):
			buf.writeUInt8(tlv_obj.value, offset);
			offset += 1;
			return (offset);
			break;
		case (tags.getset_name.value):
		case (tags.getset_value.value):
			const buf1 = new Buffer(tlv_obj.value, 'ascii');
			let tmpbuf = Buffer.concat([buf1, new Buffer('\0')]);
			const tmplen = tmpbuf.length;
			const varlen = encode_varlen(tmplen);
			tmpbuf = Buffer.concat([varlen, tmpbuf]);
			tmpbuf.copy(buf, offset);
			offset += tmpbuf.length;
			return (offset);
		default:
			throw new UnknownTag(tags[tlv_obj.tag].value);
	}
}
