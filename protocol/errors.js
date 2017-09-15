const mkError = (name, f) => {
  const BaseError = function(...args) {
    Error.captureStackTrace(this, BaseError)
    this.name = name
    f(this, ...args)
  }

  return BaseError
}

const UnknownTag = mkError('UnknownTag', (ctx, tag) => {
  ctx.tag = tag
  ctx.message = `unknown tag: 0x${tag.toString(16)} (${tag})`
})

// const UnknownTagName = function(tag) {
//   Error.captureStackTrace(this, UnknownTagName)
//   this.tag = tag
//   this.message = `unknown tag type: ${tag}`
// }

const InvalidChecksum = function(checksum) {
  Error.captureStackTrace(this, InvalidChecksum)
  this.name = InvalidChecksum.name
  this.message = `invalid checksum: ${checksum}`
}

module.exports = {
  UnknownTag: UnknownTag,
  InvalidChecksum,
}
