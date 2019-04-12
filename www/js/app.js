angular.module('blescanner', ['ionic', 'ngCordova', 'blescanner.controllers', 'blescanner.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:  
  .state('tab.bleuuidentry', {
    url: '/bleuuidentry',
    views: {
      'tab-beacon': {
        templateUrl: 'templates/beacon-enter-uuid.html',
        controller: 'BeaconUUIDEntryCtrl'
      }
    }
  })
  .state('tab.blescanner', {
    url: '/blescanner/:scanuuid/:beaconType',
    views: {
      'tab-beacon': {
        templateUrl: 'templates/tab-blescanner.html',
        controller: 'BeaconsCtrl'
      }
    }
  })
  .state('tab.continuousscanner', {
    url: '/continuousscanner/:scanuuid/:beaconType',
    views: {
      'tab-beacon': {
        templateUrl: 'templates/tab-continuousscanner.html',
        controller: 'ContinuousBeaconScanCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/bleuuidentry');
});