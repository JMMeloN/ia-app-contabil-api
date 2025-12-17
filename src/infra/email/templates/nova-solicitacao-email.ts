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
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: #f8f9fa;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .solicitacao-info {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #f59e0b;
    }
    .info-row {
      margin: 10px 0;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: bold;
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
    }
    .value {
      color: #111827;
      font-size: 16px;
      margin-top: 4px;
    }
    .alert {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔔 Nova Solicitação de Nota Fiscal!</h1>
  </div>
  <div class="content">
    <div class="alert">
      <strong>⚠️ Ação Necessária:</strong> Uma nova solicitação de nota fiscal foi criada e aguarda processamento.
    </div>

    <div class="solicitacao-info">
      <h3>👤 Dados do Solicitante</h3>
      <div class="info-row">
        <div class="label">Nome</div>
        <div class="value">${userName}</div>
      </div>
      <div class="info-row">
        <div class="label">Email</div>
        <div class="value">${userEmail}</div>
      </div>
    </div>

    <div class="solicitacao-info">
      <h3>🏢 Dados da Empresa</h3>
      <div class="info-row">
        <div class="label">Razão Social</div>
        <div class="value">${companyName}</div>
      </div>
      <div class="info-row">
        <div class="label">CNPJ</div>
        <div class="value">${companyCNPJ}</div>
      </div>
    </div>

    <div class="solicitacao-info">
      <h3>📄 Dados da Nota Fiscal</h3>
      <div class="info-row">
        <div class="label">Valor</div>
        <div class="value" style="color: #059669; font-weight: bold; font-size: 20px;">
          ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)}
        </div>
      </div>
      <div class="info-row">
        <div class="label">Data de Emissão</div>
        <div class="value">${new Date(dataEmissao).toLocaleDateString('pt-BR')}</div>
      </div>
      ${observacoes ? `
      <div class="info-row">
        <div class="label">Observações</div>
        <div class="value">${observacoes}</div>
      </div>
      ` : ''}
    </div>

    <p style="margin-top: 30px; text-align: center; color: #6b7280;">
      Acesse o painel administrativo para processar esta solicitação.
    </p>
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} IAContabil - Sistema de Gestão de Notas Fiscais</p>
    <p style="font-size: 10px; color: #9ca3af;">Este é um email automático, não responda.</p>
  </div>
</body>
</html>
`;
