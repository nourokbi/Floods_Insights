import { useState, useCallback, useEffect, useRef } from "react";
import "./History.css";
import useSlideNavigation from "../hooks/useSlideNavigation";
import SlideIndicator from "../components/history/SlideIndicator";
import slide1Bg from "../assets/history/slide1-bg.jpg";
import slide1Img from "../assets/history/slide1-img.jpg";
import damFailure from "../assets/history/dam-failure.jpg";
import flashFlood from "../assets/history/flash-flood.jpg";
import riverFlood from "../assets/history/river-flood.jpg";
import coastalFlood from "../assets/history/coastal-flooding.jpg";
import slide3Bg from "../assets/history/slide3-bg.jpg";
import slide4Bg from "../assets/history/slide4-bg.png";
import chartImg from "../assets/history/chart.png";
import hapiImg from "../assets/history/hapi.jpg";
import hapiSlideBg from "../assets/history/hapi-slide-bg.jpg";
import ourSolutionBg from "../assets/history/our-solution-slide-bg.jpg";
import arcgisPro from "../assets/history/arcgis-pro.png";
import reactIcon from "../assets/react.svg";
import scikitIcon from "../assets/history/scikit-learn.svg";
import jsPdfIcon from "../assets/history/jsPDF.svg";
import thankyouBg from "../assets/history/thankyou-bg.jpg";
import confetti from "canvas-confetti";
// Icon set (lucide-react)
import { CloudRain, BarChart2, Bell, Users, FileText } from "lucide-react";

// Reusable Slide wrapper to remove repeated markup
function Slide({ index, currentSlide, className = "", bgImage, children }) {
  const active = currentSlide === index ? "active" : "";
  const style = bgImage ? { backgroundImage: `url(${bgImage})` } : undefined;

  return (
    <div className={`slide ${className} ${active}`} style={style}>
      <div className="slide-content">
        <div className="content-inner">{children}</div>
      </div>
    </div>
  );
}

