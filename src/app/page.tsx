import Link from 'next/link'
import { Button } from '../components/ui/button'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">Work Order Dashboard</h1>
      <p className="text-xl mb-8">Welcome to the Work Order Management System</p>
      <Link href="/login">
        <Button size="lg">Login to Dashboard</Button>
      </Link>
    </div>
  )
} 