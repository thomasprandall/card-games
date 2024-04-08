import Link from 'next/link'

export default function Home() {
  return (
      <ul>
        <li>
          <Link href="/blackjack" className="underline hover:text-red-300">Blackjack</Link>
        </li>
      </ul>
  )
}
