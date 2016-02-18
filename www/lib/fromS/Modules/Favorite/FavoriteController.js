angular.module('starter').controller('FavoriteController', [
    "$scope", "$state", "$ionicSideMenuDelegate", "FavoriteService",
    function($scope, $state, $ionicSideMenuDelegate, FavoriteService) {
        $scope.AppCaption = AppCaption;
        $scope.gpsLocationFavorites = FavoriteService.GetGPSFavoritePlaces();

        $scope.RemoveFromFavorites = function (gpsPlace) {
            FavoriteService.RemoveFavorite(gpsPlace);
            $scope.gpsLocationFavorites = FavoriteService.GetGPSFavoritePlaces();
            if (!$scope.$$phase)
                $scope.$apply();
        };

        $scope.ShowInfo = function(gpsPlace) {
            $state.go('app.result', { 'Code': gpsPlace.Code, 'Name': gpsPlace.Name });
        };
    }
]);