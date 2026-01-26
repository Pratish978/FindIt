import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import sharp from 'sharp';
import fetch from 'node-fetch'; // You might need to: npm install node-fetch

const categoryMap = {
    'cellular telephone': 'Mobile Phone',
    'handheld computer': 'Mobile Phone',
    'notebook': 'Laptop',
    'laptop': 'Laptop',
    'wallet': 'Wallet',
    'key': 'Keys',
    'water bottle': 'Water Bottle',
    'backpack': 'Bag',
    'handbag': 'Bag'
};

export const predictImage = async (imagePath) => {
    try {
        console.log("🧠 AI Process Started...");
        const model = await mobilenet.load();

        let inputSource;

        // CHECK: Is this a URL or a local file path?
        if (imagePath.startsWith('http')) {
            const response = await fetch(imagePath);
            const arrayBuffer = await response.arrayBuffer();
            inputSource = Buffer.from(arrayBuffer);
        } else {
            inputSource = imagePath;
        }

        // Process with Sharp
        const { data } = await sharp(inputSource)
            .resize(224, 224)
            .removeAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const imageTensor = tf.tensor3d(new Uint8Array(data), [224, 224, 3], 'int32');
        const predictions = await model.classify(imageTensor);
        
        imageTensor.dispose();

        if (predictions && predictions.length > 0) {
            const rawGuess = predictions[0].className.toLowerCase();
            console.log("🤖 AI Raw Guess:", rawGuess);

            for (const [key, value] of Object.entries(categoryMap)) {
                if (rawGuess.includes(key)) return value;
            }

            const result = rawGuess.split(',')[0];
            return result.charAt(0).toUpperCase() + result.slice(1);
        }
        
        return "Other";
    } catch (error) {
        console.error("❌ AI Error Details:", error.message);
        return "Detection Failed";
    }
};