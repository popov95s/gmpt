angular.module('starter.controllers', [])

<<<<<<< HEAD
.controller('SettingsCtrl', function($scope, $state, $stateParams, $http, UserInfo, Debug) {

  $scope.isProfessor = false;
  $scope.email = "";

  $scope.addMember = function () 
  {

    var payload = {
      ProjectID: $stateParams.groupID,
      user: {
        email: $scope.email, 
        isProfessor: $scope.isProfessor
      }
    };

    console.log(payload);

    $http({
      method: "POST",
      url: Debug.getURL("/projects/add"),
      data: payload,
      headers: {
        "Content-Type": "application/json",
        "Authorization": UserInfo.getAuthToken()
      }
    }).then(function successCallback(response) {
      console.log("Add member success: ");
      console.log(response);

    }, function errorCallback(response) {
      console.log("Failed adding member: ");
      console.log(response);

    }).then(function (response) {

      $scope.isProfessor = false;
      $scope.email = "";
      document.getElementById('email_input').value = "";

    });
    
  }

  $scope.autoCompleteMeetingUpdate = function(input)
  {
    if(input && input.length >= 3) 
    {
      this.show_suggestions = true;
      //document.getElementById('autocomplete_list').style.visibility = "visible";
      var input_data = 
      {
        term: input
      }
      var success = false;
      $scope.input_suggestions = [];
      $http(
      {
        method: "POST",
        url: Debug.getURL("/autocomplete"),
        data: input_data,
        headers: 
        {
          "Content-Type": "application/json",
          "Authorization": UserInfo.getAuthToken()
        }
      }).then(function successCallback(response) 
      {
        console.log(response);
        success = true;
        return response;
      }, function errorCallback(response) 
      {
        console.log("auto complete 'fail': ");
        console.log(response);
        alert("Failed to post autocomplete");
        return null;
      }).then(function redirect(response) 
      {
        console.log("redirecting...");
        console.log(response);
        $scope.input_suggestions = response.data.suggestions;
        console.log("Input suggestions: " , $scope.input_suggestions);
      });
    }
    else
    {
      this.show_suggestions = false;
    }
  }

  $scope.selectEmail = function(selected_email)
  {
    $scope.email = selected_email;
    document.getElementById('email_input').value = selected_email.suggestion;
    $scope.email = selected_email.suggestion;
  }

})

.controller('AccountCtrl', function($scope, $state, $http, UserInfo, Debug) {

  $scope.logout = function () {
    $http({
      method: "GET",
      url:Debug.getURL("/logout"),
   headers: {
        "Content-Type": "application/json",
        "Authorization": UserInfo.getAuthToken()
      }    
    }).then(function successCallback(response) {
      console.log("Logging out. See you later!")
      $state.go("login");
    }, function errorCallback(response) {
      alert.log("Can't logout. You can never leave!");
        console.error;
    });
  };
})

.controller('TabCtrl', function($scope, $http, UserInfo, Debug) {

  $scope.$on ("$ionicView.enter", function() {

    $scope.groupID = 0;
    $scope.groupID = UserInfo.getActiveGroup();
    $scope.notifications = {};

    $http({
      method: "GET",
      url: Debug.getURL("/notifications/" + $scope.groupID),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': UserInfo.getAuthToken()
      }
    }).then(function successCallback(response) {

      console.log("Tab GET Notifications:");
      console.log(response);
      return response;

    }, function errorCallback(response) {

      return null;

    }).then(function(response) {

      var not = response.data.notifications;

      if (not.Meeting > 0) {
        $scope.notifications.Meeting = not.Meeting;
      }

      if (not.Message > 0) {
        $scope.notifications.Message = not.Message;
      }

    }); 
  });
})


