import type { APIRoute } from "astro";
import nodemailer from "nodemailer";
import { createClient, type PostgrestError } from "@supabase/supabase-js";

// Create a transporter object using SMTP transport with custom domain
const transporter = nodemailer.createTransport({
  host: import.meta.env.SMTP_HOST,
  port: parseInt(import.meta.env.SMTP_PORT || "465"), // Use 587 for TLS, 465 for SSL
  secure: true, // Use true if you're connecting over SSL/TLS
  auth: {
    user: import.meta.env.SMTP_USER,
    pass: import.meta.env.SMTP_PASS,
  },
});

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_ANON_PUBLIC_KEY;
const supabase = createClient(supabaseUrl, supabaseKey || "");

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  privacy: string;
}

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

    const { name, email, phone, privacy }: ContactFormData =
      await request.json();

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
      .insert([{ name, email, phone_number: phone, privacy }])
      .select();
    if (error) {
      return new Response(
        JSON.stringify({
          status: 500,
          message: "Failed to save contacts",
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

    const emailData = {
      from: "BG Team <bernardo@galvaocoach.com>",
      to: ["edu2andrade@gmail.com"],
      subject: "New Contact Form Submission!",
      html: `
                <h1>New contact data submitted:</h1>
                <br/>
                <p>Name: ${name}</p>
                <p>Email: ${email}</p>
                <p>Phone: ${phone}</p>
                <br/>
                <hr/>
                <p>This message was sent from your contact form on galvaocoach.com</p>
            `,
    };

    await transporter.sendMail(emailData);

    return new Response(
      JSON.stringify({
        status: 201,
        message: "Contact saved successfully",
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
