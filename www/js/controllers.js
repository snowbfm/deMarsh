angular.module('starter.controllers', [])

    .controller('DashCtrl', function ($scope, M10factory, $cordovaGeolocation) {
        $scope.ownX = null;
        $scope.ownY = null;
        $scope.ownMarkers = [];




        /*        var watchOptions = {
         timeout: 3000,
         enableHighAccuracy: false // may cause errors if true
         };

         var watch = $cordovaGeolocation.watchPosition(watchOptions);
         watch.then(
         null,
         function (err) {
         // error
         },
         function (position) {
         var lat = position.coords.latitude;
         var long = position.coords.longitude;

         $scope.ownY = lat;
         $scope.ownX = long;
         console.log('Y: ' + $scope.ownY);
         console.log('X: ' + $scope.ownX);

         });
         */

        /*        watch.clearWatch();
         // OR
         $cordovaGeolocation.clearWatch(watch)
         .then(function (result) {
         // success
         }, function (error) {
         // error
         });

         */
        Array.prototype.max = function () {
            return Math.max.apply(null, this);
        };

        Array.prototype.min = function () {
            return Math.min.apply(null, this);
        };

        $scope.test = false;
        $scope.map = null;
        $scope.vehicles = [];
        $scope.stops = null;
        $scope.vehicleMarkers = [];
        var stopMarkers = null;
        loadVehicles();
        loadStops();
        getOwnPosition();


        function getOwnPosition() {
            var posOptions = {timeout: 10000, enableHighAccuracy: false};
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function (position) {
                    var lat = position.coords.latitude;
                    var long = position.coords.longitude;
                    $scope.ownY = lat;
                    $scope.ownX = long;
                }, function (err) {
                    // error
                });
            setTimeout(getOwnPosition, 10000);
        }

        function loadVehicles() {
            M10factory.getVehicles().success(function (data) {
                var jsonText = data;
                jsonText = jsonText.replace(/\\(.)/g, "$1");
                jsonText = jsonText.substr(1, jsonText.length - 2);
                var jsonObj = JSON.parse(jsonText);
                jsonObj = jsonObj.filter(function (value) {
                    return ((value.X > 0) && (value.Y > 0));
                });
                $scope.vehicles.unshift(jsonObj);

                initMap();
            });
        }

        function loadStops() {
            M10factory.getStops().success(function (data) {

                var jsonText = data;
                jsonText = jsonText.replace(/\\(.)/g, "$1");
                jsonText = jsonText.substr(1, jsonText.length - 2);
                var jsonObj = JSON.parse(jsonText);
                jsonObj = jsonObj.filter(function (value) {
                    return ((value.X > 0) && (value.Y > 0));
                });
                $scope.stops = jsonObj;
            });
        }

        $scope.GetColor = function (indexValue, offset, transparency) {
            if (offset == undefined) {
                offset = 0;
            }
            return "hsla(" + (indexValue * 35) + ", " + (50 + offset).toString() + "%, " + transparency + "%, 1)";
        };

        function initMap() {
            var i, j;
            if ($scope.map == null) {
                var xArr = [];
                var yArr = [];
                var vehicle;
                if(count($scope.vehicles) > 0){
                    for (i = 0; i <= $scope.vehicles[0].length - 1; i++) {
                        vehicle = $scope.vehicles[0][i];

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

                $scope.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

            }

            if ($scope.stops !== null) {
                if ($scope.map !== null) {
                    if (stopMarkers == null) {
                        stopMarkers = [];
                        var stop;
                        for (i = 0; i <= $scope.stops.length - 1; i++) {
                            stop = $scope.stops[i];

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
                                map: $scope.map
                            });

                        }
                    }
                }

            }


            if (($scope.ownY !== null) && ($scope.ownX !== null)) {
                if ($scope.map !== null) {
                    var ownIcon = {
                        path: 'm25.312174,23.704433c-1.133963,-2.048929 -2.522187,-3.708115 -3.914122,-4.868061c-1.623924,1.189641 -3.602328,1.913447 -5.7589,1.913447c-2.160283,0 -4.140543,-0.725662 -5.762612,-1.913447c-1.391935,1.159946 -2.780159,2.819133 -3.917834,4.868061c-2.639109,4.756707 -2.928632,9.635904 -0.64957,10.901637c1.020752,0.569765 2.091615,0.144761 3.197739,-0.920533c-0.194871,1.080142 -0.308082,2.251223 -0.308082,3.476126c0,5.441539 2.113886,9.849334 4.719588,9.849334c1.570103,0 2.347731,-1.605365 2.720769,-4.062595c0.373039,2.45723 1.150666,4.062595 2.715202,4.062595c2.609415,0 4.7233,-4.407795 4.7233,-9.849334c0,-1.224903 -0.113211,-2.395984 -0.311793,-3.476126c1.109836,1.065294 2.178843,1.490299 3.201451,0.920533c2.279062,-1.265733 1.983972,-6.14493 -0.655138,-10.901637zm-9.674878,-4.810528c4.383668,0 7.939599,-3.555931 7.939599,-7.941454s-3.555931,-7.941454 -7.939599,-7.941454c-4.385524,0 -7.94331,3.555931 -7.94331,7.941454s3.557786,7.941454 7.94331,7.941454z',
                        fillColor: "#D32F2F",
                        strokeColor: "#D32F2F",
                        fillOpacity: 1,
                        scale: 0.5,
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(12, 12)
                    };

                    $scope.ownMarkers.forEach(function (o) {
                        o.setMap(null);
                    });

                    $scope.ownMarkers.push(new MarkerWithLabel({
                        zIndex: 3,
                        icon: ownIcon,
                        position: new google.maps.LatLng($scope.ownY, $scope.ownX),
                        map: $scope.map
                    }));
                }
            }

            var lDirectionIcon;
            var MarkerAngle;
            $scope.vehicleMarkers.forEach(function (o) {
                o.setMap(null);
            });

            for (j = Math.min($scope.vehicles.length - 1, 9); j >= 0; j--) {
                for (i = 0; i <= $scope.vehicles[j].length - 1; i++) {
                    vehicle = $scope.vehicles[j][i];

                    vehicle.CreateDirectionIcon = function (colorIndex) {
                        return {
                            path: 'm26.261531,11.98125c0.617337,-0.598342 1.20775,-1.288151 1.727863,-1.907368l-15.584402,-0.284133l-2.137643,2.446922l-6.772099,-0.210161c0.848552,-1.114054 1.77811,-2.422766 2.467295,-3.405739l-2.451558,-3.304548l7.225678,0l1.470196,2.064705l15.911293,0l-1.973673,-2.060084c0.609102,-0.649211 1.510538,-1.515596 1.999536,-1.969854l5.351233,5.2505l-5.363404,5.331949l-1.870317,-1.95219l0.000002,0.000001z',
                            fillColor: $scope.GetColor(colorIndex, -25, 50),
                            strokeColor: "#000000",
                            fillOpacity: 1,
                            scale: 0.8,
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(23, 16),
                            rotation: -this.Angle
                        };
                    };
                    vehicle.CreateSimpleIcon = function (colorIndex) {
                        return {
                            path: 'm26.261531,11.98125c0.617337,-0.598342 1.20775,-1.288151 1.727863,-1.907368l-15.584402,-0.284133l-2.137643,2.446922l-6.772099,-0.210161c0.848552,-1.114054 1.77811,-2.422766 2.467295,-3.405739l-2.451558,-3.304548l7.225678,0l1.470196,2.064705l15.911293,0l-1.973673,-2.060084c0.609102,-0.649211 1.510538,-1.515596 1.999536,-1.969854l5.351233,5.2505l-5.363404,5.331949l-1.870317,-1.95219l0.000002,0.000001z',
                            fillColor: $scope.GetColor(colorIndex, -25, 50),
                            strokeColor: "#000000",
                            fillOpacity: 1,
                            scale: 0.4,
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(23, 16),
                            rotation: -this.Angle
                        };
                    };

                    if (j == 0) {
                        lDirectionIcon = vehicle.CreateDirectionIcon(i);
                    } else {
                        lDirectionIcon = vehicle.CreateSimpleIcon(i);
                    }

                    $scope.vehicleMarkers.push(new MarkerWithLabel({
                        zIndex: 3,
                        icon: lDirectionIcon,
                        position: new google.maps.LatLng(vehicle.Y, vehicle.X),
                        map: $scope.map
                    }));

                }
            }
            setTimeout(loadVehicles, 10000);
        }
    })

    .controller('ChatsCtrl', function ($scope, Chats) {
        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //
        //$scope.$on('$ionicView.enter', function(e) {
        //});

        $scope.chats = Chats.all();
        $scope.remove = function (chat) {
            Chats.remove(chat);
        };
    })

    .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
        $scope.chat = Chats.get($stateParams.chatId);
    })

    .controller('AccountCtrl', function ($scope) {
        $scope.settings = {
            enableFriends: true
        };
    });
