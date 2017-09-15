const assert = require('assert')
const funcs = require('../protocol/functions')

describe('decode packet', () => {

  it('should decode the packet', () => {
    const typeDiscoverReply = '0003'
    const messageLength = '008f'
    const tagDeviceType = '01'
    const deviceTypeTuner = '04000000'
    const deviceIdLength = '04'
    const deviceId = '101b01ee'
    const tagAuthString = '2b'
    const lenAuthString = '18'
    const authString = '49767141466a7a4d59586865347966554a4672586d787633'
    const tagTunerCount = '10'
    const lenTunerCount = '01'
    const tunerCount = '02'
    const tagAuthBaseURL = '2a'
    const lenBaseURL = '16'
    const baseURL = '687474703a2f2f3139322e3136382e322e32343a3830'

    const tagLineupURL = '27'
    const lenLineupURL = '4c'
    const lineupURL = '687474703a2f2f697076342d6170692e6864686f6d6572756e2e636f6d2f6170692f6c696e6575703f446576696365417574683d49767141466a7a4d59586865347966554a4672586d787633'
    const packetChecksum = `68bd94a3`
    const samplePacket =
      `${typeDiscoverReply}${messageLength}${tagDeviceType}${deviceTypeTuner}0102${deviceIdLength}${deviceId}${tagAuthString}${lenAuthString}${authString}${tagTunerCount}${lenTunerCount}${tunerCount}${tagAuthBaseURL}${lenBaseURL}${baseURL}${tagLineupURL}${lenLineupURL}${lineupURL}${packetChecksum}`
    const pkt = new Buffer(samplePacket, 'hex')
    const msg = {}

    funcs.decode_pkt(pkt, msg)
  })

})
