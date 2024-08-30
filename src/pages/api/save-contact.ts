import type { APIRoute } from "astro";
import type { BaseContact } from "@/types/contact";
import { supabase } from "@/config/supabase/client";
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

    const { data, error } = await supabase
      .from("contacts")
      .insert([
        {
          name,
          email,
          phone,
          privacy,
        },
      ])
      .select();

    if (error) {
      return new Response(
        JSON.stringify({
          status: 500,
          message: "Failed to save contact data (supabase)",
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
    const contactData = data[0];
    const emailData = {
      from: "BG Team <bernardo@galvaocoach.com>",
      to: ["bernardo@galvaocoach.com"],
      subject: "BG Team - Novo contacto!",
      html: `
        <h1>Olá Coach</h1>
        <h3>Um novo contacto acaba de se inscrever através do site!</h3>
        <p>Estes são os seus dados:</p>
        <p>Nome: ${contactData.name}</p>
        <p>Email: ${contactData.email}</p>
        <p>Telefone: ${contactData.phone}</p>
        <hr/>
        <p>Esta mensagem foi enviada porque alguém se inscreveu em galvaocoach.com</p>
      `,
    };
    // Send email to notify the coach
    await transporter.sendMail(emailData);
    return new Response(
      JSON.stringify({
        status: 201,
        message: "Email confirmed and contact saved successfully",
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
        message: "Failed to save contact",
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
