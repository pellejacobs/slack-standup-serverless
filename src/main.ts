import { WebClient } from '@slack/client'
import dynamodb from './dynamodb'

const getMessage = (channel, text) => ({
  channel,
  text,
  attachments: [
    {
      text: 'Start or Skip',
      fallback: 'You are unable to start nor skip',
      callback_id: 'start_standup',
      color: '#3AA3E3',
      actions: [
        { name: 'standup', text: 'Start', type: 'button', value: 'start' },
        { name: 'standup', text: 'Skip', type: 'button', value: 'skip' },
      ],
    },
  ],
})

const createResponse = userId => {
  const standupDate = new Date().toISOString().substring(0, 10)
  const params: any = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: { standupDate, userId, standupStatus: 'initiated' },
  }
  return new Promise((resolve, reject) => {
    dynamodb.put(params, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

const sendStandupInit = (users, ims) => userId => {
  const member = users.find(u => u.id === userId)
  if (member.name === 'peter') return
  const imChannel = ims.find(im => im.user === userId)
  const web = new WebClient(process.env.SLACK_BOT_TOKEN)
  return Promise.all([
    web.chat.postMessage(getMessage(imChannel.id, `Hi ${member.real_name}, let's get ready for the standup`)),
    createResponse(userId),
  ])
}

export const handler = async (event, context, callback) => {
  const web = new WebClient(process.env.SLACK_BOT_TOKEN)
  const usersResponse: any = await web.users.list()
  const imResponse: any = await web.im.list()

  // TODO: Add option for public channels, allow for custom channel
  const groupsResponse: any = await web.groups.list()
  const channel = groupsResponse.groups.find(g => g.name === 'standup-test')

  await Promise.all(channel.members.map(sendStandupInit(usersResponse.members, imResponse.ims)))
  callback(null, {})
}
