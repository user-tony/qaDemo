import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { qa_id, files } = req.body;

      if (files && files.length > 0) {
        console.log('Received files:', files);

        const uploadPromises = files.map(async (file) => {
          const response = await axios.post(`${process.env.API_BASE_URL}/v1/qa/upload`, {
            qa_id,
            files: [file],
          });
          return response.data;
        });

        const uploadResults = await Promise.all(uploadPromises);
        console.log('Upload results:', uploadResults);
      }

      res.status(200).json({ message: '处理成功' });
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ error: '内部服务器错误' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
