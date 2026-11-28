import styled from "@emotion/styled";
import {
  ArrowLeft,
  Check,
  MessageCircle,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { FC, FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { SectionContainer } from "../../App";
import { DatePicker, fromIsoDate } from "../../components/DatePicker";
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

const STEPS = [30, 60, 90, 120];

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
  const [day, setDay] = useState("");
  const [from, setFrom] = useState("10:00");
  const [to, setTo] = useState("");
  const [step, setStep] = useState(60);
  const [added, setAdded] = useState<number | null>(null);

  const times = from ? timeRange(from, to, step) : [];
  const canSubmit = !!day && times.length > 0 && !addSlots.isPending;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setAdded(null);
    addSlots.mutate(
      { day, times },
      { onSuccess: () => setAdded(times.length) },
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
        <TimeRow>
          <Field>
            <FieldLabel htmlFor="slot-from">{t("schedule_from")}</FieldLabel>
            <TimeInput
              id="slot-from"
              type="time"
              step={300}
              required
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="slot-to">
              {t("schedule_to")} <Muted>({t("optional")})</Muted>
            </FieldLabel>
            <TimeInput
              id="slot-to"
              type="time"
              step={300}
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="slot-step">{t("schedule_every")}</FieldLabel>
            <TimeInput
              as="select"
              id="slot-step"
              value={step}
              disabled={!to}
              onChange={(event) => setStep(Number(event.target.value))}
            >
              {STEPS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {t("schedule_minutes", { count: minutes })}
                </option>
              ))}
            </TimeInput>
          </Field>
        </TimeRow>
      </AddGrid>

      {times.length > 0 && (
        <Preview aria-live="polite">
          {times.map((time) => (
            <TimeChip key={time}>{time}</TimeChip>
          ))}
        </Preview>
      )}

      <AddActions>
        <PrimaryButton type="submit" disabled={!canSubmit}>
          <Plus size={18} aria-hidden />
          {t("schedule_add_button", { count: times.length })}
        </PrimaryButton>
        {!day && <Muted>{t("schedule_pick_day")}</Muted>}
        {added !== null && (
          <Success role="status">
            {t("schedule_added", { count: added })}
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

  return (
    <SectionContainer>
      <TopBar>
        <PageTitle>{t("admin_schedule")}</PageTitle>
        <GhostLink to="/">
          <ArrowLeft size={16} aria-hidden />
          {t("schedule_to_site")}
        </GhostLink>
      </TopBar>

      <Stack>
        <AddSlotsForm />

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

          {isLoading && <p>…</p>}
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
    grid-template-columns: minmax(240px, 1fr) 2fr;
    align-items: end;
  }
`;

const TimeRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-3);
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const FieldLabel = styled.label`
  font-size: var(--text-sm);
  font-weight: 700;
`;

const TimeInput = styled.input<{ theme?: ThemeType }>`
  width: 100%;
  min-height: 48px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1.5px solid ${(props) => props.theme.colors.border};
  background-color: transparent;
  color: ${(props) => props.theme.colors.text};
  font-size: 16px;
  font-variant-numeric: tabular-nums;
  color-scheme: inherit;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 4px var(--color-primary-ring);
  }

  &:disabled {
    opacity: 0.45;
  }

  option {
    color: initial;
  }
`;

const Preview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-4);
`;

const TimeChip = styled.span`
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  background: color-mix(in srgb, var(--color-primary) 14%, transparent);
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
  gap: var(--space-2);
`;
