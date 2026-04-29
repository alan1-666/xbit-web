import { IconTwitter } from '@components/icon/brands/IconTwitter.tsx'
import { IconTelegram } from '@components/icon/brands/IconTelegram.tsx'
import { IconTiktok } from '@components/icon/brands/IconTiktok.tsx'
import { IconDiscord } from '@/components/icon/brands/IconDiscord'
import { IconEmail } from '@components/icon/brands/IconEmail.tsx'
import { ContactEmailDrawer } from '@components/settings/ContactEmailDrawer.tsx'
import { useState, MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'

export const ContactUsSection = () => {
  const [openEmailDrawer, setOpenEmailDrawer] = useState(false)
  const { t } = useTranslation()

  const socialLinks = [
    {
      icon: <IconTwitter className="text-[#B9B9B9]" />,
      label: 'Twitter（X）',
      href: 'https://x.com/KairoX',
    },
    {
      icon: <IconDiscord className="text-[#B9B9B9]" />,
      label: 'Discord',
      href: 'https://discord.com/invite/xbit',
    },
    {
      icon: <IconTelegram className="text-[#B9B9B9]" />,
      label: 'Telegram',
      href: 'https://t.me/KairoX',
    },
    {
      icon: <IconTiktok />,
      label: 'Tiktok',
      href: 'https://www.tiktok.com/@KairoX',
    },
    // {
    //   icon: <IconMeta />,
    //   label: 'Meta',
    //   href: 'https://www.facebook.com/profile.php?id=61573184227251',
    // },
    {
      icon: <IconEmail />,
      label: 'Email',
      onClick: (event: MouseEvent) => {
        event.preventDefault()
        setOpenEmailDrawer(true)
      },
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-10">
        <svg width="93" height="5" viewBox="0 0 93 5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.5 2.5H64.5" stroke="url(#paint0_linear_24792_592313)" />
          <path d="M68.5 2.5H86.5" stroke="url(#paint1_linear_24792_592313)" strokeWidth="4" strokeDasharray="2 2" />
          <circle cx="1.5" cy="2.5" r="1.5" fill="url(#paint2_linear_24792_592313)" />
          <circle cx="91" cy="2.5" r="1.5" fill="url(#paint3_linear_24792_592313)" />
          <defs>
            <linearGradient
              id="paint0_linear_24792_592313"
              x1="18.3"
              y1="3.46956"
              x2="18.3183"
              y2="1.9445"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#E149F8" />
              <stop offset="0.28" stopColor="#9945FF" />
              <stop offset="0.92" stopColor="#00F3AB" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_24792_592313"
              x1="72.9684"
              y1="3.41109"
              x2="73.0267"
              y2="1.9592"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#E149F8" />
              <stop offset="0.28" stopColor="#9945FF" />
              <stop offset="0.92" stopColor="#00F3AB" />
            </linearGradient>
            <linearGradient
              id="paint2_linear_24792_592313"
              x1="0.8"
              y1="3.90868"
              x2="3.00266"
              y2="1.00201"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#E149F8" />
              <stop offset="0.28" stopColor="#9945FF" />
              <stop offset="0.92" stopColor="#00F3AB" />
            </linearGradient>
            <linearGradient
              id="paint3_linear_24792_592313"
              x1="90.3"
              y1="3.90868"
              x2="92.5027"
              y2="1.00201"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#E149F8" />
              <stop offset="0.28" stopColor="#9945FF" />
              <stop offset="0.92" stopColor="#00F3AB" />
            </linearGradient>
          </defs>
        </svg>
        <div className="text-[#FFFFFFCC] text-[calc(13rem/16)]">{t('appSettings.aboutUs.contactUs')}</div>
        <svg width="93" height="5" viewBox="0 0 93 5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M91.5 2.5H28.5" stroke="url(#paint0_linear_24792_592319)" />
          <path d="M24.5 2.5H6.5" stroke="url(#paint1_linear_24792_592319)" strokeWidth="4" strokeDasharray="2 2" />
          <circle cx="1.5" cy="1.5" r="1.5" transform="matrix(-1 0 0 1 93 1)" fill="url(#paint2_linear_24792_592319)" />
          <circle
            cx="1.5"
            cy="1.5"
            r="1.5"
            transform="matrix(-1 0 0 1 3.5 1)"
            fill="url(#paint3_linear_24792_592319)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_24792_592319"
              x1="74.7"
              y1="3.46956"
              x2="74.6817"
              y2="1.9445"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#E149F8" />
              <stop offset="0.28" stopColor="#9945FF" />
              <stop offset="0.92" stopColor="#00F3AB" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_24792_592319"
              x1="20.0316"
              y1="3.41109"
              x2="19.9733"
              y2="1.9592"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#E149F8" />
              <stop offset="0.28" stopColor="#9945FF" />
              <stop offset="0.92" stopColor="#00F3AB" />
            </linearGradient>
            <linearGradient
              id="paint2_linear_24792_592319"
              x1="0.8"
              y1="2.90868"
              x2="3.00266"
              y2="0.00201409"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#E149F8" />
              <stop offset="0.28" stopColor="#9945FF" />
              <stop offset="0.92" stopColor="#00F3AB" />
            </linearGradient>
            <linearGradient
              id="paint3_linear_24792_592319"
              x1="0.8"
              y1="2.90868"
              x2="3.00266"
              y2="0.00201409"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#E149F8" />
              <stop offset="0.28" stopColor="#9945FF" />
              <stop offset="0.92" stopColor="#00F3AB" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex items-center">
        {socialLinks.map((link) => (
          <a
            href={link.href ?? '#'}
            target="_blank"
            className="flex flex-col flex-1 gap-2 items-center justify-center group"
            onClick={(event) => link.onClick?.(event)}
            key={link.label}
          >
            {link.icon}
            <span className="text-[#FFFFFF80] text-[calc(12rem/16)] group-hover:text-white">{link.label}</span>
          </a>
        ))}
      </div>
      <ContactEmailDrawer open={openEmailDrawer} setOpen={setOpenEmailDrawer} />
    </div>
  )
}
