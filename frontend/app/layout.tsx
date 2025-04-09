import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import Navbar from './components/navbar/Navbar'
import ClientOnly from './components/ClientOnly'
import RegisterModal from './components/modals/RegisterModal'
import ToasterProvider from './providers/ToasterProvider'
import LoginModal from './components/modals/LoginModal'
import getCurrentUser from './action/getCurrentUser'
import RentModal from './components/modals/RentModal'
import SessionProviderWrapper from './components/SessionProviderWrapper'


export const metadata: Metadata = {
  title: 'Airbnb',
  description: 'Generated by Thai',
}
export const font = Nunito({
  subsets: ['latin']
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = await getCurrentUser()
  return (
    <html lang="en">
      <body className={font.className}>
        <SessionProviderWrapper>
          <ClientOnly>
            <RentModal />
            <RegisterModal />
            <LoginModal />
            <Navbar currentUser={currentUser} />
            <ToasterProvider />
          </ClientOnly>
        <div className='pb-20 pt-28'>
          {children}
        </div>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}