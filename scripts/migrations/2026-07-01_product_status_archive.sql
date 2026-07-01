alter table products
  add column if not exists status text not null default 'available';

update products
set status = case when stock < 1 then 'unavailable' else 'available' end
where status is null or status not in ('available', 'unavailable', 'archive');

alter table products
  drop constraint if exists products_status_check;

alter table products
  add constraint products_status_check
  check (status in ('available', 'unavailable', 'archive'));

create index if not exists products_status_idx on products(status);
