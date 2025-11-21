import { useState, useRef, useEffect } from "react";
import SlideContainer from "./SlideContainer";
import NavigationButtons from "./NavigationButtons";
import useConfetti from "./useConfetti";

import {
  Slide1, Slide2, Slide3, SlideGallery,
  Slide4, Slide5, Slide6, Slide7, Slide8, Slide9
} from "./slides";

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const confettiTriggeredRef = useRef(false);

  useConfetti(currentSlide, confettiTriggeredRef);

  const galleryImages = [
    "/images/gallery/img1.jpg",
    "/images/gallery/img2.jpg",
    "/images/gallery/img3.jpg",
    "/images/gallery/img4.jpg",
    "/images/gallery/img5.jpg",
    "/images/gallery/img6.jpg",
  ];

  const slides = [
    <Slide1 />,
    <Slide2 />,
    <SlideGallery images={galleryImages} />,
    <Slide3 />,
    <Slide4 />,
    <Slide5 />,
    <Slide6 />,
    <Slide7 />,
    <Slide8 />,
    <Slide9 />,
  ];

  const next = () =>
    currentSlide < slides.length - 1 && setCurrentSlide(s => s + 1);

  const prev = () =>
    currentSlide > 0 && setCurrentSlide(s => s - 1);

  useEffect(() => {
    const handleKey = e => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentSlide]);

  return (
    <SlideContainer>
      {slides[currentSlide]}
      <NavigationButtons
        goNext={next}
        goPrevious={prev}
        disableNext={currentSlide === slides.length - 1}
        disablePrev={currentSlide === 0}
      />
    </SlideContainer>
  );
}