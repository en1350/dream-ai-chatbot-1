import os
import json
import smtplib
from email.message import EmailMessage
from email.utils import formataddr

SMTP_HOST = os.environ.get('SMTP_HOST', '')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '465'))
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')

INBOX = 'sonnik_ai@bot-flow.ru'

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def reply(status: int, payload: dict) -> dict:
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps(payload, ensure_ascii=False),
        'isBase64Encoded': False,
    }


def handler(event: dict, context) -> dict:
    """Принимает форму обратной связи и отправляет письмо на почту СонникАИ."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**CORS, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return reply(405, {'error': 'Метод не поддерживается'})

    body = json.loads(event.get('body') or '{}')
    name = (body.get('name') or '').strip()
    email = (body.get('email') or '').strip()
    message = (body.get('message') or '').strip()

    if len(name) < 2:
        return reply(400, {'error': 'Укажите имя'})
    if '@' not in email or '.' not in email.split('@')[-1]:
        return reply(400, {'error': 'Проверьте адрес почты'})
    if len(message) < 10:
        return reply(400, {'error': 'Опишите вопрос подробнее'})

    if not SMTP_HOST or not SMTP_USER or not SMTP_PASSWORD:
        print('SMTP credentials are not configured')
        return reply(503, {'error': 'Отправка писем временно недоступна'})

    letter = EmailMessage()
    letter['Subject'] = f'СонникАИ · сообщение от {name}'
    letter['From'] = formataddr(('СонникАИ', SMTP_USER))
    letter['To'] = INBOX
    letter['Reply-To'] = formataddr((name, email))
    letter.set_content(
        f'Новое сообщение с сайта СонникАИ\n\n'
        f'Имя: {name}\n'
        f'Почта: {email}\n\n'
        f'Сообщение:\n{message}\n'
    )

    try:
        if SMTP_PORT == 465:
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=20) as smtp:
                smtp.login(SMTP_USER, SMTP_PASSWORD)
                smtp.send_message(letter)
        else:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as smtp:
                smtp.starttls()
                smtp.login(SMTP_USER, SMTP_PASSWORD)
                smtp.send_message(letter)
    except smtplib.SMTPAuthenticationError:
        print('SMTP auth failed')
        return reply(502, {'error': 'Не удалось отправить письмо'})
    except Exception as e:
        print(f'SMTP error: {e}')
        return reply(502, {'error': 'Не удалось отправить письмо'})

    return reply(200, {'sent': True})
