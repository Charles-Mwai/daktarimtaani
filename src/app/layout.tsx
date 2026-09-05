import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Daktari Mtaani — On-Demand Doctor & Teleconsultation',
  description: 'On-demand doctor dispatch & teleconsultation platform for Kenya. Connect with verified KMPDC doctors instantly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Fraunces:wght@600;700&family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col overflow-x-hidden bg-[#f8faf8] font-sans antialiased text-slate-800">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {children}
        </main>
        <footer className="bg-white border-t border-emerald-100 py-8 mt-12 text-slate-500 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-[11px] font-bold">
                  DM
                </div>
                <span className="font-bold text-slate-800">Daktari Mtaani Platform</span>
                <span className="text-slate-300">|</span>
                <span>KMPDC E-Health Registered Virtual Facility</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-slate-400">
                <span>Data Protection Act 2019 (ODPC Certified)</span>
                <span>•</span>
                <span>Lipa na M-Pesa Integrated</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 text-center sm:text-left text-[11px] text-slate-400">
              <div>
                © {new Date().getFullYear()} Daktari Mtaani Kenya. All rights reserved.
              </div>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                <a href="/doctor/login" className="hover:text-emerald-700 hover:underline">
                  Doctor Login
                </a>
                <span>•</span>
                <a href="/doctor/signup" className="hover:text-emerald-700 hover:underline">
                  Doctor Registration (KMPDC)
                </a>
                <span>•</span>
                <a href="/admin/login" className="hover:text-slate-700 hover:underline">
                  Clinical Ops & Admin
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
