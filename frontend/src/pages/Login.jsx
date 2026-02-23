import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useScrollAnimation from "../hooks/useScrollAnimation";

const Login = () => {
  const formAnim = useScrollAnimation({ threshold: 0.2 });
  const navigate = useNavigate();
  const { login, error, user, isAuthenticated } = useAuth();

  // Rediriger si déjà connecté (persistence de session)
  useEffect(() => {
    if (user && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isAuthenticated, navigate]);

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
    }
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    setErrors({ email: "", password: "" });

    // Handle remember me
    if (formData.rememberMe) {
      localStorage.setItem("rememberedEmail", formData.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      // Redirection vers le dashboard universel
      navigate("/dashboard");
    } catch (err) {
      console.error("Erreur de connexion:", err);

      // Gérer les erreurs de validation Laravel (422)
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        setErrors({
          email: validationErrors.email?.[0] || "",
          password: validationErrors.password?.[0] || "",
        });
      }
      // Gérer les erreurs d'authentification (401)
      else if (err.response?.status === 401) {
        setErrors({
          email: "Email ou mot de passe incorrect",
          password: "",
        });
      }
      // Gérer les autres erreurs
      else {
        setLoginError(
          err.response?.data?.message ||
            "Une erreur est survenue. Veuillez réessayer.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-soft-light opacity-10 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-300 rounded-full mix-blend-soft-light opacity-10 translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 flex flex-col justify-between w-full text-white">
          <div>
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <img
                  src="/car-logo.svg"
                  alt="Elite Drive"
                  className="w-7 h-7"
                />
              </div>
              <span className="text-2xl font-bold">Elite Drive</span>
            </Link>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Bienvenue sur
                <br />
                Elite Drive
              </h1>
              <p className="text-xl text-primary-100 leading-relaxed">
                Louez les meilleurs véhicules premium en Tunisie avec un service
                exceptionnel
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ),
                  text: "Plus de 50 véhicules premium disponibles",
                },
                {
                  icon: (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ),
                  text: "Réservation en ligne rapide et sécurisée",
                },
                {
                  icon: (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ),
                  text: "Assistance client disponible 24/7",
                },
                {
                  icon: (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ),
                  text: "Assurance complète incluse",
                },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                    {feature.icon}
                  </div>
                  <span className="text-primary-50">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-primary-200">
            © 2026 Elite Drive. Tous droits réservés.
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div
          ref={formAnim.ref}
          className={`w-full max-w-md space-y-8 transition-all duration-700 ${formAnim.isVisible ? "animate-fadeIn" : "opacity-0"}`}
        >
          <div className="text-center lg:text-left">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 lg:hidden mb-8"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <img
                  src="/car-logo.svg"
                  alt="Elite Drive"
                  className="w-7 h-7"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Elite Drive
              </span>
            </Link>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Bon retour
            </h2>
            <p className="text-gray-600">
              Connectez-vous pour gérer vos réservations
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100">
            <form className="p-8 space-y-6" onSubmit={handleSubmit}>
              {/* Messages d'erreur */}
              {(loginError || error) && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-red-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-red-700 font-medium">
                      {loginError || error}
                    </p>
                  </div>
                </div>
              )}

              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={`w-full px-5 py-3 rounded-full bg-gray-50 border-2 ${
                    errors.email
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-primary-500"
                  } focus:outline-none focus:bg-white transition-all hover:border-primary-300 peer`}
                  placeholder=" "
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                />
                <label
                  htmlFor="email"
                  className={`absolute left-5 top-3 text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 pointer-events-none ${
                    errors.email
                      ? "text-red-500 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500"
                      : "text-gray-500 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-gray-700"
                  }`}
                >
                  Adresse e-mail
                </label>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-5">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className={`w-full px-5 py-3 pr-12 rounded-full bg-gray-50 border-2 ${
                    errors.password
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-primary-500"
                  } focus:outline-none focus:bg-white transition-all hover:border-primary-300 peer`}
                  placeholder=" "
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-gray-500 hover:text-primary-600 transition-colors"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
                <label
                  htmlFor="password"
                  className={`absolute left-5 top-3 text-sm transition-all duration-300 peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 pointer-events-none ${
                    errors.password
                      ? "text-red-500 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500"
                      : "text-gray-500 peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-gray-700"
                  }`}
                >
                  Mot de passe
                </label>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 ml-5">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) =>
                      setFormData({ ...formData, rememberMe: e.target.checked })
                    }
                    className="h-4 w-4 text-primary-600 focus:outline-none border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Se souvenir de moi
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Mot de passe oublié?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Connexion en cours...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white text-gray-400 font-medium">
                    OU CONTINUER AVEC
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-2.5 bg-white border-2 border-gray-200 rounded-full hover:border-primary-300 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Google
                  </span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-2.5 bg-white border-2 border-gray-200 rounded-full hover:border-primary-300 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Facebook
                  </span>
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-sm text-gray-600">
            Vous n'avez pas de compte?{" "}
            <Link
              to="/register"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Créer un compte
            </Link>
          </p>

          <div className="text-center lg:hidden">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-primary-600 transition-colors inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
