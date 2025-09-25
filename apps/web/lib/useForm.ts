import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { z, ZodTypeAny } from 'zod';
import { formatZodError } from './validation';

type FormErrors<T> = Partial<Record<keyof T, string>>;

export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationSchema: ZodTypeAny
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback(
    (valuesToValidate: T) => {
      try {
        validationSchema.parse(valuesToValidate);
        setErrors({});
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors(formatZodError(error) as FormErrors<T>);
        }
        return false;
      }
    },
    [validationSchema]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target as HTMLInputElement;
      
      let newValue: any = value;
      
      // Handle different input types
      if (type === 'number') {
        newValue = value === '' ? '' : Number(value);
      } else if (type === 'checkbox') {
        newValue = (e.target as HTMLInputElement).checked;
      }
      
      setValues((prev) => ({
        ...prev,
        [name]: newValue,
      }));

      // Validate the field that changed
      if (errors[name as keyof T]) {
        validate({ ...values, [name]: newValue });
      }
    },
    [errors, validate, values]
  );

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => Promise<void> | void) => {
      return async (e: FormEvent) => {
        e.preventDefault();
        
        if (validate(values)) {
          setIsSubmitting(true);
          try {
            await onSubmit(values);
          } catch (error) {
            console.error('Form submission error:', error);
            // Handle form submission error (e.g., show error message)
          } finally {
            setIsSubmitting(false);
          }
        }
      };
    },
    [validate, values]
  );

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldValue,
    setValues,
    setErrors,
    resetForm,
  };
};

// Example usage:
/*
const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm<FormData>(
  { email: '', password: '' },
  z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  })
);

// In your component:
<form onSubmit={handleSubmit(async (values) => {
  // Handle form submission
  console.log(values);
})}>
  <input
    name="email"
    value={values.email}
    onChange={handleChange}
  />
  {errors.email && <div>{errors.email}</div>}
  
  <input
    type="password"
    name="password"
    value={values.password}
    onChange={handleChange}
  />
  {errors.password && <div>{errors.password}</div>}
  
  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Submitting...' : 'Submit'}
  </button>
</form>
*/
