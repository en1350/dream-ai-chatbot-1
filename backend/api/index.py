import os
import json
import uuid
import base64
import hashlib
import secrets
import urllib.request
import urllib.error
from datetime import datetime, timedelta

import psycopg2

DB_URL = os.environ.get('DATABASE_URL', '')
SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')
SHOP_ID = os.environ.get('YOOKASSA_SHOP_ID', '')
YK_SECRET = os.environ.get('YOOKASSA_SECRET_KEY', '')
AI_KEY = os.environ.get('AITUNNEL_API_KEY', '')

FREE_DREAMS = 3
PRICE = '299.00'
ACCESS_DAYS = 1095
SITE_URL = os.environ.get('SITE_URL', 'https://preview--dream-ai-chatbot-1.poehali.dev')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

SYSTEM_PROMPT = """Ты — СонникАИ, мудрый толкователь снов. Ты глубокий психолог, знаток символики и эзотерики.

Разбирай сон человека по пяти источникам:
1. Сонник Миллера — практическое значение образов для жизни, работы, отношений
2. Сонник Ванги — народная мудрость, судьба, энергия, связь с родом
3. Аналитическая психология Юнга — архетипы, Тень, Анима/Анимус, коллективное бессознательное
4. Психоанализ Фрейда — вытесненные желания, символика подсознания
5. Лунная символика — как фаза луны окрашивает этот сон

Структура ответа (строго соблюдай, жирный текст через **):

🔮 **Главные символы**
[перечисли 2-4 ключевых образа сна через запятую]

📖 **Сонник Миллера**
[2 предложения — практическое значение]

🌿 **Сонник Ванги**
[2 предложения — народное толкование, судьба]

✨ **Взгляд Юнга**
[2 предложения — архетипы и внутренние процессы]

🌑 **Взгляд Фрейда**
[2 предложения — подсознание и вытесненное]

💫 **Что это значит для вас**
[2-3 предложения — итог простыми словами и конкретный совет]

Правила: пиши по-русски, тепло и уважительно, без запугивания. Даже тревожный сон объясняй как подсказку, а не приговор. Не повторяй одни и те же формулировки. Если текст сна очень короткий — всё равно дай осмысленный разбор."""


def call_ai(dream: str, moon_phase: str = '', card: str = '') -> str:
    context_parts = []
    if moon_phase:
        context_parts.append(f'Фаза луны сегодня: {moon_phase}.')
    if card:
        context_parts.append(f'Карта дня, выпавшая человеку: {card}.')
    context = ' '.join(context_parts)

    user_content = f'Мой сон: {dream}'
    if context:
        user_content += f'\n\n(Контекст для толкования: {context})'

    payload = json.dumps({
        'model': 'gpt-4o-mini',
        'messages': [
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {'role': 'user', 'content': user_content},
        ],
        'max_tokens': 1100,
        'temperature': 0.85,
    }).encode()

    req = urllib.request.Request(
        'https://api.aitunnel.ru/v1/chat/completions',
        data=payload,
        headers={
            'Authorization': f'Bearer {AI_KEY}',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; SonnikAIBot/1.0)',
        },
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=40) as resp:
        result = json.loads(resp.read().decode())
    return result['choices'][0]['message']['content']


def get_conn():
    conn = psycopg2.connect(DB_URL, options=f'-c search_path={SCHEMA}')
    conn.autocommit = True
    return conn


def hash_pw(pw: str) -> str:
    return hashlib.sha256(f'morpheus_salt_2026{pw}'.encode()).hexdigest()


def make_token(uid: int, email: str) -> str:
    return hashlib.sha256(f'{uid}:{email}:{secrets.token_hex(16)}'.encode()).hexdigest()


def ok(payload: dict) -> dict:
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(payload, ensure_ascii=False)}


def fail(code: int, message: str) -> dict:
    return {'statusCode': code, 'headers': CORS, 'body': json.dumps({'error': message}, ensure_ascii=False)}


def read_access(cur, user_id: int) -> dict:
    cur.execute('SELECT free_requests_used FROM users WHERE id = %s', (user_id,))
    row = cur.fetchone()
    used = row[0] if row else 0
    cur.execute(
        "SELECT expires_at FROM subscriptions WHERE user_id=%s AND status='active' "
        "AND expires_at>NOW() ORDER BY expires_at DESC LIMIT 1",
        (user_id,),
    )
    sub = cur.fetchone()
    return {
        'free_used': used,
        'free_left': max(0, FREE_DREAMS - used),
        'has_access': sub is not None,
        'access_until': sub[0].isoformat() if sub else None,
    }


