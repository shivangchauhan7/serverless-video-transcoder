const { sendResponse } = require('../../utilities/index')
const AWS = require('aws-sdk')
AWS.config.mediaconvert = { endpoint: `https://${process.env.MEDIA_ENDPOINT}.mediaconvert.${process.env.REGION}.amazonaws.com` }
const MediaConvert = new AWS.MediaConvert({ apiVersion: '2017-08-29' })
const s3 = new AWS.S3()
const params = require('./mediaParams.js')
const dbClient = new AWS.DynamoDB.DocumentClient()

const { MEDIA_CONVERT_ROLE, MEDIA_OUTPUT_BUCKET, MEDIA_INPUT_BUCKET, VIDEO_STATUS_TABLE } = process.env

module.exports.handler = async (event) => {
  try {
    const fileKey = event.Records[0].s3.object.key
    const { metaData } = await fetchMetaData(fileKey)

    const input = `s3://${MEDIA_INPUT_BUCKET}/${fileKey}`
    const output = `s3://${MEDIA_OUTPUT_BUCKET}/`

    params.Role = MEDIA_CONVERT_ROLE
    params.Settings.OutputGroups[0].OutputGroupSettings.HlsGroupSettings.Destination = output
    params.Settings.OutputGroups[1].OutputGroupSettings.FileGroupSettings.Destination = output
    params.Settings.Inputs[0].FileInput = input
    params.Settings.OutputGroups[0].Outputs[0].VideoDescription.Width = metaData.videowidth || 1920
    params.Settings.OutputGroups[0].Outputs[0].VideoDescription.Height = metaData.videoheight || 1080
    params.Settings.OutputGroups[0].Outputs[0].VideoDescription.CodecSettings.H264Settings.MaxBitrate = metaData.videobitrate || 6000000

    const response = await MediaConvert.createJob(params).promise()

    const vodObj = {
      TableName: VIDEO_STATUS_TABLE,
      Item: {
        id: response.Job.Id,
        createdAt: new Date().toISOString(),
        vodStatus: 'SUBMITTED'
      },
      ConditionExpression: 'attribute_not_exists(id)'
    }

    await dbClient.put(vodObj).promise()
  } catch (err) {
    console.log(err)
    return sendResponse(500, { message: 'Internal Server Error' })
  }
}

async function fetchMetaData (key) {
  try {
    const params = {
      Bucket: MEDIA_INPUT_BUCKET,
      Key: key
    }

    const response = await s3.headObject(params).promise()
    return { metaData: response.Metadata }
  } catch (err) {
    throw new Error(err)
  }
}
