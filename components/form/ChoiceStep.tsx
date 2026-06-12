"use client";

import { useRef } from "react";
import type { ChoiceKey, ChoiceStepDef } from "./formData";
import s from "./MultiStepForm.module.css";

type Props = {
  def: ChoiceStepDef;
  value?: string;
  onSelect: (key: ChoiceKey, value: string) => void;
};

/**
 * One single-choice screen: eyebrow + Octane title (wdth 0→25 on mount,
 * pure CSS) + helper + radiogroup of typographic cards/pills.
 * Roving tabindex; ↑ ↓ → (and ← inside the group, stopped so the global
 * "back" shortcut doesn't fire) move focus; Enter/Space select natively.
 */
export default function ChoiceStep({ def, value, onSelect }: Props) {
  const groupRef = useRef<HTMLDivElement>(null);
  const titleId = `step-title-${def.key}`;

  const onGroupKeyDown = (e: React.KeyboardEvent) => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(e.key)) return;
    const radios = Array.from(
      groupRef.current?.querySelectorAll<HTMLButtonElement>("[role='radio']") ?? []
    );
    const current = radios.indexOf(document.activeElement as HTMLButtonElement);
    if (current === -1) return; // focus elsewhere → let ← bubble (= back)
    e.preventDefault();
    e.stopPropagation();
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    radios[(current + delta + radios.length) % radios.length]?.focus();
  };

  const selectedIndex = def.options.findIndex((o) => o.value === value);
  const tabStop = selectedIndex >= 0 ? selectedIndex : 0;

  const gridClass = [
    s.options,
    def.cols === 3 ? s.cols3 : "",
    def.pills ? s.optionsPills : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section role="group" aria-labelledby={titleId} className={s.step}>
      <p className={`label ${s.eyebrow}`}>{def.eyebrow}</p>
      <h1 id={titleId} data-step-title tabIndex={-1} className={s.title}>
        {def.title}
      </h1>
      {def.helper && <p className={s.helper}>{def.helper}</p>}

      <div
        ref={groupRef}
        role="radiogroup"
        aria-labelledby={titleId}
        className={gridClass}
        onKeyDown={onGroupKeyDown}
      >
        {def.options.map((option, i) => {
          const selected = option.value === value;
          const cls = [
            def.pills ? s.pill : s.option,
            selected ? s.optionSelected : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={i === tabStop ? 0 : -1}
              data-anim="option"
              className={cls}
              onClick={() => onSelect(def.key, option.value)}
            >
              <span className={s.optionKey} aria-hidden="true">
                {i + 1}
              </span>
              <span className={s.optionLabel}>{option.label}</span>
              {option.sub && <span className={s.optionSub}>{option.sub}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
