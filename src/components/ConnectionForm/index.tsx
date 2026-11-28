import { FC, forwardRef, useEffect, useMemo, useRef, useState } from "react";

import styled from "@emotion/styled";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, CheckCircle2, LogIn, Plus, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import {
  ErrorMessage,
  Field,
  Form,
  Formik,
  FormikErrors,
  FormikHelpers,
  FormikProps,
  useFormikContext,
} from "formik";

import priceData from "../../json/price.json";
import priceDataEn from "../../json/priceEn.json";

import { cardTitle } from "../../theme/surfaces";
import { ThemeType } from "../../theme/theme";

import { useBooking } from "../../context/BookingContext";
import { useModal } from "../../context/ModalContext";
import { useAuthLinkState } from "../../hooks/useAuthReturn";
import {
  useProfile,
  useRecheckVerification,
  useResendConfirmation,
} from "../../hooks/useAuth";
import {
  AuthRequiredError,
  EmailNotVerifiedError,
  SlotUnavailableError,
  useCreateBooking,
} from "../../hooks/useCreateBooking";
import { FreeSlot, useFreeSlots } from "../../hooks/useSlots";

import {
  NoticeActions,
  NoticeBox,
  NoticeButton,
  NoticeLink,
  NoticeText,
  NoticeTextButton,
} from "../AuthNotice";
import { DatePicker } from "../DatePicker";

import { ConnectionFormPropsType } from "./types";

type PriceItem = {
  service: string;
  price: string;
  time?: string;
  description?: string;
};

type FormValues = {
  name: string;
  tel: string;
  text: string;
  service: string;
  subService: string;
  date: string;
  time: string;
  /** a free slot's id, when the admin has published free times */
  slotId: string;
};

const CATEGORIES = ["women", "men", "children", "body", "else"] as const;
const TIME_SLOTS = ["time_morning", "time_day", "time_evening", "time_any"];

const initialValues: FormValues = {
  name: "",
  tel: "",
  text: "",
  service: "",
  subService: "",
  date: "",
  time: "",
  slotId: "",
};

/**
 * The unsent form survives a trip to sign in (same tab, the confirmation
 * link's new tab, or the Google redirect). Cleared once the booking is sent.
 */
const DRAFT_KEY = "booking_draft";
const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const loadDraft = (): FormValues => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return initialValues;
    const { values, savedAt } = JSON.parse(raw);
    if (
      typeof savedAt !== "number" ||
      Date.now() - savedAt > DRAFT_MAX_AGE_MS
    ) {
      localStorage.removeItem(DRAFT_KEY);
      return initialValues;
    }
    // keep only known string fields, whatever is stored
    const draft = { ...initialValues };
    (Object.keys(initialValues) as (keyof FormValues)[]).forEach((key) => {
      if (typeof values?.[key] === "string") draft[key] = values[key];
    });
    return draft;
  } catch {
    return initialValues;
  }
};

const saveDraft = (values: FormValues) => {
  try {
    const isEmpty = (Object.keys(values) as (keyof FormValues)[]).every(
      (key) => values[key] === initialValues[key],
    );
    if (isEmpty) localStorage.removeItem(DRAFT_KEY);
    else
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ values, savedAt: Date.now() }),
      );
  } catch {
    // storage blocked (private mode): the form just is not restored
  }
};

/** Labels in the translations end with ":"; drop it so every label in the form looks the same */
const label = (text: string) => text.replace(/:\s*$/, "");

