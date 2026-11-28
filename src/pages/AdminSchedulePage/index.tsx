import styled from "@emotion/styled";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Check,
  MessageCircle,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { FC, FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { SectionContainer } from "../../App";
import { DatePicker, fromIsoDate } from "../../components/DatePicker";
import { TimePicker } from "../../components/TimePicker";
import {
  AdminSlot,
  BookingAction,
  BookingStatus,
  StaleBookingError,
  timeRange,
  useAddSlots,
  useAdminSlots,
  useDeleteSlot,
  useSetBookingStatus,
} from "../../hooks/useSlots";
import { ThemeType } from "../../theme/theme";
import {
  AdminOnly,
  Card,
  ErrorText,
  GhostButton,
  GhostLink,
  PageTitle,
  PrimaryButton,
  TopBar,
} from "../AdminArticlesPage/shared";
import { SkeletonRows } from "../../components/Skeleton";

const DURATIONS = [30, 60, 90, 120];
const BREAKS = [0, 10, 15, 30];
const PREFS_KEY = "schedule-session-prefs";

/** "11:15" -> 675 */
const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/** Last used duration and break, so the form opens the way Maria works */
const readPrefs = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}");
    return {
      duration: DURATIONS.includes(saved.duration) ? saved.duration : 60,
      pause: BREAKS.includes(saved.pause) ? saved.pause : 15,
    };
  } catch {
    return { duration: 60, pause: 15 };
  }
};

/** A row of round option buttons; `format` turns a value into its label */
const ChipChoice: FC<{
  label: string;
  options: number[];
  value: number;
  onChange: (value: number) => void;
  format: (value: number) => string;
}> = ({ label, options, value, onChange, format }) => (
  <StepField>
    <FieldLabel as="legend">{label}</FieldLabel>
    <StepChips>
      {options.map((option) => (
        <StepChip
          key={option}
          type="button"
          $active={value === option}
          aria-pressed={value === option}
          onClick={() => onChange(option)}
        >
          {format(option)}
        </StepChip>
      ))}
    </StepChips>
  </StepField>
);

const useDayFormat = () => {
  const [, i18n] = useTranslation();
  return useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language === "en" ? "en-GB" : "uk-UA", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    [i18n.language],
  );
};

/* ---------- adding free times ---------- */

