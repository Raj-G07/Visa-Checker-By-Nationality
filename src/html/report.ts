import { VisaResult } from '../types/visa';

export const generateVisaReportHTML = (result: VisaResult): string => {
  const {
        nationality,
        destination,
        visaType,
        visaType_localized,
        allowedStayText,
        allowedStayText_localized,
        stayPolicy,
        notes,
        notes_localized,
        additionalInfoUrls,
        language,
        found,
        scrapedAt,
    } = result;

    const displayVisaType =
        visaType_localized ?? visaType ?? '—';

    const stayPolicyLabelMap: Record<NonNullStayPolicy, string> = {
        fixed: 'Fixed duration',
        range: 'Limited period',
        conditional: 'Conditional stay',
        unlimited: 'Unlimited stay',
        unknown: 'Subject to conditions',
    };

    const displayPolicy =
        stayPolicy ? stayPolicyLabelMap[stayPolicy] ?? stayPolicy : null;

    const displayStay =
        allowedStayText_localized ??
        allowedStayText ??
        'Not specified';

    const displayNotes =
        notes_localized ??
        notes ??
        (found
            ? 'No additional notes available.'
            : 'Visa information not found for the given input.');

    const linksHtml = (additionalInfoUrls ?? [])
        .map(
            (l: any) => `
        <tr>
          <td>${l.title_localized ?? l.title}</td>
          <td><a href="${l.url}" target="_blank">View</a></td>
        </tr>`
        )
        .join('');

    return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8" />
  <title>Visa Report</title>
  <style>
  :root {
    --primary: #2563eb;
    --bg: #f8fafc;
    --card: #ffffff;
    --text: #0f172a;
    --muted: #64748b;
    --border: #e5e7eb;
    --badge-bg: #eef2ff;
    --badge-text: #3730a3;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 40px 16px;
    background: var(--bg);
    font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    color: var(--text);
  }

  h1 {
    font-size: 28px;
    margin-bottom: 8px;
    letter-spacing: -0.02em;
  }

  h2 {
    font-size: 20px;
    margin-top: 32px;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 2px solid var(--border);
    color: #1e293b;
  }

  p {
    margin: 8px 0;
    line-height: 1.6;
  }

  strong {
    font-weight: 600;
  }

  .badge {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 999px;
    background: var(--badge-bg);
    color: var(--badge-text);
    font-weight: 600;
    font-size: 14px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
    background: var(--card);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
  }

  th {
    background: #f1f5f9;
    color: #334155;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  th,
  td {
    padding: 12px 14px;
    border-bottom: 1px solid var(--border);
    text-align: left;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: #f8fafc;
  }

  a {
    color: var(--primary);
    font-weight: 500;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  .meta {
    margin-top: 32px;
    font-size: 13px;
    color: var(--muted);
    text-align: center;
  }

  @media (max-width: 640px) {
    body {
      padding: 24px 12px;
    }

    h1 {
      font-size: 24px;
    }

    h2 {
      font-size: 18px;
    }

    table {
      font-size: 14px;
    }
  }
</style>
</head>
<body>

<h1>Visa Information</h1>

<p><strong>Nationality:</strong> ${nationality}</p>
<p><strong>Destination:</strong> ${destination}</p>

<h2>Visa Status</h2>
<p class="badge">${displayVisaType}</p>

<h2>Allowed Stay</h2>
<p>${displayStay}</p>
${stayPolicy ? `<p><strong>Policy:</strong> ${displayPolicy}</p>` : ''}

<h2>Notes</h2>
<p>${displayNotes}</p>

${linksHtml
            ? `
<h2>Additional Travel Information</h2>
<table>
  <tr>
    <th>Topic</th>
    <th>Link</th>
  </tr>
  ${linksHtml}
</table>`
            : ''
        }

<p class="meta">
  Language: ${language} · Scraped at: ${new Date(scrapedAt).toLocaleString()}
</p>

</body>
</html>
`;
};
