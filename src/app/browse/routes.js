function BrowseConfig($stateProvider){
  $stateProvider
    .state('app.browse', {
      url: "/browse",
      views: {
        'menuContent': {
          templateUrl: "browse/templates/browse.tpl.html"
        }
      }
    })
  ;
}

angular.module('browse.routes', ['ui.router'])
  .config(['$stateProvider', BrowseConfig])
;
