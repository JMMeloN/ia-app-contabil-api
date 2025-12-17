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
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      padding: 40px 20px;
      line-height: 1.6;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      max-width: 180px;
      height: auto;
      margin-bottom: 20px;
    }
    .header-title {
      color: #ffffff;
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .alert-banner {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-left: 4px solid #f59e0b;
      padding: 16px 20px;
      margin-bottom: 30px;
      border-radius: 6px;
    }
    .alert-banner strong {
      color: #92400e;
      font-size: 15px;
    }
    .section {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 20px;
      border: 1px solid #e5e7eb;
    }
    .section-title {
      color: #1f2937;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #6b7280;
      font-size: 13px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-value {
      color: #1f2937;
      font-size: 15px;
      font-weight: 600;
      text-align: right;
    }
    .valor-destaque {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
      border: 2px solid #10b981;
    }
    .valor-label {
      color: #065f46;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .valor-number {
      color: #047857;
      font-size: 32px;
      font-weight: 700;
    }
    .observacoes-box {
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 16px;
      margin-top: 12px;
    }
    .observacoes-text {
      color: #4b5563;
      font-size: 14px;
      font-style: italic;
      line-height: 1.6;
    }
    .footer {
      background-color: #f9fafb;
      padding: 25px 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-text {
      color: #9ca3af;
      font-size: 12px;
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <img src="https://res.cloudinary.com/root/image/upload/v1/iacontabil/logo-white.png" alt="IAContabil" class="logo">
      <h1 class="header-title">🔔 Nova Solicitação Recebida</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="alert-banner">
        <strong>⚠️ Ação Necessária:</strong> Uma nova solicitação de nota fiscal aguarda processamento.
      </div>

      <!-- Dados do Solicitante -->
      <div class="section">
        <div class="section-title">
          👤 Dados do Solicitante
        </div>
        <div class="info-row">
          <span class="info-label">Nome Completo</span>
          <span class="info-value">${userName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">E-mail</span>
          <span class="info-value">${userEmail}</span>
        </div>
      </div>

      <!-- Dados da Empresa -->
      <div class="section">
        <div class="section-title">
          🏢 Dados da Empresa
        </div>
        <div class="info-row">
          <span class="info-label">Razão Social</span>
          <span class="info-value">${companyName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">CNPJ</span>
          <span class="info-value">${companyCNPJ}</span>
        </div>
      </div>

      <!-- Dados da Nota Fiscal -->
      <div class="section">
        <div class="section-title">
          📄 Dados da Nota Fiscal
        </div>

        <div class="valor-destaque">
          <div class="valor-label">Valor da Nota Fiscal</div>
          <div class="valor-number">
            ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)}
          </div>
        </div>

        <div class="info-row">
          <span class="info-label">Data de Emissão</span>
          <span class="info-value">${new Date(dataEmissao).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })}</span>
        </div>

        ${observacoes ? `
        <div style="margin-top: 16px;">
          <div class="info-label" style="margin-bottom: 8px;">Observações</div>
          <div class="observacoes-box">
            <p class="observacoes-text">${observacoes}</p>
          </div>
        </div>
        ` : ''}
      </div>

      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 16px; margin-top: 25px; text-align: center;">
        <p style="color: #1e40af; font-size: 14px; font-weight: 500;">
          Acesse o painel administrativo para processar esta solicitação.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-text" style="font-weight: 600; color: #6b7280; margin-bottom: 8px;">
        IAContabil - Sistema de Gestão de Notas Fiscais
      </p>
      <p class="footer-text">© ${new Date().getFullYear()} IAContabil - Todos os direitos reservados</p>
      <p class="footer-text">Este é um e-mail automático. Por favor, não responda.</p>
    </div>
  </div>
</body>
</html>
`;
