const { sendResponse } = require('../utilities/index.js')
const AWS = require('aws-sdk')
const s3 = new AWS.S3({ signatureVersion: 'v4' })

module.exports.handler = async function (event, context) {
  try {
    const { fileName, metaData } = JSON.parse(event.body)

    if (!fileName || !fileName.trim()) {
      return sendResponse(400, { message: 'Bad Request' })
    }

    const params = {
      Bucket: process.env.MEDIA_INPUT_BUCKET,
      Key: fileName,
      Expires: 3600,
      ContentType: 'video/*',
      Metadata: { ...metaData }
    }

    const response = s3.getSignedUrl('putObject', params)

    return sendResponse(200, { response })
  } catch (err) {
    console.log(err)
    return sendResponse(500, { message: 'Internal Server Error' })
  }
}
