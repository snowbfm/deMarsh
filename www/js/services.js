angular.module('starter.services', [])

    .factory("RoutesService", function ($http) {
        var webApiStr = "http://cors.io/?u=http://82.207.107.126:13541/SimpleRIDE/LAD/SM.WebApi/api/";
        var lService = {};

        lService.GetRoutePoints = function (routeCode, receiveResult, reciveFail) {
            var request = $http({
                method: 'GET',
                url: webApiStr + "CompositeRoute/?code=" + routeCode,
                cache: true
            });
            return request.then(receiveResult, reciveFail);
        };

        lService.GetGPSRouteInfo = function (routeCode, receiveResult, reciveFail) {
            var request = $http({
                method: 'GET',
                url: webApiStr + "RouteMonitoring/?code=" + routeCode,
                cache: false
            });
            return request.then(receiveResult, reciveFail);
        };

        lService.GetRoutes = function (receiveResult, reciveFail) {
            var request = $http({
                method: 'GET',
                url: webApiStr + "CompositeRoute/",
                cache: true
            });
            return request.then(receiveResult, reciveFail);
        };
        return lService;
    })

    .factory('CodesFactory', function () {
        var factory = {};
        var codeSelected = "";

        factory.setCode = function (code) {
            codeSelected = code;
        };

        factory.getCode = function () {
            if(codeSelected == ""){
                return "C2|712985";
            }
            return codeSelected;
        };

        return factory;
    });
