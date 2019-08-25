/**
 * Initializes the FriendlyGame app.
 */
function FriendlyGame() { // eslint-disable-line no-redeclare
  var that = this;

  firebase.firestore().clearPersistence()
    .then(function() {
      return firebase.auth().signInAnonymously();
    })
    .then(function() {
      that.initRouter();
    }).catch(function(err) {
      console.log(err);
    });
}

/**
 * Initializes the router for the FriendlyGame app.
 */
FriendlyGame.prototype.initRouter = function() {
  var that = this;

  this.router = new Navigo();

  this.router
    .on({
      '/': function() {
        // Esta es la ruta en la que se muestra el formulario de inscripción.
        // La sección que se renderiza es div#login
        that.initGame();
        that.setupLogin();
      }
    })
    .on({
      '/prueba': function() {
        // Una vez se han inscrito los jugadores, se cambia a esta ruta y se
        // renderiza la sección de las preguntas: div#gui
        // En esta misma ruta se renderiza div#score, pero eso se controla
        // desde scripts/FriendlyGame.View.js
        var members_with_id = 0;

        if (that.end_shown === true || !that.team) {
          // that.router.navigate('/');
          location.replace('/');
          return;
        }

        that.team.forEach(function (member) {
          if (member.uid) {
            members_with_id += 1;
          }
        });
        if (that.team.length === 0 || members_with_id != that.team.length) {
          alert('No hay suficientes miembros en el equipo.');
          that.router.navigate('/');
          return;
        }
        that.setupGame();
      }
    })
    .on({
      '/resultados': function() {
        // En esta ruta se muestran los resultados de las pruebas.
        // La sección que se renderiza es: div#results
        that.showResults();
      }
    })
    .resolve();
};

FriendlyGame.prototype.getFirebaseConfig = function() {
  return firebase.app().options;
};

FriendlyGame.prototype.randomIntFromInterval = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

FriendlyGame.prototype.initGame = function() {
  var respuestasEl = document.querySelector('#respuestas');
  
  this.team = [];
  this.score = undefined;
  this.team_answers = [];
  this.random_questions = true;
  this.end_shown = false;

  while (respuestasEl.firstChild) {
    respuestasEl.removeChild(respuestasEl.firstChild);
  }
  document.querySelector('#gui').classList.add('hidden');
  document.querySelector('#score').classList.add('hidden');
};

window.onload = function() {
  window.app = new FriendlyGame();
};