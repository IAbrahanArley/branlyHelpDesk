interface TicketCreatedEmailProps {
  userName: string;
  ticketNumber: string;
  ticketTitle: string;
  ticketPriority: string;
  ticketUrl: string;
}

interface AdminResponseEmailProps {
  userName: string;
  ticketNumber: string;
  ticketTitle: string;
  adminName: string;
  message: string;
  ticketUrl: string;
}

interface TicketResolvedEmailProps {
  userName: string;
  ticketNumber: string;
  ticketTitle: string;
  ticketUrl: string;
}

interface NewTicketEmailProps {
  adminName: string;
  ticketNumber: string;
  ticketTitle: string;
  userName: string;
  ticketPriority: string;
  ticketUrl: string;
  isUrgent: boolean;
}

export function getTicketCreatedEmail({
  userName,
  ticketNumber,
  ticketTitle,
  ticketPriority,
  ticketUrl,
}: TicketCreatedEmailProps): { subject: string; html: string } {
  const priorityLabels: Record<string, string> = {
    LOW: "Baixa",
    MEDIUM: "Média",
    HIGH: "Alta",
    URGENT: "Urgente",
  };

  const subject = `Ticket #${ticketNumber} criado com sucesso`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">Ticket Criado com Sucesso</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Olá <strong>${userName}</strong>,</p>
          <p>Seu ticket foi criado com sucesso! Abaixo estão os detalhes:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <p style="margin: 5px 0;"><strong>Número do Ticket:</strong> ${ticketNumber}</p>
            <p style="margin: 5px 0;"><strong>Título:</strong> ${ticketTitle}</p>
            <p style="margin: 5px 0;"><strong>Prioridade:</strong> ${priorityLabels[ticketPriority] || ticketPriority}</p>
          </div>
          
          <p>Nossa equipe irá analisar seu ticket e responderá em breve.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${ticketUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Ticket</a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Se você não criou este ticket, por favor ignore este e-mail.
          </p>
        </div>
      </body>
    </html>
  `;

  return { subject, html };
}

export function getAdminResponseEmail({
  userName,
  ticketNumber,
  ticketTitle,
  adminName,
  message,
  ticketUrl,
}: AdminResponseEmailProps): { subject: string; html: string } {
  const subject = `Nova resposta no Ticket #${ticketNumber}`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">Nova Resposta no Seu Ticket</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Olá <strong>${userName}</strong>,</p>
          <p>Você recebeu uma nova resposta do administrador <strong>${adminName}</strong> no seu ticket:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 5px 0;"><strong>Ticket:</strong> #${ticketNumber}</p>
            <p style="margin: 5px 0;"><strong>Título:</strong> ${ticketTitle}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;"><strong>Mensagem:</strong></p>
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${ticketUrl}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Resposta Completa</a>
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, html };
}

export function getTicketResolvedEmail({
  userName,
  ticketNumber,
  ticketTitle,
  ticketUrl,
}: TicketResolvedEmailProps): { subject: string; html: string } {
  const subject = `Ticket #${ticketNumber} foi resolvido`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">Ticket Resolvido</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Olá <strong>${userName}</strong>,</p>
          <p>Ótimas notícias! Seu ticket foi resolvido pela nossa equipe.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 5px 0;"><strong>Número do Ticket:</strong> #${ticketNumber}</p>
            <p style="margin: 5px 0;"><strong>Título:</strong> ${ticketTitle}</p>
          </div>
          
          <p>Você pode visualizar os detalhes da resolução acessando o ticket.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${ticketUrl}" style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Ticket</a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Se você tiver alguma dúvida ou problema, pode reabrir o ticket ou criar um novo.
          </p>
        </div>
      </body>
    </html>
  `;

  return { subject, html };
}

export function getNewTicketEmail({
  adminName,
  ticketNumber,
  ticketTitle,
  userName,
  ticketPriority,
  ticketUrl,
  isUrgent,
}: NewTicketEmailProps): { subject: string; html: string } {
  const priorityLabels: Record<string, string> = {
    LOW: "Baixa",
    MEDIUM: "Média",
    HIGH: "Alta",
    URGENT: "Urgente",
  };

  const subject = isUrgent 
    ? `🚨 TICKET URGENTE: #${ticketNumber}`
    : `Novo Ticket: #${ticketNumber}`;

  const urgentStyle = isUrgent 
    ? "background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);"
    : "background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="${urgentStyle} color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">${isUrgent ? "🚨 TICKET URGENTE" : "Novo Ticket Criado"}</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Olá <strong>${adminName}</strong>,</p>
          <p>${isUrgent ? "🚨 Um ticket URGENTE foi criado e requer sua atenção imediata!" : "Um novo ticket foi criado e requer sua atenção."}</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${isUrgent ? "#ef4444" : "#3b82f6"};">
            <p style="margin: 5px 0;"><strong>Número do Ticket:</strong> ${ticketNumber}</p>
            <p style="margin: 5px 0;"><strong>Título:</strong> ${ticketTitle}</p>
            <p style="margin: 5px 0;"><strong>Usuário:</strong> ${userName}</p>
            <p style="margin: 5px 0;"><strong>Prioridade:</strong> ${priorityLabels[ticketPriority] || ticketPriority} ${isUrgent ? "🚨" : ""}</p>
          </div>
          
          ${isUrgent ? "<p style='color: #ef4444; font-weight: bold;'>⚠️ Este ticket tem SLA de 2 horas. Ação imediata necessária!</p>" : ""}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${ticketUrl}" style="background: ${isUrgent ? "#ef4444" : "#3b82f6"}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Ticket</a>
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, html };
}
