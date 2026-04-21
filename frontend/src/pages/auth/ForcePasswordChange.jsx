import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/authService";

const ForcePasswordChange = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user && !user.must_change_password) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Le nouveau mot de passe doit contenir au moins 8 caracteres.";
    }

    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);

    if (!hasLowercase || !hasUppercase || !hasDigit || !hasSpecial) {
      return "Le mot de passe doit contenir minuscule, majuscule, chiffre et caractere special (@$!%*?&).";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("La confirmation du nouveau mot de passe ne correspond pas.");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      await authService.updateProfile({
        current_password: currentPassword,
        new_password: newPassword,
      });

      await refreshUser();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.errors?.new_password?.[0] ||
        err.response?.data?.errors?.current_password?.[0] ||
        err.response?.data?.message ||
        "Impossible de mettre a jour le mot de passe.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-soft-light opacity-10 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-300 rounded-full mix-blend-soft-light opacity-10 translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 flex flex-col justify-between w-full text-white">
          <div>
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                <img src="/logo.png" alt="Elite Drive" className="w-7 h-7" />
              </div>
              <span className="text-2xl font-bold">Elite Drive</span>
            </Link>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Securite
                <br />
                Renforcee
              </h1>
              <p className="text-xl text-primary-100 leading-relaxed">
                Premiere connexion detectee: la mise a jour du mot de passe est
                obligatoire.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                  1
                </div>
                <span className="text-primary-50">
                  Saisissez le mot de passe actuel
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                  2
                </div>
                <span className="text-primary-50">
                  Definissez un nouveau mot de passe fort
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                  3
                </div>
                <span className="text-primary-50">
                  Accedez ensuite a votre dashboard
                </span>
              </div>
            </div>
          </div>

          <div className="text-sm text-primary-200">
            Protection des comptes administratifs et agence.
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 lg:hidden mb-8"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="/logo.png" alt="Elite Drive" className="w-7 h-7" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Elite Drive
              </span>
            </Link>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Changement requis
            </h2>
            <p className="text-gray-600">
              Pour continuer, remplacez votre mot de passe temporaire.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100">
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="relative">
                <label
                  className="mb-2 block text-sm font-medium text-gray-700"
                  htmlFor="current-password"
                >
                  Mot de passe actuel
                </label>
                <input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  className="w-full rounded-full border-2 border-gray-200 bg-gray-50 px-5 py-3 pr-12 outline-none transition-all focus:border-primary-500 focus:bg-white"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-4 top-[42px] text-gray-500 hover:text-primary-600"
                  aria-label="Afficher ou masquer le mot de passe actuel"
                >
                  {showCurrentPassword ? "Masquer" : "Voir"}
                </button>
              </div>

              <div className="relative">
                <label
                  className="mb-2 block text-sm font-medium text-gray-700"
                  htmlFor="new-password"
                >
                  Nouveau mot de passe
                </label>
                <input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  className="w-full rounded-full border-2 border-gray-200 bg-gray-50 px-5 py-3 pr-12 outline-none transition-all focus:border-primary-500 focus:bg-white"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-4 top-[42px] text-gray-500 hover:text-primary-600"
                  aria-label="Afficher ou masquer le nouveau mot de passe"
                >
                  {showNewPassword ? "Masquer" : "Voir"}
                </button>
              </div>

              <div className="relative">
                <label
                  className="mb-2 block text-sm font-medium text-gray-700"
                  htmlFor="confirm-password"
                >
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full rounded-full border-2 border-gray-200 bg-gray-50 px-5 py-3 pr-12 outline-none transition-all focus:border-primary-500 focus:bg-white"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-4 top-[42px] text-gray-500 hover:text-primary-600"
                  aria-label="Afficher ou masquer la confirmation du mot de passe"
                >
                  {showConfirmPassword ? "Masquer" : "Voir"}
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Minimum 8 caracteres, avec majuscule, minuscule et caractere
                special et chiffre.
              </p>

              {error && (
                <div className="rounded-lg border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 transition disabled:opacity-60"
              >
                {loading ? "Mise a jour..." : "Mettre a jour le mot de passe"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForcePasswordChange;
