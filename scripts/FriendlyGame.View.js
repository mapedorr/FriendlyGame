/**
 * Aquí se controla el formulario en el que se ponen las cédulas y los nombres.
 * Las operaciones con la base de datos no ocurren aquí sino en scripts/FriendlyGame.Data.js.
 */
FriendlyGame.prototype.setupLogin = function() {
  var that = this;
  var loginEl = document.querySelector('#login')
  var initTestEl = document.querySelector('#init-test')

  // se limpian los campos del formulario de inscripción
  loginEl.setAttribute('class', '');
  document.querySelectorAll('.login-user').forEach(function (el) {
    var inputs = el.querySelectorAll('.login-input');
    inputs[0].value = '';
    /*inputs[1].value = '';*/
  });

  // se asigna el escuchador del clic para el botón que da inicio a la prueba
  initTestEl.addEventListener('click', function() {
    var incomplete_form = false;
    var wrong_cc = false;
    var ready_users = 0;

    // aquí se llena un arreglo con objetos que van a guardar temporalmente
    // los datos de cada jugador
    document.querySelectorAll('.login-user').forEach(function (el) {
      var inputs = el.querySelectorAll('.login-input');
      if (inputs[0].value /*&& inputs[1].value*/) {
        that.team.push({
          // name: inputs[0].value,
          cc: inputs[0].value
        });
      }
    });

    // se verifica que cada jugador haya puesto su nombre y un número de cédula
    that.team.forEach(function (member) {
      if (/*member.name ||*/ member.cc) {
        if (/*!member.name ||*/ !member.cc) {
          incomplete_form = true;
        }
      }
    });

    if (that.team.length === 0) {
      alert('Por favor rellena al menos un campo de texto');
      return;
    }

    // si alguno de los campos está incompleto, se muestra esta mierda

    /*
    if (incomplete_form) {
      alert('Cada jugador tiene que ingresar nombre y C.C. para poder continuar con la prueba');
      return;
    }
    */

    // se verifica que en el campo cédula hayan metido números y que sean de
    // 7 a 10 dígitos
    that.team.forEach(function (member) {
      var int_val = parseInt(member.cc);
      if (isNaN(int_val)) {
        wrong_cc = true;
      } else if (('' + int_val).length < 1 || ('' + int_val).length > 100) {
        wrong_cc = true;
      }
    });

    // si alguna cédula está mal, se muestra esta mierda
    /*
    if (wrong_cc) {
      alert('Hay un número de C.C. incorrecto');
      return;
    }
    */

    // se llama al método que va a verificar que cada cédula se cree en la
    // base de datos
    that.check_user(ready_users, loginEl);
  });
};

/**
 * en la base de datos se consulta primero si alguna de las cédulas usadas
 * ya existe, de ser así, no se vuelve a crear un registro sino que se usa
 * el que esté allá guardado.
 */
FriendlyGame.prototype.check_user = function (index, loginEl) {
  var that = this;

  // se llama al método que verifica si la cédula de uno de los campos ya está
  // en la base de datos. El código con eso lógica está en scripts/FriendlyGame.Data.js.
  this.getUser(that.team[index], function (uid, score) {
    that.team[index].uid = uid;
    if (score) {
      that.team[index].score = score;
    }

    if (index == that.team.length - 1) {
      // aquí se asume que se han creado o cargado todos los usuarios que
      // llenaron el formulario, así que se cambia la ruta de la página
      // para que vaya a /prueba
      that.gotoTest(loginEl);
    }
    else {
      that.check_user(++index, loginEl);
    }
  });
};

FriendlyGame.prototype.gotoTest = function(loginEl) {
  loginEl.setAttribute('class', 'hidden');
  this.router.navigate('/prueba');
};

/**
 * Aquí está la lógica que muestra las preguntas y las opciones de respuesta.
 * La cosa selecciona una pregunta de forma aleatoria y organiza las opciones
 * de forma aleatoria también.
 */
