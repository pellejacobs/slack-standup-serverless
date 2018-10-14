import * as AWS from 'aws-sdk'

let options = {}
// IS_OFFLINE for sls-offline, IS_LOCAL for sls invoke local
if (process.env.IS_OFFLINE || process.env.IS_LOCAL) {
  options = { region: 'localhost', endpoint: 'http://localhost:8000' }
}
const client = new AWS.DynamoDB.DocumentClient(options)

const getStandupDate = () => new Date().toISOString().substring(0, 10)

export const updateStandup = (userId, updatedFields) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE as string,
    Key: { standupDate: getStandupDate(), userId },
    ExpressionAttributeValues: Object.keys(updatedFields).reduce((acc, key, index) => {
      const valueKey = `:value${index}`
      return { ...acc, [valueKey]: updatedFields[key] }
    }, {}),
    UpdateExpression: Object.keys(updatedFields).reduce((acc, key, index) => {
      return `${acc}${index > 0 ? ',' : ''} ${key} = :value${index}`
    }, 'SET'),
  }
  return new Promise((resolve, reject) => {
    client.update(params, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

export const getStandup = userId => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE as string,
    Key: { standupDate: getStandupDate(), userId },
  }
  return new Promise<any>((resolve, reject) => {
    client.get(params, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

export const getTodayStandups = () => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE as string,
    KeyConditionExpression: 'standupDate = :sd',
    ExpressionAttributeValues: { ':sd': getStandupDate() },
  }
  return new Promise<any>((resolve, reject) => {
    client.query(params, (err, data) => {
      if (err) reject(err)
      else resolve(data.Items)
    })
  })
}

export default client
