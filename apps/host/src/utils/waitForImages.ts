const waitForImages = (): Promise<void> => {
  return new Promise((resolve) => {
    const images = document.querySelectorAll('img')
    let loaded = 0

    if (images.length === 0) {
      resolve() // No images to load
      return
    }

    images.forEach((img) => {
      if (img.complete) {
        loaded++
        if (loaded === images.length) {
          resolve()
        }
      } else {
        img.addEventListener("load", () => {
          loaded++
          if (loaded === images.length) {
            resolve()
          }
        })
        img.addEventListener("error", () => {
          loaded++ // Consider failed images as "loaded"
          if (loaded === images.length) {
            resolve()
          }
        })
      }
    })
  })
}

export default waitForImages