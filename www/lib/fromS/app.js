
var app = angular.module('starter', ['ionic', 'app.services', 'ngCookies']);
app.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
});

app.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $stateProvider
        .state('app', {
            url: "/app",
            abstract: true,
            templateUrl: "Modules/Main/MainPage.html"
        })
        .state('app.simple', {
            url: "/simple",
            views: {
                'menuContent': {
                    templateUrl: "Modules/Smart/SmartPage.html",
                    controller: "SmartController"
                }
            },
            onEnter: function($stateParams) {
            }
        }).state('app.favorite', {
            url: "/favorite",
            views: {
                'menuContent': {
                    templateUrl: "Modules/Favorite/FavoritePage.html",
                    controller: "FavoriteController"
                }
            },
            onEnter: function($stateParams) {
            }
        }).state('app.places', {
            url: "/places",
            views: {
                'menuContent': {
                    templateUrl: "Modules/GPSPlaces/GPSPlacesPage.html",
                    controller: "GPSPlacesController"
                }
            },
            onEnter: function($stateParams) {
            }
        }).state('app.result', {
            url: "/result?Code&Name",
            views: {
                'menuContent': {
                    templateUrl: "Modules/Result/ResultPage.html",
                    controller: "ResultController"
                }
            },
            onEnter: function($stateParams) {
            }
        }).state('app.about', {
            url: "/about",
            views: {
                'menuContent': {
                    templateUrl: "Modules/About/AboutPage.html"
                }
            },
            onEnter: function($stateParams) {
            }
        }).state('app.routes', {
            url: "/routes",
            views: {
                'menuContent': {
                    templateUrl: "Modules/Routes/RoutesPage.html",
                    controller: "RoutesController"
                }
            },
            onEnter: function($stateParams) {
            }
        }).state('app.routepoints', {
            url: "/routepoints?code=Code",
            views: {
                'menuContent': {
                    templateUrl: "Modules/RoutePoints/RoutePointsPage.html",
                    controller: "RoutePointsController"
                }
            },
            onEnter: function($stateParams) {
            }
        })
        .state('app.map', {
            url: "/map",
            views: {
                'menuContent': {
                    templateUrl: "Modules/Map/MapPage.html",
                    controller: 'MapController'
                }
            },
            onEnter: function($stateParams) {
            }
        })
        .state('app.routemap', {
            url: "/routemap",
            views: {
                'menuContent': {
                    templateUrl: "Modules/RouteMap/RouteMapPage.html",
                    controller: 'RouteMapController'
                }
            },
            onEnter: function($stateParams) {
            }
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/simple');
});
   


