UPDATE subscriptions SET status = 'expired', expires_at = NOW() - INTERVAL '1 day'
WHERE payment_id = 'webhook-format-test';
