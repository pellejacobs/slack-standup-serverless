import { WebClient } from '@slack/client'
import { getStandup, updateStandup } from './dynamodb'
import { checkStandups } from './overview'
import config from './config'

const sendMessage = (channel, text) => {
  const web = new WebClient(process.env.SLACK_BOT_TOKEN)
  return web.chat.postMessage({ channel, text })
}

export const handler = async (event, context, cb) => {
  if (!event.body) return cb(null, { body: 'No body found', status: 401 })
  const body = JSON.parse(event.body)
  if (body.challenge) return cb(null, { body: body.challenge }) // allow for verification
  if (body.event.subtype) return cb(null, {}) // not a direct, new message
  const userId = body.event.user
  const text = body.event.text
  const respond = response => sendMessage(body.event.channel, response).then(() => cb(null, {}))
  const theStandup = await getStandup(userId)
  if (!theStandup) return respond(config.early)

  const status = theStandup.Item.standupStatus
  if (/(started)|(answered\d+)/.test(status)) {
    const answerIndex = status === 'started' ? 0 : parseInt(/\d+/.exec(status)[0]) + 1
    if (answerIndex + 1 >= config.questions.length) {
      await updateStandup(userId, { [`answer${answerIndex}`]: text, standupStatus: 'completed' })
      await checkStandups()
      return respond(config.completing)
    }
    await updateStandup(userId, { [`answer${answerIndex}`]: text, standupStatus: `answered${answerIndex}` })
    return respond(config.questions[answerIndex + 1])
  }

  switch (status) {
    case 'initiated':
      return respond(config.initiated)

    case 'skipped':
      return respond(config.skipped)

    case 'completed':
      return respond(config.completed)

    case 'timedout':
      return respond(config.timedout)

    default:
      return respond('Unknown status: ' + status)
  }
}
