import { registerAs } from '@nestjs/config';
import processEnvObj from '.';

//5mb
// const minimumS3ChunkSize = 5 * 1024 * 1024;
// let fileChunkSize =
//   parseFloat(
//     String(
//       processEnvObj.FILE_CHUNK_PARTITION_SIZE || String(minimumS3ChunkSize),
//     ),
//   ) || minimumS3ChunkSize;

// if (fileChunkSize < minimumS3ChunkSize) {
//   fileChunkSize = minimumS3ChunkSize;
// }

const getAwsConfig = () => ({
  // s3Bucket: processEnvObj.AWS_S3_BUCKET,
  // s3Region: processEnvObj.AWS_S3_BUCKET_REGION,
  // accessKeyId: processEnvObj.AWS_ACCESS_KEY_ID,
  // secretAccessKey: processEnvObj.AWS_SECRET_ACCESS_KEY,
  // fileUrlExpiry:
  //   parseInt(String(processEnvObj.AWS_SIGNED_URL_EXPIRY || '0'), 10) || 0,
  // fileChunkSize,
});

export default registerAs('aws', getAwsConfig);
