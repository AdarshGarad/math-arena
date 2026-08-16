const $ = s => document.querySelector(s);

let difficulty = "easy";
let correct = 0;
let answered = 0;
let score = 0;
let streak = 0;
let bestStreak = 0;
let time = 60;
let timer = null;
let locked = false;
let answer = 0;

const bestKey = "mathArenaBest";

function show(id) {
  document.querySelectorAll(".screen").forEach(el => {
    el.classList.remove("active");
  });

  const screen = document.getElementById(id);
  if (screen) screen.classList.add("active");
}

function setDifficulty(level) {
  difficulty = level;

  document.querySelectorAll(".level").forEach(btn => {
    btn.classList.remove("active");
  });

  const selected = document.querySelector(`[data-d="${level}"]`);
  if (selected) selected.classList.add("active");
}

function generateQuestion() {
  let a, b;

  if (difficulty === "easy") {
    a = Math.floor(Math.random() * 20) + 1;
    b = Math.floor(Math.random() * 10) + 1;
  } 
  else if (difficulty === "medium") {
    a = Math.floor(Math.random() * 50) + 10;
    b = Math.floor(Math.random() * 20) + 2;
  } 
  else {
    a = Math.floor(Math.random() * 100) + 20;
    b = Math.floor(Math.random() * 30) + 5;
  }

  const type = Math.floor(Math.random() * 4);

  if (type === 0) {
    answer = a + b;
    $("#q").textContent = `${a} + ${b} = ?`;
  } 
  else if (type === 1) {
    if (a < b) [a, b] = [b, a];

    answer = a - b;
    $("#q").textContent = `${a} − ${b} = ?`;
  } 
  else if (type === 2) {
    const x = Math.floor(Math.random() * (difficulty === "easy" ? 10 : 20)) + 2;
    const y = Math.floor(Math.random() * (difficulty === "easy" ? 10 : 20)) + 2;

    answer = x * y;
    $("#q").textContent = `${x} × ${y} = ?`;
  } 
  else {
    const divisor = Math.floor(Math.random() * 10) + 2;
    const quotient = Math.floor(Math.random() * 15) + 2;

    answer = quotient;
    $("#q").textContent = `${divisor * quotient} ÷ ${divisor} = ?`;
  }

  $("#qn").textContent = `QUESTION ${answered + 1}`;
  $("#answer").value = "";
  $("#answer").focus();
}

function updateGameUI() {
  $("#timer").textContent = `${time}s`;
  $("#score").textContent = score;
  $("#streak").textContent = streak;

  const best = Number(localStorage.getItem(bestKey) || 0);
  $("#best").textContent = best;

  const progress = document.getElementById("progress");
  if (progress) {
    progress.style.width = `${((60 - time) / 60) * 100}%`;
  }
}

function start() {
  clearInterval(timer);

  correct = 0;
  answered = 0;
  score = 0;
  streak = 0;
  bestStreak = 0;
  time = 60;
  locked = false;

  show("game");
  updateGameUI();
  generateQuestion();

  timer = setInterval(() => {
    time--;
    updateGameUI();

    if (time <= 0) {
      endGame();
    }
  }, 1000);
}

function submitAnswer(event) {
  event.preventDefault();

  if (locked || time <= 0) return;

  const input = $("#answer");
  const value = Number(input.value);

  if (input.value.trim() === "") return;

  locked = true;
  answered++;

  if (value === answer) {
    correct++;
    streak++;
    bestStreak = Math.max(bestStreak, streak);
    score += 10 + streak;

    $("#feedback").textContent = "✓ CORRECT";
  } 
  else {
    streak = 0;
    $("#feedback").textContent = `✕ Correct answer: ${answer}`;
  }

  updateGameUI();

  setTimeout(() => {
    if (time > 0) {
      locked = false;
      $("#feedback").textContent = "";
      generateQuestion();
    }
  }, 350);
}

function endGame() {
  clearInterval(timer);
  timer = null;
  locked = true;

  const accuracy = answered
    ? Math.round((correct / answered) * 100)
    : 0;

  const oldBest = Number(localStorage.getItem(bestKey) || 0);

  if (score > oldBest) {
    localStorage.setItem(bestKey, score);
  }

  $("#final").textContent = score;
  $("#correct").textContent = correct;
  $("#answered").textContent = answered;
  $("#accuracy").textContent = `${accuracy}%`;
  $("#beststreak").textContent = bestStreak;

  if (score >= 200) {
    $("#title").textContent = "Excellent run.";
  } 
  else if (score >= 100) {
    $("#title").textContent = "Strong run.";
  } 
  else {
    $("#title").textContent = "Keep sharpening.";
  }

  show("result");
}

function quitGame() {
  clearInterval(timer);
  timer = null;
  show("home");
}

document.querySelectorAll(".level").forEach(button => {
  button.addEventListener("click", () => {
    setDifficulty(button.dataset.d);
  });
});

$("#start").addEventListener("click", start);

$("#form").addEventListener("submit", submitAnswer);

$("#quit").addEventListener("click", quitGame);

$("#again").addEventListener("click", start);

$("#home").addEventListener("click", () => {
  clearInterval(timer);
  timer = null;
  show("home");
});

setDifficulty("easy");
updateGameUI();