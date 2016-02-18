angular.module('starter').controller('ResultController', ["$scope", "$state", "$interval", "$timeout", "$ionicSideMenuDelegate", "$stateParams", "ResultService",
    function($scope, $state, $interval, $timeout, $ionicSideMenuDelegate, $stateParams, ResultService) {
        $scope.CallInfo = true;
        $scope.gpsLocationName = $stateParams.Name;
        $scope.gpsLocationInfos = [{ RouteName: "Завантаження....", TimeToPoint: 0 }];
        $scope.GetGpsLocationInfos = function() {
            var lResult = [];
            for (var i = 0; i < $scope.gpsLocationInfos.length; i++) {
                if ($scope.searchText == null || $scope.searchText.length == 0)
                    lResult.push($scope.gpsLocationInfos[i]);
                else if ($scope.gpsLocationInfos[i].RouteName.toLowerCase().match($scope.searchText.toLowerCase())) {
                    lResult.push($scope.gpsLocationInfos[i]);
                }
            }
            return lResult;
        };

        $scope.RefreshInfo = function() {
            if (!$scope.CallInfo) {
                $scope.RefreshInfoAsync();
                return;
            }
            ResultService.GetGPSPlaceInfo(
                $stateParams.Code,
                function(responseResult) {
                    $scope.gpsLocationInfos = JSON.parse(responseResult.data);
                    $scope.RefreshInfoAsync();
                }, function(failResult) {
                    $scope.gpsLocationInfos = [{ RouteName: failResult.statusText, TimeToPoint: 0 }];
                    $scope.RefreshInfoAsync();
                });
        };
        $scope.RefreshInfoAsync = function() {
            setTimeout(function() {
                $scope.RefreshInfo();
            }, 5000);
        };
        $scope.RefreshInfo();
        $scope.$on('$locationChangeStart', function(event, next, current) {
            $scope.CallInfo = next.match("#/app/result?");
        });
    }]);
//{{gpsLocationInfo.TimeToPoint | secondsToDateTime | date:'HH:mm:ss'}}
angular.module('starter').filter('secondsToDateTime', [function() {
    return function(seconds) {
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}]);

angular.module('starter').filter('secondsMinutes', [function() {
    return function(seconds) {
        return Math.round(seconds / 60);
    };
}]);

