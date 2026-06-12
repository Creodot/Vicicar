"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import Footer from "@/components/Footer";
import {
  CHOICE_STEPS,
  CONTACT_INDEX,
  TOTAL_SCREENS,
  type ChoiceKey,
} from "./formData";
import ChoiceStep from "./ChoiceStep";
import ContactStep, { type ContactValues } from "./ContactStep";
import SuccessScreen from "./SuccessScreen";
import s from "./MultiStepForm.module.css";

/**
 * /trouver-ma-voiture — cinematic one-question-per-screen flow
 * (content-ux.md §1). 7 choice screens + contact screen + success.
 *
 * GSAP step transitions (§1.2):
 *  - out (forward):  y 0 → -60, opacity 1 → 0, 0.45s power2.in
 *  - in  (forward):  y 60 → 0,  opacity 0 → 1, 0.6s power3.out, options stagger 0.05s
 *  - backward: mirrored y
 *  - prefers-reduced-motion: plain 0.3s fade, no translation
 * Progress bar: 2px fixed top, width = screen/9, 0.6s power3.out;
 * success fills to 100% then fades out.
 */
export default function MultiStepForm() {
  const [screen, setScreen] = useState(0); // 0..6 choice, 7 contact
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<Partial<Record<ChoiceKey, string>>>({});
  const [contact, setContact] = useState<ContactValues>({
    prenom: "",
    nom: "",
    telephone: "",
    email: "",
    creneau: "",
    rgpd: false,
  });

  const root = useRef<HTMLElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const dirRef = useRef<1 | -1>(1);
  const lockRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- entrance of the (re)mounted screen ---------- */
  const { contextSafe } = useGSAP(
    () => {
      const el = screenRef.current;
      if (!el) return;
      // Unlock as soon as the new screen mounts: the lock only needs to cover
      // the exit phase, otherwise clicks/keys are swallowed for ~0.8s while
      // the entrance plays even though the options are already visible.
      lockRef.current = false;

      if (reduced()) {
        gsap.fromTo(
          el,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: "none", clearProps: "opacity" }
        );
      } else {
        const tl = gsap.timeline();
        tl.fromTo(
          el,
          { y: 60 * dirRef.current, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out",
            clearProps: "transform,opacity",
          }
        );
        const options = el.querySelectorAll("[data-anim='option']");
        if (options.length) {
          tl.fromTo(
            options,
            { y: 24, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              ease: "power3.out",
              stagger: 0.05,
              clearProps: "transform,opacity",
            },
            0.08
          );
        }
      }

      // a11y (§1.5): programmatic focus on the screen title
      el.querySelector<HTMLElement>("[data-step-title]")?.focus({ preventScroll: true });
    },
    { dependencies: [screen, done], scope: root }
  );

  /* ---------- progress bar ---------- */
  useGSAP(
    () => {
      if (!fillRef.current) return;
      const d = reduced() ? 0 : 0.6;
      if (done) {
        gsap
          .timeline()
          .to(fillRef.current, { width: "100%", duration: d, ease: "power3.out" })
          .to(barRef.current, { opacity: 0, duration: d, delay: 0.4 });
      } else {
        gsap.to(fillRef.current, {
          width: `${((screen + 1) / TOTAL_SCREENS) * 100}%`,
          duration: d,
          ease: "power3.out",
        });
      }
    },
    { dependencies: [screen, done], scope: root }
  );

  /* ---------- transitions ---------- */
  const transitionTo = contextSafe((apply: () => void, dir: 1 | -1) => {
    if (lockRef.current) return;
    lockRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    dirRef.current = dir;
    const el = screenRef.current;
    if (!el) {
      apply();
      return;
    }
    if (reduced()) {
      gsap.to(el, {
        opacity: 0,
        duration: 0.15,
        ease: "none",
        overwrite: "auto",
        onComplete: apply,
      });
    } else {
      gsap.to(el, {
        y: -60 * dir,
        opacity: 0,
        duration: 0.45,
        ease: "power2.in",
        overwrite: "auto",
        onComplete: apply,
      });
    }
  });

  const goNext = () => {
    if (done) return;
    if (screen < CONTACT_INDEX) transitionTo(() => setScreen((n) => n + 1), 1);
  };

  const goBack = () => {
    if (done || screen === 0) return;
    transitionTo(() => setScreen((n) => n - 1), -1);
  };

  /* single-choice select → show selected state, auto-advance after 450ms (§1.2) */
  const select = (key: ChoiceKey, value: string) => {
    if (lockRef.current) return;
    setAnswers((a) => ({ ...a, [key]: value }));
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      transitionTo(() => setScreen((n) => Math.min(n + 1, CONTACT_INDEX)), 1);
    }, 450);
  };

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  /* ---------- global keyboard (§1.2) ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const inTextField = !!target?.matches?.(
        "input[type='text'], input[type='tel'], input[type='email'], textarea"
      );

      // back: Backspace / Escape / ← (outside text fields; ← inside a
      // radiogroup is handled — and stopped — by the roving handler)
      if ((e.key === "Backspace" || e.key === "Escape" || e.key === "ArrowLeft") && !inTextField) {
        if (screen > 0) {
          e.preventDefault();
          goBack();
        }
        return;
      }

      if (screen >= CONTACT_INDEX || inTextField) return;
      const def = CHOICE_STEPS[screen];

      // number shortcuts 1–6
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= def.options.length) {
        e.preventDefault();
        select(def.key, def.options[n - 1].value);
        return;
      }

      // Enter advances when answered (target ≠ option button, which handles
      // its own Enter as a click)
      if (e.key === "Enter" && answers[def.key] && !target?.closest("button")) {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, done, answers]);

  /* ---------- render ---------- */
  const isContact = screen >= CONTACT_INDEX;
  const def = isContact ? null : CHOICE_STEPS[screen];

  return (
    <main ref={root} className={s.main}>
      {/* 2px progress bar, fixed top, under the navbar (z 500) */}
      <div ref={barRef} className={s.progress} aria-hidden="true">
        <div ref={fillRef} className={s.progressFill} />
      </div>

      <p className={s.srOnly} aria-live="polite">
        {done ? "Demande envoyée" : `Étape ${screen + 1} sur 8`}
      </p>

      <div className={s.viewport}>
        <div key={done ? "success" : screen} ref={screenRef} className={s.screen}>
          {done ? (
            <SuccessScreen prenom={contact.prenom.trim()} />
          ) : (
            <>
              {def ? (
                <ChoiceStep def={def} value={answers[def.key]} onSelect={select} />
              ) : (
                <ContactStep
                  answers={answers}
                  values={contact}
                  onChange={setContact}
                  onSuccess={() => transitionTo(() => setDone(true), 1)}
                />
              )}

              <div className={s.actions}>
                <button
                  type="button"
                  onClick={goBack}
                  className={screen === 0 ? `${s.backBtn} ${s.backHidden}` : s.backBtn}
                  aria-hidden={screen === 0}
                  tabIndex={screen === 0 ? -1 : 0}
                >
                  <span className={`label ${s.backText}`}>← Retour</span>
                  <span className={s.backLineWrap} aria-hidden="true">
                    <span className={s.backLine} />
                  </span>
                </button>

                <div className={s.actionsRight}>
                  <span className={`label ${s.counter}`} aria-hidden="true">
                    0{screen + 1} — 08
                  </span>
                  {!isContact && (
                    <button
                      type="button"
                      className={`label ${s.continueBtn}`}
                      disabled={!def || !answers[def.key]}
                      onClick={goNext}
                    >
                      Continuer →
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* footer returns on the success screen only (content-ux.md §5) */}
      {done && (
        <div className={s.footerWrap}>
          <Footer />
        </div>
      )}
    </main>
  );
}
