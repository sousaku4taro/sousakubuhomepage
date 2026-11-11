import { createClient } from 'microcms-js-sdk';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;

if (!serviceDomain || !apiKey) {
  console.error('❌ Error: MICROCMS_SERVICE_DOMAIN または MICROCMS_API_KEY が設定されていません。');
  process.exit(1);
}

const client = createClient({
  serviceDomain: serviceDomain,
  apiKey: apiKey,
});

async function fetchWorks() {
  try {
    console.log('🔄 microCMSから作品データを取得中...');

    // microCMSから作品一覧を取得（上限100件）
    const res = await client.get({
      endpoint: 'works',
      queries: { limit: 100 }
    });

    // Astro側（works.json）が期待するデータフォーマットに変換
    const formattedData = res.contents.map((item) => ({
      id: item.id,
      title: item.title,
      author: item.author,
      category: item.category,
      tool: item.tool || '',
      date: item.date || item.createdAt.substring(0, 10).replace(/-/g, '.'),
      image: item.image?.url || '',
      description: item.description || ''
    }));

    // 保存先パスを設定して JSON 書き出し
    const outputDir = path.resolve('src/pages/data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'works.json');
    fs.writeFileSync(outputPath, JSON.stringify(formattedData, null, 2));

    console.log(`✅ microCMSからのデータ取得に成功しました！（全 ${formattedData.length} 件 -> src/data/works.json）`);
  } catch (error) {
    console.error('❌ microCMSからのデータ取得中にエラーが発生しました:', error);
    process.exit(1);
  }
}

fetchWorks();
