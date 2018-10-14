import { updateStandup, getStandup } from './dynamodb'
import { checkStandups } from './overview'
import config from './config'

export const handler = async (event, context, cb) => {
  const rawbody = decodeURIComponent(event.body).replace('payload=', '')
  const body = JSON.parse(rawbody)
  const userId = body.user.id
  const theStandup = await getStandup(userId)
  if (!theStandup || theStandup.Item.standupStatus !== 'initiated') {
    return cb(null, {
      body: JSON.stringify({
        text: 'No standup currently active',
        replace_original: false,
        response_type: 'in_channel',
      }),
    })
  }
  const action = body.actions[0].value
  if (action === 'skip') {
    await updateStandup(userId, { standupStatus: 'skipped' })
    cb(null, { body: JSON.stringify({ text: config.skipping }) })
    return checkStandups()
  }
  await updateStandup(userId, { standupStatus: 'started' })
  return cb(null, { body: JSON.stringify({ text: `Let's go!\n${config.questions[0]}` }) })
}
