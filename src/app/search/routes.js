function SearchConfig($stateProvider){
  $stateProvider
    .state('app.search', {
      url: "/search",
      views: {
        'menuContent': {
          templateUrl: "search/templates/search.tpl.html"
        }
      }
    })
  ;
}

angular.module('search.routes', ['ui.router'])
  .config(['$stateProvider', SearchConfig])
;
