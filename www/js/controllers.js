angular.module('blescanner.controllers', [])

.controller('BeaconUUIDEntryCtrl', function($scope, $state) {
  $scope.beaconConfigurations = [
    {
      name: "GAM - API Healthcare",
      uuid: "FE913213-B311-4A42-8C16-47FAEAC938EF"
    },
    {
      name: "Kontakt.io - Regular",
      uuid: "F7826DA6-4FA2-4E98-8024-BC5B71E0893E"
    },
    {
      name: "Kontakt.io - Secure Shuffling",
      uuid: "EF9D7835-B7B9-4ABF-9A02-C10AB55E777B"
    },
    {
      name: "BlueCats",
      uuid: "61687109-905F-4436-91F8-E602F514C96D"
    },
    {
      name: "Gimbal",
      uuid: "6E7222B3-ED60-499E-B429-445C35B06CA0"
    },
    {
      name: "Estimote",
      uuid: "E585A54C-8B03-4F5C-B507-7751A5E0D4C1"
    }
  ];

  $scope.beaconConfiguration = $scope.beaconConfigurations[0];

  $scope.setSelected = function(selectedBeaconConfiguration) {
    $scope.beaconConfiguration = selectedBeaconConfiguration;
  }

  $scope.scan = function() {
    $state.go("tab.blescanner", {scanuuid: $scope.beaconConfiguration.uuid, beaconType: $scope.beaconConfiguration.name});
  };

  $scope.continuousScan = function() {
    $state.go("tab.continuousscanner", {scanuuid: $scope.beaconConfiguration.uuid, beaconType: $scope.beaconConfiguration.name});
  };
})

.controller('BeaconsCtrl', function($scope, $rootScope, $stateParams, Beacons) {
  $scope.scanuuid = $stateParams.scanuuid;
  $scope.beaconType = $stateParams.beaconType;
  $scope.beacons = [];

  var intervalId;
  startLoading();

  // kick off a scan when we enter the controller
  Beacons.scan($scope.scanuuid);

  $scope.rescanBeacons = function() {
    startLoading();
    $scope.beacons = Beacons.scan($scope.scanuuid);
  };

  function startLoading() {
    var initialLoadingStatus = "Beacon ranging in progress.";
    $scope.loadingStatus = initialLoadingStatus;
    $scope.isLoading = true;

    // super-hacky loading/progress indicator :)
    intervalId = setInterval(function() {      
      var loadStatusLength = $scope.loadingStatus.length;
      if (loadStatusLength >= 27 && loadStatusLength <= 29) {
        $scope.loadingStatus = $scope.loadingStatus + '.';
      }
      else {
        $scope.loadingStatus = initialLoadingStatus;
      }

      $scope.$apply();
    }, 400);
  }

  function stopLoading() {
    $scope.loadingStatus = "";
    $scope.isLoading = false;
    clearInterval(intervalId);
    $scope.$apply();
  }

  $scope.$on('$destroy', function() {
    Beacons.stopScan($scope.uuid);
    deregisterListener();
  });

  var deregisterListener = $rootScope.$on('Beacons:updatedBeaconsFound', function(event, updatedBeacons) {
    // reassign the new beacons to the scope so the data-bound page refreshes
    $scope.beacons = updatedBeacons;    
    stopLoading();
  });
})

.controller('ContinuousBeaconScanCtrl', function($scope, $rootScope, $window, $stateParams, Beacons) {
  $scope.scanuuid = $stateParams.scanuuid;
  $scope.beaconType = $stateParams.beaconType;
  $scope.beacons = [];

  var startedLoadingAt = new Date();
  $scope.anyBeaconsFound = false;

  Beacons.continuousScan($scope.scanuuid);

  $scope.clockInOut = function() {
    if ($window.cordova) {
      var zone = new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2]
      var message = "Oops! Your local time zone of '" + zone + "' does not match the system time zone of LST (Lunar Standard Time).  Better luck next time!";
      navigator.notification.alert(message, alertCallback, "BLE Scanner", "Give Up");

      function alertCallback() {
        navigator.notification.alert("Thank you, your clocking has been destroyed.", null, "BLE Scanner", "OK");
      }
    }
  };

  $scope.$on('$destroy', function() {
    Beacons.stopScan($scope.uuid);
    deregisterListener();
  });

  var deregisterListener = $rootScope.$on('Beacons:newContinuousScannedBeaconsFound', function(event, updatedBeacons) {
    // reassign the new beacons to the scope so the data-bound page refreshes
    $scope.beacons = updatedBeacons;

    if ($scope.anyBeaconsFound === false && updatedBeacons.length > 0) {
      $scope.anyBeaconsFound = true;
      var finished = new Date();

      $scope.loadingTime = finished.getTime() - startedLoadingAt.getTime();
    }
  });
});