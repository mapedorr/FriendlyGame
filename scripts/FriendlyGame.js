/**
 * Initializes the FriendlyGame app.
 */
function FriendlyGame() { // eslint-disable-line no-redeclare
  var that = this;

  this.filters = {
    sort: 'id'
  };
  this.uid = null;
  this.score = 0;

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
        if (!that.uid) {
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

window.onload = function() {
  window.app = new FriendlyGame();
};