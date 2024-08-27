import type { APIRoute } from "astro";
import type { BaseContact } from "@/types/contact";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/config/supabase";
import type { PostgrestError } from "@supabase/supabase-js";
import { transporter } from "@/config/nodemailer";

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!request.headers.get("Content-Type")?.includes("application/json")) {
      return new Response(
        JSON.stringify({
          status: 400,
          message: "Invalid content type. Expected application/json",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const { name, email, phone, privacy }: BaseContact = await request.json();

    if (!name || !email || !phone) {
      return new Response(
        JSON.stringify({
          status: 400,
          message: "Missing required fields: name, email, phone",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const token = uuidv4();
    const expirationDate = new Date().getTime() + 1000 * 60 * 60 * 24; // 24 hours

    const { error } = await supabase
      .from("pending_contacts")
      .insert([{ name, email, phone, privacy, token, expirationDate }]);

    if (error) {
      return new Response(
        JSON.stringify({
          status: 500,
          message: "Failed to save contact data",
          error: (error as PostgrestError).message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
    // Send email confirmation
    const confirmUrl = `http://localhost:4321/confirm-contact?token=${token}`;
    const emailData = {
      from: "BG Team <bernardo@galvaocoach.com>",
      to: [email],
      subject: "BG Team - Por favor confirma o teu email!",
      html: `
        <h1>Confirma o teu email</h1>
        <p>Olá ${name},</p>
        <p>Obrigado pelo teu interesse. Por favor clica no link abaixo para confirmares o teu email e completar o processo de inscrição:</p>
        <a href="${confirmUrl}">Confirmar email</a>
        <hr/>
        <p>Se não te inscreveste na plataforma, por favor ignora este email.</p>
        <span>Esta mensagem foi enviada através do contact form no site <a href="https://www.galvaocoach.com/">galvaocoach.com</a></span>
      `,
    };

    await transporter.sendMail(emailData);

    return new Response(
      JSON.stringify({
        status: 201,
        message: "Confirmation email sent",
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 500,
        message: "Failed to send confirmation email",
        error: (error as Error).message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
