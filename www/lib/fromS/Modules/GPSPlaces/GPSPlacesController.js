angular.module('starter').controller('GPSPlacesController', [
    "$scope", "$state", "$ionicSideMenuDelegate", "GPSPlacesService", "FavoriteService",
    function ($scope, $state, $ionicSideMenuDelegate, GPSPlacesService, FavoriteService) {
        $scope.AppCaption = AppCaption;
        $scope.searchText = '';
        $scope.gpsPlaces = [{ Name: "Завантаження..." }];
        $scope.GetGpsPlaces = function () {
            var lResult = [];
            if ($scope.searchText.length > 2) {
                for (var i = 0; i < $scope.gpsPlaces.length; i++) {
                    if ($scope.gpsPlaces[i].Name.toLowerCase().match($scope.searchText.toLowerCase())) {
                        lResult.push($scope.gpsPlaces[i]);
                    }
                }
            }
            return lResult;
        };
        GPSPlacesService.GetGPSPlaces(
            function(response) {
                $scope.gpsPlaces = JSON.parse(response.data);
            },
            function(fail) {
                $scope.gpsPlaces = [{ Name: fail.statusText }];
            });
        $scope.GetFavoriteIcon = function (gpsPlace) {
            if ($scope.IsInFavorite(gpsPlace))
                return "-";
            else
                return "+";
        };
        $scope.ChangeFavorites = function (gpsPlace) {
            if ($scope.IsInFavorite(gpsPlace)) {
                FavoriteService.RemoveFavorite(gpsPlace);
                gpsPlace.Favorite = false;
            } else
                gpsPlace.Favorite = FavoriteService.AddFavorite(gpsPlace);
            if (!$scope.$$phase)
                $scope.$apply();
        };
        
        $scope.IsInFavorite = function (gpsPlace) {
            return FavoriteService.Contain(gpsPlace);
        };

        $scope.ShowInfo = function (gpsPlace) {
            $state.go('app.result', { 'Code': gpsPlace.Code, 'Name': gpsPlace.Name });
        };
    }
]);