// Template para ADMIN (iaappcontabil@gmail.com) - Alerta de Nova Solicitação
export const novaSolicitacaoAdminEmailTemplate = (
  userName: string,
  userEmail: string,
  companyName: string,
  companyCNPJ: string,
  valor: number,
  dataEmissao: string,
  observacoes: string
) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background: #f3f4f6; color: #111111; }
    .email-container { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .header { background: #111111; color: #fff; padding: 24px; }
    .brand { margin: 0; font-size: 22px; font-weight: 800; }
    .subtitle { margin: 6px 0 0 0; color: #fb923c; font-size: 14px; }
    .content { padding: 24px; }
    .badge { display: inline-block; border: 1px solid #fdba74; background: #fff7ed; color: #c2410c; border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
    .section { border: 1px solid #fcd9bd; background: #fffbf8; border-radius: 10px; padding: 14px; margin: 14px 0; }
    .title { margin: 0 0 10px 0; font-size: 14px; font-weight: 800; color: #9a3412; text-transform: uppercase; }
    .row { display: flex; justify-content: space-between; gap: 8px; border-bottom: 1px solid #fed7aa; padding: 8px 0; }
    .row:last-child { border-bottom: none; }
    .label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; }
    .value { font-size: 14px; font-weight: 700; color: #111111; text-align: right; }
    .amount { text-align: center; font-size: 30px; font-weight: 800; margin-top: 8px; }
    .obs { font-size: 14px; color: #374151; margin-top: 8px; }
    .footer { background: #111111; color: #d1d5db; text-align: center; padding: 16px 24px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <p class="brand">IAContabil</p>
      <p class="subtitle">Nova solicitação para processar</p>
    </div>

    <div class="content">
      <span class="badge">Ação necessária</span>

      <div class="section">
        <p class="title">Solicitante</p>
        <div class="row"><span class="label">Nome</span><span class="value">${userName}</span></div>
        <div class="row"><span class="label">Email</span><span class="value">${userEmail}</span></div>
      </div>

      <div class="section">
        <p class="title">Empresa emissora</p>
        <div class="row"><span class="label">Razão social</span><span class="value">${companyName}</span></div>
        <div class="row"><span class="label">CNPJ</span><span class="value">${companyCNPJ}</span></div>
      </div>

      <div class="section">
        <p class="title">Dados da nota</p>
        <div class="row"><span class="label">Data de emissão</span><span class="value">${new Date(dataEmissao).toLocaleDateString('pt-BR')}</span></div>
        <div class="amount">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)}</div>
        ${observacoes ? `<p class="obs"><strong>Observações:</strong> ${observacoes}</p>` : ''}
      </div>
    </div>

    <div class="footer">IAContabil • © ${new Date().getFullYear()}</div>
  </div>
</body>
</html>
`;
