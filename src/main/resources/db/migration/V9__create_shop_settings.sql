-- Single-row table holding the shop values the seller can edit at runtime.
-- Replaces the shop.bank-transfer.* and shop.shipping.flat-fee properties, which
-- could only change with a redeploy.

create table shop_settings (
    id smallint primary key,
    shop_name varchar(150) not null,
    description_vi text not null,
    description_en text not null,
    logo_url varchar(500),
    contact_email varchar(254) not null,
    contact_phone varchar(30) not null,
    bank_name varchar(100) not null,
    bank_code varchar(50) not null,
    bank_bin varchar(20) not null,
    account_number varchar(50) not null,
    account_name varchar(150) not null,
    vietqr_template varchar(20) not null,
    payment_due_hours integer not null,
    shipping_flat_fee numeric(12, 2) not null,
    free_shipping_threshold numeric(12, 2),
    shipping_note_vi text not null,
    shipping_note_en text not null,
    updated_at timestamptz not null default now(),
    constraint chk_shop_settings_single_row check (id = 1),
    constraint chk_shop_settings_vietqr_template
        check (vietqr_template in ('compact', 'compact2', 'qr_only', 'print')),
    constraint chk_shop_settings_payment_due_hours check (payment_due_hours between 1 and 168),
    constraint chk_shop_settings_shipping_flat_fee check (shipping_flat_fee >= 0),
    constraint chk_shop_settings_free_shipping_threshold check (free_shipping_threshold >= 0)
);

insert into shop_settings (
    id, shop_name, description_vi, description_en, logo_url, contact_email, contact_phone,
    bank_name, bank_code, bank_bin, account_number, account_name,
    vietqr_template, payment_due_hours,
    shipping_flat_fee, free_shipping_threshold, shipping_note_vi, shipping_note_en
)
values (
    1, 'DIY Shop',
    'Đồ thủ công làm bằng tay.', 'Handmade goods made to order.',
    null, 'lienhe@diyshop.example', '0900 000 000',
    'Vietcombank', 'vietcombank', '970436', '0123456789', 'DIY SHOP',
    'compact', 24,
    30000, null, 'Giao hàng toàn quốc trong 3-5 ngày.', 'Nationwide delivery in 3-5 days.'
);
