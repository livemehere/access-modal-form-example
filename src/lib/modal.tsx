import { createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";

/* --- 유틸 함수 --- */
function createRandomId(prefix = "modal", length = 9) {
  const randomArr = new Uint8Array(length);
  crypto.getRandomValues(randomArr);

  // base36처럼 영문+숫자 조합 문자열 생성
  const randomStr = Array.from(randomArr, (n) => (n % 36).toString(36)).join(
    ""
  );

  return `${prefix}-${Date.now()}-${randomStr}`;
}

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
  const [ModalComps, setModalComps] = useState<
    { id: string; component: React.ReactNode }[]
  >([]);

  const open: IModalContext["open"] = (fnComp) => {
    return new Promise((_resolve, _reject) => {
      const modalId = createRandomId();

      const resolve = (value: any) => {
        _resolve(value);
        setModalComps((prev) => prev.filter(({ id }) => id !== modalId));
      };

      const reject = (reason: any) => {
        _reject(reason);
        setModalComps((prev) => prev.filter(({ id }) => id !== modalId));
      };

      const ModalCmp = fnComp({ resolve, reject });
      setModalComps((prev) => [...prev, { id: modalId, component: ModalCmp }]);
    });
  };

  const closeAll = () => {
    setModalComps([]);
  };

  return (
    <ModalContext.Provider value={{ open, closeAll }}>
      {children}
      {createPortal(
        <div id="modal-layer">
          {ModalComps.map(({ id, component }) => (
            <div key={id}>{component}</div>
          ))}
        </div>,
        document.body
      )}
    </ModalContext.Provider>
  );
}
