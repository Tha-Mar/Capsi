type SiteHeroProps = {
  adminMode?: boolean
  adminEmail?: string
}

export function SiteHero({
  adminMode = false,
  adminEmail,
}: SiteHeroProps) {
  return (
    <div className="relative min-h-[720px] overflow-hidden bg-[#f4eee7] md:min-h-[860px]">
      <div
        className="absolute inset-x-[-18vw] top-0 h-[92vh] min-h-[720px] bg-cover bg-center md:inset-x-[-8vw] md:min-h-[860px]"
        style={{
          backgroundImage:
            'url("/ChatGPT Image Apr 19, 2026, 10_55_45 PM.png")',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#f4eee7]/30" />

      <div className="relative z-10 px-6 pt-12 md:px-10 md:pt-16 lg:px-16">
        <h1 className="font-[family:var(--font-santrio)] text-[clamp(6rem,20vw,20rem)] leading-[0.78] text-stone-950">
          CAPSI
        </h1>

        {adminMode ? (
          <p className="mt-4 max-w-xl bg-[#f4eee7]/80 px-4 py-3 text-sm leading-7 text-stone-700 backdrop-blur-sm">
            Signed in as {adminEmail}. Edit cards inline, drag them into a new
            order, and add or remove designs without leaving the page.
          </p>
        ) : null}
      </div>
    </div>
  )
}
