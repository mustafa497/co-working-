import { useEffect, useRef, useState } from "react";
import AmenitiesMarquee from "./components/AmenitiesMarquee";
import { BookingConcierge } from "./components/booking/BookingConcierge";
import CommunitySection from "./components/CommunitySection";
import { FigmaFunctionalNav } from "./components/layout/FigmaFunctionalNav";
import { LocationsMapSection } from "./components/locations/LocationsMapSection";
import PageLoader from "./components/PageLoader";
import { PlansScrollSection } from "./components/PlansScrollSection";
import PurposeHallsSection from "./components/PurposeHallsSection";
import WhyWorkHallSection from "./components/WhyWorkHallSection";
import { ClickSpark } from "./components/shared/effects";
import { ShuffleText } from "./components/shared/ShuffleText";
import workhallOrange from "./assets/workhall-orange.svg";
import "./App.css";
import "./styles/figma-match.css";
import { PageTransition } from "./components/PageTransition";
import PromiseSection from "./components/PromiseSection/PromiseSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { WorkspaceFitQuizSection } from "./components/WorkspaceFitQuizSection";
import Footer from "./components/Footer/Footer";
import { workHallLocations } from "./data/siteContent";
import { heroSlides } from "./data/heroSlides";
import FoldingCards from "./components/FoldingCards";
import type { WorkspaceQuizAnswers } from "./types/site";
import { TextEffectsLab } from "./components/TextEffectsLab";
import { useLocation } from "react-router-dom";
import { getLocationPage } from "./data/locationPages";
import { LocationPage } from "./pages/LocationPage";
const stats = [
  { target: 6, suffix: "", label: "Location", color: "#15110d", pad: 2, duration: 2200, delay: 900 },
  { target: 7, suffix: "+", label: "Years", color: "#15110d", pad: 2, duration: 2300, delay: 980 },
  { target: 800, suffix: "+", label: "Seats", color: "#15110d", pad: 0, duration: 1250, delay: 1060 },
  { target: 40, suffix: "k+", label: "Sq.ft area", color: "#15110d", pad: 2, duration: 2700, delay: 1140 },
];
const heroStatLineHeight = 1.16;

function HeroStatCounter({ target, suffix, pad, color, duration, delay, isActive }: typeof stats[number] & { isActive: boolean }) {
  const format = (value: number) => `${String(value).padStart(pad, "0")}${suffix}`;

  return (
    <strong className="figma-stat__counter" style={{ color }} aria-label={format(target)}>
      <span className="figma-stat__counter-window" aria-hidden="true">
        <span className="figma-stat__counter-reel" style={{ transform: isActive ? `translateY(-${target * heroStatLineHeight}em)` : "translateY(0)", transition: `transform ${duration}ms cubic-bezier(.45, 0, .15, 1) ${delay}ms` }}>
          {Array.from({ length: target + 1 }, (_, value) => <span key={value}>{format(value)}</span>)}
        </span>
      </span>
    </strong>
  );
}

