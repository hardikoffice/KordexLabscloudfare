-- Migration: Add OTP support for user verification
ALTER TABLE users ADD COLUMN otp_code TEXT;
ALTER TABLE users ADD COLUMN otp_expires_at INTEGER; -- Unix timestamp
-- We'll also ensure is_active is 0 by default for new users in the signup logic, 
-- but for existing users we might want to keep them active if needed.
-- Since the 0001 migration already had is_active default 1, we can't easily change the default for the column 
-- without recreating the table in SQLite (D1), but we'll handle it in the application logic.
