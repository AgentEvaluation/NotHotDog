import './globals.css'
import { Inter } from 'next/font/google'
import { ClerkProvider, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { ThemeProvider } from './providers'
import CustomUserDropdown from "@/components/navigation/CustomUserDropdown";
import SignupHandler from '@/components/authentication/SignupHandler';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { ErrorProvider } from '@/hooks/useErrorContext';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
   <ClerkProvider>
    <SignupHandler />
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ErrorBoundary>
              <ErrorProvider>
              <header className="flex justify-between items-center px-4 py-2 border-b border-border bg-card">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-orange-500">NotHotDog</h1>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider border-l border-muted pl-2">
                    Agent Testing Framework
                  </span>
                </div>

                {/* User Avatar with Custom Dropdown */}
                <div className="flex items-center">
                  <SignedOut>
                    <SignInButton />
                  </SignedOut>
                  <SignedIn>
                    <CustomUserDropdown />
                  </SignedIn>
                </div>
              </header>
                
                <main className="flex min-h-screen flex-col">
                  {children}
                </main>
                <Toaster />
              </ErrorProvider>
            </ErrorBoundary>
          </ThemeProvider>
      </body>
    </html>
  </ClerkProvider>
  );
}