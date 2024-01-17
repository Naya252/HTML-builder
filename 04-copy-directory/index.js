const fs = require('fs').promises;
const path = require('path');

const originFolder = path.resolve(__dirname, 'files');
const copiedFolder = path.resolve(__dirname, 'files-copy');

async function copyFolder() {
  try {
    const files = await fs.readdir(originFolder);

    // Копирование файлов
    for (const file of files) {
      const originPath = path.join(originFolder, file);
      const copiedPath = path.join(copiedFolder, file);

      await fs.copyFile(originPath, copiedPath);
      console.log(`Скопировано: ${file}`);
    }

    console.log('Копирование завершено успешно..');
  } catch (error) {
    console.error(`Ошибка чтения файла: ${error.message}`);
  }
}

async function cleanFolder() {
  try {
    const files = await fs.readdir(copiedFolder);

    for (const file of files) {
      const filePath = path.join(copiedFolder, file);
      const stats = await fs.stat(filePath);
      if (stats.isFile()) {
        await fs.unlink(filePath);
        console.log(`Удалено: ${filePath}`);
      }
    }
    console.log(`Все файлы из ${copiedFolder} успешно удалены.`);

    await copyFolder();
  } catch (error) {
    console.error(`Ошибка удаления файлов: ${error.message}`);
  }
}

async function checkFolder() {
  try {
    let isExist = await fs.stat(copiedFolder);
    if (isExist) {
      await cleanFolder();
    }
  } catch (error) {
    if (error.message.includes('no such file or directory')) {
      await fs.mkdir(copiedFolder, { recursive: true });
      await copyFolder();
    } else {
      console.error(`Ошибка создания папки: ${error.message}`);
    }

    return;
  }
}

checkFolder();
