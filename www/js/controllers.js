angular.module('starter.controllers', [])

    .controller('DashCtrl', function ($scope, $timeout, RoutesService, $cordovaGeolocation, CodesFactory) {

        $scope.$on('$ionicView.enter', function(e) {
            loadVehicles();
        });

        var maxVehicleRecords = 10;
        var timeoutInterval = 5000;

        var codeSelected = CodesFactory.getCode();

        var updateInfoBoxTimer = null;
        var getOwnPositionTimer = null;
        var loadVehiclesTimer = null;
        var ownMarkers = [];
        var stopMarkers = [];

        var ownX = null;
        var ownY = null;

        var vehicles = [];
        var stops = null;
        var vehiclesUpdateTime = null;

        $scope.vehiclesUpdateCount = null;
        $scope.fromLastUpdate = '-';

        var map = null;

        $scope.errorMsg = '';

        $scope.initApp = function () {
            $scope.errorMsg = '';
            ownX = null;
            ownY = null;

            for (j = 0; j <= vehicles.length - 1; j++) {
                for (i = 0; i <= vehicles[j].length - 1; i++) {
                    vehicles[j][i].marker.setMap(null);
                }
            }

            vehicles = [];
            stops = null;
            vehiclesUpdateTime = null;

            $scope.vehiclesUpdateCount = null;
            $scope.fromLastUpdate = '-';

            if (updateInfoBoxTimer !== null) {
                $timeout.cancel(updateInfoBoxTimer);
            }
            if (updateInfoBoxTimer !== null) {
                $timeout.cancel(updateInfoBoxTimer);
            }
            if (loadVehiclesTimer !== null) {
                $timeout.cancel(loadVehiclesTimer);
            }

            ownMarkers.forEach(function (o) {
                o.setMap(null);
            });

            stopMarkers.forEach(function (o) {
                o.setMap(null);
            });

            ownMarkers = [];
            stopMarkers = [];

            loadStops();
            //loadVehicles();
            getOwnPosition();
            updateInfoBox();

            if (map != null) {
                google.maps.event.trigger(map, 'resize');
            }

        };

        Array.prototype.max = function () {
            return Math.max.apply(null, this);
        };

        Array.prototype.min = function () {
            return Math.min.apply(null, this);
        };


        $scope.initApp();

        function updateInfoBox() {
            if (updateInfoBoxTimer !== null) {
                $timeout.cancel(updateInfoBoxTimer);
            }

            if (vehiclesUpdateTime !== null) {
                $scope.fromLastUpdate = Math.round(((new Date()).getTime() - vehiclesUpdateTime) / 1000);
            }
            updateInfoBoxTimer = $timeout(updateInfoBox, 1000);
        }

        function getOwnPosition() {
            var posOptions = {timeout: timeoutInterval, enableHighAccuracy: false};
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function (position) {
                    var lat = position.coords.latitude;
                    var long = position.coords.longitude;
                    ownY = lat;
                    ownX = long;
                }, function (err) {
                    // error
                });
            if (getOwnPositionTimer !== null) {
                $timeout.cancel(getOwnPositionTimer);
            }
            getOwnPositionTimer = $timeout(getOwnPosition, timeoutInterval);
        }

        var GetColor = function (indexValue, offset, transparency) {
            if (offset == undefined) {
                offset = 0;
            }
            return "hsla(" + (indexValue * 35) + ", " + (50 + offset).toString() + "%, " + transparency + "%, 1)";
        };

        function createIcon(colorIndex, angle, isSimple) {
            var scale;
            if (isSimple) {
                scale = 0.4;
            } else {
                scale = 0.8;
            }
            return {
                path: 'm26.261531,11.98125c0.617337,-0.598342 1.20775,-1.288151 1.727863,-1.907368l-15.584402,-0.284133l-2.137643,2.446922l-6.772099,-0.210161c0.848552,-1.114054 1.77811,-2.422766 2.467295,-3.405739l-2.451558,-3.304548l7.225678,0l1.470196,2.064705l15.911293,0l-1.973673,-2.060084c0.609102,-0.649211 1.510538,-1.515596 1.999536,-1.969854l5.351233,5.2505l-5.363404,5.331949l-1.870317,-1.95219l0.000002,0.000001z',
                fillColor: GetColor(colorIndex, -25, 50),
                strokeColor: "#000000",
                fillOpacity: 1,
                scale: scale,
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(23, 16),
                rotation: -angle
            };
        }

        function initIcons(vehicleArray) {
            vehicleArray.forEach(function (o, i) {
                o.directionIcon = createIcon(i, o.Angle, false);
                o.simpleIcon = createIcon(i, o.Angle, true);
            });
            return vehicleArray;
        }

        function loadVehicles() {
            var code = CodesFactory.getCode();
            if (code !== codeSelected) {
                codeSelected = code;

                $scope.initApp();
                return false;
            }

            RoutesService.GetGPSRouteInfo(
                codeSelected,
                function (response) {
                    var jsonText = response.data;
                    jsonText = jsonText.replace(/\\(.)/g, "$1");
                    jsonText = jsonText.substr(1, jsonText.length - 2);
                    var jsonObj = JSON.parse(jsonText);
                    jsonObj = jsonObj.filter(function (value) {
                        return ((value.X > 0) && (value.Y > 0));
                    });

                    jsonObj = initIcons(jsonObj);

                    vehicles.unshift(jsonObj);

                    vehiclesUpdateTime = (new Date()).getTime();
                    updateInfoBox();
                    $scope.vehiclesUpdateCount = jsonObj.length;


                    initMap();

                },
                function (fail) {
                    $scope.errorMsg = fail.statusText;
                }
            );

        }

        function loadStops() {
            RoutesService.GetRoutePoints(
                codeSelected,
                function (response) {
                    var jsonText = response.data;
                    jsonText = jsonText.replace(/\\(.)/g, "$1");
                    jsonText = jsonText.substr(1, jsonText.length - 2);
                    var jsonObj = JSON.parse(jsonText);
                    jsonObj = jsonObj.filter(function (value) {
                        return ((value.X > 0) && (value.Y > 0));
                    });
                    stops = jsonObj;
                    loadVehicles();
                },
                function (fail) {
                    $scope.errorMsg = fail.statusText;
                }
            );
        }

        function initMap() {
            var i, j;
            if (map == null) {
                var xArr = [];
                var yArr = [];
                var vehicle;
                if (vehicles.length > 0) {
                    for (i = 0; i <= vehicles[0].length - 1; i++) {
                        vehicle = vehicles[0][i];

                        xArr.push(vehicle.X);
                        yArr.push(vehicle.Y);
                    }
                }

                var myLatlng = new google.maps.LatLng((yArr.min() + yArr.max()) / 2, (xArr.min() + xArr.max()) / 2);
                var myOptions = {
                    zoom: 12,
                    center: myLatlng,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

            }

            if (stops !== null) {
                if (map !== null) {
                    if (stopMarkers.length == 0) {
                        var stop;
                        for (i = 0; i <= stops.length - 1; i++) {
                            stop = stops[i];

                            var stopIcon = {
                                path: 'M18,11H6V6H18M16.5,17A1.5,1.5 0 0,1 15,15.5A1.5,1.5 0 0,1 16.5,14A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 16.5,17M7.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,14A1.5,1.5 0 0,1 9,15.5A1.5,1.5 0 0,1 7.5,17M4,16C4,16.88 4.39,17.67 5,18.22V20A1,1 0 0,0 6,21H7A1,1 0 0,0 8,20V19H16V20A1,1 0 0,0 17,21H18A1,1 0 0,0 19,20V18.22C19.61,17.67 20,16.88 20,16V6C20,2.5 16.42,2 12,2C7.58,2 4,2.5 4,6V16Z',
                                fillColor: "#D32F2F",
                                strokeColor: "#D32F2F",
                                fillOpacity: 1,
                                scale: 0.2,
                                origin: new google.maps.Point(0, 0),
                                anchor: new google.maps.Point(12, 12)
                            };

                            stopMarkers[i] = new MarkerWithLabel({
                                zIndex: 3,
                                icon: stopIcon,
                                position: new google.maps.LatLng(stop.Y, stop.X),
                                map: map
                            });

                        }
                    }
                }

            }


            if ((ownY !== null) && (ownX !== null)) {
                if (map !== null) {
                    var ownIcon = {
                        path: 'm25.312174,23.704433c-1.133963,-2.048929 -2.522187,-3.708115 -3.914122,-4.868061c-1.623924,1.189641 -3.602328,1.913447 -5.7589,1.913447c-2.160283,0 -4.140543,-0.725662 -5.762612,-1.913447c-1.391935,1.159946 -2.780159,2.819133 -3.917834,4.868061c-2.639109,4.756707 -2.928632,9.635904 -0.64957,10.901637c1.020752,0.569765 2.091615,0.144761 3.197739,-0.920533c-0.194871,1.080142 -0.308082,2.251223 -0.308082,3.476126c0,5.441539 2.113886,9.849334 4.719588,9.849334c1.570103,0 2.347731,-1.605365 2.720769,-4.062595c0.373039,2.45723 1.150666,4.062595 2.715202,4.062595c2.609415,0 4.7233,-4.407795 4.7233,-9.849334c0,-1.224903 -0.113211,-2.395984 -0.311793,-3.476126c1.109836,1.065294 2.178843,1.490299 3.201451,0.920533c2.279062,-1.265733 1.983972,-6.14493 -0.655138,-10.901637zm-9.674878,-4.810528c4.383668,0 7.939599,-3.555931 7.939599,-7.941454s-3.555931,-7.941454 -7.939599,-7.941454c-4.385524,0 -7.94331,3.555931 -7.94331,7.941454s3.557786,7.941454 7.94331,7.941454z',
                        fillColor: "#D32F2F",
                        strokeColor: "#D32F2F",
                        fillOpacity: 1,
                        scale: 0.5,
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(12, 12)
                    };

                    ownMarkers.forEach(function (o) {
                        o.setMap(null);
                    });

                    ownMarkers.push(new MarkerWithLabel({
                        zIndex: 3,
                        icon: ownIcon,
                        position: new google.maps.LatLng(ownY, ownX),
                        map: map
                    }));
                }
            }

            for (j = Math.min(vehicles.length - 1, maxVehicleRecords - 1); j >= 0; j--) {
                for (i = 0; i <= vehicles[j].length - 1; i++) {
                    vehicle = vehicles[j][i];

                    var vehiclePos;
                    if (j + 1 < vehicles.length) {
                        var vehicleOld = vehicles[j + 1][i];
                        vehiclePos = new google.maps.LatLng(vehicleOld.Y, vehicleOld.X);
                    } else {
                        vehiclePos = new google.maps.LatLng(vehicle.Y, vehicle.X);
                    }

                    if (j == 0) {
                        vehicle.marker = new MarkerWithLabel({
                            zIndex: 3,
                            icon: vehicle.directionIcon,
                            position: vehiclePos,
                            map: map
                        });

                        if (j + 1 < vehicles.length) {
                            vehicle.marker.animateTo(new google.maps.LatLng(vehicle.Y, vehicle.X));
                        }

                    } else {
                        vehicle.marker.setIcon(vehicle.simpleIcon);
                    }


                }
            }

            for (j = vehicles.length - 1; j >= maxVehicleRecords; j--) {
                for (i = 0; i <= vehicles[j].length - 1; i++) {
                    vehicle = vehicles[j][i];
                    vehicle.marker.setMap(null);
                }
            }

            if (vehicles.length > maxVehicleRecords) {
                vehicles.length = maxVehicleRecords;
            }

            if (loadVehiclesTimer !== null) {
                $timeout.cancel(loadVehiclesTimer);
            }

            loadVehiclesTimer = $timeout(loadVehicles, timeoutInterval);

        }
    })

    .controller('ContactCtrl', function ($scope) {
        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //
        //$scope.$on('$ionicView.enter', function(e) {
        //});
    })

    .controller('SettingsCtrl', function ($scope, $state, RoutesService, $ionicScrollDelegate, CodesFactory) {
        $scope.routes = [{Name: "Завантаження..."}];

        RoutesService.GetRoutes(
            function (response) {
                var jsonText = response.data;
                var busArr = [];
                jsonText = jsonText.replace(/\\(.)/g, "$1");
                jsonText = jsonText.substr(1, jsonText.length - 2);
                $scope.routes = JSON.parse(jsonText);
            },
            function (fail) {
                $scope.routes = [{Name: fail.statusText}];
            }
        );

        $scope.setBusRoute = function (code) {
            CodesFactory.setCode(code);
        };
    });
