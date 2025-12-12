'use client'

interface NavigationItem {
    name: string
    href: string
}

interface AnnouncementBanner {
    text: string
    linkText: string
    linkHref: string
}

interface CallToAction {
    text: string
    href: string
    variant: 'primary' | 'secondary'
}

interface HeroLandingProps {
    // Hero content
    title: string
    description: string
    announcementBanner?: AnnouncementBanner
    callToActions?: CallToAction[]

    // Styling options
    titleSize?: 'small' | 'medium' | 'large'
    gradientColors?: {
        from: string
        to: string
    }

    // Additional customization
    className?: string
}

const defaultProps: Partial<HeroLandingProps> = {
    titleSize: "large",
    gradientColors: {
        from: "oklch(0.646 0.222 41.116)",
        to: "oklch(0.488 0.243 264.376)"
    },
    callToActions: [
        { text: "Get started", href: "#", variant: "primary" },
        { text: "Learn more", href: "#", variant: "secondary" }
    ]
}

export function HeroLanding(props: HeroLandingProps) {
    const {
        title,
        description,
        announcementBanner,
        callToActions,
        titleSize,
        gradientColors,
        className
    } = { ...defaultProps, ...props }

    const getTitleSizeClasses = () => {
        switch (titleSize) {
            case 'small':
                return 'text-2xl sm:text-3xl md:text-5xl'
            case 'medium':
                return 'text-2xl sm:text-4xl md:text-6xl'
            case 'large':
            default:
                return 'text-3xl sm:text-5xl md:text-7xl'
        }
    }

    const renderCallToAction = (cta: CallToAction, index: number) => {
        if (cta.variant === 'primary') {
            return (
                <a
                    key={index}
                    href={cta.href}
                    className="rounded-lg bg-primary px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-colors"
                >
                    {cta.text}
                </a>
            )
        } else {
            return (
                <a
                    key={index}
                    href={cta.href}
                    className="text-xs sm:text-sm/6 font-semibold text-foreground hover:text-muted-foreground transition-colors"
                >
                    {cta.text} <span aria-hidden="true">→</span>
                </a>
            )
        }
    }

    return (
        <div className={`min-h-screen w-screen overflow-x-hidden relative ${className || ''}`}>
            {/* Top gradient background */}
            <div
                aria-hidden="true"
                className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 min-h-screen"
            >
                <div
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        background: `linear-gradient(to top right, ${gradientColors?.from}, ${gradientColors?.to})`
                    }}
                    className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] min-h-screen"
                />
            </div>

            <div className="relative isolate px-6 overflow-hidden min-h-screen flex flex-col justify-center">
                <div className="mx-auto max-w-4xl">
                    {/* Announcement banner */}
                    {announcementBanner && (
                        <div className="hidden sm:mb-2 sm:flex sm:justify-center">
                            <div className="relative rounded-full px-2 py-1 text-xs sm:px-3 sm:text-sm/6 text-muted-foreground ring-1 ring-border hover:ring-ring transition-all">
                                {announcementBanner.text}{' '}
                                <a href={announcementBanner.linkHref} className="font-semibold text-primary hover:text-primary/80 transition-colors">
                                    <span aria-hidden="true" className="absolute inset-0" />
                                    {announcementBanner.linkText} <span aria-hidden="true">&rarr;</span>
                                </a>
                            </div>
                        </div>
                    )}

                    <div className="text-center">
                        <h1 className={`${getTitleSizeClasses()} font-semibold tracking-tight text-balance text-foreground`}>
                            {title}
                        </h1>
                        <p className="mt-6 sm:mt-8 text-base sm:text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8">
                            {description}
                        </p>

                        {/* Call to action buttons */}
                        {callToActions && callToActions.length > 0 && (
                            <div className="mt-8 sm:mt-10 flex items-center justify-center gap-x-4 sm:gap-x-6">
                                {callToActions.map((cta, index) => renderCallToAction(cta, index))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Export types for consumers
export type { HeroLandingProps, NavigationItem, AnnouncementBanner, CallToAction }