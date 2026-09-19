import { useEffect, useState } from 'react'
import type { PosterCategory } from '@/lib/types'

const DAY_MS = 86_400_000

// Assign each poster to a gallery: Marvel, DC, or Anime. Anything that isn't
// an explicit Marvel/DC title lives in the anime (and friends) gallery.
function categoryOf(series: string): Exclude<PosterCategory, 'all'> {
  if (series === 'Marvel') return 'marvel'
  if (series === 'DC') return 'dc'
  return 'anime'
}

const CHARACTERS: { series: string; name: string; quote: string; accent: string; image?: string }[] = [
  { series: 'Black Clover', name: 'Captain Yami Sukehiro', quote: 'Right here, right now, I will surpass my limits.', accent: '#a78bfa', image: 'https://upload.wikimedia.org/wikipedia/en/7/7f/YamiSukehiroChapter50.png' },
  { series: 'Marvel', name: 'Spider-Man', quote: 'With great power comes great responsibility.', accent: '#ef4444', image: 'https://upload.wikimedia.org/wikipedia/en/2/21/Web_of_Spider-Man_Vol_1_129-1.png' },
  { series: 'DC', name: 'Batman', quote: "It's not who I am underneath, but what I do that defines me.", accent: '#f5f5f4', image: 'https://upload.wikimedia.org/wikipedia/en/c/c7/Batman_Infobox.jpg' },
  { series: 'DC', name: 'Superman', quote: 'I stand for truth, justice, and a better tomorrow.', accent: '#1d4ed8', image: 'https://upload.wikimedia.org/wikipedia/en/3/35/Supermanflying.png' },
  { series: 'DC', name: 'Wonder Woman', quote: 'I will fight for those who cannot fight for themselves.', accent: '#818cf8', image: 'https://upload.wikimedia.org/wikipedia/en/6/6b/Wonder_Woman_750.jpg' },
  { series: 'DC', name: 'The Flash', quote: 'My name is Barry Allen, and I am the fastest man alive.', accent: '#fde047', image: 'https://upload.wikimedia.org/wikipedia/en/e/ed/The_Flash_Family.jpg' },
  { series: 'Ben 10', name: 'Ben Tennyson', quote: "It's hero time!", accent: '#0d9488', image: 'https://static.wikia.nocookie.net/ben10/images/9/9f/Ben_OV_crop.png/revision/latest/scale-to-width-down/81?cb=20190612105005' },
  { series: 'Marvel', name: 'Iron Man', quote: 'I am Iron Man.', accent: '#e50914', image: 'https://upload.wikimedia.org/wikipedia/en/4/47/Iron_Man_%28circa_2018%29.png' },
  { series: 'Marvel', name: 'Captain America', quote: 'I can do this all day.', accent: '#1e40af', image: 'https://static.wikia.nocookie.net/marveldatabase/images/b/b1/Captain_America_Vol_6_2_Textless.jpg/revision/latest/scale-to-width-down/197?cb=20110719042719' },
  { series: 'Marvel', name: 'Thor', quote: 'I\u2019m still worthy.', accent: '#93c5fd', image: 'https://upload.wikimedia.org/wikipedia/en/1/1a/Thor_%28Marvel_Comics%29.png' },
  { series: 'Marvel', name: 'Hulk', quote: 'That\u2019s my secret, Captain. I\u2019m always angry.', accent: '#16a34a', image: 'https://upload.wikimedia.org/wikipedia/en/a/aa/Hulk_%28circa_2019%29.png' },
  { series: 'Marvel', name: 'Wolverine', quote: 'I\u2019m the best there is at what I do... and what I do isn\u2019t very nice.', accent: '#d97706', image: 'https://upload.wikimedia.org/wikipedia/en/d/d3/Wolverine_%28circa_2024%29.jpg' },
  { series: 'Marvel', name: 'Deadpool', quote: 'Maximum effort!', accent: '#ff204e', image: 'https://upload.wikimedia.org/wikipedia/en/c/ca/Deadpool.png' },
  { series: 'Marvel', name: 'Black Panther', quote: 'Wakanda Forever!', accent: '#6b21a8', image: 'https://upload.wikimedia.org/wikipedia/en/f/f7/Black_Panther_%28T%27Challa%29.png' },
  { series: 'Marvel', name: 'Thanos', quote: 'I am inevitable.', accent: '#78716c', image: 'https://upload.wikimedia.org/wikipedia/en/b/b7/Thanos_%28Infobox_image%29.png' },
  { series: 'Black Clover', name: 'Asta', quote: "If I'm going to be the Wizard King, then I can never give up!", accent: '#f43f5e', image: 'https://upload.wikimedia.org/wikipedia/en/8/8a/AstaWSJIssue362015.png' },
  { series: 'Naruto', name: 'Naruto Uzumaki', quote: 'I never go back on my word. That is my ninja way!', accent: '#fb923c', image: 'https://upload.wikimedia.org/wikipedia/en/9/9a/NarutoUzumaki.png' },
  { series: 'One Piece', name: 'Luffy', quote: 'The man who is the freest on this sea is the King of the Pirates!', accent: '#ef4444', image: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png' },
  { series: 'One Piece', name: 'Zoro', quote: 'If I die here, then I was just a man who couldn\u2019t keep his promise.', accent: '#22c55e', image: 'https://upload.wikimedia.org/wikipedia/en/a/a4/Roronoa_Zoro.jpg' },
  { series: 'One Piece', name: 'Nami', quote: 'Robin! Say you want to live!', accent: '#fb923c', image: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Nami_%28One_Piece_Odyssey%29.jpg' },
  { series: 'One Piece', name: 'Nico Robin', quote: 'I want to live! Take me out to sea with you!', accent: '#a855f7', image: 'https://static.wikia.nocookie.net/onepiece/images/b/bc/Nico_Robin_Anime_Post_Timeskip_Infobox.png/revision/latest/scale-to-width-down/138?cb=20260610121757' },
  { series: 'One Piece', name: 'Chopper', quote: 'I\u2019m going to become a doctor who can cure any disease!', accent: '#f87171', image: 'https://static.wikia.nocookie.net/onepiece/images/a/af/Tony_Tony_Chopper_Anime_Post_Timeskip_Infobox.png/revision/latest/scale-to-width-down/234?cb=20240720150824' },
  { series: 'One Piece', name: 'Sanji', quote: 'I never turn away a starving person, no matter who they are.', accent: '#eab308', image: 'https://static.wikia.nocookie.net/onepiece/images/b/b6/Sanji_Anime_Post_Timeskip_Infobox.png/revision/latest/scale-to-width-down/100?cb=20240122012744' },
  { series: 'One Piece', name: 'Usopp', quote: 'I am a brave warrior of the sea!', accent: '#f59e0b', image: 'https://upload.wikimedia.org/wikipedia/en/5/53/Usopp.png' },
  { series: 'One Piece', name: 'Brook', quote: 'I\u2019m a gentleman who has nothing but bones! Yohohoho!', accent: '#e2e8f0', image: 'https://upload.wikimedia.org/wikipedia/en/5/54/Soul_King_Brook.png' },
  { series: 'One Piece', name: 'Franky', quote: 'The dreams of pirates never end! Suuuuper!', accent: '#60a5fa', image: 'https://thumb.wikimedia.org/wikipedia/en/thumb/f/fe/Franky_%28One_Piece%29.jpg/330px-Franky_%28One_Piece%29.jpg' },
  { series: 'Dragon Ball', name: 'Goku', quote: 'I\u2019m Son Goku! And I won\u2019t let you hurt this world!', accent: '#facc15', image: 'https://upload.wikimedia.org/wikipedia/en/4/4c/GokumangaToriyama.png' },
  { series: 'One Punch Man', name: 'Saitama', quote: 'I\u2019m just a hero doing this for fun.', accent: '#fafafa', image: 'https://upload.wikimedia.org/wikipedia/en/9/98/SaitamaWikipediapage.png' },
  { series: 'Demon Slayer', name: 'Tanjiro Kamado', quote: 'I will become strong, so no one has to die in front of me again.', accent: '#2dd4bf', image: 'https://upload.wikimedia.org/wikipedia/en/e/ea/Tanjirou_manga.png' },
  { series: 'Attack on Titan', name: 'Eren Yeager', quote: "If you don't fight, you can't win.", accent: '#b45309', image: 'https://static.wikia.nocookie.net/shingekinokyojin/images/6/69/Eren_Yeager_character_image.png/revision/latest/scale-to-width-down/300?cb=20200910221354' },
  { series: 'Attack on Titan', name: 'Levi Ackerman', quote: 'Those who get things done need no excuses.', accent: '#64748b', image: 'https://static.wikia.nocookie.net/shingekinokyojin/images/9/94/Levi_Ackerman_character_image.png/revision/latest/scale-to-width-down/300?cb=20210410135001' },
  { series: 'Attack on Titan', name: 'Mikasa Ackerman', quote: 'The world is cruel, but it is also beautiful.', accent: '#9d174d', image: 'https://upload.wikimedia.org/wikipedia/en/1/14/MikasaAkerman.png' },
  { series: 'Naruto', name: 'Itachi Uchiha', quote: "Knowing what's right and ignoring it is the act of a coward.", accent: '#dc2626', image: 'https://upload.wikimedia.org/wikipedia/en/e/e5/Itachi_Uchiha.jpg' },
  { series: 'Naruto', name: 'Kakashi Hatake', quote: 'Those who abandon their friends are worse than scum.', accent: '#3b82f6', image: 'https://static.wikia.nocookie.net/naruto/images/2/27/Kakashi_Hatake.png/revision/latest/scale-to-width-down/300?cb=20251019002845' },
  { series: 'Naruto', name: 'Madara Uchiha', quote: 'Wake up to reality. Nothing ever goes as planned in this world.', accent: '#9ca3af', image: 'https://static.wikia.nocookie.net/naruto/images/0/06/Kid_Madara.png/revision/latest/scale-to-width-down/236?cb=20230320174531' },
  { series: 'Jujutsu Kaisen', name: 'Gojo Satoru', quote: 'Throughout heaven and earth, I alone am the honored one.', accent: '#7dd3fc', image: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/e/ef/Satoru_Gojo_%28Anime_2%29.png/revision/latest/scale-to-width-down/91?cb=20250726003655' },
  { series: 'Jujutsu Kaisen', name: 'Yuji Itadori', quote: 'I\u2019ll keep living a proper life, without regrets.', accent: '#d946ef', image: 'https://upload.wikimedia.org/wikipedia/en/2/27/Yuji_Itadori.png' },
  { series: 'Fullmetal Alchemist', name: 'Edward Elric', quote: 'Pain never comes without a lesson.', accent: '#ca8a04', image: 'https://upload.wikimedia.org/wikipedia/en/b/b5/Edward85as.JPG' },
  { series: 'Solo Leveling', name: 'Sung Jin-Woo', quote: 'Arise.', accent: '#8b5cf6', image: 'https://static.wikia.nocookie.net/solo-leveling/images/8/8b/Jinwoo4.jpg/revision/latest/scale-to-width-down/236?cb=20250411080707' },
  { series: 'Seven Deadly Sins', name: 'Meliodas', quote: 'As long as I have a promise to keep, I\u2019ll keep standing.', accent: '#ea580c', image: 'https://static.wikia.nocookie.net/nanatsu-no-taizai/images/0/00/Meliodas_anime_design_%284KOA%29_Season_2.png/revision/latest/scale-to-width-down/180?cb=20250803081105' },
  { series: 'Death Note', name: 'Light Yagami', quote: 'I will become the god of the new world.', accent: '#e11d48', image: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Light_from_Death_Note.jpg' },
  { series: 'Code Geass', name: 'Lelouch vi Britannia', quote: 'Only those who are prepared to be killed have the right to kill.', accent: '#a21caf', image: 'https://upload.wikimedia.org/wikipedia/en/9/96/Lelouchvibritanniazero.png' },
  { series: 'Tokyo Ghoul', name: 'Kaneki Ken', quote: 'I\u2019ll keep living, no matter how much it hurts.', accent: '#9f1239', image: 'https://static.wikia.nocookie.net/tokyoghoul/images/7/7d/Kaneki_Finale_HQ.png/revision/latest/scale-to-width-down/202?cb=20180706042331' },
  { series: 'Bleach', name: 'Ichigo Kurosaki', quote: "My reason to fight? I'll protect the ones I love. That's all.", accent: '#f97316', image: 'https://upload.wikimedia.org/wikipedia/en/1/1e/IchigoKurosakiBleach.jpg' },
  { series: 'Bleach', name: 'Aizen Sosuke', quote: 'Since when were you under the impression that I wasn\u2019t using Ky\u014dka Suigetsu?', accent: '#a3a3a3', image: 'https://upload.wikimedia.org/wikipedia/en/8/85/AizenAnimeEp60.jpg' },
  { series: 'My Hero Academia', name: 'All Might', quote: 'GO BEYOND! PLUS ULTRA!', accent: '#2563eb', image: 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/cd/Toshinori_Yagi_Golden_Age_Hero_Costume_%28Anime%29.png/revision/latest/scale-to-width-down/184?cb=20250602032423' },
  { series: 'My Hero Academia', name: 'Izuku Midoriya', quote: "I can't win unless I fully believe in myself.", accent: '#34d399', image: 'https://static.wikia.nocookie.net/bokunoheroacademia/images/2/2b/Izuku_Midoriya_Costume_Databook.png/revision/latest/scale-to-width-down/191?cb=20250409215213' },
  { series: 'Gintama', name: 'Gintoki Sakata', quote: "It doesn't matter how many times you fall. What matters is how many times you get back up.", accent: '#15803d', image: 'https://static.wikia.nocookie.net/gintama/images/b/b9/GinFinal.png/revision/latest/scale-to-width-down/300?cb=20210902112030' },
  { series: 'Demon Slayer', name: 'Kyojuro Rengoku', quote: 'Set your heart ablaze!', accent: '#fbbf24', image: 'https://static.wikia.nocookie.net/kimetsu-no-yaiba/images/d/de/Kyojuro_anime_right_face.png/revision/latest/scale-to-width-down/241?cb=20241228001647' },
  { series: 'Cowboy Bebop', name: 'Spike Spiegel', quote: 'Whatever happens, happens.', accent: '#0ea5e9', image: 'https://upload.wikimedia.org/wikipedia/en/f/f6/Spike_Spiegel_as_drawn_by_the_creators.jpg' },
  { series: 'Gurren Lagann', name: 'Kamina', quote: 'Don\u2019t believe in yourself. Believe in the me who believes in you!', accent: '#ff2e63', image: 'https://static.wikia.nocookie.net/gurennlagann/images/3/3a/Kamina_001.jpeg/revision/latest/scale-to-width-down/197?cb=20150803205159' },
  { series: 'Hunter x Hunter', name: 'Killua Zoldyck', quote: 'I\u2019ll never regret walking this path with you, Gon.', accent: '#67e8f9', image: 'https://upload.wikimedia.org/wikipedia/en/9/93/KilluaZoldyckManga.png' },
  { series: 'Classroom of the Elite', name: 'Ayanokoji Kiyotaka', quote: 'In this school, everything goes exactly as I planned.', accent: '#cbd5e1', image: 'https://static.wikia.nocookie.net/youkoso-jitsuryoku-shijou-shugi-no-kyoushitsu-e/images/f/f2/Kiyotaka_Ayanok%C5%8Dji_LN_visual.png/revision/latest/scale-to-width-down/176?cb=20170901054135' },
  { series: 'Chainsaw Man', name: 'Denji', quote: 'My dreams are small, but I\u2019ll never let them go.', accent: '#fb7185', image: 'https://upload.wikimedia.org/wikipedia/en/2/2e/Denjichainsawman.png' },
  { series: 'Cyberpunk Edgerunners', name: 'David Martinez', quote: 'I\u2019ll make a name for myself before I\u2019m gone.', accent: '#06b6d4', image: 'https://static.wikia.nocookie.net/cyberpunk/images/a/ac/David_Infobox_CPEDGE.png/revision/latest/scale-to-width-down/225?cb=20220915120459' },
  { series: 'Reverend Insanity', name: 'Fang Yuan', quote: 'Heavenly fate is not set in stone \u2014 only I decide my own destiny.', accent: '#22d3ee', image: 'https://static.wikia.nocookie.net/reverend-insanity/images/2/23/Fang_Yuan_2.png/revision/latest/scale-to-width-down/300?cb=20260630200735' },
]

// Day anchors: on the first use of a gallery we lock its start to the current
// day, so the rotation begins at the FIRST poster and advances exactly one
// entry per day from there.
const anchorCache = new Map<PosterCategory, number>()

function dayNumber(): number {
  const now = new Date()
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  return Math.floor(startOfDay.getTime() / DAY_MS)
}

function anchorDayFor(category: PosterCategory): number {
  const cached = anchorCache.get(category)
  if (cached !== undefined) return cached
  const key = `mi_poster_anchor_${category}`
  const stored = Number(localStorage.getItem(key) ?? NaN)
  const day = Number.isFinite(stored) ? stored : dayNumber()
  if (!Number.isFinite(stored)) localStorage.setItem(key, String(day))
  anchorCache.set(category, day)
  return day
}

function pickPoster(category: PosterCategory): { poster: Character; day: number } {
  // 'all' means no filter: draw from every postcard in the collection.
  const gallery = category === 'all' ? CHARACTERS : CHARACTERS.filter((c) => categoryOf(c.series) === category)
  const pool = gallery.length > 0 ? gallery : CHARACTERS
  const day = dayNumber()
  const start = anchorDayFor(category)
  // Always resolve to a positive index so the rotation never moves backwards.
  const idx = ((((day - start) % pool.length) + pool.length) % pool.length)
  return { poster: pool[idx], day }
}

type Character = (typeof CHARACTERS)[number]

function CharacterAvatar({ name, accent, image, onOpen }: { name: string; accent: string; image?: string; onOpen?: () => void }) {
  const [broken, setBroken] = useState(false)
  const showImage = !!image && !broken
  return (
    <div
      title={showImage ? `Open image of ${name}` : undefined}
      onClick={() => showImage && onOpen?.()}
      className={`flex h-16 w-16 shrink-0 select-none items-center justify-center overflow-hidden rounded-full border-2 bg-[#160b30] ${showImage ? 'cursor-pointer transition-transform hover:scale-105' : ''}`}
      style={{
        borderColor: `${accent}66`,
        boxShadow: `0 0 22px ${accent}33`,
      }}
    >
      {showImage ? (
        <img
          src={image}
          alt={name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-serif text-3xl font-bold" style={{ color: accent, textShadow: `0 0 16px ${accent}59` }}>
          {name.trim().charAt(0).toUpperCase() || '?'}
        </span>
      )}
    </div>
  )
}

function ImageViewer({ name, series, accent, image, quote, onClose }: { name: string; series: string; accent: string; image: string; quote: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative rounded-2xl border bg-gradient-to-br from-[#221044] via-[#160b30] to-[#0a061a] p-4 shadow-2xl"
        style={{ borderColor: `${accent}66` }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute -right-3 -top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 bg-[#160b30] text-sm font-bold transition-colors hover:opacity-80"
          style={{ borderColor: `${accent}99`, color: accent }}
        >
          ✕
        </button>
        <div className="flex max-w-[min(90vw,600px)] items-center gap-4">
          <img src={image} alt={name} className="max-h-[55vh] max-w-[min(42vw,240px)] rounded-lg object-contain" />
          <div className="flex max-w-[300px] flex-col gap-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">{series}</p>
            <p className="text-base font-bold" style={{ color: accent }}>
              {name}
            </p>
            <p className="text-sm italic leading-snug text-zinc-200">“{quote}”</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AnimeQuotePoster({ category = 'all' }: { category?: PosterCategory }) {
  const { poster } = pickPoster(category)
  const [viewing, setViewing] = useState<string | null>(null)
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div
      className="relative flex h-full min-h-[200px] flex-col justify-between overflow-hidden rounded-xl border bg-gradient-to-br from-[#221044] via-[#160b30] to-[#0a061a] p-5"
      style={{ borderColor: `${poster.accent}3d` }}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-purple-600/25 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-indigo-500/15 blur-3xl" />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none font-serif text-8xl leading-none text-white/10">
        「
      </span>

      <div className="relative flex items-start justify-between gap-3">
        <span className="pt-1 text-[9px] font-semibold uppercase tracking-[0.25em] text-white/50">
          {poster.series}
        </span>
        <CharacterAvatar name={poster.name} accent={poster.accent} image={poster.image} onOpen={() => poster.image && setViewing(poster.image)} />
      </div>

      <div className="relative my-3">
        <p className="text-lg font-semibold italic leading-snug text-zinc-100">“{poster.quote}”</p>
      </div>

      <div className="relative">
        <p className="text-sm font-bold tracking-wide" style={{ color: poster.accent }}>
          {poster.name}
        </p>
        <div
          className="mt-2 h-px w-full"
          style={{ background: `linear-gradient(to right, ${poster.accent}b3, ${poster.accent}26, transparent)` }}
        />
        <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-zinc-500">
          {poster.series} • {dateStr}
        </p>
      </div>
      {viewing && (
        <ImageViewer
          name={poster.name}
          series={poster.series}
          accent={poster.accent}
          image={viewing}
          quote={poster.quote}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  )
}