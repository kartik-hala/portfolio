const words = ["websites", "webapps", "apps", "things"];
const element = document.getElementById("changing-word");

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*{}[]<>?/\\|~";

let wordIndex = 0;
let iteration = 0;

// 👉 Show first word instantly
element.innerText = words[0];

// 👉 Start animation AFTER delay
setTimeout(() => {
  wordIndex = 1; // start from next word
  animateWord();
}, 3500); // delay before animation starts

function animateWord() {
  let currentWord = words[wordIndex];

  const interval = setInterval(() => {
    element.innerText = currentWord
      .split("")
      .map((letter, index) => {
        if (index < iteration) {
          return currentWord[index];
        }
        return letters[Math.floor(Math.random() * letters.length)];
      })
      .join("");

    if (iteration >= currentWord.length) {
      clearInterval(interval);

      setTimeout(() => {
        iteration = 0;
        wordIndex = (wordIndex + 1) % words.length;

        // skip first word ("website") after first run
        //if (wordIndex === 0) wordIndex = 1;

        animateWord();
      }, 1500);
    }

    iteration += 1 / 3;
  }, 50);
}
