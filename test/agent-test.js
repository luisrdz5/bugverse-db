'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
let config = {
  logging: function () {

  }
}

let MetricStub = {
  belongsTo: sinon.spy()
}
let AgentStub = null

let db = null
let sandbox = null

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create()
  AgentStub = {
    hasMany: sandbox.spy()
  }
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
