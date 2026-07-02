import { AppProvider } from "../context/AppContext";
import "./main.css";

export const metadata = {
  title: "SK All Agriculture Parts | Premium Spare Parts",
  description: "Tractor & Rotavator Parts E-Commerce Store",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}


