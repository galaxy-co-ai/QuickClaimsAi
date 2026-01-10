import { CLAIM_STATUS_LABELS } from "@/lib/constants";
import type { ClaimStatus } from "@prisma/client";

interface StatusChangeEmailProps {
  policyholderName: string;
  lossAddress: string;
  claimNumber?: string;
  oldStatus: ClaimStatus;
  newStatus: ClaimStatus;
  contractorName: string;
  portalUrl?: string;
}

export function generateStatusChangeEmail(props: StatusChangeEmailProps): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    policyholderName,
    lossAddress,
    claimNumber,
    oldStatus,
    newStatus,
    contractorName,
    portalUrl = process.env.NEXT_PUBLIC_APP_URL || "https://quickclaims.ai",
  } = props;

  const oldStatusLabel = CLAIM_STATUS_LABELS[oldStatus] || oldStatus;
  const newStatusLabel = CLAIM_STATUS_LABELS[newStatus] || newStatus;

  const subject = `Claim Status Update: ${policyholderName} - ${newStatusLabel}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Claim Status Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: #1e40af; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                QuickClaims
              </h1>
              <p style="margin: 10px 0 0; color: #93c5fd; font-size: 14px;">
                Rise Roofing Supplements
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 20px; font-weight: 600;">
                Claim Status Update
              </h2>

              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                Hello <strong>${contractorName}</strong>,
              </p>

              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                The status of a claim has been updated. Here are the details:
              </p>

              <!-- Claim Details Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Policyholder:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${policyholderName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Address:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${lossAddress}</td>
                      </tr>
                      ${claimNumber ? `
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Claim #:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${claimNumber}</td>
                      </tr>
                      ` : ""}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Status Change -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <table role="presentation" style="border-collapse: collapse;">
                      <tr>
                        <td style="padding: 10px 20px; background-color: #fee2e2; border-radius: 20px;">
                          <span style="color: #991b1b; font-size: 14px; font-weight: 500;">${oldStatusLabel}</span>
                        </td>
                        <td style="padding: 0 15px; color: #9ca3af; font-size: 20px;">→</td>
                        <td style="padding: 10px 20px; background-color: #dcfce7; border-radius: 20px;">
                          <span style="color: #166534; font-size: 14px; font-weight: 500;">${newStatusLabel}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}/contractor" style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 500; border-radius: 8px;">
                      View in Portal
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px; text-align: center;">
                This email was sent by QuickClaims on behalf of Rise Roofing Supplements.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                If you no longer wish to receive these notifications, please update your preferences in the contractor portal.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Claim Status Update - QuickClaims

Hello ${contractorName},

The status of a claim has been updated.

Claim Details:
- Policyholder: ${policyholderName}
- Address: ${lossAddress}
${claimNumber ? `- Claim #: ${claimNumber}` : ""}

Status Change: ${oldStatusLabel} → ${newStatusLabel}

View the claim in your portal: ${portalUrl}/contractor

---
This email was sent by QuickClaims on behalf of Rise Roofing Supplements.
  `.trim();

  return { subject, html, text };
}
