var services = angular.module('app.services');
services.factory(
    "FavoriteService",
    function ($http, $cookies) {
        if (!$cookies.Favorites)
            $cookies.Favorites = JSON.stringify([]);

        var lService = {};
        lService.GetGPSFavoritePlaces = function () {
            try {
                return JSON.parse($cookies.Favorites);
            } catch(exc) {
                $cookies.Favorites = JSON.stringify([]);
            }
            return JSON.parse($cookies.Favorites);
        };

        lService.Contain = function(item) {
            var lList = lService.GetGPSFavoritePlaces();
            for (var i = 0; i < lList.length; i++) {
                if (lList[i].Code == item.Code)
                    return true;
            }
            return false;
        };

        lService.AddFavorite = function(item) {
            var lList = lService.GetGPSFavoritePlaces();
            if (lService.Contain(item))
                return true;
            lList.push(item);
            $cookies.Favorites = JSON.stringify(lList);
            return true;
        };

        lService.RemoveFavorite = function(item) {
            var lList = lService.GetGPSFavoritePlaces();
            if (!lService.Contain(item))
                return;
            for (var i = 0; i < lList.length; i++) {
                if (lList[i].Code == item.Code)
                    lList.splice(i, 1);
            }
            $cookies.Favorites = JSON.stringify(lList);
        };

        return lService;
    }
);