import * as crypto from 'crypto'

const isAuthorized = event => {
  const requestSignature = event.headers['X-Slack-Signature']
  const requestTimestamp = event.headers['X-Slack-Request-Timestamp']
  const body = event.body
  const hmac = crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET)
  const [version, hash] = requestSignature.split('=')
  hmac.update(`${version}:${requestTimestamp}:${body}`)
  return hmac.digest('hex') === hash
}

export default isAuthorized