import { FocusTrap } from "focus-trap-react";
import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { createRandomId } from "./utils";

interface IModalContext {
  open: <Resolve = unknown, Reject = unknown>(
    fnComp: (options: {
      resolve: (value: Resolve) => void;
      reject: (value: Reject) => void;
    }) => React.ReactNode
  ) => Promise<Resolve>;
  close: (id?: string) => void;
}

const ModalContext = createContext<IModalContext>({} as IModalContext);

export function useModal() {
  return useContext(ModalContext);
}

function ModalWrapper({
  children,
  id,
  isLast,
}: {
  children: React.ReactNode;
  id: string;
  isLast: boolean;
}) {
  const { close } = useModal();
  const ref = useRef<HTMLDivElement>(null);
  const Wrapper = isLast ? FocusTrap : Fragment;

  useEffect(() => {
    if (!isLast) return;
    const root = ref.current;
    if (!root) return;

    const headTags = root.querySelector(
      "h1, h2, h3, h4, h5, h6"
    ) as HTMLHeadElement;
    headTags.tabIndex = headTags.tabIndex ? headTags.tabIndex : -1;
    headTags?.focus();
  }, []);

  return (
    <Wrapper>
      <div
        ref={ref}
        role="dialog"
        aria-modal="false"
        aria-labelledby={`modal-title-${id}`}
        aria-describedby={`modal-description-${id}`}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            close();
          }
        }}
      >
        {children}
      </div>
    </Wrapper>
  );
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modals, setModals] = useState<
    { id: string; component: React.ReactNode }[]
  >([]);

  const open: IModalContext["open"] = useCallback((fnComp) => {
    return new Promise((_resolve, _reject) => {
      const modalId = createRandomId();

      const resolve = (value: any) => {
        _resolve(value);
        setModals((prev) => prev.filter(({ id }) => id !== modalId));
      };

      const reject = (reason: any) => {
        _reject(reason);
        setModals((prev) => prev.filter(({ id }) => id !== modalId));
      };

      const ModalCmp = fnComp({ resolve, reject });
      setModals((prev) => [...prev, { id: modalId, component: ModalCmp }]);
    });
  }, []);

  const close = useCallback((id?: string) => {
    if (id) {
      setModals((prev) => prev.filter(({ id: modalId }) => modalId !== id));
    } else {
      setModals([]);
    }
  }, []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modals.length > 0 &&
        createPortal(
          <div
            id="modal-layer"
            role="presentation"
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) {
                close();
              }
            }}
          >
            {modals.map(({ id, component }, index) => {
              const isLast = index === modals.length - 1;
              return (
                <ModalWrapper key={id} isLast={isLast} id={id}>
                  {component}
                </ModalWrapper>
              );
            })}
          </div>,
          document.body
        )}
    </ModalContext.Provider>
  );
}
