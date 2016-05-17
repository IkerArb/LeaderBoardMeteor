console.log("Hello world");

PlayersList = new Mongo.Collection('players');

if(Meteor.isClient){
    Meteor.subscribe('thePlayers');
    console.log("Hello client");
    Template.leaderboard.helpers({
      'player': function(){
        var currentUserID = Meteor.userId();
        return PlayersList.find({createdBy: currentUserID},
                                {sort: {score: -1, name: 1}});
      },
      'metodo': function(){
        return "aqui estamos";
      },
      'selectedClass': function(){
        var playerID = this._id;
        var selectedPlayer = Session.get('selectedPlayer');
        if(playerID == selectedPlayer){
          return "selected";
        }
      },
      'selectedPlayer':function(){
        var selectedPlayer = Session.get('selectedPlayer');
        return PlayersList.findOne({_id: selectedPlayer});
      }
    });

    Template.leaderboard.events({
      'click .player': function(){
        var playerID = this._id;
        Session.set("selectedPlayer",playerID);
      },
      'click .increment': function(){
        var selectedPlayer = Session.get('selectedPlayer');
        Meteor.call('updateScore',selectedPlayer,5);
      },
      'click .decrement': function(){
        var selectedPlayer = Session.get('selectedPlayer');
        Meteor.call('updateScore',selectedPlayer,-5);
      },
      'click .remove': function(){
        var selectedPlayer = Session.get('selectedPlayer');
        Meteor.call('removePlayer',selectedPlayer);
      }
    });

    Template.addPlayerForm.events({
      'submit form': function(event){
        event.preventDefault();
        var playerNameVar = event.target.playerName.value;
        Meteor.call('createPlayer',playerNameVar);
        event.target.playerName.value = "";
      }
    });
}
if(Meteor.isServer){
    console.log("Hello server");
    Meteor.publish('thePlayers',function(){
      var currentUserID = this.userId;
      return PlayersList.find({createdBy: currentUserID});
    });

}

Meteor.methods({
  'createPlayer': function(playerNameVar){
    check(playerNameVar,String);
    var currentUserID = Meteor.userId();
    PlayersList.insert({
      name: playerNameVar,
      score: 0,
      createdBy: currentUserID
    });
  },
  'removePlayer': function(selectedPlayer){
    check(selectedPlayer,String);
    var currentUserID = Meteor.userId();
    if(currentUserID){
      PlayersList.remove({_id: selectedPlayer, createdBy: currentUserID});
    }
  },
  'updateScore': function(selectedPlayer,amount){
    check(selectedPlayer, String);
    check(amount, Number);
    var currentUserID = Meteor.userId();
    if(currentUserID){
      PlayersList.update({_id: selectedPlayer, createdBy: currentUserID},
                        {$inc:{score: amount}});
    }
  }
});
