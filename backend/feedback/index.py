import os
import json
import smtplib
from email.message import EmailMessage
from email.utils import formataddr

import psycopg2

DB_URL = os.environ.get('DATABASE_URL', '')
SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')

SMTP_HOST = os.environ.get('SMTP_HOST', '')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '465'))
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')

INBOX = 'sonnik_ai@bot-flow.ru'
SMTP_USER = os.environ.get('SMTP_USER') or INBOX

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


def save_request(name: str, email: str, message: str) -> int:
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cur = conn.cursor()
    safe = (
        name.replace("'", "''"),
        email.replace("'", "''"),
        message.replace("'", "''"),
    )
    cur.execute(
        f"INSERT INTO {SCHEMA}.feedback (name, email, message) "
        f"VALUES ('{safe[0]}', '{safe[1]}', '{safe[2]}') RETURNING id"
    )
    new_id = cur.fetchone()[0]
    cur.close()
    conn.close()
    return new_id


def mark_sent(request_id: int) -> None:
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute(f'UPDATE {SCHEMA}.feedback SET mail_sent = TRUE WHERE id = {request_id}')
    cur.close()
    conn.close()


def send_mail(name: str, email: str, message: str) -> bool:
    if not SMTP_HOST or not SMTP_PASSWORD:
        print('SMTP is not configured — request saved to database only')
        return False

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

    attempts = [(SMTP_PORT, SMTP_PORT == 465)]
    attempts.append((587, False) if SMTP_PORT == 465 else (465, True))

    for port, use_ssl in attempts:
        try:
            if use_ssl:
                with smtplib.SMTP_SSL(SMTP_HOST, port, timeout=12) as smtp:
                    smtp.login(SMTP_USER, SMTP_PASSWORD)
                    smtp.send_message(letter)
            else:
                with smtplib.SMTP(SMTP_HOST, port, timeout=12) as smtp:
                    smtp.starttls()
                    smtp.login(SMTP_USER, SMTP_PASSWORD)
                    smtp.send_message(letter)
            print(f'Mail sent via {SMTP_HOST}:{port}')
            return True
        except Exception as e:
            print(f'SMTP error on {SMTP_HOST}:{port} — {type(e).__name__}: {e}')

    return False


def handler(event: dict, context) -> dict:
    """Сохраняет обращение с формы в базу и пробует отправить письмо на почту СонникАИ."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**CORS, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return reply(405, {'error': 'Метод не поддерживается'})

    body = json.loads(event.get('body') or '{}')
    name = (body.get('name') or '').strip()[:120]
    email = (body.get('email') or '').strip()[:200]
    message = (body.get('message') or '').strip()[:4000]

    if len(name) < 2:
        return reply(400, {'error': 'Укажите имя'})
    if '@' not in email or '.' not in email.split('@')[-1]:
        return reply(400, {'error': 'Проверьте адрес почты'})
    if len(message) < 10:
        return reply(400, {'error': 'Опишите вопрос подробнее'})

    request_id = save_request(name, email, message)

    if send_mail(name, email, message):
        mark_sent(request_id)

    return reply(200, {'sent': True, 'request_id': request_id})