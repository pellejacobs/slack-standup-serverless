import { WebClient } from '@slack/client'
import dynamodb from './dynamodb'
import config from './config'

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

export const createResponse = userId => {
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

const sendStandupInit = users => async userId => {
  const member = users.find(u => u.id === userId)
  if (member.is_bot) return
  const web = new WebClient(process.env.SLACK_BOT_TOKEN)
  const imChannelReponse: any = await web.im.open({ user: userId })
  return Promise.all([
    web.chat.postMessage(getMessage(imChannelReponse.channel.id, config.starting)),
    createResponse(userId),
  ])
}

export const handler = async (event, context, cb) => {
  const web = new WebClient(process.env.SLACK_BOT_TOKEN)
  const usersResponse: any = await web.users.list()

  // TODO: Add option for public channels, allow for custom channel
  const groupsResponse: any = await web.groups.list()
  const channel = groupsResponse.groups.find(g => g.name === process.env.CHANNEL_NAME)

  await Promise.all(channel.members.map(sendStandupInit(usersResponse.members)))
  cb(null, {})
}
