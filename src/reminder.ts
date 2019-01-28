import { WebClient } from '@slack/client'
import { getTodayStandups } from './dynamodb'
import config from './config'
import { isNotComplete } from './overview'

const sendStandupReminder = users => async ({ userId }) => {
  const member = users.find(u => u.id === userId)
  if (member.is_bot) return
  const web = new WebClient(process.env.SLACK_BOT_TOKEN)
  const imChannelReponse: any = await web.im.open({ user: userId })
  return web.chat.postMessage({ channel: imChannelReponse.channel.id, text: config.reminder })
}

export const handler = async (event, context, cb) => {
  const allStandups = await getTodayStandups()
  await Promise.all(allStandups.filter(isNotComplete).map(sendStandupReminder))
  cb(null, {})
}
