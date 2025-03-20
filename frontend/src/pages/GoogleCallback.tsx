import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer le code d'authentification depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      // Envoyer le code au backend pour obtenir le token utilisateur
      fetch("http://localhost:8001/auth/google/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.access_token) {
            localStorage.setItem("token", data.access_token);
            navigate("/dashboard"); // Redirige après connexion
          }
        })
        .catch((error) => console.error("Erreur lors de l'authentification :", error));
    }
  }, [navigate]);

  return <h2>Connexion en cours...</h2>;
};

export default GoogleCallback;
