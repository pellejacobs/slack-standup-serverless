import * as AWS from 'aws-sdk'

let options = {}
if (process.env.IS_OFFLINE) {
  options = { region: 'localhost', endpoint: 'http://localhost:8000' }
}
const client = new AWS.DynamoDB.DocumentClient(options)

const getStandupDate = () => new Date().toISOString().substring(0, 10)

export const updateStandup = (userId, updatedFields) => {
  const params: any = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: { standupDate: getStandupDate(), userId },
    ExpressionAttributeValues: Object.keys(updatedFields).reduce((acc, key, index) => {
      const valueKey = `:value${index}`
      return { ...acc, [valueKey]: [updatedFields[key]] }
    }, {}),
    UpdateExpression: Object.keys(updatedFields).reduce((acc, key, index) => {
      return `${acc} ${key} = :value${index}${index > 0 ? ',' : ''}`
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
  const params: any = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: { standupDate: getStandupDate(), userId },
  }
  return new Promise<any>((resolve, reject) => {
    client.get(params, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

export default client
