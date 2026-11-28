import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { Navigate, useLocation } from "react-router-dom";

import { Eye, EyeOff } from "lucide-react";

import styled from "@emotion/styled";

import { useModal } from "../../context/ModalContext";

import {
  isEmailNotConfirmedError,
  useGoogleLogin,
  useLogin,
  useProfile,
  useRegister,
  useResendConfirmation,
} from "../../hooks/useAuth";
import {
  AuthReturnState,
  hasAuthReturn,
  saveAuthReturn,
} from "../../hooks/useAuthReturn";
import { isGoogleAuthEnabled } from "../../config/google";
import googleIcon from "../../icons/google.svg";
import { cardSurface } from "../../theme/surfaces";
import { ThemeType } from "../../theme/theme";

/** Labels in the translations end with ":"; drop it to match the booking form */
const label = (text: string) => text.replace(/:\s*$/, "");

const AuthPage: React.FC = () => {
  const [t] = useTranslation();
  const location = useLocation();
  const { data: user, isLoading: isProfileLoading } = useProfile();

  // Remember where the visitor came from; useAuthReturnRedirect takes them
  // back there after any sign-in: password, Google, or the confirmation link
  // (only for guests: a signed-in visitor is sent to the profile instead)
  const isGuest = !isProfileLoading && !user;
  useEffect(() => {
    if (!isGuest) return;
    const state = location.state as AuthReturnState | null;
    saveAuthReturn({ from: state?.from ?? "/", booking: !!state?.booking });
  }, [isGuest, location.state]);
  const [isLogin, setIsLogin] = useState(
    () => !(location.state as AuthReturnState | null)?.register,
  );
  // the header's "Log in" / "Create account" can switch the form while on it
  useEffect(() => {
    setIsLogin(!(location.state as AuthReturnState | null)?.register);
  }, [location.state]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [showVerifyMessage, setShowVerifyMessage] = useState(false);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const googleMutation = useGoogleLogin();
  const resendMutation = useResendConfirmation();

  const { closeModal } = useModal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      loginMutation.mutate(
        { email, password },
        {
          onSuccess: () => {
            closeModal();
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
            }, 10000);
          },
        },
      );
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;
  const error =
    (isLogin ? loginMutation.error : registerMutation.error) ||
    googleMutation.error;

  const emailNotConfirmed = isLogin && isEmailNotConfirmedError(error);

  // just signed in: useAuthReturnRedirect is taking them back
  if (user && hasAuthReturn()) return null;
  if (user) return <Navigate to="/profile" replace />;

  return (
    <FullPageSection>
      <CenteredWrapper>
        <AuthCard>
          <Title>{isLogin ? t("login_title") : t("register_title")}</Title>
          {showVerifyMessage && !isLogin ? (
            <Message>
              <p>{t("registration_success_check_email")}</p>
              <p className="spam-hint">{t("check_spam_folder")}</p>
            </Message>
          ) : (
            <>
              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <InputGroup>
                    <label htmlFor="auth-name">{label(t("name_label"))}</label>
                    <input
                      id="auth-name"
                      autoComplete="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("name_placeholder")}
                      required
                    />
                  </InputGroup>
                )}

                <InputGroup>
                  <label htmlFor="auth-email">{label(t("email_label"))}</label>
                  <input
                    id="auth-email"
                    autoComplete="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("email_placeholder")}
                    required
                  />
                </InputGroup>
                <InputGroup>
                  <label htmlFor="auth-password">
                    {label(t("password_label"))}
                  </label>
                  <PasswordWrapper>
                    <input
                      id="auth-password"
                      autoComplete={
                        isLogin ? "current-password" : "new-password"
                      }
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <ToggleButton
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </ToggleButton>
                  </PasswordWrapper>
                </InputGroup>

                {emailNotConfirmed ? (
                  <Notice role="alert">
                    <p>{t("email_not_confirmed")}</p>
                    <p className="spam-hint">{t("check_spam_folder")}</p>
                    {resendMutation.isSuccess ? (
                      <p className="spam-hint">{t("confirmation_resent")}</p>
                    ) : (
                      <ResendButton
                        type="button"
                        onClick={() => resendMutation.mutate({ email })}
                        disabled={resendMutation.isPending || !email}
                      >
                        {t("resend_confirmation")}
                      </ResendButton>
                    )}
                    {resendMutation.isError && (
                      <ErrorMessage>{t("auth_error")}</ErrorMessage>
                    )}
                  </Notice>
                ) : (
                  error && <ErrorMessage>{t("auth_error")}</ErrorMessage>
                )}

                <SubmitButton type="submit" disabled={isLoading}>
                  {isLoading
                    ? "..."
                    : isLogin
                      ? t("login_button")
                      : t("create_account")}
                </SubmitButton>
              </form>

              {isGoogleAuthEnabled && (
                <>
                  <Divider>
                    <span>{t("or") || "або"}</span>
                  </Divider>
                  {/* redirects to Google and back; useAuthListener picks up the session */}
                  <CustomGoogleButton
                    type="button"
                    onClick={() => googleMutation.mutate()}
                    disabled={googleMutation.isPending}
                  >
                    <img src={googleIcon} alt="" aria-hidden />
                    {isLogin ? t("signin_with") : t("signup_with")}
                  </CustomGoogleButton>
                </>
              )}

              <SwitchText>
                {isLogin ? t("no_account") : t("have_account")}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setShowVerifyMessage(false);
                  }}
                >
                  {isLogin ? t("register_action") : t("login_action")}
                </button>
              </SwitchText>
            </>
          )}
        </AuthCard>
      </CenteredWrapper>
    </FullPageSection>
  );
};

