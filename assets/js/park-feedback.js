/*
 * Park feedback page logic (opensolano.org/feedback).
 *
 * Pure helpers (haversine distance, nearest parks, query parsing, mailto
 * composition) are exported for tests; `init` wires the DOM.
 * Runs in the browser as `window.ParkFeedback` and in Node via require().
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ParkFeedback = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var EARTH_RADIUS_MILES = 3958.7613;

  function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  // Great-circle distance in miles between two [lat, lng] pairs.
  function haversineMiles(a, b) {
    var lat1 = toRadians(a[0]);
    var lat2 = toRadians(b[0]);
    var dLat = toRadians(b[0] - a[0]);
    var dLng = toRadians(b[1] - a[1]);
    var h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
  }

  // Slug from a `?park=<slug>` query string, or null when absent/blank.
  function parkSlugFromSearch(search) {
    var match = /[?&]park=([^&#]*)/.exec(search || "");
    if (!match) return null;
    var slug = decodeURIComponent(match[1].replace(/\+/g, " ")).trim().toLowerCase();
    return slug.length ? slug : null;
  }

  function findPark(parks, slug) {
    if (!slug) return null;
    for (var i = 0; i < parks.length; i++) {
      if (parks[i].slug === slug) return parks[i];
    }
    return null;
  }

  // The `limit` closest parks to `park`, nearest first, excluding itself.
  function nearestParks(parks, park, limit) {
    var out = [];
    for (var i = 0; i < parks.length; i++) {
      var other = parks[i];
      if (other.slug === park.slug) continue;
      if (!other.center || !park.center) continue;
      out.push({ park: other, miles: haversineMiles(park.center, other.center) });
    }
    out.sort(function (a, b) {
      return a.miles - b.miles;
    });
    return typeof limit === "number" ? out.slice(0, limit) : out;
  }

  function formatMiles(miles) {
    if (miles < 0.1) return "< 0.1 mi";
    return miles.toFixed(1) + " mi";
  }

  var CATEGORY_LABELS = {
    problem: "Something needs attention",
    idea: "An idea",
    working: "What's working"
  };

  function categoryLabel(category) {
    return CATEGORY_LABELS[category] || category || "";
  }

  // mailto: URL for a submission when no form endpoint is configured.
  function buildMailto(to, submission) {
    var parkName = submission.park_name || "Unspecified park";
    var subject = "Park feedback: " + parkName + " (" + categoryLabel(submission.category) + ")";
    var lines = [
      "Park: " + parkName + (submission.park_slug ? " [" + submission.park_slug + "]" : ""),
      "Category: " + categoryLabel(submission.category),
      "",
      submission.message || "",
      "",
      "Contact: " + (submission.contact || "(none given)"),
      "Source: " + (submission.source || "web"),
      "Page: " + (submission.page_url || "")
    ];
    return (
      "mailto:" +
      encodeURIComponent(to) +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(lines.join("\n"))
    );
  }

  // Form-encoded body for a Touchpoints form. `fields` maps each answer to its
  // question id; unmapped and blank answers are left out.
  function buildSubmissionBody(submission, fields) {
    var parkName = submission.park_name || "Unspecified park";
    var answers = {
      park: parkName + (submission.park_slug ? " [" + submission.park_slug + "]" : ""),
      category: categoryLabel(submission.category),
      message: submission.message,
      contact: submission.contact,
      source: submission.source,
      page_url: submission.page_url
    };
    var params = new URLSearchParams();
    Object.keys(answers).forEach(function (key) {
      if (fields[key] && answers[key]) {
        params.append("submission[question_" + fields[key] + "]", answers[key]);
      }
    });
    return params.toString();
  }

  // What replaces the form once Touchpoints has the feedback. `data` is the
  // submit response; a ticket id shows only when Touchpoints returns one.
  function successHtml(parkName, data) {
    var ticket = data && data.ticket_id ? String(data.ticket_id) : "";
    var statusUrl = data && data.status_url ? String(data.status_url) : "";
    var html =
      "<h2 class=\"text-lg font-semibold\">Thank you.</h2>" +
      "<p class=\"mt-2\">Your feedback about " +
      escapeHtml(parkName || "the park") +
      " was received.</p>";
    if (ticket) {
      html +=
        "<p class=\"mt-2\">Your ticket: <strong class=\"font-mono\">" +
        escapeHtml(ticket) +
        "</strong></p>";
    }
    if (statusUrl && /^https:\/\//.test(statusUrl)) {
      html +=
        "<p class=\"mt-2\"><a class=\"underline\" href=\"" +
        escapeHtml(statusUrl) +
        "\">See your submission</a></p>";
    }
    html +=
      "<p class=\"mt-4\"><button type=\"button\" data-feedback-again " +
      "class=\"underline\">Send more feedback</button></p>";
    return html;
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function submissionFromForm(form) {
    var data = new FormData(form);
    var submission = {};
    data.forEach(function (value, key) {
      submission[key] = typeof value === "string" ? value.trim() : value;
    });
    return submission;
  }

  // ---------------------------------------------------------------------
  // DOM wiring. `config` = { parks, endpoint, fields, mailto, nearbyLimit }.
  // ---------------------------------------------------------------------
  function init(config) {
    var parks = config.parks || [];
    var nearbyLimit = config.nearbyLimit || 5;
    var doc = document;

    var select = doc.getElementById("park-select");
    var form = doc.getElementById("feedback-form");
    var parkSlugInput = doc.getElementById("park-slug");
    var parkNameInput = doc.getElementById("park-name");
    var sourceInput = doc.getElementById("feedback-source");
    var pageUrlInput = doc.getElementById("feedback-page-url");
    var parkSummary = doc.getElementById("park-summary");
    var nearbySection = doc.getElementById("nearby");
    var nearbyList = doc.getElementById("nearby-list");
    var nearbyHeading = doc.getElementById("nearby-heading");
    var status = doc.getElementById("form-status");
    var done = doc.getElementById("form-done");
    var submitButton = doc.getElementById("submit-button");

    var initialSlug = parkSlugFromSearch(window.location.search);
    var current = findPark(parks, initialSlug);
    var map = null;
    var markers = {};

    if (sourceInput) sourceInput.value = initialSlug ? "sign" : "web";
    if (pageUrlInput) pageUrlInput.value = window.location.href;

    function parkPageUrl(park) {
      return park.has_page === false ? null : "/cities/vacaville/parks/" + park.slug + "/";
    }

    function feedbackUrl(park) {
      return "/feedback?park=" + encodeURIComponent(park.slug);
    }

    function renderSummary() {
      if (!parkSummary) return;
      if (!current) {
        parkSummary.hidden = true;
        parkSummary.innerHTML = "";
        return;
      }
      var bits = [];
      if (current.type) bits.push(escapeHtml(current.type) + " park");
      if (current.acres) bits.push(escapeHtml(current.acres) + " acres");
      if (current.location) bits.push(escapeHtml(current.location));
      var html = "<span>" + bits.join(" · ") + "</span>";
      var url = parkPageUrl(current);
      if (url) {
        html +=
          ' <a class="underline text-teal-700 hover:text-teal-900" href="' +
          url +
          '">Park page</a>';
      }
      parkSummary.innerHTML = html;
      parkSummary.hidden = false;
    }

    function renderNearby() {
      if (!nearbySection || !nearbyList) return;
      if (!current) {
        nearbyHeading.textContent = "All Vacaville parks";
        nearbyList.innerHTML = "";
        var sorted = parks.slice().sort(function (a, b) {
          return a.park_name.localeCompare(b.park_name);
        });
        sorted.forEach(function (park) {
          nearbyList.appendChild(nearbyItem(park, null));
        });
        return;
      }
      nearbyHeading.textContent = "Parks near " + current.park_name;
      nearbyList.innerHTML = "";
      nearestParks(parks, current, nearbyLimit).forEach(function (entry) {
        nearbyList.appendChild(nearbyItem(entry.park, entry.miles));
      });
    }

    function nearbyItem(park, miles) {
      var li = doc.createElement("li");
      li.className = "flex items-baseline justify-between gap-3 py-2 border-b border-gray-100";
      var left = doc.createElement("a");
      left.href = feedbackUrl(park);
      left.className = "text-sm font-medium text-gray-900 hover:text-teal-700";
      left.textContent = park.park_name;
      left.setAttribute("data-slug", park.slug);
      left.addEventListener("click", function (event) {
        event.preventDefault();
        setPark(park.slug, true);
      });
      li.appendChild(left);
      var right = doc.createElement("span");
      right.className = "text-sm text-gray-500 whitespace-nowrap";
      right.textContent = miles === null ? park.type || "" : formatMiles(miles);
      li.appendChild(right);
      return li;
    }

    function renderMap() {
      if (typeof L === "undefined" || !doc.getElementById("nearby-map")) return;
      if (!map) {
        map = L.map("nearby-map", { scrollWheelZoom: false });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        parks.forEach(function (park) {
          if (!park.center) return;
          var marker = L.circleMarker(park.center, {
            radius: 6,
            color: "#0f766e",
            weight: 1.5,
            fillColor: "#0f766e",
            fillOpacity: 0.5
          }).addTo(map);
          marker.bindTooltip(park.park_name);
          marker.on("click", function () {
            setPark(park.slug, true);
          });
          markers[park.slug] = marker;
        });
      }
      // Set the view first: until the map has one, Leaflet hasn't drawn the
      // markers, and bringToFront on an undrawn marker throws.
      if (current && current.center) {
        var points = [current.center];
        nearestParks(parks, current, nearbyLimit).forEach(function (entry) {
          points.push(entry.park.center);
        });
        map.fitBounds(L.latLngBounds(points), { padding: [24, 24], maxZoom: 15 });
      } else {
        var all = parks
          .filter(function (park) {
            return park.center;
          })
          .map(function (park) {
            return park.center;
          });
        if (all.length) map.fitBounds(L.latLngBounds(all), { padding: [16, 16] });
      }
      Object.keys(markers).forEach(function (slug) {
        var isCurrent = current && slug === current.slug;
        markers[slug].setStyle({
          radius: isCurrent ? 9 : 6,
          fillOpacity: isCurrent ? 0.95 : 0.5,
          color: isCurrent ? "#134e4a" : "#0f766e"
        });
        if (isCurrent) markers[slug].bringToFront();
      });
    }

    function setPark(slug, pushUrl) {
      current = findPark(parks, slug);
      if (select) select.value = current ? current.slug : "";
      if (parkSlugInput) parkSlugInput.value = current ? current.slug : "";
      if (parkNameInput) parkNameInput.value = current ? current.park_name : "";
      renderSummary();
      renderNearby();
      renderMap();
      if (pushUrl && window.history && window.history.replaceState) {
        var url = current ? feedbackUrl(current) : "/feedback";
        window.history.replaceState(null, "", url);
      }
    }

    if (select) {
      select.addEventListener("change", function () {
        setPark(select.value, true);
      });
    }

    function showStatus(kind, html) {
      if (!status) return;
      status.className =
        "mt-4 rounded-md border p-4 text-sm " +
        (kind === "ok"
          ? "border-teal-200 bg-teal-50 text-teal-900"
          : "border-red-200 bg-red-50 text-red-900");
      status.innerHTML = html;
      status.hidden = false;
      status.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    // Replace the form with the confirmation; "Send more feedback" brings it back.
    function showDone(parkName, data) {
      if (!done) {
        showStatus("ok", successHtml(parkName, data));
        return;
      }
      done.innerHTML = successHtml(parkName, data);
      if (status) status.hidden = true;
      form.hidden = true;
      done.hidden = false;
      done.focus();
      done.scrollIntoView({ behavior: "smooth", block: "nearest" });
      var again = done.querySelector("[data-feedback-again]");
      if (again) {
        again.addEventListener("click", function () {
          done.hidden = true;
          form.hidden = false;
          var message = form.querySelector("#message");
          if (message) message.focus();
        });
      }
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        var submission = submissionFromForm(form);
        if (!submission.park_slug) {
          event.preventDefault();
          showStatus("error", "Please choose a park first.");
          if (select) select.focus();
          return;
        }
        if (submission._gotcha) {
          event.preventDefault();
          return;
        }
        var mailtoHref = buildMailto(config.mailto, submission);

        event.preventDefault();
        if (!config.endpoint || !window.fetch) {
          window.location.href = mailtoHref;
          showStatus(
            "ok",
            "Your mail app should open with the feedback filled in. " +
              "If it did not, <a class=\"underline\" href=\"" +
              escapeHtml(mailtoHref) +
              "\">send it by email</a> to " +
              escapeHtml(config.mailto) +
              "."
          );
          return;
        }

        submitButton.disabled = true;
        var sent = false;
        fetch(config.endpoint, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: buildSubmissionBody(submission, config.fields || {})
        })
          .then(function (response) {
            if (!response.ok) throw new Error("HTTP " + response.status);
            sent = true;
            return response.json().catch(function () {
              return {};
            });
          })
          .then(function (data) {
            if (!sent) return;
            showDone(submission.park_name, data);
            form.reset();
            setPark(submission.park_slug, false);
          })
          .catch(function (error) {
            // Once the feedback is in, a problem redrawing the page must not
            // tell the visitor to send it again.
            if (sent) {
              if (window.console) console.error(error);
              return;
            }
            showStatus(
              "error",
              "Sending failed. You can <a class=\"underline\" href=\"" +
                escapeHtml(mailtoHref) +
                "\">send it by email</a> instead."
            );
          })
          .then(function () {
            submitButton.disabled = false;
          });
      });
    }

    setPark(current ? current.slug : null, false);
  }

  return {
    haversineMiles: haversineMiles,
    parkSlugFromSearch: parkSlugFromSearch,
    findPark: findPark,
    buildSubmissionBody: buildSubmissionBody,
    successHtml: successHtml,
    nearestParks: nearestParks,
    formatMiles: formatMiles,
    categoryLabel: categoryLabel,
    buildMailto: buildMailto,
    escapeHtml: escapeHtml,
    init: init
  };
});
