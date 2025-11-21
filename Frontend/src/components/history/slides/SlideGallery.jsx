import React from "react";
import flashFlood from "../../../assets/history/flash-flood.jpg";
import riverFlood from "../../../assets/history/river-flood.jpg";
import damFailure from "../../../assets/history/dam-failure.jpg";
import coastalFlood from "../../../assets/history/coastal-flooding.jpg";

export default function SlideGallery() {
  const images = [
    { src: flashFlood, label: "Flash Flood" },
    { src: riverFlood, label: "River Flood" },
    { src: damFailure, label: "Dam Failure" },
    { src: coastalFlood, label: "Coastal Flooding" },
  ];

  return (
    <div className="gallery-grid">
      {images.map((img, idx) => (
        <div className="img-card" key={idx}>
          <img src={img.src} alt={img.label} />
          <p className="img-caption">{img.label}</p>
        </div>
      ))}
    </div>
  );
}
