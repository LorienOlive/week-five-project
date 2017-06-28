const express = require('express')
const parseurl = require('parseurl')
const session = require('express-session')
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const mustacheExpress = require('mustache-express');
const fs = require('fs');
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toUpperCase().split("\n");


const app = express();

app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator())
app.use(express.static('public'));

app.use(session({
  cookieName: "word",
  secret: 'no touch monkey',
  resave: false,
  saveUninitialized: true
}));

//Generator Selects Random Word from Dictionary.//
//Generate the same number of blanks as the length of the word.//

var random = Math.random;
var blanks = [];
var secretWord = [];
var word;
var counter = 10;

var randomInteger = function(min, max) {
  return Math.floor(random() * (max - min + 1) + min);
};

var easyMode = function(words) {
  word = words[randomInteger(0, words.length - 1)];
  var validWord = word.split("");
  var wordLength = validWord.length;
  if (wordLength >= 4 && wordLength <= 6) {
    for (var i = 0; i < wordLength; i++) {
        blanks.push(" ");
        secretWord.push(validWord[i].toUpperCase());
    }
  } else {
    return easyMode(words);
  }
  return secretWord;
};

var hardMode = function(words) {
  word = words[randomInteger(0, words.length - 1)];
  var validWord = word.split("");
  var wordLength = validWord.length;
  if (wordLength >= 7 && wordLength <= 9) {
    for (var i = 0; i < wordLength; i++) {
        blanks.push(" ");
        secretWord.push(validWord[i].toUpperCase());
    }
  } else {
    return hardMode(words);
  }
  return secretWord;
  counter = 12;
};

var crazyMode = function(words) {
  word = words[randomInteger(0, words.length - 1)];
  var validWord = word.split("");
  var wordLength = validWord.length;
  if (wordLength >= 10 && wordLength <= 12) {
    for (var i = 0; i < wordLength; i++) {
        blanks.push(" ");
        secretWord.push(validWord[i].toUpperCase());
    }
  } else {
    return crazyMode(words);
  }
  return secretWord;
  counter = 14
};

//Match guesses against letters in the selected word//

var guess;
var lettersGuessed = [];
var finalWord;

function match(guess) {
  for (let i = 0; i < secretWord.length; i++) {
    if (secretWord[i] === guess) {
      blanks[i] = guess;
  }
  lettersGuessed.push(guess);
  counter--;
  return blanks;
  }

}

//Function to assure that player does not repeat letters//

function repeat() {
  var sortLettersGuessed = lettersGuessed.slice().sort();
  for (let i = 0; i < lettersGuessed.length; i++) {
    if (sortLettersGuessed[i - 1] == sortLettersGuessed[i]) {
      lettersGuessed.pop(sortLettersGuessed[i]);
      counter++;
    }
  }
}

//Test to see if the player has won or lost//

var notification;

function result(blanks) {
  var finalWord = blanks.join(",");
  var origWord = secretWord.join(",")
  for (let i = 0; i < blanks.length; i++) {
    if (counter == 0 && blanks[i] == " ") {
      notification = "Game Over";
      return notification;
    } else if (finalWord === origWord) {
      notification = "Congratulations! You Win!";
      return notification;
    }
  }
}

app.get('/', function(req, res) {
    res.render('index')
})

app.post("/", function (req, res) {
  var mode = req.body.mode;
  console.log(mode);
  res.render('/playgame')
})

app.get('/playgame', function (req, res) {
  blanks;
  secretWord = [];
  lettersGuessed = [];
  counter = 10;
  notification = false;
  if (mode == "easymode") {
    easyMode(words);
  } else if (mode == "hardmode") {
    hardMode(words);
  } else if (mode == "crazymode"){
    crazyMode(words);
  }
  res.render('playgame', {blanks: blanks, counter: counter});
})

app.post()

app.post("/playgame", function (req, res) {
  var inputItem = req.body.guessLetter;
  req.checkBody("guessLetter", "Invalid Entry, Try Again.").notEmpty().len(1).isAlpha();
  var errors = req.validationErrors();
  if (errors) {
    res.status(500).send("Invalid Entry, Try Again.")
  } else if (counter > 0) {
    guess = inputItem[0].toUpperCase();
    match(guess);
    repeat();
    result(blanks);
    res.render('playgame', {blanks: blanks, lettersGuessed: lettersGuessed, counter: counter, notification: notification});
  }
});

//Create button that allows you to start a new game//

app.post("/newgame", function (req, res) {
  var newGameButton = req.body.newGame;
  res.redirect('/');
})

app.listen(3000, function(){
  console.log("Successfully started express application!")
});
