import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useMemo,
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
  closeAll: () => void;
}

const ModalContext = createContext<IModalContext>({} as IModalContext);

export function useModal() {
  return useContext(ModalContext);
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

  const closeAll = useCallback(
    () => () => {
      setModals([]);
    },
    []
  );

  const value = useMemo(() => ({ open, closeAll }), [open, closeAll]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modals.length > 0 &&
        createPortal(
          <div id="modal-layer">
            {modals.map(({ id, component }) => (
              <Fragment key={id}>{component}</Fragment>
            ))}
          </div>,
          document.body
        )}
    </ModalContext.Provider>
  );
}