export const ConnectionForm: FC<ConnectionFormPropsType> = ({
  onClose,
  language,
}) => {
  const [t] = useTranslation();
  const { data: user, isLoading: isProfileLoading } = useProfile();
  const { mutate, isPending, isError, error } = useCreateBooking();
  const { preset } = useBooking();
  const { openModal } = useModal();
  // Booking needs an account with a confirmed email (booking-telegram checks
  // the same on the server); until then the form shows a notice above it
  const needsAccount = !isProfileLoading && !user?.isVerified;
  const noticeRef = useRef<HTMLDivElement>(null);
  // read once: Formik only uses initialValues on mount
  const [draft] = useState(loadDraft);
  // a restored draft already holds the visitor's latest choice: the preset
  // they clicked before going to sign in must not overwrite it
  const skipPresetNonce = useRef(
    draft !== initialValues ? preset?.nonce : undefined,
  );
  const { data: freeSlots = [] } = useFreeSlots();
  // Without published times (or if they fail to load) the form asks for a
  // preferred date and part of the day, as before
  const slotMode = freeSlots.length > 0;
  const slotDays = useMemo(
    () => new Set(freeSlots.map((slot) => slot.day)),
    [freeSlots],
  );

  const [isSuccess, setIsSuccess] = useState(false);
  const [successWithSlot, setSuccessWithSlot] = useState(false);
  /** bot link to get the confirmation in Telegram, after booking a slot */
  const [telegramLink, setTelegramLink] = useState<string | null>(null);
  const [showComment, setShowComment] = useState(false);
  const submitRef = useRef<HTMLButtonElement>(null);
  const formikRef = useRef<FormikProps<FormValues>>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const data = (language === "ua" ? priceData : priceDataEn) as Record<
    string,
    PriceItem[]
  >;

  // Preselect a service when the visitor clicks "Book" on a price card
  useEffect(() => {
    if (!preset || !formikRef.current) return;
    if (preset.nonce === skipPresetNonce.current) return;
    formikRef.current.setValues(
      {
        ...formikRef.current.values,
        service: preset.category,
        subService: preset.service ?? "",
      },
      false,
    );
    const timer = window.setTimeout(
      () => nameInputRef.current?.focus({ preventScroll: true }),
      600,
    );
    return () => window.clearTimeout(timer);
  }, [preset]);

  const validate = (values: FormValues) => {
    const errors: FormikErrors<FormValues> = {};
    if (!values.service || !values.subService) {
      errors.subService = t("error_service");
    }
    if (!values.name.trim()) {
      errors.name = t("error_required");
    }
    const digits = values.tel.replace(/\D/g, "");
    if (!values.tel.trim()) {
      errors.tel = t("error_required");
    } else if (digits.length < 10 || digits.length > 13) {
      errors.tel = t("error_phone");
    }
    return errors;
  };

  const handleSubmit = (
    values: FormValues,
    { resetForm, setFieldValue }: FormikHelpers<FormValues>,
  ) => {
    if (!user) {
      openModal({ booking: true });
      return;
    }
    if (!user.isVerified) {
      noticeRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    const slot = slotMode
      ? freeSlots.find((item) => item.id === values.slotId)
      : undefined;
    const timeText = slot ? slot.time : values.time ? t(values.time) : "";
    const details = [
      values.date &&
        `${t("preferred_date")}: ${values.date.split("-").reverse().join(".")}`,
      timeText && `${t("preferred_time")}: ${timeText}`,
      values.text,
    ].filter(Boolean);

    mutate(
      {
        name: values.name.trim(),
        phone: values.tel.trim(),
        email: user?.email || "",
        comment: details.join("\n"),
        service: `${t(values.service)} - ${values.subService}`,
        details: {
          date: values.date || undefined,
          time: timeText || undefined,
          note: values.text.trim() || undefined,
          slotId: slot?.id,
          lang: language === "en" ? "en" : "ua",
        },
      },
      {
        onError: (bookingError) => {
          if (bookingError instanceof SlotUnavailableError) {
            setFieldValue("slotId", "", false);
          }
        },
        onSuccess: (result) => {
          setSuccessWithSlot(!!slot);
          setTelegramLink(result.telegramLink ?? null);
          resetForm();
          setShowComment(false);
          setIsSuccess(true);
          window.setTimeout(
            () =>
              submitRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              }),
            50,
          );
          // keep the Telegram offer on screen until the client is done with it
          if (!result.telegramLink) {
            window.setTimeout(() => setIsSuccess(false), 8000);
          }
          onClose();
        },
      },
    );
  };

  return (
    <Formik
      innerRef={formikRef}
      initialValues={draft}
      validate={validate}
      // Not on blur: tapping "Send" blurs the last field, and errors appearing
      // or disappearing at that moment shift the button so the tap is lost
      validateOnBlur={false}
      validateOnChange
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue, errors, touched, submitCount }) => (
        <FormStyled name="connection-form" noValidate>
          <ScrollToFirstError />
          <DropTakenSlot slots={freeSlots} />
          <SaveDraft />
          {user?.role === "admin" && (
            <AdminLink to="/admin/schedule" onClick={onClose}>
              <CalendarClock size={18} aria-hidden />
              {t("admin_schedule")}
            </AdminLink>
          )}
          <FormTitle>{t("formTitle")}</FormTitle>
          {needsAccount && (
            <AccountNotice ref={noticeRef} email={user?.email} />
          )}

          <Fieldset data-field="service">
            <Legend>{label(t("for_whom"))}</Legend>
            <ChipGroup role="radiogroup">
              {CATEGORIES.map((category) => (
                <Chip
                  key={category}
                  type="button"
                  role="radio"
                  $small
                  aria-checked={values.service === category}
                  $active={values.service === category}
                  onClick={() => {
                    setFieldValue("service", category, submitCount > 0);
                    if (values.service !== category) {
                      setFieldValue("subService", "", false);
                    }
                  }}
                >
                  {t(category)}
                </Chip>
              ))}
            </ChipGroup>
          </Fieldset>

          <ServicePicker
            category={values.service}
            items={values.service ? (data[values.service] ?? []) : []}
            selected={values.subService}
            onSelect={(service) =>
              setFieldValue("subService", service, submitCount > 0)
            }
            label={label(t("select_service"))}
          />
          {submitCount > 0 && errors.subService && (
            <FieldError role="alert" data-field="subService">
              {errors.subService}
            </FieldError>
          )}

          <Row>
            <FormGroup>
              <Label htmlFor="date">
                {t("preferred_date")} <Muted>({t("optional")})</Muted>
              </Label>
              <DatePicker
                id="date"
                value={values.date}
                onChange={(date) => {
                  setFieldValue("date", date, false);
                  setFieldValue("slotId", "", false);
                }}
                isDateEnabled={
                  slotMode ? (date) => slotDays.has(date) : undefined
                }
                defaultDate={slotMode ? freeSlots[0].day : undefined}
                locale={language === "en" ? "en-GB" : "uk-UA"}
                labels={{
                  placeholder: t("date_placeholder"),
                  clear: t("date_clear"),
                  today: t("date_today"),
                  previousMonth: t("date_prev_month"),
                  nextMonth: t("date_next_month"),
                }}
              />
            </FormGroup>
            {slotMode ? (
              <Fieldset>
                <Legend>
                  {t("slot_time")} <Muted>({t("optional")})</Muted>
                </Legend>
                {slotDays.has(values.date) ? (
                  <ChipGroup role="radiogroup">
                    {freeSlots
                      .filter((slot) => slot.day === values.date)
                      .map((slot) => (
                        <Chip
                          key={slot.id}
                          type="button"
                          role="radio"
                          $small
                          aria-checked={values.slotId === slot.id}
                          $active={values.slotId === slot.id}
                          onClick={() =>
                            setFieldValue(
                              "slotId",
                              values.slotId === slot.id ? "" : slot.id,
                              false,
                            )
                          }
                        >
                          {slot.time}
                        </Chip>
                      ))}
                  </ChipGroup>
                ) : (
                  <Hint>{t("slot_pick_date_first")}</Hint>
                )}
                <Hint>{t("slot_other_time_hint")}</Hint>
              </Fieldset>
            ) : (
              <Fieldset>
                <Legend>
                  {t("preferred_time")} <Muted>({t("optional")})</Muted>
                </Legend>
                <TimeGrid role="radiogroup">
                  {TIME_SLOTS.map((slot) => (
                    <Chip
                      key={slot}
                      type="button"
                      role="radio"
                      $small
                      aria-checked={values.time === slot}
                      $active={values.time === slot}
                      onClick={() =>
                        setFieldValue(
                          "time",
                          values.time === slot ? "" : slot,
                          false,
                        )
                      }
                    >
                      {t(slot)}
                    </Chip>
                  ))}
                </TimeGrid>
              </Fieldset>
            )}
          </Row>

          <Row>
            <FormGroup data-field="name">
              <Label htmlFor="name">{label(t("name"))}</Label>
              <Input
                innerRef={nameInputRef}
                type="text"
                id="name"
                name="name"
                autoComplete="name"
                placeholder={t("enter_your_name")}
                aria-invalid={!!(touched.name && errors.name)}
                $invalid={!!(touched.name && errors.name)}
              />
              <ErrorMessage name="name" component={FieldError} />
            </FormGroup>
            <FormGroup data-field="tel">
              <Label htmlFor="tel">{label(t("phone"))}</Label>
              <Input
                type="tel"
                id="tel"
                name="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+380 __ ___ __ __"
                aria-invalid={!!(touched.tel && errors.tel)}
                $invalid={!!(touched.tel && errors.tel)}
              />
              <ErrorMessage name="tel" component={FieldError} />
            </FormGroup>
          </Row>

          {showComment || values.text ? (
            <FormGroup>
              <Label htmlFor="text">
                {label(t("comment").replace("*", ""))}{" "}
                <Muted>({t("optional")})</Muted>
              </Label>
              <Comment
                as="textarea"
                id="text"
                name="text"
                rows={3}
                autoFocus={showComment}
                placeholder={t("write_a_comment")}
              />
            </FormGroup>
          ) : (
            <AddCommentButton
              type="button"
              onClick={() => setShowComment(true)}
            >
              <Plus size={18} aria-hidden />
              {t("add_comment")}
            </AddCommentButton>
          )}

          <AnimatePresence>
            {isSuccess && (
              <SuccessBox
                role="status"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <CheckCircle2 size={28} aria-hidden />
                <div>
                  <strong>{t("thanks_title")}</strong>
                  <p>
                    {t(
                      successWithSlot
                        ? "thanks_message_slot"
                        : "thanks_message",
                    )}
                  </p>
                  {telegramLink && (
                    <TelegramBox>
                      <p>{t("telegram_confirm_hint")}</p>
                      <TelegramLink
                        href={telegramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Send size={18} aria-hidden />
                        {t("telegram_confirm_button")}
                      </TelegramLink>
                    </TelegramBox>
                  )}
                </div>
              </SuccessBox>
            )}
          </AnimatePresence>

          {isError && (
            <FieldError role="alert">
              {t(
                error instanceof SlotUnavailableError
                  ? "slot_taken"
                  : error instanceof AuthRequiredError
                    ? "booking_login_hint"
                    : error instanceof EmailNotVerifiedError
                      ? "booking_verify_hint"
                      : "booking_error",
                { email: user?.email ?? "" },
              )}
            </FieldError>
          )}

          <SubmitButton ref={submitRef} type="submit" disabled={isPending}>
            {isPending ? t("sending") : t("send")}
          </SubmitButton>
        </FormStyled>
      )}
    </Formik>
  );
};

