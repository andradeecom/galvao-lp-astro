import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import * as z from "zod";
import { User, Mail, PhoneCall } from "lucide-react";
import { regexPatterns } from "@/config/utils/constants";
import Input from "@/components/atom/Input";
import Checkbox from "@/components/atom/Checkbox";

const schema = z.object({
  name: z.string().min(3, "Nome é um campo obrigatório"),
  email: z
    .string()
    .email("Endereço de email inválido")
    .min(1, "Email é um campo obrigatório"),
  phone: z
    .string()
    .min(9, "Número de telefone deve ter no mínimo 9 dígitos")
    .regex(regexPatterns.PHONE, "Número de telefone inválido"),
  privacy: z.boolean(),
});

type ContactFormInputs = z.infer<typeof schema>;

interface ReactContactFormProps {
  siteKey: string;
}

const ReactContactForm = ({ siteKey }: ReactContactFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [captchaScore, setCaptchaScore] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<ContactFormInputs> = async (
    data: ContactFormInputs,
  ) => {
    // add google recaptcha
    // email confirmation before saving to db
    // add confirmation page with instructions
    // window.location.href = "/confirm";
    // window.location.href = "/check-your-email";
    setIsLoading(true);
    try {
      if (!(window as any).grecaptcha.ready)
        throw new Error("reCAPTCHA not loaded");
      const recaptchaToken = await (window as any).grecaptcha.execute(siteKey, {
        action: "submit",
      });
      const recaptchaResponse = await fetch("/api/recaptcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recaptcha: recaptchaToken }),
      });
      const recaptchaData = await recaptchaResponse.json();
      if (recaptchaData.success) {
        setCaptchaScore(recaptchaData.score);
        const response = await axios.post("/api/save-contact", data);
        if (response.status === 201) alert("Formulário enviado com sucesso!");
        else alert("Erro ao enviar formulário!");
      } else {
        alert("Erro na verificação do reCAPTCHA!");
      }
    } catch (error) {
      alert(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <Input
          placeholder="John Doe"
          name="name"
          register={register}
          error={errors.name}
          leftIcon={<User className="size-5 text-bgteam-primary-500" />}
        />
        <Input
          placeholder="Email"
          name="email"
          register={register}
          error={errors.email}
          leftIcon={<Mail className="size-5 text-bgteam-primary-500" />}
        />
        <Input
          placeholder="Phone"
          name="phone"
          register={register}
          error={errors.phone}
          leftIcon={<PhoneCall className="size-5 text-bgteam-primary-500" />}
        />
        {/* Check this component validation (string/boolean) correct db if needed... */}
        <Checkbox
          name="privacy"
          register={register}
          error={errors.privacy}
          isRequired
        />
        <button className="btn btn-primary">
          {isLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <span id="button-text">Enviar</span>
          )}
        </button>
      </form>
    </>
  );
};

export default ReactContactForm;
