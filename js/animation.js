document.addEventListener("DOMContentLoaded", () => {
  /* ===========================
     HEADER SCROLL LOGIC
  ============================ */
  const headerTop = document.getElementById("header-top");
  const headerSticky = document.getElementById("header-sticky");
  const scrollThreshold = 50;

  const handleHeaderScroll = () => {
    if (window.scrollY > scrollThreshold) {
      headerTop.classList.add("opacity-0", "invisible");
      headerSticky.classList.remove("-translate-y-full", "invisible");
      headerSticky.classList.add("translate-y-0");
    } else {
      headerTop.classList.remove("opacity-0", "invisible");
      headerSticky.classList.add("-translate-y-full", "invisible");
      headerSticky.classList.remove("translate-y-0");
    }
  };

  /* ===========================
     MOBILE MENU LOGIC
  ============================ */
  const menuToggleButtons = document.querySelectorAll(".mobile-menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const menuIconOpen = document.querySelectorAll(".menu-icon-open");
  const menuIconClose = document.querySelectorAll(".menu-icon-close");

  const toggleMenu = () => {
    mobileMenu.classList.toggle("opacity-0");
    mobileMenu.classList.toggle("invisible");
    menuIconOpen.forEach((icon) => icon.classList.toggle("hidden"));
    menuIconClose.forEach((icon) => icon.classList.toggle("hidden"));
  };

  menuToggleButtons.forEach((button) =>
    button.addEventListener("click", toggleMenu)
  );

  mobileMenu.querySelectorAll(".mobile-menu-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (!mobileMenu.classList.contains("invisible")) toggleMenu();
    });
  });

  // --- MOBILE DROPDOWNS ---
  const dropdownToggles = document.querySelectorAll(".mobile-dropdown-toggle");
  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const content = toggle.nextElementSibling;
      const icon = toggle.querySelector("svg");
      content.classList.toggle("hidden");
      icon.classList.toggle("rotate-180");
    });
  });

  /* ===========================
     SLIDER LOGIC
  ============================ */
  const $items = document.querySelectorAll(".carousel-item");
  const numItems = $items.length;
  const $container = document.querySelector(".sticky-scroll-container");
  const $prevBtn = document.getElementById("prev-btn");
  const $nextBtn = document.getElementById("next-btn");

  let progress = 0;
  let active = 0;

  const getZindex = (array, index) =>
    array.map((_, i) =>
      index === i ? array.length : array.length - Math.abs(index - i)
    );

  const displayItems = (item, index, active) => {
    const zIndex = getZindex([...$items], active)[index];
    item.style.setProperty("--zIndex", zIndex);
    item.style.setProperty("--active", (index - active) / $items.length);
    item.style.opacity = index === active ? "1" : "0.4";
  };

  const animate = () => {
    progress = Math.max(0, Math.min(progress, 100));
    active = numItems > 0 ? Math.floor((progress / 100) * (numItems - 1)) : 0;
    $items.forEach((item, index) => displayItems(item, index, active));
    if ($prevBtn && $nextBtn) {
      $prevBtn.disabled = active === 0;
      $nextBtn.disabled = active === numItems - 1;
    }
  };

  const handleScroll = () => {
    if (!$container) return;
    const containerTop = $container.offsetTop;
    const containerHeight = $container.offsetHeight;
    const viewportHeight = window.innerHeight;
    const totalScrollableDistance = containerHeight - viewportHeight;
    const pauseDistance = viewportHeight * 1;
    const animationDistance = totalScrollableDistance - pauseDistance;

    let scrollAmount = window.scrollY - containerTop;
    scrollAmount = Math.max(0, Math.min(scrollAmount, totalScrollableDistance));

    progress =
      animationDistance > 0
        ? (scrollAmount / animationDistance) * 100
        : window.scrollY > containerTop
        ? 100
        : 0;

    animate();
  };

  const scrollToItem = (index) => {
    if (numItems <= 1) return;
    const targetIndex = Math.max(0, Math.min(index, numItems - 1));
    const targetProgress = (targetIndex / (numItems - 1)) * 100;

    if ($container) {
      const containerHeight = $container.offsetHeight;
      const viewportHeight = window.innerHeight;
      const totalScrollableDistance = containerHeight - viewportHeight;
      const pauseDistance = viewportHeight * 1;
      const animationDistance = totalScrollableDistance - pauseDistance;

      const newScrollY =
        $container.offsetTop + (targetProgress / 100) * animationDistance;

      window.scrollTo({ top: newScrollY, behavior: "smooth" });
    }
  };

  $items.forEach((item, i) => {
    item.addEventListener("click", (e) => {
      if (e.target.closest("a") || e.target.closest("button")) return;
      scrollToItem(i);
    });
  });

  if ($prevBtn && $nextBtn) {
    $prevBtn.addEventListener("click", () => scrollToItem(active - 1));
    $nextBtn.addEventListener("click", () => scrollToItem(active + 1));
  }

  /* ===========================
     GSAP SCROLL ANIMATIONS
  ============================ */
  if (typeof gsap !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

    gsap.to("#surfer", {
      motionPath: {
        path: "#wave-path",
        align: "#wave-path",
        alignOrigin: [0.5, 0.7],
        autoRotate: true,
      },
      scrollTrigger: {
        trigger: "#animation-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
      ease: "none",
    });

    const path = document.querySelector("#wave-path");
    const surfer = document.querySelector("#surfer");
    if (path && surfer) {
      const pathLength = path.getTotalLength();
      path.style.strokeDasharray = pathLength;
      path.style.strokeDashoffset = pathLength;

      gsap.to(path, {
        strokeDashoffset: 0,
        scrollTrigger: {
          trigger: "#animation-container",
          start: "bottom 80%",
          end: "center 30%",
          scrub: 1,
        },
      });

      gsap.to(surfer, {
        motionPath: {
          path: "#wave-path",
          align: "#wave-path",
          alignOrigin: [0.5, 0.7],
          autoRotate: true,
        },
        scrollTrigger: {
          trigger: "#animation-container",
          start: "bottom 75%",
          end: "center 28%",
          scrub: 1,
        },
      });
    }
  }

  /* ===========================
     HEADER COLOR CHANGE (Transparent Header)
  ============================ */
  const header = document.getElementById("main-header");
  const logo = document.getElementById("logo");
  const navLinks = document.querySelectorAll("#nav-links a");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");

  const handleTransparentHeader = () => {
    if (!header) return;
    if (window.scrollY > 50) {
      header.classList.add(
        "bg-[#f0f5d6]/80",
        "backdrop-blur-md",
        "shadow-lg"
      );
      header.style.paddingTop = "15px";
      header.style.paddingBottom = "15px";
      logo?.classList.replace("text-white", "text-[#c15402]");
      mobileMenuBtn?.classList.replace("text-white", "text-gray-800");
      navLinks.forEach((link) => {
        link.classList.remove("text-white", "hover:text-white/80");
        link.classList.add("text-gray-700", "hover:text-[#c15402]");
      });
    } else {
      header.classList.remove(
        "bg-[#f0f5d6]/80",
        "backdrop-blur-md",
        "shadow-lg"
      );
      header.style.paddingTop = "30px";
      header.style.paddingBottom = "30px";
      logo?.classList.replace("text-[#c15402]", "text-white");
      mobileMenuBtn?.classList.replace("text-gray-800", "text-white");
      navLinks.forEach((link) => {
        link.classList.add("text-white", "hover:text-white/80");
        link.classList.remove("text-gray-700", "hover:text-[#c15402]");
      });
    }
  };

  /* ===========================
     SCROLL PERFORMANCE COMBINED
  ============================ */
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleHeaderScroll();
          handleScroll();
          handleTransparentHeader();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  // Initial state
  handleHeaderScroll();
  handleTransparentHeader();
  handleScroll();
});