export default AuthPage;

const Message = styled.div<{ theme?: ThemeType }>`
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-primary) 40%, transparent);
  text-align: center;
  line-height: 1.5;

  p {
    font-size: var(--text-base);
    font-weight: 600;
    color: ${(props) => props.theme.colors.text};
  }

  .spam-hint {
    margin-top: var(--space-2);
    font-size: var(--text-sm);
    font-weight: 400;
    opacity: 0.75;
  }
`;

const Notice = styled(Message)`
  margin-bottom: var(--space-3);
`;

const ResendButton = styled.button`
  margin-top: var(--space-3);
  padding: 0;
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;

const ErrorMessage = styled.p`
  color: #d64545;
  font-size: var(--text-sm);
  font-weight: 600;
  text-align: center;
  margin-bottom: var(--space-3);
`;

const FullPageSection = styled.section<{ theme?: ThemeType }>`
  display: flex;
  flex: 1;
  width: 100%;
  min-height: calc(100dvh - var(--header-height) - 160px);
  align-items: center;
  justify-content: center;
  padding: var(--space-7) 20px;
`;

const CenteredWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const AuthCard = styled.div<{ theme?: ThemeType }>`
  ${(props) => cardSurface(props.theme as ThemeType)}
  width: 100%;
  max-width: 440px;
  padding: var(--space-6);

  @media (max-width: 480px) {
    padding: var(--space-5);
  }
`;

const Title = styled.h1<{ theme?: ThemeType }>`
  margin-bottom: var(--space-5);
  text-align: center;
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: -0.015em;
  color: ${(props) => props.theme.colors.text};
`;

const InputGroup = styled.div<{ theme?: ThemeType }>`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);

  label {
    font-size: var(--text-base);
    font-weight: 700;
    color: ${(props) => props.theme.colors.text};
  }

  input {
    width: 100%;
    padding: 14px 16px;
    border-radius: var(--radius-md);
    border: 1.5px solid ${(props) => props.theme.colors.border};
    background: transparent;
    color: ${(props) => props.theme.colors.text};
    font-size: 16px;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &::placeholder {
      color: ${(props) => props.theme.colors.text};
      opacity: 0.5;
    }

    &:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px var(--color-primary-ring);
    }
  }
`;

const PasswordWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  input {
    padding-right: 52px;
  }
`;

const ToggleButton = styled.button<{ theme?: ThemeType }>`
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  color: ${(props) => props.theme.colors.text};
  opacity: 0.6;
  transition:
    opacity 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    opacity: 1;
    background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  margin-top: var(--space-2);
  padding: 16px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  color: #fff;
  font-size: var(--text-lg);
  font-weight: 700;
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

const SwitchText = styled.p<{ theme?: ThemeType }>`
  margin-top: var(--space-4);
  text-align: center;
  font-size: var(--text-sm);
  color: ${(props) => props.theme.colors.text};

  span,
  button {
    margin-left: 6px;
    padding: 0;
    color: var(--color-primary);
    font-size: inherit;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }
`;

const Divider = styled.div<{ theme?: ThemeType }>`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: var(--space-5) 0;
  color: ${(props) => props.theme.colors.text};
  font-size: var(--text-sm);

  &::before,
  &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
  }

  span {
    opacity: 0.6;
  }
`;

const CustomGoogleButton = styled.button<{ theme?: ThemeType }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: 14px 16px;
  border-radius: var(--radius-full);
  border: 1.5px solid ${(props) => props.theme.colors.border};
  background: transparent;
  color: ${(props) => props.theme.colors.text};
  font-size: var(--text-base);
  font-weight: 600;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;

  img {
    width: 20px;
    height: 20px;
  }

  &:hover {
    border-color: var(--color-primary);
    background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
  }
`;
