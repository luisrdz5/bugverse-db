'use strict'

const db = require('../')

async function run () {
  const config = {
    database: process.env.DB_NAME || 'bugverse',
    username: process.env.DB_USER || 'bugv',
    password: process.env.DB_PASS || 'bug',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres'
  }
  const { Agent, Metric } = await db(config).catch(handleFatalError)
  const agent = await Agent.createOrUpdate({
    uuid: 'yyy',
    name: 'test',
    username: 'test',
    pid: 1,
    connected: true,
    hostname: 'test'
  }).catch(handleFatalError)
  console.log('-- Agent --')
  console.log(agent)

  const agents = await Agent.findAll().catch(handleFatalError)
  console.log('--Agents--')
  console.log(agents)

  const metric = await Metric.create(agent.uuid, {
    type: 'memory',
    value: '300'
  }).catch(handleFatalError)
  console.log('--metric--')
  console.log(metric)

  const metrics = await Metric.findByAgentUuid(agent.uuid).catch(handleFatalError)
  console.log('--metrics--')
  console.log(metrics)

  const metricsByType = await Metric.findByTypeAgentUuid('memory', agent.uuid).catch(handleFatalError)
  console.log('--metricsByType--')
  console.log(metricsByType)
}

function handleFatalError (err) {
  console.error(err.message)
  console.error(err.stack)
  process.exit(1)
}
run()
