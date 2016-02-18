var services = angular.module('app.services');
services.factory(
    "GPSPlacesService",
    function($http) {
        // I get all of the friends in the remote collection.
        var lService = {};


        lService.GetGPSPlaces = function(receiveResult, reciveFail) {
            //todo: список зупинок 
            var headers = {
                'Access-Control-Allow-Origin': '*'
            };
            var request = $http({
                method: 'GET',
                headers: headers,
                url: WebApiStr + "stops",
                cache: true
            });
            return request.then(receiveResult, reciveFail);
        };

        return lService;
    }
);