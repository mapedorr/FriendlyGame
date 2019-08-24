/**
 * Initializes the FriendlyGame app.
 */
function FriendlyGame() { // eslint-disable-line no-redeclare
  var that = this;

  this.filters = {
    sort: 'id'
  };
  this.team = [];
  this.score = undefined;

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
        that.setupLogin();
      }
    })
    .on({
      '/prueba': function() {
        var members_with_id = 0;
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


window.onload = function() {
  window.app = new FriendlyGame();
};