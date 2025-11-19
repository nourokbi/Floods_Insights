import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function generatePdfReport({
  selectedPoint,
  locationName,
  mapView,
  prediction,
  weatherData,
  nearestQuake,
}) {
  // throws on fatal failures so caller can show an alert
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let y = 40;
  doc.setFontSize(18);
  doc.text("Flood Analysis Report", margin, y);
  y += 24;

  doc.setFontSize(11);
  const coordText = `Coordinates: ${
    selectedPoint.latitude?.toFixed?.(5) ?? selectedPoint.latitude
  }, ${selectedPoint.longitude?.toFixed?.(5) ?? selectedPoint.longitude}`;
  doc.text(
    `Location: ${locationName || selectedPoint.name || "(unnamed)"}`,
    margin,
    y
  );
  y += 14;
  doc.text(coordText, margin, y);
  y += 16;
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  y += 20;

  // Map screenshot (try ArcGIS view.takeScreenshot first)
  let addedMap = false;
  try {
    if (mapView && typeof mapView.takeScreenshot === "function") {
      const ss = await mapView.takeScreenshot({ width: 1200, height: 600 });
      const dataUrl = ss?.dataUrl || ss?.data || ss;
      if (dataUrl) {
        doc.addImage(dataUrl, "JPEG", margin, y, 500, 230);
        y += 240;
        addedMap = true;
      }
    }
  } catch (err) {
    // non-fatal: continue with DOM fallback
    console.warn("ArcGIS screenshot failed:", err);
  }

  // Fallback: capture the map section DOM
  if (!addedMap) {
    try {
      const mapEl = document.querySelector(".map-section");
      if (mapEl) {
        const canvas = await html2canvas(mapEl, { scale: 1.25 });
        const img = canvas.toDataURL("image/jpeg", 0.9);
        doc.addImage(img, "JPEG", margin, y, 500, 230);
        y += 240;
      }
    } catch (err) {
      // non-fatal: still continue
      console.warn("html2canvas map capture failed:", err);
    }
  }

  // Capture charts section (if present) so charts appear in the report
  try {
    const chartsEl = document.querySelector(".charts-section");
    if (chartsEl) {
      const canvasC = await html2canvas(chartsEl, { scale: 1.25 });
      const chartsImg = canvasC.toDataURL("image/png");
      if (y + 260 > doc.internal.pageSize.height) {
        doc.addPage();
        y = 40;
      }
      doc.addImage(chartsImg, "PNG", margin, y, 500, 220);
      y += 230;
    }
  } catch (err) {
    console.warn("Failed to capture charts:", err);
  }

  // Prediction summary (model output)
  if (prediction) {
    if (y + 120 > doc.internal.pageSize.height) {
      doc.addPage();
      y = 40;
    }
    doc.setFontSize(13);
    doc.text("Prediction Summary", margin, y);
    y += 16;
    doc.setFontSize(11);
    doc.text(`Risk level: ${prediction.risk_level || "N/A"}`, margin, y);
    y += 14;
    if (prediction.risk_score != null) {
      doc.text(`Risk score: ${prediction.risk_score}`, margin, y);
      y += 14;
    }
    if (prediction.message) {
      const lines = doc.splitTextToSize(prediction.message, 500);
      doc.text(lines, margin, y);
      y += lines.length * 12 + 6;
    }
  }

  // Weather details
  if (weatherData) {
    if (y + 140 > doc.internal.pageSize.height) {
      doc.addPage();
      y = 40;
    }
    doc.setFontSize(13);
    doc.text("Weather Snapshot", margin, y);
    y += 16;
    doc.setFontSize(11);
    // Try to align precipitation/rain with the current weather time like the WeatherPanel
    const temp = weatherData?.current_weather?.temperature ?? "N/A";
    const wind =
      weatherData?.current_weather?.windspeed ??
      weatherData?.current_weather?.wind_speed ??
      "N/A";
    const time = weatherData?.current_weather?.time ?? "-";

    // hourly arrays may have precipitation and rain entries
    let precip = null;
    let rain = null;
    const hourly = weatherData?.hourly;
    const curIso = weatherData?.current_weather?.time;
    if (hourly?.time && Array.isArray(hourly.time)) {
      let idx = -1;
      if (curIso) idx = hourly.time.indexOf(curIso);
      if (idx === -1) {
        // find nearest timestamp
        const now = Date.now();
        let best = 0,
          bestDiff = Infinity;
        hourly.time.forEach((t, i) => {
          const d = Math.abs(new Date(t).getTime() - now);
          if (d < bestDiff) {
            best = i;
            bestDiff = d;
          }
        });
        idx = best;
      }
      if (idx >= 0) {
        precip = hourly.precipitation
          ? hourly.precipitation[idx] ?? null
          : null;
        rain = hourly.rain ? hourly.rain[idx] ?? null : null;
      }
    }

    doc.text(`Temperature: ${temp} °C`, margin, y);
    y += 14;
    doc.text(
      `Precipitation: ${precip != null ? `${precip} mm` : "N/A"}`,
      margin,
      y
    );
    y += 14;
    doc.text(`Rainfall: ${rain != null ? `${rain} mm` : "N/A"}`, margin, y);
    y += 14;
    doc.text(`Wind speed: ${wind} m/s`, margin, y);
    y += 14;
    doc.text(`Reference time: ${time}`, margin, y);
    y += 16;
  }

  // Nearest Earthquake details (if provided)
  if (nearestQuake) {
    if (y + 140 > doc.internal.pageSize.height) {
      doc.addPage();
      y = 40;
    }
    doc.setFontSize(13);
    doc.text("Nearest Earthquake", margin, y);
    y += 16;
    doc.setFontSize(11);
    doc.text(`Magnitude: ${nearestQuake.magnitude ?? "N/A"}`, margin, y);
    y += 14;
    doc.text(`Distance: ${nearestQuake.distance ?? "N/A"} km`, margin, y);
    y += 14;
    if (nearestQuake.depth != null) {
      doc.text(`Depth: ${nearestQuake.depth} km`, margin, y);
      y += 14;
    }
    if (nearestQuake.time) {
      const t =
        nearestQuake.time instanceof Date
          ? nearestQuake.time
          : new Date(nearestQuake.time);
      doc.text(`Time: ${t.toLocaleString()}`, margin, y);
      y += 14;
    }
    if (nearestQuake.place) {
      const placeLines = doc.splitTextToSize(nearestQuake.place, 500);
      doc.text(placeLines, margin, y);
      y += placeLines.length * 12 + 6;
    }
    if (nearestQuake.url) {
      const urlLines = doc.splitTextToSize(nearestQuake.url, 500);
      doc.text(urlLines, margin, y);
      y += urlLines.length * 12 + 6;
    }
  }

  // Footer and save
  doc.setFontSize(9);
  const footer = `Generated by Floods Insights — ${new Date().toLocaleString()}`;
  doc.text(footer, margin, doc.internal.pageSize.height - 30);
  doc.save(`flood-report-${Date.now()}.pdf`);
}

export default generatePdfReport;
