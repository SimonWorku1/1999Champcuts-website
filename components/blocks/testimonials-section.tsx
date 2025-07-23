import { TestimonialsSection } from "../ui/testimonials-with-marquee"
import { TestimonialCard } from "@/components/ui/testimonial-card";
import Marquee from 'react-fast-marquee';

const testimonials = [
  {
    author: {
      name: "Kimberly Lopez",
      handle: "",
      avatar: "/avatars/kimberly.jpeg"
    },
    text: "My son always loves his fresh fade. He comes home feeling refreshed and happy every time. Thank you!",
    href: "https://app.thecut.co/barbers/1999champ",
    stars: 5
  },
  {
    author: {
      name: "Ray",
      handle: "",
      avatar: "/avatars/ray.jpeg"
    },
    text: "Good barber but most importantly, a good dude! Always punctual and professional. 1000% recommend!",
    href: "https://app.thecut.co/barbers/1999champ",
    stars: 5
  },
  {
    author: {
      name: "JD Davilla",
      handle: "",
      avatar: "/avatars/JDDavila.jpeg"
    },
    text: "I was new to the Bay and found 1999 Champ Cutz on this app. It's always hard finding a new barber but 1999's services are the best. He runs his business well and professionally. My cuts are always fresh and I get a lot of compliments. I highly recommend him if you are in search of a new barber.",
    href: "https://app.thecut.co/barbers/1999champ",
    stars: 5
  },
  {
    author: {
      name: "Angelo Hermosillo",
      handle: "",
      avatar: "/avatars/angel.png"
    },
    text: "Bro done blessed me.",
    href: "https://app.thecut.co/barbers/1999champ",
    stars: 5
  }
]

export function TestimonialsWithAurora() {
  return (
    <Marquee pauseOnHover gradient={false} speed={40}>
      {testimonials.concat(testimonials).map((review, i) => (
        <div key={review.author?.name + '-' + (i + 1)} className="mx-5 w-80">
          <TestimonialCard {...review} />
        </div>
      ))}
    </Marquee>
  )
} 