FriendlyGame.prototype.setupGame = function() {
  var that = this;
  var currentQuestion = 0;
  var questions = [
    {
      text: '01. Nuestra misión',
      options: [
        'Liderar e influir positivamente en el sector salud para contribuir al bienestar de individuos y comunidades. (correcta)', // 0
        'Ser una organización que sirve a pacientes y estudiantes.', // 1
        'Más y mejor salud.', // 2
      ],
      answer: 1
    },
    {
      text: '2. Visión: Al ____ la Fundación Santa Fe de Bogotá habrá generado más y mejor salud para Colombia y la región.',
      options: [
        '2025', // 0
        '2040', // 1
        '2050 (correcta)' // 2
      ],
      answer: 3
    },
    {
      text: '03. MÁS y MEJOR salud para Colombia y la región, es nuestra:',
      options: [
        'Visión', // 0
        'Mega Institucional (correcta)', // 1
        'Filosofía de servicio' // 2
      ],
      answer: 2
    },
    {
      text: '4.Cuál de las siguientes opciones NO contribuye a cumplir con nuestra mega institucional:',
      options: [
        'La entrega sistemática de desenlaces superiores, superando los más exi­gentes estándares internacionales en la atención y el cuidado continuo de la persona, su familia y cuidadores. ', // 0
        'El desarrollo de nuevos medicamentos para la población.', // 1
        'El alto nivel científico de su práctica reflejada en investigaciones de im­pacto divulgadas a través de publi­caciones en revistas indexadas.', // 2
        'La educación de profesionales de la salud que contribuyen con resulta­dos sobresalientes a mejorar la sa­lud y los servicios de atención en la FSFB, el país y la región.'
      ],
      answer: 2
    },
    {
      text: '5.Cuál de las siguientes opciones NO contribuye a cumplir con nuestra mega institucional:',
      options: [
        'La significativa contribución al forta­lecimiento de la salud poblacional en Colombia.', // 0
        ' El profundo sentido de pertenencia de sus colaboradores, quienes mani­fiestan satisfacción superior con las oportunidades de desarrollo perso­nal y profesional.', // 1
        'Ser el hospital más grande de Bogotá. (incorrecta esta no es una mega) ' // 2
        
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

  // se llena un arreglo con las posiciones de cada pregunta para luego ir
  // sacando una aleatoria
  questions.forEach(function (question, index) {
    available_questions.push(index);
  });

  this.team.forEach(function (member) {
    if (member.score >= 0) {
      members_with_score++;
    }
  });

  // aquí se verifica que los jugadores ya tengan un puntaje.
  // si todos tienen, entonces no se muestran las preguntas sino el mensaje
  // con el resultado. eso es lo que se ve en div#score
  if (members_with_score == this.team.length && that.score >= 0) {
    guiEl.setAttribute('class', 'hidden');
    document.querySelector('#score').setAttribute('class', '');
    document.querySelector('#score_value').textContent = that.score;
    return;
  }

  // aquí se controla lo que pasa cuando se selecciona una opción para la pregunta.
  // lo que hace es que le cambia el estilo a todas para que queden como no
  // seleccionadas y luego se le pone una clase a la que se seleccionó.
  document.querySelectorAll('.option').forEach(function(el, key) {
    el.addEventListener('click', function () {
      that.deselectAll();
      this.classList.add("selected");
      nextEl.removeAttribute('disabled');
      current_answer = parseInt(el.dataset.answer);
    });
  });

  // aquí es cuando se hace clic para pasar a la siguiente pregunta
  // el puntaje se va guardando en una variable temporal y sólo aumenta si
  // la respuesta fue correcta
  nextEl.addEventListener('click', function () {
    if (current_answer === questions[currentQuestion].answer) {
      score += 1;
    }

    if (available_questions.length > 0) {
      // si aún quedan preguntas, se llama al método que escoje una aleatoria
      // y la muestra en pantalla
      currentQuestion = that.showQuestion(questions, available_questions);
    }
    else {
      // una vez respuestas todas las preguntas, se guarda eso en la base de
      // datos.
      that.saveScore(score);
    }
  });

  // se llama a la función que escoje una pregunta aleatoria y que organiza
  // aleatoriamente las opciones de respuesta
  currentQuestion = this.showQuestion(questions, available_questions);
  guiEl.setAttribute('class', '');
};

/**
 * Este es el método que va mostrando una a una las preguntas. Lo que hace
 * es que selecciona una aleatoriamente y desorganiza sus opciones de respuesta.
 */
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

/**
 * Esto es lo que muestra los resultados de las pruebas cuando se navega a la
 * ruta /resultados.
 * Básicamente llena una <ul> con elementos <li> por cada registro encontrado
 * en la base de datos.
 */
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
            var textnode = document.createTextNode('> ' + change.doc.data().cc + ', ' + /*  change.doc.data().name + ', '  + */ change.doc.data().score);
            node.appendChild(textnode);  
            resultsListEl.appendChild(node);
          }
        }
      });
    });

  resultsEl.setAttribute('class', '');
};