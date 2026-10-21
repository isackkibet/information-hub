import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { articles, categories } from "@/data";
import { FeaturedStories } from "@/components/articles/featured-stories";

export default function HomePage() {
  const featuredStories = articles.filter((a) => a.status === "published");
  const cats = categories.filter((c) => c.enabled);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/featured-wetlands.jpg"
            alt="A canoe travelling along a palm-lined waterway"
            fill
            className="object-cover"
            sizes="100vw"
            style={{ objectPosition: "center 72%" }}
            preload
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/55 to-slate-900/20" />
          <div
            aria-hidden="true"
            className="hero-image-glow pointer-events-none absolute inset-0"
          />
        </div>
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Sango Information Hub</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
              We care about <span className="text-cyan-300 [text-shadow:0_0_24px_rgba(34,211,238,0.7)]">Lake Victoria.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white md:text-lg">
              A community media and knowledge-sharing platform serving the <strong className="font-semibold text-cyan-200">Lake Victoria Basin in Kenya</strong> —
              bringing together <strong className="font-semibold text-white">news</strong>, environmental protection, the Blue Economy, community development, human
              rights, approved reports and community knowledge.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/portal">
                <Button size="lg">
                  Explore the Portal <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/ai-assistant">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                  Ask the AI Assistant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <nav aria-label="Home page sections" className="border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="container mx-auto flex gap-2 overflow-x-auto px-4 py-3">
          {[
            ["#featured-stories", "Featured stories"],
            ["#about", "About SIHU"],
            ["#topics", "Topics"],
            ["#get-involved", "Get involved"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="shrink-0 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <FeaturedStories stories={featuredStories} />

      {/* About + Topics */}
      <section id="about" className="scroll-mt-24">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">Who we are</p>
            <h2 className="mt-2 text-center text-2xl font-semibold tracking-tight md:text-3xl">About SIHU</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Sango Information Hub is a community media and knowledge-sharing initiative focused on Kenya’s Lake Victoria Basin. We document local knowledge, amplify community voices, and support informed conversations about the lake and people’s livelihoods.
            </p>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              The platform is designed for community participation and accessible, responsible reporting. This demo shows the planned experience and does not claim verified impact.
            </p>
          </div>

          <div id="topics" className="scroll-mt-24 mt-10">
            <div className="mx-auto max-w-2xl text-center">
              <h3 className="text-xl font-semibold tracking-tight">Explore topics</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Choose an area to find stories and community knowledge.</p>
            </div>
            <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
              {cats.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/portal/topics/${c.slug}`}
                    className="group inline-flex items-center gap-2 py-1 text-sm font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    {c.name}
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Community focus + CTA */}
      <section id="get-involved" className="scroll-mt-24 container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold">Community and environmental focus</h3>
              <p className="mt-2 text-muted-foreground">
                SIHU brings together environmental protection and conservation, Blue Economy and natural
                resources, community development, human rights and accountability, approved reports and
                community knowledge — with radio, podcasts, audio, video and community newspapers.
              </p>
              <Link
                href="/portal/media"
                className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Explore Media & Community Knowledge <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold">Need to report or contribute?</h3>
              <p className="mt-2 text-muted-foreground">
                Community members can submit reports for review. Contributors can prepare articles for editorial
                review. Sign in (demo) to access role-based workspaces.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/submit">
                  <Button size="sm">Submit a Report</Button>
                </Link>
                <Link href="/sign-in">
                  <Button size="sm" variant="outline">
                    Sign in (Demo)
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
