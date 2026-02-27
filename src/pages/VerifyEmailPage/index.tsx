import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Перевірка підтвердження...");

  useEffect(() => {
    if (!token) return;

    api
      .get(`/api/auth/verify-email/${token}`)
      .then((res) => {
        if (res.data.success) {
          setMessage("✅ Пошта підтверджена! Перенаправлення на головну...");
          navigate("/");
        } else {
          setMessage("❌ Посилання недійсне або прострочене");
        }
      })
      .catch(() => setMessage("❌ Посилання недійсне або прострочене"));
  }, [token, navigate]);

  return (
    <div style={{ textAlign: "center", padding: "50px", fontFamily: "Arial" }}>
      <h1>{message}</h1>
    </div>
  );
};

export default VerifyEmailPage;
