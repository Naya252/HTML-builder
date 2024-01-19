const fs = require('fs').promises;
const createReadStream = require('fs').createReadStream;
const createWriteStream = require('fs').createWriteStream;
const path = require('path');

const distPath = path.resolve(__dirname, 'project-dist');

const inputStylesPath = path.resolve(__dirname, 'styles');
const outStylesPath = path.resolve(__dirname, 'project-dist', 'style.css');

const inputAssetsPath = path.resolve(__dirname, 'assets');
const outAssetsPath = path.resolve(__dirname, 'project-dist', 'assets');

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
    const files = await fs.readdir(inputStylesPath);
    const writeStream = createWriteStream(outStylesPath);

    for (const file of files) {
      const stylePath = path.resolve(inputStylesPath, file);
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

async function cleanFolder(folderPath) {
  try {
    const items = await fs.readdir(folderPath);

    for (const item of items) {
      const childPath = path.join(folderPath, item);
      const stats = await fs.stat(childPath);

      if (stats.isFile()) {
        await fs.unlink(childPath);
      }
      if (stats.isDirectory()) {
        await cleanFolder(childPath);
        await fs.rmdir(childPath);
      }
    }

    return true;
  } catch (error) {
    console.error(`Ошибка удаления файлов: ${error.message}`);
  }
}

async function copyFolder(input, out) {
  try {
    const items = await fs.readdir(input);

    for (const item of items) {
      const originPath = path.join(input, item);
      const copiedPath = path.join(out, item);

      const stats = await fs.stat(originPath);
      if (stats.isFile()) {
        await fs.copyFile(originPath, copiedPath);
      }
      if (stats.isDirectory()) {
        await fs.mkdir(copiedPath, { recursive: true });
        await copyFolder(originPath, copiedPath);
      }
    }
  } catch (error) {
    console.error(`Ошибка чтения файла: ${error.message}`);
  }
}

async function checkFolder(folderPath) {
  try {
    const stats = await fs.stat(folderPath);
    if (stats.isDirectory()) {
      await cleanFolder(folderPath);
      return true;
    }
  } catch (error) {
    if (error.message.includes('no such file or directory')) {
      await fs.mkdir(folderPath, { recursive: true });
      return true;
    } else {
      console.error(`Ошибка создания папки: ${error.message}`);
    }

    return;
  }
}

async function copyAssets() {
  await copyFolder(inputAssetsPath, outAssetsPath);
}

async function buildPage() {
  await checkFolder(distPath);
}

async function buildHtml() {
  try {
    const writeStream = createWriteStream(
      path.resolve(__dirname, 'project-dist', 'index.html'),
    );

    const mainHtml = await fs.readFile(
      path.resolve(__dirname, 'template.html'),
    );
    const components = await fs.readdir(path.resolve(__dirname, 'components'));

    let html = mainHtml.toString();

    for (const component of components) {
      const componentPath = path.resolve(__dirname, 'components', component);
      const stats = await getStats(componentPath);
      // Проверка, что объект является html файлом
      if (stats.isFile() && path.parse(component).ext.slice(1) === 'html') {
        // Название шаблона
        let templateName = `{{${path.parse(component).name}}}`;
        // Чтение файла
        const template = await readFile(componentPath);
        // Изменение итогового шаблона
        html = html.replace(templateName, template.toString());
      }
    }

    writeStream.write(html);
  } catch (err) {
    console.log(`Ошибка сборки html: ${err}`);
  }
}

buildPage().then(() => {
  buildHtml();
  buildStyles();
  copyAssets();
});
