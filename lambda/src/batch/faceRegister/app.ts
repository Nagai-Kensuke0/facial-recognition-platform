import { S3Handler } from 'aws-lambda';
import { Rekognition, S3 } from 'aws-sdk';

// 画像をRekognitionの顔認識コレクションに追加する関数
async function addToFaceCollection(bucketName: string, imageName: string, collectionId: string) {
    try {
        const s3 = new S3();
        const rekognition = new Rekognition();

        // S3オブジェクトのパラメータを作成
        const s3Params = {
            Bucket: bucketName,
            Key: imageName,
        };

        // S3オブジェクトを取得
        const s3Object = await s3.getObject(s3Params).promise();

        // 顔認識コレクションに画像を追加するリクエストパラメータを作成
        const rekognitionParams = {
            CollectionId: collectionId,
            Image: {
                Bytes: s3Object.Body,
            },
        };

        // 画像を顔認識コレクションに追加
        const result = await rekognition.indexFaces(rekognitionParams).promise();
        console.log('画像を顔認識コレクションに追加しました:', result);
    } catch (error) {
        console.error('エラー:', error);
    }
}

export const lambdaHandler: S3Handler = async (event, context) => {
    for (const record of event.Records) {
        const bucketName = record.s3.bucket.name;
        const objectKey = record.s3.object.key;
        console.log(`S3 Object created: bucket=${bucketName}, key=${objectKey}`);

        const faceCollectionId = process.env.FACE_COLLECTION_ID;
        if (faceCollectionId === undefined) {
            throw new Error('faceCollectionId = undefined');
        }

        // ここに処理を追加する
        await addToFaceCollection(bucketName, objectKey, faceCollectionId);
    }
};
