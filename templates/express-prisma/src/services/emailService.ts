// Stub for email sending. Replace with real implementation in production.
export async function sendEmail(to: string, subject: string, text: string) {
  // In production, integrate with a real email provider
  console.log(`[Email] To: ${to} | Subject: ${subject} | Text: ${text}`);
}
