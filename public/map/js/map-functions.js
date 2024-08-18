var mapObj;
var homePos;

function initMap(div, pos, zoom) {
  mapObj = L.map(div, { zoomControl: false });
  L.control.zoom({ position: "bottomright" }).addTo(mapObj);

  mapObj.setView(pos, zoom);
  homePos = pos;

  const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(mapObj);
}

function goToPos(pos) {
  mapObj.flyTo(pos);
}

function toggleRoute(feature) {
  let A = document.globals.homePosition;
  let Z = feature.position;
  let url = "../api/geo/route";
  url += `?A_lat=${A[0]}&A_lon=${A[1]}&Z_lat=${Z[0]}&Z_lon=${Z[1]}`;
  if (feature.route != undefined) {
    if (mapObj.hasLayer(feature.route)) {
      feature.route.remove(mapObj);
    } else {
      feature.route.addTo(mapObj);
    }
  } else {
    $.get(url, (data) => {
      if (data?.features !== undefined) {
        let geojsonFeature = data.features[0];
        feature.route = L.geoJSON(geojsonFeature).addTo(mapObj);
      }
    });
  }
}

function goHome() {
  goToPos(homePos);
}

function createIconMarker(position, iconContent, popup) {
  const i = L.divIcon({
    html: iconContent,
    className: "myDivIcon",
  });
  let m = L.marker(position, { icon: i });
  m.myPopUp = popup;
  return m;
}

function createNumberedMarker(position, nr, popup, color, icon) {
  let background = "";
  if (color !== undefined) {
    background = `background:${color}`;
  }
  let i = "";
  if (icon !== undefined) {
    i = `<i class="${icon}"></i>`;
  }
  let html = `<div style="width:40px;"><div style="${background}" class="numberCircle map-icon">${nr}</div>${i}</div>`;
  let marker = createIconMarker(position, html, popup);
  return marker;
}

function removeMarker(marker) {
  mapObj.removeLayer(marker);
}

function addMarker(marker) {
  marker.addTo(mapObj);
  if (marker.myPopUp) {
    marker.bindPopup(marker.myPopUp);
  }
}
function blinkMarker(marker) {
  setTimeout(() => {
    if (mapObj.hasLayer(marker)) {
      removeMarker(marker);
      setTimeout(() => {
        addMarker(marker);
      }, 300);
    } else {
      addMarker(marker);
      setTimeout(() => {
        removeMarker(marker);
      }, 300);
    }
  }, 500);
}

function layerExists(layer) {
  return mapObj.hasLayer(layer);
}
