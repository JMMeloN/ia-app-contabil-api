export const notaProcessadaEmailTemplate = (
  userName: string,
  companyName: string,
  valor: number,
  notaNumero: string,
  downloadUrl?: string
) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      background: #f3f4f6;
      line-height: 1.6;
      color: #111111;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }
    .header {
      background: #111111;
      color: #ffffff;
      padding: 24px;
    }
    .brand {
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 6px 0;
    }
    .subtitle {
      margin: 0;
      color: #fb923c;
      font-size: 14px;
    }
    .content {
      padding: 24px;
    }
    .badge {
      display: inline-block;
      background: #fff7ed;
      color: #c2410c;
      border: 1px solid #fdba74;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 10px;
      margin-bottom: 16px;
    }
    .card {
      border: 1px solid #fcd9bd;
      background: #fffbf8;
      border-radius: 10px;
      padding: 16px;
      margin: 18px 0;
    }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      border-bottom: 1px solid #fed7aa;
      padding: 10px 0;
    }
    .row:last-child {
      border-bottom: none;
    }
    .label {
      color: #6b7280;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .value {
      color: #111111;
      font-size: 14px;
      font-weight: 700;
      text-align: right;
    }
    .amount {
      text-align: center;
      font-size: 30px;
      font-weight: 800;
      color: #111111;
      margin-top: 12px;
    }
    .cta {
      text-align: center;
      margin-top: 18px;
    }
    .btn {
      display: inline-block;
      background: #f97316;
      color: #111111;
      text-decoration: none;
      font-weight: 800;
      font-size: 14px;
      padding: 12px 20px;
      border-radius: 8px;
    }
    .footer {
      background: #111111;
      color: #d1d5db;
      padding: 16px 24px;
      text-align: center;
    }
    .muted {
      color: #6b7280;
      font-size: 13px;
      margin-top: 12px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <p class="brand">IAContabil</p>
      <p class="subtitle">Nota fiscal processada</p>
    </div>
    <div class="content">
      <span class="badge">Processada com sucesso</span>
      <p>Olá, <strong>${userName}</strong>.</p>
      <p>
        Sua nota fiscal já está disponível. Seguem os detalhes:
      </p>
      <div class="card">
        <div class="row">
          <span class="label">Empresa</span>
          <span class="value">${companyName}</span>
        </div>
        <div class="row">
          <span class="label">Número</span>
          <span class="value">${notaNumero}</span>
        </div>
        <div class="amount">
          ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)}
        </div>
      </div>
      ${downloadUrl ? `
      <div class="cta">
        <a href="${downloadUrl}" class="btn">Visualizar e Baixar Nota</a>
      </div>
      ` : ''}
      <p class="muted">
        Você também pode abrir o app/painel para consultar a nota e baixar novamente quando quiser.
      </p>
    </div>
    <div class="footer">
      IAContabil • © ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>
`;
