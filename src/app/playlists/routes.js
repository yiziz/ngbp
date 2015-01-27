function PlaylistsConfig($stateProvider){
  $stateProvider
    .state('app.playlists', {
      url: "/playlists",
      views: {
        'menuContent': {
          templateUrl: "playlists/templates/playlists.tpl.html",
          controller: 'PlaylistsCtrl'
        }
      }
    })
  ;
}

angular.module('playlists.routes', ['ui.router'])
  .config(['$stateProvider', PlaylistsConfig])
;
