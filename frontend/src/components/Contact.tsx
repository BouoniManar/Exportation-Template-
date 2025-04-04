import Header from "./Header";
      
const Contact = () => {
    return (

      <div className="bg-gray-900 text-white min-h-screen">
              <Header />
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Contactez-nous
        </h2>
        <p className="text-center text-white mb-8">
          N’hésitez pas à nous contacter pour toute question ou demande d’assistance.
        </p>
  
        <form className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">
          <div className="mb-4" >
            <label className="block text-gray-700 font-semibold mb-2">
              Nom
            </label>
            <input bg-gray-700 
              type="text"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Votre nom"
            />
          </div>
  
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Votre email"
            />
          </div>
  
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Message
            </label>
            <textarea
              rows={4}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Votre message"
            />
          </div>
  
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Envoyer
          </button>
        </form>
      </div>
      </div>
    );
  };
  
  export default Contact;
  