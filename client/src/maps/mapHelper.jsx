class MapHelper {
  helloworld() {
    alert('hello');
  }

  static staticMethod() {
    alert('static method has been called.');
  }

  static findNearestTrailMetre(google, polyLine, latlng) {
    const path = polyLine.getPath();
    let pathDistance = 0;
    const needle = {
      minDistance: 9999999999,
      index: -1,
      latlng: null,
      distance: 0
    };

    path.forEach(function(routePoint, index) {
      var dist = google.maps.geometry.spherical.computeDistanceBetween(
        latlng,
        routePoint
      );
      if (dist < needle.minDistance) {
        needle.minDistance = dist;
        needle.index = index;
        needle.latlng = routePoint;
        needle.distance = pathDistance;
      }

      if (index !== path.length - 1) {
        //Not the last point
        const nextPoint = path.getAt(index + 1);
        pathDistance += google.maps.geometry.spherical.computeDistanceBetween(
          routePoint,
          nextPoint
        );
      }
    });

    return needle.distance;
  }

    static findNearestPathPoint(google, polyLine, latlng) {
        const path = polyLine.getPath();
        let pathDistance = 0;
        const needle = {
            minDistance: 9999999999,
            index: -1,
            latlng: null,
            distance: 0
        };

        path.forEach(function(routePoint, index) {
            var dist = google.maps.geometry.spherical.computeDistanceBetween(
              latlng,
              routePoint
            );
            if (dist < needle.minDistance) {
                needle.minDistance = dist;
                needle.index = index;
                needle.latlng = routePoint;
                needle.distance = pathDistance;
            }

            if (index !== path.length - 1) {
                //Not the last point
                const nextPoint = path.getAt(index + 1);
                pathDistance += google.maps.geometry.spherical.computeDistanceBetween(
                  routePoint,
                  nextPoint
                );
            }
        });

        return needle.latlng;
    }
}

export default MapHelper;
