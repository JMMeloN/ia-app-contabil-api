export const welcomeEmailTemplate = (userName: string) => `
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
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
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
    .features-list {
      background-color: #f9fafb;
      border-left: 4px solid #2563eb;
      padding: 20px 25px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .features-list h3 {
      color: #1f2937;
      font-size: 16px;
      margin-bottom: 15px;
    }
    .features-list ul {
      list-style: none;
      padding: 0;
    }
    .features-list li {
      color: #4b5563;
      font-size: 14px;
      padding: 8px 0;
      padding-left: 25px;
      position: relative;
    }
    .features-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: bold;
      font-size: 16px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 15px;
      margin: 20px 0;
      text-align: center;
    }
    .signature {
      margin-top: 30px;
      padding-top: 20px;
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
      <img src="https://res.cloudinary.com/root/image/upload/v1/iacontabil/logo-white.png" alt="IAContabil" class="logo">
      <h1 class="header-title">Bem-vindo ao IAContabil!</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Olá, <strong>${userName}</strong>!</p>

      <p class="message">
        É com grande satisfação que damos as boas-vindas a você no <strong>IAContabil</strong>,
        sua plataforma completa para gestão de notas fiscais.
      </p>

      <p class="message">
        Sua conta foi criada com sucesso e você já pode começar a utilizar todos os recursos
        disponíveis em nossa plataforma.
      </p>

      <div class="features-list">
        <h3>O que você pode fazer:</h3>
        <ul>
          <li>Cadastrar e gerenciar suas empresas</li>
          <li>Solicitar emissão de notas fiscais de forma simples</li>
          <li>Acompanhar o status das solicitações em tempo real</li>
          <li>Fazer download das notas fiscais processadas</li>
          <li>Visualizar histórico completo de solicitações</li>
        </ul>
      </div>

      <p class="message">
        Comece agora mesmo cadastrando sua primeira empresa e faça sua primeira solicitação de nota fiscal!
      </p>

      <div class="signature">
        <p><strong>Atenciosamente,</strong></p>
        <p><strong>Equipe IAContabil</strong></p>
        <p style="color: #9ca3af; font-size: 13px;">Gestão Inteligente de Notas Fiscais</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} IAContabil - Todos os direitos reservados</p>
      <p class="footer-text">Este é um e-mail automático. Por favor, não responda.</p>
    </div>
  </div>
</body>
</html>
`;
