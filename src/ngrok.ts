export const handler = (event, context, cb) => {
  const body = JSON.parse(event.body)
  cb(null, { body: body.challenge })
}
