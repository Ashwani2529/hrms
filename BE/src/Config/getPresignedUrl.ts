import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const client = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const getPresignedUrl = async key => {
  try {
    const command = new GetObjectCommand({
      Bucket: 'hrms-employee-docs',
      Key: key,
      ResponseContentType: 'application/pdf',
      ResponseContentDisposition: 'inline',
    });

    const url = await getSignedUrl(client, command, { expiresIn: 3600 });

    return url;
  } catch (error) {
    console.error(error);
  }
};


export const uploadPdfBuffer = async (key:string, pdfBuffer:Buffer, contentType = 'application/pdf') => {
  try {
    const command = new PutObjectCommand({
      Bucket: 'hrms-employee-docs',
      Key: key,
      Body: pdfBuffer,
      ContentType: contentType
    });

    const response = await client.send(command);

    return response;
  } catch (error) {
    console.error(error);
  }
};
