import { WebClient } from '@slack/client'
export const handler = async (event, context, cb) => {
  if (!event.body) return cb(null, { body: 'No body found', status: 401 })
  const body = JSON.parse(event.body)
  if (body.event.subtype) return cb(null, {}) // not a direct, new message
  console.log(body)
  const web = new WebClient(process.env.SLACK_BOT_TOKEN)
  await web.chat.postMessage({
    channel: body.event.channel,
    text: 'Hello there',
  })
  cb(null, {})
}
