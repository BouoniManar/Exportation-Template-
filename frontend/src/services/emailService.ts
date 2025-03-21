export interface EmailData {
    to_email: string;
    subject: string;
    body: string;
  }
  
  export const sendEmail = async (emailData: EmailData): Promise<void> => {
    try {
      const response = await fetch("http://127.0.0.1:8001/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });
  
      if (!response.ok) {
        throw new Error("Échec de l'envoi de l'email");
      }
  
      alert("✅ Email envoyé avec succès !");
    } catch (error) {
      console.error("❌ Erreur:", error);
      alert("❌ Une erreur est survenue !");
    }
  };
  