"use client"

import { useEffect, useRef, useState } from "react"
import { TestimonialsWithAurora } from "@/components/blocks/testimonials-section"
import { Button } from "@/components/ui/button"
import { Instagram, Youtube, Mail, LinkIcon, Scissors, Calendar, Clock, MapPin, Phone } from "lucide-react"
import Image from "next/image"

const videos = [
  { src: "/videos/736d27dc0e1343a8a962ef71c706fb53.mov", title: "Video 1" },
  { src: "/videos/taoper.mov", title: "Video 2" },
  { src: "/videos/318de1ed9c4a4f5985771bd78c8b3690.mov", title: "Video 3" },
  { src: "/videos/0125.mov", title: "Video 4" },
  { src: "/videos/eric.mov", title: "Video 5" }
]

const services = [
  { name: "Full Package", price: "$70", duration: "1 hour" },
  { name: "Haircut And Beard", price: "$50", duration: "1 hour" },
  { name: "Adults Haircut", price: "$40", duration: "1 hour" },
  { name: "Kids", price: "$35", duration: "1 hour" },
  { name: "Beard Only", price: "$25", duration: "15 minutes" },
  { name: "Eyebrows", price: "$10", duration: "10 minutes" },
  { name: "Early Morning", price: "$80", duration: "1 hour", premium: true },
  { name: "After Hours", price: "$100", duration: "1 hour", premium: true },
  { name: "Christmas And New Year Haircut", price: "$80", duration: "1 hour" },
  { name: "Christmas And New Year Haircut + Beard", price: "$100", duration: "1 hour" },
]


export default function Home() {
  const [builderContent, setBuilderContent] = useState(null);

  useEffect(() => {
  }, []);

  const [current, setCurrent] = useState(0)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isVideoLoading, setIsVideoLoading] = useState(true)
  const [slides, setSlides] = useState<Array<{ src: string; title: string; type: 'video' | 'image' }>>([])

  useEffect(() => {
    // Load slides from localStorage
    const savedSlides = localStorage.getItem('slideshow');
    if (savedSlides) {
      const parsedSlides = JSON.parse(savedSlides);
      console.log('Loading slides from localStorage:', parsedSlides);
      setSlides(parsedSlides);
    } else {
      // If no saved slides, use default videos
      const defaultSlides = videos.map((video, index) => ({
        id: `default-${index}`,
        src: video.src,
        title: video.title,
        type: 'video' as const
      }));
      console.log('Using default slides:', defaultSlides);
      setSlides(defaultSlides);
      localStorage.setItem('slideshow', JSON.stringify(defaultSlides));
    }
  }, []);

  // When the video ends, go to the next one (loop)
  const handleEnded = () => {
    setIsVideoLoading(true)
    setCurrent((prev) => (prev + 1) % slides.length)
  }

  // Play video when it becomes visible
  useEffect(() => {
    if (videoRef.current && slides[current]?.type === 'video') {
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
    } else {
      setIsVideoLoading(false)
    }
  }, [current, slides])

  const [aboutMe, setAboutMe] = useState('');
  const [aboutMeLoading, setAboutMeLoading] = useState(true);

  useEffect(() => {
    fetch('/about-me.json')
      .then(res => res.json())
      .then(data => setAboutMe(data.text || ''))
      .catch(() => setAboutMe(''))
      .finally(() => setAboutMeLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
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
            <a href="#" className="bg-white text-black rounded-full p-3 shadow hover:scale-110 transition">
              <Youtube className="w-6 h-6" />
              <span className="sr-only">YouTube</span>
            </a>
            <a href="#" className="bg-white text-black rounded-full p-3 shadow hover:scale-110 transition">
              <Mail className="w-6 h-6" />
              <span className="sr-only">Email</span>
            </a>
            <a href="#" className="bg-white text-black rounded-full p-3 shadow hover:scale-110 transition">
              <LinkIcon className="w-6 h-6" />
              <span className="sr-only">Link</span>
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
                className="bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition group"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                  <div className="flex items-center mb-2">
                    <Clock className="w-4 h-4 mr-2 text-accent" />
                    <span>{service.duration}</span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-2xl font-bold">{service.price}</span>
                    {service.premium && (
                      <span className="ml-2 px-3 py-1 bg-blue-700 text-white text-xs rounded-full font-semibold">
                        PREMIUM HOURS
                      </span>
                    )}
                    <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white">
                      Book
                    </Button>
                  </div>
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
                <Image
                  src="/avatars/yeison1.jpeg"
                  alt="Yeison - 1999champcutz"
                  fill
                  className="object-cover rounded-lg"
                />
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
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <Scissors className="w-6 h-6 text-accent mr-4 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg">Expert Barbers</h3>
                    <p>Our team has years of experience and continuous training</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="w-6 h-6 text-accent mr-4 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg">Easy Booking</h3>
                    <p>Book your appointment today!</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-6 h-6 text-accent mr-4 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg">Prime Location</h3>
                    <p>Conveniently located in the heart of Contra Costa.</p>
                  </div>
                </div>
              </div>
              <Button className="bg-accent hover:bg-accent/90 text-white">LEARN MORE</Button>
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
                    <p>info@1999champcutz.com</p>
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
                    <a href="#" className="bg-accent text-white p-2 rounded-full hover:bg-accent/80 transition">
                      <Youtube className="w-5 h-5" />
                      <span className="sr-only">YouTube</span>
                    </a>
                    <a href="#" className="bg-accent text-white p-2 rounded-full hover:bg-accent/80 transition">
                      <Mail className="w-5 h-5" />
                      <span className="sr-only">Email</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <form className="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold mb-6">Send Us a Message</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block mb-2 font-medium">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block mb-2 font-medium">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent"
                      placeholder="Your email"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block mb-2 font-medium">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent"
                      placeholder="Your message"
                    ></textarea>
                  </div>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-white py-3">SEND MESSAGE</Button>
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




