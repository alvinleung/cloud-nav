export function loadImage(
  gl: WebGLRenderingContext,
  src: string
): Promise<WebGLTexture> {
  // Create a texture.
  var texture: WebGLTexture = gl.createTexture() as WebGLTexture;
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Fill the texture with a 1x1 blue pixel.
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 255, 255])
  );

  return new Promise<WebGLTexture>((resolve, reject) => {
    // Asynchronously load an image
    var image = new Image();
    image.src = src;
    image.addEventListener("load", function () {
      // Now that the image has loaded make copy it to the texture.
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );
      gl.generateMipmap(gl.TEXTURE_2D);
      resolve(texture);
    });

    image.addEventListener("error", function () {
      reject();
    });
  });
}

export function loadImageList(gl: WebGLRenderingContext, src: string[]) {
  const imageList = src.map((src) => {});
}
