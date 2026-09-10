/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  MapPin, Phone, Clock, Coffee, Sparkles, Zap, Cookie, Beer, IceCream, 
  Ticket, Flame, Cigarette, ShoppingCart, CreditCard, ChevronRight, 
  Check, Briefcase, Upload, X, Lock, RefreshCw, FileText, Mail, 
  Star, Trash2, Send, ExternalLink, Menu, AlertCircle, CheckCircle, Info, Filter, Edit3, CheckSquare
} from "lucide-react";
import { STORE_LOCATIONS, REVIEWS } from "./data";
import { StoreLocation, GasPrices, StationPrices, JobApplication } from "./types";
import stopNGoLogo from "./assets/stop_n_go_logo.png";

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Store Locator State
  const [selectedStore, setSelectedStore] = useState<StoreLocation>(STORE_LOCATIONS[0]);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [closestInfo, setClosestInfo] = useState<{ id: string; name: string; distance: number } | null>(null);

  // Job Application Form State
  const [appForm, setAppForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "OH",
    zipCode: "",
    dateAvailable: "",
    desiredPosition: "Cashier (Morning Shift)",
    previousExperience: "",
    resume: null as { name: string; type: string; data: string } | null,
    additionalNotes: "",
    selectedLocation: "Stop N Go Oxford"
  });

  // Current active job opening (currently only 1 active opening at Oxford for Morning Shift)
  const CURRENT_OPENINGS = [
    {
      id: "oxford-morning-cashier",
      title: "Cashier (Morning Shift)",
      storeName: "Stop N Go Oxford",
      storeAddress: "3604 Southpointe Pkwy, Oxford, OH 45056",
      shift: "Morning Shift (5:00 AM start)",
      type: "Part-Time / Full-Time",
      openingsCount: 1,
      status: "Actively Hiring • 1 Immediate Opening",
      description: "Welcome guests, operate checkout registers, brew fresh Shell coffee, replenish morning baked goods & food cases, and deliver friendly customer service for the Oxford and Miami University community."
    }
  ];

  const ALL_POSITIONS = [
    "Cashier (Morning Shift)"
  ];
  const [selectedLocations, setSelectedLocations] = useState<string[]>(["Stop N Go Oxford"]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>(["Cashier (Morning Shift)"]);

  const handleLocationToggle = (locationName: string) => {
    let nextLocations: string[];
    if (selectedLocations.includes(locationName)) {
      if (selectedLocations.length === 1) {
        return; // maintain at least one
      }
      nextLocations = selectedLocations.filter(loc => loc !== locationName);
    } else {
      nextLocations = [...selectedLocations, locationName];
    }
    setSelectedLocations(nextLocations);
    setAppForm(prev => ({
      ...prev,
      selectedLocation: nextLocations.join(", ")
    }));
  };

  const handlePositionToggle = (positionName: string) => {
    let nextPositions: string[];
    if (selectedPositions.includes(positionName)) {
      if (selectedPositions.length === 1) {
        return; // maintain at least one position
      }
      nextPositions = selectedPositions.filter(pos => pos !== positionName);
    } else {
      nextPositions = [...selectedPositions, positionName];
    }
    setSelectedPositions(nextPositions);
    setAppForm(prev => ({
      ...prev,
      desiredPosition: nextPositions.join(", ")
    }));
  };

  const handleSelectAllPositions = () => {
    setSelectedPositions([...ALL_POSITIONS]);
    setAppForm(prev => ({
      ...prev,
      desiredPosition: ALL_POSITIONS.join(", ")
    }));
  };

  const [isSubmittingApp, setIsSubmittingApp] = useState<boolean>(false);
  const [appSubmissionSuccess, setAppSubmissionSuccess] = useState<boolean>(false);
  const [appErrorMessage, setAppErrorMessage] = useState<string>("");
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    storeLocation: "General Inquiry"
  });
  const [contactSubmitting, setContactSubmitting] = useState<boolean>(false);
  const [contactSuccess, setContactSuccess] = useState<boolean>(false);

  // Admin Dashboard State
  const [adminPasscode, setAdminPasscode] = useState<string>("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminApplications, setAdminApplications] = useState<JobApplication[]>([]);
  const [adminLoading, setAdminLoading] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string>("");
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null);

  const navigateToAndScroll = (tabName: string) => {
    setActiveTab(tabName);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Haversine method to define geographic distance in miles between coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3958.8; // Radius of Earth in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findClosestStation = () => {
    setGeoLoading(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your current web browser.");
      setGeoLoading(false);
      return;
    }

    const processPosition = (position: GeolocationPosition) => {
      const uLat = position.coords.latitude;
      const uLng = position.coords.longitude;

      let minDistance = Infinity;
      let closestStore: typeof STORE_LOCATIONS[0] | null = null;

      STORE_LOCATIONS.forEach((store) => {
        if (store.lat && store.lng) {
          const d = calculateDistance(uLat, uLng, store.lat, store.lng);
          if (d < minDistance) {
            minDistance = d;
            closestStore = store;
          }
        }
      });

      if (closestStore) {
        const matchedStore = closestStore as typeof STORE_LOCATIONS[0];
        setSelectedStore(matchedStore);
        setClosestInfo({
          id: matchedStore.id,
          name: matchedStore.name,
          distance: minDistance,
        });
      } else {
        setGeoError("No stores found.");
      }
      setGeoLoading(false);
    };

    const handleFinalError = (err: GeolocationPositionError) => {
      console.error("Geolocation error:", err.message || err.code || "Unknown error");
      let errorMsg = "Unable to retrieve your location. Please select a store manually from the list below.";
      if (err.code === err.PERMISSION_DENIED) {
        errorMsg = "Location access was denied or disabled. Please grant location permissions in your browser or select a store from the list below.";
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        errorMsg = "Location information is currently unavailable. Please select your station from the list below.";
      } else if (err.code === err.TIMEOUT) {
        errorMsg = "Location request timed out. Please try again or select your station manually below.";
      }
      setGeoError(errorMsg);
      setGeoLoading(false);
    };

    navigator.geolocation.getCurrentPosition(
      processPosition,
      (err) => {
        if (err.code !== err.PERMISSION_DENIED) {
          navigator.geolocation.getCurrentPosition(
            processPosition,
            handleFinalError,
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
          );
        } else {
          handleFinalError(err);
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 }
    );
  };

  // Resume File Upload handler
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAppForm(prev => ({
          ...prev,
          resume: {
            name: file.name,
            type: file.type,
            data: reader.result as string
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear Resume Selection
  const clearResume = () => {
    setAppForm(prev => ({ ...prev, resume: null }));
    if (resumeInputRef.current) resumeInputRef.current.value = "";
  };

  // Submit Job Application
  const handleAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingApp(true);
    setAppErrorMessage("");
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appForm)
      });
      const data = await response.json();
      if (data.success) {
        setAppSubmissionSuccess(true);
        // Reset form except location
        setAppForm({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          streetAddress: "",
          city: "",
          state: "OH",
          zipCode: "",
          dateAvailable: "",
          desiredPosition: "Cashier (Morning Shift)",
          previousExperience: "",
          resume: null,
          additionalNotes: "",
          selectedLocation: appForm.selectedLocation || "Stop N Go Oxford"
        });
        setSelectedPositions(["Cashier (Morning Shift)"]);
        setSelectedLocations([appForm.selectedLocation || "Stop N Go Oxford"]);
      } else {
        setAppErrorMessage(data.error || "An error occurred during submission.");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      setAppErrorMessage("Failed to connect to server. Please try again.");
    } finally {
      setIsSubmittingApp(false);
    }
  };

  // Submit Contact Form
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm)
      });
      const data = await res.json();
      if (data.success) {
        setContactSuccess(true);
        setContactForm({
          name: "",
          email: "",
          phone: "",
          message: "",
          storeLocation: "General Inquiry"
        });
        setTimeout(() => setContactSuccess(false), 8000);
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
    } finally {
      setContactSubmitting(false);
    }
  };

  // Admin: Authenticate
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError("");
    try {
      const res = await fetch("/api/applications", {
        headers: { "x-admin-passcode": adminPasscode }
      });
      const data = await res.json();
      if (data.success) {
        setIsAdminAuthenticated(true);
        setAdminApplications(data.applications);
      } else {
        setAdminError(data.error || "Invalid Passcode Code. Access Denied.");
      }
    } catch (error) {
      setAdminError("Unable to verify passcode with the server runtime.");
    } finally {
      setAdminLoading(false);
    }
  };

  const refreshAdminApplications = async () => {
    try {
      const res = await fetch("/api/applications", {
        headers: { "x-admin-passcode": adminPasscode }
      });
      const data = await res.json();
      if (data.success) {
        setAdminApplications(data.applications);
      }
    } catch (e) {
      console.error("Error refreshing applications:", e);
    }
  };

  // Admin Change status
  const updateApplicationStatus = async (appId: string, newStatus: string, notes?: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-passcode": adminPasscode
        },
        body: JSON.stringify({ status: newStatus, adminNotes: notes })
      });
      const data = await res.json();
      if (data.success) {
        refreshAdminApplications();
      }
    } catch (error) {
      alert("Error updating application status.");
    }
  };

  // Admin Delete Application
  const deleteApplication = async (appId: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "DELETE",
        headers: { "x-admin-passcode": adminPasscode }
      });
      const data = await res.json();
      if (data.success) {
        setDeletingAppId(null);
        refreshAdminApplications();
      } else {
        alert(data.error || "Error deleting application.");
      }
    } catch (error) {
      alert("Error deleting application.");
    }
  };

  // Helper for Icon mapping
  const renderIcon = (iconName: string, className = "w-6 h-6 text-yellow-500") => {
    const icons: { [key: string]: React.ReactNode } = {
      Coffee: <Coffee className={className} id={`icon-${iconName}`} />,
      Sparkles: <Sparkles className={className} id={`icon-${iconName}`} />,
      Zap: <Zap className={className} id={`icon-${iconName}`} />,
      Cookie: <Cookie className={className} id={`icon-${iconName}`} />,
      Beer: <Beer className={className} id={`icon-${iconName}`} />,
      IceCream: <IceCream className={className} id={`icon-${iconName}`} />,
      Ticket: <Ticket className={className} id={`icon-${iconName}`} />,
      Flame: <Flame className={className} id={`icon-${iconName}`} />,
      Cigarette: <Cigarette className={className} id={`icon-${iconName}`} />,
      ShoppingCart: <ShoppingCart className={className} id={`icon-${iconName}`} />,
      CreditCard: <CreditCard className={className} id={`icon-${iconName}`} />,
      MapPin: <MapPin className={className} id={`icon-${iconName}`} />
    };
    return icons[iconName] || <Sparkles className={className} />;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-neutral-50 text-neutral-800 selection:bg-red-600 selection:text-white" id="app-root-container">
      
      {/* Top Professional Shell Utility Bar */}
      <div className="bg-neutral-900 text-neutral-300 text-xs py-2 px-4 shadow-inner border-b border-neutral-800" id="utility-nav">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              Ohio Corporate: <a href="tel:5133423331" className="hover:text-white font-semibold underline transition-all">(513) 342-3331</a>
            </span>
            <span className="hidden md:inline-block text-neutral-500">|</span>
            <span className="hidden md:inline-flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Shell Fuel Delivery Route Verified
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-amber-400 text-neutral-900 font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wide">
              SOUTHWEST OHIO REGION
            </span>
            <button 
              onClick={() => navigateToAndScroll("admin")} 
              className={`flex items-center gap-1 hover:text-white transition-all font-semibold ${activeTab === "admin" ? "text-amber-400 underline" : ""}`}
              id="btn-admin-panel"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              Manager Login
            </button>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm" id="main-header">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => navigateToAndScroll("home")} id="logo-branding">
            <div className="h-11 sm:h-12 w-auto flex items-center justify-center rounded-lg overflow-hidden">
              <img
                src={stopNGoLogo}
                alt="Stop N Go Logo"
                className="h-full w-auto max-h-12 object-contain"
                loading="eager"
              />
            </div>
            
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" id="desktop-nav-menu">
            {[
              { id: "home", label: "Home" },
              { id: "locator", label: "Store Locator & Map" },
              { id: "careers", label: "Careers - Join Our Team!", highlight: true },
              { id: "contact", label: "Contact" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => navigateToAndScroll(tab.id)}
                className={`px-4 py-2 rounded-full font-semibold text-[14px] transition-all duration-200 relative ${
                  activeTab === tab.id
                    ? "bg-[#DD1D21] text-white shadow-md shadow-red-600/20"
                    : tab.highlight
                      ? "text-[#DD1D21] hover:text-white bg-red-50 hover:bg-[#DD1D21] border border-red-200 font-black px-5 animate-pulse-subtle"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
                id={`nav-link-${tab.id}`}
              >
                {tab.label}
                {tab.highlight && (
                  <span className="absolute -top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Call to Actions on Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2">
            <button 
              onClick={() => navigateToAndScroll("locator")} 
              className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold py-2.5 px-4 rounded-full transition-all duration-200 flex items-center gap-1.5 shadow"
            >
              <MapPin className="w-3.5 h-3.5 text-[#FFD500]" />
              Find Gas Near Me
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-all"
            id="mobile-menu-toggle"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white" id="mobile-nav-dropdown">
            <div className="px-4 py-3 space-y-1.5 shadow-lg">
              {[
                { id: "home", label: "Home Base" },
                { id: "locator", label: "Find Locations" },
                { id: "careers", label: "Join Our Team (We are Hiring!)", highlight: true },
                { id: "contact", label: "Get In Touch" },
                { id: "admin", label: "Manage Portal LOGIN" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => navigateToAndScroll(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-[#DD1D21] text-white"
                      : tab.highlight
                        ? "bg-amber-100 text-neutral-900 border-2 border-[#FFD500] font-black"
                        : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <div className="pt-2 border-t border-neutral-150 flex flex-col gap-2">
                <a 
                  href="tel:5133423331" 
                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-center py-2.5 rounded-lg text-xs flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-red-600" />
                  Call Support: (513) 342-3331
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* RENDER DYNAMIC PAGES */}
      <main className="flex-grow" id="main-content-layout">

        {/* ==================== HOME TAB ==================== */}
        {activeTab === "home" && (
          <div id="home-view" className="animate-fadeIn">
            
            {/* Hero Section */}
            <section className="relative bg-neutral-900 text-white overflow-hidden py-24 sm:py-32" id="home-hero">
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=1600" 
                  alt="Stop N Go Shell Station Landscape" 
                  className="w-full h-full object-cover opacity-35 filter brightness-75 scale-105 transform translate-y-[-10px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/80 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-red-950/40 via-transparent to-yellow-950/10"></div>
              </div>

              <div className="relative max-w-7xl mx-auto px-4 z-10">
                <div className="max-w-4xl space-y-6">
                  
                  <div className="inline-flex items-center gap-2 bg-[#DD1D21] text-white px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border border-amber-400">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    Shell NITRO+ Fuel Partner
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                    Fuel Your Journey With <span className="text-[#FFD500]">Stop N Go Shell</span>
                  </h1>

                  <p className="text-lg sm:text-xl text-neutral-300 font-medium max-w-2xl">
                    Experience quality Shell Fuel with Nitrogen Enrichment, clean modern facilities, neighborhood convenience, and exceptionally friendly service across Southwest Ohio.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <button 
                      onClick={() => navigateToAndScroll("locator")}
                      className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm px-8 py-4 rounded-full transition-all transform hover:-translate-y-0.5 shadow-md flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4 text-[#FFD500]" />
                      Find a Location
                    </button>
                    <button 
                      onClick={() => navigateToAndScroll("careers")}
                      className="bg-[#FFD500] hover:bg-yellow-400 text-neutral-950 font-black text-sm px-8 py-4 rounded-full transition-all transform hover:-translate-y-0.5 shadow-lg shadow-yellow-500/20 flex items-center gap-2 border-2 border-neutral-900 relative group overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <Briefcase className="w-4 h-4 text-[#DD1D21] animate-bounce" />
                      Apply for a Job (Now Hiring!)
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-6 text-sm text-neutral-400">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 text-lg font-bold">✔</span> 7 Convenient Locations
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 text-lg font-bold">✔</span> Clean Restrooms Guarantee
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 text-lg font-bold">✔</span> Hot Fresh Coffee
                    </div>
                  </div>

                </div>

              </div>
            </section>



            {/* CONVENIENCE STORE IN-HOME SECTION REMOVED */}

            {/* WHY CHOOSE STOP N GO COMPACT GRID */}
            <section className="py-20 bg-[#DD1D21] text-white relative overflow-hidden" id="why-choose-us">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
              
              <div className="relative max-w-7xl mx-auto px-4">
                
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <span className="text-[#FFD500] font-black text-xs uppercase tracking-widest block mb-1">
                    The Stop N Go Guarantee
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    Why Drivers Choose Stop N Go Shell
                  </h2>
                  <p className="text-neutral-100 text-sm mt-3 opacity-90 max-w-xl mx-auto">
                    We combine Shell's world-renowned premium fuel with local, family-owned operational care to bring you the premium drive experience.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {[
                    {
                      label: "Quality Shell Fuel",
                      desc: "Industry-leading regular, midgrade, premium and diesel products containing patented fuel additives to protect your motor blocks.",
                      colorBg: "bg-red-800/40",
                      badge: "Shell v-Power"
                    },
                    {
                      label: "Convenient Locations",
                      desc: "Strategically located throughout West Chester, Mason, Oxford, Loveland, Clifton, and general Greater Cincinnati.",
                      colorBg: "bg-red-800/40",
                      badge: "Southwest Ohio"
                    },
                    {
                      label: "Friendly Service",
                      desc: "We prioritize hiring helpful community neighbors who provide swift, polite, and smiling services every single day.",
                      colorBg: "bg-red-800/40",
                      badge: "Locally Run"
                    },
                    {
                      label: "Clean Facilities",
                      desc: "Step into polished storefront lobbies and absolute pristine, fresh-smelling public restrooms at all times.",
                      colorBg: "bg-red-800/40",
                      badge: "Verified Clean"
                    }
                  ].map((feat, i) => (
                    <div key={i} className={`p-6 rounded-2xl border border-white/10 ${feat.colorBg} flex flex-col justify-between space-y-4 shadow-lg hover:border-white/30 transition-all`}>
                      <div>
                        <span className="bg-[#FFD500] text-neutral-900 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider inline-block mb-3">
                          {feat.badge}
                        </span>
                        <h3 className="font-bold text-lg text-white leading-snug">{feat.label}</h3>
                        <p className="text-xs text-neutral-100 leading-relaxed mt-2 opacity-85">
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  ))}

                </div>

              </div>
            </section>

            {/* REVIEWS INTEGRATION SECTION */}
            <section className="py-16 bg-white border-b border-neutral-200" id="google-reviews-section">
              <div className="max-w-7xl mx-auto px-4">
                
                <div className="grid lg:grid-cols-12 gap-12 items-center">
                  
                  <div className="lg:col-span-4 space-y-4 text-center lg:text-left">
                    <span className="text-[#DD1D21] font-bold text-xs uppercase tracking-widest block">
                      Google Review Sync
                    </span>
                    <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
                      What Southwest Ohio Is Saying
                    </h2>
                    
                    <div className="flex items-center justify-center lg:justify-start gap-1 py-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-6 h-6 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    <div className="text-neutral-600 space-y-1">
                      <p className="text-lg font-bold">4.8 out of 5 Stars Overall</p>
                      <p className="text-xs">Based on over 1,420 regional user reviews</p>
                    </div>

                    <div className="pt-4">
                      <a 
                        href="https://g.page/shell/review" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-block bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all"
                      >
                        Leave a Google Review
                      </a>
                    </div>
                  </div>

                  <div className="lg:col-span-8 grid md:grid-cols-2 gap-6">
                    {REVIEWS.map((rev, i) => (
                      <div key={i} className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 shadow-sm relative">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-neutral-900 text-sm">{rev.author}</h4>
                            <span className="text-[10px] text-neutral-400 block">{rev.relativeTime}</span>
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(rev.rating)].map((_, idx) => (
                              <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-neutral-600 leading-relaxed italic">
                          "{rev.text}"
                        </p>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            </section>

            {/* NEW HIGH-IMPACT HOMEPAGE CAREERS FOCUS SPOTLIGHT */}
            <section className="py-20 bg-neutral-950 text-white relative overflow-hidden" id="careers-home-spotlight">
              <div className="absolute inset-0 opacity-15 mix-blend-overlay">
                <img 
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1200" 
                  alt="Friendly team cashier" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-24 -left-20 w-96 h-96 bg-[#DD1D21]/15 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -right-20 w-96 h-96 bg-[#FFD500]/15 rounded-full blur-3xl"></div>

              <div className="relative max-w-7xl mx-auto px-4">
                <div className="grid lg:grid-cols-12 gap-12 items-center">
                  
                  <div className="lg:col-span-7 space-y-6">
                    <div className="inline-flex items-center gap-2 bg-[#FFD500] text-neutral-950 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                      ⚡ IMMEDIATE OPENINGS AVAILABLE
                    </div>
                    
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                      Start Your Career Journey with <span className="text-[#FFD500]">Stop N Go Shell</span>
                    </h2>
                    
                    <p className="text-sm sm:text-base text-neutral-305 leading-relaxed max-w-2xl">
                      We're not just a gas station—we're a supportive family of over 80+ team members who keep Southwest Ohio moving. Our staff members enjoy highly flexible hours, comprehensive training, clear pathways to promotions, and a supportive, energetic daily environment.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="text-[#FFD500] font-black text-xl sm:text-2xl">Career Growth</div>
                        <div className="text-xs text-neutral-400 mt-1">Clear Promotion Pathways</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="text-[#FFD500] font-black text-xl sm:text-2xl">100% Flexible</div>
                        <div className="text-xs text-neutral-400 mt-1">Ideal for Students & Parents</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors col-span-2 sm:col-span-1">
                        <div className="text-[#FFD500] font-black text-xl sm:text-2xl">Paid Shifts</div>
                        <div className="text-xs text-neutral-400 mt-1">Full Training Provided</div>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                      <button 
                        onClick={() => navigateToAndScroll("careers")}
                        className="bg-[#DD1D21] hover:bg-[#c21418] text-white font-extrabold text-sm px-8 py-4 rounded-full transition-all text-center shadow-lg hover:shadow-red-650/30 flex items-center justify-center gap-2"
                      >
                        <Briefcase className="w-4 h-4 text-[#FFD500]" />
                        Apply Online Now (Takes 2 mins)
                      </button>
                      <button 
                        onClick={() => navigateToAndScroll("contact")}
                        className="bg-white/10 hover:bg-white/15 text-white font-bold text-sm px-6 py-4 rounded-full border border-white/20 transition-all text-center"
                      >
                        Ask Hiring Manager a Question
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-5 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#DD1D21]/20 to-[#FFD500]/20 rounded-3xl transform rotate-3 scale-102"></div>
                    <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                      <h4 className="font-extrabold text-lg text-[#FFD500] flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        Why Apply Today?
                      </h4>
                      <ul className="space-y-4 text-xs text-neutral-300">
                        <li className="flex items-start gap-2">
                          <span className="text-[#FFD500] font-bold mt-0.5">✔</span>
                          <span><strong>Same-Week Interviews:</strong> We respond to initial submissions in under 48 hours.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#FFD500] font-bold mt-0.5">✔</span>
                          <span><strong>Awesome Work Perks:</strong> Store discounts on beverages, tasty snack items, and premium fuel.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#FFD500] font-bold mt-0.5">✔</span>
                          <span><strong>Supportive Culture:</strong> Work close to home under caring managers who support your education and family commitments.</span>
                        </li>
                      </ul>

                      <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-neutral-700 border-2 border-[#FFD505] flex items-center justify-center text-xs font-black text-white">
                            SNG
                          </div>
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-neutral-900 animate-pulse"></span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-none">Careers Division</p>
                          <p className="text-[10px] text-neutral-400 mt-1">Active Hiring Today across Greater Ohio</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>

          </div>
        )}


        {/* ==================== LOCATOR TAB ==================== */}
        {activeTab === "locator" && (
          <div id="locator-view" className="animate-fadeIn max-w-7xl mx-auto px-4 py-10">
            
            <div className="mb-8">
              <span className="text-[#DD1D21] font-bold text-xs uppercase tracking-widest block mb-1">Store Finder</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#DD1D21] tracking-tight">Our Shell Station Locations</h1>
              <p className="text-sm text-neutral-500 mt-1">We operate 7 prime fuel stations with convenience stores across Southwest Ohio. Search and focus coordinates to map.</p>
            </div>

            {/* Grid layout containing left selection and right maps */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Left filter and lists */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Nearest Station Widget */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-xs font-extrabold text-[#DD1D21] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                      Nearest Station Finder
                    </h3>
                    <p className="text-[11px] text-neutral-500 leading-relaxed font-semibold">
                      Click below to share your location. We will calculate the closest Ohio branch from our 7 spots instantly and focus it on the map.
                    </p>
                  </div>

                  {geoError && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold p-3 rounded-xl flex items-start gap-2 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                      <span>{geoError}</span>
                    </div>
                  )}

                  {closestInfo && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-3.5 rounded-xl space-y-1 animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="font-extrabold text-[12px] text-emerald-850">Closest Station Found!</span>
                      </div>
                      <p className="text-[11px] font-semibold text-neutral-600 pl-6">
                        <span className="text-[#DD1D21] font-black">{closestInfo.name}</span> is only <span className="font-black text-neutral-900">{closestInfo.distance.toFixed(1) === "0.0" ? "0.1" : closestInfo.distance.toFixed(1)} miles</span> from you.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={findClosestStation}
                    disabled={geoLoading}
                    className="w-full bg-[#DD1D21] hover:bg-[#c21418] disabled:bg-neutral-200 text-white disabled:text-neutral-400 font-extrabold text-xs py-3 rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
                  >
                    {geoLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        Locating Coordinates...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 text-white" />
                        Find Closest Station near me
                      </>
                    )}
                  </button>
                </div>

                {/* Location Cards */}
                <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2" id="store-list-container">
                  {STORE_LOCATIONS.map((location) => {
                      const isSelected = selectedStore.id === location.id;
                      return (
                        <div 
                          key={location.id}
                          onClick={() => setSelectedStore(location)}
                          className={`bg-white rounded-2xl overflow-hidden border p-5 cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? "border-[#DD1D21] ring-2 ring-red-100" 
                              : "border-neutral-200 hover:border-neutral-300"
                          }`}
                          id={`store-card-${location.id}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-base text-neutral-900">{location.name}</h3>
                              <p className="text-xs text-neutral-500 mt-1 flex items-start gap-1">
                                <MapPin className="w-3.5 h-3.5 text-[#DD1D21] flex-shrink-0 mt-0.5" />
                                {location.address}
                              </p>
                            </div>
                            <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                              Shell Fuel
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mt-4 text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-xl border border-neutral-150">
                            <Phone className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{location.phone}</span>
                          </div>

                          {/* Action links */}
                          <div className="mt-4 pt-3 border-t border-neutral-150 flex justify-between gap-2">
                            <a 
                              href={`tel:${location.phone.replace(/[^0-9]/g, "")}`}
                              className="text-xs font-bold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 py-2 px-4 rounded-lg flex items-center gap-1 transition-all"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Phone className="w-3 h-3 text-red-600" /> Call Store
                            </a>
                            <a 
                              href={location.directionsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-extrabold text-white bg-[#DD1D21] hover:bg-[#c21418] py-2 px-4 rounded-lg flex items-center gap-1 transition-all shadow-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Get Directions <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                        </div>
                      );
                    })}
                </div>

              </div>

              {/* Right Focused map embed details */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-6">
                
                <div className="relative rounded-xl overflow-hidden bg-neutral-200 h-[400px]">
                  {/* Dynamic interactive embed */}
                  <iframe 
                    title={`Google Map for ${selectedStore.name}`}
                    src={selectedStore.googleMapsUrl}
                    className="w-full h-full border-0" 
                    allowFullScreen={true}
                    loading="lazy"
                    id="locator-map-iframe"
                  ></iframe>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-150 pb-5">
                  <div>
                    <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded tracking-widest uppercase">
                      Selected Location
                    </span>
                    <h2 className="text-2xl font-extrabold text-neutral-900 mt-2">{selectedStore.name}</h2>
                    <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4 text-[#DD1D21]" />
                      {selectedStore.address}
                    </p>
                  </div>

                  <a 
                    href={selectedStore.directionsUrl}
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-[#DD1D21] hover:bg-[#c21418] text-white font-bold text-sm py-3 px-6 rounded-xl transition-all shadow-lg shadow-red-600/10 flex items-center gap-2"
                  >
                    Open Google Navigation Link <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Extended Details */}
                <div className="max-w-2xl">
                  
                  {/* Contact */}
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm uppercase text-neutral-400 tracking-wider">Contact Details</h4>
                    <div className="space-y-3 bg-neutral-50 p-4 rounded-xl border border-neutral-150 text-xs">
                      <div className="flex justify-between">
                        <span className="font-semibold text-neutral-500">Store Direct Line</span>
                        <a href={`tel:${selectedStore.phone}`} className="text-[#DD1D21] font-bold hover:underline">{selectedStore.phone}</a>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                      {selectedStore.id === "oxford" ? (
                        <>
                          <span className="inline-block bg-emerald-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded mr-1.5">Actively Hiring</span>
                          This Oxford location has <strong>1 immediate opening</strong> for <strong>Cashier (Morning Shift)</strong>! Apply in the <button type="button" onClick={() => { setSelectedStore(null); navigateToAndScroll("careers"); }} className="underline font-bold text-[#DD1D21] cursor-pointer">Careers</button> tab.
                        </>
                      ) : (
                        <>
                          <strong>Staffing Notice:</strong> This store is currently fully staffed. We currently have <strong>1 active opening</strong> for <strong>Cashier (Morning Shift)</strong> at our <strong>Oxford location</strong>. View details in the <button type="button" onClick={() => { setSelectedStore(null); navigateToAndScroll("careers"); }} className="underline font-bold text-[#DD1D21] cursor-pointer">Careers</button> tab.
                        </>
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}


        {/* ==================== IN-STORE TAB REMOVED ==================== */}


        {/* ==================== CAREERS TAB ==================== */}
        {activeTab === "careers" && (
          <div id="careers-view" className="animate-fadeIn max-w-7xl mx-auto px-4 py-10">
            
            {/* Careers Hero */}
            <div className="bg-neutral-900 text-white rounded-3xl overflow-hidden py-16 px-6 sm:px-12 relative shadow-xl mb-12" id="careers-hero-section">
              <div className="absolute inset-0 opacity-25">
                <img 
                  src="https://images.unsplash.com/photo-1542838132-92cb53300491?auto=format&fit=crop&w=1200" 
                  alt="Store retail team" 
                  className="w-full h-full object-cover brightness-50"
                />
              </div>
              <div className="relative z-10 max-w-2xl text-left space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#FFD500] text-neutral-900 font-extrabold text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#DD1D21] animate-pulse"></span>
                  Current Opening: Stop N Go Oxford — Morning Shift (1 Position)
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  Join The Stop N Go Team
                </h1>
                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                  We are currently actively hiring for our <strong>Stop N Go Oxford</strong> location for the <strong>Morning Shift</strong>. Apply directly below for immediate interview consideration.
                </p>
                <div className="flex flex-wrap gap-3 pt-2 text-xs font-bold text-neutral-200">
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">📍 Stop N Go Oxford (Near Miami University)</span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">⏰ Morning Shift (6:00 AM start)</span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">💵 Competitive Pay & Shell Discounts</span>
                </div>
              </div>
            </div>

            {/* Split layout: Benefits summary vs Application Form */}
            <div className="grid lg:grid-cols-12 gap-12 items-start" id="employment-form-container">
              
              {/* Left benefits and guide */}
              <div className="lg:col-span-4 space-y-6">
                
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-lg text-neutral-900">Current Openings</h3>
                    <span className="bg-red-100 text-[#DD1D21] font-black text-[10px] px-2.5 py-0.5 rounded-full border border-red-200">
                      1 Position Active
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    We are currently only hiring for our <strong>Stop N Go Oxford</strong> location for the <strong>morning shift</strong>. All other locations and shifts are currently at full capacity.
                  </p>
                  
                  {/* Single Active Opening Card */}
                  <div className="border-2 border-[#DD1D21] bg-red-50/25 rounded-xl p-4 space-y-3 relative shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md mb-1.5 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Actively Hiring Now
                        </div>
                        <h4 className="font-black text-sm text-neutral-900 leading-tight">
                          Cashier (Morning Shift)
                        </h4>
                        <p className="text-xs font-bold text-[#DD1D21] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          Stop N Go Oxford
                        </p>
                      </div>
                      <span className="bg-[#DD1D21] text-white text-[10px] font-extrabold px-2 py-0.5 rounded">
                        1 Opening
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-neutral-600 bg-white/90 p-2.5 rounded-lg border border-neutral-150">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                        <span><strong>Shift:</strong> Morning Shift (6:00 AM start)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                        <span className="truncate">3604 Southpointe Pkwy, Oxford, OH</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                        <span>Part-Time or Full-Time available</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-600 leading-relaxed">
                      Operate registers, brew fresh morning coffee, stock breakfast and bakery goods, and provide friendly service for Oxford and Miami University patrons.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPositions(["Cashier (Morning Shift)"]);
                        setSelectedLocations(["Stop N Go Oxford"]);
                        setAppForm(prev => ({
                          ...prev,
                          desiredPosition: "Cashier (Morning Shift)",
                          selectedLocation: "Stop N Go Oxford"
                        }));
                        const formEl = document.getElementById("employment-form-container");
                        if (formEl) formEl.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="w-full bg-[#DD1D21] hover:bg-red-700 text-white font-extrabold text-xs py-2.5 px-3 rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      Selected for Application
                    </button>
                  </div>

                  {/* Other Stores Status Box */}
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 text-[11px] text-neutral-500 space-y-1">
                    <p className="font-bold text-neutral-700 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      Other Stores Status:
                    </p>
                    <p>West Chester, Mason, Clifton, and Loveland locations are currently fully staffed. Check back for future openings.</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl space-y-3">
                  <h4 className="font-extrabold text-amber-900 text-sm flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-700" />
                    Interview Process Guide
                  </h4>
                  <ol className="text-xs text-amber-900/85 space-y-2 list-decimal pl-4">
                    <li>Submit the digital application on the right.</li>
                    <li>Submissions sync to our secure backend database instantly.</li>
                    <li>Branch store managers review credentials and resume files.</li>
                    <li>Selected candidates will be invited for an in-store interview within 3 days.</li>
                  </ol>
                </div>

              </div>

              {/* Right Application Form */}
              <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-neutral-150">
                  <div>
                    <h3 className="text-xl font-extrabold text-neutral-900">
                      Employment Interest Application Form
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Current Active Opening: <strong className="text-neutral-900">Stop N Go Oxford — Cashier (Morning Shift)</strong>
                    </p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    1 Position Active
                  </span>
                </div>

                {appSubmissionSuccess ? (
                  <div className="text-center py-10 space-y-4" id="success-app-banner">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <h4 className="font-extrabold text-2xl text-emerald-800">Application Submitted!</h4>
                    <p className="text-sm text-neutral-600 max-w-md mx-auto">
                      Thank you for applying. Your application was securely stored and forwarded to the local hiring manager at our <strong>{appForm.selectedLocation}</strong> office. Rerouting to <strong>careers@stopngoshell.com</strong> for digital backups.
                    </p>
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 max-w-sm mx-auto text-xs text-left text-neutral-500">
                      <strong>Next Steps:</strong> Check your inbox for confirmation. Our local regional lead will reach out via phone if your background is a match.
                    </div>
                    <button 
                      onClick={() => {
                        setAppSubmissionSuccess(false);
                        setAppErrorMessage("");
                      }}
                      className="bg-[#DD1D21] hover:bg-[#c21418] text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-all"
                    >
                      Fill Another Application
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAppSubmit} className="space-y-6">
                    
                    {appErrorMessage && (
                      <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{appErrorMessage}</span>
                      </div>
                    )}

                    {/* Section 1: Name and selection */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">First Name *</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#DD1D21]/30 focus:border-[#DD1D21]"
                          value={appForm.firstName}
                          onChange={(e) => setAppForm({...appForm, firstName: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Last Name *</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#DD1D21]/30 focus:border-[#DD1D21]"
                          value={appForm.lastName}
                          onChange={(e) => setAppForm({...appForm, lastName: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Email Address *</label>
                        <input 
                          type="email" 
                          required
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#DD1D21]/30 focus:border-[#DD1D21]"
                          value={appForm.email}
                          onChange={(e) => setAppForm({...appForm, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Phone Number *</label>
                        <input 
                          type="tel" 
                          required
                          placeholder="(513) 555-0199"
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#DD1D21]/30 focus:border-[#DD1D21]"
                          value={appForm.phone}
                          onChange={(e) => setAppForm({...appForm, phone: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Physical Address */}
                    <div className="space-y-4 pt-2 border-t border-neutral-100">
                      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Physical Address</h4>
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-600 mb-1">Street Address</label>
                        <input 
                          type="text" 
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-sm"
                          placeholder="e.g. 123 Main St"
                          value={appForm.streetAddress}
                          onChange={(e) => setAppForm({...appForm, streetAddress: e.target.value})}
                        />
                      </div>

                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-5">
                          <label className="block text-[11px] font-bold text-neutral-600 mb-1">City</label>
                          <input 
                            type="text" 
                            className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-sm"
                            value={appForm.city}
                            onChange={(e) => setAppForm({...appForm, city: e.target.value})}
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[11px] font-bold text-neutral-600 mb-1">State</label>
                          <input 
                            type="text" 
                            className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-sm"
                            value={appForm.state}
                            onChange={(e) => setAppForm({...appForm, state: e.target.value})}
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="block text-[11px] font-bold text-neutral-600 mb-1">ZIP Code</label>
                          <input 
                            type="text" 
                            className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-sm"
                            placeholder="45040"
                            value={appForm.zipCode}
                            onChange={(e) => setAppForm({...appForm, zipCode: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Current Openings / Desired Position */}
                    <div className="space-y-4 pt-4 border-t border-neutral-100">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <label className="block text-xs font-bold text-neutral-700 uppercase">
                            Current Opening Applying For *
                          </label>
                          <span className="text-xs font-bold text-[#DD1D21] bg-red-50 border border-red-200 px-2 py-0.5 rounded-md flex items-center gap-1 self-start sm:self-auto">
                            1 Active Opening
                          </span>
                        </div>

                        {/* Single active opening selection */}
                        <div
                          id="position-select-option-oxford-morning"
                          onClick={() => {
                            setSelectedPositions(["Cashier (Morning Shift)"]);
                            setSelectedLocations(["Stop N Go Oxford"]);
                            setAppForm(prev => ({
                              ...prev,
                              desiredPosition: "Cashier (Morning Shift)",
                              selectedLocation: "Stop N Go Oxford"
                            }));
                          }}
                          className="border-2 border-[#DD1D21] bg-red-50/40 rounded-xl p-4 flex items-start gap-3.5 cursor-pointer select-none ring-1 ring-[#DD1D21]/30 shadow-xs transition-all"
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            <div className="w-5 h-5 rounded-md bg-[#DD1D21] border border-[#DD1D21] text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-extrabold text-neutral-900">Cashier (Morning Shift)</span>
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                                Immediate Opening
                              </span>
                              <span className="bg-[#DD1D21] text-white text-[10px] font-black px-2 py-0.5 rounded">
                                Oxford Store Only
                              </span>
                            </div>
                            <p className="text-xs text-neutral-700 mt-1.5 leading-relaxed">
                              <strong>Shift:</strong> Morning Shift (6:00 AM start) • <strong>Store:</strong> Stop N Go Oxford (3604 Southpointe Pkwy)
                            </p>
                            <p className="text-[11px] text-neutral-500 mt-1">
                              Currently our only active opening. We are hiring exclusively for the Oxford morning shift. All other store locations and shifts are currently at full capacity.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="max-w-xs">
                        <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Date Available *</label>
                        <input 
                          type="date" 
                          required
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-sm font-semibold"
                          value={appForm.dateAvailable}
                          onChange={(e) => setAppForm({...appForm, dateAvailable: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-neutral-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <label className="block text-xs font-bold text-neutral-700 uppercase">
                          Store Location *
                        </label>
                        <span className="text-[11px] font-semibold text-neutral-500">
                          Active Hiring: <span className="text-[#DD1D21] font-bold">Stop N Go Oxford</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" id="locations-multiselect-container">
                        {STORE_LOCATIONS.map((loc) => {
                          const isOxford = loc.id === "oxford";
                          const isSelected = selectedLocations.includes(loc.name);
                          return (
                            <div
                              key={loc.id}
                              onClick={() => {
                                if (isOxford) {
                                  setSelectedLocations([loc.name]);
                                  setAppForm(prev => ({ ...prev, selectedLocation: loc.name }));
                                } else {
                                  handleLocationToggle(loc.name);
                                }
                              }}
                              id={`location-select-option-${loc.id}`}
                              className={`group relative border rounded-xl p-3 flex items-start gap-3 cursor-pointer select-none transition-all duration-200 ${
                                isOxford
                                  ? "bg-red-50/50 border-[#DD1D21] ring-2 ring-[#DD1D21]/30 shadow-xs"
                                  : isSelected
                                  ? "bg-neutral-50 border-neutral-400 opacity-90 shadow-xs"
                                  : "bg-white border-neutral-200 opacity-60 hover:opacity-90 hover:border-neutral-300 shadow-xs"
                              }`}
                            >
                              <div className="mt-0.5 flex-shrink-0">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                  isSelected 
                                    ? "bg-[#DD1D21] border-[#DD1D21] text-white" 
                                    : "bg-white border-neutral-300 group-hover:border-neutral-400"
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0 pr-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p className="font-extrabold text-[12px] text-neutral-900 group-hover:text-[#DD1D21] transition-colors leading-snug">
                                    {loc.name}
                                  </p>
                                  {isOxford ? (
                                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-300">
                                      Hiring (1 Opening)
                                    </span>
                                  ) : (
                                    <span className="bg-neutral-100 text-neutral-500 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                      Fully Staffed
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-neutral-500 mt-1 flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5 text-neutral-400 flex-shrink-0" />
                                  <span className="truncate">{loc.address.split(",")[0]}</span>
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-2 font-semibold">
                        Selected Location: <span className="text-[#DD1D21] font-extrabold">{selectedLocations.join(", ")}</span>
                        {!selectedLocations.includes("Stop N Go Oxford") && (
                          <span className="text-amber-700 ml-2 font-medium">⚠️ Note: We are currently only hiring for our Oxford store.</span>
                        )}
                      </p>
                    </div>

                    {/* Previous Experience */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Previous Job Experience summary</label>
                      <textarea 
                        rows={3}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-sm"
                        placeholder="Detail last jobs held, durations, or relevant convenience store tasks..."
                        value={appForm.previousExperience}
                        onChange={(e) => setAppForm({...appForm, previousExperience: e.target.value})}
                      />
                    </div>

                    {/* Resume Upload Drag/Drop mimicking */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Attach Resume Profile *</label>
                      
                      {appForm.resume ? (
                        <div className="flex items-center justify-between bg-neutral-50 p-3.5 rounded-lg border border-emerald-300">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-emerald-600" />
                            <div className="text-xs">
                              <span className="font-bold text-neutral-850 block">{appForm.resume.name}</span>
                              <span className="text-neutral-400">Successfully locked & ready</span>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={clearResume}
                            className="bg-red-50 text-red-600 hover:bg-red-100 p-1.5 rounded-lg transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => resumeInputRef.current?.click()}
                          className="border-2 border-dashed border-neutral-300 hover:border-[#DD1D21] rounded-xl p-6 text-center cursor-pointer bg-neutral-50/50 hover:bg-neutral-50 transition-all flex flex-col items-center justify-center space-y-2"
                        >
                          <Upload className="w-8 h-8 text-neutral-400" />
                          <span className="text-xs font-bold text-neutral-700">Click to upload or Drag & Drop Resume</span>
                          <span className="text-[10px] text-neutral-400">PDF, DOCX, DOC, or TXT up to 5MB</span>
                        </div>
                      )}

                      <input 
                        type="file" 
                        ref={resumeInputRef}
                        accept=".pdf,.docx,.doc,.txt"
                        className="hidden"
                        onChange={handleResumeChange}
                      />
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Additional Candidate Notes</label>
                      <textarea 
                        rows={2}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-sm"
                        placeholder="Any custom remarks, references, or shifts preference?"
                        value={appForm.additionalNotes}
                        onChange={(e) => setAppForm({...appForm, additionalNotes: e.target.value})}
                      />
                    </div>

                    <div className="text-[11px] text-neutral-400 italic">
                      *By submitting, you authorize Stop N Go Shell hiring partners to perform standard background validation. Codebase sends automated notifications to our hiring division.
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmittingApp}
                      className="w-full bg-[#DD1D21] hover:bg-[#c21418] text-white font-extrabold text-sm py-4 rounded-xl transition-all shadow-lg shadow-red-650/15 flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isSubmittingApp ? "Sending to database..." : "Submit Official Job Application"}
                    </button>

                  </form>
                )}

              </div>

            </div>

          </div>
        )}


        {/* ==================== CONTACT TAB ==================== */}
        {activeTab === "contact" && (
          <div id="contact-view" className="animate-fadeIn max-w-7xl mx-auto px-4 py-10">
            
            <div className="mb-10 text-center max-w-3xl mx-auto">
              <span className="text-[#DD1D21] font-bold text-xs uppercase tracking-widest block mb-1">Get In Touch</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#DD1D21] tracking-tight">Connect With Our Corporate Management</h1>
              <p className="text-sm text-neutral-500 mt-2">Have inquiries, retail site proposals, event requests, or feedback? Drop our team a comment.</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-12 items-start">
              
              {/* Left Contact Fields */}
              <div className="lg:col-span-4 space-y-6">
                
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-lg text-neutral-900">Direct Corporate Touchpoints</h3>
                  
                  <div className="space-y-4 text-xs">
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <div>
                        <span className="font-bold block text-neutral-800">Phone Contact Line</span>
                        <a href="tel:5133423331" className="text-neutral-500 hover:underline">(513) 342-3331</a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <div>
                        <span className="font-bold block text-neutral-800">Careers & HR Division</span>
                        <a href="mailto:careers@stopngoshell.com" className="text-neutral-500 hover:underline">careers@stopngoshell.com</a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <div>
                        <span className="font-bold block text-neutral-800">Administrative Office Headquarters</span>
                        <span className="text-neutral-550 block">West Chester Township, Butler County, OH</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-100 p-5 rounded-2xl border border-amber-250 text-xs text-amber-900 space-y-1">
                  <strong>Looking to coordinate school sponsorships?</strong>
                  <p className="opacity-95 leading-relaxed">Please provide school department, location, and details. Reach our management team via this form.</p>
                </div>

              </div>

              {/* Right Message Form */}
              <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-sm">
                <h3 className="text-lg font-bold text-neutral-900 mb-6">Send Regional Feedback</h3>
                
                {contactSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-6 rounded-2xl space-y-2 text-center">
                    <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h4 className="font-bold text-lg">Thank You for Reaching Out!</h4>
                    <p className="text-xs">Your message was recorded securely on our backend. A Southwest Ohio regional manager will review it and reply within 24-48 business hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Your Name *</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-sm"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Your Email Address *</label>
                        <input 
                          type="email" 
                          required
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-sm"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Your Phone Number</label>
                        <input 
                          type="tel" 
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-sm"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Relate Message To Store *</label>
                        <select 
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-sm"
                          value={contactForm.storeLocation}
                          onChange={(e) => setContactForm({...contactForm, storeLocation: e.target.value})}
                        >
                          <option value="General Inquiry">General Corporate Office</option>
                          {STORE_LOCATIONS.map((loc) => (
                            <option key={loc.id} value={loc.name}>{loc.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Message Content *</label>
                      <textarea 
                        rows={4} 
                        required
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-2.5 text-sm"
                        placeholder="Detail your question, inquiry, or experience..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={contactSubmitting}
                      className="bg-neutral-905 bg-neutral-900 border border-transparent hover:bg-neutral-800 text-white font-bold text-sm py-3 px-8 rounded-xl transition-all shadow disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4 text-amber-400" />
                      {contactSubmitting ? "Sending message..." : "Submit Message Request"}
                    </button>

                  </form>
                )}

              </div>

            </div>

          </div>
        )}


        {/* ==================== ADMIN TAB ==================== */}
        {activeTab === "admin" && (
          <div id="admin-view" className="animate-fadeIn max-w-7xl mx-auto px-4 py-10">
            
            {/* Authenticated Check */}
            {!isAdminAuthenticated ? (
              <div className="max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-xl space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl font-black text-neutral-900">Stop N Go Operations</h1>
                  <p className="text-xs text-neutral-500">Authorized personnel only. Credentials verify securely with sandbox environmental keys.</p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {adminError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>{adminError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Enter Master Passcode Code *</label>
                    <input 
                      type="password"
                      required
                      placeholder="e.g. admin123"
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-center font-mono text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-[#DD1D21]/30 focus:border-[#DD1D21]"
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                    />
                    <span className="text-[10px] text-neutral-400 mt-1 block italic text-center">
                      *Default fallback passcode is "admin123" as configured in .env.example
                    </span>
                  </div>

                  <button 
                    type="submit"
                    disabled={adminLoading}
                    className="w-full bg-[#DD1D21] hover:bg-[#c21418] text-white font-extrabold text-sm py-3.5 rounded-xl transition-all shadow disabled:opacity-50"
                  >
                    {adminLoading ? "Unlocking portal..." : "Login to Manager Portals"}
                  </button>
                </form>
              </div>
            ) : (
              // Authenticated Dashboard Layout
              <div className="space-y-8 animate-fadeIn" id="admin-authenticated-dashboard">
                
                {/* Dashboard top header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm gap-4">
                  <div>
                    <span className="text-[#DD1D21] font-bold text-xs uppercase tracking-widest block mb-1">
                      Stop N Go Shell Admin Command Center
                    </span>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Management Operations Portal</h1>
                    <p className="text-xs text-neutral-500 mt-0.5">Review digital resume streams and schedule candidate interviews securely.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        setIsAdminAuthenticated(false);
                        setAdminPasscode("");
                      }}
                      className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs py-2 px-4 rounded-lg transition-all"
                    >
                      Logout Portal
                    </button>
                    <button 
                      onClick={() => refreshAdminApplications()}
                      className="bg-neutral-900 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1 hover:bg-neutral-800 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Sync Data
                    </button>
                  </div>
                </div>

                {/* APPLICATIONS LIST */}
                <div className="space-y-6">
                    
                    {adminApplications.length === 0 ? (
                      <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center text-neutral-500 space-y-2">
                        <FileText className="w-12 h-12 text-neutral-300 mx-auto" />
                        <h3 className="font-bold text-lg text-neutral-800">No Applications Submitted</h3>
                        <p className="text-xs">Incoming employment applications submitted in theCareers tab populate and persist instantly.</p>
                      </div>
                    ) : (
                      <div className="grid gap-6">
                        {adminApplications.map((app) => (
                          <div key={app.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                            
                            {/* Color Header status */}
                            <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-150 flex flex-wrap justify-between items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="bg-[#DD1D21] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                                  {app.selectedLocation}
                                </span>
                                <span className="text-neutral-450">&gt;</span>
                                <span className="font-bold text-sm text-neutral-800">{app.desiredPosition}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-neutral-400">Created: {new Date(app.createdAt).toLocaleString()}</span>
                                <select 
                                  className="bg-white border border-neutral-300 rounded text-xs p-1 font-bold focus:outline-none"
                                  value={app.status}
                                  onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Reviewed">Reviewed</option>
                                  <option value="Interview Scheduled">Interview Scheduled</option>
                                  <option value="Hired">Hired</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                              </div>
                            </div>

                            {/* Content split */}
                            <div className="p-6 grid md:grid-cols-12 gap-8">
                              
                              {/* Left Bio Details */}
                              <div className="md:col-span-4 space-y-3 border-r border-neutral-200/50 pr-4">
                                <h3 className="font-bold text-lg text-neutral-900">{app.firstName} {app.lastName}</h3>
                                <div className="space-y-1.5 text-xs text-neutral-600">
                                  <p><strong>Email:</strong> <a href={`mailto:${app.email}`} className="text-blue-600 hover:underline">{app.email}</a></p>
                                  <p><strong>Phone:</strong> <a href={`tel:${app.phone}`} className="text-blue-600 hover:underline">{app.phone}</a></p>
                                  <p><strong>Available Date:</strong> <span className="text-neutral-900 font-semibold">{app.dateAvailable}</span></p>
                                  <p><strong>City/ZIP:</strong> {app.city || "N/A"}, {app.zipCode || "N/A"}</p>
                                  <p><strong>Street Address:</strong> {app.streetAddress || "N/A"}</p>
                                </div>

                                <div className="pt-4 border-t border-neutral-100 flex items-center gap-2">
                                  {app.resume ? (
                                    <a 
                                      href={app.resume.data} 
                                      download={app.resume.name} 
                                      className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 px-3 rounded flex items-center justify-center gap-1.5 transition-all text-center"
                                    >
                                      <FileText className="w-3.5 h-3.5" /> Download Resume
                                    </a>
                                  ) : (
                                    <span className="text-xs text-neutral-400 italic block py-1">No file attached.</span>
                                  )}
                                  
                                  {deletingAppId === app.id ? (
                                    <div className="flex items-center gap-1 bg-red-55/75 bg-red-50 border border-red-200 p-1 rounded animate-fadeIn">
                                      <span className="text-[10px] text-red-700 font-extrabold px-1.5">Delete?</span>
                                      <button
                                        onClick={() => deleteApplication(app.id)}
                                        className="bg-[#DD1D21] hover:bg-[#c21418] text-white font-bold text-[9px] px-2 py-1 rounded transition-colors"
                                      >
                                        Yes
                                      </button>
                                      <button
                                        onClick={() => setDeletingAppId(null)}
                                        className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold text-[9px] px-2 py-1 rounded transition-colors"
                                      >
                                        No
                                      </button>
                                    </div>
                                  ) : (
                                    <button 
                                      onClick={() => setDeletingAppId(app.id)}
                                      className="p-2 border border-red-200 hover:bg-red-50 text-red-600 rounded transition-all"
                                      title="Delete Candidate Record"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Right Experience Narratives & Custom Notes */}
                              <div className="md:col-span-8 space-y-4">
                                <div>
                                  <h4 className="font-extrabold text-xs text-neutral-405 uppercase tracking-wider mb-1">Previous Experience Summary</h4>
                                  <p className="bg-neutral-50 p-3 rounded-lg text-xs leading-relaxed text-neutral-700 border border-neutral-150 whitespace-pre-wrap">
                                    {app.previousExperience || "Candidate did not list any previous experience."}
                                  </p>
                                </div>

                                {app.additionalNotes && (
                                  <div>
                                    <h4 className="font-extrabold text-xs text-neutral-405 uppercase tracking-wider mb-1">Applicant Remarks</h4>
                                    <p className="text-xs text-neutral-600 italic">
                                      "{app.additionalNotes}"
                                    </p>
                                  </div>
                                )}

                                {/* Admin commenting panel */}
                                <div className="pt-2 border-t border-neutral-100">
                                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Internal Manager Notes (Private)</label>
                                  <div className="flex gap-2">
                                    <input 
                                      type="text" 
                                      className="w-full bg-neutral-55 border border-neutral-300 rounded text-xs p-2 focus:outline-none"
                                      placeholder="Write internal hiring review, background checkpoints, interview times..."
                                      defaultValue={app.adminNotes}
                                      onBlur={(e) => updateApplicationStatus(app.id, app.status, e.target.value)}
                                    />
                                    <button 
                                      onClick={() => alert("Note validated! Auto-saved on blur.")}
                                      className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-[10px] px-3 rounded flex items-center justify-center transition-all"
                                    >
                                      Save Note
                                    </button>
                                  </div>
                                </div>

                              </div>

                            </div>

                          </div>
                        ))}
                      </div>
                    )}

                  </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800" id="main-footer">
        
        {/* Upper pre-footer directory layout */}
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 mb-1">
              <img
                src={stopNGoLogo}
                alt="Stop N Go Logo"
                className="h-9 w-auto object-contain rounded"
                loading="lazy"
              />
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-lg font-black text-white">Stop N Go</span>
                <span className="bg-[#FFD500] text-neutral-950 font-extrabold text-[9px] px-1.5 py-0.5 rounded">OHIO</span>
              </div>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Southwest Ohio's favorite retailer of high-performance Shell Nitrogen-Enriched fuels, cold beverages, and freshly made kitchen items. Family run and operated in West Chester since 1994.
            </p>
            <div className="flex gap-2.5 pt-1">
              <span className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-amber-400 font-bold text-xs" title="Shelby Additives">S</span>
              <span className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-amber-400 font-bold text-xs" title="Ohio Certified">O</span>
              <span className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-amber-400 font-bold text-xs" title="NITRO+ Premium Service">N</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Quick Directory</h4>
            <div className="flex flex-col gap-1.5 text-xs">
              <button onClick={() => navigateToAndScroll("home")} className="text-left text-neutral-400 hover:text-[#FFD500] transition-colors">Home Base</button>
              <button onClick={() => navigateToAndScroll("locator")} className="text-left text-neutral-400 hover:text-[#FFD500] transition-colors">Store Finder Locator</button>
              <button onClick={() => navigateToAndScroll("careers")} className="text-left text-neutral-400 hover:text-[#FFD500] transition-colors">Hiring & Careers</button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Regional Stores</h4>
            <div className="flex flex-col gap-1 text-xs text-neutral-400">
              <span>• West Chester (Cincinnati Dayton Rd)</span>
              <span>• Mason (Reading Rd)</span>
              <span>• Oxford (Southpointe Pkwy)</span>
              <span>• Loveland (Loveland Madeira Rd)</span>
              <span>• Clifton (McMillan St, Cincinnati)</span>
              <span>• Cincinnati (Kibby Ln, Cincinnati)</span>
              <span>• Deer Park (Galbraith Rd, Cincinnati)</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Manager Portals</h4>
            <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-750 space-y-2.5 text-xs">
              <p className="text-[11px] text-neutral-400 leading-normal">Operational personnel can log in below to authorize hourly fuel overrides or check applications.</p>
              <button 
                onClick={() => navigateToAndScroll("admin")} 
                className="w-full bg-amber-400 hover:bg-amber-300 text-neutral-900 font-extrabold py-2 px-3 rounded text-[11px] tracking-wide uppercase transition-all flex items-center justify-center gap-1"
                id="footer-btn-management"
              >
                <Lock className="w-3.5 h-3.5" /> Staff Overwrite Gate
              </button>
            </div>
          </div>

        </div>

        {/* Lower footer copyright */}
        <div className="bg-neutral-950 py-4 px-4 text-xs select-none">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-center gap-2 text-neutral-500">
            <span>
              &copy; {new Date().getFullYear()} Stop N Go Convenience Stores. Shell licensed retailer for Southwest Ohio. All rights reserved.
            </span>
            <div className="flex gap-4">
              <span className="hover:text-[#FFD500] cursor-pointer">Security Audited</span>
              <span className="hover:text-[#FFD500] cursor-pointer">Taxes Paid</span>
              <span className="hover:text-[#FFD500] cursor-pointer" onClick={() => navigateToAndScroll("admin")}>Operations Login</span>
            </div>
          </div>
        </div>

      </footer>

    </div>
  );
}
