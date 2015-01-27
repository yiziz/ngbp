// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
function AppRun($ionicPlatform, $templateCache){
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
}

function AppCtrl($scope, $ionicModal, $timeout){
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('login/templates/login.tpl.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
}

function AppConfig($stateProvider, $urlRouterProvider){
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/playlists');
  $stateProvider
    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "menu/templates/menu.tpl.html",
      controller: 'AppCtrl'
    })
  ;
}

angular.module('starter', [
  // core
  // third parties
  'ionic',
  'famous.angular',
  'templates-app',
  //'templates-common',
  // user
  'browse',
  'playlist',
  'playlists',
  'search',
])
  .run(['$ionicPlatform', '$templateCache', AppRun])
  .controller('AppCtrl', ['$scope', '$ionicModal', '$timeout', AppCtrl])
  .config(['$stateProvider', '$urlRouterProvider', AppConfig])
;
