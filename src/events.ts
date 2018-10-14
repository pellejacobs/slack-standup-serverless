import { WebClient } from '@slack/client'
import { getStandup, updateStandup } from './dynamodb'

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
  if (!theStandup) return respond('The standup has not started yet')

  const status = theStandup.Item.standupStatus
  switch (status) {
    case 'started':
      await updateStandup(userId, { answer1: text, standupStatus: 'answered1' })
      return respond('2. What are you working on today?')

    case 'answered1':
      await updateStandup(userId, { answer2: text, standupStatus: 'answered2' })
      return respond('3. Is there anything standing in your way?')

    case 'answered2':
      await updateStandup(userId, { answer3: text, standupStatus: 'completed' })
      return respond('Thank you, that will be all for today')

    case 'initiated':
      return respond('Please click on one of the buttons above to start or skip')

    case 'skipped':
      return respond('You skipped the standup today')

    case 'completed':
      return respond('You already completed the standup today')

    case 'timedout':
      return respond('You did not manage to complete the standup on time')

    default:
      return respond('Unknown status: ' + status)
  }
}