/**
 * Above the form for guests (sign in first) and for accounts whose email is
 * not confirmed yet (resend the link, or recheck once confirmed)
 */
const AccountNotice = forwardRef<HTMLDivElement, { email?: string }>(
  ({ email }, ref) => {
    const [t] = useTranslation();
    const resend = useResendConfirmation();
    const recheck = useRecheckVerification();
    const authState = useAuthLinkState({ booking: true });

    if (!email) {
      return (
        <NoticeBox ref={ref}>
          <p>{t("booking_login_hint")}</p>
          <NoticeLink to="/auth" state={authState}>
            <LogIn size={16} aria-hidden />
            {t("login_action")}
          </NoticeLink>
        </NoticeBox>
      );
    }

    return (
      <NoticeBox ref={ref} role="status">
        <NoticeText>
          <span>{t("booking_verify_hint", { email })}</span>
          <small>
            {resend.isSuccess
              ? t("confirmation_resent")
              : t("check_spam_folder")}
          </small>
          {(resend.isError || recheck.isError) && (
            <FieldError role="alert">{t("auth_error")}</FieldError>
          )}
        </NoticeText>
        <NoticeActions>
          {!resend.isSuccess && (
            <NoticeTextButton
              type="button"
              onClick={() => resend.mutate({ email })}
              disabled={resend.isPending}
            >
              {t("resend_confirmation")}
            </NoticeTextButton>
          )}
          <NoticeButton
            type="button"
            onClick={() => recheck.mutate()}
            disabled={recheck.isPending}
          >
            {t("email_confirmed_recheck")}
          </NoticeButton>
        </NoticeActions>
      </NoticeBox>
    );
  },
);
AccountNotice.displayName = "AccountNotice";

