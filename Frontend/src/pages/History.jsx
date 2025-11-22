import { useState, useCallback, useEffect, useRef } from "react";
import "./History.css";
import useSlideNavigation from "../hooks/useSlideNavigation";
import DeviceNoticeModal from "../components/history/DeviceNoticeModal";
import Slide from "../components/history/Slide";
import SlideHeader from "../components/history/SlideHeader";
import NavigationControls from "../components/history/NavigationControls";
import SlideIndicator from "../components/history/SlideIndicator";
import { SLIDES_CONFIG, TOTAL_SLIDES } from "../data/slidesData";
import { triggerConfetti } from "../utils/confettiHelper";
import { renderSlideContent } from "../components/history/slides/slideContentRenderer";

const SLIDE_TRANSITION_MS = 800;

export default function History() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const glowRef = useRef(null);
  const confettiTriggeredRef = useRef(false);

  // Confetti effect on thank you slide
  useEffect(() => {
    if (currentSlide === 9 && !confettiTriggeredRef.current) {
      confettiTriggeredRef.current = true;
      triggerConfetti();
    }
    if (currentSlide !== 8) {
      confettiTriggeredRef.current = false;
    }
  }, [currentSlide]);

  const goToSlide = useCallback(
    (slideIndex) => {
      if (isAnimating || slideIndex < 0 || slideIndex >= TOTAL_SLIDES) return;
      setIsAnimating(true);
      setCurrentSlide(slideIndex);
      setTimeout(() => setIsAnimating(false), SLIDE_TRANSITION_MS);
    },
    [isAnimating]
  );

  const nextSlide = useCallback(() => {
    if (currentSlide < TOTAL_SLIDES - 1) goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) goToSlide(currentSlide - 1);
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
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Update slides container transform
  useEffect(() => {
    const slidesContainer = document.querySelector(".slides-container");
    if (slidesContainer) {
      slidesContainer.style.transform = `translateY(calc(-${currentSlide} * (100vh - 126.11px)))`;
    }
  }, [currentSlide]);

  useSlideNavigation(currentSlide, TOTAL_SLIDES, isAnimating, goToSlide);

  return (
    <div className="history-page">
      <DeviceNoticeModal />
      <div ref={glowRef} className="mouse-glow"></div>

      <div className="slides-container">
        {SLIDES_CONFIG.map((slide) => (
          <Slide
            key={slide.id}
            index={slide.id}
            currentSlide={currentSlide}
            className={slide.className}
            bgImage={slide.bgImage}
          >
            {slide.title && (
              <SlideHeader title={slide.title} subtitle={slide.subtitle} />
            )}
            <div className="slide-description">
              {renderSlideContent(slide.content)}
            </div>
          </Slide>
        ))}
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

      <NavigationControls
        currentSlide={currentSlide}
        totalSlides={TOTAL_SLIDES}
        onPrevSlide={prevSlide}
        onNextSlide={nextSlide}
        onSlideChange={goToSlide}
      />
    </div>
  );
}
