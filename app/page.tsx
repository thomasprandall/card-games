import Link from 'next/link'
import { LabelCard } from './_components/PlayingCard'

export default function Home() {
  return (
      <div className='container mx-auto max-w-prose flex flex-row flex-wrap gap-4'>
          <Link href="/blackjack"><LabelCard label="Blackjack"  /></Link>
      </div>
  )
}