/** On a failed submit, bring the first invalid field into view (it may be above the fold on mobile) */
const ScrollToFirstError: FC = () => {
  const { submitCount, isSubmitting, isValid, errors } =
    useFormikContext<FormValues>();
  const handledSubmit = useRef(0);

  // Formik bumps submitCount before validation finishes, so wait until the
  // attempt is over and the errors are known, then scroll once per attempt
  useEffect(() => {
    if (submitCount === handledSubmit.current || isSubmitting || isValid) {
      return;
    }
    handledSubmit.current = submitCount;
    const order: (keyof FormValues)[] = ["subService", "name", "tel"];
    const first = order.find((key) => errors[key]);
    if (!first) return;
    const target =
      document.querySelector(`[data-field="${first}"]`) ??
      (first === "subService"
        ? document.querySelector('[data-field="service"]')
        : null);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [submitCount, isSubmitting, isValid, errors]);

  return null;
};

/** Keeps the unsent form in storage; an emptied (sent) form removes it */
const SaveDraft: FC = () => {
  const { values } = useFormikContext<FormValues>();
  useEffect(() => saveDraft(values), [values]);
  return null;
};

/** Clears the chosen time once it is no longer free (taken by someone else) */
const DropTakenSlot: FC<{ slots: FreeSlot[] }> = ({ slots }) => {
  const { values, setFieldValue } = useFormikContext<FormValues>();
  useEffect(() => {
    if (values.slotId && !slots.some((slot) => slot.id === values.slotId)) {
      setFieldValue("slotId", "", false);
    }
  }, [slots, values.slotId, setFieldValue]);
  return null;
};

type ServicePickerProps = {
  category: string;
  items: PriceItem[];
  selected: string;
  onSelect: (service: string) => void;
  label: string;
};

const ServicePicker: FC<ServicePickerProps> = ({
  category,
  items,
  selected,
  onSelect,
  label,
}) => {
  const selectedRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Bring a preselected service into view inside the scrollable list
  useEffect(() => {
    // Scroll only the list itself: scrollIntoView would also move the page
    // and cancel the smooth scroll that brings the visitor to the form
    const option = selectedRef.current;
    const listElement = listRef.current;
    if (!option || !listElement) return;
    const optionTop = option.offsetTop - listElement.offsetTop;
    const optionBottom = optionTop + option.offsetHeight;
    if (optionTop < listElement.scrollTop) {
      listElement.scrollTop = optionTop;
    } else if (
      optionBottom >
      listElement.scrollTop + listElement.clientHeight
    ) {
      listElement.scrollTop = optionBottom - listElement.clientHeight;
    }
  }, [category, selected]);

  if (!category || items.length === 0) return null;

  return (
    <Fieldset>
      <Legend>{label}</Legend>
      <ServiceList ref={listRef} role="radiogroup">
        {items.map((item) => {
          const isActive = item.service === selected;
          return (
            <ServiceOption
              key={item.service}
              ref={isActive ? selectedRef : undefined}
              type="button"
              role="radio"
              aria-checked={isActive}
              $active={isActive}
              onClick={() => onSelect(item.service)}
            >
              <ServiceName>{item.service}</ServiceName>
              <ServiceMeta>
                {item.time && <span>{item.time}</span>}
                <ServicePrice>{item.price}</ServicePrice>
              </ServiceMeta>
            </ServiceOption>
          );
        })}
      </ServiceList>
    </Fieldset>
  );
};

const FormStyled = styled(Form)`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: var(--space-4);

  @media screen and (min-width: 600px) {
    gap: var(--space-5);
  }
`;

const FormTitle = styled.h3<{ theme?: ThemeType }>`
  ${(props) => cardTitle(props.theme as ThemeType)}
`;

const Fieldset = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
`;

const Legend = styled.legend<{ theme?: ThemeType }>`
  font-size: var(--text-sm);
  font-weight: 700;
  margin-bottom: var(--space-1);
  color: ${(props) => props.theme.colors.text};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);

  @media screen and (min-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const Muted = styled.span`
  font-weight: 400;
  opacity: 0.6;
`;

/* Four equal slots in one row, so the time picker takes a single line */
const TimeGrid = styled.div`
  display: flex;
  gap: 6px;

  & > button {
    flex: 1 1 auto;
    padding-inline: 10px;
    white-space: nowrap;
  }
`;

const TelegramBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
  margin-top: var(--space-3);
`;

const TelegramLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 10px 18px;
  border-radius: var(--radius-full);
  background-color: #229ed9;
  color: #fff;
  font-weight: 700;
  transition: filter 0.2s ease;

  &:hover {
    filter: brightness(1.08);
  }
`;

const Hint = styled.p`
  font-size: var(--text-sm);
  opacity: 0.7;
  line-height: 1.45;
`;

const AdminLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  align-self: flex-start;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-weight: 700;

  &:hover {
    background: color-mix(in srgb, var(--color-primary) 20%, transparent);
  }
`;

const AddCommentButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  align-self: flex-start;
  padding: 6px 0;
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-primary);
`;

const ChipGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
`;

const Chip = styled.button<{
  $active: boolean;
  $small?: boolean;
  theme?: ThemeType;
}>`
  min-height: 40px;
  padding: ${(props) => (props.$small ? "8px 14px" : "10px 18px")};
  border-radius: var(--radius-full);
  font-size: ${(props) =>
    props.$small ? "var(--text-sm)" : "var(--text-base)"};
  font-weight: 600;
  color: ${(props) => (props.$active ? "#fff" : props.theme.colors.text)};
  background-color: ${(props) =>
    props.$active ? "var(--color-primary)" : "transparent"};
  border: 1.5px solid
    ${(props) =>
      props.$active
        ? "var(--color-primary)"
        : `color-mix(in srgb, ${props.theme.colors.text} 20%, transparent)`};
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    border-color: var(--color-primary);
  }
