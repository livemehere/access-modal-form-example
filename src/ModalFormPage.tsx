import { useSimpleForm } from "./lib/form";
import { useModal } from "./lib/modal";

type FormValues = {
  name: string;
  email: string;
};

function Form({ resolve }: { resolve: (value: FormValues | null) => void }) {
  const { register, handleSubmit, errors, setLiveRegionEl } = useSimpleForm({
    name: "",
    email: "",
  });

  return (
    <form
      onSubmit={handleSubmit((vals) => {
        // 유효성 통과 시
        resolve({ name: vals.name, email: vals.email });
      })}
      aria-labelledby="form-title"
      aria-describedby="form-desc"
    >
      <h2 id="form-title">가입 폼</h2>
      <p id="form-desc">필수 정보를 입력해주세요.</p>

      {/* 스크린리더 즉시 안내 영역 */}
      <div
        ref={setLiveRegionEl as any}
        role="alert"
        aria-live="assertive"
        style={{ position: "absolute", left: -9999 }}
      />

      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          placeholder="Name"
          {...register("name", {
            validate: (value) => {
              if (value.length < 1) return "최소 1글자 이상 입력해주세요";
              return undefined;
            },
          })}
        />
        {errors.name && (
          <p id="name-error" role="alert" style={{ color: "red" }}>
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="text"
          placeholder="Email"
          {...register("email", {
            validate: [
              (value) => {
                if (value.length < 1) return "최소 1글자 이상 입력해주세요";
              },
              (value) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                  return "유효한 이메일 주소를 입력해주세요";
                }
              },
            ],
          })}
        />
        {errors.email && (
          <p id="email-error" role="alert" style={{ color: "red" }}>
            {errors.email}
          </p>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <button type="submit">Submit</button>
        <button
          type="button"
          onClick={() => resolve(null)}
          style={{ marginLeft: 8 }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const ModalFormPage = () => {
  const { open } = useModal();

  const openFormModal = async () => {
    const result = await open<FormValues | null>(
      ({ resolve, reject, formTitleId, formDescriptionId }) => {
        return (
          <div
            className="modal-content"
            style={{
              overflow: "auto",
              height: "50vh",
            }}
          >
            <h1 id={formTitleId}>Form</h1>
            <p id={formDescriptionId}>
              Please fill out the form below to submit.
            </p>
            <Form resolve={resolve} />
          </div>
        );
      }
    );
    console.log(result);
  };

  /* 여기에 구현해 주세요 */
  return (
    <div
      style={{
        height: "200vh",
        overflow: "auto",
      }}
    >
      <div>ModalFormPage</div>
      <button onClick={openFormModal}>Open Modal</button>
      <div tabIndex={0}>tab index</div>
    </div>
  );
};

export default ModalFormPage;
