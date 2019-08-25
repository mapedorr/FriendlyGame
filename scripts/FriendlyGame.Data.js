FriendlyGame.prototype.getUser = function(data, callback) {
  var that = this;
  var collection = firebase.firestore().collection('players');
  var query = collection.where('cc', '==', data.cc)
    .onSnapshot(function (snapshot) {
      query();

      if (!snapshot.size) {
        // create the player in the database
        that.addUser(data, callback);
        return;
      }

      snapshot.docChanges().forEach(function (result) {
        callback(result.doc.id, result.doc.data().score, result.doc.data().results);
      });
    });
};

FriendlyGame.prototype.addUser = function(data, callback) {
  var collection = firebase.firestore().collection('players');
  data.teamId = firebase.auth().currentUser.uid;
  collection.add(data).then(function (new_document) {
    callback(new_document.id);
  });
};

FriendlyGame.prototype.saveScore = function (_score) {
  var that = this;
  var collectionRef = firebase.firestore().collection('players');
  var promises = [];

  if (this.score >= 0) {
    return that.router.navigate(document.location.pathname + '?' + new Date().getTime());
  }

  this.team.forEach(function (member) {
    var documentRef = collectionRef.doc(member.uid);
    if (!member.score) {
      // store the score of the player only if her hasn't one
      var player_data = {
        score: _score,
        results: []
      };
      that.team_answers.forEach(function (data, index) {
        player_data.results.push('p' + (index + 1) + ': ' + data.r);
      });
      promises.push(documentRef.set(player_data, {merge: true}));
    }
  });

  Promise.all(promises).then(function () {
    that.team.forEach(function (member) {
      if (!member.score) member.score = _score;
    });
    that.score = _score;
    that.router.navigate(document.location.pathname + '?' + new Date().getTime());
  });
};

FriendlyGame.prototype.getScores = function() {};