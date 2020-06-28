// Handle microphone input
window.addEventListener('DOMContentLoaded', () => {
  loadLanguages();
  // Initialize music player controls
  let music = document.getElementById('soundtrack');
  music.volume = 0.05;
  music.controls = true;

  const button = document.getElementById("button");
  const main = document.getElementsByTagName("main")[0];

  let listening = false;

  if (typeof SpeechRecognition !== "undefined") {
    recognition = new SpeechRecognition();
    recognition.lang = langList[currentLang]["code"];
    recognition.maxAlternatives = 0;

    const stop = () => {
      main.classList.remove("speaking");
      recognition.stop();
      button.textContent = "Start playing";
    };

    const start = () => {
      main.classList.add("speaking");
      recognition.start();
      button.hidden = true;
      music.play();
      init();
    };

    const onResult = (event) => {
      for (const res of event.results[event.results.length - 1]) {
        // Try to filter rapid voice results
        speechSynthesis.pause();
        let matchedWord = res.transcript.trim().split(' ');
        if (matchedWord.length != 0) {
          matchedWord = matchedWord.sort();
          // Find most used word
          let counts = {};
          let countsArr = [];
          for (let i = 0; i < matchedWord.length; i++) {
            counts[matchedWord[i]] = 1 + (counts[matchedWord[i]] || 0);
          }
          for (let command in counts) {
            countsArr.push([command, counts[command]]);
        }
        let newBig = 0;
        countsArr.sort(function(a, b) {
            return a[1] - b[1];
        });          
          for (let arr in countsArr) {
            if (countsArr[arr][1] > newBig) {
              newBig = arr;
            }
          }
          console.log('the final word is ' + countsArr[newBig][0])
          // Set most used word to matchedWord
          matchedWord = countsArr[newBig][0];
        }

        if (matchedWord == langList[currentLang]["voiceCommands"]["rotate"]) {
          //console.log("matched " + voiceCommands[0]);
          if (rightDown) {
            rotatePiece('right');
            lastmove = ['rotate', 'right'];
          } else if (leftDown) {
            rotatePiece('left');
            lastmove = ['rotate', 'left'];
          } else {
            console.log('no rotate direction specified');
          }
        } else if (matchedWord == langList[currentLang]["voiceCommands"]["move"]) {
          //console.log("matched " + voiceCommands[1])
          if (rightDown) {
            movePiece('right');
            lastmove = ['move', 'right'];
          } else if (leftDown) {
            movePiece('left');
            lastmove = ['move', 'left'];
          } else if (northDown) {
            movePiece('north');
            lastmove = ['move', 'north'];
          } else if (southDown) {
            movePiece('south');
            lastmove = ['move', 'south'];
          } else {
            console.log('no move direction specified');
          }
        } else if (matchedWord == langList[currentLang]["voiceCommands"]["drop"]) {
          //console.log("matched " + voiceCommands[2])
          cubeSpeed = -0.2;
        } else if (matchedWord == langList[currentLang]["voiceCommands"]["swap"]) {
          //console.log("matched " + voiceCommands[3]);
        } else if (matchedWord == langList[currentLang]["voiceCommands"]["spawn"]) {
          spawnPiece();
          //console.log("matched " + voiceCommands[4]);
        } else {
          console.log('No voice commands recognized');
        };
      }
    };
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.addEventListener("result", onResult);
    button.addEventListener("click", event => {
      const startMessage = document.getElementById("startText");
      startMessage.style.display = "none"
      const scoreText = document.getElementById("scoretext");
      const scoreVar = document.getElementById("score");
      scoreVar.style.display = "block"
      scoreText.style.display = "block"
      listening ? stop() : start();
      listening = !listening;
      document.getElementById("languagesDD").setAttribute('disabled', true)
      document.getElementById("languagesDDlabel").style.display = "none"
      document.getElementById("languagesDD").style.display = "none"
    });
  } else {
    button.remove();
    const message = document.getElementById("message");
    message.removeAttribute("hidden");
    message.setAttribute("aria-hidden", "false");
    const startMessage = document.getElementById("startText");
    startMessage.style.display = "none";
    document.getElementById("languagesDD").setAttribute('disabled', true);
  }
});