def handle_auth(body: dict) -> dict:
    """Регистрация и вход сновидца по почте и паролю."""
    action = body.get('action')
    email = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''

    if not email or '@' not in email:
        return fail(400, 'Укажите корректный адрес почты')
    if len(password) < 6:
        return fail(400, 'Пароль — минимум 6 символов')

    pw_hash = hash_pw(password)
    conn = get_conn()
    cur = conn.cursor()

    if action == 'register':
        cur.execute('SELECT id FROM users WHERE email = %s', (email,))
        if cur.fetchone():
            cur.close()
            conn.close()
            return fail(409, 'Эта почта уже зарегистрирована — войдите')
        cur.execute(
            'INSERT INTO users (email, password_hash) VALUES (%s, %s) RETURNING id',
            (email, pw_hash),
        )
        user_id = cur.fetchone()[0]
    else:
        cur.execute('SELECT id, password_hash FROM users WHERE email = %s', (email,))
        row = cur.fetchone()
        if not row or row[1] != pw_hash:
            cur.close()
            conn.close()
            return fail(401, 'Неверная почта или пароль')
        user_id = row[0]

    access = read_access(cur, user_id)
    cur.close()
    conn.close()

    return ok({
        'token': make_token(user_id, email),
        'user_id': user_id,
        'email': email,
        **access,
    })


def handle_spend(body: dict) -> dict:
    """Списывает один бесплатный сон, если нет полного доступа."""
    user_id = body.get('user_id')
    if not user_id:
        return fail(400, 'Требуется вход в кабинет')

    conn = get_conn()
    cur = conn.cursor()
    access = read_access(cur, int(user_id))

    if access['has_access']:
        cur.close()
        conn.close()
        return ok({'allowed': True, **access})

    if access['free_left'] <= 0:
        cur.close()
        conn.close()
        return ok({'allowed': False, **access})

    cur.execute('UPDATE users SET free_requests_used = free_requests_used + 1 WHERE id = %s', (user_id,))
    access = read_access(cur, int(user_id))
    cur.close()
    conn.close()
    return ok({'allowed': True, **access})


def handle_status(body: dict) -> dict:
    """Актуальный статус доступа и счётчик снов."""
    user_id = body.get('user_id')
    if not user_id:
        return fail(400, 'Требуется вход в кабинет')
    conn = get_conn()
    cur = conn.cursor()
    access = read_access(cur, int(user_id))
    cur.close()
    conn.close()
    return ok(access)


def handle_interpret(body: dict) -> dict:
    """Толкует сон через ИИ. Для гостей лимит считает фронтенд, для своих — база."""
    dream = (body.get('dream') or '').strip()
    user_id = body.get('user_id')
    moon_phase = body.get('moon_phase') or ''
    card = body.get('card') or ''

    if len(dream) < 10:
        return fail(400, 'Опишите сон чуть подробнее')
    if not AI_KEY:
        return fail(503, 'Толкователь временно недоступен')

    access = None
    if user_id:
        conn = get_conn()
        cur = conn.cursor()
        access = read_access(cur, int(user_id))
        if not access['has_access'] and access['free_left'] <= 0:
            cur.close()
            conn.close()
            return ok({'allowed': False, **access})
        if not access['has_access']:
            cur.execute(
                'UPDATE users SET free_requests_used = free_requests_used + 1 WHERE id = %s',
                (user_id,),
            )
            access = read_access(cur, int(user_id))
        cur.close()
        conn.close()

    try:
        answer = call_ai(dream, moon_phase, card)
    except urllib.error.HTTPError as e:
        print(f'AI error {e.code}: {e.read().decode() if e.fp else ""}')
        return fail(502, 'Толкователь не отвечает, попробуйте ещё раз')
    except Exception as e:
        print(f'AI failure: {e}')
        return fail(502, 'Толкователь не отвечает, попробуйте ещё раз')

    payload = {'allowed': True, 'answer': answer}
    if access:
        payload.update(access)
    return ok(payload)


