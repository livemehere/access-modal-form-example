import { useModal } from "./lib/modal";

const ModalFormPage = () => {
  const { open } = useModal();

  const openFormModal = async () => {
    const result = await open<string, string>(
      ({ resolve, reject, formTitleId, formDescriptionId }) => (
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
          <button onClick={() => resolve("success")}>Submit</button>
          <button onClick={() => reject("error")}>Cancel</button>
          <div style={{ height: "100vh" }}></div>
        </div>
      )
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