.controller('StatsCtrl', function ($http, $scope, $stateParams, UserInfo, Debug) {

  $scope.stats  = {};

  $scope.$on("$ionicView.enter", function() {

    $http({
        method: "GET",
        url: Debug.getURL("/statistics/totals/" + $stateParams.groupID),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': UserInfo.getAuthToken()
        }
      }).then(function successCallback(response) {

        return response.data;

      }, function failureCallback(response) {

        console.log("Failed to get statistics.");
        console.log(response);

      }).then(function(response) {

        $scope.stats = response.Totals;

      });

    $http({
      method: "GET",
      url : Debug.getURL("/statistics/attendanceRate/" + $stateParams.groupID),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': UserInfo.getAuthToken()
      }
    }).then(function successCallback(response) {

      console.log(response);
      return response;

    }, function failureCallback(response) {
      //alert("Could not get member statistics");
    }).then(function (response) {

      $scope.stats.attRate = response.attendanceRate;

    });
  });
})


.controller('ChatsCtrl', function ($scope, $http, $stateParams, $interval, $animate, 
                                    UserInfo, Chats, GroupID, Debug) {

  GroupID.set($stateParams.groupID);
  $scope.chatsctrl = {};
  $scope.messages = [];
  $scope.readReceipts = {};
 
  $scope.chatsctrl.anonymous = false;

  var chatRefresh = $interval(function getMessages() {
    
    Chats.getGroupMessages($stateParams.groupID).then(function success(response) {

        $animate.enabled(false);
        console.log("Messages: ");
        console.log(response);
        $scope.messages = response.messages;
        $scope.readReceipts = response.readReceipts;

        $animate.enabled(true);

      }, function error(response) {
        console.log("Error");
      });

  }, 3000);

  $scope.$on("$ionicView.enter", function() {

      Chats.getGroupMessages($stateParams.groupID).then(function successCallback(response) {
        console.log(response);
      $scope.messages = response.messages;
      $scope.readReceipts = response.readReceipts;
      
    }, function errorCallback(response) {

      console.log(Debug.getURL("/chat/" + $stateParams.groupID));
      console.log(response);

      alert("Failed to get chat messages, please try again. " + response);

    });
  });

  $scope.$on("$ionicView.leave", function() {

    console.log("canceling");
    $interval.cancel(chatRefresh);

  });

  $scope.chatsctrl.toggleAnonymous = function() {
    if ($scope.chatsctrl.anonymous == true) {
      $scope.chatsctrl.anonymous = false;
    }
    else {
      $scope.chatsctrl.anonymous = true;
    }
  }

  $scope.chatsctrl.remove = function (chat) {
    Chats.remove(chat);
  };

  $scope.chatsctrl.report = function(messageID) {
    //console.log("Reported message " + messageID);
  };

  $scope.chatsctrl.send = function() {

    var m = { 
      //sender: UserInfo.get().user.userName,
      text: $scope.message.text,
      anonymous: $scope.chatsctrl.anonymous
    };

    Chats.sendMessage(JSON.stringify(m), $stateParams.groupID).then( function() {
      Chats.getGroupMessages($stateParams.groupID).then( function(response) {
        $scope.messages = response;
      }, function(response) {
        console.log("Error");
      });
      $scope.message.text = "";
    }, function() {
      console.log("Error in sending message");
    });
  };
})

.controller('LoginCtrl', function ($scope, $state, $http, UserInfo, Debug, $location) {

  $scope.logInfo = {};

  $scope.loginFail = false;

  $scope.login = function () {
    var data = $scope.logInfo;

    $http({
      method: "POST",
      url:Debug.getURL("/login"),
      data: data
    }).then(function successCallback(response) {
      return response;
    }, function errorCallback(response) {
      alert("Can't Login" +  JSON.stringify(response));
    }).then(function redirect(response) {

      if (UserInfo.login(response.data)) {

        $scope.go("/groups");
      }
      else {
        $scope.loginFail = true;
      }
    });

  }
   $scope.go = function (path) {
    $location.path(path);
  };
})