const AddSlotsForm: FC = () => {
  const [t, i18n] = useTranslation();
  const addSlots = useAddSlots();
  const { data: slots = [] } = useAdminSlots();
  const [day, setDay] = useState("");
  const [isRange, setIsRange] = useState(false);
  const [from, setFrom] = useState("10:00");
  const [to, setTo] = useState("");
  const [duration, setDuration] = useState(() => readPrefs().duration);
  const [pause, setPause] = useState(() => readPrefs().pause);
  /** result of the last add; while set, the preview is hidden (the times
      are now in the schedule and would all read as duplicates) */
  const [added, setAdded] = useState<{
    count: number;
    skipped: number;
  } | null>(null);
  const changeFrom = (value: string) => {
    setFrom(value);
    setAdded(null);
  };
  const changeTo = (value: string) => {
    setTo(value);
    setAdded(null);
  };

  const savePrefs = (next: { duration: number; pause: number }) => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      /* private mode: just don't remember */
    }
  };
  const changeDuration = (value: number) => {
    setAdded(null);
    setDuration(value);
    savePrefs({ duration: value, pause });
  };
  const changePause = (value: number) => {
    setAdded(null);
    setPause(value);
    savePrefs({ duration, pause: value });
  };
  const step = duration + pause;

  const rangeInvalid = isRange && !!from && !!to && to <= from;
  const times = !from
    ? []
    : isRange && to && !rangeInvalid
      ? timeRange(from, to, step)
      : [from];
  const canSubmit =
    !!day &&
    times.length > 0 &&
    !rangeInvalid &&
    (!isRange || !!to) &&
    !addSlots.isPending;

  /* New times that fall inside an existing session or its break (or the
     other way round). Only a warning: Maria may still add them. */
  const block = duration + pause;
  const dayTimes = slots
    .filter((slot) => slot.day === day)
    .map((slot) => slot.time);
  const conflicts = new Map<string, string>();
  if (day) {
    for (const time of times) {
      const clash = dayTimes.find(
        (existing) =>
          existing !== time &&
          Math.abs(toMinutes(existing) - toMinutes(time)) < block,
      );
      if (clash) conflicts.set(time, clash);
    }
  }
  const duplicates = day ? times.filter((time) => dayTimes.includes(time)) : [];
  // nothing new to add when every time is already in the schedule
  const allDuplicates = times.length > 0 && duplicates.length === times.length;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit || allDuplicates) return;
    setAdded(null);
    const skipped = duplicates.length;
    addSlots.mutate(
      { day, times },
      {
        onSuccess: () => setAdded({ count: times.length - skipped, skipped }),
      },
    );
  };

  return (
    <Card as="form" onSubmit={handleSubmit}>
      <CardTitle>{t("schedule_add_title")}</CardTitle>
      <Hint>{t("schedule_add_hint")}</Hint>

      <AddGrid>
        <Field>
          <FieldLabel htmlFor="slot-day">{t("schedule_day")}</FieldLabel>
          <DatePicker
            id="slot-day"
            value={day}
            onChange={(value) => {
              setDay(value);
              setAdded(null);
            }}
            locale={i18n.language === "en" ? "en-GB" : "uk-UA"}
            clearable={false}
            labels={{
              placeholder: t("date_placeholder"),
              clear: t("date_clear"),
              today: t("date_today"),
              previousMonth: t("date_prev_month"),
              nextMonth: t("date_next_month"),
            }}
          />
        </Field>

        <Field>
          <FieldLabel as="span">{t("schedule_mode")}</FieldLabel>
          <Segmented role="group" aria-label={t("schedule_mode")}>
            {[false, true].map((range) => (
              <SegmentButton
                key={String(range)}
                type="button"
                $active={isRange === range}
                aria-pressed={isRange === range}
                onClick={() => {
                  setIsRange(range);
                  setAdded(null);
                }}
              >
                {t(range ? "schedule_mode_range" : "schedule_mode_single")}
              </SegmentButton>
            ))}
          </Segmented>
        </Field>
      </AddGrid>

      <TimeRow>
        <Field>
          <FieldLabel htmlFor="slot-from">
            {t(isRange ? "schedule_range_from" : "schedule_time")}
          </FieldLabel>
          <TimePicker id="slot-from" value={from} onChange={changeFrom} />
        </Field>
        {isRange && (
          <Field>
            <FieldLabel htmlFor="slot-to">{t("schedule_to")}</FieldLabel>
            <TimePicker
              id="slot-to"
              value={to}
              onChange={changeTo}
              invalid={rangeInvalid}
              defaultHour={Math.min(23, Number((from || "10").slice(0, 2)) + 1)}
            />
          </Field>
        )}
      </TimeRow>

      <ChipRow>
        <ChipChoice
          label={t("schedule_duration")}
          options={DURATIONS}
          value={duration}
          onChange={changeDuration}
          format={(minutes) => t("schedule_minutes", { count: minutes })}
        />
        <ChipChoice
          label={t("schedule_break")}
          options={BREAKS}
          value={pause}
          onChange={changePause}
          format={(minutes) =>
            minutes
              ? t("schedule_minutes", { count: minutes })
              : t("schedule_no_break")
          }
        />
      </ChipRow>

      {rangeInvalid && <ErrorText>{t("schedule_range_invalid")}</ErrorText>}

      {added === null &&
        day &&
        times.length > 0 &&
        !rangeInvalid &&
        (!isRange || to) && (
          <PreviewBox aria-live="polite">
            <Muted>{t("schedule_preview", { count: times.length })}</Muted>
            <Preview>
              {times.map((time) => (
                <TimeChip
                  key={time}
                  $warn={conflicts.has(time) || duplicates.includes(time)}
                >
                  {time}
                </TimeChip>
              ))}
            </Preview>
            {conflicts.size > 0 && (
              <Warning role="status">
                <AlertTriangle size={18} aria-hidden />
                <span>
                  {t("schedule_overlap", {
                    list: Array.from(conflicts)
                      .map(([time, clash]) =>
                        t("schedule_overlap_item", { time, clash }),
                      )
                      .join(", "),
                  })}
                </span>
              </Warning>
            )}
            {duplicates.length > 0 && (
              <Warning role="status">
                <AlertTriangle size={18} aria-hidden />
                <span>
                  {t("schedule_duplicate", { list: duplicates.join(", ") })}
                </span>
              </Warning>
            )}
          </PreviewBox>
        )}

      <AddActions>
        <PrimaryButton type="submit" disabled={!canSubmit || allDuplicates}>
          <Plus size={18} aria-hidden />
          {t("schedule_add_button")}
        </PrimaryButton>
        {!day ? (
          <Muted>{t("schedule_pick_day")}</Muted>
        ) : (
          isRange && !to && <Muted>{t("schedule_pick_last")}</Muted>
        )}
        {added !== null && (
          <Success role="status">
            {t("schedule_added", { count: added.count })}
            {added.skipped > 0 &&
              ` ${t("schedule_added_skipped", { count: added.skipped })}`}
          </Success>
        )}
        {addSlots.isError && <ErrorText>{t("schedule_add_error")}</ErrorText>}
      </AddActions>
    </Card>
  );
};