def handle_create_payment(body: dict) -> dict:
    """Создаёт платёж в ЮКассе на 299 рублей за доступ на 3 года."""
    user_id = body.get('user_id')
    email = (body.get('email') or '').strip().lower()
    return_url = (body.get('return_url') or '').strip()
    if not user_id:
        return fail(400, 'Требуется вход в кабинет')
    if not SHOP_ID or not YK_SECRET:
        return fail(503, 'Оплата пока не настроена')

    if not return_url.startswith('https://'):
        return_url = SITE_URL
    return_url = return_url.split('?')[0].rstrip('/')

    pdata = {
        'amount': {'value': PRICE, 'currency': 'RUB'},
        'confirmation': {'type': 'redirect', 'return_url': f'{return_url}/?paid=1'},
        'capture': True,
        'description': 'СонникАИ — полный доступ на 3 года',
        'metadata': {'user_id': str(user_id)},
    }
    if email:
        pdata['receipt'] = {
            'customer': {'email': email},
            'items': [{
                'description': 'СонникАИ — полный доступ на 3 года',
                'quantity': '1.00',
                'amount': {'value': PRICE, 'currency': 'RUB'},
                'vat_code': 1,
                'payment_mode': 'full_payment',
                'payment_subject': 'service',
            }],
        }

    creds = base64.b64encode(f'{SHOP_ID}:{YK_SECRET}'.encode()).decode()
    req = urllib.request.Request(
        'https://api.yookassa.ru/v3/payments',
        data=json.dumps(pdata).encode(),
        headers={
            'Authorization': f'Basic {creds}',
            'Content-Type': 'application/json',
            'Idempotence-Key': str(uuid.uuid4()),
        },
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        print(f'YK error {e.code}: {e.read().decode() if e.fp else ""}')
        return fail(502, 'Не удалось создать платёж')

    payment_id = result['id']
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        'INSERT INTO payments (user_id, yookassa_payment_id, amount, status) VALUES (%s,%s,%s,%s)',
        (user_id, payment_id, int(float(PRICE)), 'pending'),
    )
    cur.close()
    conn.close()

    return ok({
        'payment_id': payment_id,
        'confirmation_url': result['confirmation']['confirmation_url'],
    })


def activate(cur, user_id: int, payment_id: str) -> str:
    cur.execute(
        "SELECT expires_at FROM subscriptions WHERE user_id=%s AND status='active' "
        "AND expires_at>NOW() LIMIT 1",
        (user_id,),
    )
    existing = cur.fetchone()
    if existing:
        return existing[0].isoformat()
    expires_at = datetime.now() + timedelta(days=ACCESS_DAYS)
    cur.execute(
        'INSERT INTO subscriptions (user_id, status, expires_at, price_rub, payment_id, payment_status) '
        'VALUES (%s,%s,%s,%s,%s,%s)',
        (user_id, 'active', expires_at, int(float(PRICE)), payment_id, 'succeeded'),
    )
    print(f'Access granted user_id={user_id} until={expires_at}')
    return expires_at.isoformat()


def handle_check_payment(body: dict) -> dict:
    """Проверяет платежи пользователя в ЮКассе и открывает доступ."""
    user_id = body.get('user_id')
    if not user_id:
        return fail(400, 'Требуется вход в кабинет')

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT yookassa_payment_id FROM payments WHERE user_id=%s AND status='pending' "
        "ORDER BY created_at DESC LIMIT 5",
        (user_id,),
    )
    rows = cur.fetchall()
    creds = base64.b64encode(f'{SHOP_ID}:{YK_SECRET}'.encode()).decode()
    paid = False

    for (payment_id,) in rows:
        req = urllib.request.Request(
            f'https://api.yookassa.ru/v3/payments/{payment_id}',
            headers={'Authorization': f'Basic {creds}', 'Content-Type': 'application/json'},
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                result = json.loads(resp.read().decode())
        except urllib.error.HTTPError:
            continue

        status = result.get('status')
        cancel = result.get('cancellation_details') or {}
        print(
            f'YK check {payment_id}: status={status} '
            f'paid={result.get("paid")} reason={cancel.get("reason")} party={cancel.get("party")}'
        )
        if status and status != 'pending':
            cur.execute(
                'UPDATE payments SET status=%s, paid_at=NOW() WHERE yookassa_payment_id=%s',
                (status, payment_id),
            )
        if status == 'succeeded':
            activate(cur, int(user_id), payment_id)
            paid = True
            break

    access = read_access(cur, int(user_id))
    cur.close()
    conn.close()
    return ok({'paid': paid, **access})


def handle_webhook(body: dict) -> dict:
    """Вебхук ЮКассы — открывает доступ сразу после оплаты."""
    if body.get('event') != 'payment.succeeded':
        return ok({'ok': True})

    obj = body.get('object', {})
    payment_id = obj.get('id')
    user_id = obj.get('metadata', {}).get('user_id')
    if not payment_id or not user_id:
        return ok({'ok': True})

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        'UPDATE payments SET status=%s, paid_at=NOW() WHERE yookassa_payment_id=%s',
        ('succeeded', payment_id),
    )
    activate(cur, int(user_id), payment_id)
    cur.close()
    conn.close()
    return ok({'ok': True})


def handler(event: dict, context) -> dict:
    """СонникАИ: регистрация по почте, счётчик бесплатных снов и оплата доступа через ЮКассу."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action', '')

    if action in ('register', 'login'):
        return handle_auth(body)
    if action == 'interpret':
        return handle_interpret(body)
    if action == 'spend':
        return handle_spend(body)
    if action == 'status':
        return handle_status(body)
    if action == 'create_payment':
        return handle_create_payment(body)
    if action == 'check_payment':
        return handle_check_payment(body)
    if action == 'webhook':
        return handle_webhook(body)

    return fail(400, 'Неизвестное действие')