angular.module('starter.controllers', [])

.controller('StatsCtrl', function ($scope) {})

.controller('ChatsCtrl', function ($scope, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
        Chats.remove(chat);
    };
})

.controller('MessageCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.messageId);
})

.controller('LoginCtrl', function ($scope, $state, $http, Debug) {

    $scope.logInfo = {};

    $scope.login = function () {

        console.log("LOGIN user: " + $scope.logInfo.userName + " - PW: " + $scope.logInfo.password);

        $http({
            method: "POST",
            url: Debug.getURL("/login"),
            data: $scope.logInfo
        }).then(function successCallback(response) {
            console.log("You logged in!")
            $state.go("groups");
        }, function errorCallback(response) {
            alert.log("Can't Login");
        });

    }


})


.controller('MeetingsCtrl', function($scope, $state, $http, Debug) {

  $scope.meetings = [
  {"date":"12/3/12","time_":"6:30PM","topic":"Mock Ups","desc":"asdfasdasdf"},
  {"date":"12/4/12","time_":"4:30PM","topic":"Progress Check In","desc":"as32sdf"},
  {"date":"12/6/12","time_":"8:15AM","topic":"Front End Integration","desc":"asdfasdwaefaasdf"},
  ];

  console.log($scope.meetings);
  $scope.settings = {
    enableFriends: true
  }

  $scope.currentMeeting = $scope.meetings[0];

  $scope.meetingDetails = function(index)
  {
    //console.log("INDEX: ", index);
    $scope.currentMeeting = $scope.meetings[index];
    console.log("current meeting: ", $scope.currentMeeting);
    return $scope.currentMeeting;
  }

  $scope.confirmMeeting = function()
  {  
    /*
    var meeting = {
      topic: $scope.topic,
      desc: $scope.desc,
      date: $scope.date,
      time: $scope.time_
    }
    */
    $scope.meetings.push({'date':this.date,'time_':this.time_,'topic':this.topic,'desc':this.desc});
    console.log($scope.meetings);
  }
})

.controller('AddMeetingCtrl', function($scope, $state, $http, Debug) 
{

})

.controller ('GroupsCtrl', function($scope, $http, Groups, Debug) {

  $http({

        method: "GET",
        url: Debug.getURL("/groups"),
        responseType: "json"
      }).then(function successCallback(response) {

        console.log(Debug.getURL("/groups"));
        console.log(response);
        groups = response.data;
        console.log(groups);

        Groups.set(groups);
        $scope.groups = groups;
    
      }, function errorCallback(response) {

        console.log(Debug.getURL("/groups"));
        console.log(response);

        alert("Failed to load groups, please try again.");

        return null;

      });


  $scope.groups = Groups.all();
})

.controller('AddGroupCtrl', function($scope, $state, $http, Debug) {

    $scope.group = {};

    $scope.search = '';
    $scope.orderByAttribute = '';
    $scope.members = [
    {"_username":"henrysdev","_email":"henrysdev@gmail.com","done":false,"remove":false}
    ];
    $scope.addMember = function()
    {
      console.log("Clicked");
      console.log("username: ", this._username, "email: ", this._email);
      if(this._username !=' ' && this._email !=' ')
      {
        $scope.members.push({'_username':this._username,'_email':this._email,'done':false, 'remove':false});
        this._username = ' ';
        this._email = ' ';
      }
    }
    
    $scope.removeItem = function(index)
    {
      $scope.members.splice(index,1);
      console.log("delete member");
      $scope.members = $scope.members.filter(function(item)
      {
        return !item.done;
      })
    }

  $scope.addGroup = function() {

    console.log($scope.group.groupName);
    
    var group = {
      groupName: $scope.group.groupName,
      description: $scope.group.groupDesc
    }

    $http({
      method:"POST",
      url: Debug.getURL("/groups"),
      data: group
    }).then(function successCallback(response) {
      $state.go("groups");
    }, function errorCallback(response) {
      alert.log("Failed to add group");
    });
  }

});
