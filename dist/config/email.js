var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import nodemailer from 'nodemailer';
import crypto from 'crypto';
// Verificar que las credenciales estén configuradas
console.log('📧 Configurando servicio de correo...');
console.log('   EMAIL_USER:', process.env.EMAIL_USER || '[NO CONFIGURADO]');
console.log('   EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'gmail (default)');
console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? '[CONFIGURADO]' : '[NO CONFIGURADO]');
// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
// Verificar conexión al iniciar
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Error configurando email:', error.message);
        console.error('   Detalle:', error);
    }
    else {
        console.log('✅ Servidor de correo listo y verificado');
    }
});
/**
 * Envía correo de solicitud de firma
 */
export function enviarCorreoFirma(destinatario, nombreReceptor, token, dispositivos, comentarios) {
    return __awaiter(this, void 0, void 0, function* () {
        const frontendUrl = process.env.FRONTEND_URL || 'https://maestros.inventarioap.com';
        const enlaceFirma = `${frontendUrl}/firmar/${token}`;
        // Crear lista de dispositivos para el correo
        const listaDispositivos = dispositivos.map(d => `<tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${d.tipo}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${d.marca} ${d.modelo}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${d.serial || 'N/A'}</td>
    </tr>`).join('');
        const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e88e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
        .button { display: inline-block; background: #1e88e5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .button:hover { background: #1565c0; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #1e88e5; color: white; padding: 10px; text-align: left; }
        .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
        .warning { background: #fff3e0; border-left: 4px solid #ff9800; padding: 10px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Acta de Entrega de Equipos</h1>
        </div>
        <div class="content">
          <p>Estimado/a <strong>${nombreReceptor}</strong>,</p>
          
          <p>Se le ha asignado los siguientes equipos. Por favor revise la información y firme el acta de entrega:</p>
          
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Equipo</th>
                <th>Serial</th>
              </tr>
            </thead>
            <tbody>
              ${listaDispositivos}
            </tbody>
          </table>
          
          ${comentarios ? `
          <div class="warning">
            <strong>📝 Observaciones:</strong><br>
            ${comentarios}
          </div>
          ` : ''}
          
          <p style="text-align: center;">
            <a href="${enlaceFirma}" class="button">✍️ Firmar Acta de Entrega</a>
          </p>
          
          <p><strong>Instrucciones:</strong></p>
          <ol>
            <li>Haga clic en el botón para revisar el acta completa</li>
            <li>Verifique que la información sea correcta</li>
            <li>Firme digitalmente usando su dedo o mouse</li>
            <li>Si hay algún error, puede devolver el acta para corrección</li>
          </ol>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong> Al firmar, usted acepta la responsabilidad sobre los equipos listados.
          </div>
        </div>
        <div class="footer">
          <p>Este es un correo automático. Por favor no responda a este mensaje.</p>
          <p>Si tiene dudas, contacte al área de sistemas.</p>
        </div>
      </div>
    </body>
    </html>
  `;
        // Generar IDs únicos para evitar que Gmail agrupe los correos en hilos
        const domain = process.env.EMAIL_SERVICE || 'gmail';
        const messageId = `<${crypto.randomUUID()}@${domain}.com>`;
        const mailOptions = {
            from: `"Sistema de Inventario" <${process.env.EMAIL_USER}>`,
            to: destinatario,
            subject: `[${crypto.randomUUID().substring(0, 8)}] 📋 Acta de Entrega de Equipos - Requiere su firma`,
            html: htmlContent,
            headers: {
                'Message-ID': messageId,
                'X-Entity-Ref-ID': crypto.randomUUID(),
                'Precedence': 'bulk',
                'Auto-Submitted': 'auto-generated',
                'X-Google-Thread-Id': crypto.randomUUID(),
            },
        };
        console.log('📨 Intentando enviar correo de firma...');
        console.log('   Destinatario:', destinatario);
        console.log('   Enlace de firma:', enlaceFirma);
        console.log('   Dispositivos:', dispositivos.length);
        try {
            const info = yield transporter.sendMail(mailOptions);
            console.log(`✅ Correo de firma enviado exitosamente a: ${destinatario}`);
            console.log(`   Message ID: ${info.messageId}`);
            return true;
        }
        catch (error) {
            console.error('❌ Error enviando correo:', error.message);
            console.error('   Stack:', error.stack);
            throw new Error(`Error enviando correo: ${error.message}`);
        }
    });
}
/**
 * Envía copia del acta firmada
 */
export function enviarActaFirmada(destinatarios, nombreReceptor, dispositivos, fechaFirma, pdfBuffer) {
    return __awaiter(this, void 0, void 0, function* () {
        const listaDispositivos = dispositivos.map(d => `<tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${d.tipo}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${d.marca} ${d.modelo}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${d.serial || 'N/A'}</td>
    </tr>`).join('');
        const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4caf50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #4caf50; color: white; padding: 10px; text-align: left; }
        .success { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 10px; margin: 15px 0; }
        .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Acta de Entrega Firmada</h1>
        </div>
        <div class="content">
          <div class="success">
            <strong>El acta ha sido firmada correctamente</strong>
          </div>
          
          <p><strong>Receptor:</strong> ${nombreReceptor}</p>
          <p><strong>Fecha de firma:</strong> ${fechaFirma.toLocaleString('es-MX')}</p>
          
          <h3>Equipos entregados:</h3>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Equipo</th>
                <th>Serial</th>
              </tr>
            </thead>
            <tbody>
              ${listaDispositivos}
            </tbody>
          </table>
          
          <p style="color: #666; font-size: 12px;">
            Este documento es una confirmación automática de la entrega de equipos.
          </p>
        </div>
        <div class="footer">
          <p>Sistema de Inventario - Notificación automática</p>
        </div>
      </div>
    </body>
    </html>
  `;
        // Generar IDs únicos para evitar que Gmail agrupe los correos en hilos
        const domain = process.env.EMAIL_SERVICE || 'gmail';
        const messageId = `<${crypto.randomUUID()}@${domain}.com>`;
        const mailOptions = {
            from: `"Sistema de Inventario" <${process.env.EMAIL_USER}>`,
            to: destinatarios.join(', '),
            subject: `[${crypto.randomUUID().substring(0, 8)}] ✅ Acta Firmada - ${nombreReceptor} - ${fechaFirma.toLocaleDateString('es-MX')}`,
            html: htmlContent,
            headers: {
                'Message-ID': messageId,
                'X-Entity-Ref-ID': crypto.randomUUID(),
                'Precedence': 'bulk',
                'Auto-Submitted': 'auto-generated',
                'X-Google-Thread-Id': crypto.randomUUID(),
            },
        };
        // Si hay PDF adjunto
        if (pdfBuffer) {
            mailOptions.attachments = [{
                    filename: `Acta_Entrega_${nombreReceptor.replace(/\s+/g, '_')}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }];
        }
        try {
            yield transporter.sendMail(mailOptions);
            console.log(`✅ Acta firmada enviada a: ${destinatarios.join(', ')}`);
            return true;
        }
        catch (error) {
            console.error('❌ Error enviando acta firmada:', error.message);
            throw new Error(`Error enviando correo: ${error.message}`);
        }
    });
}
/**
 * Envía notificación de rechazo
 */
export function enviarNotificacionRechazo(destinatario, nombreReceptor, motivo) {
    return __awaiter(this, void 0, void 0, function* () {
        const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ff9800; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
        .warning { background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 15px 0; }
        .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Acta Devuelta para Corrección</h1>
        </div>
        <div class="content">
          <p>El receptor <strong>${nombreReceptor}</strong> ha devuelto el acta de entrega para corrección.</p>
          
          <div class="warning">
            <strong>📝 Motivo:</strong><br>
            ${motivo}
          </div>
          
          <p>Por favor revise el acta, realice las correcciones necesarias y envíela nuevamente.</p>
        </div>
        <div class="footer">
          <p>Sistema de Inventario - Notificación automática</p>
        </div>
      </div>
    </body>
    </html>
  `;
        // Generar IDs únicos para evitar que Gmail agrupe los correos en hilos
        const domain = process.env.EMAIL_SERVICE || 'gmail';
        const messageId = `<${crypto.randomUUID()}@${domain}.com>`;
        const mailOptions = {
            from: `"Sistema de Inventario" <${process.env.EMAIL_USER}>`,
            to: destinatario,
            subject: `[${crypto.randomUUID().substring(0, 8)}] ⚠️ Acta Devuelta - ${nombreReceptor} solicita correcciones`,
            html: htmlContent,
            headers: {
                'Message-ID': messageId,
                'X-Entity-Ref-ID': crypto.randomUUID(),
                'Precedence': 'bulk',
                'Auto-Submitted': 'auto-generated',
                'X-Google-Thread-Id': crypto.randomUUID(),
            },
        };
        try {
            yield transporter.sendMail(mailOptions);
            console.log(`✅ Notificación de rechazo enviada a: ${destinatario}`);
            return true;
        }
        catch (error) {
            console.error('❌ Error enviando notificación de rechazo:', error.message);
            throw new Error(`Error enviando correo: ${error.message}`);
        }
    });
}
/**
 * Envía correo de solicitud de firma para devolución
 */
export function enviarCorreoDevolucion(destinatario, nombreReceptor, token, dispositivos, comentarios) {
    return __awaiter(this, void 0, void 0, function* () {
        const frontendUrl = process.env.FRONTEND_URL || 'https://maestros.inventarioap.com';
        const enlaceFirma = `${frontendUrl}/firmar-devolucion/${token}`;
        // Crear lista de dispositivos para el correo
        const listaDispositivos = dispositivos.map(d => `<tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${d.tipo}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${d.marca} ${d.modelo}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${d.serial || 'N/A'}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${d.imei || 'N/A'}</td>
    </tr>`).join('');
        const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4caf50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
        .button { display: inline-block; background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .button:hover { background: #388e3c; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #4caf50; color: white; padding: 10px; text-align: left; }
        .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
        .warning { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 10px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Devolución de Equipos</h1>
        </div>
        <div class="content">
          <p>Estimado/a <strong>${nombreReceptor}</strong>,</p>
          
          <p>Se ha registrado la siguiente devolución de equipos. Por favor revise y firme para confirmar la recepción:</p>
          
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Equipo</th>
                <th>Serial</th>
                <th>IMEI</th>
              </tr>
            </thead>
            <tbody>
              ${listaDispositivos}
            </tbody>
          </table>
          
          ${comentarios ? `
          <div class="warning">
            <strong>📝 Observaciones:</strong><br>
            ${comentarios}
          </div>
          ` : ''}
          
          <p style="text-align: center;">
            <a href="${enlaceFirma}" class="button">✍️ Firmar Acta de Devolución</a>
          </p>
          
          <p><strong>Instrucciones:</strong></p>
          <ol>
            <li>Haga clic en el botón para revisar los equipos a devolver</li>
            <li>Verifique que la información sea correcta</li>
            <li>Firme digitalmente para confirmar la devolución</li>
          </ol>
          
          <div class="warning">
            <strong>✅ Nota:</strong> Al firmar, confirma que los equipos listados han sido devueltos correctamente.
          </div>
        </div>
        <div class="footer">
          <p>Este es un correo automático. Por favor no responda a este mensaje.</p>
          <p>Si tiene dudas, contacte al área de sistemas.</p>
        </div>
      </div>
    </body>
    </html>
  `;
        // Generar IDs únicos para evitar que Gmail agrupe los correos en hilos
        const domain = process.env.EMAIL_SERVICE || 'gmail';
        const messageId = `<${crypto.randomUUID()}@${domain}.com>`;
        const mailOptions = {
            from: `"Sistema de Inventario" <${process.env.EMAIL_USER}>`,
            to: destinatario,
            subject: `[${crypto.randomUUID().substring(0, 8)}] 📦 Devolución de Equipos - Requiere su firma`,
            html: htmlContent,
            headers: {
                'Message-ID': messageId,
                'X-Entity-Ref-ID': crypto.randomUUID(),
                'Precedence': 'bulk',
                'Auto-Submitted': 'auto-generated',
                'X-Google-Thread-Id': crypto.randomUUID(),
            },
        };
        console.log('📨 Intentando enviar correo de devolución...');
        console.log('   Destinatario:', destinatario);
        console.log('   Enlace de firma:', enlaceFirma);
        console.log('   Dispositivos:', dispositivos.length);
        try {
            const info = yield transporter.sendMail(mailOptions);
            console.log(`✅ Correo de devolución enviado exitosamente a: ${destinatario}`);
            console.log(`   Message ID: ${info.messageId}`);
            return true;
        }
        catch (error) {
            console.error('❌ Error enviando correo de devolución:', error.message);
            console.error('   Stack:', error.stack);
            throw new Error(`Error enviando correo: ${error.message}`);
        }
    });
}
/**
 * Envía confirmación de devolución completada
 */
export function enviarConfirmacionDevolucion(destinatarios, nombreReceptor, dispositivos, fechaDevolucion) {
    return __awaiter(this, void 0, void 0, function* () {
        const listaDispositivos = dispositivos.map(d => `<tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${d.tipo}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${d.marca} ${d.modelo}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${d.serial || 'N/A'}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${d.estadoDevolucion}</td>
    </tr>`).join('');
        const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4caf50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #4caf50; color: white; padding: 10px; text-align: left; }
        .success { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 10px; margin: 15px 0; }
        .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Devolución Completada</h1>
        </div>
        <div class="content">
          <div class="success">
            <strong>La devolución ha sido registrada correctamente</strong>
          </div>
          
          <p><strong>Receptor:</strong> ${nombreReceptor}</p>
          <p><strong>Fecha de devolución:</strong> ${fechaDevolucion.toLocaleString('es-MX')}</p>
          
          <h3>Equipos devueltos:</h3>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Equipo</th>
                <th>Serial</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${listaDispositivos}
            </tbody>
          </table>
          
          <p style="color: #666; font-size: 12px;">
            Este documento es una confirmación automática de la devolución de equipos.
          </p>
        </div>
        <div class="footer">
          <p>Sistema de Inventario - Notificación automática</p>
        </div>
      </div>
    </body>
    </html>
  `;
        // Generar IDs únicos
        const domain = process.env.EMAIL_SERVICE || 'gmail';
        const messageId = `<${crypto.randomUUID()}@${domain}.com>`;
        const mailOptions = {
            from: `"Sistema de Inventario" <${process.env.EMAIL_USER}>`,
            to: destinatarios.join(', '),
            subject: `[${crypto.randomUUID().substring(0, 8)}] ✅ Devolución Completada - ${nombreReceptor} - ${fechaDevolucion.toLocaleDateString('es-MX')}`,
            html: htmlContent,
            headers: {
                'Message-ID': messageId,
                'X-Entity-Ref-ID': crypto.randomUUID(),
                'Precedence': 'bulk',
                'Auto-Submitted': 'auto-generated',
                'X-Google-Thread-Id': crypto.randomUUID(),
            },
        };
        try {
            yield transporter.sendMail(mailOptions);
            console.log(`✅ Confirmación de devolución enviada a: ${destinatarios.join(', ')}`);
            return true;
        }
        catch (error) {
            console.error('❌ Error enviando confirmación de devolución:', error.message);
            throw new Error(`Error enviando correo: ${error.message}`);
        }
    });
}
export default transporter;
