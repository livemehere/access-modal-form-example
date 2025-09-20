import { useEffect, useRef } from "react";

import { useState } from "react";

type Values = Record<string, string>;
type Validator = (value: string, values: Values) => string | undefined;

interface RegisterOptions {
  validate?: Validator | Validator[];
}

export function useSimpleForm(defaultValues: Values) {
  const [values, setValues] = useState<Values>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const validatorsRef = useRef<Record<string, Validator[]>>({});
  const valuesRef = useRef(values);
  const liveRegionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const setLiveRegionEl = (el: HTMLElement | null) => {
    liveRegionRef.current = el;
  };

  const setValidator = (key: string, opts?: RegisterOptions) => {
    if (!opts?.validate) return;
    validatorsRef.current[key] = Array.isArray(opts.validate)
      ? opts.validate
      : [opts.validate];
  };

  const runValidators = (key: string, val: string): string | undefined => {
    const fns = validatorsRef.current[key] ?? [];
    for (const fn of fns) {
      const msg = fn(val, valuesRef.current);
      if (msg) return msg;
    }
    return undefined;
  };

  const validateField = (key: string, v: string): string | undefined => {
    const msg = runValidators(key, v);
    setErrors((prev) => ({ ...prev, [key]: msg }));
    return msg;
  };

  const validateAll = (): Record<string, string | undefined> => {
    const next: Record<string, string | undefined> = {};
    for (const key of Object.keys(valuesRef.current)) {
      next[key] = runValidators(key, valuesRef.current[key] ?? "");
    }
    setErrors(next);
    return next;
  };

  const focusFirstError = (errs: Record<string, string | undefined>) => {
    const firstKey = Object.keys(errs).find((k) => !!errs[k]);
    if (!firstKey) return;
    const el = document.querySelector<HTMLElement>(`[name="${firstKey}"]`);
    el?.focus();
  };

  const announceErrors = (errs: Record<string, string | undefined>) => {
    const live = liveRegionRef.current;
    if (!live) return;
    const messages = Object.entries(errs)
      .filter(([, msg]) => !!msg)
      .map(([key, msg]) => `${key}: ${msg}`);
    // 스크린리더가 즉시 읽을 수 있도록 내용 교체
    live.textContent = messages.join(" ");
  };

  const handleSubmit =
    (onValid: (vals: Values) => void) => (e: React.FormEvent) => {
      e.preventDefault();
      const errs = validateAll();
      const hasError = Object.values(errs).some(Boolean);
      if (hasError) {
        announceErrors(errs);
        focusFirstError(errs);
        return;
      }
      onValid(valuesRef.current);
    };

  const register = (key: string, opts?: RegisterOptions) => {
    setValidator(key, opts);
    const error = errors[key];
    return {
      name: key,
      value: values[key] ?? "",
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${key}-error` : undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setValues((prev) => ({ ...prev, [key]: v }));
      },
      onBlur: () => {
        validateField(key, valuesRef.current[key] ?? "");
      },
    };
  };

  return {
    values,
    setValues,
    errors,
    setErrors,
    register,
    handleSubmit,
    setLiveRegionEl, // 오류 일괄 안내용 라이브영역 ref setter
  };
}