/* ---------- slots and bookings ---------- */

/** What happened with the client after the last status change */
type ClientNotice = {
  name: string;
  notified: boolean;
  whatsappUrl: string | null;
};

const SlotRow: FC<{
  slot: AdminSlot;
  onStatusChanged: (notice: ClientNotice) => void;
}> = ({ slot, onStatusChanged }) => {
  const [t] = useTranslation();
  const setStatus = useSetBookingStatus();
  const deleteSlot = useDeleteSlot();
  const { booking } = slot;
  const busy = setStatus.isPending || deleteSlot.isPending;

  const changeStatus = (action: BookingAction, confirmKey?: string) => {
    if (!booking) return;
    if (confirmKey && !window.confirm(t(confirmKey, { name: booking.name })))
      return;
    setStatus.mutate(
      { id: booking.id, action },
      {
        onSuccess: (result) =>
          onStatusChanged({ name: booking.name, ...result }),
      },
    );
  };

  const handleDelete = () => {
    const message = booking
      ? t("schedule_confirm_delete_booked", {
          time: slot.time,
          name: booking.name,
        })
      : t("schedule_confirm_delete", { time: slot.time });
    if (window.confirm(message)) deleteSlot.mutate(slot.id);
  };

  const status = booking?.status ?? "free";

  return (
    <Row>
      <Time>{slot.time}</Time>
      <RowMain>
        <Status $status={status}>{t(`schedule_status_${status}`)}</Status>
        {booking && (
          <BookingInfo>
            <strong>{booking.name}</strong>
            <a href={`tel:${booking.phone.replace(/[^\d+]/g, "")}`}>
              {booking.phone}
            </a>
            {booking.service && <span>{booking.service}</span>}
            {booking.email && <Muted>{booking.email}</Muted>}
            {booking.telegram && (
              <TelegramBadge title={t("schedule_telegram_hint")}>
                <Send size={12} aria-hidden />
                Telegram
              </TelegramBadge>
            )}
            {booking.note && <Note>{booking.note}</Note>}
          </BookingInfo>
        )}
        {(setStatus.isError || deleteSlot.isError) && (
          <ErrorText>
            {t(
              setStatus.error instanceof StaleBookingError
                ? "schedule_stale"
                : "schedule_action_error",
            )}
          </ErrorText>
        )}
      </RowMain>
      <Actions>
        {booking?.status === "pending" && (
          <>
            <PrimaryButton
              type="button"
              disabled={busy}
              onClick={() => changeStatus("confirm")}
            >
              <Check size={16} aria-hidden />
              {t("schedule_confirm")}
            </PrimaryButton>
            <GhostButton
              type="button"
              disabled={busy}
              onClick={() =>
                changeStatus("decline", "schedule_confirm_decline")
              }
            >
              <X size={16} aria-hidden />
              {t("schedule_decline")}
            </GhostButton>
          </>
        )}
        {booking?.status === "confirmed" && (
          <GhostButton
            type="button"
            disabled={busy}
            onClick={() => changeStatus("cancel", "schedule_confirm_cancel")}
          >
            <X size={16} aria-hidden />
            {t("schedule_cancel")}
          </GhostButton>
        )}
        <GhostButton
          type="button"
          $danger
          disabled={busy}
          onClick={handleDelete}
          aria-label={t("schedule_delete")}
          title={t("schedule_delete")}
        >
          <Trash2 size={16} aria-hidden />
        </GhostButton>
      </Actions>
    </Row>
  );
};

