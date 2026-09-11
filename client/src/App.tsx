/**
 * Field Manual Modernism route map: each public page shares a calm operational shell and an immediate path back to the booking desk.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Router as WouterRouter } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import About from "./pages/About";
import Booking from "./pages/Booking";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Plans from "./pages/Plans";
import Services from "./pages/Services";

const routerBase = import.meta.env.BASE_URL.replace(/\/$/, "");

function AppRoutes() {
  return <Switch><Route path="/" component={Home} /><Route path="/services" component={Services} /><Route path="/book" component={Booking} /><Route path="/plans" component={Plans} /><Route path="/about" component={About} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><WouterRouter base={routerBase}><AppRoutes /></WouterRouter></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
