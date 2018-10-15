import * as crypto from 'crypto'

const isAuthorized = event => {
  try {
    const requestSignature = event.headers['X-Slack-Signature']
    const requestTimestamp = event.headers['X-Slack-Request-Timestamp']
    const body = event.body
    const hmac = crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET as any)
    const [version, hash] = requestSignature.split('=')
    hmac.update(`${version}:${requestTimestamp}:${body}`)
    return hmac.digest('hex') === hash
  } catch (error) {
    return false
  }
}

export default isAuthorized
