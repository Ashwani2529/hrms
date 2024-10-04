/* eslint-disable */
import AWS from 'aws-sdk';

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-south-1'
});

const s3 = new AWS.S3();

const uploadFileToS3 = async (file, type = 'public') => {
    const key = Date.now();

    const params = {
        Bucket: type === 'public' ? 'hrms-employee-images' : 'hrms-employee-docs',
        Key: `${file.name}_${key}.${file.type.split('/')[1]}`, // Setting a unique key for the file
        Body: file,
        ContentDisposition: 'inline',
        ContentType: file.type
    };

    try {
        const data = await s3.upload(params).promise();
        // return type === 'public' ? data.Location : data.Key;
        return data?.Location ?? data?.key;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export default uploadFileToS3;
