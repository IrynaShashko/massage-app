import { FC, useEffect, useRef, useState } from "react";

import styled from "@emotion/styled";

import { useTranslation } from "react-i18next";

import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";

import priceData from "../../json/price.json";
import priceDataEn from "../../json/priceEn.json";

import { ThemeType } from "../../theme/theme";

import { ConnectionFormPropsType } from "./types";

export const ConnectionForm: FC<ConnectionFormPropsType> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [t] = useTranslation();
  const [selectedService, setSelectedService] = useState("");
  const [selectedSubService, setSelectedSubService] = useState("");
  const [subServiceOptions, setSubServiceOptions] = useState<string[]>([]);
  const previousSubServiceOptionsRef = useRef<string[]>([]);

  const data = language === "ua" ? priceData : priceDataEn;

  const womenServises: string[] = data.women.map((item) => item.service);
  const menServises: string[] = data.men.map((item) => item.service);
  const childrenServises: string[] = data.children.map((item) => item.service);
  const bodyServises: string[] = data.body.map((item) => item.service);
  const elseServises: string[] = data.else.map((item) => item.service);

  const initialValues = {
    name: "",
    tel: "",
    text: "",
    service: "",
    subService: "",
  };

  const services = [
    {
      name: "women",
      subServices: womenServises,
    },
    {
      name: "men",
      subServices: menServises,
    },
    {
      name: "children",
      subServices: childrenServises,
    },
    {
      name: "body",
      subServices: bodyServises,
    },
    {
      name: "else",
      subServices: elseServises,
    },
  ];

  const selectedServiceData = services.find(
    (service) => service.name === selectedService,
  );

  useEffect(() => {
    if (selectedServiceData) {
      if (
        JSON.stringify(previousSubServiceOptionsRef.current) !==
        JSON.stringify(selectedServiceData.subServices)
      ) {
        setSubServiceOptions(selectedServiceData.subServices);
        previousSubServiceOptionsRef.current = selectedServiceData.subServices;
      }
    } else {
      setSubServiceOptions([]);
    }
  }, [selectedService, selectedServiceData, language]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleServiceChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    setFieldValue: any,
  ) => {
    const service = event.target.value;
    setSelectedService(service);
    setFieldValue("service", service);
  };

  const handleSubServiceChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    setFieldValue: any,
  ) => {
    const subService = event.target.value;
    setSelectedSubService(subService);
    setFieldValue("subService", subService);
  };

  const handleSubmit = (
    values: typeof initialValues,
    { resetForm }: FormikHelpers<typeof initialValues>,
  ) => {
    resetForm();
    onClose();
  };

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      onSubmit={(values, actions) => {
        handleSubmit(values, actions);
        (
          document.forms.namedItem("connection-form") as HTMLFormElement
        )?.submit();
      }}
    >
      {({ handleSubmit, setFieldValue }) => (
        <FormStyled name="connection-form" onSubmit={handleSubmit}>
          <input type="hidden" name="form-name" value="connection-form" />
          <FormTitle>{t("formTitle")}</FormTitle>
          <FormGroup>
            <Label htmlFor="service">{t("for_whom")}</Label>
            <OptionLable
              as="select"
              id="service"
              name="service"
              value={selectedService}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                handleServiceChange(event, setFieldValue);
              }}
            >
              <Option value="">{t("select")}</Option>
              {services.map((service) => (
                <Option key={service.name} value={service.name}>
                  {t(service.name)}
                </Option>
              ))}
            </OptionLable>
            <ErrorMessage name="service" component="div" />
          </FormGroup>
          {subServiceOptions.length > 0 && (
            <FormGroup>
              <Label htmlFor="subService">{t("select_service")}</Label>
              <OptionLable
                as="select"
                id="subService"
                name="subService"
                value={selectedSubService}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                  handleSubServiceChange(event, setFieldValue);
                }}
              >
                <Option value="">{t("select")}</Option>
                {subServiceOptions.map((subService) => (
                  <Option key={subService} value={subService}>
                    {subService}
                  </Option>
                ))}
              </OptionLable>
              <ErrorMessage name="subService" component="div" />
            </FormGroup>
          )}
          <FormGroup>
            <Label htmlFor="name">{t("name")}</Label>
            <Input
              type="text"
              id="name"
              name="name"
              placeholder={t("enter_your_name")}
              required
            />
            <ErrorMessage name="name" component="div" />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="tel">{t("phone")}</Label>
            <Input
              type="tel"
              id="tel"
              name="tel"
              placeholder={t("enter_your_phone_number")}
              required
            />
            <ErrorMessage name="tel" component="div" />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="text">{t("comment")}</Label>
            <Comment
              as="textarea"
              type="text"
              id="text"
              name="text"
              placeholder={t("write_a_comment")}
            />
            <ErrorMessage name="text" component="div" />
          </FormGroup>
          <ModalSubmitBtn type="submit">{t("send")}</ModalSubmitBtn>
        </FormStyled>
      )}
    </Formik>
  );
};

const FormStyled = styled(Form)`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  align-self: center;
`;

export const Label = styled.label<{ theme?: ThemeType }>`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
  color: ${(props) => props.theme.colors.text};
`;

export const Input = styled(Field)<{ theme?: ThemeType }>`
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.border};
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
  width: 100%;
  color: ${(props) => props.theme.colors.text};
  &::placeholder {
    color: ${(props) => props.theme.colors.text};
    opacity: 0.7;
  }
  &:focus {
    border-color: #007586;
    box-shadow: 0 0 0 3px rgba(0, 117, 134, 0.2);
    &::placeholder {
      opacity: 0.3;
    }
  }
`;

export const Comment = styled(Field)`
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.border};
  font-size: 16px;
  resize: none;
  outline: none;
  transition: all 0.3s ease;
  width: 100%;
  color: ${(props) => props.theme.colors.text};
  &::placeholder {
    color: ${(props) => props.theme.colors.text};
    opacity: 0.7;
  }
  &:focus {
    border-color: #007586;
    box-shadow: 0 0 0 3px rgba(0, 117, 134, 0.2);
    &::placeholder {
      opacity: 0.3;
    }
  }
`;

const Option = styled.option`
  padding: 10px;
  font-size: 14px;
  cursor: pointer;
  overflow: hidden;
`;

const OptionLable = styled(Field)`
  padding: 14px 16px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background-color: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  font-size: 14px;
  width: 100%;
  appearance: none;
  margin-top: 5px;
  font-family: "Comfortaa", sans-serif;
  cursor: pointer;
  &:focus {
    border-color: #007586;
    box-shadow: 0 0 0 3px rgba(0, 117, 134, 0.2);
  }
`;

const ModalSubmitBtn = styled.button<{ theme?: ThemeType }>`
  padding: 18px 48px;
  border-radius: 90px;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.buttonText};
  background-color: ${(props) => props.theme.colors.primary};
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 24px;

  &:hover {
    background-color: #005f6e;
  }
`;
