(function () {
  'use strict';

  var root = document.getElementById('atlas');
  if (!root || typeof L === 'undefined') return;

  var contextId = root.dataset.context || 'citywide';
  var query = new URLSearchParams(window.location.search);
  var state = { context: null, registry: null, map: null, layers: {}, pin: null, timeIndex: 0 };
  var storageKey = 'opensolano-atlas-annotations-v1';

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, function (character) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character];
    });
  }

  function sourceById(id) {
    return (state.registry.sources || []).find(function (source) { return source.id === id; });
  }

  function sourceLink(id) {
    var source = sourceById(id);
    if (!source) return '<span class="atlas-source-missing">Source not yet registered</span>';
    return '<a href="' + escapeHtml(source.url) + '" target="_blank" rel="noopener">' + escapeHtml(source.title) + '</a>' +
      '<span class="atlas-source-status">' + escapeHtml(source.status || 'linked') + '</span>';
  }

  function updateUrl() {
    var params = new URLSearchParams(window.location.search);
    params.set('t', String(state.timeIndex));
    window.history.replaceState({}, '', window.location.pathname + '?' + params.toString());
  }

  function setReader(html) {
    document.getElementById('atlas-reader-content').innerHTML = html;
    document.querySelector('.atlas-reader').classList.add('is-open');
  }

  function openEvent(event) {
    setReader(
      '<p class="atlas-eyebrow">Planning record · ' + escapeHtml(event.date) + '</p>' +
      '<h2>' + escapeHtml(event.title) + '</h2>' +
      '<p>' + escapeHtml(event.summary) + '</p>' +
      '<div class="atlas-evidence"><span>Evidence</span>' + sourceLink(event.source_id) + '</div>' +
      '<p class="atlas-truth"><strong>Truth state:</strong> ' + escapeHtml(event.status || 'recorded') + '</p>'
    );
  }

  function featureName(feature) {
    var properties = feature.properties || {};
    return properties.NAME || properties.park_name || properties.siteAddr || properties.APN || 'Mapped feature';
  }

  function featureDescription(feature, layerSpec) {
    var properties = feature.properties || {};
    if (layerSpec.id === 'parks') {
      return [properties.TYPE, properties.LOCATION].filter(Boolean).join(' · ') || 'Public park geometry';
    }
    if (layerSpec.id === 'parcels') {
      return [properties.siteAddr || properties.APN, properties.parcelUse, properties.areaAcres ? properties.areaAcres + ' acres' : ''].filter(Boolean).join(' · ');
    }
    return 'Public geographic context';
  }

  function showFeature(feature, layerSpec) {
    var source = sourceById(layerSpec.source_id);
    setReader(
      '<p class="atlas-eyebrow">Map feature · ' + escapeHtml(layerSpec.label) + '</p>' +
      '<h2>' + escapeHtml(featureName(feature)) + '</h2>' +
      '<p>' + escapeHtml(featureDescription(feature, layerSpec)) + '</p>' +
      '<div class="atlas-evidence"><span>Geometry source</span>' + sourceLink(layerSpec.source_id) + '</div>' +
      (source && source.status === 'loaded' ? '<p class="atlas-truth"><strong>Truth state:</strong> loaded public GIS</p>' : '')
    );
  }

  function loadLayer(layerSpec) {
    var control = document.querySelector('[data-layer-id="' + layerSpec.id + '"] input');
    fetch(layerSpec.url)
      .then(function (response) { if (!response.ok) throw new Error('Could not load source'); return response.json(); })
      .then(function (geojson) {
        var layer = L.geoJSON(geojson, {
          style: layerSpec.style || {},
          pointToLayer: function (_, latlng) { return L.circleMarker(latlng, layerSpec.style || {}); },
          onEachFeature: function (feature, leafletLayer) {
            leafletLayer.on('click', function () { showFeature(feature, layerSpec); });
            leafletLayer.on('mouseover', function () { if (leafletLayer.setStyle) leafletLayer.setStyle({ weight: 3, fillOpacity: 0.62 }); });
            leafletLayer.on('mouseout', function () { if (leafletLayer.setStyle) leafletLayer.setStyle(layerSpec.style || {}); });
          }
        });
        state.layers[layerSpec.id] = layer;
        if (layerSpec.default_visible) layer.addTo(state.map);
        if (control) control.disabled = false;
      })
      .catch(function () {
        if (control) { control.disabled = true; control.checked = false; }
        document.getElementById('atlas-status').textContent = 'One or more source layers could not be loaded. The source registry remains available.';
      });
  }

  function renderLayerControls() {
    var holder = document.getElementById('atlas-layer-controls');
    holder.innerHTML = (state.context.layers || []).map(function (layer) {
      return '<label class="atlas-layer-toggle" data-layer-id="' + escapeHtml(layer.id) + '">' +
        '<input type="checkbox" ' + (layer.default_visible ? 'checked ' : '') + 'disabled>' +
        '<span class="atlas-layer-swatch" style="background:' + escapeHtml((layer.style || {}).fillColor || (layer.style || {}).color || '#64748b') + '"></span>' +
        '<span>' + escapeHtml(layer.label) + '</span></label>';
    }).join('');

    holder.addEventListener('change', function (event) {
      var toggle = event.target;
      if (!toggle.matches('input')) return;
      var id = toggle.closest('[data-layer-id]').dataset.layerId;
      var layer = state.layers[id];
      if (!layer) return;
      if (toggle.checked) layer.addTo(state.map); else state.map.removeLayer(layer);
    });
  }

  function selectTime(index, keepReader) {
    var events = state.context.events || [];
    if (!events.length) return;
    state.timeIndex = Math.max(0, Math.min(Number(index), events.length - 1));
    document.getElementById('atlas-timeline-input').value = state.timeIndex;
    document.getElementById('atlas-time-label').textContent = events[state.timeIndex].date;
    document.querySelectorAll('.atlas-event').forEach(function (element, eventIndex) {
      element.classList.toggle('is-active', eventIndex === state.timeIndex);
      element.classList.toggle('is-future', eventIndex > state.timeIndex);
    });
    updateUrl();
    if (!keepReader) openEvent(events[state.timeIndex]);
  }

  function renderTimeline() {
    var events = state.context.events || [];
    var input = document.getElementById('atlas-timeline-input');
    input.max = Math.max(events.length - 1, 0);
    document.getElementById('atlas-timeline-events').innerHTML = events.map(function (event, index) {
      return '<button class="atlas-event" type="button" data-event-index="' + index + '">' +
        '<time>' + escapeHtml(event.date) + '</time><strong>' + escapeHtml(event.title) + '</strong></button>';
    }).join('');
    input.addEventListener('input', function () { selectTime(input.value); });
    document.getElementById('atlas-timeline-events').addEventListener('click', function (event) {
      var button = event.target.closest('[data-event-index]');
      if (button) selectTime(button.dataset.eventIndex);
    });
    selectTime(query.has('t') ? query.get('t') : events.length - 1, true);
  }

  function renderRelationships() {
    document.getElementById('atlas-relationships').innerHTML = (state.context.relationships || []).map(function (relationship, index) {
      return '<button class="atlas-relationship" type="button" data-relationship-index="' + index + '">' +
        '<span class="atlas-relationship-kind">' + escapeHtml(relationship.kind) + '</span>' +
        '<span><strong>' + escapeHtml(relationship.from) + '</strong> ' + escapeHtml(relationship.verb) + ' <strong>' + escapeHtml(relationship.to) + '</strong></span>' +
        '<span class="atlas-source-dot ' + escapeHtml(relationship.status || '') + '"></span></button>';
    }).join('');
    document.getElementById('atlas-relationships').addEventListener('click', function (event) {
      var button = event.target.closest('[data-relationship-index]');
      if (!button) return;
      var relationship = state.context.relationships[Number(button.dataset.relationshipIndex)];
      setReader('<p class="atlas-eyebrow">' + escapeHtml(relationship.kind) + '</p><h2>' + escapeHtml(relationship.from) + '</h2>' +
        '<p class="atlas-relationship-sentence">' + escapeHtml(relationship.from) + ' <em>' + escapeHtml(relationship.verb) + '</em> ' + escapeHtml(relationship.to) + '.</p>' +
        '<div class="atlas-evidence"><span>Evidence</span>' + sourceLink(relationship.source_id) + '</div>' +
        '<p class="atlas-truth"><strong>Truth state:</strong> ' + escapeHtml(relationship.status) + '</p>');
    });
  }

  function annotations() {
    try { return JSON.parse(window.localStorage.getItem(storageKey) || '[]'); } catch (_) { return []; }
  }

  function saveAnnotations(items) { window.localStorage.setItem(storageKey, JSON.stringify(items)); }

  function renderAnnotations() {
    var items = annotations().filter(function (item) { return item.context === contextId; }).reverse();
    document.getElementById('atlas-annotation-list').innerHTML = items.length ? items.map(function (item) {
      return '<article class="atlas-annotation"><span>' + escapeHtml(item.type) + '</span><p>' + escapeHtml(item.message) + '</p><time>' + new Date(item.created_at).toLocaleString() + (item.latlng ? ' · map pin' : '') + '</time></article>';
    }).join('') : '<p class="atlas-empty">No local annotations yet.</p>';
  }

  function setupAnnotations() {
    var pinStatus = document.getElementById('atlas-pin-status');
    state.map.on('click', function (event) {
      state.pin = event.latlng;
      pinStatus.textContent = 'Map pin ready: ' + event.latlng.lat.toFixed(5) + ', ' + event.latlng.lng.toFixed(5);
    });
    document.getElementById('atlas-annotation-form').addEventListener('submit', function (event) {
      event.preventDefault();
      var message = document.getElementById('atlas-annotation-message');
      var value = message.value.trim();
      if (!value) return;
      var items = annotations();
      items.push({ id: Date.now(), context: contextId, type: document.getElementById('atlas-annotation-type').value, message: value, latlng: state.pin && { lat: state.pin.lat, lng: state.pin.lng }, created_at: new Date().toISOString() });
      saveAnnotations(items);
      message.value = '';
      state.pin = null;
      pinStatus.textContent = 'Saved locally. Click the map to attach another location.';
      renderAnnotations();
    });
    document.getElementById('atlas-export-annotations').addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(annotations(), null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url; link.download = 'opensolano-atlas-annotations.json'; link.click();
      URL.revokeObjectURL(url);
    });
    renderAnnotations();
  }

  function initMap() {
    state.map = L.map('atlas-map', { zoomControl: false, scrollWheelZoom: true }).setView(state.context.map.center, state.context.map.zoom);
    L.control.zoom({ position: 'bottomleft' }).addTo(state.map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(state.map);
    renderLayerControls();
    (state.context.layers || []).forEach(loadLayer);
  }

  function init() {
    Promise.all([
      fetch('/assets/data/atlas/registry.json').then(function (response) { return response.json(); }),
      fetch('/assets/data/atlas/contexts/' + contextId + '.json').then(function (response) { return response.json(); })
    ]).then(function (results) {
      state.registry = results[0]; state.context = results[1];
      document.getElementById('atlas-title').textContent = state.context.title;
      document.getElementById('atlas-subtitle').textContent = state.context.subtitle;
      if (state.context.notice) document.getElementById('atlas-status').textContent = state.context.notice;
      initMap(); renderTimeline(); renderRelationships(); setupAnnotations();
      document.getElementById('atlas-reader-close').addEventListener('click', function () { document.querySelector('.atlas-reader').classList.remove('is-open'); });
    }).catch(function () {
      document.getElementById('atlas-status').textContent = 'The Atlas context could not be loaded.';
    });
  }

  init();
}());
