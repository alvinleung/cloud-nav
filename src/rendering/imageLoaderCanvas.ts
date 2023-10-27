interface ImageLookup {
  [key: string]: HTMLImageElement;
}

export function loadAllImages(srcList: string[]): Promise<ImageLookup> {
  return new Promise<ImageLookup>((resolve, reject) => {
    const loadedLookup: ImageLookup = {};
    let doneCount = 0;

    function onCompleteLoading() {
      doneCount++;
      if (doneCount === srcList.length) {
        resolve(loadedLookup);
      }
    }
    srcList.forEach(async (url) => {
      try {
        loadedLookup[url] = await loadImage(url);
        onCompleteLoading();
      } catch (e) {
        console.log(e);
        onCompleteLoading();
      }
    });
  });
}

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    // Asynchronously load an image
    var image = new Image();
    image.addEventListener("load", function () {
      resolve(image);
    });
    image.addEventListener("error", function () {
      reject(`cannot load image ${src}`);
    });
    image.src = `${src}`;
  });
}