`;

const ServiceList = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-height: 264px;
  overflow-y: auto;
  padding: 2px 6px 2px 2px;
  overscroll-behavior: contain;
`;

const ServiceOption = styled.button<{ $active: boolean; theme?: ThemeType }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  text-align: left;
  color: ${(props) => props.theme.colors.text};
  background-color: ${(props) =>
    props.$active
      ? "color-mix(in srgb, var(--color-primary) 12%, transparent)"
      : props.theme.colors.cardBg};
  border: 1.5px solid
    ${(props) => (props.$active ? "var(--color-primary)" : "transparent")};
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    border-color: color-mix(in srgb, var(--color-primary) 50%, transparent);
  }
`;

const ServiceName = styled.span`
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.3;
`;

const ServiceMeta = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  font-size: var(--text-sm);
  text-align: right;

  span:first-of-type {
    opacity: 0.7;
  }
`;

const ServicePrice = styled.span`
  font-weight: 700;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
  opacity: 1 !important;
`;

export const Label = styled.label<{ theme?: ThemeType }>`
  font-size: var(--text-sm);
  font-weight: 700;
  color: ${(props) => props.theme.colors.text};
`;

const fieldStyles = (props: { theme: ThemeType; $invalid?: boolean }) => `
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1.5px solid ${props.$invalid ? "#d64545" : props.theme.colors.border};
  background-color: transparent;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
  color: ${props.theme.colors.text};
  color-scheme: inherit;

  &::placeholder {
    color: ${props.theme.colors.text};
    opacity: 0.5;
  }

  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 4px var(--color-primary-ring);
  }
`;

