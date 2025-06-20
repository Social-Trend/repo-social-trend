import { Calendar, Search, MessageCircle, User, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import AuthModal from "@/components/auth/auth-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {}

export default function Navigation({}: NavigationProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">SocialTend</h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <Button 
                variant={location === "/" ? "secondary" : "ghost"}
                size="sm"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Home
              </Button>
            </Link>
            <Link href="/professionals">
              <Button 
                variant={location === "/professionals" ? "secondary" : "ghost"}
                size="sm"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <Search className="h-4 w-4 mr-2" />
                Browse Professionals
              </Button>
            </Link>
            <Link href="/messages">
              <Button 
                variant={location === "/messages" ? "secondary" : "ghost"}
                size="sm"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Messages
              </Button>
            </Link>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{user?.firstName || user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <AuthModal>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    Sign up/ Log in
                  </Button>
                </AuthModal>
                <AuthModal defaultTab="register">
                  <Button 
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Become a Tender
                  </Button>
                </AuthModal>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-slate-200 dark:border-slate-700">
              <Link href="/">
                <Button 
                  variant={location === "/" ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Button>
              </Link>
              <Link href="/professionals">
                <Button 
                  variant={location === "/professionals" ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Browse Professionals
                </Button>
              </Link>
              <Link href="/messages">
                <Button 
                  variant={location === "/messages" ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Messages
                </Button>
              </Link>
              
              <div className="pt-4 space-y-2 border-t border-slate-200 dark:border-slate-700">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
                      {user?.firstName || user?.email}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <>
                    <AuthModal>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign up / Log in
                      </Button>
                    </AuthModal>
                    <AuthModal defaultTab="register">
                      <Button 
                        size="sm" 
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Become a Tender
                      </Button>
                    </AuthModal>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