.controller('MeetingsCtrl', function($scope, $state, $http, $stateParams, ionicDatePicker, 
                                      UserInfo, Meetings, GroupID, Debug) {

  $scope.meetings = [];

  var datePickerObj = {
      callback: function (val) {  //Mandatory
        console.log('Return value from the datepicker popup is : ' + val, new Date(val));
        $scope.meetingDate = new Date(val);
      },
      from: new Date(2016, 1, 1), //Optional
      to: new Date(2020, 10, 30), //Optional
      inputDate: new Date(),      //Optional
      mondayFirst: true,          //Optional
      disableWeekdays: [0],       //Optional
      closeOnSelect: false,       //Optional
      templateType: 'popup'       //Optional
  };

  $scope.openPicker = function() {
    ionicDatePicker.openDatePicker(datePickerObj);
  }

  $scope.$on("$ionicView.enter", function() {

    $http({

      method: "GET",
      url: Debug.getURL("/meetings/" + GroupID.get()),
      responseType: "json",
      headers: {
        "Content-Type": "application/json",
        "Authorization": UserInfo.getAuthToken()
      }
    }).then(function successCallback(response) {

      console.log("Meetings for group " + GroupID.get() +": ");
      console.log(response.data);

      return response.data;

    }, function errorCallback(response) {

      console.log("ERROR CALLBACK");
      console.log(Debug.getURL("/meetings"));
      console.log(response);

      alert("Failed to load groups, please try again.");

    }).then(function(response) {

      Meetings.set(response);
      $scope.meetings = Meetings.all();
      //this.meetings = Meetings.all();

    });

    $http({
      method: "PUT",
      url: Debug.getURL("/notifications/" + GroupID.get() + "/Meeting"),
      headers: {
        "Content-Type": "application/json",
        "Authorization": UserInfo.getAuthToken()
      }
    }).then(function successCallback(response) {

      console.log("Updated Meetings notifications.");
      console.log(response);

    }, function errorCallback(response) {

      console.log("Failed to update Meetings notifications.");
      console.log(response);

    });

    $scope.meetings = Meetings.all();

  });

  $scope.meetingDetails = function(index)
  {

    Meetings.setCurr(index);
    $scope.current_Meeting = Meetings.get(Meetings.getCurr());
  }

  $scope.currentMeeting = function()
  {
    return Meetings.get(Meetings.getCurr());
  }

  $scope.confirmMeeting = function()
  {  
    console.log("confirmMeeting Called");
    if ($scope.meetingDate != "" && $scope.meetingDescription != "" && $scope.startTime != "" && $scope.endTime != "")
    {
      if(Meetings.getEdit() == false)
      {
        console.log("$scope.meetings: ");
        console.log($scope.meetings);
        console.log("Meetings: ");
        console.log(Meetings.all());
        $scope.meetings.push({'MeetingDate':$scope.meetingDate,
          'StartTime':$scope.startTime,'MeetingDescription':$scope.meetingDescription,
          'ProjectID':GroupID.get(), 'EndTime': $scope.endTime, 'LocationName': $scope.locationName});
        Meetings.set($scope.meetings);

      }
      
      else if(Meetings.getEdit() == true)
      {
        $scope.meetings[Meetings.getCurr()].MeetingDate = $scope.meetingDate;
        $scope.meetings[Meetings.getCurr()].StartTime = $scope.startTime;
        $scope.meetings[Meetings.getCurr()].MeetingDescription = $scope.meetingDescription;
        $scope.meetings[Meetings.getCurr()].EndTime = $scope.endTime;
        Meetings.set($scope.meetings);
      }
      
      console.log("at this point in time, weve clicked confirm meeting, lets see the scope variables: ");
      console.log("meetingDate v");
      console.log(this.meetingDate);
      console.log("startTime v");
      console.log(this.startTime);
      console.log("endTime v");
      console.log(this.endTime);
      console.log("locationName v");
      console.log(this.locationName);
      var new_meeting = 
        {
          ProjectID : GroupID.get(),
          MeetingDate : this.meetingDate,
          LocationName : this.locationName,
          EndTime : this.endTime,
          StartTime : this.startTime,
          MeetingDescription : this.meetingDescription
        }
        console.log("next is meeting object: ");
        console.log(new_meeting);
        $http({
      method: "POST",
      url: Debug.getURL("/meetings"),
      data: new_meeting,
      headers: {
        "Content-Type": "application/json",
        "Authorization": UserInfo.getAuthToken()
      }
    }).then(function successCallback(response) {

      return response;
    }, function errorCallback(response) {
      //console.log("Add meeting 'fail': ");
      //console.log(response);
      alert("Failed to add meeting");
      return null;
    }).then(function redirect(response) {
      console.log("redirecting RESPONSE:...");
      console.log(response);

      $state.go("group.meetings(UserInfo.getActiveGroup())");
    });
      $scope.meetingDate = "";
      $scope.startTime = "";
      $scope.endTime = "";
      $scope.meetingDescription = "";
      $scope.locationName = "";
}
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
  //Meetings.setCurr(1);
}

})

