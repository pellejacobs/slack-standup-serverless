import { updateStandup, getStandup } from './dynamodb'

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
  await updateStandup(userId, { standupStatus: action === 'skip' ? 'skipped' : 'started' })
  const text = action === 'skip' ? 'Ok, skipping this standup' : `Let's go!\n1. What did you do yesterday?`
  return cb(null, { status: 200, body: JSON.stringify({ text }) })
}
