const fs = require('fs').promises;
const createReadStream = require('fs').createReadStream;
const createWriteStream = require('fs').createWriteStream;
const path = require('path');

const stylesPath = path.resolve(__dirname, 'styles');
const outPath = path.resolve(__dirname, 'project-dist', 'bundle.css');

async function readFile(url) {
  try {
    const readStream = createReadStream(url);
    for await (const data of readStream) {
      return data.toString();
    }

    return readStream;
  } catch (err) {
    console.log(`Ошибка чтения файла: ${err}`);
  }
}

async function getStats(url) {
  try {
    const stats = await fs.stat(url);
    return stats;
  } catch (err) {
    console.log(`Ошибка получения данных о файле: ${err}`);
  }
}

async function buildStyles() {
  try {
    const files = await fs.readdir(stylesPath);
    const writeStream = createWriteStream(outPath);

    for (const file of files) {
      const stylePath = path.resolve(stylesPath, file);
      const stats = await getStats(stylePath);
      // Проверка, что объект является css файлом
      if (stats.isFile() && path.parse(file).ext.slice(1) === 'css') {
        // Чтение файла
        const style = await readFile(stylePath);
        // Запись файла
        writeStream.write(style + '\n');
      }
    }
  } catch (err) {
    console.log(`Ошибка чтения папки: ${err}`);
  }
}

buildStyles();
