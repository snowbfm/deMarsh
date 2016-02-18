var services = angular.module('app.services');
services.factory(
    "RoutesService",
    function ($http) {
        var lService = {};
        
        lService.GetRoutePoints = function (routeCode, receiveResult, reciveFail) {
            var request = $http({
                method: 'GET',
                url: WebApiStr + "CompositeRoute/?code=" + routeCode,
                cache: true
            });
            return request.then(receiveResult, reciveFail);
        };
        
        lService.GetRouteCirclePath = function (routeCode, receiveResult, reciveFail) {
            var request = $http({
                method: 'GET',
                url: WebApiStr + "path/?code=" + routeCode,
                cache: true
            });
            return request.then(receiveResult, reciveFail);
        };
        
        lService.GetRoutes = function (receiveResult, reciveFail) {
            var request = $http({
                method: 'GET',
                url: WebApiStr + "CompositeRoute/",
                cache: true
            });
            return request.then(receiveResult, reciveFail);
        };
        return lService;
    }
);