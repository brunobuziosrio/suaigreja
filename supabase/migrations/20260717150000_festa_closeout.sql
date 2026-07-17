-- Fecha o ciclo operacional da festinha: uma edição fechada não aceita novas vendas.
create or replace function public.record_festa_sale(p_stall_id uuid, p_payment_method text, p_items jsonb)
returns table(order_id uuid, order_code text, total_cents integer)
language plpgsql security definer set search_path = public as $$
declare v_event_id uuid; v_account_id uuid; v_total integer := 0; v_order_id uuid; v_code text; v_item jsonb; v_product record; v_qty integer;
begin
  if p_payment_method not in ('pix','card','cash','credit') then raise exception 'Forma de pagamento inválida'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Adicione ao menos um item'; end if;
  select s.festa_event_id, e.account_id into v_event_id, v_account_id from festa_stalls s join festa_events e on e.id=s.festa_event_id where s.id=p_stall_id and s.active and e.status='open';
  if v_event_id is null or not public.is_account_member(v_account_id, auth.uid()) then raise exception 'Caixa indisponível. Abra a edição antes de registrar vendas.'; end if;
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::integer;
    if v_qty is null or v_qty < 1 then raise exception 'Quantidade inválida'; end if;
    select id, name, price_cents, stock_quantity into v_product from festa_products where id=(v_item->>'product_id')::uuid and festa_stall_id=p_stall_id and active for update;
    if not found then raise exception 'Produto indisponível'; end if;
    if v_product.stock_quantity is not null and v_product.stock_quantity < v_qty then raise exception 'Estoque insuficiente para %', v_product.name; end if;
    v_total := v_total + v_product.price_cents * v_qty;
  end loop;
  v_code := upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
  insert into festa_orders(festa_event_id,stall_id,order_code,status,payment_method,total_cents,operator_user_id) values(v_event_id,p_stall_id,v_code,'delivered',p_payment_method,v_total,auth.uid()) returning id into v_order_id;
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::integer;
    select id, name, price_cents, stock_quantity into v_product from festa_products where id=(v_item->>'product_id')::uuid for update;
    if v_product.stock_quantity is not null then update festa_products set stock_quantity=stock_quantity-v_qty where id=v_product.id; end if;
    insert into festa_order_items(order_id,product_id,product_name,quantity,unit_price_cents,total_cents) values(v_order_id,v_product.id,v_product.name,v_qty,v_product.price_cents,v_product.price_cents*v_qty);
  end loop;
  return query select v_order_id, v_code, v_total;
end; $$;