export const Input = styled(Field, {
  shouldForwardProp: (prop) => prop !== "$invalid",
})<{ theme?: ThemeType; $invalid?: boolean }>`
  ${(props) => fieldStyles(props as { theme: ThemeType; $invalid?: boolean })}
`;

export const Comment = styled(Field)<{ theme?: ThemeType }>`
  ${(props) => fieldStyles(props as { theme: ThemeType })}
  resize: vertical;
  min-height: 84px;
`;

const FieldError = styled.p`
  color: #d64545;
  font-size: var(--text-sm);
  font-weight: 600;
`;

const SuccessBox = styled(motion.div)<{ theme?: ThemeType }>`
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-primary) 40%, transparent);
  color: ${(props) => props.theme.colors.text};

  svg {
    flex-shrink: 0;
    color: var(--color-primary);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  min-height: 52px;
  padding: 14px 32px;
  border-radius: var(--radius-full);
  font-size: var(--text-lg);
  font-weight: 700;
  color: #fff;
  background-color: var(--color-primary);
  box-shadow: 0 12px 28px -10px var(--color-primary-shadow);
  transition:
    background-color 0.2s ease,
    transform 0.2s var(--ease-out);

  &:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  @media screen and (min-width: 600px) {
    width: auto;
    align-self: flex-start;
    padding: 16px 48px;
  }
`;
