angular.module('blescanner.services', [])

.factory('Beacons', ['$rootScope', '$window', '$cordovaBeacon', function($rootScope, $window, $cordovaBeacon) {
  var beacons = [];
  var region = null;
  var mode = '';

  function scanForBeacons(uuid) {
    // ALWAYS clear out the local cache of beacons when we do a new scan
    beacons = [];

    if ($window.cordova) {
      region = $cordovaBeacon.createBeaconRegion('workforce-beacon', uuid, null, null, true);
      $cordovaBeacon.startRangingBeaconsInRegion(region);

      // after 5 seconds stop ranging and report results
      setTimeout(function() {
        $rootScope.$broadcast('Beacons:updatedBeaconsFound', beacons);
        $cordovaBeacon.stopRangingBeaconsInRegion(region);
      }, 5000);
    }
  }

  function startContinuousScan(uuid) {
    if ($window.cordova) {
      region = $cordovaBeacon.createBeaconRegion('workforce-beacon', uuid, null, null, true);
      $cordovaBeacon.startRangingBeaconsInRegion(region);
    }
  }

  function stopScan(uuid) {
    if ($window.cordova) {
      region = $cordovaBeacon.createBeaconRegion('workforce-beacon', uuid, null, null, true);
      $cordovaBeacon.stopRangingBeaconsInRegion(region);
    }
  }

  function updateOrAddBeacon(resultBeacon) {
    // see if we can find a match
    var beaconAlreadyExists = false;
    for (i = 0; i < beacons.length; i++) {
      var beaconToCheck = beacons[i];
      if (beaconToCheck.uuid == resultBeacon.uuid && beaconToCheck.major == resultBeacon.major && beaconToCheck.minor === resultBeacon.minor) {
        // match!
        beaconAlreadyExists = true;
        break;
      }
    }

    if (!beaconAlreadyExists) {
      var beaconToAdd = 
      {
        uuid: resultBeacon.uuid,
        major: resultBeacon.major,
        minor: resultBeacon.minor,
        proximity: resultBeacon.proximity,
        rssi: resultBeacon.rssi,
        tx: resultBeacon.tx,
        accuracy: resultBeacon.accuracy
      };
  
      beacons.push(beaconToAdd);
    }
  }

   $rootScope.$on('$cordovaBeacon:didRangeBeaconsInRegion', function(event, pluginResult) {    
     if ($window.cordova) {
      if (!pluginResult || !pluginResult.beacons) {
          alert('Invalid plugin result');
        }
        else if (mode === 'scan') {
          // loop through the result set and add in any new ones or update existing ones
          for (i = 0; i < pluginResult.beacons.length; i++) {
            var rawBeacon = pluginResult.beacons[i];
            updateOrAddBeacon(rawBeacon)
          }
        }
        else if (mode === 'continuousScan') {
          $rootScope.$broadcast('Beacons:newContinuousScannedBeaconsFound', pluginResult.beacons);
        }
      }
    });

  return {
    scan: function(uuid) {
      mode = 'scan';
      scanForBeacons(uuid);
    },
    continuousScan: function(uuid) {
      mode = 'continuousScan';
      startContinuousScan(uuid);
    },
    stopScan: function(uuid) {
      stopScan(uuid);
    }
  };
}]);