function App() {
  const location = useLocation();
  const whyWorkHallRef = useRef(null);
  const [selectedLocationId, setSelectedLocationId] = useState(
    workHallLocations[0].id,
  );

  const [loaderDone, setLoaderDone] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    if (!loaderDone) return;
    const timeout = window.setTimeout(() => setIsLoaded(true), 0);
    return () => window.clearTimeout(timeout);
  }, [loaderDone]);

  const handleQuizComplete = (answers: WorkspaceQuizAnswers) => {
    if (answers.locationId) {
      setSelectedLocationId(answers.locationId);
    }

    document
      .getElementById("locations")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!loaderDone) {
    // return <PageLoader onComplete={() => setLoaderDone(true)} />;
    // return setLoaderDone(true);
  }

  if (location.pathname === "/text-effects-lab") {
    return <TextEffectsLab />;
  }

  if (location.pathname.startsWith("/locations/")) {
    const locationSlug = location.pathname.split("/").filter(Boolean)[1] ?? "";
    const locationPage = getLocationPage(locationSlug);

    if (locationPage) return <LocationPage location={locationPage} />;
  }

  return (
    <>
      <ClickSpark
        sparkColor="#d26d45"
        sparkSize={14}
        sparkRadius={22}
        sparkCount={10}
        duration={480}
      >
        <PageTransition onComplete={() => setLoaderDone(true)}>
          <main
            className={
              isLoaded
                ? "figma-page-shell hero-page is-loaded"
                : "figma-page-shell hero-page"
            }
          >
            <a
              className="hero-brand-mark"
              href="#top"
              aria-label="WorkHall home"
            >
              <img src={workhallOrange} alt="WorkHall" />
            </a>
            <FigmaFunctionalNav isLoaded={isLoaded} />
            <section
              className="figma-hero figma-hero--clipped"
              aria-labelledby="hero-title"
            >
              <div className="figma-hero__left-column">
                <article className="figma-hero__copy-card hero-left-card">
                  <div className="figma-hero__headline-block headline-block">
                    <div className="word-row">
                      {["Re-Think", "Your"].map((word, index) => (
                        <div className="word-mask" key={word}>
                          <span
                            className="word-rise"
                            style={{ animationDelay: `${620 + index * 130}ms` }}
                          >
                            {word}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="word-row orange-line">
                      <div className="word-mask">
                        <span
                          className="word-rise"
                          style={{ animationDelay: "880ms" }}
                        >
                          Workspace.
                        </span>
                      </div>
                    </div>
                    <h1 id="hero-title">
                      <span><ShuffleText text="Re-Think Your" finalColor="#15110d" /></span>
                      <em><ShuffleText text="Workspace." startDelay={120} finalColor="#15110d" /></em>
                    </h1>
                  </div>

                  <p className="figma-hero__lede hero-subheading">
                    With Pakistan&apos;s most flexible coworking spaces, open
                    24/7, across 6 locations. All built for the way you actually
                    work, not the way an office thinks you should.
                  </p>

                  <div
                    className="figma-search-card booking-widget"
                    aria-label="Workspace search"
                  >
                    <BookingConcierge
                      variant="hero"
                      seatsLabel="How Many Friends?"
                      submitLabel="Make Enquiry"
                    />
                  </div>

                  <section
                    className="figma-stats-card stats-bar"
                    aria-label="WorkHall stats"
                  >
                    {stats.map((stat) => (
                      <div key={stat.label} className="figma-stat">
                        <HeroStatCounter {...stat} isActive={isLoaded} />
                        <span style={{ color: stat.color }}>{stat.label}</span>
                      </div>
                    ))}
                  </section>
                </article>
              </div>

              <aside
                className="figma-hero__image-card hero-image-card"
                aria-label="Workspace preview image"
              >
                <FoldingCards slides={heroSlides} label="WorkHall workspaces" />
              </aside>
            </section>
            <AmenitiesMarquee />
            <PlansScrollSection />
            <PurposeHallsSection />
            <CommunitySection targetRef={whyWorkHallRef} />
            <WhyWorkHallSection ref={whyWorkHallRef} />
            <PromiseSection />
            <section
              className="testimonials-intro-strip"
              aria-labelledby="testimonials-intro-title"
            >
              <div className="testimonials-intro-strip__inner">
                <h2
                  id="testimonials-intro-title"
                  className="testimonials-intro-strip__title"
                >
                  <ShuffleText
                    text={"though don't just\ntake our word for it"}
                    finalColor="currentColor"
                    rootMargin="0px 0px -12% 0px"
                  />
                </h2>
                <p className="testimonials-intro-strip__copy">
                  Hear it from member teams and individuals who have actually
                  worked out of WorkHall and been part of the community here.
                </p>
              </div>
            </section>
            <TestimonialsSection />
            <WorkspaceFitQuizSection onComplete={handleQuizComplete} />
            <LocationsMapSection
              selectedLocationId={selectedLocationId}
              onSelectedLocationChange={setSelectedLocationId}
            />
            <Footer onSubscribe={(email) => console.log(email)} />
          </main>
        </PageTransition>
      </ClickSpark>
    </>
  );
}

export default App;
