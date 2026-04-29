import { Link } from 'react-router-dom'

export interface NavLinkProps {
  href: string
  external?: boolean
  className?: string
  disabled?: boolean
}

export const NavLink = (props: NavLinkProps) => {
  const { href, external, className } = props
  if (!href) return null
  if (external) return <a href={href} target="_blank" rel="noopener noreferrer" className={className} />
  return <Link to={href} className={className} />
}
