const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Создаем поток записи в текстовый файл
const writeStream = fs.createWriteStream(path.resolve(__dirname, 'text.txt'));

// Выводим приветствие в консоль
writeStream.on('open', () => {
  console.log(
    'Добро пожаловать! Введите текст или введите "exit" для завершения.',
  );
});

// Создаем интерфейс для чтения из консоли
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Функция для записи введенного текста в файл
function writeToLogFile(text) {
  writeStream.write(text + '\n');
}

// Слушаем событие ввода пользователя
rl.on('line', (input) => {
  if (input.toLowerCase() === 'exit') {
    // Если введено "exit", завершаем процесс
    console.log('Прощай! Завершаем процесс.');
    writeStream.close();
    process.exit();
  } else {
    // В противном случае записываем введенный текст в файл
    writeToLogFile(input);
    console.log(
      'Текст записан в файл. Введите следующий текст или введите "exit" для завершения.',
    );
  }
});

// Обработка события завершения процесса (Ctrl + C)
process.on('SIGINT', () => {
  console.log('Прощай! Завершаем процесс.');
  writeStream.close();
  process.exit();
});
