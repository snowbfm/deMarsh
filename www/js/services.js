angular.module('starter.services', [])

    .factory('M10factory', function ($http) {
        var factory = {};

        factory.getVehicles = function (code) {
            return $http.get("http://cors.io/?u=http://82.207.107.126:13541/SimpleRIDE/LAD/SM.WebApi/api/RouteMonitoring/?code=" + code);
        };

        factory.getStops = function (code) {
            return $http.get("http://cors.io/?u=http://82.207.107.126:13541/SimpleRIDE/LAD/SM.WebApi/api/CompositeRoute/?code=" + code);
        };

        return factory;
    })

    .factory("RoutesService", function ($http) {
        AppCaption = "Маршрутні автобуси";
        WebApiStr = "http://cors.io/?u=http://82.207.107.126:13541/SimpleRIDE/LAD/SM.WebApi/api/";
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
