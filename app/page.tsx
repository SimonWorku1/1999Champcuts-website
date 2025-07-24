"use client"

import { useEffect, useRef, useState } from "react"
import { TestimonialsWithAurora } from "@/components/blocks/testimonials-section"
import { Button } from "@/components/ui/button"
import { Instagram, Youtube, Mail, Scissors, Calendar, Clock, MapPin, Phone, Edit3 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Service {
  id: string;
  name: string;
  price: string;
  duration: string;
  premium?: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export default function Home() {
  const [builderContent, setBuilderContent] = useState(null);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [showEditButton, setShowEditButton] = useState(false);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [contactFormErrors, setContactFormErrors] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Edit button hover detection
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const buttonX = window.innerWidth - 50; // Button position (top-right)
      const buttonY = 50; // Button position (top-right)
      const distance = Math.sqrt(
        Math.pow(e.clientX - buttonX, 2) + Math.pow(e.clientY - buttonY, 2)
      );
      
      setShowEditButton(distance <= 150);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Fetch services from the API
    const fetchServices = async () => {
      setServicesLoading(true);
      try {
        const res = await fetch('/api/services');
        if (!res.ok) throw new Error('Failed to fetch services');
        const data = await res.json();
        setServices(data.services || []);
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  const [current, setCurrent] = useState(0)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isVideoLoading, setIsVideoLoading] = useState(true)
  const [slides, setSlides] = useState<Array<{ src: string; title: string; type: 'video' | 'image' }>>([])
  const imageTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchSlideshowItems = async () => {
      try {
        const res = await fetch('/api/slideshow');
        if (!res.ok) {
          throw new Error(`Failed to fetch slideshow items: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        // Ensure that fetched slides have all required properties, adding defaults if necessary
        const fetchedSlides = data.slides.map((slide: any) => ({
          id: slide.id || `fetched-${Math.random()}`,
          src: slide.src,
          title: slide.title || '',
          type: slide.type || 'video', // Default to video if type is missing
        }));
        setSlides(fetchedSlides);
      } catch (error) {
        console.error('Error fetching slideshow items:', error);
        // Optionally set an error state to display a message to the user
      }
    };

    fetchSlideshowItems();
  }, []); // Empty dependency array means this effect runs once on mount

  // When the video ends, go to the next one (loop)
  const handleEnded = () => {
    setIsVideoLoading(true)
    setCurrent((prev) => (prev + 1) % slides.length)
  }

  // Handle image timer
  useEffect(() => {
    if (slides.length > 0 && slides[current]?.type === 'image') {
      // Clear any existing timer
      if (imageTimerRef.current) {
        clearTimeout(imageTimerRef.current)
      }
      // Set new timer for 7 seconds
      imageTimerRef.current = setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length)
      }, 7000)
    }
    // Cleanup timer on unmount or when slide changes
    return () => {
      if (imageTimerRef.current) {
        clearTimeout(imageTimerRef.current)
      }
    }
  }, [current, slides])

  // Play video when it becomes visible
  useEffect(() => {
    if (videoRef.current && slides.length > 0 && slides[current]?.type === 'video') {
      const playVideo = async () => {
        try {
          await videoRef.current?.play()
        } catch (error) {
          console.error("Video playback failed:", error)
        } finally {
          setIsVideoLoading(false)
        }
      }

      playVideo()
    } else if (slides.length > 0 && slides[current]?.type === 'image') {
      setIsVideoLoading(false) // Images don't need video loading state
    } else {
      setIsVideoLoading(false)
    }
  }, [current, slides])

  const [aboutMe, setAboutMe] = useState('');
  const [aboutMeImage, setAboutMeImage] = useState('');
  const [aboutMeLoading, setAboutMeLoading] = useState(true);
  const [aboutFeatures, setAboutFeatures] = useState<Array<{ icon: string; title: string; description: string }>>([]);
  const [aboutFeaturesLoading, setAboutFeaturesLoading] = useState(true);

  useEffect(() => {
    // Fetch About Me from Firestore
    const fetchAboutMe = async () => {
      setAboutMeLoading(true);
      try {
        const res = await fetch('/api/about-me');
        const data = await res.json();
        setAboutMe(data.text || '');
        setAboutMeImage(data.imageUrl || '');
      } catch {
        setAboutMe('');
        setAboutMeImage('');
      } finally {
        setAboutMeLoading(false);
      }
    };
    fetchAboutMe();

    // Fetch about features
    const fetchAboutFeatures = async () => {
      setAboutFeaturesLoading(true);
      try {
        const res = await fetch('/api/about-features');
        if (!res.ok) throw new Error('Failed to fetch about features');
        const data = await res.json();
        setAboutFeatures(data.features || []);
      } catch (err) {
        console.error('Error fetching about features:', err);
      } finally {
        setAboutFeaturesLoading(false);
      }
    };
    fetchAboutFeatures();
  }, []);

  // Contact form validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateContactForm = () => {
    const errors = {
      name: '',
      email: '',
      message: ''
    };

    if (!contactForm.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!contactForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(contactForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!contactForm.message.trim()) {
      errors.message = 'Message is required';
    }

    setContactFormErrors(errors);
    return !errors.name && !errors.email && !errors.message;
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateContactForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus('success');
        setContactForm({ name: '', email: '', message: '' });
        // Clear success message after 5 seconds
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
      setErrorMessage('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactInputChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (contactFormErrors[field as keyof typeof contactFormErrors]) {
      setContactFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* EDIT BUTTON - Top right corner */}
      <div 
        className="fixed top-2 right-2 z-50 transition-all duration-300 ease-in-out p-2"
      >
        <Link href="/edit">
          <Button
            className={`bg-accent/90 hover:bg-accent text-white rounded-full p-3 shadow-lg transition-all duration-300 ${
              showEditButton 
                ? 'opacity-100 scale-100 translate-x-0' 
                : 'opacity-0 scale-90 translate-x-4'
            }`}
            title="Edit Content"
          >
            <Edit3 className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* NAVIGATION - at the very top */}
      <nav className="w-full flex flex-wrap gap-8 py-6 px-4 bg-background text-primary text-lg font-light tracking-widest justify-center z-30 sticky top-0 backdrop-blur-md bg-background/80">
        <a href="#home" className="hover:text-accent transition-colors">
          HOME
        </a>
        <a href="#services" className="hover:text-accent transition-colors">
          SERVICES
        </a>
        <span className="font-serif text-3xl md:text-4xl font-bold tracking-widest">1999CHAMPCUTZ</span>
        <a href="#testimonials" className="hover:text-accent transition-colors">
          TESTIMONIALS
        </a>
        <a href="#contact" className="hover:text-accent transition-colors">
          CONTACT
        </a>
      </nav>

      {/* HERO SECTION */}
      <section id="home" className="relative w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Loading Indicator */}
        {isVideoLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
            <div className="w-16 h-16 border-4 border-t-accent border-opacity-50 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Background Media */}
        {slides[current]?.type === 'video' ? (
          <video
            ref={videoRef}
            key={slides[current].src}
            className="absolute top-0 left-0 w-screen h-screen object-cover z-0"
            loop={false}
            muted
            playsInline
            controls={false}
            preload="metadata"
            onEnded={handleEnded}
            onLoadedData={() => setIsVideoLoading(false)}
            autoPlay
          >
            <source src={slides[current].src} />
            Your browser does not support the video tag.
          </video>
        ) : slides[current]?.type === 'image' ? (
          <img
            src={slides[current].src}
            alt={slides[current].title}
            className="absolute top-0 left-0 w-screen h-screen object-cover z-0"
            onLoad={() => setIsVideoLoading(false)}
          />
        ) : null}

        {/* Overlay */}
        <div className="absolute top-0 left-0 w-screen h-screen bg-black/60 z-10" />

        {/* Centered Content */}
        <div className="relative z-20 h-full w-full flex flex-col items-center justify-center text-white text-center px-6">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-widest mb-6 drop-shadow-lg text-white">
            1999CHAMPCUTZ
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl text-white/90">
            Premium barbershop experience with skilled professionals dedicated to perfecting your style
          </p>
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90 text-primary border-2 border-accent hover:border-accent/90 font-bold py-3 px-10 rounded-full text-lg mb-8 shadow-xl transition"
          >
            BOOK NOW
          </Button>
          <div className="flex gap-6 justify-center">
            <a
              href="https://www.instagram.com/1999champcutz/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-black rounded-full p-3 shadow hover:scale-110 transition"
            >
              <Instagram className="w-6 h-6" />
              <span className="sr-only">Instagram</span>
            </a>
            <a 
              href="https://www.youtube.com/@1999champcutz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-black rounded-full p-3 shadow hover:scale-110 transition"
            >
              <Youtube className="w-6 h-6" />
              <span className="sr-only">YouTube</span>
            </a>
            <a 
              href="mailto:yeisonpablocalmo@gmail.com" 
              className="bg-white text-black rounded-full p-3 shadow hover:scale-110 transition"
            >
              <Mail className="w-6 h-6" />
              <span className="sr-only">Email</span>
            </a>

          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="w-full py-20 bg-white dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 tracking-wider">
            OUR <span className="text-accent">SERVICES</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition group relative min-h-[250px]"
              >
                {service.mediaUrl && (
                  <div className="relative w-full h-48">
                    {service.mediaType === 'video' ? (
                      <video
                        src={service.mediaUrl}
                        className="w-full h-full object-cover"
                        controls={false}
                        autoPlay
                        muted
                        loop
                      />
                    ) : (
                      <img
                        src={service.mediaUrl}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                  {service.premium ? (
                    <div className="flex flex-col items-start mb-2">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-accent" />
                        <span>{service.duration}</span>
                      </div>
                      <span className="px-3 py-1 bg-blue-700 text-white text-xs rounded-full font-semibold mt-2 mb-2">PREMIUM HOURS</span>
                    </div>
                  ) : (
                    <div className="flex items-center mb-2">
                      <Clock className="w-4 h-4 mr-2 text-accent" />
                      <span>{service.duration}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-2xl font-bold">{service.price}</span>
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 p-4 flex flex-col items-end">
                  <Button
                    className="bg-transparent hover:bg-accent text-accent hover:text-primary border-2 border-accent hover:border-accent/90 font-bold py-2 px-6 rounded-full text-sm shadow-md transition"
                  >
                    BOOK NOW
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="w-full py-20 bg-zinc-100 dark:bg-zinc-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start gap-12">
            <div className="w-full md:w-1/2">
              <div className="relative w-full max-w-xs aspect-[4/5] rounded-lg overflow-hidden shadow-xl mx-auto">
                {aboutMeImage && (
                  <img
                    src={aboutMeImage}
                    alt="Owner"
                    className="object-cover rounded-lg w-full h-full"
                  />
                )}
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-wider">
                ABOUT <span className="text-accent">ME</span>
              </h2>
              {aboutMeLoading ? (
                <p>Loading...</p>
              ) : (
                <p className="text-lg mb-6 whitespace-pre-line">{aboutMe}</p>
              )}
              {aboutFeaturesLoading ? (
                <div>Loading features...</div>
              ) : (
              <div className="space-y-4 mb-8">
                  {aboutFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      {feature.icon === 'Scissors' && <Scissors className="w-6 h-6 text-accent mr-4 mt-1" />}
                      {feature.icon === 'Calendar' && <Calendar className="w-6 h-6 text-accent mr-4 mt-1" />}
                      {feature.icon === 'MapPin' && <MapPin className="flex-shrink-0 w-6 h-6 mr-3 text-accent" />}
                  <div>
                        <h3 className="font-bold text-lg">{feature.title}</h3>
                        <p>{feature.description}</p>
                  </div>
                </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="w-full bg-white dark:bg-zinc-900 flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 tracking-wider">
            WHAT OUR <span className="text-accent">CLIENTS SAY</span>
          </h2>
          <TestimonialsWithAurora />
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="w-full py-20 bg-zinc-100 dark:bg-zinc-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 tracking-wider">
            GET IN <span className="text-accent">TOUCH</span>
          </h2>

          <div className="flex flex-col md:flex-row gap-12">
            <div className="w-full md:w-1/2">
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-center">
                    <MapPin className="w-6 h-6 text-accent mr-4" />
                    <p>1200 Contra Costa Blvd Unit H, Pleasant Hill, CA 94523</p>
                  </div>
                  <div className="mt-4 w-full">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3152.332792300145!2d-122.0607166846816!3d37.94797997975336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808560a9c8c0c3c1%3A0x1a3c6c1c1c1c1c1c!2s1200%20Contra%20Costa%20Blvd%20Unit%20H%2C%20Pleasant%20Hill%2C%20CA%2094523!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
                      width="100%"
                      height="300"
                      style={{ border: 0, borderRadius: '0.5rem' }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Google Maps Location"
                    ></iframe>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-6 h-6 text-accent mr-4" />
                    <p>yeisonpablocalmo@gmail.com</p>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-6 h-6 text-accent mr-4" />
                    <div>
                      <p className="font-bold">Opening Hours:</p>
                      <p>Monday - Friday: 9am - 8pm</p>
                      <p>Saturday: 10am - 6pm</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-6 h-6 text-accent mr-4" />
                    <p>(510) 355-2039</p>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="font-bold mb-4">Follow Us:</h4>
                  <div className="flex gap-4">
                    <a
                      href="https://www.instagram.com/1999champcutz/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-accent text-white p-2 rounded-full hover:bg-accent/80 transition"
                    >
                      <Instagram className="w-5 h-5" />
                      <span className="sr-only">Instagram</span>
                    </a>
                    <a 
                      href="https://www.youtube.com/@1999champcutz" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-accent text-white p-2 rounded-full hover:bg-accent/80 transition"
                    >
                      <Youtube className="w-5 h-5" />
                      <span className="sr-only">YouTube</span>
                    </a>
                    <a 
                      href="mailto:yeisonpablocalmo@gmail.com" 
                      className="bg-accent text-white p-2 rounded-full hover:bg-accent/80 transition"
                    >
                      <Mail className="w-5 h-5" />
                      <span className="sr-only">Email</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <form onSubmit={handleContactSubmit} className="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold mb-6">Send Us a Message</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block mb-2 font-medium">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => handleContactInputChange('name', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent"
                      placeholder="Your name"
                    />
                    {contactFormErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{contactFormErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="block mb-2 font-medium">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={contactForm.email}
                      onChange={(e) => handleContactInputChange('email', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent"
                      placeholder="Your email"
                    />
                    {contactFormErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{contactFormErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="message" className="block mb-2 font-medium">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      value={contactForm.message}
                      onChange={(e) => handleContactInputChange('message', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent"
                      placeholder="Your message"
                    ></textarea>
                    {contactFormErrors.message && (
                      <p className="text-red-500 text-sm mt-1">{contactFormErrors.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white py-3" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'SEND MESSAGE'}
                  </Button>
                  {submitStatus === 'success' && (
                    <p className="text-green-500 text-center mt-4">Message sent successfully!</p>
                  )}
                  {submitStatus === 'error' && (
                    <p className="text-red-500 text-center mt-4">{errorMessage}</p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-8 bg-zinc-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="font-serif text-2xl font-bold tracking-widest">1999CHAMPCUTZ</h2>
            </div>
            <div className="text-center md:text-right">
              <p>© {new Date().getFullYear()} 1999CHAMPCUTZ. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      
    </div>
  )
}




