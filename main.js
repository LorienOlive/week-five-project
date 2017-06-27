const express = require('express')
const parseurl = require('parseurl')
const session = require('express-session')
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const mustacheExpress = require('mustache-express');
const fs = require('fs');
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");


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

//Generator Selects Random 4-8 Letter Word from Dictionary.//
//Generate the same number of blanks as the length of the word.//

var random = Math.random;
var blanks = [];
var secretWord = [];
var word;

var randomInteger = function(min, max) {
  return Math.floor(random() * (max - min + 1) + min);
};

var randomWord = function(words) {
  blanks = [];
  word = words[randomInteger(0, words.length - 1)];
  var validWord = word.split("");
  var wordLength = validWord.length;
  if (wordLength >= 4 && wordLength <= 6) {
    for (var i = 0; i < wordLength; i++) {
        blanks.push(" ");
        secretWord.push(validWord[i]);
    }
  } else {
    return randomWord(words);
  }
  return secretWord;
};


app.get('/', function (req, res) {
  lettersGuessed = [];
  blanks = [];
  secretWord = [];
  counter = 10;
  console.log(randomWord(words));
  res.render('index', {blanks: blanks});
})

//Match guesses against letters in the selected word//

var guess;
var lettersGuessed = [];
var counter = 10;
var finalWord;

function match(guess) {
  for (let i = 0; i < secretWord.length; i++) {
    if (secretWord[i] === guess) {
      blanks[i] = guess;
    }
  }
  lettersGuessed.push(guess);
  counter--;
  return blanks;
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

app.post("/", function (req, res) {
  var inputItem = req.body.guessLetter;
  req.checkBody("guessLetter", "Invalid Entry, Try Again.").notEmpty().len(1).isAlpha();
  var errors = req.validationErrors();
  if (errors) {
    res.status(500).send("Invalid Entry, Try Again.")
  } else if (counter > 0) {
    guess = inputItem[0] + "";
    match(guess);
    result(blanks);
    res.render('index', {blanks: blanks, lettersGuessed: lettersGuessed, counter: counter, notification: notification});
  }
});


app.listen(3000, function(){
  console.log("Successfully started express application!")
});
