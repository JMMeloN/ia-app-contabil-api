export const notaProcessadaEmailTemplate = (
  userName: string,
  companyName: string,
  valor: number,
  notaNumero: string,
  downloadUrl: string
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
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 40px 20px;
      text-align: center;
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
    .success-banner {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      border-left: 4px solid #10b981;
      padding: 16px 20px;
      margin-bottom: 30px;
      border-radius: 6px;
      text-align: center;
    }
    .success-banner-text {
      color: #065f46;
      font-size: 15px;
      font-weight: 600;
    }
    .greeting {
      font-size: 18px;
      color: #1f2937;
      margin-bottom: 20px;
    }
    .message {
      color: #4b5563;
      font-size: 15px;
      margin-bottom: 15px;
    }
    .nota-card {
      background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
      border: 2px solid #5eead4;
      border-radius: 12px;
      padding: 28px;
      margin: 30px 0;
    }
    .nota-card-title {
      color: #134e4a;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
      text-align: center;
    }
    .nota-info-row {
      display: flex;
      justify-content: space-between;
      padding: 14px 0;
      border-bottom: 1px solid #99f6e4;
    }
    .nota-info-row:last-child {
      border-bottom: none;
    }
    .nota-label {
      color: #0f766e;
      font-size: 13px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .nota-value {
      color: #134e4a;
      font-size: 15px;
      font-weight: 700;
      text-align: right;
    }
    .valor-destaque {
      background: linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%);
      border: 2px dashed #14b8a6;
      padding: 24px;
      border-radius: 10px;
      text-align: center;
      margin: 24px 0;
    }
    .valor-label {
      color: #0f766e;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      margin-bottom: 10px;
    }
    .valor-number {
      color: #047857;
      font-size: 36px;
      font-weight: 800;
      text-shadow: 1px 1px 0 rgba(16, 185, 129, 0.1);
    }
    .cta-section {
      text-align: center;
      margin: 35px 0;
    }
    .download-button {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      transition: all 0.3s ease;
    }
    .tip-box {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 18px;
      margin-top: 30px;
    }
    .tip-title {
      color: #1e40af;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tip-text {
      color: #1e3a8a;
      font-size: 13px;
      line-height: 1.6;
    }
    .signature {
      margin-top: 35px;
      padding-top: 25px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
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
      <h1 class="header-title" style="font-size: 28px; margin-bottom: 10px;">IAContabil</h1>
      <p style="color: rgba(255,255,255,0.9); font-size: 20px; margin: 0;">✅ Nota Fiscal Pronta!</p>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="success-banner">
        <p class="success-banner-text">🎉 Sua nota fiscal foi processada com sucesso!</p>
      </div>

      <p class="greeting">Olá, <strong>${userName}</strong>!</p>

      <p class="message">
        Temos ótimas notícias! Sua solicitação de nota fiscal foi processada e o documento
        já está disponível para download.
      </p>

      <!-- Nota Card -->
      <div class="nota-card">
        <div class="nota-card-title">📄 Detalhes da Nota Fiscal</div>

        <div class="nota-info-row">
          <span class="nota-label">Empresa</span>
          <span class="nota-value">${companyName}</span>
        </div>

        <div class="nota-info-row">
          <span class="nota-label">Número da Nota</span>
          <span class="nota-value">${notaNumero}</span>
        </div>

        <div class="valor-destaque">
          <div class="valor-label">Valor Total</div>
          <div class="valor-number">
            ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)}
          </div>
        </div>
      </div>

      <!-- CTA Download -->
      <div class="cta-section">
        <p class="message" style="margin-bottom: 20px;">
          <strong>Faça o download da sua nota fiscal agora:</strong>
        </p>
        <a href="${downloadUrl}" class="download-button">
          📥 Baixar Nota Fiscal (PDF)
        </a>
      </div>

      <!-- Tip Box -->
      <div class="tip-box">
        <div class="tip-title">
          💡 Dica Importante
        </div>
        <p class="tip-text">
          Guarde este arquivo em um local seguro. Você precisará dele para suas
          declarações fiscais e registros contábeis. Recomendamos fazer backup
          em mais de um local.
        </p>
      </div>

      <div class="signature">
        <p><strong>Atenciosamente,</strong></p>
        <p><strong>Equipe IAContabil</strong></p>
        <p style="color: #9ca3af; font-size: 13px; margin-top: 5px;">
          Gestão Inteligente de Notas Fiscais
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
