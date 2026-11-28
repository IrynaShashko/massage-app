import styled from "@emotion/styled";
import {
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  FileText,
  LogOut,
  MailWarning,
  MessageSquare,
  Pencil,
  ShieldCheck,
  Star,
} from "lucide-react";
import { FC, FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate } from "react-router-dom";

import { SectionContainer } from "../../App";
import { useBooking } from "../../context/BookingContext";
import {
  SkeletonBlock,
  SkeletonRegion,
  SkeletonRows,
  SkeletonStack,
} from "../../components/Skeleton";
import { UserAvatar } from "../../components/UserAvatar";
import { useLogout, useProfile, useUpdateProfile } from "../../hooks/useAuth";
import { MyBooking, useMyBookings } from "../../hooks/useMyBookings";
import { kyivToday } from "../../hooks/useSlots";
import { useReviews } from "../../hooks/useReviews";
import { ThemeType } from "../../theme/theme";
import {
  Card,
  ErrorText,
  GhostButton,
  PrimaryButton,
} from "../AdminArticlesPage/shared";
import { formatDate, RatingStars } from "../ReviewsPage/ReviewItem";

const NameEditor: FC<{ name: string; onDone: () => void }> = ({
  name,
  onDone,
}) => {
  const [t] = useTranslation();
  const [value, setValue] = useState(name);
  const updateMutation = useUpdateProfile();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    updateMutation.mutate({ name: trimmed }, { onSuccess: onDone });
  };

  return (
    <NameForm onSubmit={handleSubmit}>
      <label htmlFor="profile-name" className="visually-hidden">
        {t("profile_name")}
      </label>
      <input
        id="profile-name"
        autoComplete="name"
        autoFocus
        maxLength={80}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("name_placeholder")}
        required
      />
      <FormActions>
        <PrimaryButton type="submit" disabled={updateMutation.isPending}>
          {t("profile_save")}
        </PrimaryButton>
        <GhostButton type="button" onClick={onDone}>
          {t("profile_cancel")}
        </GhostButton>
      </FormActions>
      {updateMutation.isError && (
        <ErrorText>{t("profile_save_error")}</ErrorText>
      )}
    </NameForm>
  );
};

const ProfilePage: FC = () => {
  const [t, i18n] = useTranslation();
  const { data: user, isLoading } = useProfile();
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews();
  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    isError: bookingsError,
  } = useMyBookings(user?.id);
  const logoutMutation = useLogout();
  const { startBooking } = useBooking();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) return <ProfileSkeleton />;
  if (!user) return <Navigate to="/auth" replace />;

  const myReviews = reviews.filter((review) => review.userId === user.id);
  const isAdmin = user.role === "admin";
  const memberSince = formatDate(user.createdAt, i18n.language);

  return (
    <SectionContainer>
      <Page>
        <Hero>
          <UserAvatar user={user} size={88} />
          <IdentityText>
            {isEditing ? (
              <NameEditor name={user.name} onDone={() => setIsEditing(false)} />
            ) : (
              <NameRow>
                <Name>{user.name || t("profile_no_name")}</Name>
                <IconButton
                  type="button"
                  onClick={() => setIsEditing(true)}
                  aria-label={t("profile_edit_name")}
                  title={t("profile_edit_name")}
                >
                  <Pencil size={16} />
                </IconButton>
              </NameRow>
            )}
            <Email>{user.email}</Email>
            <Badges>
              {user.isVerified ? (
                <Badge>
                  <BadgeCheck size={14} aria-hidden />
                  {t("profile_verified")}
                </Badge>
              ) : (
                <Badge $warn>
                  <MailWarning size={14} aria-hidden />
                  {t("profile_not_verified")}
                </Badge>
              )}
              {isAdmin && (
                <Badge>
                  <ShieldCheck size={14} aria-hidden />
                  {t("profile_role_admin")}
                </Badge>
              )}
              {memberSince && (
                <MemberSince>
                  {t("profile_member_since", { date: memberSince })}
                </MemberSince>
              )}
            </Badges>
          </IdentityText>
          <LogoutButton
            type="button"
            $danger
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut size={16} aria-hidden />
            {t("profile_logout")}
          </LogoutButton>
        </Hero>

        <Grid>
          <Column>
            <Card>
              <SectionTitle>
                <CalendarDays size={20} aria-hidden />
                {t("profile_my_bookings")}
              </SectionTitle>
              {bookingsLoading && <SkeletonRows count={2} />}
              {bookingsError && (
                <ErrorText>{t("profile_bookings_error")}</ErrorText>
              )}
              {!bookingsLoading && !bookingsError && bookings.length === 0 && (
                <Muted>{t("profile_no_bookings")}</Muted>
              )}
              <BookingList>
                {bookings.map((booking) => (
                  <BookingItem key={booking.id} booking={booking} />
                ))}
              </BookingList>
            </Card>

            <Card>
              <SectionTitle>
                <Star size={20} aria-hidden />
                {t("profile_my_reviews")}
              </SectionTitle>
              {reviewsLoading && <SkeletonRows count={2} body />}
              {!reviewsLoading && myReviews.length === 0 && (
                <EmptyState>
                  <Muted>{t("profile_no_reviews")}</Muted>
                  <Link to="/reviews">{t("add_review")}</Link>
                </EmptyState>
              )}
              <ReviewList>
                {myReviews.map((review) => (
                  <li key={review.id}>
                    <ReviewHead>
                      <RatingStars value={review.rating} />
                      <Muted>
                        {formatDate(review.createdAt, i18n.language)}
                      </Muted>
                    </ReviewHead>
                    <Comment>{review.comment}</Comment>
                  </li>
                ))}
              </ReviewList>
            </Card>
          </Column>

          <Column>
            <BookCard>
              <BookTitle>{t("profile_book_hint")}</BookTitle>
              <BookButton type="button" onClick={() => startBooking()}>
                <CalendarCheck size={18} aria-hidden />
                {t("bookNow")}
              </BookButton>
            </BookCard>

            {isAdmin && (
              <Card>
                <SectionTitle>
                  <ShieldCheck size={20} aria-hidden />
                  {t("profile_admin_section")}
                </SectionTitle>
                <AdminLinks>
                  {ADMIN_LINKS.map(({ to, key, Icon }) => (
                    <li key={to}>
                      <AdminLink to={to}>
                        <Icon size={18} aria-hidden />
                        <span>{t(key)}</span>
                        <ChevronRight size={18} aria-hidden />
                      </AdminLink>
                    </li>
                  ))}
                </AdminLinks>
              </Card>
            )}
          </Column>
        </Grid>
      </Page>
    </SectionContainer>
  );
};

