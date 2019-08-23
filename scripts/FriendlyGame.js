/**
 * Initializes the FriendlyGame app.
 */
function FriendlyGame() { // eslint-disable-line no-redeclare
  var that = this;

  this.filters = {
    sort: 'id'
  };

  firebase.firestore().enablePersistence()
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
        that.updateQuery(that.filters);
      }
    })
    .on({
      '/prueba': function() {
        // TODO: render the test
      }
    })
    .on({
      '/resultados': function() {
        // TODO: render the test results
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