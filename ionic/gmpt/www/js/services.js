angular.module('starter.services', [])

.factory("UserInfo", function() {

  user = {
    "userName": "aakashpatel1",
    "email": "helloworld@gmail.com",
    "firstName": "Aakash",
    "lastName": "Patel",
    "auth": 0
  }

  return {
    get: function() {
      return user;
    },
    set: function(userData) {
      user.userName = userData.userName;
      user.email = userData.email;
      user.firstName = userData.firstName;
      user.lastName = userData.lastName;
    },
    setAuthToken: function(authToken) {
      user.auth = authToken;

      console.log("Set auth token: " + user.auth);
    },
    getAuthToken: function() {
      return user.auth;
    }

  }

})


.factory('Chats', function($http, UserInfo, Debug) {
  // Might use a resource here that returns a JSON array

  return {
    getGroupMessages: function(groupID) {

      return $http({

        method: "GET",
        url: Debug.getURL("/messages/" + groupID),
        headers: {
          "Content-Type": "application/json",
          "Authorization": UserInfo.getAuthToken()
        }
      }).then(function successCallback(response) {

        //console.log(response.data.messages);
        return response.data.messages;
    
      }, function errorCallback(response) {

        console.log(Debug.getURL("/messages/" + groupID));
        console.log(response);

        alert("Failed to get chat messages, please try again. " + JSON.stringify(response));

        return response;

      }).then(function receivedMessage(response) {

        console.log(response);
        return response;
      });
    },

    sendMessage: function(messageData, groupID) {

      return $http({
          method: "POST",
          url: Debug.getURL("/messages/" + groupID),
          data: messageData,
          headers: {
            "Content-Type": "application/json",
            "Authorization": UserInfo.getAuthToken()
          }
        }).then(function successCallback(response) {
          console.log("You sent a message!");
          console.log(response);
          return;
        }, function errorCallback(response) {
          console.log(response);
          console.log(messageData);
          alert("Message failed. " + response);
        });

    },
    getDefaultMessages: function() {
      return chats;
    }
  };
})

.factory("Groups", function($http) {

  groups = [];

  return {
    all: function() {

      return groups;
    },
    set: function(g) {
      groups = g;

      console.log("Set()" + groups);
    }
  };
})

.factory("Meetings", function($http) {

  meetings = [{
    date: "12/3/12",
    time_: "6:30PM",
    topic: "Mock Ups",
    meetingDescription: "lorum ipsum random description"
  }, {
    date: "12/7/9",
    time_: "8:30PM",
    topic: "Front End Design",
    meetingDescription: "lorum ipsum random description"
  }];

  editing = false;

  currInd = 0;
  //console.log("[1]currInd = ", currInd);
  return {
    all: function() {

      return meetings;
    },
    set: function(g) {
      meetings = g;

      console.log("Set()" + meetings);
    },
    get: function(index)
    {
      return meetings[index];
    },
    getCurr: function()
    {
      return currInd;
    },
    setCurr: function(index)
    {
      currInd = index;
      //console.log("[2]currInd = ", currInd);
    },
    getEdit: function()
    {
      return editing;
    },
    setEdit: function(bool)
    {
      editing = bool;
    }
  };
})



.factory("Debug", function() {

  debug = false;

  apiaryURL = "http://private-f963fa-gmpt.apiary-mock.com";

  prodURL = "http://52.37.56.8/gmpt/api/public";

  return {
    getURL: function(endpoint) {

      if (debug == true)
        return apiaryURL + endpoint;
      else 
        return prodURL + endpoint;
    }
  }

});


