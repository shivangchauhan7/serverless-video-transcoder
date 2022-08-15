const { sendResponse } = require('../../utilities/index')
const AWS = require('aws-sdk')
const dbClient = new AWS.DynamoDB.DocumentClient()

module.exports.handler = async (event) => {
  try {
    const { VIDEO_STATUS_TABLE, REGION } = process.env
    const { jobId, status, outputGroupDetails } = event.detail

    const params = {
      TableName: VIDEO_STATUS_TABLE,
      Key: {
        id: jobId
      },
      ExpressionAttributeValues: {
        ':vodStatus': status
      },
      UpdateExpression: 'SET vodStatus = :vodStatus',
      ReturnValues: 'ALL_NEW'
    }

    if (status !== 'INPUT_INFORMATION') {
      if (status === 'COMPLETE') {
        const splitOutput = outputGroupDetails[0].outputDetails[0].outputFilePaths[0].split('/')
        params.ExpressionAttributeValues[':outputPath'] = `https://${splitOutput[2]}.s3.${REGION}.amazonaws.com/${splitOutput[3]}`
        params.UpdateExpression += ', outputPath = :outputPath'
      }

      await dbClient.update(params).promise()
    }
  } catch (err) {
    return sendResponse(500, { message: 'Internal Server Error' })
  }
}
