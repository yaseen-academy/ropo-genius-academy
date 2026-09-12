-- Run this AFTER schema.sql, once, to create the founding trainer account.
-- Username: trainer Yaseen
-- Password: ro12po500  (stored hashed below, never in plain text)

insert into trainers (username, password_hash, display_name, is_owner)
values (
  'trainer Yaseen',
  '$2a$10$xn2AaCW1pq2HL2kWmJH4JeT4F.792O.zChTkn4.LNxm1qwXFKi2Ye',
  'Yaseen',
  true
)
on conflict (username) do nothing;
