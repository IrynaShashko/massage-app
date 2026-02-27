import { GoogleLogin } from "@react-oauth/google";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useModal } from "../../context/ModalContext";
import { useGoogleLogin, useLogin, useRegister } from "../../hooks/useAuth";

const AuthPage: React.FC = () => {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [showVerifyMessage, setShowVerifyMessage] = useState(false);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const googleMutation = useGoogleLogin();

  const { closeModal } = useModal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      loginMutation.mutate(
        { email, password },
        {
          onSuccess: () => {
            closeModal();
            navigate("/");
          },
        },
      );
    } else {
      registerMutation.mutate(
        { name, email, password },
        {
          onSuccess: () => {
            setShowVerifyMessage(true);

            setTimeout(() => {
              closeModal();
              setShowVerifyMessage(false);
            }, 5000);
          },
        },
      );
    }
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      googleMutation.mutate(
        { idToken: credentialResponse.credential },
        {
          onSuccess: () => {
            closeModal();
            navigate("/");
          },
        },
      );
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;
  const error = isLogin ? loginMutation.error : registerMutation.error;

  return (
    <FullPageSection>
      <CenteredWrapper>
        <AuthCard>
          <Title>{isLogin ? t("login_title") : t("register_title")}</Title>

          {showVerifyMessage && !isLogin ? (
            <Message>✅ {t("check_email_for_verification")}</Message>
          ) : (
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <InputGroup>
                  <label>{t("name_label")}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("name_placeholder")}
                    required
                  />
                </InputGroup>
              )}

              <InputGroup>
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  required
                />
              </InputGroup>

              <InputGroup>
                <label>{t("password_label")}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </InputGroup>

              {error && (
                <ErrorMessage>
                  {(error as any)?.response?.data?.message || t("auth_error")}
                </ErrorMessage>
              )}

              <SubmitButton type="submit" disabled={isLoading}>
                {isLoading
                  ? "..."
                  : isLogin
                    ? t("login_button")
                    : t("create_account")}
              </SubmitButton>
            </form>
          )}
          <Divider>
            <span>{t("or") || "або"}</span>
          </Divider>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log("Login Failed")}
            theme="outline"
            shape="circle"
            width="100%"
            text="signin_with"
          />

          <SwitchText>
            {isLogin ? t("no_account") : t("have_account")}
            <span
              onClick={() => {
                setIsLogin(!isLogin);
                setShowVerifyMessage(false);
              }}
            >
              {isLogin ? t("register_action") : t("login_action")}
            </span>
          </SwitchText>
        </AuthCard>
      </CenteredWrapper>
    </FullPageSection>
  );
};

export default AuthPage;

const Message = styled.div`
  text-align: center;
  padding: 20px;
  background: rgba(0, 255, 0, 0.1);
  border-radius: 12px;
  font-size: 16px;
  color: #00aa00;
  margin-bottom: 20px;
`;

const ErrorMessage = styled.p`
  color: #ff4d4d;
  font-size: 14px;
  text-align: center;
  margin-bottom: 15px;
`;

const FullPageSection = styled.section`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  min-height: calc(100vh - 160px);
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme.colors.background};

  @media (max-width: 768px) {
    align-items: center;
    justify-content: center;
    padding: 0 20px;
  }
`;

const CenteredWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex: 1;
`;

const AuthCard = styled.div`
  width: 100%;
  max-width: 450px;
  background: ${(props) =>
    props.theme.colors.aboutBg || "rgba(255, 255, 255, 0.05)"};
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 30px;
    max-width: 400px;
  }

  @media (max-width: 480px) {
    padding: 25px 20px;
    border-radius: 20px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const Title = styled.h2`
  text-align: center;
  font-size: 28px;
  margin-bottom: 30px;
  color: ${(props) => props.theme.colors.primary || "#007586"};

  @media (max-width: 480px) {
    font-size: 24px;
    margin-bottom: 20px;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    opacity: 0.8;
  }

  input {
    width: 100%;
    padding: 14px;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: inherit;
    font-size: 16px;
    transition: all 0.3s ease;

    @media (max-width: 768px) {
      font-size: 16px;
      padding: 12px;
    }

    &:focus {
      outline: none;
      border-color: #007586;
      background: rgba(255, 255, 255, 0.12);
    }
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #007586;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.3s ease;

  &:hover {
    background: #005f6b;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 480px) {
    padding: 14px;
  }
`;

const SwitchText = styled.p`
  text-align: center;
  margin-top: 25px;
  font-size: 14px;
  opacity: 0.7;
  line-height: 1.4;

  span {
    color: #007586;
    font-weight: bold;
    cursor: pointer;
    text-decoration: underline;
    margin-left: 5px;
    display: inline-block;

    &:hover {
      opacity: 0.8;
    }
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 25px 0;
  color: rgba(255, 255, 255, 0.3);
  font-size: 13px;
  letter-spacing: 1px;

  &::before,
  &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  span {
    padding: 0 15px;
    text-transform: uppercase;
  }
`;
