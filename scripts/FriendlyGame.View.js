
FriendlyGame.prototype.setupLogin = function() {
  var that = this;

  var loginEl = document.querySelector('#login')
  var nameEl = document.querySelector('#player-name')
  var ccEl = document.querySelector('#player-id')
  var initTestEl = document.querySelector('#init-test')
  var gotoTest = function () {
    // go to the test
    loginEl.setAttribute('class', 'hidden');
    that.router.navigate('/prueba');
  }

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

    // check if the player id is already in the database
    var collection = firebase.firestore().collection('players')
    var query = collection.where('cc', '==', cc)
      .onSnapshot(function (snapshot) {
        // cancel the snapshot listener
        query();

        if (!snapshot.size) {
          // create the player in the database
          collection.add({
            name: name,
            cc: cc,
            userId: firebase.auth().currentUser.uid
          }).then(function (new_document) {
            that.uid = new_document.id;
            gotoTest();
          });
          return;
        }

        snapshot.docChanges().forEach(function (result) {
          that.uid = result.doc.id;
          that.score = result.doc.data().score
          gotoTest();
        }, that);
      });
  });

  loginEl.setAttribute('class', '');
  nameEl.value = '';
  ccEl.value = '';
};

FriendlyGame.prototype.setupGame = function() {
  var that = this;
  var currentQuestion = 0;
  var questions = [
    '¿Qué le dijo un perro a una paloma?',
    '¿Cuánto es 2+2?',
    '¿Existe dios?',
    '¿Por qué la vida es tan dura?'
  ]
  var guiEl = document.querySelector('#gui');
  var nextEl = document.querySelector('#next');
  var score = 0;


  if (that.score) {
    guiEl.setAttribute('class', 'hidden');
    document.querySelector('#score').setAttribute('class', '');
    document.querySelector('#score_value').textContent = that.score;
    return;
  }

  document.querySelectorAll('.option').forEach(function(el) {
    el.addEventListener('click', function () {
      that.deselectAll();
      this.classList.add("selected");
      nextEl.removeAttribute('disabled');
    });
  });

  nextEl.addEventListener('click', function () {
    // TODO: check if the player's answer is correct
    score += 1;
    console.log('SCORE: ', score);
    if (currentQuestion < questions.length) {
      that.showQuestion(questions[currentQuestion++]);
    }
    else {
      // test finished, store the score
      that.saveScore(that.uid, score);
    }
  });

  this.showQuestion(questions[currentQuestion++]);
  guiEl.setAttribute('class', '');
};

FriendlyGame.prototype.showQuestion = function(question) {
  document.querySelector('#question').textContent = question;
  this.deselectAll();
};

FriendlyGame.prototype.deselectAll = function() {
  document.querySelectorAll('.option').forEach(function(el) {
    el.classList.remove('selected');
  });
};

FriendlyGame.prototype.saveScore = function (playerId, _score) {
  var that = this;
  var collectionRef = firebase.firestore().collection('players');
  var documentRef = collectionRef.doc(playerId);

  if (this.score) {
    return that.router.navigate(document.location.pathname + '?' + new Date().getTime());
  }

  documentRef.set({score: _score}, {merge: true}).then(function () {
    that.score = _score;
    that.router.navigate(document.location.pathname + '?' + new Date().getTime());
  })
};

FriendlyGame.prototype.showResults = function () {
  var that = this;
  var resultsEl = document.querySelector('#results');
  var resultsListEl = document.querySelector('#results-list');

  var query = firebase.firestore()
    .collection('players')
    .orderBy('cc', 'asc')
    .onSnapshot(function (snapshot) {
      if (!snapshot.size) {
        return render();
      }
  
      // while (resultsListEl.hasChildNodes()) {   
      //   resultsListEl.removeChild(resultsListEl.firstChild);
      // }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          if (change.doc.data().score) {
            var node = document.createElement("LI");
            var textnode = document.createTextNode('> ' + change.doc.data().cc + ', ' + change.doc.data().name + ', ' + change.doc.data().score);
            node.appendChild(textnode);  
            resultsListEl.appendChild(node);
          }
        }
      });
    });

  resultsEl.setAttribute('class', '');
};