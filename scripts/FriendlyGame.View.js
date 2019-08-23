
FriendlyGame.prototype.setupLogin = function() {
  var that = this;

  var loginEl = document.querySelector('#login')
  var nameEl = document.querySelector('#player-name')
  var ccEl = document.querySelector('#player-id')
  var initTestEl = document.querySelector('#init-test')

  initTestEl.addEventListener('click', function() {
    // check if there's a name and a CC
    var name = nameEl.value;
    var cc = '' + parseInt(ccEl.value);
    if (!name || !cc) {
      alert('Necesita ingresar nombre y C.C. para poder hacer la prueba');
      return;
    }

    // check if the CC is correct
    if (cc.length < 7 || cc.length > 10) {
      alert('El número de C.C. es incorrecto');
      return;
    }

    // TODO: create the player in the database

    // render the UI for the game
    loginEl.setAttribute('class', 'hidden');
    that.setupGame();
  });
};

FriendlyGame.prototype.setupGame = function() {
  var currentQuestion = 0;
  var questions = [
    '¿Qué le dijo un perro a una paloma?',
    '¿Cuánto es 2+2?',
    '¿Existe dios?',
    '¿Por qué la vida es tan dura?'
  ]
  var guiEl = document.querySelector('#gui');
  var questionEl = document.querySelector('#question');
  var opAEl = document.querySelector('#op-1');
  var opBEl = document.querySelector('#op-2');
  var opCEl = document.querySelector('#op-3');
  var opDEl = document.querySelector('#op-4');
  var nextEl = document.querySelector('#next');

  guiEl.setAttribute('class', '');
  questionEl.textContent = questions[currentQuestion]
};