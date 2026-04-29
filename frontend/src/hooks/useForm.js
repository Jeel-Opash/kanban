import { useState } from "react";

const useForm = (initialValues) => {
  const [form, setForm] = useState(initialValues);

  const handleChange = ({ target }) => {
    setForm((oldForm) => ({ ...oldForm, [target.name]: target.value }));
  };

  return [form, handleChange, setForm];
};

export default useForm;
