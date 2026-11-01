import axios from 'axios';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SENDER_EMAIL = process.env.RESEND_FROM || 'Denc Xaalis <onboarding@resend.dev>';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envoie un email transactionnel via l'API Resend
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const recipients = Array.isArray(to) ? to : [to];

    const response = await axios.post(
      'https://api.resend.com/emails',
      {
        from: SENDER_EMAIL,
        to: recipients,
        subject,
        html,
        text: text || html.replace(/<[^>]*>?/gm, ''),
      },
      {
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`[Resend Email] Email envoyé avec succès à ${recipients.join(', ')} : ID ${response.data?.id}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    const errMsg = error.response?.data?.message || error.message || 'Erreur lors de l\'envoi de l\'email Resend';
    console.error('[Resend Email Error]:', errMsg);
    return { success: false, error: errMsg };
  }
}

/**
 * Email de bienvenue lors de l'inscription
 */
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const html = `
    <div style="font-family: 'Plus Jakarta Sans', sans-serif, Arial; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; padding: 24px;">
      <div style="background: linear-gradient(135deg, #065f46, #0d9488); padding: 20px; border-radius: 12px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Denc Xaalis Sénégal</h1>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Votre plateforme d'épargne & tontines rotatives certifiée</p>
      </div>
      <div style="padding: 24px 8px; color: #1e293b;">
        <h2 style="font-size: 18px; font-weight: 700; color: #0f172a;">Dalal ak Jamm, ${userName} !</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          Bienvenue sur <strong>Denc Xaalis</strong>. Votre compte a été créé avec succès. Vous pouvez dès maintenant rejoindre des tontines vérifiées ou créer votre propre groupe d'épargne rotative.
        </p>
        <div style="background: #f8fafc; border: 1px dashed #cbd5e1; padding: 16px; border-radius: 12px; margin: 20px 0;">
          <h4 style="margin: 0 0 8px; color: #065f46; font-size: 14px;">Modes de paiement pris en charge :</h4>
          <p style="margin: 0; font-size: 13px; color: #64748b;">🌊 Wave Sénégal • 🍊 Orange Money • 🔴 Free Money • 💳 Portefeuille digital</p>
        </div>
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 11px; color: #94a3b8;">
        © 2026 Denc Xaalis Fintech Sénégal. Conforme aux standards BCEAO.
      </div>
    </div>
  `;
  return sendEmail({
    to: userEmail,
    subject: 'Bienvenue sur Denc Xaalis Sénégal 🇸🇳',
    html,
  });
}

/**
 * Email de rappel de cotisation
 */
export async function sendCotisationReminderEmail(userEmail: string, userName: string, tontineNom: string, montant: number, dateEcheance: string) {
  const html = `
    <div style="font-family: 'Plus Jakarta Sans', sans-serif, Arial; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; padding: 24px;">
      <div style="background: linear-gradient(135deg, #065f46, #0d9488); padding: 20px; border-radius: 12px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Rappel de Cotisation Denc Xaalis</h1>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Tontine : ${tontineNom}</p>
      </div>
      <div style="padding: 24px 8px; color: #1e293b;">
        <p style="font-size: 14px; color: #475569;">Bonjour <strong>${userName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          Ceci est un rappel amical concernant votre cotisation pour le tour en cours dans la tontine <strong>${tontineNom}</strong>.
        </p>
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 16px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 0 0 6px; font-size: 14px; color: #065f46;"><strong>Montant à cotiser :</strong> <span style="font-size: 18px; font-weight: bold;">${montant.toLocaleString('fr-FR')} FCFA</span></p>
          <p style="margin: 0; font-size: 13px; color: #047857;"><strong>Date d'échéance :</strong> ${dateEcheance}</p>
        </div>
        <p style="font-size: 13px; color: #64748b;">
          Réglez votre cotisation en toute sécurité via Wave, Orange Money ou votre solde de portefeuille direct sur la plateforme.
        </p>
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 11px; color: #94a3b8;">
        Denc Xaalis Sénégal • Solidarité & Transparence
      </div>
    </div>
  `;
  return sendEmail({
    to: userEmail,
    subject: `Rappel de cotisation : ${tontineNom} (${montant.toLocaleString('fr-FR')} FCFA)`,
    html,
  });
}