const Schedule: FC = () => {
  const [t] = useTranslation();
  const dayFormat = useDayFormat();
  const { data: slots = [], isLoading, isError } = useAdminSlots();
  const [notice, setNotice] = useState<ClientNotice | null>(null);

  const days = useMemo(() => {
    const byDay = new Map<string, AdminSlot[]>();
    slots.forEach((slot) => {
      byDay.set(slot.day, [...(byDay.get(slot.day) ?? []), slot]);
    });
    return Array.from(byDay.entries());
  }, [slots]);

  const pending = slots.filter((s) => s.booking?.status === "pending").length;

  // Opens on the form; ?tab=list shows the bookings (kept in the URL so the
  // back button and shared links land on the same tab)
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "list" ? "list" : "add";
  const showTab = (next: "add" | "list") =>
    setParams(next === "list" ? { tab: "list" } : {}, { replace: true });

  return (
    <SectionContainer>
      <TopBar>
        <PageTitle>{t("admin_schedule")}</PageTitle>
        <GhostLink to="/">
          <ArrowLeft size={16} aria-hidden />
          {t("schedule_to_site")}
        </GhostLink>
      </TopBar>

      <Tabs role="tablist" aria-label={t("admin_schedule")}>
        <Tab
          type="button"
          role="tab"
          aria-selected={tab === "add"}
          $active={tab === "add"}
          onClick={() => showTab("add")}
        >
          <Plus size={18} aria-hidden />
          {t("schedule_tab_add")}
        </Tab>
        <Tab
          type="button"
          role="tab"
          aria-selected={tab === "list"}
          $active={tab === "list"}
          onClick={() => showTab("list")}
        >
          <CalendarDays size={18} aria-hidden />
          {t("schedule_tab_list")}
          {pending > 0 && <TabCount>{pending}</TabCount>}
        </Tab>
      </Tabs>

      <Stack>
        {tab === "add" && <AddSlotsForm />}

        {tab === "list" && (
          <Card>
            <CardHeader>
              <CardTitle>{t("schedule_list_title")}</CardTitle>
              {pending > 0 && (
                <PendingBadge>
                  {t("schedule_pending_count", { count: pending })}
                </PendingBadge>
              )}
            </CardHeader>

            {notice && (
              <Notice role="status">
                <p>
                  {notice.notified
                    ? t("schedule_client_notified", { name: notice.name })
                    : t("schedule_client_not_notified", { name: notice.name })}
                </p>
                <NoticeActions>
                  {notice.whatsappUrl && (
                    <WhatsAppLink
                      href={notice.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={16} aria-hidden />
                      {t("schedule_whatsapp")}
                    </WhatsAppLink>
                  )}
                  <GhostButton type="button" onClick={() => setNotice(null)}>
                    {t("schedule_notice_close")}
                  </GhostButton>
                </NoticeActions>
              </Notice>
            )}

            {isLoading && <SkeletonRows count={5} actions={1} />}
            {isError && <ErrorText>{t("schedule_load_error")}</ErrorText>}
            {!isLoading && !isError && slots.length === 0 && (
              <p>{t("schedule_empty")}</p>
            )}

            {days.map(([day, daySlots]) => {
              const date = fromIsoDate(day);
              return (
                <DayGroup key={day}>
                  <DayTitle>{date ? dayFormat.format(date) : day}</DayTitle>
                  <Rows>
                    {daySlots.map((slot) => (
                      <SlotRow
                        key={slot.id}
                        slot={slot}
                        onStatusChanged={setNotice}
                      />
                    ))}
                  </Rows>
                </DayGroup>
              );
            })}
          </Card>
        )}
      </Stack>
    </SectionContainer>
  );
};

const AdminSchedulePage = () => (
  <AdminOnly>
    <Schedule />
  </AdminOnly>
);

export default AdminSchedulePage;

/* ---------- styles ---------- */

const Tabs = styled.div<{ theme?: ThemeType }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  max-width: 480px;
  margin-bottom: var(--space-5);
  padding: 4px;
  border-radius: var(--radius-full);
  border: 1.5px solid ${(props) => props.theme.colors.border};
`;

const Tab = styled.button<{ $active: boolean; theme?: ThemeType }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 44px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 700;
  color: ${(props) => (props.$active ? "#fff" : props.theme.colors.text)};
  background-color: ${(props) =>
    props.$active ? "var(--color-primary)" : "transparent"};
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
`;

const TabCount = styled.span`
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: var(--radius-full);
  display: inline-grid;
  place-items: center;
  font-size: 12px;
  font-weight: 800;
  color: #fff;
  background: #e0a100;
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
`;

const CardHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
`;

const CardTitle = styled.h2`
  font-size: var(--text-xl);
  font-weight: 800;
`;

const Hint = styled.p`
  margin: var(--space-2) 0 var(--space-4);
  font-size: var(--text-sm);
  opacity: 0.75;
  line-height: 1.5;
`;

const AddGrid = styled.div`
  display: grid;
  gap: var(--space-4);

  @media screen and (min-width: 800px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: end;
  }
`;

const TimeRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-4);

  @media screen and (min-width: 800px) {
    max-width: calc(50% - var(--space-2));
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const StepField = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  margin: var(--space-4) 0 0;
  padding: 0;
  border: 0;
`;

const FieldLabel = styled.label`
  padding: 0;
  margin-bottom: 0;
  font-size: var(--text-sm);
  font-weight: 700;
`;

const Segmented = styled.div<{ theme?: ThemeType }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  min-height: 48px;
  padding: 4px;
  border-radius: var(--radius-md);
  border: 1.5px solid ${(props) => props.theme.colors.border};
`;

const SegmentButton = styled.button<{ $active: boolean; theme?: ThemeType }>`
  padding: 0 var(--space-2);
  border-radius: calc(var(--radius-md) - 4px);
  font-size: var(--text-sm);
  font-weight: 700;
  color: ${(props) => (props.$active ? "#fff" : props.theme.colors.text)};
  background-color: ${(props) =>
    props.$active ? "var(--color-primary)" : "transparent"};
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
`;

const StepChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
`;

const StepChip = styled.button<{ $active: boolean; theme?: ThemeType }>`
  min-height: 40px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  border: 1.5px solid
    ${(props) =>
      props.$active ? "var(--color-primary)" : props.theme.colors.border};
  color: ${(props) =>
    props.$active ? "var(--color-primary)" : props.theme.colors.text};
  background-color: ${(props) =>
    props.$active
      ? "color-mix(in srgb, var(--color-primary) 12%, transparent)"
      : "transparent"};
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
`;

const PreviewBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-5);
`;

const Preview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
`;

