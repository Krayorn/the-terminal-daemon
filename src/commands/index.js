const path = require('path')
const { setPrompt } = require('../prompt')
const { getStrategies, execStrategy } = require('../lib/strategies')
const { isScanRunning, completeTraining } = require('./train.command')
const nscan = require('./nscan/strategies/discover-server.strategy')

const strategies = getStrategies(path.join(__dirname, '**/*.command.js'))

const exec = async (req, res) => {
  const response = await execStrategy(strategies)(req, res)
  const withPrompt = response.concat(setPrompt(req, res))

  const trainingCommands =
    req.state.training_currently != null && !isScanRunning(req.state)
      ? completeTraining(req)
      : []

  const nscanCommands = nscan.test(req) ? nscan.exec(req) : []

  const commands = []
    .concat(trainingCommands)
    .concat(nscanCommands)
    .concat(withPrompt)

  return res.json(commands)
}

module.exports = {
  exec
}
