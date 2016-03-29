angular.module('starter.controllers', [])

.controller('StatsCtrl', function ($scope) {})

.controller('ChatsCtrl', function ($scope, $http, $stateParams, UserInfo, Chats, Debug) {
  

    $http({

        method: "GET",
        url: Debug.getURL("/chat/" + $stateParams.groupID),
        responseType: "json",
        headers: {
          'Content-Type': "json"
        }
      }).then(function successCallback(response) {

        console.log(response.data.messages);
        $scope.messages = response.data.messages;
    
      }, function errorCallback(response) {

        console.log(Debug.getURL("/chat/" + $stateParams.groupID));
        console.log(response);

        alert("Failed to get chat messages, please try again. " + response);

      });

    $scope.remove = function (chat) {
        Chats.remove(chat);
    };

    $scope.report = function(messageID) {
        console.log("Reported message " + messageID);
    };

    $scope.send = function() {

        messageData = { 
          sender: UserInfo.get().user.userName,
          text: $scope.message.text,
          anonymous: $scope.message.anonymous,
          flag: false,
          timeDate: Date.now()
        }

        $http({
            method: "POST",
            url: Debug.getURL("/chat/1"),
            data: messageData,
            contentType:"json"
        }).then(function successCallback(response) {
            console.log("You sent a message!")
        }, function errorCallback(response) {
            alert.log("Message failed. " + response);
        });
    };
})

.controller('LoginCtrl', function ($scope, $state, $http, UserInfo, Debug, $location) {

    $scope.logInfo = {};

    $scope.login = function () {

        console.log("LOGIN user: " + $scope.logInfo.userName + " - PW: " + $scope.logInfo.password);

        $http({
            method: "POST",
            url: Debug.getURL("/login"),
            data: $scope.logInfo
        }).then(function successCallback(response) {
            console.log("You logged in!")
            console.log(response);
            $state.go("groups");
        }, function errorCallback(response) {
            alert.log("Can't Login");
        });

    }

    $scope.go = function (path) {
        $location.path(path);
    };


})

.controller('MeetingsCtrl', function($scope, $state, $http, Meetings, Debug) {

/*
  $http({

        method: "GET",
        url: Debug.getURL("/meetings"),
        responseType: "json"
      }).then(function successCallback(response) {

        console.log(Debug.getURL("/meetings"));
        console.log(response);
        meetings = response.data;
        console.log(meetings);

        Meetings.set(meetings);
        $scope.meetings = meetings;
    
      }, function errorCallback(response) {

        console.log(Debug.getURL("/meetings"));
        console.log(response);

        alert("Failed to load groups, please try again.");

        return null;

      });
*/
  $scope.meetings = Meetings.all();
  //console.log("current index outside function: ", Meetings.getCurr());
  $scope.currentMeeting = Meetings.get(Meetings.getCurr());

  $scope.meetingDetails = function(index)
  {
    //console.log("INDEX: ", index);
    Meetings.setCurr(index);
    $scope.currentMeeting = Meetings.get(Meetings.getCurr());
    console.log("current index inside function: ", Meetings.getCurr());
    //console.log("current meeting: ", $scope.currentMeeting);
    //return $scope.currentMeeting;
    //$state.go('group.meetings');
    //return $scope.currentMeeting;
  }

  $scope.currentMeeting = function()
  {
    return Meetings.get(Meetings.getCurr());
  }

  $scope.confirmMeeting = function()
  {  
    if(this.date != "" && this.time_ != "" && this.topic != "" && this.desc != "")
    {
      if(Meetings.getEdit() == false)
      {
        $scope.meetings.push({'date':this.date,'time_':this.time_,'topic':this.topic,'desc':this.desc});
        Meetings.set($scope.meetings);
      }
      else if(Meetings.getEdit() == true)
      {
        console.log("lol");
        $scope.meetings[Meetings.getCurr()].topic = this.topic;
        $scope.meetings[Meetings.getCurr()].date = this.date;
        $scope.meetings[Meetings.getCurr()].time_ = this.time_;
        $scope.meetings[Meetings.getCurr()].desc = this.desc;
        Meetings.set($scope.meetings);
      }
      this.date = "";
      this.time_ = "";
      this.topic = "";
      this.desc = "";
      /*
      $scope.meetings = $scope.meetings.filter(function(item)
      {
        return !item.done;
      })*/
    }

    console.log($scope.meetings);
  }

  $scope.editMeeting = function(index)
  {
    Meetings.setEdit(true);
    Meetings.setCurr(index);
    $scope.currentMeeting = Meetings.get(Meetings.getCurr());
  }

  $scope.newMeeting = function()
  {
    Meetings.setEdit(false);
    Meetings.setCurr(999);
    $scope.currentMeeting = Meetings.get(Meetings.getCurr());
  }
})

.controller('AddMeetingCtrl', function($scope, $state, $http, Debug) 
{

})

.controller('GroupsCtrl', function ($scope, $http, Groups, Debug) {

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

.controller('AddGroupCtrl', function ($scope, $state, $http, Debug) {

    $scope.group = {};

    $scope.search = '';
    $scope.orderByAttribute = '';
    $scope.members = [
        {
            "_username": "henrysdev",
            "_email": "henrysdev@gmail.com",
            "done": false,
            "remove": false
        }
    ];
    $scope.addMember = function () {
        console.log("Clicked");
        console.log("username: ", this._username, "email: ", this._email);
        if (this._username != ' ' && this._email != ' ') {
            $scope.members.push({
                '_username': this._username,
                '_email': this._email,
                'done': false,
                'remove': false
            });
            this._username = ' ';
            this._email = ' ';
        }
    }

    $scope.removeItem = function (index) {
        $scope.members.splice(index, 1);
        console.log("delete member");
        $scope.members = $scope.members.filter(function (item) {
            return !item.done;
        })
    }

    $scope.addGroup = function () {

        console.log($scope.group.groupName);

        var group = {
            groupName: $scope.group.groupName,
            description: $scope.group.groupDesc
        }

        $http({
            method: "POST",
            url: Debug.getURL("/groups"),
            data: group
        }).then(function successCallback(response) {
            $state.go("groups");
        }, function errorCallback(response) {
            alert.log("Failed to add group");
        });
    }
})


.controller('RegisterCtrl', function ($scope, $state, $http, Debug) {

    $scope.regInfo = {};

    $scope.register = function () {

        console.log("UserName: " + $scope.regInfo.userName + " First Name: " + $scope.regInfo.firstName + " Last Name: " + $scope.regInfo.lastName + " Password: " + $scope.regInfo.password + " E-mail: " + $scope.regInfo.email);

        $http({
            method: "POST",
            url: Debug.getURL("/user"),
            data: $scope.logInfo
        }).then(function successCallback(response) {
            console.log("Successful Registration. Welcome to gmpt!")
            $state.go("login");
        }, function errorCallback(response) {
            alert.log("Couldn't Register");
        });

    }
});
