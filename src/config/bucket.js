const { S3Client } = require("@aws-sdk/client-s3");
require('dotenv').config()

const bucketRegon = process.env.BUCKET_REGON
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY
const bucketName = process.env.BUCKET_NAME

const s3 = new S3Client({
    credentials : {
        accessKeyId : accessKey,
        secretAccessKey : secretAccessKey
    },
    region : bucketRegon
});

module.exports = { s3, bucketName }