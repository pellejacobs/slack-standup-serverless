export const handler = (event, context, cb) => {
  const rawbody = decodeURIComponent(event.body).replace('payload=', '')
  const body = JSON.parse(rawbody)
  const action = body.actions[0].value
  console.log({ action })
  cb(null, { status: 200 })
}
