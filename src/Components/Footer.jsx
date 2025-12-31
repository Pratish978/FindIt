const Footer = () => {
  return (
    <footer className="w-full bg-linear-to-r from-gray-900 to-black text-white px-6 py-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
        
        {/* Brand */}
        <div>
          <h2 className="text-3xl font-bold mb-4">
            Find<span className="text-blue-500">It</span>
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Find It is a campus-focused Lost & Found platform helping students
            reconnect with their belongings quickly and securely.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-3 text-gray-400">
            <li className="hover:text-white transition">Home</li>
            <li className="hover:text-white transition">Lost Items</li>
            <li className="hover:text-white transition">Found Items</li>
            <li className="hover:text-white transition">Contact</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Contact</h3>
          <p className="text-gray-400">support@findit.com</p>
          <p className="text-gray-400 mt-2">College Campus, India</p>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-16 pt-8 text-center text-gray-500">
        © {new Date().getFullYear()} Find It. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
