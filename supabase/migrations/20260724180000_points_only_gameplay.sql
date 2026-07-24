-- Gameorilla plays to a banana target, never to a fixed number of rounds.
-- The host may choose 5, 10, or 15 points; a solo leader must reach the
-- target before the room can finish.
begin;

update public.game_rooms
set
  victory_mode = 'first_to',
  rounds_to_play = null,
  target_points = case
    when target_points in (5, 10, 15) then target_points
    else 10
  end,
  win_by = 1;

alter table public.game_rooms
  alter column victory_mode set default 'first_to',
  alter column victory_mode set not null,
  alter column rounds_to_play drop not null,
  alter column rounds_to_play drop default,
  alter column target_points set default 10,
  alter column target_points set not null,
  alter column win_by set default 1,
  alter column win_by set not null;

alter table public.game_rooms
  drop constraint if exists game_rooms_check,
  drop constraint if exists game_rooms_rounds_only_check,
  drop constraint if exists game_rooms_rounds_to_play_check,
  drop constraint if exists game_rooms_target_points_check,
  drop constraint if exists game_rooms_victory_mode_check,
  drop constraint if exists game_rooms_win_by_check;

alter table public.game_rooms
  add constraint game_rooms_points_only_check
    check (victory_mode = 'first_to'),
  add constraint game_rooms_no_round_limit_check
    check (rounds_to_play is null),
  add constraint game_rooms_target_points_check
    check (target_points in (5, 10, 15)),
  add constraint game_rooms_win_by_check
    check (win_by = 1);

create or replace function public.create_game_room(
  p_code text,
  p_display_name text,
  p_session_id uuid,
  p_victory_mode text default 'first_to',
  p_rounds_to_play smallint default null,
  p_answer_end_mode text default 'timer',
  p_answer_timer_seconds smallint default 60
)
returns table(room_id uuid, player_id uuid, room_code text)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_code text;
  v_name text;
  v_room_id uuid;
  v_player_id uuid;
  v_timer_seconds smallint;
begin
  if auth.uid() is null then
    raise exception 'A guest session is required before creating a room.';
  end if;

  v_code := regexp_replace(upper(coalesce(p_code, '')), '[^A-Z0-9]', '', 'g');
  if v_code !~ '^[A-HJ-NP-Z2-9]{6}$' then
    raise exception 'Invalid room code.';
  end if;
  v_code := substr(v_code, 1, 3) || '-' || substr(v_code, 4, 3);

  v_name := btrim(coalesce(p_display_name, ''));
  if char_length(v_name) not between 1 and 24 then
    raise exception 'Player names must be 1 to 24 characters.';
  end if;

  if coalesce(p_victory_mode, 'first_to') <> 'first_to' then
    raise exception 'Gameorilla rooms play to a banana target.';
  end if;

  if p_rounds_to_play is not null then
    raise exception 'Gameorilla rooms do not have a round limit.';
  end if;

  if p_answer_end_mode not in ('timer', 'all_answered') then
    raise exception 'Invalid answer-ending mode.';
  end if;

  if p_answer_end_mode = 'timer' then
    if p_answer_timer_seconds not between 15 and 300 then
      raise exception 'Timer must be between 15 and 300 seconds.';
    end if;
    v_timer_seconds := p_answer_timer_seconds;
  else
    v_timer_seconds := null;
  end if;

  insert into public.game_rooms (
    code, victory_mode, rounds_to_play, target_points, win_by,
    answer_end_mode, answer_timer_seconds
  )
  values (v_code, 'first_to', null, 10, 1, p_answer_end_mode, v_timer_seconds)
  returning id into v_room_id;

  insert into public.room_players (
    room_id, auth_user_id, session_id, display_name, is_host
  )
  values (v_room_id, auth.uid(), p_session_id, v_name, true)
  returning id into v_player_id;

  return query select v_room_id, v_player_id, v_code;
exception
  when unique_violation then
    raise exception 'That room code is already taken. Try again.';
end;
$function$;

create or replace function public.create_game_room(
  p_code text,
  p_display_name text,
  p_session_id text,
  p_victory_mode text,
  p_rounds_to_play integer,
  p_answer_end_mode text,
  p_target_points integer,
  p_win_by integer,
  p_answer_timer_seconds integer
)
returns table(room_id uuid, player_id uuid, room_code text, room_status text)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_room_id uuid;
  v_player_id uuid;
  v_room_code text;
begin
  if coalesce(p_victory_mode, 'first_to') <> 'first_to' then
    raise exception 'Gameorilla rooms play to a banana target.';
  end if;
  if p_rounds_to_play is not null then
    raise exception 'Gameorilla rooms do not have a round limit.';
  end if;
  if coalesce(p_target_points, 10) not in (5, 10, 15) then
    raise exception 'Banana targets must be 5, 10, or 15.';
  end if;
  if coalesce(p_win_by, 1) <> 1 then
    raise exception 'A banana game ends when one player leads at the target.';
  end if;

  select created.room_id, created.player_id, created.room_code
    into v_room_id, v_player_id, v_room_code
  from public.create_game_room(
    p_code, p_display_name, p_session_id::uuid, 'first_to', null,
    p_answer_end_mode, p_answer_timer_seconds::smallint
  ) as created
  limit 1;

  update public.game_rooms
  set target_points = coalesce(p_target_points, 10), win_by = 1
  where id = v_room_id;

  room_id := v_room_id;
  player_id := v_player_id;
  room_code := v_room_code;
  room_status := 'lobby';
  return next;
end;
$function$;

create or replace function public.create_game_room(
  p_code text,
  p_display_name text,
  p_session_id text,
  p_victory_mode text,
  p_rounds_to_play integer,
  p_answer_end_mode text,
  p_target_points integer,
  p_win_by integer,
  p_answer_timer_seconds integer,
  p_is_player boolean
)
returns table(room_id uuid, player_id uuid, room_code text, room_status text)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_room_id uuid;
  v_player_id uuid;
  v_room_code text;
  v_room_status text;
begin
  select created.room_id, created.player_id, created.room_code, created.room_status
    into v_room_id, v_player_id, v_room_code, v_room_status
  from public.create_game_room(
    p_code, p_display_name, p_session_id, p_victory_mode, p_rounds_to_play,
    p_answer_end_mode, p_target_points, p_win_by, p_answer_timer_seconds
  ) as created
  limit 1;

  update public.room_players
  set
    is_player = coalesce(p_is_player, true),
    is_host = case when coalesce(p_is_player, true) then is_host else false end,
    score = case when coalesce(p_is_player, true) then score else 0 end
  where id = v_player_id;

  room_id := v_room_id;
  player_id := v_player_id;
  room_code := v_room_code;
  room_status := v_room_status;
  return next;
end;
$function$;

commit;
