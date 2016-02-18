angular.module('starter').controller('MainController', ["$scope", "$state", "$ionicSideMenuDelegate",
    function($scope, $state, $ionicSideMenuDelegate) {
        $scope.IsPC = function() {
            return !(ionic.Platform.isAndroid() || ionic.Platform.isIOS() || ionic.Platform.isWindowsPhone());
        };
        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };
    }]);