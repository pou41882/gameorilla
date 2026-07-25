create or replace function public.start_first_round(p_room_code text)
returns table(
  room_id uuid,
  room_code text,
  round_id uuid,
  round_number integer,
  prompt_text text,
  phase text,
  writing_ends_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_code text;
  v_room record;
  v_prompt record;
  v_round_id uuid;
  v_writing_ends_at timestamptz;
  v_player_count integer;
begin
  if auth.uid() is null then
    raise exception 'A guest session is required before starting a game.';
  end if;

  v_code := regexp_replace(
    upper(coalesce(p_room_code, '')),
    '[^A-Z0-9]',
    '',
    'g'
  );

  if v_code !~ '^[A-HJ-NP-Z2-9]{6}$' then
    raise exception 'Invalid room code.';
  end if;

  v_code := substr(v_code, 1, 3) || '-' || substr(v_code, 4, 3);

  select
    gr.id,
    gr.code,
    gr.status,
    gr.current_round_number,
    gr.game_slug,
    gr.answer_end_mode,
    gr.answer_timer_seconds
  into v_room
  from public.game_rooms gr
  join public.room_players rp
    on rp.room_id = gr.id
  where gr.code = v_code
    and rp.auth_user_id = auth.uid()
    and rp.is_host = true
    and rp.is_active = true
    and rp.is_player = true
  for update of gr;

  if not found then
    raise exception 'Only the host can start this room.';
  end if;

  if v_room.status <> 'lobby' or v_room.current_round_number <> 0 then
    raise exception 'This game has already started.';
  end if;

  select count(*)::integer
  into v_player_count
  from public.room_players rp
  where rp.room_id = v_room.id
    and rp.is_active = true
    and rp.is_player = true;

  if v_player_count < 3 then
    raise exception 'At least three players are required to start.';
  end if;

  select gp.id, gp.prompt_text
  into v_prompt
  from public.game_prompts gp
  where gp.game_slug = v_room.game_slug
    and gp.is_active = true
  order by random()
  limit 1;

  if not found then
    raise exception 'There are no active prompts for this game.';
  end if;

  if v_room.answer_end_mode = 'timer' then
    v_writing_ends_at :=
      now() + make_interval(secs => v_room.answer_timer_seconds);
  else
    v_writing_ends_at := null;
  end if;

  insert into public.game_rounds (
    room_id,
    round_number,
    prompt_id,
    prompt_text,
    phase,
    writing_started_at,
    writing_ends_at
  )
  values (
    v_room.id,
    1,
    v_prompt.id,
    v_prompt.prompt_text,
    'writing',
    now(),
    v_writing_ends_at
  )
  returning id into v_round_id;

  update public.game_rooms
  set
    status = 'writing',
    current_round_number = 1
  where id = v_room.id;

  return query
  select
    v_room.id,
    v_room.code,
    v_round_id,
    1,
    v_prompt.prompt_text,
    'writing'::text,
    v_writing_ends_at;
end;
$function$;
