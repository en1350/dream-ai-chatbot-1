INSERT INTO subscriptions (user_id, status, expires_at, price_rub, payment_id, payment_status)
SELECT 2, 'active', NOW() + INTERVAL '1095 days', 299, 'manual-grant-en1350', 'succeeded'
WHERE NOT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = 2 AND status = 'active' AND expires_at > NOW()
);

UPDATE subscriptions SET status = 'expired'
WHERE user_id = 2 AND payment_id = '31c43301-000f-5001-8000-1d1e229bed43' AND expires_at < NOW();
