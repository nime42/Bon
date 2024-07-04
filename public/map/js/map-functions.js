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
