import { useModal } from "./lib/modal";

const ModalFormPage = () => {
  const { open } = useModal();

  const openFormModal = async () => {
    const result = await open<string, string>(({ resolve, reject }) => (
      <div>
        ˆ<h1>Form</h1>
        <button onClick={() => resolve("success")}>Submit</button>
        <button onClick={() => reject("error")}>Cancel</button>
      </div>
    ));
    console.log(result);
  };

  /* 여기에 구현해 주세요 */
  return (
    <div>
      <div>ModalFormPage</div>
      <button onClick={openFormModal}>Open Modal</button>
    </div>
  );
};

export default ModalFormPage;
