var GeoMath = {};

GeoMath.EquatorialEarthRadius = 6378137;
GeoMath.PiD180 = Math.PI / 180.0;
GeoMath.PolarEarthRadius = 6356752;
GeoMath.PolarRadiusSquare = Math.pow(GeoMath.PolarEarthRadius, 2.0);
GeoMath.EquatorialEarthRadiusSquare = Math.pow(GeoMath.EquatorialEarthRadius, 2.0);
GeoMath.Ellipsoid = Math.sqrt(1 - GeoMath.PolarRadiusSquare / GeoMath.EquatorialEarthRadiusSquare);
GeoMath.EllipsoidSqware = GeoMath.Ellipsoid * GeoMath.Ellipsoid;
GeoMath.EqErmes = GeoMath.EquatorialEarthRadius * (1 - GeoMath.EllipsoidSqware);

GeoMath.GeoDistance = function(aPoint1, aPoint2) {
    if ((aPoint1.X == aPoint2.X) && (aPoint1.Y == aPoint2.Y))
        return 0.0;

    var lon1 = aPoint1.X * GeoMath.PiD180;
    var lat1 = aPoint1.Y * GeoMath.PiD180;
    var lon2 = aPoint2.X * GeoMath.PiD180;
    var lat2 = aPoint2.Y * GeoMath.PiD180;

    var dLat = lat2 - lat1;
    var dLon = lon2 - lon1;
    if ((dLat == 0.0) && (dLon == 0.0))
        return 0.0;

    var lLatSin = Math.sin(dLat / 2.0);
    var lLonSin = Math.sin(dLon / 2.0);

    var a = lLatSin * lLatSin + Math.cos(lat1) * Math.cos(lat2) * lLonSin * lLonSin;
    var c = 2.0 * Math.asin(Math.sqrt(a));

    var lDistance = GeoMath.GetEarthRadius((lat1 + lat2) / 2.0) * c;
    return lDistance;
};

GeoMath.GetEarthRadius = function(lat) {
    var lSin = Math.sin(lat);
    var lRadius = GeoMath.EqErmes / Math.pow(1 - GeoMath.EllipsoidSqware * lSin * lSin, 1.5);
    return lRadius;
};
