angular.module('starter').controller('RoutePointsController', [
    "$scope", "$state", "$stateParams", "$ionicSideMenuDelegate", "RoutesService", "FavoriteService",
    function($scope, $state, $stateParams, $ionicSideMenuDelegate, RoutesService, FavoriteService) {
        $scope.RoutePoints = [{ Name: "Завантаження..." }];
        $scope.AppCaption = AppCaption;
        $scope.GetRoutePoints = function() {
            var lResult = [];
            for (var i = 0; i < $scope.RoutePoints.length; i++) {
                if ($scope.searchText ==null || $scope.searchText.length == 0)
                    lResult.push($scope.RoutePoints[i]);
                else if ($scope.RoutePoints[i].Name.toLowerCase().match($scope.searchText.toLowerCase())) {
                    lResult.push($scope.RoutePoints[i]);
                }
            }
            return lResult;
        };
        RoutesService.GetRoutePoints(
            $stateParams.Code,
            function(response) {
                $scope.RoutePoints = JSON.parse(response.data);
                if (!$scope.$$phase)
                    $scope.$apply();
            },
            function(fail) {
                $scope.RoutePoints = [{ Name: fail.statusText }];
                if (!$scope.$$phase)
                    $scope.$apply();
            });

        $scope.ChangeFavorites = function(gpsPlace) {
            if ($scope.IsInFavorite(gpsPlace)) {
                FavoriteService.RemoveFavorite(gpsPlace);
                gpsPlace.Favorite = false;
            } else
                gpsPlace.Favorite = FavoriteService.AddFavorite(gpsPlace);
        };
        $scope.GetFavoriteIcon = function (gpsPlace) {
            if ($scope.IsInFavorite(gpsPlace))
                return "-";
            else
                return "+";
        };
        $scope.IsInFavorite = function(routePoint) {
            return FavoriteService.Contain(routePoint);
        };

        $scope.ShowInfo = function(routePoint) {
            $state.go('app.result', { 'Code': routePoint.Code, 'Name': routePoint.Name });
        };
    }
]);