.controller('AddMeetingCtrl', function($scope, $state, $http, Debug) 
{

=======
.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  }
>>>>>>> 49418717eeb0872c668b38bc9db82a491ecc75a8
})

.controller ('GroupsCtrl', function($scope, $http, Groups, Debug) {

<<<<<<< HEAD
  $scope.activeMeeting = {active: false, id: null};

  $scope.$on("$ionicView.enter", function() {

    console.log(UserInfo.getAuthToken());
    
    $http({
=======
  $http({
>>>>>>> 49418717eeb0872c668b38bc9db82a491ecc75a8

        method: "GET",
        url: Debug.getURL("/groups"),
        responseType: "json"
      }).then(function successCallback(response) {

<<<<<<< HEAD
        console.log("Get projects with auth: " + UserInfo.getAuthToken());
        console.log(response.data);

        Groups.set(response.data.projects);
        $scope.groups = response.data.projects;

        $scope.activeMeeting = Groups.activeMeeting();

=======
        console.log(Debug.getURL("/groups"));
        console.log(response);
        groups = response.data;
        console.log(groups);

        Groups.set(groups);
        $scope.groups = groups;
    
>>>>>>> 49418717eeb0872c668b38bc9db82a491ecc75a8
      }, function errorCallback(response) {

        console.log(Debug.getURL("/groups"));
        console.log(response);

        alert("Failed to load groups, please try again.");

        return null;

<<<<<<< HEAD
    });

  }); 
=======
      });
>>>>>>> 49418717eeb0872c668b38bc9db82a491ecc75a8

    $scope.setGroup = function(id) {
      console.log("Setting group ID: " + id);
    UserInfo.setActiveGroup(id);

  }

  $scope.checkin = function() {

    $http({
      method: "POST",
      url: Debug.getURL("/attendance/" + $scope.activeMeeting.id),
      headers: {
        "Content-Type": "application/json",
        "Authorization": UserInfo.getAuthToken()
      }
    }).then(function successCallback(response) {
      console.log("Checking response:");
      console.log(response);
      return response;
    }, function errorCallback(response) {
      alert("Checkin failed");
      return null;
    }).then(function() {
      $scope.activeMeeting = {active: false, id: null};
    });

  };
  
  $scope.groups = Groups.all();
})

