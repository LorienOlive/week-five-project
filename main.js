const express = require('express')
const parseurl = require('parseurl')
const session = require('express-session')
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const mustacheExpress = require('mustache-express');
const EventEmitter = require('events');
const fs = require('fs');
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");


const app = express();
app.use(express.static('public'))

app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator())
app.use(express.static('public'));


//Generator Selects Random 4-8 Letter Word from Dictionary.//
//Generate the same number of blanks as the length of the word.//

var random = Math.random;
var blanks = [];
var word;
var secretWord = [];
var wordLength;

var randomInteger = function(min, max) {
  return Math.floor(random() * (max - min + 1) + min);
};

var randomWord = function(words) {
  word = words[randomInteger(0, words.length - 1)];
  validWord = word.split("");
  wordLength = validWord.length;
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

// randomWord(words);
console.log(randomWord(words));

app.get('/', function (req, res) {
  res.render('index', {blanks: blanks});
})

var guessedLetter = [];
var matchedLetters = [];

function match(secretWord) {
  var matchedGuess = secretWord.find(function () {
    if (secretWord === guessedLetter[0]) {
      matchedLetters.push(guessedLetter[0]);
    } else {
      matchedLetters.push(" ");
    }
  })
}

app.post("/", function (req, res) {
  var inputItem = req.body.guessLetter;
  // req.checkBody("guessLetter", "Invalid Entry, Try Again.").notEmpty().len(1).isAlpha();
  var errors = req.validationErrors();
  if (errors) {
    res.status(500).send("Invalid Entry, Try Again.")
  } else {
    guessedLetter.push(inputItem);
    match(secretWord);
    res.render('index', {matches: matchedLetters});
  }
});






// app.use(session({
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true
// }))
//
// app.use(function (req, res, next) {
//   var views = req.session.views
//
//   if (!views) {
//     views = req.session.views = {}
//   }
//
//   // get the url pathname
//   var pathname = parseurl(req).pathname
//
//   // count the views
//   views[pathname] = (views[pathname] || 0) + 1
//
//   next()
// })
//
// app.get('/foo', function (req, res, next) {
//   res.send('you viewed this page ' + req.session.views['/foo'] + ' times')
// })
//
// app.get('/bar', function (req, res, next) {
//   res.send('you viewed this page ' + req.session.views['/bar'] + ' times')
// })
//
app.listen(3000, function(){
  console.log("Successfully started express application!")
});
//
// //Pseudo Code
//
// // 1) A way to randomly draw words from the dictionary
// // (see random text generator for ideas).
//
//
// // 2) Conditionals to set limits on the length of words.
// // 3) An input bar for users to enter their letters.
// // 4) Validation set on the input bar that rejects any input
// // that is less or more than one letter (and ensure that letters
// // are not chosen twice).
// // 5) A submit button.
// // 6) Conditionals that compare inputed letters to the letters
// // in the randomly chosen word.
// // 7) A counter that keeps track of the letters already guessed.
// // 8) An alert that notifies users of how many guesses they have left.
