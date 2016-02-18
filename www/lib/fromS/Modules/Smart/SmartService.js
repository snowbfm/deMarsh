var services = angular.module('app.services');
services.factory(
    "SmartService",
    ["$http", "GPSPlacesService", function ($http, GPSPlacesService) {
        // I get all of the friends in the remote collection.
        var lService = {};
        /*
            [
                { Id: 1, Name: 'Скриня пр.', X: 24.5236326, Y: 49.646743 },
                { Id: 2, Name: 'Скриня зв.', X: 24.2356236, Y: 49.634566 }
            ]
        */
        lService.GetGPSPlaces = function(x, y, receiveResult, reciveFail) {
            //todo: список зупинок які знаходяться рядом з даними координатами
            GPSPlacesService.GetGPSPlaces(
                function(response) {
                    var lGpsPlaces = JSON.parse(response.data);
                    var lResult = [];
                    for (var i = 0; i < lGpsPlaces.length; i++) {
                        var lItem = lGpsPlaces[i];
                        var lDistance = GeoMath.GeoDistance(lItem, { X: x, Y: y });
                        if (lDistance < 200) {
                            lResult.push(lItem);
                        }
                    }
                    receiveResult(lResult);
                },
                reciveFail);
        };

        return lService;
    }]
);