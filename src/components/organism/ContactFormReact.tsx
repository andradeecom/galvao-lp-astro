import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import * as z from "zod";
import { regexPatterns } from "../../utils/constants";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone: z
    .string()
    .min(9, "Número de telefone deve ter no mínimo 9 dígitos")
    .regex(regexPatterns.PHONE, "Número de telefone inválido"),
});

type ContactFormInputs = z.infer<typeof schema>;

const ReactContactForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<ContactFormInputs> = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Form</h1>
    </form>
  );
};

export default ReactContactForm;