export default function History() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const glowRef = useRef(null);
  const totalSlides = 9; // updated to match actual slide count
  const confettiTriggeredRef = useRef(false);
  // Trigger confetti when arriving at Thank You slide
  useEffect(() => {
    if (currentSlide === 8 && !confettiTriggeredRef.current) {
      confettiTriggeredRef.current = true;
      const myConfetti = confetti.create(null, {
        resize: true,
        useWorker: true,
      });
      const end = Date.now() + 3000;
      const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];
      function frame() {
        if (Date.now() > end) return;
        myConfetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          startVelocity: 60,
          origin: { x: 0, y: 0.5 },
          colors,
        });
        myConfetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          startVelocity: 60,
          origin: { x: 1, y: 0.5 },
          colors,
        });
        requestAnimationFrame(frame);
      }
      frame();
    }
    if (currentSlide !== 8) {
      confettiTriggeredRef.current = false;
    }
  }, [currentSlide]);

  const goToSlide = useCallback(
    (slideIndex) => {
      if (isAnimating || slideIndex < 0 || slideIndex >= totalSlides) return;

      setIsAnimating(true);
      setCurrentSlide(slideIndex);

      setTimeout(() => {
        setIsAnimating(false);
      }, 800);
    },
    [isAnimating, totalSlides]
  );

  const nextSlide = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      goToSlide(currentSlide + 1);
    }
  }, [currentSlide, totalSlides, goToSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  }, [currentSlide, goToSlide]);

  // Mouse glow effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Update slides container transform
  useEffect(() => {
    const slidesContainer = document.querySelector(".slides-container");
    if (slidesContainer) {
      slidesContainer.style.transform = `translateY(calc(-${currentSlide} * (100vh - 126.11px)))`;
    }
  }, [currentSlide]);

  // Use custom hook for keyboard, wheel, and touch navigation
  useSlideNavigation(currentSlide, totalSlides, isAnimating, goToSlide);

  // PDF download removed per request — reports are presented as a solution in the slide

  return (
    <div className="history-page">
      {/* Mouse Glow Effect */}
      <div ref={glowRef} className="mouse-glow"></div>

      <div className="slides-container">
        {/* Slide 1 - Introduction (two-column: text left, image right) */}
        <Slide
          index={0}
          currentSlide={currentSlide}
          className="slide-5"
          bgImage={hapiSlideBg}
        >
          <h1 className="slide-title">Hapi — God of the Nile's Flood</h1>
          <div
            className="slide-5-layout"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 48%",
              gap: "2rem",
              alignItems: "center",
            }}
          >
            <div className="slide-5-text">
              <p>
                Hapi is the god of the Nile's annual flood — a deity of water
                and fertility.
              </p>
              <p>
                Egyptians celebrated Hapi because the inundation left rich silt
                that made fields fertile and supported crops.
              </p>
              <p>
                Priests performed rituals to honor Hapi and help ensure a
                timely, balanced flood each year.
              </p>
            </div>
            <div className="slide-5-image-wrapper">
              <img
                src={hapiImg}
                alt="Hapi, Nile flood god"
                className="slide-5-image"
              />
            </div>
          </div>
        </Slide>
        <Slide
          index={1}
          currentSlide={currentSlide}
          className="slide-1"
          bgImage={slide1Bg}
        >
          <h1 className="slide-title">What Is a Flood?</h1>
          <div className="slide-1-layout">
            <div className="slide-1-text">
              <p className="intro-text-large">
                Floods occur when water covers land that’s normally dry, often
                caused by heavy rain, rapid snowmelt, storm surges, or
                infrastructure failures. They can develop slowly or strike
                suddenly as flash floods.
              </p>

              <p className="intro-text-large">
                They may strike suddenly or build up over time, lasting from
                hours to weeks and damaging homes and infrastructure.
              </p>

              <p className="intro-text-large">
                Flooding happens when water overflows rivers or coasts, or when
                rain falls faster than the ground can absorb it.
              </p>
            </div>
            <div className="slide-1-image-wrapper">
              <img
                src={slide1Img}
                alt="Flood scene"
                className="slide-1-image"
              />
            </div>
          </div>
        </Slide>

        {/* Slide 2 - Types of Floods */}
        <Slide
          index={2}
          currentSlide={currentSlide}
          className="slide-2"
          bgImage={damFailure}
        >
          <h1 className="slide-title">Types of Floods</h1>
          <p className="slide-subtitle">
            Common flood types and typical causes
          </p>
          <div className="slide-description">
            <ul className="slide-list">
              <li>
                <strong>River (Fluvial) Floods:</strong> Occur when rivers
                overflow due to heavy rainfall or snowmelt, inundating adjacent
                floodplains.
              </li>
              <li>
                <strong>Coastal Floods:</strong> Caused by storm surge, high
                tides, and rising sea levels, affecting coastal communities.
              </li>
              <li>
                <strong>Flash Floods:</strong> Rapid flooding following intense
                short-duration rainfall or dam failures, with little warning
                time.
              </li>
              <li>
                <strong>Urban (Pluvial) Floods:</strong> Result from overwhelmed
                drainage in built environments, where impermeable surfaces
                prevent absorption.
              </li>
            </ul>
          </div>
        </Slide>

        {/* Slide 3 - Flood Examples (gallery) */}
        <Slide
          index={3}
          currentSlide={currentSlide}
          className="gallery"
          bgImage={slide3Bg}
        >
          <h1 className="slide-title">Flood Examples</h1>
          <div className="gallery-grid">
            <div className="img-card">
              <img src={flashFlood} alt="Flash flood" />
              <p className="img-caption">Flash Flood</p>
            </div>
            <div className="img-card">
              <img src={riverFlood} alt="River flood" />
              <p className="img-caption">River Flood</p>
            </div>
            <div className="img-card">
              <img src={damFailure} alt="Dam failure" />
              <p className="img-caption">Dam Failure</p>
            </div>
            <div className="img-card">
              <img src={coastalFlood} alt="Coastal flooding" />
              <p className="img-caption">Coastal Flooding</p>
            </div>
          </div>
        </Slide>

        {/* Slide 4 - Climate Change */}
        <Slide
          index={4}
          currentSlide={currentSlide}
          className="slide-3"
          bgImage={slide4Bg}
        >
          <h1 className="slide-title">Climate Change Impact</h1>
          <div className="slide-description">
            <p className="slide-intro-text">
              Climate change strongly affects how often and how severely floods
              occur. Warmer global temperatures allow the atmosphere to hold
              more moisture, resulting in heavier and more intense rainfall that
              can overwhelm rivers, drainage systems, and flood defenses.
            </p>
            <p>
              Rising sea levels and changing precipitation patterns increase
              both coastal and inland flood risks worldwide.
            </p>
          </div>
          <div className="slide-chart">
            <img src={chartImg} alt="Climate change chart" />
          </div>
        </Slide>

        {/* Slide 5 - Historical Impact */}
        <Slide index={5} currentSlide={currentSlide} className="slide-4">
          <h1 className="slide-title">Historical Impact</h1>
          <p className="slide-subtitle">
            Devastating Flood Events Through Time
          </p>
          <div className="slide-description">
            <ul className="slide-list">
              <li>
                1931 China Floods - Over 1 million casualties, worst natural
                disaster
              </li>
              <li>
                1953 North Sea Flood - 2,551 deaths across Netherlands and UK
              </li>
              <li>
                2010 Pakistan Floods - 20 million people affected, $10B damage
              </li>
              <li>
                2011 Thailand Floods - 815 deaths, economic impact of $45
                billion
              </li>
              <li>
                2013 European Floods - €12 billion in damages across Central
                Europe
              </li>
            </ul>
          </div>
        </Slide>

        {/* Our Mission + Our Solutions */}
        <Slide
          index={6}
          currentSlide={currentSlide}
          className="slide-6"
          bgImage={ourSolutionBg}
        >
          <h1 className="slide-title">Our Mission & Solutions</h1>
          <p className="slide-subtitle">
            Eye of Hapi — real-time awareness, prediction & community support
          </p>

          <div className="slide-description">
            {/* Short Mission Text */}
            <p>
              Supplying real-time, analytics-based flood-risk insights to
              improve community resilience.
            </p>

            {/* Short Solutions List */}
            <ul className="slide-list">
              <li>
                <strong>Interactive Map:</strong> View live weather details,
                local observations, and location-specific conditions.
              </li>
              <li>
                <strong>Real-time Monitoring:</strong> Continuous weather and
                sensor data for immediate situational awareness.
              </li>
              <li>
                <strong>Flood Risk Prediction:</strong> Model-based probability
                levels for each location, from very low to very high.
              </li>
              <li>
                <strong>Community Reporting:</strong> Share posts, photos, and
                on-ground updates to support neighbors and responders.
              </li>
              <li>
                <strong>Reports & Visualizations:</strong> Exportable charts,
                summaries, and historical trends for analysis.
              </li>
            </ul>
          </div>
        </Slide>

        {/* Slide 8 - Technologies */}
        <Slide index={7} currentSlide={currentSlide} className="slide-8">
          <h1 className="slide-title">Technologies</h1>
          <p className="slide-subtitle">
            Tools & libraries used to build <strong>Eye of Hapi</strong>
          </p>
          <div className="slide-description">
            <div className="tech-grid" role="list">
              <div className="tech-item" role="listitem">
                <img className="tech-icon" src={reactIcon} alt="React" />
                <div className="tech-label">React</div>
              </div>
              <div className="tech-item" role="listitem">
                <img className="tech-icon" src="/vite.svg" alt="Vite" />
                <div className="tech-label">Vite</div>
              </div>
              <div className="tech-item" role="listitem">
                <img
                  className="tech-icon"
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"
                  alt="JavaScript"
                />
                <div className="tech-label">JavaScript</div>
              </div>
              <div className="tech-item" role="listitem">
                <img
                  className="tech-icon"
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg"
                  alt="CSS"
                />
                <div className="tech-label">CSS</div>
              </div>

              <div className="tech-item" role="listitem">
                <img
                  className="tech-icon"
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
                  alt="Node.js"
                />
                <div className="tech-label">Node.js</div>
              </div>
              <div className="tech-item" role="listitem">
                <img
                  className="tech-icon"
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg"
                  alt="Express"
                />
                <div className="tech-label">Express</div>
              </div>
              <div className="tech-item" role="listitem">
                <img
                  className="tech-icon"
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg"
                  alt="PostgreSQL"
                />
                <div className="tech-label">PostgreSQL</div>
              </div>
              <div className="tech-item" role="listitem">
                <img
                  className="tech-icon"
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
                  alt="Python"
                />
                <div className="tech-label">Python</div>
              </div>

              <div className="tech-item" role="listitem">
                <img
                  className="tech-icon"
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg"
                  alt="Pandas"
                />
                <div className="tech-label">Pandas</div>
              </div>
              <div className="tech-item" role="listitem">
                <img
                  className="tech-icon"
                  src={scikitIcon}
                  alt="scikit-learn"
                />
                <div className="tech-label">scikit-learn</div>
              </div>
              <div className="tech-item" role="listitem">
                <img className="tech-icon" src={jsPdfIcon} alt="jsPDF" />
                <div className="tech-label">jsPDF / Reports</div>
              </div>
              <div className="tech-item" role="listitem">
                <img className="tech-icon" src={arcgisPro} alt="ArcGIS Pro" />
                <div className="tech-label">ArcGIS Pro / ArcGIS Online</div>
              </div>
            </div>

            <p>
              <strong>Data science & collection:</strong> Model training and
              evaluation (Python, Pandas, scikit-learn). <br />{" "}
              <strong>ArcGIS tools</strong> used for mapping and spatial
              analysis.
            </p>
          </div>
        </Slide>

        {/* Slide 9 - Thank You / Celebration */}
        <Slide
          index={8}
          currentSlide={currentSlide}
          className="slide-9"
          bgImage={thankyouBg}
        >
          <div className="thankyou-wrap">
            <div className="thankyou-panel">
              <h1 className="slide-title thankyou-title">
                Thank you for your attention
              </h1>
              <p className="slide-subtitle">
                Stay safe — and keep an eye on the water.
              </p>
            </div>
            <div className="celebration">
              <div className="water-wave" aria-hidden="true" />
            </div>
          </div>
        </Slide>
      </div>

      <div className="history-graph-section">
        <div className="graph-card">
          <h2 className="graph-title">Flood Risk Trends</h2>
          <p className="graph-subtitle">
            Add a graph illustrating climate-driven flood changes.
          </p>
          <div className="graph-placeholder">
            <img
              src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&q=80"
              alt="Graph placeholder showing flood risk trends"
            />
          </div>
        </div>
      </div>

      {/* Compact control stack on the right: Up button, dots, Down button */}
      <div className="indicator-stack">
        {currentSlide > 0 && (
          <button
            className="nav-arrow nav-arrow-up nav-arrow--compact"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
        )}

        <SlideIndicator
          totalSlides={totalSlides}
          currentSlide={currentSlide}
          onSlideChange={goToSlide}
        />

        {currentSlide < totalSlides - 1 && (
          <button
            className="nav-arrow nav-arrow-down nav-arrow--compact"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
