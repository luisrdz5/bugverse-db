'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const agentFixtures = require('./fixtures/agent')
// const metricFixtures = require('./fixtures/metric')

let uuid = 'yyy-yyy-yyy'
let id = 1
let AgentStub = null
// let ModelStub = null
let db = null
let sandbox = null
let metricSandbox = null

let config = {
  logging: function () {

  }
}

let MetricStub = {
  belongsTo: sinon.spy()
}
let single = Object.assign({}, agentFixtures.single)

let connectedArgs = {
  where: { connected: true }
}
let userNameArgs = {
  where: { username: 'bug', connected: true }
}
let uuidArgs = {
  where: { uuid }
}
let newAgent = {
  uuid: '123-123-123',
  name: 'test',
  username: 'test',
  hostname: 'test',
  pid: 0,
  connected: false
}
let newMetric = {
  agentid: 'abc-abc-abc',
  type: 'temperature',
  value: '5',
  createAt: new Date(),
  updatedAt: new Date()
}

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create()
  AgentStub = {
    hasMany: sandbox.spy()
  }

  metricSandbox = sinon.sandbox.create()

  /*
  MetricStub = {
    hasMany: metricSandbox.spy()
  }
  */

  // Model create for the Metrics
  MetricStub.create = metricSandbox.stub()
  MetricStub.create.withArgs(uuid, newMetric).returns(Promise.resolve({
    toJSON () { return newAgent }
  }))

  // Model create Stub
  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgent).returns(Promise.resolve({
    toJSON () { return newAgent }
  }))

  // Model findAll Stub

  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all))
  AgentStub.findAll.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findAll.withArgs(userNameArgs).returns(Promise.resolve(agentFixtures.bug))

  // Model findOne Stub

  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))
  // AgentStub.findOne.withArgs().returns(Promise.resolve(agentFixtures.all))
  // AgentStub.findOne.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected))
  // AgentStub.findOne.withArgs(userNameArgs).returns(Promise.resolve(agentFixtures.bug))

  // Model Update Stub
  AgentStub.update = sandbox.stub()
  AgentStub.findOne.withArgs(single, uuidArgs).returns(Promise.resolve(single))

  // Here starts the  findById Stub
  AgentStub.findById = sandbox.stub()
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDatabase(config)
})

test.afterEach(t => {
  sandbox && sinon.sandbox.restore()
})
test('Agent', t => {
  t.truthy(db.Agent, 'Agent service should exist ')
})
test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was Executed')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the MetricModel')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was Executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the AgentModel')
})
test.serial('Agent#findById', async t => {
  let agent = await db.Agent.findById(id)

  t.true(AgentStub.findById.called, 'findById should be called on model')
  t.true(AgentStub.findById.calledOnce, 'findById should be called once')
  t.true(AgentStub.findById.calledWith(id), 'findById should be called with specified id')

  t.deepEqual(agent, agentFixtures.byId(id), 'should be the same')
})

test.serial('Agent#createOrUpdate - exists', async t => {
  let agent = await db.Agent.createOrUpdate(single)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  // t.true(AgentStub.findOne.calledTwice, 'findone should be called twice ')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'update should be called once ')

  t.true(AgentStub.update.called, 'agent.update called on model')
  t.true(AgentStub.update.calledOnce, 'agent.update should be called once')
  t.true(AgentStub.update.calledWith(single), 'agent.update should be called with specified args')

  t.deepEqual(agent, single, 'Agent should be the same')
})
test.serial('Agent#createOrUpdate - new', async t => {
  let agent = await db.Agent.createOrUpdate(newAgent)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'update should be called once ')
  t.true(AgentStub.findOne.calledWith({
    where: {uuid: newAgent.uuid}
  }), 'findOne should be called with uuid args')

  t.true(AgentStub.create.called, 'create should be called on model')
  t.true(AgentStub.create.calledOnce, 'create should be called once')

  t.true(AgentStub.create.calledWith(newAgent), 'create  should be called whit the Agentname')

  t.deepEqual(agent, newAgent, 'Agent should be the same')
})

test.serial('Agent#findConnected', async t => {
  let agents = await db.Agent.findConnected()
  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(connectedArgs), 'findAll should be called with ConnectedArgs')
  t.is(agents.length, agentFixtures.connected.length, ' agents should be the same length ')
  t.deepEqual(agents, agentFixtures.connected, 'Agents shuld be the same ')
})

test.serial('Agent#findByUserName', async t => {
  let agent = await db.Agent.findByUserName('bug')
  t.true(AgentStub.findAll.called, 'findByUserName should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findByUserName should be called once')
  t.true(AgentStub.findAll.calledWith(userNameArgs), 'findByUserName should be called with userNameArgs')
  t.is(agent.length, agentFixtures.bug.length, ' agents should be the same length ')
  t.deepEqual(agent, agentFixtures.bug, 'Agents should be the same ')
})

test.serial('Agent#findAll', async t => {
  let agents = await db.Agent.findAll()
  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(), 'findAll should be called without elements')
  t.is(agents.length, agentFixtures.all.length, ' agents should be the same length ')
  t.deepEqual(agents, agentFixtures.all, 'Agents should be the same ')
})

test.serial('Agent#findByUuid', async t => {
  let agent = await db.Agent.findByUuid(uuid)
  t.true(AgentStub.findOne.called, 'findByUuid should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'findByUuid should be called once')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'findByUuid should be called with the uuid')

  t.deepEqual(agent, agentFixtures.byUuid(uuid), 'Agents should be the same ')
})
