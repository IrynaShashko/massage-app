import { FC, useEffect, useRef, useState } from "react";

import styled from "@emotion/styled";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  ErrorMessage,
  Field,
  Form,
  Formik,
  FormikErrors,
  FormikHelpers,
  FormikProps,
} from "formik";

import priceData from "../../json/price.json";
import priceDataEn from "../../json/priceEn.json";

import { cardTitle } from "../../theme/surfaces";
import { ThemeType } from "../../theme/theme";

import { useBooking } from "../../context/BookingContext";
import { useProfile } from "../../hooks/useAuth";
import { useCreateBooking } from "../../hooks/useCreateBooking";

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
};

/** Labels in the translations end with ":"; drop it so every label in the form looks the same */
const label = (text: string) => text.replace(/:\s*$/, "");

export const ConnectionForm: FC<ConnectionFormPropsType> = ({
  onClose,
  language,
}) => {
  const [t] = useTranslation();
  const { data: user } = useProfile();
  const { mutate, isPending, isError } = useCreateBooking();
  const { preset } = useBooking();

  const [isSuccess, setIsSuccess] = useState(false);
  const formikRef = useRef<FormikProps<FormValues>>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const data = (language === "ua" ? priceData : priceDataEn) as Record<
    string,
    PriceItem[]
  >;

  // Preselect a service when the visitor clicks "Book" on a price card
  useEffect(() => {
    if (!preset || !formikRef.current) return;
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
    { resetForm }: FormikHelpers<FormValues>,
  ) => {
    const details = [
      values.date &&
        `${t("preferred_date")}: ${values.date.split("-").reverse().join(".")}`,
      values.time && `${t("preferred_time")}: ${t(values.time)}`,
      values.text,
    ].filter(Boolean);

    mutate(
      {
        name: values.name.trim(),
        phone: values.tel.trim(),
        email: user?.email || "",
        comment: details.join("\n"),
        service: `${t(values.service)} - ${values.subService}`,
      },
      {
        onSuccess: () => {
          resetForm();
          setIsSuccess(true);
          window.setTimeout(() => setIsSuccess(false), 6000);
          onClose();
        },
      },
    );
  };

  return (
    <Formik
      innerRef={formikRef}
      initialValues={initialValues}
      validate={validate}
      validateOnBlur
      validateOnChange={false}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue, errors, touched, submitCount }) => (
        <FormStyled name="connection-form" noValidate>
          <FormTitle>{t("formTitle")}</FormTitle>

          <Fieldset>
            <Legend>{label(t("for_whom"))}</Legend>
            <ChipGroup role="radiogroup">
              {CATEGORIES.map((category) => (
                <Chip
                  key={category}
                  type="button"
                  role="radio"
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
            <FieldError role="alert">{errors.subService}</FieldError>
          )}

          <Row>
            <FormGroup>
              <Label htmlFor="date">
                {t("preferred_date")} <Muted>({t("optional")})</Muted>
              </Label>
              <DatePicker
                id="date"
                value={values.date}
                onChange={(date) => setFieldValue("date", date, false)}
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
            <Fieldset>
              <Legend>
                {t("preferred_time")} <Muted>({t("optional")})</Muted>
              </Legend>
              <ChipGroup role="radiogroup">
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
              </ChipGroup>
            </Fieldset>
          </Row>

          <Row>
            <FormGroup>
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
            <FormGroup>
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
              placeholder={t("write_a_comment")}
            />
          </FormGroup>

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
                  <p>{t("thanks_message")}</p>
                </div>
              </SuccessBox>
            )}
          </AnimatePresence>

          {isError && (
            <FieldError role="alert">{t("booking_error")}</FieldError>
          )}

          <SubmitButton type="submit" disabled={isPending}>
            {isPending ? t("sending") : t("send")}
          </SubmitButton>
        </FormStyled>
      )}
    </Formik>
  );
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
  gap: var(--space-5);
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
  font-size: var(--text-base);
  font-weight: 700;
  margin-bottom: var(--space-2);
  color: ${(props) => props.theme.colors.text};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);

  @media screen and (min-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
`;

const Muted = styled.span`
  font-weight: 400;
  opacity: 0.6;
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
  max-height: 320px;
  overflow-y: auto;
  padding: 2px 6px 2px 2px;
  overscroll-behavior: contain;
`;

const ServiceOption = styled.button<{ $active: boolean; theme?: ThemeType }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  width: 100%;
  padding: 12px 16px;
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
  font-size: var(--text-base);
  font-weight: 600;
  line-height: 1.35;
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
  font-size: var(--text-base);
  font-weight: 700;
  color: ${(props) => props.theme.colors.text};
`;

const fieldStyles = (props: { theme: ThemeType; $invalid?: boolean }) => `
  padding: 14px 16px;
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
  min-height: 96px;
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
  padding: 18px 48px;
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
`;
