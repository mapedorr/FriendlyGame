FriendlyGame.prototype.setupLogin = function() {
  var that = this;
  var loginEl = document.querySelector('#login')
  var initTestEl = document.querySelector('#init-test')

  loginEl.setAttribute('class', '');
  document.querySelectorAll('.login-user').forEach(function (el) {
    var inputs = el.querySelectorAll('.login-input');
    inputs[0].value = '';
    inputs[1].value = '';
  });

  initTestEl.addEventListener('click', function() {
    // check if there's a name or CC without pair
    var incomplete_form = false;
    var wrong_cc = false;
    var ready_users = 0;
    var check_user = function (index) {
      // check if the player id is already in the database
      that.getUser(that.team[index], function (uid, score) {
        // store the data from the database
        that.team[ready_users].uid = uid;
        if (score) {
          that.team[ready_users].score = score;
        }

        if (ready_users == that.team.length - 1) {
          that.gotoTest(loginEl);
        }
        else {
          check_user(++ready_users);
        }
      });
    };

    // fill the array of team members
    document.querySelectorAll('.login-user').forEach(function (el) {
      var inputs = el.querySelectorAll('.login-input');
      if (inputs[0].value && inputs[1].value) {
        that.team.push({
          name: inputs[0].value,
          cc: inputs[1].value
        });
      }
    });

    that.team.forEach(function (member) {
      if (member.name || member.cc) {
        if (!member.name || !member.cc) {
          incomplete_form = true;
        }
      }
    });

    if (incomplete_form) {
      alert('Cada jugador tiene que ingresar nombre y C.C. para poder continuar con la prueba');
      return;
    }

    that.team.forEach(function (member) {
      var int_val = parseInt(member.cc);
      if (isNaN(int_val)) {
        wrong_cc = true;
      } else if (('' + int_val).length < 7 || ('' + int_val).length > 10) {
        wrong_cc = true;
      }
    });

    // check if the CC is correct
    if (wrong_cc) {
      alert('Hay un número de C.C. incorrecto');
      return;
    }

    // check if each user is already in the database or if it should be created
    check_user(ready_users);
  });
};

FriendlyGame.prototype.gotoTest = function(loginEl) {
  loginEl.setAttribute('class', 'hidden');
  this.router.navigate('/prueba');
};

FriendlyGame.prototype.setupGame = function() {
  var that = this;
  var currentQuestion = 0;
  var questions = [
    {
      text: '¿Qué le dijo un perro a una paloma?',
      options: [
        'Hola', // 0
        'Chao', // 1
        'Te voy a comer paloma', // 2
        'Soy un perro. ¿Y tú?' // 3
      ],
      answer: 2
    },
    {
      text: '¿Cuánto es 2 + 2?',
      options: [
        '4', // 0
        '2', // 1
        '5', // 2
        '0'  // 3
      ],
      answer: 0
    },
    {
      text: '¿Cuál es la mejor pizza del mundo?',
      options: [
        'Hawaiiana', // 0
        'Pollo con champiñones', // 1
        'Margarita', // 2
        'Marrano'  // 3
      ],
      answer: 2
    }
  ]
  var guiEl = document.querySelector('#gui');
  var nextEl = document.querySelector('#next');
  var score = 0;
  var members_with_score = 0;
  var current_answer = -1;
  var available_questions = [];
  questions.forEach(function (question, index) {
    available_questions.push(index);
  });

  // check if all team members have a score
  this.team.forEach(function (member) {
    if (member.score >= 0) {
      members_with_score++;
    }
  });
  if (members_with_score == this.team.length && that.score >= 0) {
    guiEl.setAttribute('class', 'hidden');
    document.querySelector('#score').setAttribute('class', '');
    document.querySelector('#score_value').textContent = that.score;
    return;
  }

  // register the event that will register the selection of each option
  document.querySelectorAll('.option').forEach(function(el, key) {
    el.addEventListener('click', function () {
      that.deselectAll();
      this.classList.add("selected");
      nextEl.removeAttribute('disabled');
      current_answer = parseInt(el.dataset.answer);
    });
  });

  nextEl.addEventListener('click', function () {
    if (current_answer === questions[currentQuestion].answer) {
      score += 1;
    }

    if (available_questions.length > 0) {
      currentQuestion = that.showQuestion(questions, available_questions);
    }
    else {
      // test finished, store the score
      that.saveScore(score);
    }
  });

  currentQuestion = this.showQuestion(questions, available_questions);
  guiEl.setAttribute('class', '');
};

FriendlyGame.prototype.showQuestion = function(questions, questions_indexes) {
  var that = this;
  // remove one random index
  var index = questions_indexes.splice(
    this.randomIntFromInterval(0, questions_indexes.length - 1),
    1
  )[0];
  var question = questions[index];
  var answer_indexes = [0, 1, 2, 3];
  document.querySelectorAll('.option').forEach(function(el, key) {
    var answer_value = answer_indexes.splice(
      that.randomIntFromInterval(0, answer_indexes.length - 1),
      1
    )[0];
    el.dataset.answer = answer_value;
    el.textContent = question.options[answer_value];
  });
  document.querySelector('#question').textContent = question.text;
  this.deselectAll();
  return index;
};

FriendlyGame.prototype.deselectAll = function() {
  document.querySelectorAll('.option').forEach(function(el) {
    el.classList.remove('selected');
  });
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

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          if (change.doc.data().score >= 0) {
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