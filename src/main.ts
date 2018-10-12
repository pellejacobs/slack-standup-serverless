import { Handler } from 'aws-lambda'

export const handler: Handler = async (event, context, callback) => {
  await new Promise(resolve => setTimeout(resolve, 500))

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Your function executed successfully!',
      input: event,
    }),
  }

  callback(null, response)
}