/* ACTIVITIES CAROUSEL */
const lessonsTrack = document.getElementById('lessonsTrack');
const lessonsPrev = document.getElementById('lessonsPrev');
const lessonsNext = document.getElementById('lessonsNext');

const LESSONS_CLONE = 3;
let lessonsIndex = LESSONS_CLONE;
let lessonsAuto;
let lessonsTransition = false;

const lessonsItems = Array.from(lessonsTrack.children);

// Clone items
const lessonsStartClones = lessonsItems.slice(-LESSONS_CLONE).map(i => i.cloneNode(true));
const lessonsEndClones = lessonsItems.slice(0, LESSONS_CLONE).map(i => i.cloneNode(true));

lessonsStartClones.forEach(c => lessonsTrack.insertBefore(c, lessonsTrack.firstChild));
lessonsEndClones.forEach(c => lessonsTrack.appendChild(c));

const lessonsAll = Array.from(lessonsTrack.children);
const lessonsRealCount = lessonsItems.length;

function lessonsSlidesToShow() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
}

function updateLessons(animate = true) {
    const show = lessonsSlidesToShow();
    const w = 100 / show;

    lessonsTrack.style.transition = animate ? "transform 0.5s ease" : "none";
    lessonsTrack.style.transform = `translateX(-${lessonsIndex * w}%)`;
}

function lessonsNextSlide() {
    if (lessonsTransition) return;
    lessonsTransition = true;
    lessonsIndex++;
    updateLessons(true);
}

function lessonsPrevSlide() {
    if (lessonsTransition) return;
    lessonsTransition = true;
    lessonsIndex--;
    updateLessons(true);
}

