angular.module('starter').controller('SmartController', ["$scope", "$state", "$ionicSideMenuDelegate", "SmartService", "FavoriteService", "GPSPlacesService",
    function ($scope, $state, $ionicSideMenuDelegate, SmartService, FavoriteService, GPSPlacesService) {
        $scope.searchText = '';
        $scope.favoritesPosition = FavoriteService.GetGPSFavoritePlaces();
        
        $scope.AppCaption = AppCaption;
        $scope.SmartService = SmartService;
        $scope.ClearSearch = function () {
            $scope.searchText = '';
        };
        $scope.GetResultGpsLocations = function() {
            if ($scope.searchText == null || $scope.searchText.length < 2)
                return [];

            var lResult = [];
            for (var i = 0; i < $scope.gpsLocations.length; i++) {
                if ($scope.gpsLocations[i].Name.toLowerCase().match($scope.searchText.toLowerCase())) {
                    lResult.push($scope.gpsLocations[i]);
                }
            }
            return lResult;
        };
        $scope.GetGpsLocationsAroundMe = function() {
            return $scope.gpsLocationsAroundMe;
        };
        $scope.GetGPSLocations = function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    $scope.currentLocation = { lat: position.coords.latitude, lon: position.coords.longitude };
                    $scope.currentLocationMsg = "Довгота: " + position.coords.latitude + " Широта: " + position.coords.longitude;
                    $scope.gpsLocationsAroundMe = [{ Name: "Завантаження..." }];
                    $scope.SmartService.GetGPSPlaces(
                        position.coords.longitude,
                        position.coords.latitude,
                        function(responseResult) {
                            if (responseResult == null)
                                $scope.gpsLocationsAroundMe = [];
                            else
                                $scope.gpsLocationsAroundMe = responseResult;
                            if (!$scope.$$phase)
                                $scope.$apply();
                        },
                        function(responseFail) {
                            $scope.gpsLocationsAroundMe = [{ Name: responseFail.statusText }];
                            if (!$scope.$$phase)
                                $scope.$apply();
                        });
                });
            } else {
                $scope.currentLocationMsg = "Geolocation is not supported by this browser.";
            }
        };
        $scope.GetGpsLocationFavorites = function () {
            return $scope.favoritesPosition;
        };
        $scope.AddToFavorites = function (gpsPlace) {
            gpsPlace.Favorite = FavoriteService.AddFavorite(gpsPlace);
        };
        $scope.IsInFavorite = function(gpsPlace) {
            return FavoriteService.Contain(gpsPlace);
        };

        $scope.SelectFromList = function() {
            $state.go('app.places');
        };

        $scope.SelectOnMap = function() {
            $state.go('app.map');
        };

        $scope.ShowInfo = function(gpsPlace) {
            $state.go('app.result', { 'Code': gpsPlace.Code, 'Name': gpsPlace.Name });
        };
        $scope.GetFavoriteIcon = function(gpsPlace) {
            if ($scope.IsInFavorite(gpsPlace))
                return "-";
            else
                return "+";
        };
        $scope.ChangeFavorites = function(gpsPlace) {
            if ($scope.IsInFavorite(gpsPlace)) {
                FavoriteService.RemoveFavorite(gpsPlace);

                var i = $scope.favoritesPosition.indexOf(gpsPlace);
                if (i != -1) {
                    $scope.favoritesPosition.splice(i, 1);
                }

                gpsPlace.Favorite = false;
            } else {
                gpsPlace.Favorite = FavoriteService.AddFavorite(gpsPlace);
                $scope.favoritesPosition.push(gpsPlace);
            }
            if (!$scope.$$phase)
                $scope.$apply();
        };
        $scope.RemoveFromFavorites = function (gpsPlace) {
            FavoriteService.RemoveFavorite(gpsPlace);
            var i = $scope.favoritesPosition.indexOf(gpsPlace);
            if (i != -1) {
                $scope.favoritesPosition.splice(i, 1);
            }
            if (!$scope.$$phase)
                $scope.$apply();
        };
        $scope.GetGPSLocations();
        GPSPlacesService.GetGPSPlaces(
            function(response) {
                $scope.gpsLocations = JSON.parse(response.data);
            },
            function(fail) {
                $scope.gpsLocations = [{ Name: fail.statusText }];
            });
        
    }]);