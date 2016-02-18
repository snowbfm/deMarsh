/**
 * A google map / GPS controller.
 */
app.controller('RouteMapController', ['$scope', '$state', '$ionicPlatform', '$location', "RoutesService", "ResultService", "GPSPlacesService", "$ionicScrollDelegate",
    function($scope, $state, $ionicPlatform, $location, RoutesService, ResultService, GPSPlacesService, $ionicScrollDelegate) {
        $scope.CallInfo = true;
        $scope.gpsPlaces = [];
        $scope.Markers = [];
        $scope.Routes = [{ Name: "Завантаження..." }];

        $scope.ShowMapPoints = false;

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
        $scope.MarkerCluster = new MarkerClusterer($scope.map, $scope.Markers);

        $scope.InitMapPointsControl = function(controlDiv) {

            // Set CSS for the control border
            var controlUI = document.createElement('div');
            controlUI.style.backgroundColor = '#fff';
            controlUI.style.border = '2px solid #fff';
            controlUI.style.borderRadius = '3px';
            controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
            controlUI.style.cursor = 'pointer';
            controlUI.style.paddingTop = '5px';
            controlUI.style.paddingLeft = '5px';
            controlUI.style.paddingRight = '5px';
            controlUI.style.marginBottom = '5px';
            controlUI.style.textAlign = 'left';
            controlUI.style.width = '120px';
            controlUI.style.float = 'left';
            controlUI.title = 'Показувати/Приховувати усі точки маршрутів';
            controlUI.innerHTML = "Точки маршрутів";
            controlDiv.appendChild(controlUI);

            // Set CSS for the control interior
            var controlText = document.createElement('input');
            controlText.ProcessingChange = false;
            controlText.type = 'checkbox';
            controlText.style.float = 'right';
            controlText.style.color = 'rgb(25,25,25)';
            controlText.style.fontFamily = 'Roboto,Arial,sans-serif';


            controlText.addEventListener("click", function() {
                console.log("onchange");
                if (this.ProcessingChange)
                    return;

                this.ProcessingChange = true;
                if (this.checked) {
                    GPSPlacesService.GetGPSPlaces(
                        function(response) {
                            var lPlaces = JSON.parse(response.data);
                            $scope.Markers = [];
                            for (var i = 0; i < lPlaces.length; i++) {
                                var lPoint = lPlaces[i];

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
                            $scope.MarkerCluster.addMarkers($scope.Markers);
                            controlText.ProcessingChange = false;
                        },
                        function(e) {
                            console.log("Error retrieving points " + e.code + " " + e.message);
                            controlText.ProcessingChange = false;
                        });
                } else {
                    $scope.MarkerCluster.clearMarkers();
                    for (var i = 0; i < $scope.Markers.length; i++) {
                        $scope.Markers[i].setMap(null);
                    }
                    $scope.length = 0;
                    this.ProcessingChange = false;
                }
            });

            controlUI.appendChild(controlText);
        };

        var mapPointsControlDiv = document.createElement('div');
        $scope.InitMapPointsControl(mapPointsControlDiv);
        mapPointsControlDiv.index = 1;
        $scope.map.controls[google.maps.ControlPosition.TOP_CENTER].push(mapPointsControlDiv);

        $ionicPlatform.ready(function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        var c = position.coords;
                        $scope.gotoLocation(c.latitude, c.longitude);
                    }, function(e) {
                        $scope.gotoLocation(DefaultLocation.lat, DefaultLocation.lng);
                        console.warn("Error retrieving position " + e.code + " " + e.message);
                    });
            } else
                $scope.gotoLocation(DefaultLocation.lat, DefaultLocation.lng);
        });

        RoutesService.GetRoutes(
            function(response) {
                $scope.Routes = JSON.parse(response.data);
                for (var i = 0; i < $scope.Routes.length; i++) {
                    $scope.Routes[i].Index = i;
                }
            },
            function(fail) {
                $scope.Routes = [{ Name: fail.statusText }];
            });

        $scope.GetRouteColor = function(indexValue, offset) {
            if (offset == undefined)
                offset = 0;
            return "hsla(" + (indexValue * 17) + ", " + (50 + offset).toString() + "%, 50%, 1)";
        };

        $scope.InitRoute = function(route) {

            if (!route.Inited) {
                route.ShowPath = function() {
                    var flightPlanCoordinates = [];
                    for (var i = 0; i < this.Path.length; i++)
                        flightPlanCoordinates.push(new google.maps.LatLng(this.Path[i].Y, this.Path[i].X));

                    this.MapPath = new google.maps.Polyline({
                        zIndex: 0,
                        path: flightPlanCoordinates,
                        geodesic: true,
                        strokeColor: $scope.GetRouteColor(this.Index),
                        strokeOpacity: 0.75,
                        strokeWeight: 6
                    });
                    this.MapPath.setMap($scope.map);
                };

                route.ShowPoints = function() {
                    this.NeedShowPoints = true;
                    RoutesService.GetRoutePoints(
                        this.Code,
                        function(result) {
                            if (route.NeedShowPoints) {
                                route.Points = JSON.parse(result.data);
                                for (var i = 0; i < route.Points.length; i++) {
                                    var lPoint = route.Points[i];

                                    lPoint.InfoWindow = new google.maps.InfoWindow({});
                                    lPoint.Marker = new google.maps.Marker({
                                        zIndex: 1,
                                        icon: 'Content/map-marker-radius.png',
                                        position: new google.maps.LatLng(lPoint.Y, lPoint.X),
                                        map: $scope.map,
                                        RoutePoint: lPoint
                                    });
                                    google.maps.event.addListener(lPoint.Marker, 'mouseover', function() {
                                        this.RoutePoint.InfoWindow.setContent(this.RoutePoint.Name);
                                        this.RoutePoint.InfoWindow.open($scope.map, this);
                                    });
                                    google.maps.event.addListener(lPoint.Marker, 'mouseout', function() {
                                        this.RoutePoint.InfoWindow.close();
                                    });
                                    google.maps.event.addListener(lPoint.Marker, "click", function(e) {
                                        $state.go('app.result', { 'Code': this.RoutePoint.Code, 'Name': this.RoutePoint.Name });
                                    });
                                }
                            } else {
                                route.HidePoints();
                            }
                        },
                        function(fail) {

                        });
                };
                route.HidePoints = function() {
                    this.NeedShowPoints = false;
                    if (this.Points != undefined) {
                        for (var i = 0; i < this.Points.length; i++) {
                            var lPoint = this.Points[i];
                            google.maps.event.clearInstanceListeners(lPoint.Marker);
                            lPoint.Marker.setMap(null);
                            lPoint.Marker = null;
                        }
                    }
                };

                route.InitVehicle = function(vehicle) {
                    vehicle.Unassign = function() {
                        google.maps.event.clearInstanceListeners(vehicle.Marker);
                        vehicle.Marker.setMap(null);
                        vehicle.MarkerAngle.setMap(null);
                    };
                    vehicle.CreateDirectionIcon = function(colorIndex) {
                        var lIcon = {
                            path: 'M39.652,16.446C39.652,7.363,32.289,0,23.206,0C14.124,0,6.761,7.363,6.761,16.446c0,1.775,0.285,3.484,0.806,5.086h0,c0,0,1.384,6.212,15.536,24.742c8.103-10.611,12.018-17.178,13.885-20.857C38.67,22.836,39.652,19.756,39.652,16.446z,M23.024,27.044c-5.752,0-10.416-4.663-10.416-10.416c0-5.752,4.664-10.415,10.416-10.415s10.416,4.663,10.416,10.415,C33.439,22.381,28.776,27.044,23.024,27.044z',
                            fillColor: $scope.GetRouteColor(colorIndex, -25),
                            strokeColor: "#000000",
                            fillOpacity: 1,
                            scale: 0.8,
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(23, 16),
                            rotation: -90 - this.Angle
                        };
                        return lIcon;
                    };

                    vehicle.InfoWindow = new google.maps.InfoWindow({});
                    var lIconMarker = {
                        path: 'M18,11H6V6H18M16.5,17A1.5,1.5 0 0,1 15,15.5A1.5,1.5 0 0,1 16.5,14A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 16.5,17M7.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,14A1.5,1.5 0 0,1 9,15.5A1.5,1.5 0 0,1 7.5,17M4,16C4,16.88 4.39,17.67 5,18.22V20A1,1 0 0,0 6,21H7A1,1 0 0,0 8,20V19H16V20A1,1 0 0,0 17,21H18A1,1 0 0,0 19,20V18.22C19.61,17.67 20,16.88 20,16V6C20,2.5 16.42,2 12,2C7.58,2 4,2.5 4,6V16Z',
                        fillColor: "#D32F2F",
                        strokeColor: "#D32F2F",
                        fillOpacity: 1,
                        scale: 0.6,
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(12, 12)
                    };
                    vehicle.Marker = new google.maps.Marker({
                        zIndex: 4,
                        icon: lIconMarker,
                        position: new google.maps.LatLng(vehicle.Y, vehicle.X),
                        map: $scope.map,
                        Vehicle: vehicle
                    });

                    var lDirectionIcon = vehicle.CreateDirectionIcon(this.Index);
                    vehicle.MarkerAngle = new MarkerWithLabel({
                        zIndex: 3,
                        icon: lDirectionIcon,
                        position: new google.maps.LatLng(vehicle.Y, vehicle.X),
                        map: $scope.map,
                        Vehicle: vehicle
                    });
                    google.maps.event.addListener(vehicle.Marker, "click", function(e) {
                        var lVeh = this.Vehicle;
                        lVeh.InfoWindow.setContent(
                            "ТЗ: " + lVeh.VehicleName + "<br/>"
                                + "Відхилення від графіку: " + lVeh.TimeToPoint.toHHMMSS() + "<br/>"
                                + "Маршрут: " + lVeh.RouteName
                        );
                        lVeh.InfoWindow.open($scope.map, this);
                    });
                };
                route.AssignVehicle = function(dst, src) {
                    dst.RouteName = src.RouteName;
                    dst.VehicleName = src.VehicleName;
                    dst.TimeToPoint = src.TimeToPoint;
                    dst.Angle = src.Angle;
                    dst.X = src.X;
                    dst.Y = src.Y;

                    dst.Marker.animateTo(new google.maps.LatLng(src.Y, src.X), { duration: 5000 });
                    dst.MarkerAngle.animateTo(new google.maps.LatLng(src.Y, src.X), { duration: 5000 });

                    dst.MarkerAngle.setIcon(dst.CreateDirectionIcon(this.Index));
                };

                route.ShowVehicles = function() {
                    this.ContinueShowVehicles = true;
                    route.VehicleInfos = [];
                    this.RefreshVehicles();
                };
                route.RefreshVehicles = function() {
                    if (!$scope.CallInfo) {
                        route.RefreshVehiclesAsync();
                        return;
                    }
                    if (route.ContinueShowVehicles) {
                        console.log(route.Name + "-Start Refresh vehicles-");
                        ResultService.GetGPSRouteInfo(
                            route.Code,
                            function(result) {
                                console.log(route.Name + "-Receive response Refresh vehicles-");
                                var lVehicles = JSON.parse(result.data);
                                //привязка до вже існуючих ТЗ на карті а також видалення непотрібних
                                for (var j = route.VehicleInfos.length - 1; j >= 0; j--) {
                                    var lVehicle = route.VehicleInfos[j];

                                    var lNewItem = null;
                                    for (var i = 0; i < lVehicles.length; i++) {
                                        if (lVehicles[i].VehicleId == lVehicle.VehicleId) {
                                            lNewItem = lVehicles[i];
                                            lVehicles.splice(i, 1);
                                            break;
                                        }
                                    }
                                    if (lNewItem != null)
                                        route.AssignVehicle(lVehicle, lNewItem);
                                    else {
                                        lVehicle.Unassign();
                                        route.VehicleInfos.splice(j, 1);
                                    }
                                }
                                //додавання нових ТЗ
                                for (var li = 0; li < lVehicles.length; li++) {
                                    var lNewVehicle = lVehicles[li];
                                    route.InitVehicle(lNewVehicle);
                                    route.VehicleInfos.push(lNewVehicle);
                                }
                                console.log(route.Name + "-Complete Refresh vehicles-");
                                route.RefreshVehiclesAsync();
                            }, function(fail) {
                                console.log(route.Name + "-Fail Refresh vehicles-");
                                route.RefreshVehiclesAsync();
                            });
                    } else {
                        route.ClearVehicles();
                    }
                };
                route.RefreshVehiclesAsync = function() {
                    setTimeout(route.RefreshVehicles, 5000);
                };
                route.StopShowVehicles = function() {
                    this.ContinueShowVehicles = false;
                    this.ClearVehicles();
                };
                route.ClearVehicles = function() {
                    for (var j = 0; j < this.VehicleInfos.length; j++) {
                        var lVehicle = this.VehicleInfos[j];
                        lVehicle.Unassign();
                    }
                };

                route.VehicleInfos = [];
                route.Inited = true;
            }
        };

        $scope.OnChangeState = function(route) {
            $scope.InitRoute(route);
            if (route.Show) {
                $scope.ShowPath(route);
            } else {
                $scope.HidePath(route);
                console.log(route.Show + "-Draw Route-" + route.Name);
            }
        };
        $scope.HidePath = function(route) {
            if (route.MapPath)
                route.MapPath.setMap(null);
            route.HidePoints();
            route.StopShowVehicles();
        };
        $scope.ShowPath = function(route) {
            $scope.IsReadOnly = true;
            RoutesService.GetRouteCirclePath(
                route.Code,
                function(response) {
                    if (route.Show) {
                        route.Path = JSON.parse(response.data);
                        route.ShowPath();
                        route.ShowPoints();
                        route.ShowVehicles();
                    } else {
                        $scope.HidePath(route);
                    }
                    $scope.IsReadOnly = false;
                    console.log("Complete show path");
                }, function(result) {
                    $scope.HidePath(route);
                    $scope.IsReadOnly = false;
                    console.log("Fail on show path");
                });
        };

        $scope.gotoLocation = function(lat, lon) {
            if ($scope.lat != lat || $scope.lon != lon) {
                $scope.currentLocation = { lat: lat, lon: lon };
                $scope.map.setCenter(new google.maps.LatLng(lat, lon));
            }
        };
        $scope.ResetScroll = function() {
            $ionicScrollDelegate.scrollTop();
        };
        $scope.$on('$locationChangeStart', function(event, next, current) {
            $scope.CallInfo = next.match("#/app/routemap");
        });

    }]);
Number.prototype.toHHMMSS = function () {
    var sec_num = Math.abs(this); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var time = hours + ':' + minutes + ':' + seconds;
    if (this < 0)
        return "-"+time;
    else
        return time;
};

String.prototype.toHHMMSS = function() {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var time = hours + ':' + minutes + ':' + seconds;
    return time;
};