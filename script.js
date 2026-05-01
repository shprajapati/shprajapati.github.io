(function () {
  "use strict";

  /**
   * Email delivery via Formspree (free tier works on GitHub Pages).
   * 1) Sign up at https://formspree.io and create a form.
   * 2) Copy the form id from the dashboard URL: …/f/xxxxxxxx → paste below (only the xxxxxxxx part).
   * 3) Confirm your email in Formspree so submissions are delivered.
   */
  var FORMSPREE_FORM_ID = "mqenkjwj";

  function getFormspreeUrl() {
    var id = typeof FORMSPREE_FORM_ID === "string" ? FORMSPREE_FORM_ID.trim() : "";
    if (!id) return "";
    return "https://formspree.io/f/" + id;
  }

  function applyFormspreeActions() {
    var url = getFormspreeUrl();
    if (!url) return;
    if (contactForm) contactForm.setAttribute("action", url);
    if (leadMagnetForm) leadMagnetForm.setAttribute("action", url);
  }

  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var siteNav = document.getElementById("site-nav");
  var yearEl = document.getElementById("year");
  var progressEl = document.getElementById("scroll-progress");
  var heroBg = document.querySelector(".hero-bg-parallax");
  var timelineWrap = document.querySelector(".timeline-wrap");
  var contactForm = document.getElementById("contact-form");
  var formStatus = document.getElementById("form-status");
  var leadMagnetForm = document.getElementById("lead-magnet-form");
  var leadMagnetStatus = document.getElementById("lead-magnet-status");
  var exitModal = document.getElementById("exit-modal");
  var exitModalBackdrop = document.getElementById("exit-modal-backdrop");
  var exitModalClose = document.getElementById("exit-modal-close");
  var exitModalDismiss = document.getElementById("exit-modal-dismiss");
  var exitModalCta = document.getElementById("exit-modal-cta");
  var cursorDot = document.getElementById("cursor-dot");
  var cursorRing = document.getElementById("cursor-ring");

  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var prefersReducedMotion = mqReduce.matches;

  var navLinks = document.querySelectorAll(".nav-link");
  var sectionIds = [
    "about",
    "services",
    "stack",
    "case-studies",
    "screenshots",
    "social-proof",
    "lead-magnet",
    "experience",
    "contact",
  ];

  var EXIT_STORAGE_KEY = "sp_exit_modal_shown";

  function prefersFinePointer() {
    return window.matchMedia("(pointer: fine)").matches;
  }

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function throttleRaf(fn) {
    var ticking = false;
    return function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          ticking = false;
          fn();
        });
      }
    };
  }

  function initHeroEntrance() {
    if (prefersReducedMotion) {
      document.body.classList.add("hero-ready");
      return;
    }
    window.requestAnimationFrame(function () {
      document.body.classList.add("hero-ready");
    });
  }

  function updateScrollProgress() {
    if (!progressEl) return;
    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop;
    var height = doc.scrollHeight - window.innerHeight;
    var p = height > 0 ? scrollTop / height : 0;
    progressEl.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
  }

  function updateHeaderScrolled() {
    if (!header) return;
    if (window.scrollY > 16) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  function updateParallax() {
    if (!heroBg || prefersReducedMotion) return;
    var y = window.scrollY * 0.06;
    heroBg.style.transform = "translate3d(0, " + y + "px, 0)";
  }

  function updateTimelineProgress() {
    if (!timelineWrap || prefersReducedMotion) return;
    var exp = document.getElementById("experience");
    if (!exp) return;
    var rect = exp.getBoundingClientRect();
    var vh = window.innerHeight;
    var start = vh * 0.85;
    var end = -rect.height * 0.35;
    var range = start - end;
    var raw = (start - rect.top) / range;
    var p = Math.min(1, Math.max(0, raw));
    timelineWrap.style.setProperty("--timeline-progress", String(p));
  }

  var onScrollShared = throttleRaf(function () {
    updateScrollProgress();
    updateHeaderScrolled();
    updateParallax();
    updateTimelineProgress();
    updateActiveNav();
  });

  window.addEventListener("scroll", onScrollShared, { passive: true });
  window.addEventListener("resize", onScrollShared, { passive: true });

  function updateActiveNav() {
    if (!navLinks.length) return;
    var headerOffset = header ? header.offsetHeight : 72;
    var pos = window.scrollY + headerOffset + 48;
    var activeId = "";
    for (var i = 0; i < sectionIds.length; i++) {
      var sec = document.getElementById(sectionIds[i]);
      if (!sec) continue;
      if (sec.offsetTop <= pos) {
        activeId = sectionIds[i];
      }
    }
    navLinks.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      var id = href.replace("#", "");
      if (id === activeId) {
        link.classList.add("is-active");
      } else {
        link.classList.remove("is-active");
      }
    });
  }

  function closeNav() {
    if (!header || !navToggle || !siteNav) return;
    header.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  function openNav() {
    if (!header || !navToggle || !siteNav) return;
    header.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
  }

  if (navToggle && header && siteNav) {
    navToggle.addEventListener("click", function () {
      if (header.classList.contains("is-open")) {
        closeNav();
      } else {
        openNav();
      }
    });

    siteNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 899px)").matches) {
          closeNav();
        }
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  function observeReveals(selector, unobserveAfter) {
    var els = document.querySelectorAll(selector);
    if (!els.length || !("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            if (unobserveAfter !== false) obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );

    els.forEach(function (el) {
      obs.observe(el);
    });
  }

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    observeReveals(".reveal:not(.reveal-group)", true);
    observeReveals(".reveal-group", true);
  } else {
    document.querySelectorAll(".reveal, .reveal-group, .fade-up").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      closeExitModal();
    });
  });

  document.addEventListener(
    "mousedown",
    function (e) {
      if (prefersReducedMotion) return;
      var btn = e.target.closest(".btn");
      if (!btn || btn.disabled) return;
      var rect = btn.getBoundingClientRect();
      var ripple = document.createElement("span");
      ripple.className = "ripple";
      var size = Math.max(rect.width, rect.height) * 1.2;
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = e.clientX - rect.left + "px";
      ripple.style.top = e.clientY - rect.top + "px";
      btn.appendChild(ripple);
      window.setTimeout(function () {
        ripple.remove();
      }, 600);
    },
    true
  );

  function initCursor() {
    if (prefersReducedMotion || !cursorDot || !cursorRing || !prefersFinePointer()) {
      return;
    }

    document.documentElement.classList.add("custom-cursor");

    var mx = 0;
    var my = 0;
    var rx = 0;
    var ry = 0;
    var rafId = null;

    document.addEventListener(
      "mousemove",
      function (e) {
        mx = e.clientX;
        my = e.clientY;
      },
      { passive: true }
    );

    function loop() {
      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.22;
      cursorDot.style.transform = "translate3d(" + mx + "px, " + my + "px, 0)";
      cursorRing.style.transform = "translate3d(" + rx + "px, " + ry + "px, 0)";
      rafId = requestAnimationFrame(loop);
    }

    loop();

    var hoverTargets =
      "a, button, .nav-toggle, input, textarea, select, .custom-select-trigger, .magnetic-target, .card-interactive, .wa-float";
    document.addEventListener(
      "mouseover",
      function (e) {
        if (e.target.closest(hoverTargets)) {
          document.documentElement.classList.add("cursor-hover");
        }
      },
      true
    );
    document.addEventListener(
      "mouseout",
      function (e) {
        if (e.target.closest(hoverTargets)) {
          var related = e.relatedTarget;
          if (!related || !related.closest(hoverTargets)) {
            document.documentElement.classList.remove("cursor-hover");
          }
        }
      },
      true
    );

    mqReduce.addEventListener("change", function () {
      if (mqReduce.matches) {
        document.documentElement.classList.remove("custom-cursor", "cursor-hover");
        if (rafId) cancelAnimationFrame(rafId);
      }
    });
  }

  function clearFieldErrors(form) {
    form.querySelectorAll(".form-input, select.custom-select-native").forEach(function (f) {
      f.classList.remove("is-invalid");
    });
    form.querySelectorAll(".custom-select-trigger.is-invalid").forEach(function (t) {
      t.classList.remove("is-invalid");
    });
  }

  function syncCustomSelectFromNative(wrap) {
    var native = wrap.querySelector(".custom-select-native");
    var valueEl = wrap.querySelector(".custom-select-value");
    var trigger = wrap.querySelector(".custom-select-trigger");
    if (!native || !valueEl) return;
    var opt = native.options[native.selectedIndex];
    valueEl.textContent = opt ? opt.textContent : "";
    if (trigger) {
      trigger.classList.toggle("is-placeholder", !native.value);
    }
  }

  function closeAllCustomSelects() {
    document.querySelectorAll("[data-custom-select].custom-select-is-open").forEach(function (wrap) {
      wrap.classList.remove("custom-select-is-open");
      var list = wrap.querySelector(".custom-select-list");
      var trig = wrap.querySelector(".custom-select-trigger");
      if (list) {
        list.hidden = true;
      }
      if (trig) {
        trig.setAttribute("aria-expanded", "false");
      }
    });
  }

  function initCustomSelects() {
    document.querySelectorAll("[data-custom-select]").forEach(function (wrap) {
      var native = wrap.querySelector(".custom-select-native");
      var trigger = wrap.querySelector(".custom-select-trigger");
      var list = wrap.querySelector(".custom-select-list");
      if (!native || !trigger || !list) return;

      list.innerHTML = "";
      for (var i = 0; i < native.options.length; i++) {
        var opt = native.options[i];
        if (opt.value === "" && opt.disabled) continue;
        var li = document.createElement("li");
        li.setAttribute("role", "option");
        li.setAttribute("data-value", opt.value);
        li.setAttribute("tabindex", "-1");
        li.className = "custom-select-option";
        li.textContent = opt.textContent;
        li.setAttribute("aria-selected", native.value === opt.value ? "true" : "false");
        list.appendChild(li);
      }

      syncCustomSelectFromNative(wrap);

      native.addEventListener("change", function () {
        syncCustomSelectFromNative(wrap);
        list.querySelectorAll('[role="option"]').forEach(function (li) {
          li.setAttribute("aria-selected", li.getAttribute("data-value") === native.value ? "true" : "false");
        });
        native.classList.remove("is-invalid");
        trigger.classList.remove("is-invalid");
      });

      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = wrap.classList.toggle("custom-select-is-open");
        list.hidden = !open;
        trigger.setAttribute("aria-expanded", open ? "true" : "false");
        if (open) {
          document.querySelectorAll("[data-custom-select].custom-select-is-open").forEach(function (other) {
            if (other !== wrap) {
              other.classList.remove("custom-select-is-open");
              var ol = other.querySelector(".custom-select-list");
              var ot = other.querySelector(".custom-select-trigger");
              if (ol) ol.hidden = true;
              if (ot) ot.setAttribute("aria-expanded", "false");
            }
          });
        }
      });

      list.addEventListener("click", function (e) {
        e.stopPropagation();
        var li = e.target.closest(".custom-select-option");
        if (!li) return;
        var val = li.getAttribute("data-value");
        native.value = val;
        native.dispatchEvent(new Event("change", { bubbles: true }));
        wrap.classList.remove("custom-select-is-open");
        list.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        trigger.focus();
      });

      trigger.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          wrap.classList.remove("custom-select-is-open");
          list.hidden = true;
          trigger.setAttribute("aria-expanded", "false");
        }
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          if (e.key !== "ArrowDown") e.preventDefault();
          if (list.hidden) {
            wrap.classList.add("custom-select-is-open");
            list.hidden = false;
            trigger.setAttribute("aria-expanded", "true");
          }
          var first = list.querySelector(".custom-select-option");
          if (first && e.key === "ArrowDown") {
            e.preventDefault();
            first.focus();
          }
        }
      });
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest("[data-custom-select]")) {
        closeAllCustomSelects();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAllCustomSelects();
    });
  }

  function initForm() {
    if (!contactForm) return;

    contactForm.addEventListener("reset", function () {
      window.requestAnimationFrame(function () {
        document.querySelectorAll("[data-custom-select]").forEach(syncCustomSelectFromNative);
      });
    });

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      clearFieldErrors(contactForm);
      contactForm.classList.remove("form-shake", "is-success");
      if (formStatus) formStatus.textContent = "";

      if (!contactForm.checkValidity()) {
        contactForm.classList.add("form-shake");
        window.setTimeout(function () {
          contactForm.classList.remove("form-shake");
        }, 480);

        var firstInvalid = contactForm.querySelector(".form-input:invalid, select.custom-select-native:invalid");
        if (firstInvalid) {
          firstInvalid.classList.add("is-invalid");
          var wrap = firstInvalid.closest("[data-custom-select]");
          var trig = wrap && wrap.querySelector(".custom-select-trigger");
          if (trig) {
            trig.classList.add("is-invalid");
            trig.focus({ preventScroll: prefersReducedMotion });
          } else {
            firstInvalid.focus({ preventScroll: prefersReducedMotion });
          }
        }
        return;
      }

      var endpoint = getFormspreeUrl();
      var btn = contactForm.querySelector('button[type="submit"]');
      var original = btn ? btn.querySelector(".btn-label") : null;
      var labelText = original ? original.textContent : "";

      if (!endpoint) {
        if (formStatus) {
          formStatus.textContent =
            "Email not configured yet: set FORMSPREE_FORM_ID in script.js (see Formspree.io).";
        }
        return;
      }

      var fd = new FormData(contactForm);
      if (btn) {
        btn.disabled = true;
        if (original) original.textContent = "Sending…";
      }
      if (formStatus) formStatus.textContent = "";

      fetch(endpoint, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (result.ok) {
            contactForm.classList.add("is-success");
            if (formStatus) {
              formStatus.textContent =
                "Thanks — I'll reply within one business day with next steps.";
            }
            window.setTimeout(function () {
              contactForm.reset();
              contactForm.classList.remove("is-success");
              if (formStatus) formStatus.textContent = "";
              document.querySelectorAll("[data-custom-select]").forEach(syncCustomSelectFromNative);
            }, 3200);
          } else {
            var msg =
              (result.data && (result.data.error || (result.data.errors && result.data.errors[0]))) ||
              "Could not send. Try again or email me directly.";
            if (formStatus) formStatus.textContent = typeof msg === "string" ? msg : "Could not send. Try again.";
          }
        })
        .catch(function () {
          if (formStatus) {
            formStatus.textContent = "Network error. Check your connection and try again.";
          }
        })
        .then(function () {
          if (btn) btn.disabled = false;
          if (original) original.textContent = labelText;
        });
    });
  }

  function downloadLeadMagnetFile() {
    var guideBody =
      "SaaS Starter Guide (sample)\n\n" +
      "1. Define MVP scope and non-goals\n" +
      "2. Auth: sessions vs JWT; roles early\n" +
      "3. Billing hooks: webhooks + idempotent jobs\n" +
      "4. Deploy: staging + backups before prod\n" +
      "5. Questions to ask before hiring\n\n" +
      "Replace this file with your real PDF.\n";

    try {
      var blob = new Blob([guideBody], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "saas-starter-guide.txt";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      /* ignore */
    }
  }

  function initLeadMagnet() {
    if (!leadMagnetForm) return;

    leadMagnetForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("lead-email");
      if (!input || !input.value.trim()) {
        if (leadMagnetStatus) leadMagnetStatus.textContent = "Enter a valid email.";
        return;
      }
      if (!input.checkValidity()) {
        input.reportValidity();
        return;
      }

      var endpoint = getFormspreeUrl();
      var submitBtn = leadMagnetForm.querySelector('button[type="submit"]');
      var btnLabel = submitBtn ? submitBtn.querySelector(".btn-label") : null;
      var savedLabel = btnLabel ? btnLabel.textContent : "";

      if (!endpoint) {
        downloadLeadMagnetFile();
        if (leadMagnetStatus) {
          leadMagnetStatus.textContent =
            "Download started. (Add FORMSPREE_FORM_ID in script.js to receive emails.)";
        }
        leadMagnetForm.reset();
        window.setTimeout(function () {
          if (leadMagnetStatus) leadMagnetStatus.textContent = "";
        }, 6000);
        return;
      }

      var fd = new FormData(leadMagnetForm);
      if (submitBtn) submitBtn.disabled = true;
      if (btnLabel) btnLabel.textContent = "Sending…";
      if (leadMagnetStatus) leadMagnetStatus.textContent = "";

      fetch(endpoint, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (result.ok) {
            downloadLeadMagnetFile();
            if (leadMagnetStatus) {
              leadMagnetStatus.textContent = "Check your inbox — download started.";
            }
            leadMagnetForm.reset();
          } else {
            if (leadMagnetStatus) {
              leadMagnetStatus.textContent = "Could not subscribe. Try again.";
            }
          }
        })
        .catch(function () {
          if (leadMagnetStatus) {
            leadMagnetStatus.textContent = "Network error. Try again.";
          }
        })
        .then(function () {
          if (submitBtn) submitBtn.disabled = false;
          if (btnLabel) btnLabel.textContent = savedLabel;
          window.setTimeout(function () {
            if (leadMagnetStatus) leadMagnetStatus.textContent = "";
          }, 6000);
        });
    });
  }

  function openExitModal() {
    if (!exitModal || prefersReducedMotion) return;
    if (sessionStorage.getItem(EXIT_STORAGE_KEY)) return;
    exitModal.removeAttribute("hidden");
    exitModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    sessionStorage.setItem(EXIT_STORAGE_KEY, "1");
    if (exitModalClose) exitModalClose.focus();
  }

  function closeExitModal() {
    if (!exitModal || exitModal.hasAttribute("hidden")) return;
    exitModal.setAttribute("hidden", "");
    exitModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function initExitIntent() {
    if (prefersReducedMotion || !exitModal) return;

    document.documentElement.addEventListener(
      "mouseleave",
      function (e) {
        if (e.clientY > 24) return;
        openExitModal();
      },
      { passive: true }
    );

    if (exitModalBackdrop) {
      exitModalBackdrop.addEventListener("click", closeExitModal);
    }
    if (exitModalClose) {
      exitModalClose.addEventListener("click", closeExitModal);
    }
    if (exitModalDismiss) {
      exitModalDismiss.addEventListener("click", closeExitModal);
    }
    if (exitModalCta) {
      exitModalCta.addEventListener("click", function () {
        closeExitModal();
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && exitModal && !exitModal.hasAttribute("hidden")) {
        closeExitModal();
      }
    });
  }

  mqReduce.addEventListener("change", function () {
    prefersReducedMotion = mqReduce.matches;
    if (prefersReducedMotion && heroBg) {
      heroBg.style.transform = "";
    }
    if (prefersReducedMotion && timelineWrap) {
      timelineWrap.style.setProperty("--timeline-progress", "1");
    }
  });

  applyFormspreeActions();

  initHeroEntrance();
  initCursor();
  initCustomSelects();
  initForm();
  initLeadMagnet();
  initExitIntent();

  updateScrollProgress();
  updateHeaderScrolled();
  updateParallax();
  updateTimelineProgress();
  updateActiveNav();
})();
