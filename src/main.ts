import { Handler } from 'aws-lambda'
import { WebClient } from '@slack/client'

export const handler: Handler = async (event, context, callback) => {
  const web = new WebClient(process.env.SLACK_BOT_TOKEN)
  const usersResponse: any = await web.users.list()
  const imResponse: any = await web.im.list()
  const users = usersResponse.members

  // TODO: Add option for public channels, allow for custom channel
  const groupsResponse: any = await web.groups.list()
  const channel = groupsResponse.groups.find(g => g.name === 'standup-test')

  await Promise.all(
    channel.members.map(async code => {
      const member = users.find(u => u.id === code)
      if (member.name === 'peter') return
      const imChannel = imResponse.ims.find(im => im.user === code)
      const message = `Hi ${member.real_name}, let's get ready for the standup`
      await web.chat.postMessage({
        channel: imChannel.id,
        text: message,
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
    })
  )

  callback(null, {})
}
