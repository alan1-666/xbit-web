const headElement = document.head

const preloadImages = [
  // add images path to preload here
]

const appendLinkTag = (rel, href, as, type, crossorigin) => {
  if (!href || href.length === 0 || !rel || rel.length === 0) return

  const linkElement = document.createElement('link')
  linkElement.setAttribute('rel', rel)
  linkElement.setAttribute('href', href)

  if (as) {
    linkElement.setAttribute('as', as)
  }

  if (type) {
    linkElement.setAttribute('type', type)
  }

  if (crossorigin) {
    linkElement.setAttribute('crossorigin', crossorigin)
  }

  headElement.appendChild(linkElement)
}

if (preloadImages.length > 0) {
  preloadImages.map((imagePath) => {
    appendLinkTag('preload', imagePath, 'image')
  })
}
