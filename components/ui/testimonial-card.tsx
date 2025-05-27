import { cn } from "@/lib/utils"
import { Avatar, AvatarImage } from "@/components/ui/avatar"

export interface TestimonialAuthor {
  name: string
  handle: string
  avatar: string
}

export interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  href?: string
  className?: string
  stars?: number
}

export function TestimonialCard({ 
  author,
  text,
  href,
  className,
  stars = 5
}: TestimonialCardProps) {
  const Card = href ? 'a' : 'div'
  
  return (
    <Card
      {...(href ? { href } : {})}
      className={cn(
        "flex flex-col justify-between rounded-lg border-2",
        "border-border-line bg-background",
        "p-6 text-start h-80 w-80",
        "transition-colors duration-300",
        "hover:border-accent-hover",
        className
      )}
    >
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="h-12 w-12">
            <AvatarImage src={author.avatar} alt={author.name} />
          </Avatar>
          <div className="flex flex-col items-start">
            <h3 className="text-md font-semibold leading-none text-primary">
              {author.name}
            </h3>
            <p className="text-sm text-muted-text">
              {author.handle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: stars }).map((_, i) => (
            <span key={i} className="text-accent text-lg">★</span>
          ))}
        </div>
        <div className="flex-1">
          <p className="sm:text-md text-sm text-muted-text">
            {text}
          </p>
        </div>
      </div>
    </Card>
  )
} 