import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

// Note: Initialize Resend in the handler to avoid build-time errors when RESEND_API_KEY is missing

// Define the expected schema for the request body
const sendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1, 'Subject is required'),
  html: z.string().min(1, 'HTML content is required'),
});

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY is not configured on the server.' }, { status: 500 })
    }
    const resend = new Resend(apiKey)
    const body = await req.json();

    // Validate the request body against the schema
    const validationResult = sendEmailSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { to, subject, html } = validationResult.data;

    const { data, error } = await resend.emails.send({
      from: 'Lokal <mail@lokallifelab.com>', // Replace with your verified sending domain
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json({ error: 'Failed to send email', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Email sent successfully!', data });

  } catch (error) {
    console.error('An unexpected error occurred:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
