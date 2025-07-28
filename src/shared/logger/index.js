const { loggerFactory } = require('@mojaloop/central-services-logger/src/contextLogger')

const logger = loggerFactory('RAS') // global logger

module.exports = {
  logger
}
