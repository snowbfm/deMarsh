var services = angular.module('app.services');
services.factory(
    "ResultService",
    function ($http) {
        var lService = {};

        /*
            [
                { Id: 1, Name: 'A27', Duration: '02:45' },
                { Id: 2, Name: '16', Duration: '00:42' },
                { Id: 3, Name: '184a', Duration: '00:12' },
            ]
        */
        lService.GetGPSPlaceInfo = function (gpsPlaceCode, receiveResult, reciveFail) {
            //todo: статус по зупинці
            //Model{ Id, Name, Duration }
            //Id - RouteId
            //Name - RouteName
            //Duration - 
            var request = $http({
                method: 'GET',
                url: WebApiStr + "stops/?code=" + gpsPlaceCode,
                cache: false
            });
            return request.then(receiveResult, reciveFail);           
        };
        
        lService.GetGPSRouteInfo = function (routeCode, receiveResult, reciveFail) {
            //todo: статус по маршруту
            var request = $http({
                method: 'GET',
                url: WebApiStr + "RouteMonitoring/?code=" + routeCode,
                cache: false
            });
            return request.then(receiveResult, reciveFail);
        };
        return lService;
    }
);