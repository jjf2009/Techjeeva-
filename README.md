# 🚀 TechJeeva - Funding Scheme Discovery Platform

TechJeeva is a modern, AI-powered web platform designed to help startups, entrepreneurs, and innovators discover relevant funding schemes, grants, and government support programs. Built with React and powered by advanced AI, it simplifies the process of finding financial support tailored to your business needs.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.7-646cff?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

## ✨ Features

### 🔍 **Smart Scheme Discovery**
- Browse 100+ funding schemes and grants from various government and private organizations
- Advanced filtering by sector, funding type, and status (open/closed)
- Real-time data synchronization from Google Sheets for up-to-date information
- Sector-based categorization covering 30+ industries (AI, IoT, Healthtech, Fintech, Edtech, etc.)

### 🤖 **AI-Powered Matching**
- **Funding Finder Chatbot**: Describe your startup and get personalized scheme recommendations
- Powered by Google Gemini AI for intelligent matching
- Match score and detailed reasoning for each recommendation
- Example prompts for tech, sustainable, and student startups

### 🎨 **Modern User Experience**
- Responsive design that works seamlessly on mobile, tablet, and desktop
- Beautiful UI built with Radix UI components and Tailwind CSS
- Smooth animations powered by Framer Motion
- Loading states and skeleton screens for optimal UX
- Newsletter subscription alerts for staying updated

### 🛡️ **Protected Routes**
- Secure access to premium features like the AI chatbot and schemes database
- Email-based authentication via EmailJS

### 📊 **Dynamic Data Handling**
- CSV parsing with PapaParse for scheme data
- Debounced search and filter inputs for performance optimization
- Automatic deadline tracking and status updates (Open/Closed)

## 🛠️ Tech Stack

### **Frontend**
- **React 19.0.0** - Modern UI library with latest features
- **React Router DOM 7.5.3** - Client-side routing
- **Vite 6.3.7** - Lightning-fast build tool and dev server

### **Styling & UI**
- **Tailwind CSS 4.1.4** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled component primitives
- **Lucide React** - Beautiful icon library
- **Framer Motion 12.10.5** - Animation library
- **class-variance-authority & clsx** - Dynamic class composition

### **AI & Data Processing**
- **Google Generative AI (Gemini)** - AI-powered scheme recommendations
- **PapaParse** - CSV parsing and data processing

### **Additional Integrations**
- **EmailJS** - Email service for authentication and notifications
- **js-cookie** - Cookie management
- **Embla Carousel** - Touch-friendly carousel

### **Development Tools**
- **ESLint** - Code quality and consistency
- **PostCSS & Autoprefixer** - CSS processing

## 🚦 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jjf2009/Techjeeva-.git
   cd Techjeeva-
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
   ```

   > **Note**: Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey) and EmailJS credentials from [EmailJS Dashboard](https://dashboard.emailjs.com/).

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
# or
yarn build
```

The optimized production build will be generated in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
# or
yarn preview
```

## 📁 Project Structure

```
Techjeeva-/
├── public/                 # Static assets
│   ├── vite.svg
│   └── _redirects         # Vercel/Netlify redirects
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Radix UI components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Loading.jsx
│   │   ├── BotButton.jsx
│   │   ├── SearchBar.jsx
│   │   ├── SigninModal.jsx
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── home/
│   │   │   ├── Home.jsx
│   │   │   ├── MainBanner.jsx
│   │   │   └── Category.jsx
│   │   ├── Schemes/
│   │   │   ├── Schemes.jsx
│   │   │   └── SchemeCard.jsx
│   │   ├── chat/
│   │   │   └── ChatbotPage.jsx
│   │   └── SectorPage.jsx
│   ├── routers/          # Route configuration
│   │   ├── router.jsx
│   │   └── ProtectedRoute.jsx
│   ├── hooks/            # Custom React hooks
│   │   └── useDebounce.js
│   ├── lib/              # Utility functions
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   ├── App.css
│   └── index.css
├── .gitignore
├── components.json        # Shadcn UI config
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json           # Vercel deployment config
└── vite.config.js
```

## 🎯 Usage

### Browsing Schemes

1. **Home Page**: Explore featured categories and search for schemes
2. **Schemes Page**: View all available funding schemes with filtering options
3. **Filter by**:
   - Sector/Category (AI, IoT, Healthtech, etc.)
   - Funding Type (Grant, Loan, Equity, etc.)
   - Status (Open/Closed)

### Using the AI Chatbot

1. Navigate to the **Chat** page from the menu
2. Describe your startup using the boilerplate template or write your own brief
3. Click "Analyze Eligibility" to get AI-powered recommendations
4. Review match scores and reasons for each recommended scheme

### Newsletter Subscription

- Subscribe to receive updates on new schemes and deadlines
- Email notifications powered by EmailJS

## 🔧 Configuration

### Tailwind CSS

The project uses Tailwind CSS v4 with custom configuration. Modify `tailwind.config.js` for theme customization.

### Component Library

UI components are built with Radix UI and styled with Tailwind. Components can be found in `src/components/ui/`.

### Data Source

Schemes data is fetched from a public Google Sheets CSV. Update the `CSV_URL` in `src/pages/Schemes/Schemes.jsx` to point to your own data source.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy!

The `vercel.json` file is already configured for SPA routing.

### Other Platforms

The project can be deployed to any static hosting service:
- Netlify
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powering the intelligent scheme matching
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first styling approach
- **Lucide Icons** for beautiful iconography
- Government and private organizations for providing funding scheme data

## 📧 Contact & Support

- **GitHub**: [@jjf2009](https://github.com/jjf2009)
- **Issues**: [GitHub Issues](https://github.com/jjf2009/Techjeeva-/issues)

---

<div align="center">
  <strong>Built with ❤️ for startups and entrepreneurs</strong>
  <br />
  <sub>Empowering innovation through accessible funding information</sub>
</div>
