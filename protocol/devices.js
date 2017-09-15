const UNKONWN = 'UNKNOWN'
const TECH_US = 'TECH-US/TECH3-US'
const TECH3_EU = 'TECH3-EU'
const HDHR_US = 'HDHR-US'
const HDHR_T1_US = 'HDHR-T1-US'
const HDHR3_US = 'HDHR3-US'
const HDHR3_DT = 'HDHR3-DT'
const HDHR_EU = 'HDHR-EU'
const HDHR3_EU = 'HDHR3-EU'

module.exports = {
	identify,
	UNKONWN,
	TECH_US,
	TECH3_EU,
	HDHR_US,
	HDHR_T1_US,
	HDHR3_US,
	HDHR3_DT,
	HDHR_EU,
	HDHR3_EU,
}

function identify(deviceId) {
  const id = deviceId.toString(16).toUpperCase()
	const highBits = deviceId >> 20

	switch (highBits) {
		case 0x100: /* TECH-US/TECH3-US */
			return {
        device_id: id,
				model_number: TECH_US,
				is_legacy: deviceId < 0x10040000,
			}

		case 0x120: /* TECH3-EU */
			return {
        device_id: id,
				model_number: TECH3_EU,
				is_legacy: deviceId < 0x12030000,
			}

		case 0x101: /* HDHR-US */
			return {
        device_id: id,
				model_number: HDHR_US,
				is_legacy: true,
			}
		case 0x102: /* HDHR-T1-US */
			return {
        device_id: id,
				model_number: HDHR_T1_US,
				is_legacy: true,
			}

		case 0x103: /* HDHR3-US */
			return {
        device_id: id,
				model_number: HDHR3_US,
				is_legacy: true,
			}

		case 0x111: /* HDHR3-DT */
			return {
        device_id: id,
				model_number: HDHR3_DT,
				is_legacy: true,
			}

		case 0x121: /* HDHR-EU */
			return {
        device_id: id,
				model_number: HDHR_EU,
				is_legacy: true,
			}

		case 0x122: /* HDHR3-EU */
			return {
        device_id: id,
				model_number: HDHR3_EU,
				is_legacy: true,
			}
	}

	return {
    device_id: id,
		model_number: UNKONWN,
		is_legacy: false,
	}
}
