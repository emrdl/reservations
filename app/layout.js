import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Rezervasyon Yönetimi',
  description: 'Restoran rezervasyon ve sipariş yönetim sistemi',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
} 