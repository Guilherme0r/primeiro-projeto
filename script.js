// Seletores de elementos
const wordInput = document.getElementById("word-input");
const fileUpload = document.getElementById("file-upload");
const wordOutput = document.getElementById("word-output");
const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const restartButton = document.getElementById("restart-button");
const speedSlider = document.getElementById("speed-slider");
const speedValue = document.getElementById("speed-value");
const addNewButton = document.getElementById("file-upload");
const backButton = document.getElementById("back-button");
const wordsReadElement = document.getElementById("words-read");

// Variáveis de estado
let wordList = [];
let wordInterval;
let currentWordIndex = 0;
let wordsRead = 0; 
let readingStartTime = 0;
let initialSpeed; 
let paused = false;

// Funções auxiliares
function processPDFContent(content) {
  const loadingTask = pdfjsLib.getDocument({ data: content });
  loadingTask.promise.then(function (pdf) {
    const maxPages = pdf.numPages;
    const countPromises = [];
    const startPage = parseInt(document.getElementById("start-page-input").value);

    for (let j = startPage; j <= maxPages; j++) {
      const page = pdf.getPage(j);
      countPromises.push(
        page.then(function (page) {
          const textContent = page.getTextContent();
          return textContent.then(function (text) {
            return text.items.map(function (s) {
              return s.str;
            }).join(' ');
          });
        })
      );
    }

    Promise.all(countPromises).then(function (texts) {
      const text = texts.join(' ');
      wordList = text.split(/\s+/);
      startInterval();
    });
  });
}

function startReadingWords() {
  if (wordInput.value) {
    wordList = wordInput.value.split(/\s+/);
    startInterval();
  } else {
    if (!fileUpload.files || !fileUpload.files[0]) {
      alert("Por favor, selecione um arquivo.");
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(fileUpload.files[0]);
    reader.onload = function (evt) {
      const content = evt.target.result;
      processPDFContent(content);
    }
    reader.onerror = function (evt) {
      alert("Erro ao ler o arquivo.");
    }
  }
}

function startInterval() {
  clearInterval(wordInterval);
  wordInterval = setInterval(showNextWord, 1000 / speedSlider.value);
  startButton.disabled = true;
}
// função updateProgressBar
function updateProgressBar() {
  const progressBar = document.getElementById("reading-progress");
  const progress = (currentWordIndex / wordList.length) * 100;
  progressBar.value = progress;
}

function showPreviousWord() { 
  if (currentWordIndex > 0) {
    currentWordIndex--;
    wordOutput.innerHTML = wordList[currentWordIndex];
  }
}
// Nova função para juntar os botões pause e continue
function togglePause() {
  paused = !paused;
  if (paused) {
    clearInterval(wordInterval);
    pauseButton.innerHTML = "Continuar";
  } else {
    startInterval();
    pauseButton.innerHTML = "Pausar";
  }
}
  // Função para atualizar estatísticas
function updateStats() {
  const wpmElement = document.getElementById("wpm");
  const timeSpentElement = document.getElementById("time-spent");

  const elapsedTime = (Date.now() - readingStartTime) / 1000 / 60; // Tempo decorrido em minutos
  const wordsPerMinute = Math.round(wordsRead / elapsedTime);
  wpmElement.innerHTML = wordsPerMinute;
  wordsReadElement.innerHTML = wordsRead;

  const minutesSpent = Math.floor(elapsedTime);
  const secondsSpent = Math.floor((elapsedTime - minutesSpent) * 60);
  timeSpentElement.innerHTML = `${minutesSpent} minutos e ${secondsSpent} segundos`;
}

// Função para reiniciar as estatísticas
function resetStats() {
  wordsRead = 0;
  readingStartTime = Date.now();
  updateStats();
  updateProgressBar(); // Reiniciar a barra de progresso
}

function showNextWord() {
  if (currentWordIndex >= wordList.length) {
    clearInterval(wordInterval);
    startButton.disabled = false;
    currentWordIndex = 0;
  } else {
    wordOutput.innerHTML = wordList[currentWordIndex];
    currentWordIndex++;
    wordsRead++; // Incrementar a contagem de palavras lidas
    updateStats(); // Atualizar as estatísticas na tela
    updateProgressBar(); // Atualizar a barra de progresso
  }
}


// Event Listeners
startButton.addEventListener("click", function () {
  startReadingWords();
  readingStartTime = Date.now(); // Iniciar o tempo de leitura
  initialSpeed = speedSlider.value;
  resetStats();
});
//Botão de pause - modificado.
pauseButton.addEventListener("click", function () {
  togglePause(wordInterval);
});

restartButton.addEventListener("click", function () {
  clearInterval(wordInterval);
  currentWordIndex = 0;
  startInterval();
  resetStats();
});

speedSlider.oninput = function () {
  speedValue.innerHTML = this.value;
  clearInterval(wordInterval);
  if (wordList.length) {
    startInterval();
  }
}

addNewButton.addEventListener("click", function () {
  wordInput.value = "";
  fileUpload.value = "";
  clearInterval(wordInterval);
  wordList = [];
  currentWordIndex = 0;
  wordOutput.innerHTML = "";
  resetStats();
});

backButton.addEventListener("click", function () {
  clearInterval(wordInterval);
  showPreviousWord();
});
