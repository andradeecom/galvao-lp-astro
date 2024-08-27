import { transporter } from "@/config/nodemailer";
import { supabase } from "@/config/supabase";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ url }): Promise<Response | any> => {
  try {
    const token = url.searchParams.get("token");
    if (!token) {
      return new Response(
        JSON.stringify({
          status: 400,
          message: "Invalid token",
        }),
        { status: 400 },
      );
    }

    const { data: pendingContacts, error } = await supabase
      .from("pending_contacts")
      .select("*")
      .eq("token", token);

    if (error || !pendingContacts || pendingContacts.length === 0) {
      return new Response(
        JSON.stringify({ status: 400, message: "Invalid or expired token" }),
        { status: 400 },
      );
    }
    const contactData = pendingContacts[0];

    if (contactData.expirationDate < new Date().getTime()) {
      return new Response(
        JSON.stringify({ status: 400, message: "Token expired" }),
        { status: 400 },
      );
    }

    // Store the confirmed data in 'contacts' collection
    const { error: insertError } = await supabase.from("contacts").insert([
      {
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        privacy: contactData.privacy,
      },
    ]);

    if (insertError) {
      return new Response(
        JSON.stringify({
          status: 500,
          message: "Failed to save contact",
          error: insertError.message,
        }),
        { status: 500 },
      );
    }
    // Delete the pending contact
    const { error: deleteError } = await supabase
      .from("pending_contacts")
      .delete()
      .eq("token", token);
    if (deleteError) {
      return new Response(
        JSON.stringify({
          status: 500,
          message: "Failed to delete pending contact",
          error: deleteError.message,
        }),
        { status: 500 },
      );
    }

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

    await transporter.sendMail(emailData);

    return new Response(
      JSON.stringify({
        status: 201,
        message: "Email confirmed and contact saved successfully",
      }),
      { status: 201 },
    );
  } catch (error) {
    JSON.stringify({
      status: 500,
      message: "Failed to confirm email",
      error: (error as Error).message,
    });
  }
};
