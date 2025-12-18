"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
// Ensure you have this file. If it's in src/app, this import works with the alias.
// If you get a CSS error, you might need to move the CSS contents to globals.css 
// or import it in layout.tsx.

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"company" | "student">("company")

  useEffect(() => {
    // --- Porting script.js logic ---

    // 1. Navigation Scroll Effect
    const navbar = document.getElementById("navbar")
    const handleScroll = () => {
      if (window.scrollY > 50) {
        navbar?.classList.add("scrolled")
      } else {
        navbar?.classList.remove("scrolled")
      }
    }
    window.addEventListener("scroll", handleScroll)

    // 2. Scroll Animations (Intersection Observer)
    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -100px 0px",
      threshold: 0.1,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target
          let delay = 0
          if (element.classList.contains("animation-delay-100")) delay = 100
          if (element.classList.contains("animation-delay-200")) delay = 200
          if (element.classList.contains("animation-delay-300")) delay = 300
          if (element.classList.contains("animation-delay-400")) delay = 400
          if (element.classList.contains("animation-delay-500")) delay = 500

          setTimeout(() => {
            element.classList.add("animated")
          }, delay)
          observer.unobserve(element)
        }
      })
    }, observerOptions)

    document.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el))

    // 3. Counter Animation
    const statNumbers = document.querySelectorAll(".stat-card-number, .stat-number")
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target
            const text = element.textContent || ""
            const match = text.match(/[\d.]+/)
            
            if (match) {
              const target = parseFloat(match[0])
              const suffix = text.replace(match[0], "")
              let current = 0
              const duration = 2000
              const increment = target / (duration / 16)

              const timer = setInterval(() => {
                current += increment
                if (current >= target) {
                  element.textContent = text
                  clearInterval(timer)
                } else {
                  if (Number.isInteger(target)) {
                    element.textContent = Math.floor(current) + suffix
                  } else {
                    element.textContent = current.toFixed(0) + suffix
                  }
                }
              }, 16)
            }
            counterObserver.unobserve(element)
          }
        })
      },
      { threshold: 0.5 }
    )

    statNumbers.forEach((el) => counterObserver.observe(el))

    // 4. Parallax Effect
    const handleParallax = () => {
      const scrolled = window.pageYOffset
      document.querySelectorAll(".floating-shape").forEach((shape: any, index) => {
        const speed = 0.05 * (index + 1)
        shape.style.transform = `translateY(${scrolled * speed}px)`
      })
    }
    window.addEventListener("scroll", handleParallax)

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("scroll", handleParallax)
    }
  }, [])

  return (
    <div className="font-body bg-white text-navy antialiased overflow-x-hidden">
      {/* Navigation */}
      <nav id="navbar" className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/assets/zamhack-logo.svg"
                alt="ZamHack"
                className="h-10 w-auto group-hover:rotate-6 transition-transform"
              />
              <span className="font-display font-bold text-2xl">ZamHack</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="nav-link">Features</a>
              <a href="#how-it-works" className="nav-link">How It Works</a>
              <a href="#pricing" className="nav-link">Pricing</a>
              <a href="#about" className="nav-link">About</a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <Link href="/login" className="btn-secondary">
                <i className="fa-solid fa-graduation-cap mr-2"></i>Login
              </Link>
              <Link href="/register" className="btn-primary">
                <i className="fa-solid fa-briefcase mr-2"></i>Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              id="mobile-menu-btn"
              className="lg:hidden p-2 rounded-lg hover:bg-navy/5 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <i className={`fa-solid ${mobileMenuOpen ? "fa-xmark" : "fa-bars"} text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden ${mobileMenuOpen ? "block" : "hidden"} bg-white border-t border-gray-100`}>
          <div className="px-4 py-6 space-y-4">
            <a href="#features" className="block py-2 text-navy/80 hover:text-coral transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="block py-2 text-navy/80 hover:text-coral transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="block py-2 text-navy/80 hover:text-coral transition-colors">
              Pricing
            </a>
            <a href="#about" className="block py-2 text-navy/80 hover:text-coral transition-colors">
              About
            </a>
            <div className="pt-4 space-y-3">
              <Link href="/login" className="btn-secondary w-full text-center">
                <i className="fa-solid fa-graduation-cap mr-2"></i>Login
              </Link>
              <Link href="/register" className="btn-primary w-full text-center">
                <i className="fa-solid fa-briefcase mr-2"></i>Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 hero-gradient"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-coral/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-navy/5 rounded-full blur-3xl"></div>

        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-coral/10 rounded-full text-coral font-medium text-sm mb-6">
                <i className="fa-solid fa-sparkles"></i>
                <span>AI-Powered Talent Matching</span>
              </div>

              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-tight mb-6">
                Where <span className="text-gradient">Real Problems</span> Meet <span className="text-gradient">Real Talent</span>
              </h1>

              <p className="text-lg sm:text-xl text-navy/70 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                The AI-powered platform revolutionizing how Philippine companies discover and hire exceptional
                talent—without the ₱100,000+ recruitment costs.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-8 mb-10">
                <div className="stat-item">
                  <span className="stat-number">70%</span>
                  <span className="stat-label">Cost Savings</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">15K+</span>
                  <span className="stat-label">Students</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">5</span>
                  <span className="stat-label">Universities</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/register?role=company" className="btn-primary btn-large group">
                  <span>Post Your First Challenge</span>
                  <i className="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                </Link>
                <a href="#how-it-works" className="btn-secondary btn-large group">
                  <i className="fa-solid fa-play mr-2"></i>
                  <span>Watch Demo</span>
                </a>
              </div>
            </div>

            <div className="relative animate-fade-in-up animation-delay-200">
              <div className="device-laptop">
                <div className="laptop-screen overflow-hidden">
                  <video autoPlay loop muted playsInline className="w-full h-full object-cover object-[15%_center]">
                    <source src="/assets/ZamHackCompanyStudentView.mp4" type="video/mp4" />
                  </video>
                </div>
                <div className="laptop-base"></div>
                <div className="laptop-notch"></div>
              </div>

              <div className="floating-card card-1 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-check text-green-600"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Challenge Completed</p>
                    <p className="text-xs text-navy/60">Score: 95/100</p>
                  </div>
                </div>
              </div>

              <div className="floating-card card-2 animate-float animation-delay-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-coral/20 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-user-plus text-coral"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">New Match!</p>
                    <p className="text-xs text-navy/60">98% compatibility</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <i className="fa-solid fa-chevron-down text-navy/30 text-2xl"></i>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 lg:py-32 bg-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/pattern.svg')]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <span className="inline-block px-4 py-2 bg-coral/20 rounded-full text-coral font-medium text-sm mb-4">
              <i className="fa-solid fa-triangle-exclamation mr-2"></i>The Problem
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl mb-6">
              The Recruitment Crisis is <span className="text-coral">Costing Millions</span>
            </h2>
            <p className="text-lg text-white/70 max-w-3xl mx-auto">
              Companies waste massive resources on traditional hiring, while talented graduates struggle to prove their worth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="problem-card animate-on-scroll">
              <div className="problem-icon">
                <i className="fa-solid fa-peso-sign"></i>
              </div>
              <h3 className="font-display font-bold text-4xl text-coral mb-2">₱100K+</h3>
              <p className="text-white/70">Cost per hire through traditional recruitment agencies</p>
            </div>
            
            <div className="problem-card animate-on-scroll animation-delay-100">
                <div className="problem-icon">
                    <i className="fa-solid fa-user-xmark"></i>
                </div>
                <h3 className="font-display font-bold text-4xl text-coral mb-2">80%</h3>
                <p className="text-white/70">Of candidates don't possess the skills they claimed</p>
            </div>
            
            <div className="problem-card animate-on-scroll animation-delay-200">
                <div className="problem-icon">
                    <i className="fa-solid fa-users"></i>
                </div>
                <h3 className="font-display font-bold text-4xl text-coral mb-2">2.4M</h3>
                <p className="text-white/70">Filipino workers facing critical skill mismatches</p>
            </div>
            
            <div className="problem-card animate-on-scroll animation-delay-300">
                <div className="problem-icon">
                    <i className="fa-solid fa-rotate"></i>
                </div>
                <h3 className="font-display font-bold text-4xl text-coral mb-2">68%</h3>
                <p className="text-white/70">Of Filipino workers need reskilling for current jobs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Guide / Dual CTA Section */}
      <section className="py-20 lg:py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16 animate-on-scroll">
                  <span className="inline-block px-4 py-2 bg-coral/10 rounded-full text-coral font-medium text-sm mb-4">
                      <i className="fa-solid fa-compass mr-2"></i>Choose Your Path
                  </span>
                  <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-navy mb-6">
                      Built for <span className="text-gradient">Companies</span> & <span className="text-gradient">Students</span>
                  </h2>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                  {/* For Companies */}
                  <div className="path-card path-company animate-on-scroll">
                      <div className="path-icon">
                          <i className="fa-solid fa-building"></i>
                      </div>
                      <h3 className="font-display font-bold text-2xl mb-4">For Companies</h3>
                      <p className="text-navy/70 mb-6">Cut recruitment costs by 70%. Find proven talent. Hire based on demonstrated ability.</p>
                      
                      <div className="comparison-box mb-6">
                          <div className="flex justify-between items-center">
                              <div>
                                  <p className="text-sm text-navy/60">Traditional Hire</p>
                                  <p className="font-display font-bold text-xl text-red-500 line-through">₱100,000+</p>
                              </div>
                              <i className="fa-solid fa-arrow-right text-coral"></i>
                              <div>
                                  <p className="text-sm text-navy/60">ZamHack Challenge</p>
                                  <p className="font-display font-bold text-xl text-green-600">₱15,000</p>
                              </div>
                          </div>
                      </div>
                      
                      <Link href="/register?role=company" className="btn-primary w-full text-center">
                          <i className="fa-solid fa-rocket mr-2"></i>Get Started
                      </Link>
                  </div>
                  
                  {/* For Students */}
                  <div className="path-card path-student animate-on-scroll animation-delay-200">
                      <div className="path-icon student">
                          <i className="fa-solid fa-graduation-cap"></i>
                      </div>
                      <h3 className="font-display font-bold text-2xl mb-4">For Students</h3>
                      <p className="text-navy/70 mb-6">Build your portfolio. Solve real problems. Get discovered by employers.</p>
                      
                      <div className="highlight-box mb-6">
                          <i className="fa-solid fa-quote-left text-coral/30 text-2xl mb-2"></i>
                          <p className="text-navy/80 italic">69% of professionals believe verified skills are more important than college education</p>
                          <p className="text-xs text-navy/50 mt-2">— LinkedIn, 2019</p>
                      </div>
                      
                      <Link href="/register?role=student" className="btn-secondary w-full text-center border-2 border-coral text-coral hover:bg-coral hover:text-white">
                          <i className="fa-solid fa-star mr-2"></i>Join 15,000 Students
                      </Link>
                  </div>
              </div>
          </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-dark to-navy"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-coral/5 clip-diagonal"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <span className="inline-block px-4 py-2 bg-coral/20 rounded-full text-coral font-medium text-sm mb-4">
              <i className="fa-solid fa-route mr-2"></i>How It Works
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white mb-6">
              Simple. Powerful. <span className="text-coral">Transformative.</span>
            </h2>
          </div>

          {/* Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 inline-flex">
              <button
                className={`toggle-btn ${activeTab === "company" ? "active" : ""}`}
                onClick={() => setActiveTab("company")}
              >
                <i className="fa-solid fa-building mr-2"></i>For Companies
              </button>
              <button
                className={`toggle-btn ${activeTab === "student" ? "active" : ""}`}
                onClick={() => setActiveTab("student")}
              >
                <i className="fa-solid fa-graduation-cap mr-2"></i>For Students
              </button>
            </div>
          </div>

          {/* Company Process */}
          <div className={`process-content ${activeTab === "company" ? "block" : "hidden"}`}>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                {[
                  { title: "Submit Your Business Challenge", desc: "Tell us about an actual operational problem or technical requirement." },
                  { title: "AI Generates Competition", desc: "Our AI transforms your problem into a structured hackathon." },
                  { title: "Students Compete", desc: "Watch 15,000+ talented students develop real-world solutions." },
                  { title: "Evaluate & Match", desc: "Our dual-review system and NLP matching help you find the perfect candidates." },
                  { title: "Hire Top Performers", desc: "Connect directly through our secure messaging and make hiring decisions." },
                ].map((step, idx) => (
                  <div key={idx} className={`process-step animate-on-scroll ${idx > 0 ? `animation-delay-${idx}00` : ""}`}>
                    <div className="step-number">0{idx + 1}</div>
                    <div className="step-content">
                      <h3 className="font-display font-bold text-xl text-white mb-2">{step.title}</h3>
                      <p className="text-white/60">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative animate-on-scroll">
                <div className="device-tablet">
                  <div className="tablet-screen overflow-hidden">
                    <video autoPlay loop muted playsInline className="w-full h-full object-cover object-[75%_center]">
                      <source src="/assets/ZamHackCompanyView.mp4" type="video/mp4" />
                    </video>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Student Process */}
          <div className={`process-content ${activeTab === "student" ? "block" : "hidden"}`}>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative animate-on-scroll order-2 lg:order-1">
                <div className="device-phone mx-auto">
                  <div className="phone-screen overflow-hidden">
                    <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                      <source src="/assets/ZamHackStudent-Mobile.mp4" type="video/mp4" />
                    </video>
                  </div>
                  <div className="phone-notch"></div>
                </div>
              </div>

              <div className="space-y-8 order-1 lg:order-2">
                {[
                  { title: "Browse Real-World Challenges", desc: "Explore problems from companies across industries." },
                  { title: "Join Solo or Form a Team", desc: "Participate individually or create teams of up to 4 members." },
                  { title: "Submit Milestone Solutions", desc: "Work through structured milestones with flexible deadlines." },
                  { title: "Receive Detailed Feedback", desc: "Get comprehensive evaluations from companies." },
                  { title: "Build Profile & Get Discovered", desc: "Every challenge adds skills to your profile." },
                ].map((step, idx) => (
                  <div key={idx} className={`process-step animate-on-scroll ${idx > 0 ? `animation-delay-${idx}00` : ""}`}>
                    <div className="step-number student">0{idx + 1}</div>
                    <div className="step-content">
                      <h3 className="font-display font-bold text-xl text-white mb-2">{step.title}</h3>
                      <p className="text-white/60">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
                <div className="md:col-span-2">
                    <Link href="/" className="flex items-center gap-3 mb-6">
                        <span className="font-display font-bold text-2xl">ZamHack</span>
                    </Link>
                    <p className="text-white/60 mb-6 max-w-md">
                        Where Real Problems Meet Real Talent. Revolutionizing talent acquisition in the Philippines through AI-powered hackathons.
                    </p>
                    <p className="text-coral font-medium italic">"Proof Over Promises. Results Over Resumes."</p>
                </div>
                
                <div>
                    <h4 className="font-display font-bold text-lg mb-4">Quick Links</h4>
                    <ul className="space-y-3">
                        <li><a href="#features" className="text-white/60 hover:text-coral transition-colors">Features</a></li>
                        <li><a href="#how-it-works" className="text-white/60 hover:text-coral transition-colors">How It Works</a></li>
                        <li><a href="#pricing" className="text-white/60 hover:text-coral transition-colors">Pricing</a></li>
                        <li><a href="#about" className="text-white/60 hover:text-coral transition-colors">About Us</a></li>
                    </ul>
                </div>
                
                <div>
                    <h4 className="font-display font-bold text-lg mb-4">Connect</h4>
                    <ul className="space-y-3">
                        <li>
                            <a href="mailto:ZamHack@gmail.com" className="text-white/60 hover:text-coral transition-colors flex items-center gap-2">
                                <i className="fa-solid fa-envelope w-5"></i>
                                ZamHack@gmail.com
                            </a>
                        </li>
                        <li>
                            <a href="tel:+639171234567" className="text-white/60 hover:text-coral transition-colors flex items-center gap-2">
                                <i className="fa-solid fa-phone w-5"></i>
                                +63 917 123 4567
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-white/40 text-sm">© 2025 ZamHack. All rights reserved.</p>
                <div className="flex gap-6 text-sm">
                    <a href="#" className="text-white/40 hover:text-coral transition-colors">Privacy Policy</a>
                    <a href="#" className="text-white/40 hover:text-coral transition-colors">Terms of Service</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  )
}