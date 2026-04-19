import { RouterProvider } from "react-router";
import { router } from "./routes";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "sonner";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" />
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}