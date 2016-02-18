angular.module('starter.services', [])

    .factory('Chats', function () {
        // Might use a resource here that returns a JSON array

        // Some fake testing data
        var chats = [{
            id: 0,
            name: 'Ben Sparrow',
            lastText: 'You on your way?',
            face: 'img/ben.png'
        }, {
            id: 1,
            name: 'Max Lynx',
            lastText: 'Hey, it\'s me',
            face: 'img/max.png'
        }, {
            id: 2,
            name: 'Adam Bradleyson',
            lastText: 'I should buy a boat',
            face: 'img/adam.jpg'
        }, {
            id: 3,
            name: 'Perry Governor',
            lastText: 'Look at my mukluks!',
            face: 'img/perry.png'
        }, {
            id: 4,
            name: 'Mike Harrington',
            lastText: 'This is wicked good ice cream.',
            face: 'img/mike.png'
        }];

        return {
            all: function () {
                return chats;
            },
            remove: function (chat) {
                chats.splice(chats.indexOf(chat), 1);
            },
            get: function (chatId) {
                for (var i = 0; i < chats.length; i++) {
                    if (chats[i].id === parseInt(chatId)) {
                        return chats[i];
                    }
                }
                return null;
            }
        };
    })
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