const ADMIN_LINKS = [
  { to: "/admin/schedule", key: "profile_admin_schedule", Icon: CalendarCheck },
  { to: "/admin/articles", key: "admin_articles", Icon: FileText },
  { to: "/admin/reviews", key: "admin_reviews", Icon: MessageSquare },
];

export default ProfilePage;

/** The profile's own layout in grey, while the signed-in user loads */
const ProfileSkeleton: FC = () => (
  <SectionContainer>
    <SkeletonRegion>
      <Page>
        <Hero>
          <SkeletonBlock $w="88px" $h="88px" $round />
          <SkeletonStack $gap="12px">
            <SkeletonBlock $w="180px" $h="30px" />
            <SkeletonBlock $w="240px" $h="16px" />
            <SkeletonBlock $w="150px" $h="26px" $round />
          </SkeletonStack>
        </Hero>
        <Grid>
          <Column>
            <Card>
              <SkeletonBlock $w="140px" $h="22px" />
              <SkeletonStack $gap="12px" style={{ marginTop: 24 }}>
                <SkeletonBlock $w="70%" $h="16px" />
                <SkeletonBlock $w="50%" $h="16px" />
              </SkeletonStack>
            </Card>
            <Card>
              <SkeletonBlock $w="140px" $h="22px" />
              <SkeletonStack $gap="12px" style={{ marginTop: 24 }}>
                <SkeletonBlock $w="90%" $h="14px" />
                <SkeletonBlock $w="60%" $h="14px" />
              </SkeletonStack>
            </Card>
          </Column>
          <Column>
            <Card>
              <SkeletonStack $gap="16px">
                <SkeletonBlock $w="80%" $h="22px" />
                <SkeletonBlock $w="100%" $h="46px" $round />
              </SkeletonStack>
            </Card>
          </Column>
        </Grid>
      </Page>
    </SkeletonRegion>
  </SectionContainer>
);

