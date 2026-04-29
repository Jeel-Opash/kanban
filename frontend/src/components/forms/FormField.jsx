const FormField = ({ id, label, className = "", ...inputProps }) => (
  <div className={`form-field profile-field ${className}`.trim()}>
    <label htmlFor={id}>{label}</label>
    <input id={id} {...inputProps} />
  </div>
);

export default FormField;