const TimeChip = styled.span<{ $warn?: boolean }>`
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  background: color-mix(
    in srgb,
    ${(p) => (p.$warn ? "#e0a100" : "var(--color-primary)")} 18%,
    transparent
  );
  box-shadow: ${(p) => (p.$warn ? "inset 0 0 0 1.5px #e0a100" : "none")};
`;

const Warning = styled.p`
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  line-height: 1.45;
  background: color-mix(in srgb, #e0a100 14%, transparent);

  svg {
    flex-shrink: 0;
    margin-top: 1px;
    color: #e0a100;
  }
`;

const ChipRow = styled.div`
  display: grid;
  gap: 0 var(--space-5);

  @media screen and (min-width: 800px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const AddActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-5);
`;

const Muted = styled.span`
  font-size: var(--text-sm);
  font-weight: 400;
  opacity: 0.7;
`;

const Success = styled.p`
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-primary);
`;

const PendingBadge = styled.span`
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 700;
  color: #fff;
  background: var(--color-primary);
`;

const DayGroup = styled.section`
  & + & {
    margin-top: var(--space-5);
  }
`;

const DayTitle = styled.h3`
  font-size: var(--text-base);
  font-weight: 800;
  margin-bottom: var(--space-2);

  &::first-letter {
    text-transform: uppercase;
  }
`;

const Rows = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
`;

const Row = styled.li<{ theme?: ThemeType }>`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-top: 1px solid ${(props) => props.theme.colors.border};
`;

const Time = styled.span`
  min-width: 56px;
  padding-top: 2px;
  font-size: var(--text-lg);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
`;

const RowMain = styled.div`
  flex: 1 1 220px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

const STATUS_TONE: Record<BookingStatus | "free", string> = {
  free: "color-mix(in srgb, currentColor 10%, transparent)",
  pending: "color-mix(in srgb, #e0a100 28%, transparent)",
  confirmed: "color-mix(in srgb, var(--color-primary) 22%, transparent)",
  declined: "transparent",
};

const Status = styled.span<{ $status: BookingStatus | "free" }>`
  align-self: flex-start;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 700;
  background: ${(props) => STATUS_TONE[props.$status]};
`;

const BookingInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-3);
  overflow-wrap: anywhere;

  a {
    color: var(--color-primary);
    font-weight: 600;
  }
`;

const Note = styled.p`
  flex-basis: 100%;
  font-size: var(--text-sm);
  line-height: 1.5;
  opacity: 0.85;
  white-space: pre-line;
`;

const TelegramBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
  color: #fff;
  background: #229ed9;
`;

const Notice = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-primary) 35%, transparent);

  p {
    flex: 1 1 240px;
    font-weight: 600;
    line-height: 1.45;
  }
`;

const NoticeActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
`;

const WhatsAppLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 10px 18px;
  border-radius: var(--radius-full);
  background-color: #25d366;
  color: #0b3d1f;
  font-size: var(--text-sm);
  font-weight: 700;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-left: auto;
`;