/** "2026-12-07" -> "пн, 7 грудня 2026" in the site language; no time zone shift */
const formatDay = (day: string, language: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Intl.DateTimeFormat(language === "en" ? "en-GB" : "uk-UA", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
};

const BookingItem: FC<{ booking: MyBooking }> = ({ booking }) => {
  const [t, i18n] = useTranslation();
  const isPast = booking.day < kyivToday();
  const status =
    isPast && booking.status === "confirmed" ? "done" : booking.status;

  return (
    <BookingRow $muted={isPast || booking.status === "declined"}>
      <BookingWhen>
        <strong>{formatDay(booking.day, i18n.language)}</strong>
        <span>{booking.time}</span>
      </BookingWhen>
      <BookingInfo>
        {booking.service && <span>{booking.service}</span>}
        <StatusBadge $status={status}>
          {t(`profile_booking_${status}`)}
        </StatusBadge>
      </BookingInfo>
    </BookingRow>
  );
};

const IdentityText = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
  flex: 1;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
`;

const IconButton = styled.button<{ theme?: ThemeType }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  color: ${(props) => props.theme.colors.text};
  opacity: 0.7;
  transition:
    opacity 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    opacity: 1;
    color: var(--color-primary);
    background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
  }
`;

const Email = styled.p`
  font-size: var(--text-base);
  opacity: 0.8;
  overflow-wrap: anywhere;
`;

const Badges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
`;

const Badge = styled.span<{ $warn?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
  color: ${(p) => (p.$warn ? "#b7791f" : "var(--color-primary)")};
  background: color-mix(
    in srgb,
    ${(p) => (p.$warn ? "#e9b949" : "var(--color-primary)")} 14%,
    transparent
  );
`;

const Muted = styled.p`
  font-size: var(--text-sm);
  opacity: 0.7;
`;

const NameForm = styled.form<{ theme?: ThemeType }>`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  input {
    width: 100%;
    padding: 12px 16px;
    border-radius: var(--radius-md);
    border: 1.5px solid ${(props) => props.theme.colors.border};
    background: transparent;
    color: ${(props) => props.theme.colors.text};
    font-size: 16px;

    &:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px var(--color-primary-ring);
    }
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
`;

const FormActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
`;

const EmptyState = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);

  a {
    color: var(--color-primary);
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const ReviewList = styled.ul<{ theme?: ThemeType }>`
  display: flex;
  flex-direction: column;

  li {
    padding: var(--space-4) 0;
    border-top: 1px solid ${(props) => props.theme.colors.border};
  }

  li:first-of-type {
    padding-top: 0;
    border-top: none;
  }
`;

const ReviewHead = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
`;

const Comment = styled.p`
  line-height: 1.55;
  white-space: pre-line;
  overflow-wrap: anywhere;
`;

const BookingList = styled.ul<{ theme?: ThemeType }>`
  display: flex;
  flex-direction: column;

  li + li {
    border-top: 1px solid ${(props) => props.theme.colors.border};
  }
`;

const BookingRow = styled.li<{ $muted: boolean }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2) var(--space-4);
  padding: var(--space-3) 0;
  opacity: ${(p) => (p.$muted ? 0.6 : 1)};

  &:first-of-type {
    padding-top: 0;
  }
`;

const BookingWhen = styled.div`
  display: flex;
  align-items: baseline;
  gap: var(--space-3);

  span {
    font-weight: 700;
    color: var(--color-primary);
  }
`;

const BookingInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-sm);
`;

const STATUS_TONE: Record<string, string> = {
  pending: "#b7791f",
  confirmed: "var(--color-primary)",
  declined: "#d64545",
  done: "#808080",
};

const StatusBadge = styled.span<{ $status: string }>`
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-weight: 600;
  white-space: nowrap;
  color: ${(p) => STATUS_TONE[p.$status]};
  background: color-mix(
    in srgb,
    ${(p) => STATUS_TONE[p.$status]} 14%,
    transparent
  );
`;

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  max-width: 1040px;
  margin: 0 auto;
`;

const Hero = styled(Card)`
  display: flex;
  align-items: center;
  gap: var(--space-5);

  @media (max-width: 640px) {
    flex-wrap: wrap;
    gap: var(--space-4);
  }
`;

const LogoutButton = styled(GhostButton)`
  align-self: flex-start;
  margin-left: auto;
  flex-shrink: 0;

  @media (max-width: 640px) {
    order: -1;
    margin-left: auto;
  }
`;

const Name = styled.h1<{ theme?: ThemeType }>`
  font-size: var(--text-2xl);
  font-weight: 800;
  letter-spacing: -0.015em;
  line-height: 1.2;
  color: ${(props) => props.theme.colors.text};
  overflow-wrap: anywhere;
`;

const MemberSince = styled.span`
  align-self: center;
  font-size: var(--text-sm);
  opacity: 0.65;
`;

const Grid = styled.div`
  display: grid;
  gap: var(--space-5);
  align-items: start;

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 1fr) 320px;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  min-width: 0;
`;

const SectionTitle = styled.h2<{ theme?: ThemeType }>`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  font-size: var(--text-lg);
  font-weight: 700;
  color: ${(props) => props.theme.colors.text};

  svg {
    color: var(--color-primary);
  }
`;

const BookCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-primary) 14%, transparent),
    color-mix(in srgb, #6a7bd8 10%, transparent)
  );
`;

const BookTitle = styled.p`
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: 700;
`;

const BookButton = styled(PrimaryButton)`
  justify-content: center;
  width: 100%;
`;

const AdminLinks = styled.ul<{ theme?: ThemeType }>`
  display: flex;
  flex-direction: column;
  margin: 0 calc(-1 * var(--space-3));

  li + li {
    border-top: 1px solid ${(props) => props.theme.colors.border};
  }
`;

const AdminLink = styled(Link)<{ theme?: ThemeType }>`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 48px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-md);
  color: ${(props) => props.theme.colors.text};
  font-weight: 600;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  span {
    flex: 1;
  }

  svg:first-of-type {
    color: var(--color-primary);
  }

  svg:last-of-type {
    opacity: 0.35;
  }

  &:hover {
    color: var(--color-primary);
    background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
  }
`;
