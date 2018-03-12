'use strict'

const debug = require('debug')('bugverse:db:setup')
const db = require('./')
const Sequelize = require('sequelize')

async function setup () {
  const config = {
    database: process.env.DB_NAME || 'bugverse',
    username: process.env.DB_USER || 'bugv',
    password: process.env.DB_PASS || 'bug',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s),
    setup: true,
    operatorsAliases: Sequelize.Op
  }
  await db(config).catch(handleFatalError)

  console.log('Success!')
  process.exit(0)
}
function handleFatalError (err) {
  console.error(err.message)
  console.error(err.stack)
  process.exit(1)
}

setup()
