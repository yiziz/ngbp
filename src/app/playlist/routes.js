function PlaylistConfig($stateProvider){
  $stateProvider
    .state('app.single', {
      url: "/playlists/:playlistId",
      views: {
        'menuContent': {
          templateUrl: "playlist/templates/playlist.tpl.html",
          controller: 'PlaylistCtrl'
        }
      }
    })
  ;
}

angular.module('playlist.routes', ['ui.router'])
  .config(['$stateProvider', PlaylistConfig])
;
