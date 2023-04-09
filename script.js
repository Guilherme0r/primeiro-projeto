var wordInput = document.getElementById("word-input");
var fileUpload = document.getElementById("file-upload");
var wordOutput = document.getElementById("word-output");
var startButton = document.getElementById("start-button");
var wordList = [];
var wordInterval;
var currentWordIndex = 0;

function startReadingWords() {
  if (wordInput.value) {
    wordList = wordInput.value.split(/\s+/);
  } else {
    if (!fileUpload.files || !fileUpload.files[0]) {
      alert("Por favor, selecione um arquivo.");
      return;
    }
    var reader = new FileReader();
    reader.readAsArrayBuffer(fileUpload.files[0]);
    reader.onload = function (evt) {
      var content = evt.target.result;
      var loadingTask = pdfjsLib.getDocument({data: content});
      loadingTask.promise.then(function(pdf) {
        var maxPages = pdf.numPages;
        var countPromises = [];
        // Iniciando a leitura do PDF a partir da página especificada pelo usuário
        var startPage = parseInt(document.getElementById("start-page-input").value);
        for (var j = startPage; j <= maxPages; j++) {
          var page = pdf.getPage(j);
          countPromises.push(page.then(function(page) {
            var textContent = page.getTextContent();
            return textContent.then(function(text){
              return text.items.map(function (s) { return s.str; }).join(' ');
            });
          }));
        }
        Promise.all(countPromises).then(function(texts) {
          var text = texts.join(' ');
          wordList = text.split(/\s+/);
          startInterval();
        });
      });
    }
    reader.onerror = function (evt) {
      alert("Erro ao ler o arquivo.");
    }
    return;
  }
  startInterval();
}

function startInterval() {
  clearInterval(wordInterval);
  wordInterval = setInterval(showNextWord, 1000 / speedSlider.value);

  function showNextWord() {
    if (currentWordIndex >= wordList.length) {
      clearInterval(wordInterval);
      startButton.disabled = false;
    } else {
      wordOutput.innerHTML = wordList[currentWordIndex];
      currentWordIndex++;
    }
  }
  startButton.disabled = true;
}

startButton.addEventListener("click", startReadingWords);

var pauseButton = document.getElementById("pause-button");
var resumeButton = document.getElementById("resume-button");
var restartButton = document.getElementById("restart-button");

pauseButton.addEventListener("click", function() {
  clearInterval(wordInterval);
});

resumeButton.addEventListener("click", function() {
  startInterval();
});

restartButton.addEventListener("click", function() {
  clearInterval(wordInterval);
  currentWordIndex = 0; // Reiniciando o índice da palavra atual ao clicar no botão "Reiniciar"
  startInterval();
});

var speedSlider = document.getElementById("speed-slider");
var speedValue = document.getElementById("speed-value");

speedSlider.oninput = function() {
  speedValue.innerHTML = this.value;
  clearInterval(wordInterval);
  if (wordList.length) {
    startInterval();
  }
}

// Adicionando a funcionalidade do botão "Adicionar novo"
var addNewButton = document.getElementById("file-upload");

addNewButton.addEventListener("click", function() {
  // Limpando o conteúdo do campo de entrada de texto e do campo de upload de arquivo
  wordInput.value = "";
  fileUpload.value = "";
  // Reiniciando a leitura das palavras
  clearInterval(wordInterval);
  wordList = [];
  currentWordIndex = 0;
  wordOutput.innerHTML = "";
});
