import { FC, useCallback, useEffect, useState } from "react";

import styled from "@emotion/styled";

import { useTranslation } from "react-i18next";

import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";

import { IconContext } from "react-icons";
import { FiX } from "react-icons/fi";

import logo from "../../images/logo.png";

import priceData from "../../json/price.json";
import priceDataEn from "../../json/priceEn.json";

import { ThemeType } from "../../theme/theme";

import {
  ModalBackdrop,
  ModalButton,
  ModalContent,
  ModalHeader,
} from "../Modal";

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
      setSubServiceOptions(selectedServiceData.subServices);
    } else {
      setSubServiceOptions([]);
    }
  }, [selectedService, selectedServiceData]);

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

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.currentTarget === event.target) {
        onClose();
      }
    },
    [onClose],
  );

  const handleServiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedService(event.target.value);
  };

  const handleSubServiceChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedSubService(event.target.value);
  };

  const handleSubmit = (
    values: typeof initialValues,
    { resetForm }: FormikHelpers<typeof initialValues>,
  ) => {
    resetForm();
    onClose();
  };

  return (
    <>
      <ModalBackdrop onClick={handleBackdropClick}>
        <ModalContent>
          <Container>
            <ModalHeader>
              <img src={logo} width={120} alt="logo" />
              <ModalButton onClick={onClose}>
                <IconContext.Provider
                  value={{
                    size: "30px",
                    color: "#007586",
                  }}
                >
                  <FiX />
                </IconContext.Provider>
              </ModalButton>
            </ModalHeader>
            <Formik initialValues={initialValues} onSubmit={handleSubmit}>
              {({ handleSubmit }) => (
                <FormStyled
                  name="connection-form"
                  data-netlify="true"
                  method="post"
                  onSubmit={handleSubmit}
                  action="/success"
                >
                  <input
                    type="hidden"
                    name="form-name"
                    value="connection-form"
                  />
                  <div>
                    <Label htmlFor="service">
                      {t("for_whom")}
                      <OptionLable
                        as="select"
                        id="service"
                        name="service"
                        value={selectedService}
                        onChange={handleServiceChange}
                      >
                        <Option value="">{t("select")}</Option>
                        {services.map((service) => (
                          <Option key={service.name} value={service.name}>
                            {t(service.name)}
                          </Option>
                        ))}
                      </OptionLable>
                      <ErrorMessage name="service" component="div" />
                    </Label>
                  </div>
                  {subServiceOptions.length > 0 && (
                    <div>
                      <Label htmlFor="subService">
                        {t("select_service")}
                        <OptionLable
                          as="select"
                          id="subService"
                          name="subService"
                          value={selectedSubService}
                          onChange={handleSubServiceChange}
                        >
                          <Option value="">{t("select")}</Option>
                          {subServiceOptions.map((subService) => (
                            <Option key={subService} value={subService}>
                              {subService}
                            </Option>
                          ))}
                        </OptionLable>
                        <ErrorMessage name="subService" component="div" />
                      </Label>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="name">
                      {t("name")}
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        placeholder={t("enter_your_name")}
                        required
                      />
                      <ErrorMessage name="name" component="div" />
                    </Label>
                  </div>
                  <div>
                    <Label htmlFor="tel">
                      {t("phone")}
                      <Input
                        type="tel"
                        id="tel"
                        name="tel"
                        placeholder={t("enter_your_phone_number")}
                        required
                      />
                      <ErrorMessage name="tel" component="div" />
                    </Label>
                  </div>
                  <div>
                    <Label htmlFor="text">
                      {t("comment")}
                      <Comment
                        as="textarea"
                        type="text"
                        id="text"
                        name="text"
                        placeholder={t("write_a_comment")}
                      />
                      <ErrorMessage name="text" component="div" />
                    </Label>
                  </div>
                  <ModalSubmitBtn type="submit">{t("send")}</ModalSubmitBtn>
                </FormStyled>
              )}
            </Formik>
          </Container>
        </ModalContent>
      </ModalBackdrop>
    </>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const FormStyled = styled(Form)`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
`;

export const Label = styled.label<{ theme?: ThemeType }>`
  display: flex;
  flex-direction: column;
  text-align: left;
  font-size: 16px;
  color: ${(props) => props.theme.colors.text};
  padding-top: 10px;
`;

export const Input = styled(Field)`
  padding: 10px;
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 16px;
  margin-top: 5px;
  font-size: 14px;
  outline: none;
  color: ${(props) => props.theme.colors.text};
  background-color: transparent;

  &::placeholder {
    font-size: 14px;
    color: #aaa;
  }

  &:focus {
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

export const Comment = styled(Field)`
  padding: 12px;
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 16px;
  margin-top: 10px;
  font-size: 14px;
  resize: none;
  font-family: "Montserrat", sans-serif;

  &::placeholder {
    font-size: 14px;
    color: #aaa;
  }

  &:focus {
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const Option = styled.option`
  padding: 10px;
  font-size: 14px;
  cursor: pointer;
  overflow: hidden;
`;

const OptionLable = styled(Field)`
  padding: 10px;
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 16px;
  background-color: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  font-size: 14px;
  width: 100%;
  appearance: none;
  margin-top: 5px;
  font-family: "Montserrat", sans-serif;
  cursor: pointer;
`;

const ModalSubmitBtn = styled.button<{ theme?: ThemeType }>`
  padding: 12px 20px;
  font-size: 16px;
  color: ${(props) => props.theme.colors.text};
  background-color: ${(props) => props.theme.colors.primary};
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 24px;

  &:hover {
    background-color: ${(props) => props.theme.colors.primary};
  }
`;
