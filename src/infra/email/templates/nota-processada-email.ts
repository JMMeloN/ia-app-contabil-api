export const notaProcessadaEmailTemplate = (
  userName: string,
  companyName: string,
  valor: number,
  notaNumero: string,
  downloadUrl: string
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
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
    .nota-info {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #10b981;
    }
    .button {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 14px 40px;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 20px;
      font-weight: bold;
    }
    .button:hover {
      background: #059669;
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
    <h1>✅ Nota Fiscal Processada!</h1>
  </div>
  <div class="content">
    <p>Olá <strong>${userName}</strong>,</p>

    <p>Temos ótimas notícias! Sua nota fiscal foi processada com sucesso.</p>

    <div class="nota-info">
      <h3>📄 Detalhes da Nota Fiscal</h3>
      <p><strong>Empresa:</strong> ${companyName}</p>
      <p><strong>Número:</strong> ${notaNumero}</p>
      <p><strong>Valor:</strong> ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)}</p>
    </div>

    <p>Você já pode fazer o download da sua nota fiscal:</p>

    <center>
      <a href="${downloadUrl}" class="button">📥 Baixar Nota Fiscal</a>
    </center>

    <p style="margin-top: 30px; font-size: 14px; color: #666;">
      <strong>Dica:</strong> Guarde esse arquivo em um local seguro para suas declarações fiscais.
    </p>

    <p>Atenciosamente,<br><strong>Equipe IAContabil</strong></p>
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} IAContabil - Todos os direitos reservados</p>
  </div>
</body>
</html>
`;
