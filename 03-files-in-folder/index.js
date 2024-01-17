const fs = require('fs');
const path = require('path');

const folderPath = path.resolve(__dirname, 'secret-folder');

// Чтение содержимого папки secret-folder
fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error(`Ошибка чтения папки: ${err.message}`);
    return;
  }

  // Перебор файлов в папке
  files.forEach((file) => {
    const filePath = path.resolve(folderPath, file);

    // Получение данных о каждом элементе
    fs.stat(filePath, (statErr, stats) => {
      if (statErr) {
        console.error(
          `Ошибка получения данных о файле ${file}: ${statErr.message}`,
        );
        return;
      }

      // Проверка, что объект является файлом
      if (stats.isFile()) {
        console.log(
          `${path.parse(file).name} - ${path.parse(file).ext.slice(1)} - ${
            stats.size
          } bytes`,
        );
      }
    });
  });
});
