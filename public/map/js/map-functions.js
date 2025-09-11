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

  // Add legend
  const legend = createLegend();
  legend.addTo(mapObj);
}



function createLegend() {
  const legend = L.control({ position: 'topright' });

  legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'map-legend');
    div.innerHTML = '<h4>Legend</h4>';

    Object.entries(MapGlobals.legends).forEach(([key, value]) => {
      div.innerHTML += `
                <div class="legend-item">
                    <i class="${value.icon}" style="color: ${value.color}"></i>
                    <span>${value.text}</span>
                </div>
            `;
    });

    return div;
  };

  return legend;
}



function createLegend() {
  const legend = L.control({ position: 'topright' });

  legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'map-legend');
    div.innerHTML = '<h4>Legend</h4>';

    Object.entries(MapGlobals.legends).forEach(([key, value]) => {
      div.innerHTML += `
                <div class="legend-item">
                    <div class="legend-line" style="background-color: ${value.color}"></div>
                    <i class="${value.icon}" style="color: ${value.color}"></i>
                    <span>${value.text}</span>
                </div>
            `;
    });

    return div;
  };

  return legend;
}
function goToPos(pos) {
  mapObj.flyTo(pos);
}

function toggleRoute(feature) {

  if (feature.route != undefined) {
    if (mapObj.hasLayer(feature.route)) {
      feature.route.remove(mapObj);
    } else {
      feature.route.addTo(mapObj);
    }
  } else {
    if (MapGlobals.geoData === undefined) {
      return;
    }
    let bonGeoData = MapGlobals.geoData.find(e => (e.bon_id == feature.bon.id));
    let geojsonFeature = JSON.parse(bonGeoData?.route_feature);
    geojsonFeature.featureData = feature;
    const style = {
      style: (feature) => {
        if (MapGlobals.legends[feature.featureData.deliveryType] !== undefined) {
          return { color: MapGlobals.legends[feature.featureData.deliveryType].color };
        } else {
          return { color: "#000000" };
        }
      }
    }
    feature.route = L.geoJSON(geojsonFeature, style).addTo(mapObj);

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
    i = `<i class="${icon.icon}" style="color:${icon.color}"></i>`;
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
