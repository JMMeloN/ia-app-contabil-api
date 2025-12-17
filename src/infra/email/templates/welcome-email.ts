export const welcomeEmailTemplate = (userName: string) => `
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 20px;
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
    <h1>🎉 Bem-vindo ao IAContabil!</h1>
  </div>
  <div class="content">
    <p>Olá <strong>${userName}</strong>,</p>

    <p>Sua conta foi criada com sucesso! Estamos muito felizes em ter você conosco.</p>

    <p>Com o <strong>IAContabil</strong>, você pode:</p>
    <ul>
      <li>✅ Cadastrar suas empresas</li>
      <li>✅ Solicitar emissão de notas fiscais</li>
      <li>✅ Acompanhar o status das suas solicitações</li>
      <li>✅ Baixar as notas fiscais processadas</li>
    </ul>

    <p>Comece agora mesmo cadastrando sua primeira empresa!</p>

    <p>Se tiver alguma dúvida, estamos à disposição para ajudar.</p>

    <p>Atenciosamente,<br><strong>Equipe IAContabil</strong></p>
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} IAContabil - Todos os direitos reservados</p>
  </div>
</body>
</html>
`;
