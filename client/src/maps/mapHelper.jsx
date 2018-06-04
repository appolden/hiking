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

  static findNearest(google, pathPoints, latlng, map) {
    let pathDistance = 0;
    const nearest = {
      minDistance: 9999999999,
      index: -1,
      latlng: null,
      distance: 0,
      halfwayPointDistance: 0
    };

    pathPoints.forEach(function(routePoint, index) {
      var dist = google.maps.geometry.spherical.computeDistanceBetween(
        latlng,
        routePoint
      );
      if (dist < nearest.minDistance) {
        nearest.minDistance = dist;
        nearest.index = index;
        nearest.latlng = routePoint;
        nearest.distance = pathDistance;
        nearest.pointDistance = pathDistance;
      }

      if (index !== pathPoints.length - 1) {
        //Not the last point
        const nextPoint = pathPoints[index + 1];
        pathDistance += google.maps.geometry.spherical.computeDistanceBetween(
          routePoint,
          nextPoint
        );
      }
    });

    if (nearest.index !== 0) {
      let interpolatedPoints = [];
      const previousPointInPath = pathPoints[nearest.index - 1];
      const nextPointInPath = pathPoints[nearest.index + 1];

      interpolatedPoints = interpolatedPoints.concat(
        this.interpolateBetweenPoints(
          google,
          previousPointInPath,
          nearest.latlng
        )
      );

      interpolatedPoints = interpolatedPoints.concat(
        this.interpolateBetweenPoints(google, nearest.latlng, nextPointInPath)
      );

      this.addCumulativeDistanceNotGoogle(google, interpolatedPoints);
      //interpolatedPoints.forEach(x => {
      // // console.log(`${x.lat}, ${x.lng}`);

      //  const marker = new google.maps.Marker({
      //    map: map,
      //    position: new google.maps.LatLng(x.lat, x.lng),
      //    title: 'Point ' + x.distance
      //    });

      //  });

      interpolatedPoints.forEach(function(pathPoint, index) {
        const googlePathPoint = new google.maps.LatLng(
          pathPoint.lat,
          pathPoint.lng
        );
        const dist = google.maps.geometry.spherical.computeDistanceBetween(
          latlng,
          googlePathPoint
        );
        if (dist < nearest.minDistance) {
          nearest.minDistance = dist;
          nearest.latlng = googlePathPoint;
          nearest.distance = pathPoint.distance + previousPointInPath.distance;
        }

        if (index !== pathPoints.length - 1) {
          //Not the last point
          const nextPoint = pathPoints[index + 1];
          const googleNextPoint = new google.maps.LatLng(
            nextPoint.lat,
            nextPoint.lng
          );
          pathDistance += google.maps.geometry.spherical.computeDistanceBetween(
            googlePathPoint,
            googleNextPoint
          );
        }
      });
    }

    return nearest;
  }

  static addCumulativeDistance(google, pathPoints) {
    let pathDistance = 0;

    pathPoints.forEach(function(pathPoint, index) {
      pathPoint.distance = pathDistance;

      if (index > 0) {
        const previousPoint = pathPoints[index - 1];
        const distanceFromPreviousPoint = google.maps.geometry.spherical.computeDistanceBetween(
          previousPoint,
          pathPoint
        );

        pathPoint.distance = pathDistance + distanceFromPreviousPoint;
        pathDistance = pathDistance + distanceFromPreviousPoint;
      }
    });

    return pathPoints;
  }

  static addCumulativeDistanceNotGoogle(google, pathPoints) {
    let pathDistance = 0;

    pathPoints.forEach((pathPoint, index) => {
      pathPoint.distance = pathDistance;

      if (index > 0) {
        const previousPoint = pathPoints[index - 1];
        const distanceFromPreviousPoint = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(previousPoint.lat, previousPoint.lng),
          new google.maps.LatLng(pathPoint.lat, pathPoint.lng)
        );

        pathPoint.distance = pathDistance + distanceFromPreviousPoint;
        pathDistance = pathDistance + distanceFromPreviousPoint;
      }
    });

    return pathPoints;
  }

  static interpolateBetweenPoints(google, googleLatLngA, googleLatLngB) {
    const distanceBetweenPreviousPoint = google.maps.geometry.spherical.computeDistanceBetween(
      googleLatLngA,
      googleLatLngB
    );

    return this.interpolateBetweenPointsNotGoogle(
      {
        lat: googleLatLngA.lat(),
        lng: googleLatLngA.lng(),
        distance: 0
      },
      {
        lat: googleLatLngB.lat(),
        lng: googleLatLngB.lng(),
        distance: 0
      },
      distanceBetweenPreviousPoint
    );
  }

  static interpolateBetweenPointsNotGoogle(
    pointA,
    pointB,
    distanceBetweenPoints
  ) {
    const maximumDistanceBetweenPoints = 20; //metres
    const numberOfPoints = distanceBetweenPoints / maximumDistanceBetweenPoints;
    const fraction = 1 / numberOfPoints;
    const result = [];

    console.log(
      `distanceBetweenPoints: ${distanceBetweenPoints}, numberOfPoints: ${numberOfPoints}, fraction: ${fraction} `
    );

    result.push(pointA);

    for (var i = 1; i < numberOfPoints; i++) {
      const point = this.IntermediatePointTo(pointA, pointB, fraction * i);
      result.push(point);
    }

    result.push(pointB);

    return result;
  }

  /**
   * Returns the midpoint between ‘this’ point and the supplied point.
   *
   * @param   {LatLon} point - Latitude/longitude of destination point.
   * @returns {LatLon} Midpoint between this point and the supplied point.
   *
   */
  static MidPoint(pointA, pointB) {
    const lat1 = pointA.lat;
    const lat2 = pointB.lat;

    const lon1 = pointA.lng;
    const lon2 = pointB.lng;

    // φm = atan2( sinφ1 + sinφ2, √( (cosφ1 + cosφ2⋅cosΔλ) ⋅ (cosφ1 + cosφ2⋅cosΔλ) ) + cos²φ2⋅sin²Δλ )
    // λm = λ1 + atan2(cosφ2⋅sinΔλ, cosφ1 + cosφ2⋅cosΔλ)
    // see mathforum.org/library/drmath/view/51822.html for derivation

    var φ1 = lat1.toRadians();
    var λ1 = lon1.toRadians();
    var φ2 = lat2.toRadians();
    var Δλ = (lon2 - lon1).toRadians();

    var Bx = Math.cos(φ2) * Math.cos(Δλ);
    var By = Math.cos(φ2) * Math.sin(Δλ);

    var x = Math.sqrt((Math.cos(φ1) + Bx) * (Math.cos(φ1) + Bx) + By * By);
    var y = Math.sin(φ1) + Math.sin(φ2);
    var φ3 = Math.atan2(y, x);

    var λ3 = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);

    //return new LatLon(φ3.toDegrees(), (λ3.toDegrees() + 540) % 360 - 180); // normalise to −180..+180°
    //  console.log(`midpoint ${φ3.toDegrees()}`);
    return { lat: φ3.toDegrees(), lng: (λ3.toDegrees() + 540) % 360 - 180 };
  }

  /**
   * Returns the point at given fraction between ‘this’ point and specified point.
   *
   * @param   {LatLon} point - Latitude/longitude of destination point.
   * @param   {number} fraction - Fraction between the two points (0 = this point, 1 = specified point).
   * @returns {LatLon} Intermediate point between this point and destination point.
   *
   */
  static IntermediatePointTo = function(pointA, pointB, fraction) {
    const lat1 = pointA.lat;
    const lat2 = pointB.lat;

    const lon1 = pointA.lng;
    const lon2 = pointB.lng;

    var φ1 = lat1.toRadians(),
      λ1 = lon1.toRadians();
    var φ2 = lat2.toRadians(),
      λ2 = lon2.toRadians();
    var sinφ1 = Math.sin(φ1),
      cosφ1 = Math.cos(φ1),
      sinλ1 = Math.sin(λ1),
      cosλ1 = Math.cos(λ1);
    var sinφ2 = Math.sin(φ2),
      cosφ2 = Math.cos(φ2),
      sinλ2 = Math.sin(λ2),
      cosλ2 = Math.cos(λ2);

    // distance between points
    var Δφ = φ2 - φ1;
    var Δλ = λ2 - λ1;
    var a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    var δ = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var A = Math.sin((1 - fraction) * δ) / Math.sin(δ);
    var B = Math.sin(fraction * δ) / Math.sin(δ);

    var x = A * cosφ1 * cosλ1 + B * cosφ2 * cosλ2;
    var y = A * cosφ1 * sinλ1 + B * cosφ2 * sinλ2;
    var z = A * sinφ1 + B * sinφ2;

    var φ3 = Math.atan2(z, Math.sqrt(x * x + y * y));
    var λ3 = Math.atan2(y, x);

    //return new LatLon(φ3.toDegrees(), (λ3.toDegrees() + 540) % 360 - 180); // normalise lon to −180..+180°
    return { lat: φ3.toDegrees(), lng: (λ3.toDegrees() + 540) % 360 - 180 };
  };
}

/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
  Number.prototype.toRadians = function() {
    return this * Math.PI / 180;
  };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
  Number.prototype.toDegrees = function() {
    return this * 180 / Math.PI;
  };
}

export default MapHelper;
