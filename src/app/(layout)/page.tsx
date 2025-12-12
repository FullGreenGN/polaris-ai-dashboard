import Hero from "@/components/3d/HeroScene";
import {CallToAction} from "@/features/layout/landing/cta";

export default function LandingPage() {
    return (
        <>
            <Hero
                title="Where algorithms become art."
                description="A minimal hero with a neural canvas — crisp, elegant, and quietly expressive. Built with React, Three.js, and a custom CPPN shader."
                badgeText="Generative Surfaces"
                badgeLabel="New"
                ctaButtons={[
                    { text: "Get started", href: "#get-started", primary: true },
                    { text: "View showcase", href: "#showcase" }
                ]}
                microDetails={["Low‑weight font", "Tight tracking", "Subtle motion"]}
            />
            <CallToAction/>

        </>
    );
}