lessonsTrack.addEventListener("transitionend", () => {
    lessonsTransition = false;

    if (lessonsIndex >= LESSONS_CLONE + lessonsRealCount) {
        lessonsIndex = LESSONS_CLONE;
        updateLessons(false);
    }

    if (lessonsIndex < LESSONS_CLONE) {
        lessonsIndex = LESSONS_CLONE + lessonsRealCount - 1;
        updateLessons(false);
    }
});

function startLessonsAuto() {
    clearInterval(lessonsAuto);
    lessonsAuto = setInterval(lessonsNextSlide, 5000);
}

lessonsNext.addEventListener("click", () => { lessonsNextSlide(); startLessonsAuto(); });
lessonsPrev.addEventListener("click", () => { lessonsPrevSlide(); startLessonsAuto(); });

lessonsTrack.addEventListener("mouseenter", () => clearInterval(lessonsAuto));
lessonsTrack.addEventListener("mouseleave", startLessonsAuto);

window.addEventListener("resize", () => updateLessons(false));

// Init
updateLessons(false);
startLessonsAuto();

/* ACTIVITIES CAROUSEL */

const activitiesTrack = document.getElementById('activitiesTrack');
const activitiesPrev = document.getElementById('activitiesPrev');
const activitiesNext = document.getElementById('activitiesNext');

const ACTIVITIES_CLONE = 3;
let activitiesIndex = ACTIVITIES_CLONE;
let activitiesAuto;
let activitiesTransition = false;

const activitiesItems = Array.from(activitiesTrack.children);

// Clone items
const activitiesStartClones = activitiesItems.slice(-ACTIVITIES_CLONE).map(i => i.cloneNode(true));
const activitiesEndClones = activitiesItems.slice(0, ACTIVITIES_CLONE).map(i => i.cloneNode(true));

activitiesStartClones.forEach(c => activitiesTrack.insertBefore(c, activitiesTrack.firstChild));
activitiesEndClones.forEach(c => activitiesTrack.appendChild(c));

const activitiesAll = Array.from(activitiesTrack.children);
const activitiesRealCount = activitiesItems.length;

function activitiesSlidesToShow() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
}

function updateActivities(animate = true) {
    const show = activitiesSlidesToShow();
    const w = 100 / show;

    activitiesTrack.style.transition = animate ? "transform 0.5s ease" : "none";
    activitiesTrack.style.transform = `translateX(-${activitiesIndex * w}%)`;
}

function activitiesNextSlide() {
    if (activitiesTransition) return;
    activitiesTransition = true;
    activitiesIndex++;
    updateActivities(true);
}

function activitiesPrevSlide() {
    if (activitiesTransition) return;
    activitiesTransition = true;
    activitiesIndex--;
    updateActivities(true);
}

activitiesTrack.addEventListener("transitionend", () => {
    activitiesTransition = false;

    if (activitiesIndex >= ACTIVITIES_CLONE + activitiesRealCount) {
        activitiesIndex = ACTIVITIES_CLONE;
        updateActivities(false);
    }

    if (activitiesIndex < ACTIVITIES_CLONE) {
        activitiesIndex = ACTIVITIES_CLONE + activitiesRealCount - 1;
        updateActivities(false);
    }
});

function startActivitiesAuto() {
    clearInterval(activitiesAuto);
    activitiesAuto = setInterval(activitiesNextSlide, 5000);
}

activitiesNext.addEventListener("click", () => { activitiesNextSlide(); startActivitiesAuto(); });
activitiesPrev.addEventListener("click", () => { activitiesPrevSlide(); startActivitiesAuto(); });

activitiesTrack.addEventListener("mouseenter", () => clearInterval(activitiesAuto));
activitiesTrack.addEventListener("mouseleave", startActivitiesAuto);

window.addEventListener("resize", () => updateActivities(false));

// Init
updateActivities(false);
startActivitiesAuto();


/* WHATSSAP BUTTON */

document.querySelector('.wa__btn_popup').addEventListener('click', function() {
            const chatBox = document.querySelector('.wa__popup_chat_box');
            const btn = this;
            
            if (chatBox.classList.contains('wa__active')) {
                // Close Animation
                chatBox.classList.remove('wa__active');
                btn.classList.remove('wa__active');
                
                // Reset pending states after animation
                setTimeout(() => {
                    chatBox.classList.remove('wa__pending');
                    chatBox.classList.remove('wa__lauch');
                }, 400);
            } else {
                // Open Animation
                chatBox.classList.add('wa__pending');
                chatBox.classList.add('wa__active');
                btn.classList.add('wa__active');
                
                // Launch inner items slightly after box opens
                setTimeout(() => {
                    chatBox.classList.add('wa__lauch');
                }, 100);
            }
        });