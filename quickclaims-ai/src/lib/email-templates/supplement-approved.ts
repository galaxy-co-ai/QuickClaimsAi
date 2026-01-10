interface SupplementApprovedEmailProps {
  policyholderName: string;
  lossAddress: string;
  claimNumber?: string;
  contractorName: string;
  supplementDescription: string;
  requestedAmount: number;
  approvedAmount: number;
  isPartial: boolean;
  portalUrl?: string;
}

export function generateSupplementApprovedEmail(props: SupplementApprovedEmailProps): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    policyholderName,
    lossAddress,
    claimNumber,
    contractorName,
    supplementDescription,
    requestedAmount,
    approvedAmount,
    isPartial,
    portalUrl = process.env.NEXT_PUBLIC_APP_URL || "https://quickclaims.ai",
  } = props;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const approvalType = isPartial ? "Partially Approved" : "Approved";
  const approvalColor = isPartial ? "#f59e0b" : "#10b981";
  const approvalBgColor = isPartial ? "#fef3c7" : "#d1fae5";

  const subject = `Supplement ${approvalType}: ${policyholderName} - ${formatCurrency(approvedAmount)}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Supplement ${approvalType}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: #059669; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                QuickClaims
              </h1>
              <p style="margin: 10px 0 0; color: #a7f3d0; font-size: 14px;">
                Supplement ${approvalType}!
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 20px; font-weight: 600;">
                Great News!
              </h2>

              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                Hello <strong>${contractorName}</strong>,
              </p>

              <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                A supplement for one of your claims has been ${isPartial ? "partially " : ""}approved!
              </p>

              <!-- Claim Details Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 16px; font-weight: 600;">Claim Details</h3>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Policyholder:</td>
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

              <!-- Supplement Details Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: ${approvalBgColor}; border-radius: 8px; margin-bottom: 30px; border: 2px solid ${approvalColor};">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 16px; font-weight: 600;">Supplement Details</h3>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Description:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${supplementDescription}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Requested:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${formatCurrency(requestedAmount)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Approved:</td>
                        <td style="padding: 8px 0; color: ${approvalColor}; font-size: 18px; font-weight: 700;">${formatCurrency(approvedAmount)}</td>
                      </tr>
                      ${isPartial ? `
                      <tr>
                        <td colspan="2" style="padding: 12px 0 0; color: #92400e; font-size: 13px;">
                          * This supplement was partially approved. The approved amount differs from the requested amount.
                        </td>
                      </tr>
                      ` : ""}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}/contractor" style="display: inline-block; padding: 14px 28px; background-color: #059669; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 500; border-radius: 8px;">
                      View Claim Details
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
Supplement ${approvalType} - QuickClaims

Hello ${contractorName},

Great news! A supplement for one of your claims has been ${isPartial ? "partially " : ""}approved.

Claim Details:
- Policyholder: ${policyholderName}
- Address: ${lossAddress}
${claimNumber ? `- Claim #: ${claimNumber}` : ""}

Supplement Details:
- Description: ${supplementDescription}
- Requested: ${formatCurrency(requestedAmount)}
- Approved: ${formatCurrency(approvedAmount)}
${isPartial ? "\n* This supplement was partially approved." : ""}

View the claim details: ${portalUrl}/contractor

---
This email was sent by QuickClaims on behalf of Rise Roofing Supplements.
  `.trim();

  return { subject, html, text };
}
