/**
 * A google map / GPS controller.
 */
app.controller('MapController', ['$scope', '$ionicPlatform', '$location', '$state', 'GPSPlacesService',
    function ($scope, $ionicPlatform, $location, $state, GPSPlacesService) {
        var mapOptions = {
            zoom: 13,
            center: DefaultLocation,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
                {
                    featureType: "all",
                    stylers: [{ visibility: "off" }]
                },
                {
                    featureType: "road",
                    stylers: [
                        { visibility: "on" }
                    ]
                }]
        };
        $scope.map = new google.maps.Map(document.getElementById('MapControlElement'), mapOptions);
        $scope.gotoLocation = function (lat, lon) {
            if ($scope.lat != lat || $scope.lon != lon) {
                $scope.currentLocation = { lat: lat, lon: lon };
                $scope.map.setCenter(new google.maps.LatLng(lat, lon));
            }
        };

        $ionicPlatform.ready(function() {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    var c = position.coords;
                    $scope.gotoLocation(c.latitude, c.longitude);
                }, function (e) {
                    $scope.gotoLocation(DefaultLocation.lat, DefaultLocation.lng);
                    console.warn("Error retrieving position " + e.code + " " + e.message);
                });
            GPSPlacesService.GetGPSPlaces(
                function(response) {
                    $scope.gpsPlaces = JSON.parse(response.data);
                    $scope.Markers = [];
                    for (var i = 0; i < $scope.gpsPlaces.length; i++) {
                        var lPoint = $scope.gpsPlaces[i];

                        lPoint.InfoWindow = new google.maps.InfoWindow({});
                        lPoint.Marker = new google.maps.Marker({
                            zIndex: 1,
                            icon: 'Content/map-marker-radius.png',
                            position: new google.maps.LatLng(lPoint.Y, lPoint.X),
                            map: $scope.map,
                            Point: lPoint
                        });

                        $scope.Markers.push(lPoint.Marker);

                        google.maps.event.addListener(lPoint.Marker, 'mouseover', function() {
                            this.Point.InfoWindow.setContent(this.Point.Name);
                            this.Point.InfoWindow.open($scope.map, this);
                        });
                        google.maps.event.addListener(lPoint.Marker, 'mouseout', function() {
                            this.Point.InfoWindow.close();
                        });
                        google.maps.event.addListener(lPoint.Marker, "click", function(e) {
                            $state.go('app.result', { 'Code': this.Point.Code, 'Name': this.Point.Name });
                        });
                    }
                    $scope.MarkerCluster = new MarkerClusterer($scope.map, $scope.Markers);
                },
                function (e) {
                    console.error("Error retrieving points " + e.code + " " + e.message);
                });
        });

    }]);
