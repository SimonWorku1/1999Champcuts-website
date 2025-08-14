import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { headers } from 'next/headers';

// In-memory store for rate limiting (in production, use Redis or database)
const submissionStore = new Map<string, number>();

const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'outlook', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use an app password for Gmail
  },
});

// Rate limiting function
const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const sixHours = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  
  const lastSubmission = submissionStore.get(ip);
  
  if (!lastSubmission) {
    return false; // No previous submission
  }
  
  // Check if 6 hours have passed since last submission
  if (now - lastSubmission < sixHours) {
    return true; // Rate limited
  }
  
  return false; // Not rate limited
};

// Update submission timestamp
const updateSubmissionTime = (ip: string) => {
  submissionStore.set(ip, Date.now());
};

// Clean up old entries (older than 24 hours)
const cleanupOldEntries = () => {
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  
  for (const [ip, timestamp] of Array.from(submissionStore.entries())) {
    if (now - timestamp > twentyFourHours) {
      submissionStore.delete(ip);
    }
  }
};

export async function POST(request: Request) {
  const headersList = headers();
  const forwarded = headersList.get('x-forwarded-for');
  const realIP = headersList.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIP || 'unknown';

  // Clean up old entries periodically
  cleanupOldEntries();

  // Check rate limiting
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Rate limited. Please wait 6 hours before sending another message.' 
      }, 
      { status: 429 }
    );
  }

  const { name, email, message } = await request.json();

  try {
    // Fetch dynamic recipient email from settings/contactInfo
    let recipient = process.env.EMAIL_FALLBACK_TO || 'Yeisonpablocalmo@gmail.com';
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/contact-info`, { cache: 'no-cache' });
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data.email === 'string' && data.email.length > 0) {
          recipient = data.email;
        }
      }
    } catch (e) {
      // If fetching fails, use fallback
    }
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipient, // Dynamic recipient from settings
      subject: `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    // Update submission time after successful email
    updateSubmissionTime(ip);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
  }
}