<<<<<<< HEAD
.controller('AddGroupCtrl', function ($scope, $ionicConfig, $state, $http, UserInfo, Debug) {
=======
.controller('AddGroupCtrl', function($scope, $state, $http, Debug) {
>>>>>>> 49418717eeb0872c668b38bc9db82a491ecc75a8

  $scope.show_suggestions = false;
  $scope.group = {};

<<<<<<< HEAD
  $scope.search = '';
  $scope.orderByAttribute = '';
  $scope.members = [];
  $scope.email = "";

  $scope.addMember = function () 
  {
    if (document.getElementById('email_input').value != ' ') {
      console.log("Adding email: " + document.getElementById('email_input').value);
      $scope.members.push({
        'email': document.getElementById('email_input').value,
        'isProfessor': this.isProfessor
      });
      $scope.email = ' ';
      $scope.isProfessor = false;
      //document.getElementById('email_input').value = "";
      this.show_suggestions = false;
      //document.getElementById('autocomplete_list').style.visibility = "hidden";
    }
  }

  $scope.removeItem = function (index) {
    $scope.members.splice(index, 1);
    $scope.members = $scope.members.filter(function (item) {
      return !item.done;
    })
  }

  $scope.addGroup = function () {

=======
  $scope.addGroup = function() {

    console.log($scope.group.groupName);
>>>>>>> 49418717eeb0872c668b38bc9db82a491ecc75a8
    var group = {
      groupName: $scope.group.groupName,
      description: $scope.group.groupDesc
    }

<<<<<<< HEAD
    group.users.push({email:UserInfo.get().email, isProfessor:false});

    console.log(JSON.stringify(group));

=======
>>>>>>> 49418717eeb0872c668b38bc9db82a491ecc75a8
    $http({
      method:"POST",
      url: Debug.getURL("/groups"),
      data: group
    }).then(function successCallback(response) {
<<<<<<< HEAD
      console.log("Adding Group...");
      console.log(response);
      return response;

    }, function errorCallback(response) {
      console.log("Add group 'fail': ");
      console.log(response);
      alert("Failed to add group");
      return null;
    }).then(function redirect(response) {

      $state.go("groups");
    });
  }
  $scope.autoCompleteMeetingUpdate = function(input)
  {
    if(input && input.length >= 3) 
    {
      this.show_suggestions = true;
      //document.getElementById('autocomplete_list').style.visibility = "visible";
      var input_data = 
      {
        term: input
      }
      var success = false;
      $scope.input_suggestions = [];
      $http(
      {
        method: "POST",
        url: Debug.getURL("/autocomplete"),
        data: input_data,
        headers: 
        {
          "Content-Type": "application/json",
          "Authorization": UserInfo.getAuthToken()
        }
      }).then(function successCallback(response) 
      {
        //console.log(response);
        success = true;
        return response;
      }, function errorCallback(response) 
      {
        console.log("auto complete 'fail': ");
        console.log(response);
        alert("Failed to post autocomplete");
        return null;
      }).then(function redirect(response) 
      {
        //console.log("redirecting...");
        //console.log(response);
        $scope.input_suggestions = response.data.suggestions;
        //console.log("Input suggestions: " , $scope.input_suggestions);
      });
    }
    else
    {
      this.show_suggestions = false;
    }
  }

  $scope.selectEmail = function(selected_email)
  {
    $scope.email = selected_email;
    document.getElementById('email_input').value = selected_email.suggestion;
    $scope.email = selected_email.suggestion;
  }
})


.controller('RegisterCtrl', function ($scope, $state, $http, Debug) {

  $scope.regInfo = {};

  $scope.register = function () {

    if ($scope.regInfo.password == $scope.regInfo.confPassword && $scope.regInfo.password.length > 5) {

      $http({
        method: "POST",
        url:Debug.getURL("/user"),
        data: $scope.regInfo
      }).then(function successCallback(response) {
        console.log("Successful Registration. Welcome to gmpt!")
        $state.go("login");
      }, function errorCallback(response) {
        alert.log("Couldn't Register");
      });

    }
  }
})


.controller('LogoutCtrl', function ($scope, $state, $http, UserInfo, Debug) {

  $scope.logout = function () {
    $http({
      method: "GET",
      url:Debug.getURL("/logout"),
   headers: {
        "Content-Type": "application/json",
        "Authorization": UserInfo.getAuthToken()
      }    
    }).then(function successCallback(response) {
      console.log("Logging out. See you later!")
      $state.go("login");
    }, function errorCallback(response) {
      alert.log("Can't logout. You can never leave!");
      console.error;
    });

  }
})

=======
      $state.go("groups");
    }, function errorCallback(response) {
      alert.log("Failed to add group");
    });
  }
  

});
>>>>>>> 49418717eeb0872c668b38bc9db82a491ecc75a8
