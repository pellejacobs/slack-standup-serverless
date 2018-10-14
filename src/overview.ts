import { getTodayStandups, updateStandup, getStandup } from './dynamodb'
import { WebClient } from '@slack/client'
import { createResponse } from './start'

const sendOverview = async allStandups => {
  const web = new WebClient(process.env.SLACK_BOT_TOKEN)
  const overviewSentStandup = await getStandup('OVERVIEW_SENT')
  if (overviewSentStandup.Item) return console.log('Already sent out overview today')
  const [groupsResponse, users]: any[] = await Promise.all([
    web.groups.list(),
    web.users.list(),
    createResponse('OVERVIEW_SENT'),
  ])
  const channel = groupsResponse.groups.find(g => g.name === process.env.CHANNEL_NAME)
  return web.chat.postMessage({
    channel: channel.id,
    text: 'Here is the standup overview for today:',
    attachments: allStandups.map(standup => {
      const user = users.members.find(u => u.id === standup.userId) || { profile: {} }
      let text
      if (standup.standupStatus === 'skipped') text = 'Skipped the standup'
      if (isNotComplete(standup)) text = 'Did not reply in time and timed out'
      return {
        author_name: user.profile.real_name,
        author_icon: user.profile.image_original,
        text,
        fields:
          standup.standupStatus === 'completed'
            ? [
                { title: '1. What did you do yesterday?', value: standup.answer1 },
                { title: '2. What are you working on today?', value: standup.answer2 },
                { title: '3. Is there anything standing in your way?', value: standup.answer3 },
              ]
            : null,
      }
    }),
  })
}

const isNotComplete = standup => !['completed', 'skipped'].includes(standup.standupStatus)

export const checkStandups = async () => {
  const allStandups = await getTodayStandups()
  if (allStandups.some(isNotComplete)) return
  return sendOverview(allStandups)
}

export const handler = async (event, context, cb) => {
  const allStandups = await getTodayStandups()
  await Promise.all(
    allStandups.filter(isNotComplete).map(standup => {
      return updateStandup(standup.userId, { standupStatus: 'timedout' })
    })
  )
  await sendOverview(allStandups)
  cb(null, {})
}
