angular.module('starter').controller('RoutesController', [
    "$scope", "$state", "RoutesService", '$ionicScrollDelegate',
    function($scope, $state, RoutesService, $ionicScrollDelegate) {
        $scope.AppCaption = AppCaption;
        $scope.Routes = [{ Name: "Завантаження..." }];

        $scope.ResetScroll = function () {
            $ionicScrollDelegate.scrollTop();
        };
        $scope.ShowRoutePoints = function(route) {
            $state.go('app.routepoints', { 'Id': route.Id, 'Code': route.Code, 'Name': route.Name });
        };
        RoutesService.GetRoutes(
            function(response) {
                $scope.Routes = JSON.parse(response.data);
                if (!$scope.$$phase)
                    $scope.$apply();
            },
            function(fail) {
                $scope.Routes = [{ Name: fail.statusText }];
                if (!$scope.$$phase)
                    $scope.$apply();
            });
    }
]);